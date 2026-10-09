/* Motor del curso: registro de módulos, enrutado por hash, render de bloques,
   preguntas, tests, progreso (localStorage) y examen final. Sin dependencias. */
(function () {
  'use strict';

  const CURSO = (window.CURSO = window.CURSO || { modulos: [], widgets: {}, extras: {} });
  window.registrarModulo = (m) => CURSO.modulos.push(m);
  window.registrarWidget = (nombre, fn) => { CURSO.widgets[nombre] = fn; };
  window.registrarExtra = (clave, valor) => { CURSO.extras[clave] = valor; };

  const UMBRAL = 0.7; // nota mínima para "aprobar" un test

  // ------------------------------------------------------------------ utilidades DOM
  function h(tag, attrs, ...hijos) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of hijos.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    return el;
  }
  const $ = (sel, raiz) => (raiz || document).querySelector(sel);
  function barajar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pad2 = (n) => String(n).padStart(2, '0');
  CURSO.h = h;
  CURSO.barajar = barajar;

  // ------------------------------------------------------------------ estado persistente
  const CLAVE = 'curso-eval-agentes-v1';
  function estadoBase() {
    return { leidas: {}, quiz: {}, preguntas: {}, checklist: {}, notas: {}, examen: null, ultima: null, widgets: {} };
  }
  let estado = estadoBase();
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) estado = Object.assign(estadoBase(), JSON.parse(raw));
  } catch (e) { /* almacenamiento no disponible: el curso funciona igual, sin memoria */ }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* ignorar */ }
  }
  CURSO.leerDato = (k) => estado.widgets[k];
  CURSO.guardarDato = (k, v) => { estado.widgets[k] = v; guardar(); };

  // ------------------------------------------------------------------ progreso
  function modulosOrdenados() {
    return CURSO.modulos.slice().sort((a, b) => a.numero - b.numero);
  }
  function progresoModulo(m) {
    const leidas = estado.leidas[m.id] || {};
    const nLeidas = m.secciones.filter((s) => leidas[s.id]).length;
    const q = estado.quiz[m.id];
    const aprobado = q && q.mejor >= UMBRAL;
    // 70 % del progreso es lectura, 30 % es aprobar el test
    const pct = (nLeidas / m.secciones.length) * 0.7 + (aprobado ? 0.3 : 0);
    let est = 'pendiente';
    if (aprobado && nLeidas === m.secciones.length) est = 'hecho';
    else if (q && !aprobado) est = 'fallo';
    else if (nLeidas > 0 || q) est = 'en-curso';
    return { nLeidas, total: m.secciones.length, quiz: q, aprobado, pct, est };
  }
  function progresoGlobal() {
    const mods = modulosOrdenados();
    if (!mods.length) return 0;
    return mods.reduce((acc, m) => acc + progresoModulo(m).pct, 0) / mods.length;
  }
  function actualizarBarraGlobal() {
    const p = Math.round(progresoGlobal() * 100);
    const barra = $('#barra-global');
    if (barra) barra.style.width = p + '%';
    const txt = $('#txt-global');
    if (txt) txt.textContent = p + ' %';
  }

  // ------------------------------------------------------------------ resaltado de código
  function resaltar(codeEl, lenguaje) {
    if (window.hljs && lenguaje && lenguaje !== 'text') {
      try {
        codeEl.innerHTML = window.hljs.highlight(codeEl.textContent, { language: lenguaje, ignoreIllegals: true }).value;
      } catch (e) { /* lenguaje no cargado: se queda en texto plano */ }
    }
  }
  async function copiar(texto, boton) {
    const original = boton.textContent;
    try {
      await navigator.clipboard.writeText(texto);
      boton.textContent = 'Copiado';
    } catch (e) {
      boton.textContent = 'Selecciona y copia';
    }
    setTimeout(() => { boton.textContent = original; }, 1600);
  }

  // ------------------------------------------------------------------ preguntas
  let contadorPreguntas = 0;
  const TIPO_ETIQUETA = {
    unica: 'Respuesta única', multiple: 'Varias respuestas', vf: 'Verdadero o falso',
    orden: 'Ordena los pasos', emparejar: 'Empareja', numerica: 'Cálculo',
  };

  /**
   * Pinta una pregunta y llama a opts.onResultado(acierto) al comprobar.
   * opts: { numero, idGuardado, modulo, permitirReintento }
   */
  function renderPregunta(q, opts) {
    opts = opts || {};
    const uid = 'q' + (++contadorPreguntas);
    const cont = h('div', { class: 'instrumento pregunta' });
    const cab = h('div', { class: 'icab' },
      h('span', null, opts.numero ? `Pregunta ${opts.numero}` : 'Comprueba lo aprendido'),
      h('span', null, TIPO_ETIQUETA[q.tipo] || ''));
    const cuerpo = h('div', { class: 'icuerpo' });
    cont.append(cab, cuerpo);

    const enunciado = q.tipo === 'vf' ? q.afirmacion : q.pregunta;
    cuerpo.append(h('div', { class: 'pregunta-enunciado', html: (q.tipo === 'vf' ? '<span class="muted">¿Verdadero o falso?</span> ' : '') + enunciado }));

    const zona = h('div');
    cuerpo.append(zona);
    const fb = h('div', { hidden: true });
    const botones = h('div', { class: 'fila-botones' });
    const bComprobar = h('button', { class: 'btn primario peq', type: 'button' }, 'Comprobar');
    botones.append(bComprobar);
    cuerpo.append(botones, fb);

    let leerRespuesta; // () => {valida:boolean, acierto:boolean, marcar:fn}

    if (q.tipo === 'unica' || q.tipo === 'multiple') {
      const multiple = q.tipo === 'multiple';
      const indices = q.noMezclar ? q.opciones.map((_, i) => i) : barajar(q.opciones.map((_, i) => i));
      const lista = h('div', { class: 'opciones', role: multiple ? 'group' : 'radiogroup' });
      const inputs = [];
      indices.forEach((orig) => {
        const inp = h('input', { type: multiple ? 'checkbox' : 'radio', name: uid, value: String(orig) });
        inputs.push(inp);
        lista.append(h('label', { class: 'opcion' }, inp, h('span', { html: q.opciones[orig] })));
      });
      if (multiple) zona.append(h('p', { class: 'muted', style: null, text: 'Marca todas las correctas.' }));
      zona.append(lista);
      leerRespuesta = () => {
        const sel = inputs.filter((i) => i.checked).map((i) => +i.value);
        const correctas = multiple ? q.correctas : [q.correcta];
        const acierto = sel.length === correctas.length && sel.every((s) => correctas.includes(s));
        return {
          valida: sel.length > 0,
          acierto,
          marcar: () => inputs.forEach((i) => {
            const lab = i.closest('.opcion');
            const v = +i.value;
            i.disabled = true;
            lab.classList.add('bloq');
            if (correctas.includes(v)) lab.classList.add('correcta');
            else if (i.checked) lab.classList.add('incorrecta');
          }),
        };
      };
    } else if (q.tipo === 'vf') {
      const lista = h('div', { class: 'vf-botones', role: 'radiogroup' });
      const inputs = [true, false].map((v) => {
        const inp = h('input', { type: 'radio', name: uid, value: String(v) });
        lista.append(h('label', { class: 'opcion' }, inp, h('span', null, v ? 'Verdadero' : 'Falso')));
        return inp;
      });
      zona.append(lista);
      leerRespuesta = () => {
        const sel = inputs.find((i) => i.checked);
        return {
          valida: !!sel,
          acierto: sel && (sel.value === 'true') === q.correcta,
          marcar: () => inputs.forEach((i) => {
            const lab = i.closest('.opcion');
            i.disabled = true;
            lab.classList.add('bloq');
            if ((i.value === 'true') === q.correcta) lab.classList.add('correcta');
            else if (i.checked) lab.classList.add('incorrecta');
          }),
        };
      };
    } else if (q.tipo === 'orden') {
      let orden = barajar(q.items.map((_, i) => i));
      if (orden.every((v, i) => v === i) && orden.length > 1) orden = orden.slice(1).concat(orden[0]);
      const ol = h('ol', { class: 'orden-lista' });
      zona.append(h('p', { class: 'muted', text: 'Usa las flechas para colocar los elementos en el orden correcto.' }), ol);
      let bloqueado = false;
      const pintar = () => {
        ol.innerHTML = '';
        orden.forEach((idx, pos) => {
          const subir = h('button', { type: 'button', 'aria-label': 'Subir', disabled: bloqueado || pos === 0, onclick: () => { [orden[pos - 1], orden[pos]] = [orden[pos], orden[pos - 1]]; pintar(); } }, '↑');
          const bajar = h('button', { type: 'button', 'aria-label': 'Bajar', disabled: bloqueado || pos === orden.length - 1, onclick: () => { [orden[pos + 1], orden[pos]] = [orden[pos], orden[pos + 1]]; pintar(); } }, '↓');
          const li = h('li', null, h('span', { class: 'pos' }, String(pos + 1)), h('span', { html: q.items[idx] }), h('span', { class: 'mov' }, subir, bajar));
          if (bloqueado) li.classList.add(idx === pos ? 'correcta' : 'incorrecta');
          ol.append(li);
        });
      };
      pintar();
      leerRespuesta = () => ({
        valida: true,
        acierto: orden.every((v, i) => v === i),
        marcar: () => { bloqueado = true; pintar(); },
      });
    } else if (q.tipo === 'emparejar') {
      const derechas = barajar(q.pares.map((p) => p[1]));
      const filas = q.pares.map((p, i) => {
        const sel = h('select', { id: `${uid}-${i}`, 'aria-label': 'Elige la pareja' },
          h('option', { value: '' }, 'Elige…'),
          derechas.map((d) => h('option', { value: d }, d.replace(/<[^>]+>/g, ''))));
        const fila = h('div', { class: 'par' }, h('div', { html: p[0] }), sel);
        return { fila, sel, correcta: p[1] };
      });
      zona.append(h('div', { class: 'empareja' }, filas.map((f) => f.fila)));
      leerRespuesta = () => ({
        valida: filas.every((f) => f.sel.value),
        acierto: filas.every((f) => f.sel.value === f.correcta),
        marcar: () => filas.forEach((f) => {
          f.sel.disabled = true;
          const ok = f.sel.value === f.correcta;
          f.fila.classList.add(ok ? 'correcta' : 'incorrecta');
          if (!ok) f.fila.append(h('div', { class: 'muted', style: null, html: '→ Correcto: ' + f.correcta }));
        }),
      });
    } else if (q.tipo === 'numerica') {
      const inp = h('input', { type: 'number', step: 'any', id: uid, 'aria-label': 'Tu respuesta' });
      zona.append(h('div', { class: 'fila-botones' }, inp, q.unidad ? h('span', { class: 'muted' }, q.unidad) : null));
      leerRespuesta = () => {
        const v = parseFloat(String(inp.value).replace(',', '.'));
        return {
          valida: !Number.isNaN(v),
          acierto: Math.abs(v - q.respuesta) <= q.tolerancia + 1e-12,
          marcar: () => { inp.disabled = true; },
        };
      };
    } else {
      zona.append(h('p', { class: 'muted' }, `Tipo de pregunta no soportado: ${q.tipo}`));
      bComprobar.disabled = true;
    }

    bComprobar.addEventListener('click', () => {
      const r = leerRespuesta();
      if (!r.valida) {
        fb.hidden = false;
        fb.className = 'feedback ko';
        fb.innerHTML = '<span class="ft">FALTA RESPUESTA</span><div>Responde antes de comprobar.</div>';
        return;
      }
      r.marcar();
      bComprobar.disabled = true;
      fb.hidden = false;
      fb.className = 'feedback ' + (r.acierto ? 'ok' : 'ko');
      fb.innerHTML = '';
      fb.append(h('span', { class: 'ft' }, r.acierto ? 'PASS · Correcto' : 'FAIL · No exactamente'));
      if (q.tipo === 'numerica' && !r.acierto) fb.append(h('div', null, `Respuesta esperada: ${q.respuesta}${q.unidad ? ' ' + q.unidad : ''} (tolerancia ±${q.tolerancia}).`));
      fb.append(h('div', { html: q.explicacion || '' }));
      if (!r.acierto && q.seccion && opts.modulo) {
        fb.append(h('a', { class: 'repasar', href: `#${opts.modulo}.${q.seccion}` }, 'Repasar la sección →'));
      }
      if (opts.permitirReintento) {
        botones.append(h('button', {
          class: 'btn peq', type: 'button',
          onclick: () => { const nueva = renderPregunta(q, opts); cont.replaceWith(nueva); },
        }, 'Reintentar'));
      }
      if (opts.idGuardado) { estado.preguntas[opts.idGuardado] = !!r.acierto; guardar(); }
      if (opts.onResultado) opts.onResultado(!!r.acierto);
    });
    return cont;
  }

  // ------------------------------------------------------------------ bloques
  function renderBloques(bloques, ctx) {
    const frag = document.createDocumentFragment();
    (bloques || []).forEach((b) => {
      try {
        const el = renderBloque(b, ctx);
        if (el) frag.append(el);
      } catch (e) {
        console.error('Error pintando bloque', b, e);
        frag.append(h('div', { class: 'callout error' }, h('span', { class: 'ct' }, 'Error de contenido'), h('div', null, `No se pudo mostrar un bloque de tipo "${b && b.tipo}".`)));
      }
    });
    return frag;
  }

  function preguntaDeBloque(b) {
    if (b.pregunta && typeof b.pregunta === 'object') return b.pregunta;
    if (b.tipoPregunta) return Object.assign({}, b, { tipo: b.tipoPregunta });
    return b;
  }

  function renderBloque(b, ctx) {
    switch (b.tipo) {
      case 'p': return h('p', { class: 'prosa', html: b.html });
      case 'h': return h('h3', { class: 'bloque-h', text: b.texto });
      case 'lista': return h(b.ordenada ? 'ol' : 'ul', { class: 'lista prosa' }, b.items.map((it) => h('li', { html: it })));
      case 'callout': {
        const etiquetas = { info: 'Nota', clave: 'Idea clave', aviso: 'Cuidado', ejemplo: 'Ejemplo', error: 'Anti-patrón' };
        return h('aside', { class: `callout ${b.variante}` },
          h('span', { class: 'ct' }, b.titulo || etiquetas[b.variante] || 'Nota'),
          h('div', { html: b.html }));
      }
      case 'codigo': {
        const code = h('code', null, b.codigo);
        resaltar(code, b.lenguaje);
        const btn = h('button', { type: 'button', onclick: () => copiar(b.codigo, btn) }, 'Copiar');
        return h('div', { class: 'codigo' },
          h('div', { class: 'cab' }, h('span', null, b.titulo || b.lenguaje), btn),
          h('pre', null, code));
      }
      case 'tabla':
        return h('div', { class: 'tabla-wrap' },
          b.titulo ? h('div', { class: 'tt', text: b.titulo }) : null,
          h('table', null,
            h('thead', null, h('tr', null, b.columnas.map((c) => h('th', { html: c })))),
            h('tbody', null, b.filas.map((f) => h('tr', null, f.map((c) => h('td', { html: String(c) })))))));
      case 'flujo': {
        const pasos = h('div', { class: 'flujo-pasos' });
        b.pasos.forEach((p, i) => {
          if (i > 0) pasos.append(h('div', { class: 'flujo-flecha', 'aria-hidden': 'true' }, '→'));
          pasos.append(h('div', { class: 'flujo-paso' }, h('b', { html: p.titulo }), p.texto ? h('span', { html: p.texto }) : null));
        });
        return h('figure', { class: 'flujo', style: null },
          b.titulo ? h('div', { class: 'ft', text: b.titulo }) : null,
          pasos,
          b.bucle ? h('div', { class: 'flujo-bucle' }, h('span', { 'aria-hidden': 'true' }, '↺'), h('span', { html: b.bucle })) : null);
      }
      case 'comparar':
        return h('div', { class: 'comparar' }, b.columnas.map((c) =>
          h('div', { class: c.tono || '' }, h('h4', { html: c.titulo }), h('ul', null, (c.items || []).map((it) => h('li', { html: it }))))));
      case 'pestanas': {
        const barra = h('div', { class: 'pestanas-barra', role: 'tablist' });
        const paneles = [];
        const botones = [];
        b.pestanas.forEach((p, i) => {
          const panel = h('div', { class: 'pestana-panel', role: 'tabpanel', hidden: i !== 0 });
          panel.append(renderBloques(p.bloques, ctx));
          const bt = h('button', {
            type: 'button', role: 'tab', 'aria-selected': String(i === 0),
            onclick: () => {
              paneles.forEach((pp, j) => { pp.hidden = j !== i; });
              botones.forEach((bb, j) => bb.setAttribute('aria-selected', String(j === i)));
            },
          }, p.titulo);
          botones.push(bt);
          paneles.push(panel);
          barra.append(bt);
        });
        return h('div', { class: 'pestanas' }, barra, paneles);
      }
      case 'acordeon':
        return h('div', { class: 'acordeon' }, b.items.map((it) => {
          const d = h('details', null, h('summary', { html: it.titulo }));
          const cuerpo = h('div', { class: 'acc-cuerpo' });
          cuerpo.append(renderBloques(it.bloques, ctx));
          d.append(cuerpo);
          return d;
        }));
      case 'terminos':
        return h('dl', { class: 'terminos' }, b.items.map((t) => h('div', null, h('dt', { html: t.termino }), h('dd', { html: t.html }))));
      case 'cita':
        return h('blockquote', { class: 'cita' }, h('p', { html: b.html }), h('footer', { html: '— ' + b.fuente }));
      case 'figura':
        return h('figure', { class: 'figura' }, h('div', { html: b.svg }), b.pie ? h('figcaption', { html: b.pie }) : null);
      case 'enlaces':
        return h('div', { class: 'enlaces' }, b.items.map((e) =>
          h('a', { class: 'en', href: e.url, target: '_blank', rel: 'noopener' }, h('b', { html: e.titulo }), e.html ? h('span', { html: e.html }) : null, h('small', null, e.url))));
      case 'tarjetas':
        return h('div', { class: 'tarjetas' }, b.items.map((t) => {
          const bt = h('button', { type: 'button', class: 'tarjeta-flip', 'aria-label': 'Girar tarjeta' },
            h('div', { class: 'in' },
              h('div', { class: 'cara frente' }, h('div', { html: t.frente }), h('small', null, 'pulsa para girar')),
              h('div', { class: 'cara reverso', html: t.reverso })));
          bt.addEventListener('click', () => bt.classList.toggle('girada'));
          return bt;
        }));
      case 'pregunta':
        return renderPregunta(preguntaDeBloque(b), { idGuardado: b.id, modulo: ctx.modulo, permitirReintento: true });
      case 'revelar': return renderRevelar(b);
      case 'ejercicio': return renderEjercicio(b);
      case 'clasificar': return renderClasificar(b);
      case 'transcript': return renderTranscript(b);
      case 'checklist': return renderChecklist(b);
      case 'explorador': return renderExplorador(b);
      case 'widget': {
        const fn = CURSO.widgets[b.nombre];
        const cont = h('div', { class: 'instrumento widget' });
        if (!fn) { cont.append(h('div', { class: 'icuerpo' }, `Widget no disponible: ${b.nombre}`)); return cont; }
        try { fn(cont, b); } catch (e) { console.error(e); cont.append(h('div', { class: 'icuerpo' }, 'Error al iniciar el widget.')); }
        return cont;
      }
      default:
        return h('div', { class: 'callout aviso' }, h('span', { class: 'ct' }, 'Bloque desconocido'), h('div', null, b.tipo));
    }
  }

  function renderRevelar(b) {
    const resp = h('div', { class: 'solucion', hidden: true }, h('span', { class: 'st' }, 'Respuesta'), h('div', { html: b.respuesta }));
    const bt = h('button', { class: 'btn peq', type: 'button' }, 'Mostrar respuesta');
    bt.addEventListener('click', () => { resp.hidden = !resp.hidden; bt.textContent = resp.hidden ? 'Mostrar respuesta' : 'Ocultar respuesta'; });
    return h('div', { class: 'instrumento' },
      h('div', { class: 'icab' }, h('span', null, 'Piensa antes de mirar'), h('b', null, '?')),
      h('div', { class: 'icuerpo' }, h('div', { class: 'pregunta-enunciado', html: b.pregunta }), h('div', { class: 'fila-botones' }, bt), resp));
  }

  function renderEjercicio(b) {
    const idNota = 'ej-' + b.id;
    const ta = h('textarea', { id: idNota, placeholder: 'Escribe aquí tu respuesta. Se guarda en este navegador.' });
    ta.value = estado.notas[idNota] || '';
    const guardadoTxt = h('span', { class: 'guardado' }, ta.value ? 'Borrador guardado' : '');
    let t;
    ta.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => { estado.notas[idNota] = ta.value; guardar(); guardadoTxt.textContent = 'Borrador guardado'; }, 400);
    });
    const pistas = h('div', { class: 'pistas' });
    let nPista = 0;
    const lista = b.pistas || [];
    const bPista = h('button', { class: 'btn peq', type: 'button', disabled: !lista.length }, lista.length ? `Pedir pista (0/${lista.length})` : 'Sin pistas');
    bPista.addEventListener('click', () => {
      if (nPista >= lista.length) return;
      pistas.append(h('div', { class: 'pista', html: `<strong>Pista ${nPista + 1}.</strong> ` + lista[nPista] }));
      nPista++;
      bPista.textContent = `Pedir pista (${nPista}/${lista.length})`;
      if (nPista >= lista.length) bPista.disabled = true;
    });
    const sol = h('div', { class: 'solucion', hidden: true }, h('span', { class: 'st' }, 'Solución propuesta'), h('div', { html: b.solucion }));
    const bSol = h('button', { class: 'btn peq', type: 'button' }, 'Ver solución');
    bSol.addEventListener('click', () => { sol.hidden = !sol.hidden; bSol.textContent = sol.hidden ? 'Ver solución' : 'Ocultar solución'; });
    return h('div', { class: 'instrumento' },
      h('div', { class: 'icab' }, h('span', null, 'Ejercicio práctico'), h('b', null, '✎')),
      h('div', { class: 'icuerpo' },
        h('h4', { html: b.titulo }),
        h('div', { class: 'prosa', html: b.enunciado }),
        ta, guardadoTxt,
        h('div', { class: 'fila-botones' }, bPista, bSol),
        pistas, sol));
  }

  function renderClasificar(b) {
    const items = barajar(b.items.map((it, i) => ({ it, i })));
    const filas = items.map(({ it, i }) => {
      const sel = h('select', { id: `cl-${b.id}-${i}`, 'aria-label': 'Categoría' },
        h('option', { value: '' }, 'Elige categoría…'),
        b.categorias.map((c) => h('option', { value: c }, c)));
      const fila = h('div', { class: 'item' }, h('div', { html: it.texto }), sel);
      return { fila, sel, it };
    });
    const marcador = h('div', { class: 'marcador', hidden: true });
    const bt = h('button', { class: 'btn primario peq', type: 'button' }, 'Comprobar');
    const bReset = h('button', { class: 'btn peq', type: 'button', hidden: true }, 'Reintentar');
    bt.addEventListener('click', () => {
      let ok = 0;
      filas.forEach((f) => {
        f.fila.querySelectorAll('.exp').forEach((e) => e.remove());
        const bien = f.sel.value === f.it.categoria;
        if (bien) ok++;
        f.fila.classList.remove('correcta', 'incorrecta');
        f.fila.classList.add(bien ? 'correcta' : 'incorrecta');
        f.fila.append(h('div', { class: 'exp', html: (bien ? '' : `<strong>Correcto: ${f.it.categoria}.</strong> `) + f.it.explicacion }));
        f.sel.disabled = true;
      });
      marcador.hidden = false;
      marcador.innerHTML = '';
      const pct = ok / filas.length;
      marcador.append(h('span', { class: 'chip ' + (pct >= UMBRAL ? 'pass' : 'fail') }, `${ok}/${filas.length} correctas`));
      estado.preguntas['cl-' + b.id] = pct >= UMBRAL;
      guardar();
      bt.disabled = true;
      bReset.hidden = false;
    });
    bReset.addEventListener('click', () => {
      filas.forEach((f) => { f.sel.disabled = false; f.sel.value = ''; f.fila.classList.remove('correcta', 'incorrecta'); f.fila.querySelectorAll('.exp').forEach((e) => e.remove()); });
      marcador.hidden = true;
      bt.disabled = false;
      bReset.hidden = true;
    });
    return h('div', { class: 'instrumento' },
      h('div', { class: 'icab' }, h('span', null, 'Clasifica'), h('b', null, `${b.items.length} casos`)),
      h('div', { class: 'icuerpo' },
        h('div', { class: 'prosa', html: b.instrucciones }),
        h('div', { class: 'muted', text: 'Categorías: ' + b.categorias.join(' · ') }),
        h('div', { class: 'clasif' }, filas.map((f) => f.fila)),
        h('div', { class: 'fila-botones' }, bt, bReset, marcador)));
  }

  const ROL_ETIQUETA = { sistema: 'sistema', usuario: 'usuario', agente: 'agente', pensamiento: 'piensa', herramienta: 'tool call', resultado: 'tool result', grader: 'grader' };
  function renderTranscript(b) {
    const seleccion = new Set();
    let comprobado = false;
    const pasos = b.pasos.map((p, i) => {
      const el = h('button', { type: 'button', class: 'tr-paso', 'aria-pressed': 'false' },
        h('span', { class: 'idx' }, '#' + pad2(i)),
        h('span', { class: 'rol rol-' + p.rol }, ROL_ETIQUETA[p.rol] || p.rol),
        h('span', { class: 'txt', html: p.html }));
      el.addEventListener('click', () => {
        if (comprobado) return;
        if (seleccion.has(i)) seleccion.delete(i); else seleccion.add(i);
        el.classList.toggle('sel', seleccion.has(i));
        el.setAttribute('aria-pressed', String(seleccion.has(i)));
      });
      return el;
    });
    const fb = h('div', { hidden: true });
    const bt = h('button', { class: 'btn primario peq', type: 'button' }, 'Comprobar');
    const bReset = h('button', { class: 'btn peq', type: 'button', hidden: true }, 'Reintentar');
    bt.addEventListener('click', () => {
      if (!seleccion.size) {
        fb.hidden = false;
        fb.className = 'feedback ko';
        fb.innerHTML = '<span class="ft">FALTA RESPUESTA</span><div>Pulsa uno o varios pasos de la transcripción.</div>';
        return;
      }
      comprobado = true;
      const culp = new Set(b.culpables);
      const acierto = seleccion.size === culp.size && [...seleccion].every((s) => culp.has(s));
      const parcial = !acierto && [...seleccion].some((s) => culp.has(s));
      pasos.forEach((el, i) => {
        if (culp.has(i)) el.classList.add(seleccion.has(i) ? 'acierto' : 'culpable');
        if (b.pasos[i].nota) el.append(h('span', { class: 'nota', html: b.pasos[i].nota }));
      });
      fb.hidden = false;
      fb.className = 'feedback ' + (acierto ? 'ok' : 'ko');
      fb.innerHTML = '';
      fb.append(h('span', { class: 'ft' }, acierto ? 'PASS · Diagnóstico correcto' : parcial ? 'PARCIAL · Has encontrado parte del problema' : 'FAIL · Revisa los pasos marcados en rojo'));
      fb.append(h('div', { html: b.explicacion }));
      estado.preguntas['tr-' + b.id] = acierto;
      guardar();
      bt.disabled = true;
      bReset.hidden = false;
    });
    bReset.addEventListener('click', () => {
      const nuevo = renderTranscript(b);
      cont.replaceWith(nuevo);
    });
    const cont = h('div', { class: 'instrumento' },
      h('div', { class: 'icab' }, h('span', null, 'Análisis de transcript'), h('b', null, `${b.pasos.length} pasos`)),
      h('div', { class: 'icuerpo' },
        h('h4', { html: b.titulo }),
        b.contexto ? h('div', { class: 'tr-contexto', html: b.contexto }) : null,
        h('div', { class: 'tr-pasos' }, pasos),
        h('div', { class: 'pregunta-enunciado', html: b.pregunta }),
        h('div', { class: 'fila-botones' }, bt, bReset),
        fb));
    return cont;
  }

  function renderChecklist(b) {
    const guardados = estado.checklist[b.id] || {};
    const contador = h('span', { class: 'chip' });
    const actualizar = () => {
      const n = Object.values(estado.checklist[b.id] || {}).filter(Boolean).length;
      contador.textContent = `${n}/${b.items.length}`;
      contador.className = 'chip ' + (n === b.items.length ? 'pass' : n ? 'acc' : '');
    };
    const lista = h('div', { class: 'checklist' }, b.items.map((it, i) => {
      const inp = h('input', { type: 'checkbox', id: `ck-${b.id}-${i}` });
      inp.checked = !!guardados[i];
      const lab = h('label', { for: `ck-${b.id}-${i}`, class: inp.checked ? 'hecho' : '' }, inp, h('span', { html: it }));
      inp.addEventListener('change', () => {
        estado.checklist[b.id] = estado.checklist[b.id] || {};
        estado.checklist[b.id][i] = inp.checked;
        lab.classList.toggle('hecho', inp.checked);
        guardar();
        actualizar();
      });
      return lab;
    }));
    actualizar();
    return h('div', { class: 'instrumento' },
      h('div', { class: 'icab' }, h('span', null, 'Checklist'), contador),
      h('div', { class: 'icuerpo' }, h('h4', { html: b.titulo }), lista));
  }

  function renderExplorador(b) {
    const filtros = {};
    let texto = '';
    const tbody = h('tbody');
    const contador = h('span', { class: 'chip' });
    const limpio = (s) => String(s == null ? '' : s).replace(/<[^>]+>/g, '').trim();
    const pintar = () => {
      tbody.innerHTML = '';
      let n = 0;
      b.filas.forEach((f) => {
        for (const [k, v] of Object.entries(filtros)) {
          if (v && !limpio(f[k]).split(/\s*[,;/]\s*/).concat(limpio(f[k])).includes(v)) return;
        }
        if (texto && !b.columnas.some((c) => limpio(f[c.clave]).toLowerCase().includes(texto))) return;
        n++;
        tbody.append(h('tr', null, b.columnas.map((c) => h('td', { html: f[c.clave] == null ? '' : String(f[c.clave]) }))));
      });
      contador.textContent = `${n} de ${b.filas.length}`;
    };
    const controles = h('div', { class: 'explorador-filtros' });
    if (b.busqueda !== false) {
      const inp = h('input', { type: 'text', id: `ex-${b.id}-q`, placeholder: 'Buscar…' });
      inp.addEventListener('input', () => { texto = inp.value.toLowerCase().trim(); pintar(); });
      controles.append(h('label', { for: `ex-${b.id}-q` }, 'Buscar', inp));
    }
    (b.filtros || []).forEach((k) => {
      const col = b.columnas.find((c) => c.clave === k);
      const valores = new Set();
      b.filas.forEach((f) => limpio(f[k]).split(/\s*[,;/]\s*/).forEach((v) => v && valores.add(v)));
      const sel = h('select', { id: `ex-${b.id}-${k}` }, h('option', { value: '' }, 'Todos'), [...valores].sort((a, c) => a.localeCompare(c, 'es')).map((v) => h('option', { value: v }, v)));
      sel.addEventListener('change', () => { filtros[k] = sel.value; pintar(); });
      controles.append(h('label', { for: `ex-${b.id}-${k}` }, col ? col.titulo : k, sel));
    });
    pintar();
    return h('div', { class: 'instrumento' },
      h('div', { class: 'icab' }, h('span', null, b.titulo || 'Explorador'), contador),
      h('div', { class: 'icuerpo' }, controles,
        h('div', { class: 'tabla-wrap' }, h('table', null, h('thead', null, h('tr', null, b.columnas.map((c) => h('th', null, c.titulo)))), tbody))));
  }

  // ------------------------------------------------------------------ test de módulo
  function renderQuiz(m, contenedor) {
    contenedor.innerHTML = '';
    const preguntas = m.quiz || [];
    const resultados = new Array(preguntas.length).fill(null);
    const marcador = h('div', { class: 'quiz-marcador' });
    const resultado = h('div', { hidden: true });
    const pintarMarcador = () => {
      const resp = resultados.filter((r) => r !== null).length;
      const ok = resultados.filter((r) => r === true).length;
      marcador.innerHTML = '';
      marcador.append(h('span', null, `Respondidas ${resp}/${preguntas.length}`), h('span', null, `Aciertos ${ok}`),
        h('span', { class: 'chip' }, `Aprobado con ${Math.round(UMBRAL * 100)} %`));
      if (resp === preguntas.length) terminar(ok);
    };
    const terminar = (ok) => {
      const nota = ok / preguntas.length;
      const prev = estado.quiz[m.id];
      estado.quiz[m.id] = { ultimo: nota, mejor: Math.max(nota, prev ? prev.mejor : 0), intentos: (prev ? prev.intentos : 0) + 1 };
      guardar();
      actualizarBarraGlobal();
      pintarNav();
      const pasa = nota >= UMBRAL;
      const falladas = preguntas.map((q, i) => ({ q, i })).filter(({ i }) => resultados[i] === false);
      const secs = [...new Set(falladas.map(({ q }) => q.seccion).filter(Boolean))];
      resultado.hidden = false;
      resultado.className = 'resultado-quiz ' + (pasa ? 'pass' : 'fail');
      resultado.innerHTML = '';
      resultado.append(
        h('span', { class: 'chip ' + (pasa ? 'pass' : 'fail') }, pasa ? 'PASS' : 'FAIL'),
        h('div', { class: 'big' }, `${Math.round(nota * 100)} %`),
        h('p', null, pasa ? `Has superado el test de este módulo (${ok}/${preguntas.length}).` : `Necesitas un ${Math.round(UMBRAL * 100)} % para aprobar. Repasa y vuelve a intentarlo.`),
        secs.length ? h('div', null, h('p', { class: 'muted' }, 'Secciones a repasar:'),
          h('div', { class: 'indice-mod' }, secs.map((s) => {
            const sec = m.secciones.find((x) => x.id === s);
            return h('a', { href: `#${m.id}.${s}` }, sec ? sec.titulo : s);
          }))) : null,
        h('div', { class: 'fila-botones' }, h('button', { class: 'btn', type: 'button', onclick: () => { renderQuiz(m, contenedor); contenedor.scrollIntoView({ behavior: 'smooth' }); } }, 'Repetir el test (preguntas barajadas)')));
    };
    const orden = barajar(preguntas.map((_, i) => i));
    const lista = h('div', { class: 'quiz' });
    orden.forEach((idx, pos) => {
      lista.append(renderPregunta(preguntas[idx], {
        numero: `${pos + 1} de ${preguntas.length}`,
        modulo: m.id,
        onResultado: (ok) => { resultados[idx] = ok; pintarMarcador(); },
      }));
    });
    const previo = estado.quiz[m.id];
    contenedor.append(
      h('div', { class: 'quiz-cab' },
        h('span', { class: 'eyebrow' }, 'Evaluación del módulo'),
        h('h2', null, 'Test final del módulo'),
        h('p', { class: 'muted' }, `${preguntas.length} preguntas. Cada respuesta se corrige al momento y te explica el porqué.` + (previo ? ` Tu mejor nota: ${Math.round(previo.mejor * 100)} % (${previo.intentos} intento${previo.intentos === 1 ? '' : 's'}).` : ''))),
      marcador, lista, resultado);
    pintarMarcador();
  }

  // ------------------------------------------------------------------ vistas
  const main = () => $('#vista');

  function pintarNav(actual) {
    const nav = $('#nav');
    if (!nav) return;
    actual = actual || nav.dataset.actual || '';
    nav.dataset.actual = actual;
    nav.innerHTML = '';
    const mods = modulosOrdenados();
    nav.append(h('h2', null, 'Curso'));
    const ul = h('ul', { class: 'nav-lista' });
    ul.append(h('li', null, h('a', { class: 'nav-item' + (actual === '' ? ' activo' : ''), href: '#inicio' }, h('span', { class: 'num' }, '00'), h('span', null, 'Inicio y mapa'), h('span'))));
    mods.forEach((m) => {
      const p = progresoModulo(m);
      const li = h('li', null, h('a', { class: 'nav-item' + (actual === m.id ? ' activo' : ''), href: '#' + m.id },
        h('span', { class: 'num' }, pad2(m.numero)), h('span', null, m.titulo), h('span', { class: 'estado-dot ' + p.est, title: p.est })));
      if (actual === m.id) {
        const leidas = estado.leidas[m.id] || {};
        li.append(h('ul', { class: 'nav-sub' },
          m.secciones.map((s) => h('li', null, h('a', { href: `#${m.id}.${s.id}`, class: leidas[s.id] ? 'leida' : '' }, s.titulo))),
          h('li', null, h('a', { href: `#${m.id}.test` }, 'Test del módulo'))));
      }
      ul.append(li);
    });
    nav.append(ul);
    nav.append(h('h2', null, 'Práctica y referencia'));
    const ul2 = h('ul', { class: 'nav-lista' });
    const extra = [
      ['caso', 'CF', 'Caso final', !!CURSO.extras.casoFinal],
      ['examen', 'EX', 'Examen final', true],
      ['glosario', 'GL', 'Glosario', !!CURSO.extras.glosario],
      ['recursos', 'RE', 'Recursos y lecturas', !!CURSO.extras.recursos],
    ];
    extra.filter((e) => e[3]).forEach(([id, num, tit]) => {
      let dot = '';
      if (id === 'examen' && estado.examen) dot = estado.examen.mejor >= UMBRAL ? 'hecho' : 'fallo';
      if (id === 'caso') { const q = estado.quiz.caso; if (q) dot = q.mejor >= UMBRAL ? 'hecho' : 'fallo'; }
      ul2.append(h('li', null, h('a', { class: 'nav-item' + (actual === id ? ' activo' : ''), href: '#' + id },
        h('span', { class: 'num' }, num), h('span', null, tit), h('span', { class: 'estado-dot ' + dot }))));
    });
    nav.append(ul2);
  }

  function vistaInicio() {
    const v = main();
    v.className = 'contenido ancho';
    v.innerHTML = '';
    const mods = modulosOrdenados();
    const totalSecciones = mods.reduce((a, m) => a + m.secciones.length, 0);
    const leidas = mods.reduce((a, m) => a + progresoModulo(m).nLeidas, 0);
    const aprobados = mods.filter((m) => progresoModulo(m).aprobado).length;
    const totalPreg = mods.reduce((a, m) => a + (m.quiz || []).length, 0);
    const siguiente = mods.find((m) => progresoModulo(m).est !== 'hecho');
    const ultima = estado.ultima && mods.find((m) => m.id === estado.ultima);

    const traza = h('div', { class: 'traza', 'aria-label': 'Ejemplo de salida de una evaluación' });
    traza.innerHTML = [
      '<span class="t-k">$ eval run suite=soporte-facturacion trials=5</span>',
      'tarea  reembolso-duplicado     <span class="t-pass">■■■■■</span>  pass@1=1.00  pass^5=1.00',
      'tarea  cambio-iban-sin-auth    <span class="t-pass">■■■</span><span class="t-fail">■■</span>  pass@1=0.60  pass^5=0.00',
      'tarea  factura-otro-cliente    <span class="t-fail">■■■■■</span>  pass@1=0.00  <span class="t-acc">← ¿bug del grader o del agente?</span>',
      '<span class="t-k">resumen  éxito=0.53 [IC95 0.39–0.67]  coste=0.21 $/tarea  infra_errors=0</span>',
    ].join('\n');

    v.append(
      h('section', { class: 'hero' },
        h('span', { class: 'eyebrow' }, 'Curso interactivo · 11 módulos + caso final + examen'),
        h('h1', { html: 'Aprende a <em>evaluar agentes</em> de IA de verdad' }),
        h('p', { class: 'lead' }, 'Patrones de agentes y sus combinaciones, harnesses, benchmarks y todas las formas de puntuar lo que hace un agente: tests, comprobaciones de estado, jueces LLM y revisión humana. Con calculadoras, simuladores, transcripciones para diagnosticar y un test al final de cada tema.'),
        h('div', { class: 'hero-acciones' },
          h('a', { class: 'btn primario', href: '#' + ((ultima && ultima.id) || (siguiente && siguiente.id) || (mods[0] && mods[0].id) || 'inicio') }, ultima ? `Continuar: módulo ${pad2(ultima.numero)}` : 'Empezar el curso'),
          h('a', { class: 'btn', href: '#examen' }, 'Ir al examen final')),
        traza),
      h('div', { class: 'stats' },
        stat(`${Math.round(progresoGlobal() * 100)} %`, 'progreso total'),
        stat(`${leidas}/${totalSecciones}`, 'secciones leídas'),
        stat(`${aprobados}/${mods.length}`, 'tests aprobados'),
        stat(estado.examen ? `${Math.round(estado.examen.mejor * 100)} %` : '—', 'mejor nota del examen'),
        stat(String(totalPreg), 'preguntas de test')),
      h('section', { class: 'seccion' },
        h('h2', null, 'Cómo funciona este curso'),
        h('p', { class: 'prosa' }, 'Cada módulo mezcla explicación con práctica. Estos son los elementos interactivos que vas a encontrar:'),
        h('div', { class: 'leyenda' },
          leyenda('?', 'Preguntas de control', 'En mitad de la lección, con corrección y explicación inmediatas.'),
          leyenda('#', 'Transcripts', 'Lees la traza de un agente y señalas el paso donde algo falla.'),
          leyenda('≡', 'Clasificar', 'Asignas cada caso a su categoría: patrón, grader, tipo de fallo…'),
          leyenda('ƒ', 'Calculadoras y simuladores', 'pass@k, pass^k, intervalos, tamaño de muestra, Pareto coste-éxito.'),
          leyenda('✎', 'Ejercicios', 'Diseñas evals reales; pides pistas y comparas con la solución.'),
          leyenda('✓', 'Test por módulo', `Se aprueba con ${Math.round(UMBRAL * 100)} %. Al fallar te dice qué sección repasar.`)),
        h('p', { class: 'muted' }, 'Tu progreso, respuestas y borradores se guardan solo en este navegador.')),
      h('section', { class: 'seccion' },
        h('h2', null, 'Mapa del curso'),
        h('div', { class: 'mapa' }, mods.map(tarjetaModulo),
          CURSO.extras.casoFinal ? tarjetaExtra('caso', 'Caso final', CURSO.extras.casoFinal.titulo, CURSO.extras.casoFinal.subtitulo) : null,
          tarjetaExtra('examen', 'Examen', 'Examen final integrador', 'Preguntas de todos los módulos, barajadas en cada intento, con desglose por tema.'))),
      zonaReset());
  }
  function stat(v, l) { return h('div', { class: 'stat' }, h('span', { class: 'v' }, v), h('span', { class: 'l' }, l)); }
  function leyenda(ic, t, d) { return h('div', null, h('span', { class: 'ic' }, ic), h('div', null, h('strong', null, t), h('div', { class: 'muted' }, d))); }
  function tarjetaModulo(m) {
    const p = progresoModulo(m);
    const chip = p.aprobado ? h('span', { class: 'chip pass' }, `PASS ${Math.round(p.quiz.mejor * 100)} %`)
      : p.quiz ? h('span', { class: 'chip fail' }, `FAIL ${Math.round(p.quiz.mejor * 100)} %`)
        : h('span', { class: 'chip' }, m.nivel || '');
    return h('a', { class: 'tarjeta-modulo', href: '#' + m.id },
      h('div', { class: 'cab' }, h('span', null, `Módulo ${pad2(m.numero)} · ${m.duracion}`), chip),
      h('h3', null, m.titulo),
      h('p', null, m.subtitulo),
      h('div', { class: 'pie' }, h('span', null, `${p.nLeidas}/${p.total} secciones`), h('div', { class: 'mini-barra' }, h('span', { style: `width:${Math.round(p.pct * 100)}%` }))));
  }
  function tarjetaExtra(id, cab, tit, sub) {
    return h('a', { class: 'tarjeta-modulo', href: '#' + id },
      h('div', { class: 'cab' }, h('span', null, cab), h('span', { class: 'chip acc' }, 'práctica')),
      h('h3', null, tit), h('p', null, sub || ''), h('div', { class: 'pie' }));
  }
  function zonaReset() {
    const zona = h('div', { class: 'fila-botones' });
    const bt = h('button', { class: 'btn peq', type: 'button' }, 'Borrar mi progreso');
    bt.addEventListener('click', () => {
      zona.innerHTML = '';
      zona.append(h('div', { class: 'confirmar' },
        h('span', null, 'Se borrarán progreso, notas de tests, checklists y borradores de este navegador.'),
        h('button', { class: 'btn peq', type: 'button', onclick: () => { estado = estadoBase(); guardar(); actualizarBarraGlobal(); router(); } }, 'Sí, borrar'),
        h('button', { class: 'btn peq', type: 'button', onclick: () => { zona.replaceWith(zonaReset()); } }, 'Cancelar')));
    });
    zona.append(bt);
    return zona;
  }

  let observador = null;
  function vistaModulo(m, destino) {
    const v = main();
    v.className = 'contenido';
    v.innerHTML = '';
    estado.ultima = m.id.startsWith('m') ? m.id : estado.ultima;
    guardar();
    const ctx = { modulo: m.id };
    const esCaso = m.id === 'caso';
    v.append(h('header', { class: 'mod-cabecera' },
      h('span', { class: 'eyebrow' }, esCaso ? 'Caso práctico integrador' : `Módulo ${pad2(m.numero)}`),
      h('h1', null, m.titulo),
      h('p', { class: 'sub' }, m.subtitulo),
      h('div', { class: 'mod-meta' },
        h('span', { class: 'chip' }, '⏱ ' + m.duracion),
        h('span', { class: 'chip ink' }, m.nivel),
        h('span', { class: 'chip' }, `${m.secciones.length} secciones`),
        h('span', { class: 'chip' }, `${(m.quiz || []).length} preguntas de test`))));
    if (m.objetivos && m.objetivos.length) {
      v.append(h('section', { class: 'objetivos' }, h('h2', null, 'Al terminar serás capaz de'), h('ul', null, m.objetivos.map((o) => h('li', { html: o })))));
    }
    v.append(h('nav', { class: 'indice-mod', 'aria-label': 'Secciones del módulo' },
      m.secciones.map((s, i) => h('a', { href: `#${m.id}.${s.id}` }, `${i + 1}. ${s.titulo}`)),
      h('a', { href: `#${m.id}.test` }, 'Test')));

    if (observador) observador.disconnect();
    observador = 'IntersectionObserver' in window ? new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          const sid = e.target.dataset.sec;
          estado.leidas[m.id] = estado.leidas[m.id] || {};
          if (!estado.leidas[m.id][sid]) {
            estado.leidas[m.id][sid] = true;
            guardar();
            actualizarBarraGlobal();
            const a = document.querySelector(`.nav-sub a[href="#${m.id}.${sid}"]`);
            if (a) a.classList.add('leida');
          }
        }
      });
    }, { rootMargin: '0px 0px -40% 0px' }) : null;

    m.secciones.forEach((s, i) => {
      const sec = h('section', { class: 'seccion', id: `${m.id}.${s.id}` },
        h('h2', null, h('span', { class: 'n' }, `${pad2(i + 1)}`), h('span', null, s.titulo)));
      sec.append(renderBloques(s.bloques, ctx));
      // centinela al final de la sección: se marca leída al llegar al final
      const fin = h('div', { 'data-sec': s.id, 'aria-hidden': 'true', style: 'height:1px' });
      sec.append(fin);
      if (observador) observador.observe(fin);
      v.append(sec);
    });

    if (m.resumen && m.resumen.length) {
      v.append(h('section', { class: 'resumen-mod' }, h('span', { class: 'eyebrow' }, 'Resumen'), h('h2', null, 'Lo que debes llevarte'), h('ol', null, m.resumen.map((r) => h('li', { html: r })))));
    }
    const zonaQuiz = h('section', { id: `${m.id}.test`, class: 'seccion' });
    v.append(zonaQuiz);
    if (m.quiz && m.quiz.length) renderQuiz(m, zonaQuiz);

    // navegación anterior / siguiente
    const mods = modulosOrdenados();
    const i = mods.findIndex((x) => x.id === m.id);
    const ant = i > 0 ? mods[i - 1] : null;
    const sig = i >= 0 && i < mods.length - 1 ? mods[i + 1] : null;
    const navMods = h('nav', { class: 'nav-modulos' });
    if (ant) navMods.append(h('a', { href: '#' + ant.id }, h('small', null, '← Anterior'), h('span', null, ant.titulo)));
    if (sig) navMods.append(h('a', { class: 'sig', href: '#' + sig.id }, h('small', null, 'Siguiente →'), h('span', null, sig.titulo)));
    else if (i >= 0) navMods.append(h('a', { class: 'sig', href: CURSO.extras.casoFinal ? '#caso' : '#examen' }, h('small', null, 'Siguiente →'), h('span', null, CURSO.extras.casoFinal ? 'Caso final' : 'Examen final')));
    if (esCaso) navMods.append(h('a', { class: 'sig', href: '#examen' }, h('small', null, 'Siguiente →'), h('span', null, 'Examen final')));
    v.append(navMods);

    irA(destino);
  }

  function irA(destino) {
    if (destino) {
      const el = document.getElementById(destino);
      if (el) { requestAnimationFrame(() => el.scrollIntoView()); return; }
    }
    window.scrollTo(0, 0);
  }

  function vistaExamen() {
    const v = main();
    v.className = 'contenido';
    v.innerHTML = '';
    const mods = modulosOrdenados();
    const pool = [];
    mods.forEach((m) => (m.quiz || []).forEach((q) => pool.push(Object.assign({}, q, { _mod: m }))));
    (CURSO.extras.examenExtra || []).forEach((q) => pool.push(Object.assign({}, q, { _mod: mods.find((m) => m.id === q.modulo) || null, seccion: undefined })));
    // 2 por módulo + relleno aleatorio hasta 30
    const N = Math.min(30, pool.length);
    const elegidas = [];
    mods.forEach((m) => barajar(pool.filter((q) => q._mod === m)).slice(0, 2).forEach((q) => elegidas.push(q)));
    barajar(pool.filter((q) => !elegidas.includes(q))).slice(0, Math.max(0, N - elegidas.length)).forEach((q) => elegidas.push(q));
    const preguntas = barajar(elegidas);
    const resultados = new Array(preguntas.length).fill(null);
    const marcador = h('div', { class: 'quiz-marcador' });
    const resultado = h('div', { hidden: true });
    const pintar = () => {
      const resp = resultados.filter((r) => r !== null).length;
      const ok = resultados.filter(Boolean).length;
      marcador.innerHTML = '';
      marcador.append(h('span', null, `Respondidas ${resp}/${preguntas.length}`), h('span', null, `Aciertos ${ok}`));
      if (resp === preguntas.length) terminar(ok);
    };
    const terminar = (ok) => {
      const nota = ok / preguntas.length;
      estado.examen = { ultimo: nota, mejor: Math.max(nota, estado.examen ? estado.examen.mejor : 0), intentos: (estado.examen ? estado.examen.intentos : 0) + 1 };
      guardar();
      pintarNav('examen');
      const porMod = {};
      preguntas.forEach((q, i) => {
        const k = q._mod ? q._mod.id : 'otros';
        porMod[k] = porMod[k] || { m: q._mod, ok: 0, n: 0 };
        porMod[k].n++;
        if (resultados[i]) porMod[k].ok++;
      });
      const pasa = nota >= UMBRAL;
      resultado.hidden = false;
      resultado.className = 'resultado-quiz ' + (pasa ? 'pass' : 'fail');
      resultado.innerHTML = '';
      resultado.append(
        h('span', { class: 'chip ' + (pasa ? 'pass' : 'fail') }, pasa ? 'PASS · Examen superado' : 'FAIL · Aún no'),
        h('div', { class: 'big' }, `${Math.round(nota * 100)} %`),
        h('p', null, `${ok} de ${preguntas.length} correctas. Mejor nota: ${Math.round(estado.examen.mejor * 100)} %.`),
        h('div', { class: 'tabla-wrap' }, h('table', null,
          h('thead', null, h('tr', null, h('th', null, 'Módulo'), h('th', null, 'Aciertos'), h('th', null, 'Recomendación'))),
          h('tbody', null, Object.values(porMod).sort((a, b) => (a.m ? a.m.numero : 99) - (b.m ? b.m.numero : 99)).map((r) =>
            h('tr', null,
              h('td', null, r.m ? h('a', { href: '#' + r.m.id }, `${pad2(r.m.numero)} · ${r.m.titulo}`) : 'Integradoras'),
              h('td', null, `${r.ok}/${r.n}`),
              h('td', null, r.ok === r.n ? '✓ Dominado' : 'Repasa este módulo')))))),
        h('div', { class: 'fila-botones' }, h('button', { class: 'btn primario', type: 'button', onclick: () => { vistaExamen(); } }, 'Nuevo intento con otras preguntas')));
    };
    v.append(
      h('header', { class: 'mod-cabecera' },
        h('span', { class: 'eyebrow' }, 'Evaluación final'),
        h('h1', null, 'Examen final integrador'),
        h('p', { class: 'sub' }, `${preguntas.length} preguntas elegidas al azar de un banco de ${pool.length}, con al menos dos de cada módulo. Se aprueba con ${Math.round(UMBRAL * 100)} %.`),
        h('div', { class: 'mod-meta' },
          h('span', { class: 'chip' }, estado.examen ? `Mejor nota: ${Math.round(estado.examen.mejor * 100)} %` : 'Sin intentos'),
          h('span', { class: 'chip' }, estado.examen ? `${estado.examen.intentos} intento(s)` : ''))),
      marcador);
    preguntas.forEach((q, i) => v.append(renderPregunta(q, {
      numero: `${i + 1} de ${preguntas.length}` + (q._mod ? ` · M${pad2(q._mod.numero)}` : ''),
      modulo: q._mod ? q._mod.id : null,
      onResultado: (ok) => { resultados[i] = ok; pintar(); },
    })));
    v.append(resultado);
    pintar();
    window.scrollTo(0, 0);
  }

  function vistaGlosario() {
    const v = main();
    v.className = 'contenido';
    v.innerHTML = '';
    const terminos = (CURSO.extras.glosario || []).slice().sort((a, b) => a.termino.localeCompare(b.termino, 'es'));
    const lista = h('dl', { class: 'glosario-lista' });
    const contador = h('span', { class: 'chip' });
    const pintar = (q) => {
      lista.innerHTML = '';
      const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const qq = norm(q || '');
      let n = 0;
      terminos.forEach((t) => {
        if (qq && !norm(t.termino + ' ' + t.html.replace(/<[^>]+>/g, '')).includes(qq)) return;
        n++;
        const mod = t.modulo && CURSO.modulos.find((m) => m.id === t.modulo);
        lista.append(h('div', null, h('dt', { html: t.termino }), h('dd', null, h('div', { html: t.html }), mod ? h('a', { href: '#' + mod.id }, `→ Módulo ${pad2(mod.numero)}: ${mod.titulo}`) : null)));
      });
      contador.textContent = `${n} términos`;
    };
    const inp = h('input', { type: 'text', id: 'glosario-q', placeholder: 'Busca un término: pass^k, grader, harness, kappa…' });
    inp.addEventListener('input', () => pintar(inp.value));
    v.append(
      h('header', { class: 'mod-cabecera' }, h('span', { class: 'eyebrow' }, 'Referencia'), h('h1', null, 'Glosario'),
        h('p', { class: 'sub' }, 'Todo el vocabulario del curso, con enlace al módulo donde se explica a fondo.'), h('div', { class: 'mod-meta' }, contador)),
      h('div', { class: 'glosario-buscar' }, inp), lista);
    pintar('');
    window.scrollTo(0, 0);
  }

  function vistaRecursos() {
    const v = main();
    v.className = 'contenido';
    v.innerHTML = '';
    v.append(h('header', { class: 'mod-cabecera' }, h('span', { class: 'eyebrow' }, 'Referencia'), h('h1', null, 'Recursos y lecturas'),
      h('p', { class: 'sub' }, 'Artículos, papers, benchmarks y herramientas para seguir profundizando.')));
    (CURSO.extras.recursos || []).forEach((cat) => {
      v.append(h('section', { class: 'seccion' }, h('h2', null, cat.categoria), renderBloque({ tipo: 'enlaces', items: cat.items }, {})));
    });
    window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------------ router
  function router() {
    const hash = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    const [vista, sub] = hash.split('.');
    document.body.classList.remove('menu-abierto');
    const mod = CURSO.modulos.find((m) => m.id === vista);
    if (mod) { pintarNav(mod.id); vistaModulo(mod, sub ? `${mod.id}.${sub}` : null); }
    else if (vista === 'caso' && CURSO.extras.casoFinal) {
      const caso = Object.assign({ numero: 99 }, CURSO.extras.casoFinal, { id: 'caso' });
      pintarNav('caso');
      vistaModulo(caso, sub ? `caso.${sub}` : null);
    } else if (vista === 'examen') { pintarNav('examen'); vistaExamen(); }
    else if (vista === 'glosario' && CURSO.extras.glosario) { pintarNav('glosario'); vistaGlosario(); }
    else if (vista === 'recursos' && CURSO.extras.recursos) { pintarNav('recursos'); vistaRecursos(); }
    else { pintarNav(''); vistaInicio(); window.scrollTo(0, 0); }
    actualizarBarraGlobal();
  }

  function aplicarTema(t) {
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }

  function iniciar() {
    const temaGuardado = estado.widgets.__tema;
    if (temaGuardado) aplicarTema(temaGuardado);
    const btTema = $('#btn-tema');
    if (btTema) btTema.addEventListener('click', () => {
      const actual = document.documentElement.getAttribute('data-theme')
        || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const nuevo = actual === 'dark' ? 'light' : 'dark';
      aplicarTema(nuevo);
      CURSO.guardarDato('__tema', nuevo);
    });
    const btMenu = $('#btn-menu');
    if (btMenu) btMenu.addEventListener('click', () => document.body.classList.toggle('menu-abierto'));
    window.addEventListener('hashchange', router);
    router();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
