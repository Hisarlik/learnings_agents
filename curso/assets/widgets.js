/* Widgets interactivos del curso. Cada uno recibe (contenedor, config) y se pinta
   dentro de un "instrumento". Todo es cálculo local; los datos de ejemplo son ficticios. */
(function () {
  'use strict';
  const C = window.CURSO;
  const h = C.h;

  // ------------------------------------------------------------------ utilidades
  function marco(cont, titulo, etiqueta) {
    const cuerpo = h('div', { class: 'icuerpo' });
    cont.append(h('div', { class: 'icab' }, h('span', null, titulo), h('b', null, etiqueta || 'ƒ')), cuerpo);
    return cuerpo;
  }
  let uid = 0;
  function control(etiqueta, { min, max, step, valor, formato }) {
    const id = 'w' + (++uid);
    const out = h('output', { for: id });
    const inp = h('input', { type: 'range', id, min, max, step, value: valor });
    const fmt = formato || ((v) => v);
    const pintar = () => { out.textContent = fmt(+inp.value); };
    inp.addEventListener('input', pintar);
    pintar();
    const el = h('label', { class: 'w-control', for: id }, h('span', { class: 'lab' }, h('span', null, etiqueta), out), inp);
    return { el, inp, get: () => +inp.value, set: (v) => { inp.value = v; pintar(); } };
  }
  function numero(etiqueta, valor, min, max) {
    const id = 'w' + (++uid);
    const inp = h('input', { type: 'number', id, value: valor, min, max, step: 1 });
    const el = h('label', { class: 'w-control', for: id }, h('span', { class: 'lab' }, h('span', null, etiqueta)), inp);
    return { el, inp, get: () => { const v = parseInt(inp.value, 10); return Number.isNaN(v) ? 0 : v; } };
  }
  function selector(etiqueta, opciones, valor) {
    const id = 'w' + (++uid);
    const sel = h('select', { id }, opciones.map(([v, t]) => h('option', { value: v }, t)));
    if (valor != null) sel.value = valor;
    const el = h('label', { class: 'w-control', for: id }, h('span', { class: 'lab' }, h('span', null, etiqueta)), sel);
    return { el, sel, get: () => sel.value };
  }
  function res(valor, etiqueta, tono) {
    return h('div', { class: 'w-res ' + (tono || '') }, h('span', { class: 'v' }, valor), h('span', { class: 'l', html: etiqueta }));
  }
  const pct = (x, d) => (x * 100).toFixed(d == null ? 1 : d) + ' %';
  const fx = (x, d) => Number(x).toFixed(d == null ? 3 : d);
  function comb(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let r = 1;
    for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
    return r;
  }
  function erf(x) {
    // Abramowitz-Stegun 7.1.26
    const s = Math.sign(x);
    x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const normCdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  function wilson(x, n, z) {
    z = z || 1.96;
    if (n <= 0) return [0, 0, 0];
    const p = x / n;
    const den = 1 + (z * z) / n;
    const centro = (p + (z * z) / (2 * n)) / den;
    const semi = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
    return [p, Math.max(0, centro - semi), Math.min(1, centro + semi)];
  }
  C.estadistica = { comb, wilson, normCdf };

  /** Gráfico de líneas/puntos en SVG. series: [{puntos:[[x,y]], color, nombre, discontinua, soloPuntos}] */
  function grafico(o) {
    const W = o.ancho || 560;
    const H = o.alto || 240;
    const m = { t: 14, r: 16, b: 34, l: 44 };
    const iw = W - m.l - m.r;
    const ih = H - m.t - m.b;
    const lx = (x) => (o.logX ? Math.log10(x) : x);
    const x0 = lx(o.xMin);
    const x1 = lx(o.xMax);
    const X = (x) => m.l + ((lx(x) - x0) / (x1 - x0)) * iw;
    const Y = (y) => m.t + ih - ((y - o.yMin) / (o.yMax - o.yMin)) * ih;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria || 'Gráfico'}">`;
    (o.yTicks || []).forEach((t) => {
      s += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" style="stroke:var(--line)" stroke-width="1"/>`;
      s += `<text x="${m.l - 6}" y="${Y(t) + 3}" text-anchor="end">${o.fmtY ? o.fmtY(t) : t}</text>`;
    });
    (o.xTicks || []).forEach((t) => {
      s += `<line x1="${X(t)}" x2="${X(t)}" y1="${m.t + ih}" y2="${m.t + ih + 4}" style="stroke:var(--line-strong)"/>`;
      s += `<text x="${X(t)}" y="${m.t + ih + 16}" text-anchor="middle">${o.fmtX ? o.fmtX(t) : t}</text>`;
    });
    s += `<line x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}" style="stroke:var(--line-strong)"/>`;
    if (o.xLabel) s += `<text x="${m.l + iw / 2}" y="${H - 4}" text-anchor="middle">${o.xLabel}</text>`;
    if (o.yLabel) s += `<text x="12" y="${m.t + ih / 2}" text-anchor="middle" transform="rotate(-90 12 ${m.t + ih / 2})">${o.yLabel}</text>`;
    (o.extra || []).forEach((e) => { s += e({ X, Y, m, iw, ih, W, H }); });
    (o.series || []).forEach((se) => {
      if (!se.soloPuntos && se.puntos.length > 1) {
        const d = se.puntos.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join('');
        s += `<path d="${d}" fill="none" style="stroke:${se.color}" stroke-width="2.2" ${se.discontinua ? 'stroke-dasharray="5 4"' : ''} stroke-linejoin="round"/>`;
      }
      (se.marcar || (se.soloPuntos ? se.puntos : [])).forEach((p) => {
        s += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${se.radio || 4}" style="fill:${se.color};stroke:var(--surface)" stroke-width="1.5"/>`;
      });
    });
    s += '</svg>';
    return s;
  }
  function leyenda(items) {
    return h('div', { class: 'w-leyenda' }, items.map(([color, txt]) => h('span', { style: `--c:${color}` }, txt)));
  }

  // ------------------------------------------------------------------ compuesto
  window.registrarWidget('compuesto', (cont, cfg) => {
    const c = marco(cont, 'Composición del error en tareas largas', 'pⁿ');
    const sp = control('Fiabilidad por paso (p)', { min: 0.8, max: 0.999, step: 0.001, valor: cfg.p || 0.95, formato: (v) => pct(v, 1) });
    const sn = control('Número de pasos (n)', { min: 1, max: 100, step: 1, valor: cfg.pasos || 20 });
    const salida = h('div', { class: 'w-resultados' });
    const g = h('div', { class: 'w-grafico' });
    const nota = h('p', { class: 'w-nota' });
    c.append(h('div', { class: 'w-controles' }, sp.el, sn.el), salida, g,
      leyenda([['var(--accent)', 'tu p'], ['var(--ink)', 'p = 99 %'], ['var(--muted)', 'p = 90 %']]), nota);
    const pintar = () => {
      const p = sp.get();
      const n = sn.get();
      const total = Math.pow(p, n);
      const necesaria = Math.pow(0.9, 1 / n);
      const n50 = Math.floor(Math.log(0.5) / Math.log(p));
      salida.innerHTML = '';
      salida.append(
        res(pct(total), `éxito de la tarea completa (p<sup>n</sup>)`, total >= 0.8 ? 'pass' : total < 0.5 ? 'fail' : 'acc'),
        res(pct(necesaria, 2), 'fiabilidad por paso necesaria para un 90 % total'),
        res(String(n50), 'pasos que aguantas antes de caer por debajo del 50 %', 'ink'));
      const serie = (pp) => Array.from({ length: 100 }, (_, i) => [i + 1, Math.pow(pp, i + 1)]);
      g.innerHTML = grafico({
        xMin: 1, xMax: 100, yMin: 0, yMax: 1, xTicks: [1, 20, 40, 60, 80, 100], yTicks: [0, 0.25, 0.5, 0.75, 1],
        fmtY: (t) => Math.round(t * 100) + '%', xLabel: 'número de pasos', yLabel: 'éxito total',
        series: [
          { puntos: serie(0.9), color: 'var(--muted)', discontinua: true },
          { puntos: serie(0.99), color: 'var(--ink)' },
          { puntos: serie(p), color: 'var(--accent)', marcar: [[n, total]] },
        ],
      });
      nota.innerHTML = `Supone errores <strong>independientes</strong> y sin recuperación. Los agentes reales pueden detectar y corregir errores (lo que sube la curva) o encadenar errores correlacionados (lo que la baja). Aun así, la lección se mantiene: en tareas de ${n} pasos, pasar de ${pct(p, 1)} a ${pct(Math.min(0.999, p + 0.01), 1)} por paso cambia el resultado de ${pct(total, 0)} a ${pct(Math.pow(Math.min(0.999, p + 0.01), n), 0)}.`;
    };
    [sp, sn].forEach((x) => x.inp.addEventListener('input', pintar));
    pintar();
  });

  // ------------------------------------------------------------------ passk
  window.registrarWidget('passk', (cont, cfg) => {
    const c = marco(cont, 'Calculadora pass@k y pass^k', 'k');
    const sn = control('Ensayos por tarea (n)', { min: 1, max: 30, step: 1, valor: cfg.n || 10 });
    const sc = control('Ensayos correctos (c)', { min: 0, max: 30, step: 1, valor: cfg.c != null ? cfg.c : 6 });
    const sk = control('k', { min: 1, max: 30, step: 1, valor: cfg.k || 3 });
    const salida = h('div', { class: 'w-resultados' });
    const g = h('div', { class: 'w-grafico' });
    const nota = h('p', { class: 'w-nota' });
    c.append(h('div', { class: 'w-controles' }, sn.el, sc.el, sk.el), salida, g,
      leyenda([['var(--ink)', 'pass@k (al menos 1 de k)'], ['var(--accent)', 'pass^k (los k)'], ['var(--muted)', 'p̂ = c/n (pass@1)']]), nota);
    const pintar = () => {
      const n = sn.get();
      sc.inp.max = n;
      sk.inp.max = n;
      if (sc.get() > n) sc.set(n);
      if (sk.get() > n) sk.set(n);
      const cc = sc.get();
      const k = sk.get();
      const atk = 1 - comb(n - cc, k) / comb(n, k);
      const potk = comb(cc, k) / comb(n, k);
      const ingenuo = 1 - Math.pow(1 - cc / n, k);
      salida.innerHTML = '';
      salida.append(
        res(fx(cc / n), 'pass@1 = c/n'),
        res(fx(atk), `pass@${k} (estimador insesgado)`, 'ink'),
        res(fx(potk), `pass^${k} = C(c,k)/C(n,k)`, 'acc'),
        res(fx(ingenuo), `1−(1−p̂)<sup>k</sup> (ingenuo, sesgado)`));
      const pa = [];
      const pp = [];
      for (let kk = 1; kk <= n; kk++) {
        pa.push([kk, 1 - comb(n - cc, kk) / comb(n, kk)]);
        pp.push([kk, comb(cc, kk) / comb(n, kk)]);
      }
      const ticks = n <= 10 ? Array.from({ length: n }, (_, i) => i + 1) : [1, Math.round(n / 4), Math.round(n / 2), Math.round((3 * n) / 4), n];
      g.innerHTML = grafico({
        xMin: 1, xMax: Math.max(2, n), yMin: 0, yMax: 1, xTicks: ticks, yTicks: [0, 0.25, 0.5, 0.75, 1],
        fmtY: (t) => t.toFixed(2), xLabel: 'k', yLabel: 'probabilidad',
        series: [
          { puntos: [[1, cc / n], [Math.max(2, n), cc / n]], color: 'var(--muted)', discontinua: true },
          { puntos: pa, color: 'var(--ink)', marcar: [[k, atk]] },
          { puntos: pp, color: 'var(--accent)', marcar: [[k, potk]] },
        ],
      });
      nota.innerHTML = `Con ${cc} aciertos de ${n} ensayos: si puedes elegir el mejor de ${k} intentos (con tests o una persona), la probabilidad de tener al menos uno bueno es ${fx(atk, 2)}. Si un cliente repite la misma petición ${k} veces y todas deben salir bien, la probabilidad es ${fx(potk, 2)}. Las dos métricas coinciden en k = 1 y se separan al crecer k.`;
    };
    [sn, sc, sk].forEach((x) => x.inp.addEventListener('input', pintar));
    pintar();
  });

  // ------------------------------------------------------------------ intervalo
  window.registrarWidget('intervalo', (cont, cfg) => {
    const c = marco(cont, 'Intervalos de confianza: ¿A es mejor que B?', 'IC95');
    const xa = numero('Éxitos agente A', cfg.exitosA != null ? cfg.exitosA : 42, 0, 100000);
    const na = numero('Tareas agente A', cfg.nA || 60, 1, 100000);
    const xb = numero('Éxitos agente B', cfg.exitosB != null ? cfg.exitosB : 35, 0, 100000);
    const nb = numero('Tareas agente B', cfg.nB || 60, 1, 100000);
    const salida = h('div', { class: 'w-resultados' });
    const g = h('div', { class: 'w-grafico' });
    const nota = h('p', { class: 'w-nota' });
    c.append(h('div', { class: 'w-controles' }, xa.el, na.el, xb.el, nb.el), g, salida, nota);
    const pintar = () => {
      const A = { x: Math.min(xa.get(), na.get()), n: Math.max(1, na.get()) };
      const B = { x: Math.min(xb.get(), nb.get()), n: Math.max(1, nb.get()) };
      const [pa, la, ua] = wilson(A.x, A.n);
      const [pb, lb, ub] = wilson(B.x, B.n);
      const pool = (A.x + B.x) / (A.n + B.n);
      const se = Math.sqrt(pool * (1 - pool) * (1 / A.n + 1 / B.n));
      const z = se > 0 ? (pa - pb) / se : 0;
      const pval = 2 * (1 - normCdf(Math.abs(z)));
      const seDif = Math.sqrt((pa * (1 - pa)) / A.n + (pb * (1 - pb)) / B.n);
      const difL = pa - pb - 1.96 * seDif;
      const difU = pa - pb + 1.96 * seDif;
      const W = 560;
      const fila = (y, p, l, u, color, nombre) => ({ X }) =>
        `<line x1="${X(l)}" x2="${X(u)}" y1="${y}" y2="${y}" style="stroke:${color}" stroke-width="6" stroke-linecap="round" opacity="0.35"/>` +
        `<circle cx="${X(p)}" cy="${y}" r="6" style="fill:${color}"/>` +
        `<text x="${X(u) + 8 > W - 60 ? X(l) - 8 : X(u) + 8}" y="${y + 4}" text-anchor="${X(u) + 8 > W - 60 ? 'end' : 'start'}">${nombre} ${pct(p, 0)} [${pct(l, 0)}–${pct(u, 0)}]</text>`;
      g.innerHTML = grafico({
        ancho: W, alto: 130, xMin: 0, xMax: 1, yMin: 0, yMax: 1, xTicks: [0, 0.25, 0.5, 0.75, 1], fmtX: (t) => Math.round(t * 100) + '%',
        aria: 'Intervalos de confianza de A y B',
        extra: [fila(38, pa, la, ua, 'var(--ink)', 'A'), fila(76, pb, lb, ub, 'var(--accent)', 'B')],
      });
      const signif = pval < 0.05;
      salida.innerHTML = '';
      salida.append(
        res(`${pct(pa - pb)}`, 'diferencia A − B'),
        res(`[${pct(difL, 0)}, ${pct(difU, 0)}]`, 'IC95 de la diferencia (Wald)'),
        res(pval < 0.001 ? '< 0,001' : fx(pval), 'p-valor (z de dos proporciones)', signif ? 'pass' : 'fail'));
      nota.innerHTML = (signif
        ? '<strong>Diferencia estadísticamente significativa</strong> al 5 %. '
        : '<strong>No hay evidencia suficiente</strong> de que uno sea mejor: la diferencia es compatible con ruido. ')
        + 'Este test supone muestras <em>independientes</em>. Si A y B se ejecutaron sobre <em>las mismas tareas</em>, usa un análisis pareado (McNemar, módulo 8): suele ser bastante más sensible. Con varios ensayos por tarea, usa errores estándar agrupados por tarea.';
    };
    [xa, na, xb, nb].forEach((x) => x.inp.addEventListener('input', pintar));
    pintar();
  });

  // ------------------------------------------------------------------ tamaño de muestra
  window.registrarWidget('tamano_muestra', (cont, cfg) => {
    const c = marco(cont, '¿Cuántas tareas necesito?', 'n');
    const s1 = control('Tasa de éxito actual (p₁)', { min: 0.05, max: 0.95, step: 0.01, valor: cfg.p1 || 0.6, formato: (v) => pct(v, 0) });
    const s2 = control('Tasa que quieres detectar (p₂)', { min: 0.05, max: 0.99, step: 0.01, valor: cfg.p2 || 0.7, formato: (v) => pct(v, 0) });
    const pot = selector('Potencia', [['0.8', '80 %'], ['0.9', '90 %']], '0.8');
    const salida = h('div', { class: 'w-resultados' });
    const tabla = h('div', { class: 'tabla-wrap' });
    const nota = h('p', { class: 'w-nota' });
    c.append(h('div', { class: 'w-controles' }, s1.el, s2.el, pot.el), salida, tabla, nota);
    const nNecesario = (p1, p2, zb) => {
      const za = 1.959964;
      const pm = (p1 + p2) / 2;
      const num = za * Math.sqrt(2 * pm * (1 - pm)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
      return Math.ceil((num * num) / Math.pow(p1 - p2, 2));
    };
    const pintar = () => {
      const p1 = s1.get();
      const p2 = s2.get();
      const zb = pot.get() === '0.9' ? 1.281552 : 0.841621;
      salida.innerHTML = '';
      if (Math.abs(p1 - p2) < 0.005) {
        salida.append(res('∞', 'p₁ y p₂ son iguales: no hay diferencia que detectar', 'fail'));
      } else {
        const n = nNecesario(p1, p2, zb);
        salida.append(
          res(String(n), 'tareas por agente (comparación independiente)', 'acc'),
          res(pct(Math.abs(p2 - p1), 0), 'diferencia a detectar'),
          res('α = 0,05', 'bilateral, potencia ' + (zb > 1 ? '90 %' : '80 %')));
      }
      const filas = [0.03, 0.05, 0.1, 0.15, 0.2].map((d) => {
        const q = Math.min(0.99, p1 + d);
        return `<tr><td>+${Math.round(d * 100)} puntos (${pct(p1, 0)} → ${pct(q, 0)})</td><td>${nNecesario(p1, q, zb)}</td></tr>`;
      }).join('');
      tabla.innerHTML = `<table><thead><tr><th>Mejora que quieres detectar</th><th>Tareas necesarias</th></tr></thead><tbody>${filas}</tbody></table>`;
      nota.innerHTML = 'Fórmula clásica para dos proporciones independientes. Las mejoras grandes (típicas al principio del desarrollo) se detectan con pocas decenas de tareas; las pequeñas exigen cientos. Un diseño <em>pareado</em> (mismas tareas para los dos agentes) y varios ensayos por tarea reducen la varianza y el número necesario.';
    };
    [s1, s2].forEach((x) => x.inp.addEventListener('input', pintar));
    pot.sel.addEventListener('change', pintar);
    pintar();
  });

  // ------------------------------------------------------------------ varianza
  window.registrarWidget('varianza', (cont, cfg) => {
    const c = marco(cont, 'Simulador: ¿cuánto varía la nota si repito la eval?', 'σ');
    const sp = control('Tasa de éxito real del agente', { min: 0.05, max: 0.95, step: 0.01, valor: cfg.p || 0.65, formato: (v) => pct(v, 0) });
    const sn = control('Tareas en la suite', { min: 10, max: 500, step: 10, valor: cfg.n || 50 });
    const b1 = h('button', { class: 'btn peq', type: 'button' }, 'Ejecutar 1 vez');
    const b100 = h('button', { class: 'btn primario peq', type: 'button' }, 'Ejecutar 200 veces');
    const bR = h('button', { class: 'btn peq', type: 'button' }, 'Reiniciar');
    const salida = h('div', { class: 'w-resultados' });
    const g = h('div', { class: 'w-grafico' });
    const nota = h('p', { class: 'w-nota' });
    c.append(h('div', { class: 'w-controles' }, sp.el, sn.el), h('div', { class: 'fila-botones' }, b1, b100, bR), salida, g, nota);
    let obs = [];
    const correr = (veces) => {
      const p = sp.get();
      const n = sn.get();
      for (let r = 0; r < veces; r++) {
        let x = 0;
        for (let i = 0; i < n; i++) if (Math.random() < p) x++;
        obs.push(x / n);
      }
      pintar();
    };
    const pintar = () => {
      const p = sp.get();
      const n = sn.get();
      const sdT = Math.sqrt((p * (1 - p)) / n);
      salida.innerHTML = '';
      const media = obs.length ? obs.reduce((a, b) => a + b, 0) / obs.length : NaN;
      const sd = obs.length > 1 ? Math.sqrt(obs.reduce((a, b) => a + (b - media) * (b - media), 0) / (obs.length - 1)) : NaN;
      const min = obs.length ? Math.min(...obs) : NaN;
      const max = obs.length ? Math.max(...obs) : NaN;
      salida.append(
        res(String(obs.length), 'ejecuciones simuladas'),
        res(obs.length ? pct(obs[obs.length - 1]) : '—', 'última nota observada', 'acc'),
        res(obs.length ? `${pct(min, 0)} – ${pct(max, 0)}` : '—', 'rango observado'),
        res(`${pct(sdT)}`, 'desviación teórica √(p(1−p)/n)', 'ink'),
        res(obs.length > 1 ? pct(sd) : '—', 'desviación observada'));
      // histograma
      const bins = 30;
      const lo = Math.max(0, p - 4.5 * sdT);
      const hi = Math.min(1, p + 4.5 * sdT);
      const ancho = (hi - lo) / bins || 0.01;
      const cuentas = new Array(bins).fill(0);
      obs.forEach((o) => { const i = Math.min(bins - 1, Math.max(0, Math.floor((o - lo) / ancho))); cuentas[i]++; });
      const maxC = Math.max(1, ...cuentas);
      const barras = ({ X, Y }) => cuentas.map((cnt, i) => {
        const x0 = X(lo + i * ancho);
        const x1 = X(lo + (i + 1) * ancho);
        return `<rect x="${x0 + 0.5}" y="${Y(cnt / maxC)}" width="${Math.max(0.5, x1 - x0 - 1)}" height="${Y(0) - Y(cnt / maxC)}" style="fill:var(--accent)" opacity="0.75"/>`;
      }).join('') + `<line x1="${X(p)}" x2="${X(p)}" y1="${Y(1.02)}" y2="${Y(0)}" style="stroke:var(--ink)" stroke-width="2" stroke-dasharray="4 3"/>`;
      const t = [lo, lo + (hi - lo) / 4, (lo + hi) / 2, lo + (3 * (hi - lo)) / 4, hi];
      g.innerHTML = grafico({ xMin: lo, xMax: hi, yMin: 0, yMax: 1.05, xTicks: t, fmtX: (v) => Math.round(v * 100) + '%', xLabel: 'nota observada (línea discontinua = tasa real)', extra: [barras], aria: 'Histograma de notas observadas' });
      nota.innerHTML = `Con ${n} tareas, aproximadamente el 95 % de las ejecuciones caen entre ${pct(Math.max(0, p - 1.96 * sdT), 0)} y ${pct(Math.min(1, p + 1.96 * sdT), 0)}, <strong>sin que el agente haya cambiado</strong>. Una "mejora" de ${pct(1.96 * sdT, 0)} entre dos ejecuciones puede ser solo ruido. Prueba a subir el número de tareas y observa cómo se estrecha el histograma (se divide por √n).`;
    };
    b1.addEventListener('click', () => correr(1));
    b100.addEventListener('click', () => correr(200));
    bR.addEventListener('click', () => { obs = []; pintar(); });
    [sp, sn].forEach((x) => x.inp.addEventListener('input', () => { obs = []; pintar(); }));
    correr(40);
  });

  // ------------------------------------------------------------------ pareto
  const PUNTOS_PARETO = [
    { nombre: 'Modelo pequeño, 1 intento', coste: 0.02, exito: 0.41 },
    { nombre: 'Pequeño + autoverificación', coste: 0.05, exito: 0.52 },
    { nombre: 'Modelo mediano', coste: 0.08, exito: 0.58 },
    { nombre: 'Mediano + reflexión (3 rondas)', coste: 0.16, exito: 0.57 },
    { nombre: 'Grande con max_turns bajo', coste: 0.19, exito: 0.55 },
    { nombre: 'Mediano + votación ×3', coste: 0.24, exito: 0.64 },
    { nombre: 'Modelo grande', coste: 0.31, exito: 0.71 },
    { nombre: 'Grande + orquestador multiagente', coste: 1.15, exito: 0.75 },
    { nombre: 'Grande + best-of-5 con tests', coste: 1.6, exito: 0.74 },
  ];
  window.registrarWidget('pareto', (cont, cfg) => {
    const c = marco(cont, 'Frontera de Pareto: éxito frente a coste', '$');
    const puntos = (cfg.puntos || PUNTOS_PARETO).map((p, i) => Object.assign({ activo: true, i }, p));
    const maxCoste = Math.max(...puntos.map((p) => p.coste));
    const presupuesto = control('Presupuesto máximo por tarea', { min: 0, max: +(maxCoste * 1.1).toFixed(3), step: +(maxCoste / 200).toFixed(4) || 0.001, valor: +(maxCoste * 0.25).toFixed(3), formato: (v) => v.toFixed(maxCoste < 1 ? 3 : 2) + ' $' });
    const g = h('div', { class: 'w-grafico' });
    const lista = h('div', { class: 'checklist' });
    const salida = h('div', { class: 'w-resultados' });
    const tabla = h('div', { class: 'tabla-wrap' });
    c.append(h('p', { class: 'w-nota', html: `Datos <strong>ficticios</strong> de ${puntos.length} configuraciones agente+harness evaluadas sobre la misma suite. Desactiva configuraciones o mueve el presupuesto.` }),
      presupuesto.el, g, leyenda([['var(--accent)', 'en la frontera'], ['var(--muted)', 'dominada'], ['var(--ink)', 'mejor dentro del presupuesto']]), salida, lista, tabla);
    puntos.forEach((p) => {
      const inp = h('input', { type: 'checkbox', id: 'par-' + (++uid) });
      inp.checked = true;
      inp.addEventListener('change', () => { p.activo = inp.checked; pintar(); });
      lista.append(h('label', { for: inp.id }, inp, h('span', null, `${p.nombre} — ${p.coste.toFixed(2)} $ · ${pct(p.exito, 0)}`)));
    });
    const pintar = () => {
      const act = puntos.filter((p) => p.activo);
      const frontera = act.filter((p) => !act.some((q) => q !== p && q.coste <= p.coste && q.exito >= p.exito && (q.coste < p.coste || q.exito > p.exito)))
        .sort((a, b) => a.coste - b.coste);
      const pres = presupuesto.get();
      const dentro = act.filter((p) => p.coste <= pres).sort((a, b) => b.exito - a.exito)[0];
      const todos = puntos.length ? puntos : [{ coste: 0.01, exito: 0.5 }];
      const minC = Math.pow(10, Math.floor(Math.log10(Math.min(...todos.map((p) => p.coste)) * 0.8)));
      const maxC = Math.max(...todos.map((p) => p.coste)) * 1.4;
      const yLo = Math.max(0, Math.floor(Math.min(...todos.map((p) => p.exito)) * 10 - 1) / 10);
      const yHi = Math.min(1, Math.ceil(Math.max(...todos.map((p) => p.exito)) * 10 + 0.5) / 10);
      const xTicks = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100].filter((t) => t >= minC && t <= maxC);
      const yTicks = [];
      for (let t = yLo; t <= yHi + 1e-9; t += yHi - yLo > 0.5 ? 0.2 : 0.1) yTicks.push(+t.toFixed(2));
      g.innerHTML = grafico({
        xMin: minC, xMax: maxC, logX: true, yMin: yLo, yMax: yHi, xTicks, yTicks,
        fmtX: (t) => t + ' $', fmtY: (t) => Math.round(t * 100) + '%', xLabel: 'coste por tarea (escala log)', yLabel: 'tasa de éxito',
        extra: [({ X, Y }) => `<rect x="${X(minC)}" y="${Y(yHi)}" width="${Math.max(0, X(Math.min(maxC, Math.max(minC, pres))) - X(minC))}" height="${Y(yLo) - Y(yHi)}" style="fill:var(--ink)" opacity="0.06"/>` +
          act.map((p) => `<text x="${X(p.coste) + 7}" y="${Y(p.exito) - 6}" style="font-size:9px">${p.i + 1}</text>`).join('')],
        series: [
          { puntos: frontera.map((p) => [p.coste, p.exito]), color: 'var(--accent)', marcar: frontera.map((p) => [p.coste, p.exito]) },
          { puntos: act.filter((p) => !frontera.includes(p)).map((p) => [p.coste, p.exito]), color: 'var(--muted)', soloPuntos: true },
          { puntos: dentro ? [[dentro.coste, dentro.exito]] : [], color: 'var(--ink)', soloPuntos: true, radio: 7 },
        ],
      });
      salida.innerHTML = '';
      salida.append(
        res(String(frontera.length), 'configuraciones en la frontera', 'acc'),
        res(dentro ? pct(dentro.exito, 0) : '—', dentro ? `mejor con ≤ ${pres.toFixed(2)} $: ${dentro.nombre}` : 'ninguna cabe en el presupuesto', 'ink'));
      tabla.innerHTML = '<table><thead><tr><th>#</th><th>Configuración</th><th>Coste/tarea</th><th>Éxito</th><th>Coste por éxito</th><th>Estado</th></tr></thead><tbody>' +
        act.map((p) => `<tr><td>${p.i + 1}</td><td>${p.nombre}</td><td>${p.coste.toFixed(2)} $</td><td>${pct(p.exito, 0)}</td><td>${(p.coste / p.exito).toFixed(3)} $</td><td>${frontera.includes(p) ? '<span class="chip acc">frontera</span>' : '<span class="chip">dominada</span>'}</td></tr>`).join('') + '</tbody></table>';
    };
    presupuesto.inp.addEventListener('input', pintar);
    pintar();
  });

  // ------------------------------------------------------------------ combinador
  window.registrarWidget('combinador', (cont) => {
    const c = marco(cont, 'Combinador de patrones: fiabilidad extremo a extremo', '∏');
    const mayoria = (n, p) => {
      let s = 0;
      for (let k = Math.floor(n / 2) + 1; k <= n; k++) s += comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
      return s;
    };
    // Cadena
    const cn = control('Pasos en la cadena', { min: 1, max: 10, step: 1, valor: 4 });
    const cp = control('Fiabilidad de cada paso', { min: 0.5, max: 1, step: 0.01, valor: 0.92, formato: (v) => pct(v, 0) });
    const cd = control('Gate/verificador: detecta un fallo y reintenta', { min: 0, max: 1, step: 0.05, valor: 0, formato: (v) => pct(v, 0) });
    const rc = h('div', { class: 'w-resultados' });
    // Router
    const rr = control('Precisión del router', { min: 0.5, max: 1, step: 0.01, valor: 0.9, formato: (v) => pct(v, 0) });
    const rs = control('Éxito del especialista correcto', { min: 0.3, max: 1, step: 0.01, valor: 0.85, formato: (v) => pct(v, 0) });
    const rw = control('Éxito si se enruta mal', { min: 0, max: 1, step: 0.01, valor: 0.2, formato: (v) => pct(v, 0) });
    const rres = h('div', { class: 'w-resultados' });
    // Votación
    const vn = selector('Votantes', [['1', '1'], ['3', '3'], ['5', '5'], ['7', '7'], ['9', '9']], '3');
    const vp = control('Acierto de cada votante', { min: 0.3, max: 0.99, step: 0.01, valor: 0.7, formato: (v) => pct(v, 0) });
    const vr = control('Correlación de errores (ρ)', { min: 0, max: 1, step: 0.05, valor: 0, formato: (v) => v.toFixed(2) });
    const vres = h('div', { class: 'w-resultados' });
    const vnota = h('p', { class: 'w-nota' });
    c.append(
      h('h4', null, '1 · Cadena de prompts (prompt chaining)'), h('div', { class: 'w-controles' }, cn.el, cp.el, cd.el), rc,
      h('h4', null, '2 · Router + especialistas'), h('div', { class: 'w-controles' }, rr.el, rs.el, rw.el), rres,
      h('h4', null, '3 · Paralelización con votación por mayoría'), h('div', { class: 'w-controles' }, vn.el, vp.el, vr.el), vres, vnota,
      h('p', { class: 'w-nota', html: 'Modelo idealizado: supone independencia salvo donde indica ρ. En la práctica los errores están correlacionados (mismo modelo, mismo prompt, misma ambigüedad), así que trata estos números como <strong>cota optimista</strong> y mide siempre el sistema real.' }));
    const pintar = () => {
      const p = cp.get();
      const d = cd.get();
      const pEf = p + (1 - p) * d * p;
      const n = cn.get();
      rc.innerHTML = '';
      rc.append(res(pct(Math.pow(p, n)), 'éxito sin verificación (p<sup>n</sup>)'), res(pct(pEf, 1), 'fiabilidad efectiva por paso'), res(pct(Math.pow(pEf, n)), 'éxito con verificación', 'acc'),
        res('×' + (1 + (1 - p) * d).toFixed(2), 'coste esperado por paso'));
      const r = rr.get();
      const tot = r * rs.get() + (1 - r) * rw.get();
      rres.innerHTML = '';
      rres.append(res(pct(tot), 'éxito extremo a extremo', 'acc'), res(pct(rs.get()), 'techo con router perfecto (oráculo)', 'ink'),
        res(pct(rs.get() - tot), 'ganancia máxima arreglando el router'));
      const nv = +vn.get();
      const pv = vp.get();
      const rho = vr.get();
      const ind = mayoria(nv, pv);
      const tv = rho * pv + (1 - rho) * ind;
      vres.innerHTML = '';
      vres.append(res(pct(pv), 'un solo votante'), res(pct(ind), 'mayoría si fueran independientes'), res(pct(tv), 'mayoría con correlación ρ', 'acc'), res('×' + nv, 'coste relativo'));
      vnota.innerHTML = pv < 0.5
        ? 'Con votantes por debajo del 50 %, la mayoría <strong>empeora</strong> el resultado: amplifica el error.'
        : rho > 0.6 ? 'Con errores muy correlacionados, votar casi no aporta y multiplica el coste.' : 'La votación ayuda cuando los errores son independientes y cada votante supera el 50 %.';
    };
    [cn, cp, cd, rr, rs, rw, vp, vr].forEach((x) => x.inp.addEventListener('input', pintar));
    vn.sel.addEventListener('change', pintar);
    pintar();
  });

  // ------------------------------------------------------------------ elegir_grader
  window.registrarWidget('elegir_grader', (cont) => {
    const c = marco(cont, 'Asistente: ¿qué grader necesito?', '⌥');
    const P = [
      { id: 'evidencia', t: '¿Dónde está la prueba de que la tarea salió bien?', o: [
        ['estado', 'En el estado final del entorno (BD, ficheros, API)'],
        ['tests', 'En que un código pase unos tests'],
        ['corta', 'En una respuesta corta y verificable (número, nombre, ID)'],
        ['estructura', 'En una salida estructurada (JSON, formulario)'],
        ['abierta', 'En un texto abierto (informe, respuesta larga, conversación)']] },
      { id: 'variantes', t: '¿Hay muchas formas válidas de expresar o alcanzar el resultado?', o: [['no', 'No, el resultado es único'], ['si', 'Sí, varias formas válidas']] },
      { id: 'proceso', t: '¿Importa cómo lo hizo (seguridad, políticas, acciones prohibidas, coste)?', o: [['no', 'Solo importa el resultado'], ['si', 'Sí, el proceso también cuenta']] },
      { id: 'referencia', t: '¿Tienes una respuesta o solución de referencia?', o: [['si', 'Sí'], ['no', 'No']] },
      { id: 'riesgo', t: '¿Cuánto cuesta un error en producción?', o: [['bajo', 'Poco'], ['medio', 'Moderado'], ['alto', 'Mucho (dinero, datos, seguridad, salud)']] },
    ];
    const resp = {};
    const form = h('div', { class: 'decision' });
    const salida = h('div');
    P.forEach((q) => {
      const s = selector(q.t, [['', 'Elige…']].concat(q.o), '');
      s.sel.addEventListener('change', () => { resp[q.id] = s.get(); pintar(); });
      form.append(s.el);
    });
    c.append(form, salida);
    const pintar = () => {
      salida.innerHTML = '';
      if (P.some((q) => !resp[q.id])) {
        salida.append(h('p', { class: 'w-nota' }, `Responde las ${P.length} preguntas para ver la recomendación (${Object.keys(resp).length}/${P.length}).`));
        return;
      }
      const prim = [];
      const sec = [];
      const avisos = [];
      const cal = [];
      switch (resp.evidencia) {
        case 'estado': prim.push('<strong>Grader de estado (código)</strong>: consulta la BD/ficheros/API al final del ensayo y comprueba el resultado, no lo que el agente dice.'); break;
        case 'tests': prim.push('<strong>Tests unitarios/integración (código)</strong>: tests ocultos que el agente no ve; comprueba también que los tests previos siguen pasando.'); avisos.push('Vigila que el agente no edite ni borre tests (reward hacking).'); break;
        case 'corta': prim.push(resp.variantes === 'si' ? '<strong>Coincidencia normalizada (código)</strong>: normaliza mayúsculas, espacios, unidades y formatos numéricos; tolerancia numérica.' : '<strong>Coincidencia exacta (código)</strong>.'); break;
        case 'estructura': prim.push('<strong>Validación de esquema + comprobación de campos (código)</strong>.'); break;
        default: prim.push(resp.referencia === 'si' ? '<strong>Juez LLM guiado por referencia</strong> con rúbrica de criterios binarios.' : '<strong>Juez LLM con rúbrica</strong> de criterios binarios (sí/no) y opción "no se puede determinar".');
      }
      if (resp.evidencia !== 'abierta' && resp.variantes === 'si') sec.push('Si la normalización no basta, añade un <strong>juez LLM de equivalencia</strong> como segunda opinión solo para los casos que el código suspende.');
      if (resp.evidencia === 'abierta' && resp.variantes === 'si') sec.push('Evita comparar literalmente con la referencia: pide al juez que evalúe hechos y requisitos, no redacción. Considera <strong>comparación por pares</strong> contra una línea base.');
      if (resp.evidencia === 'tests' || resp.evidencia === 'estado') sec.push('Para la calidad (legibilidad, explicación al usuario), añade una <strong>rúbrica LLM</strong> secundaria con menos peso.');
      if (resp.proceso === 'si') sec.push('<strong>Comprobaciones de trayectoria</strong> en código: herramientas prohibidas, confirmaciones obligatorias, máximo de pasos/coste. Para políticas en lenguaje natural, un <strong>juez LLM de cumplimiento</strong> que lee el transcript.');
      if (resp.proceso === 'no') avisos.push('No restrinjas el camino: los agentes encuentran soluciones válidas inesperadas. Puntúa el resultado.');
      if (resp.evidencia === 'abierta' || resp.variantes === 'si') cal.push('Calibra cualquier juez LLM con 30-100 ejemplos etiquetados por personas expertas; mide acuerdo (kappa, TPR/TNR) antes de confiar en él.');
      if (resp.riesgo === 'alto') { cal.push('<strong>Revisión humana experta</strong> de una muestra de ensayos (y de todos los fallos críticos).'); sec.push('Usa <strong>pass^k</strong> (todos los ensayos bien) como métrica de fiabilidad, no solo pass@1.'); }
      if (resp.riesgo === 'medio') cal.push('Revisión humana periódica de una muestra aleatoria de transcripts.');
      if (resp.referencia === 'no' && resp.evidencia !== 'abierta') avisos.push('Sin solución de referencia no puedes demostrar que la tarea es resoluble ni que el grader funciona: crea una antes de usar la tarea.');
      cal.push('Prueba el grader con salidas buenas y malas conocidas, y lee transcripts de los fallos para confirmar que son justos.');
      salida.append(h('div', { class: 'recomendacion' },
        h('h5', null, 'Tu pila de graders recomendada'),
        h('div', null, h('strong', null, 'Principal'), h('ul', null, prim.map((x) => h('li', { html: x })))),
        sec.length ? h('div', null, h('strong', null, 'Complementarios'), h('ul', null, sec.map((x) => h('li', { html: x })))) : null,
        h('div', null, h('strong', null, 'Calibración y control'), h('ul', null, cal.map((x) => h('li', { html: x })))),
        avisos.length ? h('div', null, h('strong', null, 'Cuidado con'), h('ul', null, avisos.map((x) => h('li', { html: x })))) : null,
        h('p', { class: 'w-nota' }, 'Regla general: código cuando puedas, modelo cuando debas, personas para calibrar.')));
    };
    pintar();
  });

  // ------------------------------------------------------------------ kappa
  window.registrarWidget('kappa', (cont, cfg) => {
    const c = marco(cont, 'Acuerdo juez LLM vs. personas (kappa de Cohen)', 'κ');
    const mk = (v) => { const i = h('input', { type: 'number', min: 0, step: 1, value: v, id: 'k' + (++uid) }); return i; };
    const a = mk(cfg.a != null ? cfg.a : 40);
    const b = mk(cfg.b != null ? cfg.b : 5);
    const cc = mk(cfg.c != null ? cfg.c : 8);
    const d = mk(cfg.d != null ? cfg.d : 47);
    const tablaIn = h('div', { class: 'w-matriz' },
      h('span'), h('span', { class: 'h' }, 'Humano: PASS'), h('span', { class: 'h' }, 'Humano: FAIL'),
      h('span', { class: 'h' }, 'Juez: PASS'), a, b,
      h('span', { class: 'h' }, 'Juez: FAIL'), cc, d);
    const salida = h('div', { class: 'w-resultados' });
    const nota = h('p', { class: 'w-nota' });
    c.append(h('p', { class: 'w-nota', html: 'Introduce cuántos ejemplos caen en cada casilla al comparar el veredicto del juez con la etiqueta humana.' }), tablaIn, salida, nota);
    const pintar = () => {
      const [A, B, Cc, D] = [a, b, cc, d].map((x) => Math.max(0, parseInt(x.value, 10) || 0));
      const N = A + B + Cc + D;
      salida.innerHTML = '';
      if (!N) { salida.append(res('—', 'introduce datos')); return; }
      const po = (A + D) / N;
      const pJ = (A + B) / N;
      const pH = (A + Cc) / N;
      const pe = pJ * pH + (1 - pJ) * (1 - pH);
      const k = pe < 1 ? (po - pe) / (1 - pe) : 1;
      const tpr = A + Cc ? A / (A + Cc) : NaN;
      const tnr = B + D ? D / (B + D) : NaN;
      const prec = A + B ? A / (A + B) : NaN;
      salida.append(
        res(pct(po), 'acuerdo observado (accuracy)'),
        res(pct(pe), 'acuerdo esperado por azar'),
        res(fx(k), 'kappa de Cohen', k >= 0.8 ? 'pass' : k < 0.6 ? 'fail' : 'acc'),
        res(Number.isNaN(tpr) ? '—' : pct(tpr), 'TPR: aprueba lo que el humano aprueba'),
        res(Number.isNaN(tnr) ? '—' : pct(tnr), 'TNR: suspende lo que el humano suspende'),
        res(Number.isNaN(prec) ? '—' : pct(prec), 'precisión de los PASS del juez'),
        res(`${pct(pJ, 0)} vs ${pct(pH, 0)}`, 'tasa de PASS juez vs. humano', 'ink'));
      const banda = k < 0 ? 'peor que el azar' : k < 0.2 ? 'leve' : k < 0.4 ? 'débil' : k < 0.6 ? 'moderado' : k < 0.8 ? 'sustancial' : 'casi perfecto';
      nota.innerHTML = `Acuerdo <strong>${banda}</strong> según la escala orientativa de Landis y Koch. ` +
        (pJ > pH + 0.05 ? 'El juez es <strong>más indulgente</strong> que las personas: inflará tu tasa de éxito. ' : pJ < pH - 0.05 ? 'El juez es <strong>más estricto</strong> que las personas: penalizará respuestas válidas. ' : '') +
        'Fíjate en que la accuracy puede ser alta aunque kappa sea baja cuando casi todo es PASS (o casi todo FAIL): kappa descuenta el acuerdo por azar.';
    };
    [a, b, cc, d].forEach((x) => x.addEventListener('input', pintar));
    pintar();
  });

  // ------------------------------------------------------------------ mini_runner
  const TAREAS_RUNNER = [
    { id: 'sumar-facturas', dif: -1.5, tipo: 'respuesta numérica' },
    { id: 'extraer-fecha', dif: -1.0, tipo: 'formato estricto' },
    { id: 'buscar-pedido', dif: -0.5, tipo: 'estado (BD)' },
    { id: 'reembolso-parcial', dif: 0.0, tipo: 'estado (BD)' },
    { id: 'politica-devolucion', dif: 0.4, tipo: 'respuesta abierta' },
    { id: 'migrar-config', dif: 0.8, tipo: 'tests' },
    { id: 'conciliar-pagos', dif: 1.3, tipo: 'tests' },
    { id: 'informe-trimestral', dif: 1.8, tipo: 'respuesta abierta' },
  ];
  const PATRONES = {
    unico: { nombre: 'Un intento', desc: 'Una sola llamada al modelo.' },
    verificar: { nombre: 'ReAct + autoverificación', desc: 'El agente comprueba su resultado; si detecta un error (60 % de las veces) lo reintenta una vez.' },
    votar: { nombre: 'Votación ×3', desc: 'Tres respuestas en paralelo y gana la mayoría. Errores parcialmente correlacionados (ρ = 0,3).' },
    evalopt: { nombre: 'Evaluador-optimizador', desc: 'Un evaluador revisa la respuesta (detecta el 70 % de los errores) y pide hasta 2 rondas de mejora.' },
  };
  window.registrarWidget('mini_runner', (cont) => {
    const c = marco(cont, 'Mini-runner de evaluación (agente simulado)', '▶');
    const habilidad = control('Habilidad del modelo', { min: -1, max: 2.5, step: 0.1, valor: 0.6, formato: (v) => v.toFixed(1) });
    const patron = selector('Patrón del agente', Object.entries(PATRONES).map(([k, v]) => [k, v.nombre]), 'unico');
    const ensayos = control('Ensayos por tarea (k)', { min: 1, max: 10, step: 1, valor: 5 });
    const grader = selector('Grader', [['normalizado', 'Normalizado (tolera formato)'], ['estricto', 'Exact match estricto']], 'normalizado');
    const bRun = h('button', { class: 'btn primario', type: 'button' }, '▶ Ejecutar evaluación');
    const desc = h('p', { class: 'w-nota' });
    const tabla = h('div', { class: 'tabla-wrap' });
    const salida = h('div', { class: 'w-resultados' });
    const historial = h('div', { class: 'tabla-wrap' });
    c.append(
      h('p', { class: 'w-nota', html: 'Ocho tareas ficticias de un agente de facturación con distinta dificultad. El agente es <strong>simulado</strong>: su probabilidad de acierto depende de la habilidad del modelo, la dificultad de la tarea y el patrón. Cada ejecución es aleatoria, como en la vida real.' }),
      h('div', { class: 'w-controles' }, habilidad.el, patron.el, ensayos.el, grader.el), desc,
      h('div', { class: 'fila-botones' }, bRun), salida, tabla, h('h4', null, 'Historial de ejecuciones'), historial);
    const runs = [];
    const sigm = (x) => 1 / (1 + Math.exp(-x));
    const intento = (p) => Math.random() < p;
    function ejecutarPatron(p, pat) {
      // devuelve {ok, llamadas}
      if (pat === 'unico') return { ok: intento(p), llamadas: 1 };
      if (pat === 'verificar') {
        const ok = intento(p);
        if (ok) return { ok, llamadas: 1.5 };
        if (Math.random() < 0.6) return { ok: intento(p), llamadas: 2.6 };
        return { ok: false, llamadas: 1.5 };
      }
      if (pat === 'votar') {
        if (Math.random() < 0.3) { const ok = intento(p); return { ok, llamadas: 3 }; }
        let v = 0;
        for (let i = 0; i < 3; i++) if (intento(p)) v++;
        return { ok: v >= 2, llamadas: 3 };
      }
      // evaluador-optimizador
      let ok = intento(p);
      let llamadas = 2;
      for (let r = 0; r < 2 && !ok; r++) {
        if (Math.random() < 0.7) { ok = intento(Math.min(0.98, p + 0.1)); llamadas += 2; } else break;
      }
      return { ok, llamadas };
    }
    const pintarDesc = () => { desc.textContent = PATRONES[patron.get()].desc; };
    patron.sel.addEventListener('change', pintarDesc);
    pintarDesc();
    bRun.addEventListener('click', () => {
      const k = ensayos.get();
      const pat = patron.get();
      const estricto = grader.get() === 'estricto';
      let llamadasTot = 0;
      let falsosNeg = 0;
      const filas = TAREAS_RUNNER.map((t) => {
        const p = sigm(habilidad.get() - t.dif);
        const res1 = [];
        for (let i = 0; i < k; i++) {
          const r = ejecutarPatron(p, pat);
          llamadasTot += r.llamadas;
          let ok = r.ok;
          // con grader estricto, el 15 % de las respuestas correctas con formato libre se suspenden
          if (ok && estricto && (t.tipo === 'respuesta numérica' || t.tipo === 'formato estricto' || t.tipo === 'respuesta abierta') && Math.random() < 0.15) { ok = false; falsosNeg++; }
          res1.push(ok);
        }
        const cc = res1.filter(Boolean).length;
        return { t, res: res1, c: cc, p1: cc / k, pa: 1 - comb(k - cc, k) / comb(k, k), pp: comb(cc, k) / comb(k, k) };
      });
      const media = (f) => filas.reduce((a, x) => a + f(x), 0) / filas.length;
      const p1 = media((x) => x.p1);
      const pa = media((x) => x.pa);
      const pp = media((x) => x.pp);
      const coste = llamadasTot * 0.01;
      const exitos = filas.reduce((a, x) => a + x.c, 0);
      tabla.innerHTML = `<table class="runner-tabla"><thead><tr><th>Tarea</th><th>Evidencia</th><th>Ensayos</th><th>pass@1</th><th>pass@${k}</th><th>pass^${k}</th></tr></thead><tbody>` +
        filas.map((x) => `<tr><td><code>${x.t.id}</code></td><td>${x.t.tipo}</td><td class="celdas">${x.res.map((r) => r ? '<span style="color:var(--pass)">■</span>' : '<span style="color:var(--fail)">■</span>').join('')}</td><td>${x.p1.toFixed(2)}</td><td class="${x.pa ? 'ok' : 'ko'}">${x.pa.toFixed(0)}</td><td class="${x.pp ? 'ok' : 'ko'}">${x.pp.toFixed(0)}</td></tr>`).join('') + '</tbody></table>';
      salida.innerHTML = '';
      salida.append(res(p1.toFixed(2), 'pass@1 medio'), res(pa.toFixed(2), `pass@${k} (tareas con ≥1 acierto)`, 'ink'), res(pp.toFixed(2), `pass^${k} (tareas siempre bien)`, 'acc'),
        res(coste.toFixed(2) + ' $', 'coste simulado total'), res(exitos ? (coste / exitos).toFixed(3) + ' $' : '—', 'coste por ensayo exitoso'),
        res(String(falsosNeg), 'falsos negativos del grader', falsosNeg ? 'fail' : ''));
      runs.unshift({ hab: habilidad.get().toFixed(1), pat: PATRONES[pat].nombre, k, gr: estricto ? 'estricto' : 'normalizado', p1, pa, pp, coste, fn: falsosNeg });
      if (runs.length > 8) runs.pop();
      historial.innerHTML = '<table><thead><tr><th>Habilidad</th><th>Patrón</th><th>k</th><th>Grader</th><th>pass@1</th><th>pass@k</th><th>pass^k</th><th>Coste</th><th>FN grader</th></tr></thead><tbody>' +
        runs.map((r) => `<tr><td>${r.hab}</td><td>${r.pat}</td><td>${r.k}</td><td>${r.gr}</td><td>${r.p1.toFixed(2)}</td><td>${r.pa.toFixed(2)}</td><td>${r.pp.toFixed(2)}</td><td>${r.coste.toFixed(2)} $</td><td>${r.fn}</td></tr>`).join('') + '</tbody></table>';
    });
    historial.innerHTML = '<table><tbody><tr><td class="muted">Aún no has ejecutado ninguna evaluación. Pulsa ▶ y repite con distintas configuraciones para compararlas.</td></tr></tbody></table>';
    bRun.click();
  });

  // ------------------------------------------------------------------ constructor_eval
  window.registrarWidget('constructor_eval', (cont) => {
    const c = marco(cont, 'Constructor de especificación de tarea', 'yaml');
    const campo = (et, valor, area) => {
      const id = 'ce' + (++uid);
      const inp = area ? h('textarea', { id, rows: 3 }) : h('input', { type: 'text', id });
      inp.value = valor;
      return { el: h('label', { class: 'w-control', for: id }, h('span', { class: 'lab' }, h('span', null, et)), inp), inp, get: () => inp.value.trim() };
    };
    const checks = (et, opciones, marcadas) => {
      const cont2 = h('fieldset', { class: 'w-control', style: 'border:0;padding:0;margin:0' }, h('legend', { class: 'lab' }, et));
      const inps = opciones.map(([v, t]) => {
        const i = h('input', { type: 'checkbox', value: v, id: 'ce' + (++uid) });
        i.checked = marcadas.includes(v);
        cont2.append(h('label', { for: i.id, style: 'display:flex;gap:8px;align-items:center;font-size:0.85rem' }, i, t));
        return i;
      });
      return { el: cont2, inps, get: () => inps.filter((i) => i.checked).map((i) => i.value) };
    };
    const fId = campo('Identificador', 'reembolso-pedido-duplicado');
    const fPrompt = campo('Instrucción al agente', 'El cliente 4821 dice que se le cobró dos veces el pedido A-1002. Revisa los cargos y, si procede, reembolsa el duplicado.', true);
    const fTipo = selector('Tipo de agente', [['soporte', 'Atención al cliente'], ['codigo', 'Código'], ['investigacion', 'Investigación'], ['navegador', 'Navegador / uso del ordenador'], ['datos', 'Datos / SQL']], 'soporte');
    const fImagen = campo('Entorno (imagen / fixtures)', 'evals/soporte:1.4 + fixtures/cliente_4821.sql');
    const fTools = checks('Herramientas permitidas', [['buscar_cliente', 'buscar_cliente'], ['listar_cargos', 'listar_cargos'], ['emitir_reembolso', 'emitir_reembolso'], ['enviar_email', 'enviar_email'], ['bash', 'bash'], ['navegador', 'navegador']], ['buscar_cliente', 'listar_cargos', 'emitir_reembolso', 'enviar_email']);
    const fTurnos = numero('Máx. turnos', 25, 1, 500);
    const fTiempo = numero('Timeout (s)', 600, 10, 86400);
    const fK = numero('Ensayos (k)', 5, 1, 100);
    const fGraders = checks('Graders', [['estado', 'Estado de la BD'], ['tests', 'Tests'], ['exacta', 'Respuesta exacta/normalizada'], ['rubrica', 'Rúbrica LLM'], ['trayectoria', 'Restricciones de trayectoria'], ['humano', 'Revisión humana (muestra)']], ['estado', 'rubrica', 'trayectoria']);
    const fRubrica = campo('Criterios de la rúbrica (uno por línea)', 'Explica al cliente qué cargo se reembolsó y cuándo lo verá\nNo promete plazos que la política no permite\nTono profesional y empático', true);
    const fMetricas = checks('Métricas', [['pass_at_1', 'pass@1'], ['pass_pow_k', 'pass^k'], ['turnos', 'nº de turnos'], ['tokens', 'tokens'], ['coste', 'coste'], ['latencia', 'latencia']], ['pass_at_1', 'pass_pow_k', 'turnos', 'coste']);
    const fTags = campo('Etiquetas', 'reembolsos, regresion, prioridad-alta');
    const pre = h('pre', { class: 'w-yaml' });
    const bCopiar = h('button', { class: 'btn peq', type: 'button' }, 'Copiar YAML');
    const avisos = h('div');
    c.append(h('div', { class: 'w-controles' }, fId.el, fTipo.el, fImagen.el, fTurnos.el, fTiempo.el, fK.el), fPrompt.el,
      h('div', { class: 'w-controles' }, fTools.el, fGraders.el, fMetricas.el), fRubrica.el, fTags.el, avisos, pre, h('div', { class: 'fila-botones' }, bCopiar));
    const q = (s) => (/[:#\-{}[\],&*?|>'"%@`]/.test(s) || !s ? JSON.stringify(s) : s);
    const pintar = () => {
      const g = fGraders.get();
      const lineas = [];
      lineas.push(`id: ${q(fId.get())}`);
      lineas.push(`tipo_agente: ${fTipo.get()}`);
      lineas.push('instruccion: |');
      fPrompt.get().split('\n').forEach((l) => lineas.push('  ' + l));
      lineas.push('entorno:');
      lineas.push(`  imagen: ${q(fImagen.get())}`);
      lineas.push('  aislamiento: contenedor_nuevo_por_ensayo');
      lineas.push('  herramientas: [' + fTools.get().join(', ') + ']');
      lineas.push('limites:');
      lineas.push(`  max_turnos: ${fTurnos.get()}`);
      lineas.push(`  timeout_s: ${fTiempo.get()}`);
      lineas.push(`ensayos: ${fK.get()}`);
      lineas.push('graders:');
      if (g.includes('estado')) { lineas.push('  - tipo: estado'); lineas.push('    consulta: "SELECT count(*) FROM reembolsos WHERE pedido = \'A-1002\'"'); lineas.push('    esperado: 1'); lineas.push('    peso: obligatorio'); }
      if (g.includes('tests')) { lineas.push('  - tipo: tests'); lineas.push('    comando: "pytest tests/ocultos -q"'); lineas.push('    peso: obligatorio'); }
      if (g.includes('exacta')) { lineas.push('  - tipo: respuesta_normalizada'); lineas.push('    referencia: "<valor esperado>"'); lineas.push('    normalizar: [minusculas, espacios, numeros]'); }
      if (g.includes('trayectoria')) { lineas.push('  - tipo: trayectoria'); lineas.push('    prohibido: [emitir_reembolso_sin_verificar_cargo]'); lineas.push('    max_llamadas_herramienta: 15'); }
      if (g.includes('rubrica')) {
        lineas.push('  - tipo: rubrica_llm');
        lineas.push('    modelo_juez: "<modelo de otra familia o calibrado>"');
        lineas.push('    criterios:');
        fRubrica.get().split('\n').map((s) => s.trim()).filter(Boolean).forEach((cr) => lineas.push('      - ' + q(cr)));
        lineas.push('    salida: binaria_por_criterio');
      }
      if (g.includes('humano')) { lineas.push('  - tipo: revision_humana'); lineas.push('    muestra: 10%'); }
      lineas.push('metricas: [' + fMetricas.get().join(', ') + ']');
      lineas.push('etiquetas: [' + fTags.get().split(',').map((s) => s.trim()).filter(Boolean).join(', ') + ']');
      pre.textContent = lineas.join('\n');
      const av = [];
      if (!g.length) av.push('Sin graders no hay evaluación: añade al menos uno.');
      if (g.length === 1 && g[0] === 'rubrica') av.push('Solo usas un juez LLM. Si la tarea deja huella en el entorno, añade un grader de estado: es más barato y fiable.');
      if (fK.get() === 1) av.push('Con un solo ensayo no puedes medir consistencia (pass^k) ni separar ruido de señal.');
      if (fTools.get().includes('bash') && !g.includes('trayectoria')) av.push('Con bash disponible, considera restricciones de trayectoria (p. ej. no tocar tests ni el grader).');
      avisos.innerHTML = '';
      if (av.length) avisos.append(h('div', { class: 'callout aviso' }, h('span', { class: 'ct' }, 'Revisa'), h('ul', null, av.map((x) => h('li', null, x)))));
    };
    c.addEventListener('input', pintar);
    c.addEventListener('change', pintar);
    bCopiar.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.textContent); bCopiar.textContent = 'Copiado'; } catch (e) { bCopiar.textContent = 'Selecciona el texto y copia'; }
      setTimeout(() => { bCopiar.textContent = 'Copiar YAML'; }, 1600);
    });
    pintar();
  });
})();
