#!/usr/bin/env node
// Valida uno o varios módulos del curso contra el esquema de curso/AUTHORING.md.
// Uso: node scripts/validar.js curso/modulos/*.js
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const BLOQUES = {
  p: ['html'], h: ['texto'], lista: ['items'], callout: ['variante', 'html'], codigo: ['lenguaje', 'codigo'],
  tabla: ['columnas', 'filas'], flujo: ['pasos'], comparar: ['columnas'], pestanas: ['pestanas'],
  acordeon: ['items'], terminos: ['items'], cita: ['html', 'fuente'], figura: ['svg'], enlaces: ['items'],
  tarjetas: ['items'], pregunta: ['id'], revelar: ['pregunta', 'respuesta'],
  ejercicio: ['id', 'titulo', 'enunciado', 'solucion'], clasificar: ['id', 'instrucciones', 'categorias', 'items'],
  transcript: ['id', 'titulo', 'pasos', 'pregunta', 'culpables', 'explicacion'], checklist: ['id', 'titulo', 'items'],
  widget: ['nombre'], explorador: ['id', 'columnas', 'filas'],
};
const INTERACTIVOS = new Set(['pregunta', 'revelar', 'ejercicio', 'clasificar', 'transcript', 'checklist', 'widget', 'tarjetas', 'explorador']);
const WIDGETS = new Set(['compuesto', 'passk', 'intervalo', 'tamano_muestra', 'varianza', 'pareto', 'combinador',
  'elegir_grader', 'kappa', 'mini_runner', 'constructor_eval']);
const CALLOUTS = new Set(['info', 'clave', 'aviso', 'ejemplo', 'error']);
const LENGUAJES = new Set(['python', 'javascript', 'yaml', 'json', 'bash', 'text']);
const ROLES = new Set(['sistema', 'usuario', 'agente', 'pensamiento', 'herramienta', 'resultado', 'grader']);
const PREGUNTAS = {
  unica: ['pregunta', 'opciones', 'correcta'], multiple: ['pregunta', 'opciones', 'correctas'],
  vf: ['afirmacion', 'correcta'], orden: ['pregunta', 'items'], emparejar: ['pregunta', 'pares'],
  numerica: ['pregunta', 'respuesta', 'tolerancia'],
};

function palabras(s) {
  return String(s).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

function validarPregunta(q, donde, errores, ids) {
  const req = PREGUNTAS[q.tipo];
  if (!req) { errores.push(`${donde}: tipo de pregunta desconocido "${q.tipo}"`); return; }
  for (const k of req) if (q[k] === undefined) errores.push(`${donde}: falta "${k}"`);
  if (!q.explicacion) errores.push(`${donde}: falta "explicacion"`);
  if (q.seccion && ids && !ids.has(q.seccion)) errores.push(`${donde}: seccion "${q.seccion}" no existe`);
  if (q.tipo === 'unica') {
    if (!Array.isArray(q.opciones) || q.opciones.length < 2) errores.push(`${donde}: opciones insuficientes`);
    else if (!(Number.isInteger(q.correcta) && q.correcta >= 0 && q.correcta < q.opciones.length)) errores.push(`${donde}: "correcta" fuera de rango`);
  }
  if (q.tipo === 'multiple') {
    if (!Array.isArray(q.correctas) || !q.correctas.length) errores.push(`${donde}: "correctas" vacío`);
    else if (q.correctas.some((i) => !(Number.isInteger(i) && i >= 0 && i < q.opciones.length))) errores.push(`${donde}: índice en "correctas" fuera de rango`);
  }
  if (q.tipo === 'vf' && typeof q.correcta !== 'boolean') errores.push(`${donde}: "correcta" debe ser booleano`);
  if (q.tipo === 'orden' && (!Array.isArray(q.items) || q.items.length < 3)) errores.push(`${donde}: "items" necesita 3+ elementos`);
  if (q.tipo === 'emparejar') {
    if (!Array.isArray(q.pares) || q.pares.length < 3) errores.push(`${donde}: "pares" necesita 3+ pares`);
    else {
      const ders = q.pares.map((p) => p[1]);
      if (new Set(ders).size !== ders.length) errores.push(`${donde}: las derechas de "pares" deben ser distintas`);
    }
  }
  if (q.tipo === 'numerica' && (typeof q.respuesta !== 'number' || typeof q.tolerancia !== 'number')) errores.push(`${donde}: respuesta/tolerancia deben ser números`);
  if (q.opciones && q.opciones.some((o) => /todas las anteriores|ninguna de las anteriores/i.test(o)) && !q.noMezclar) errores.push(`${donde}: "todas/ninguna de las anteriores" requiere noMezclar: true`);
}

function validarBloques(bloques, donde, ctx) {
  if (!Array.isArray(bloques)) { ctx.errores.push(`${donde}: "bloques" debe ser un array`); return; }
  bloques.forEach((b, i) => {
    const d = `${donde}[${i}:${b && b.tipo}]`;
    if (!b || !BLOQUES[b.tipo]) { ctx.errores.push(`${d}: tipo de bloque desconocido`); return; }
    ctx.stats.bloques[b.tipo] = (ctx.stats.bloques[b.tipo] || 0) + 1;
    if (INTERACTIVOS.has(b.tipo)) ctx.stats.interactivos++;
    if (b.tipo !== 'pregunta') for (const k of BLOQUES[b.tipo]) if (b[k] === undefined) ctx.errores.push(`${d}: falta "${k}"`);
    if (b.id) {
      if (ctx.idsBloque.has(b.id)) ctx.errores.push(`${d}: id duplicado "${b.id}"`);
      ctx.idsBloque.add(b.id);
    }
    // contar palabras de texto
    for (const k of ['html', 'texto', 'enunciado', 'solucion', 'respuesta', 'pregunta', 'explicacion', 'contexto']) {
      if (typeof b[k] === 'string') ctx.stats.palabras += palabras(b[k]);
    }
    if (Array.isArray(b.items)) b.items.forEach((it) => { ctx.stats.palabras += palabras(typeof it === 'string' ? it : JSON.stringify(it)); });
    if (b.tipo === 'tabla') b.filas.forEach((f) => f.forEach((c) => { ctx.stats.palabras += palabras(c); }));
    switch (b.tipo) {
      case 'callout': if (!CALLOUTS.has(b.variante)) ctx.errores.push(`${d}: variante "${b.variante}" no válida`); break;
      case 'codigo': if (!LENGUAJES.has(b.lenguaje)) ctx.errores.push(`${d}: lenguaje "${b.lenguaje}" no válido`); break;
      case 'tabla':
        if (!b.filas.every((f) => Array.isArray(f) && f.length === b.columnas.length)) ctx.errores.push(`${d}: filas con nº de celdas distinto a columnas`);
        break;
      case 'pestanas': b.pestanas.forEach((p, j) => validarBloques(p.bloques, `${d}.pestana${j}`, ctx)); break;
      case 'acordeon': b.items.forEach((p, j) => validarBloques(p.bloques, `${d}.item${j}`, ctx)); break;
      case 'pregunta': {
        // Forma oficial: { tipo: 'pregunta', id, pregunta: { tipo: 'unica', ... } }
        // Forma alternativa: { tipo: 'pregunta', id, tipoPregunta: 'unica', pregunta: '...', ... }
        const q = (b.pregunta && typeof b.pregunta === 'object') ? b.pregunta : Object.assign({}, b, { tipo: b.tipoPregunta });
        validarPregunta(q, d, ctx.errores, ctx.idsSeccion); ctx.stats.checkpoints++; break;
      }
      case 'clasificar':
        b.items.forEach((it, j) => {
          if (!b.categorias.includes(it.categoria)) ctx.errores.push(`${d}.item${j}: categoría "${it.categoria}" no está en categorias`);
          if (!it.explicacion) ctx.errores.push(`${d}.item${j}: falta explicacion`);
        });
        break;
      case 'transcript':
        b.pasos.forEach((p, j) => { if (!ROLES.has(p.rol)) ctx.errores.push(`${d}.paso${j}: rol "${p.rol}" no válido`); });
        if (!Array.isArray(b.culpables) || b.culpables.some((x) => !(x >= 0 && x < b.pasos.length))) ctx.errores.push(`${d}: culpables fuera de rango`);
        break;
      case 'widget': if (!WIDGETS.has(b.nombre)) ctx.errores.push(`${d}: widget "${b.nombre}" no existe`); break;
      case 'comparar': if (!Array.isArray(b.columnas) || b.columnas.length < 2) ctx.errores.push(`${d}: necesita 2+ columnas`); break;
      case 'figura': if (!/viewBox/.test(b.svg)) ctx.errores.push(`${d}: el svg necesita viewBox`); break;
      default: break;
    }
    // HTML prohibido
    const texto = JSON.stringify(b);
    if (/<script|<style|style=\\?"/i.test(texto) && b.tipo !== 'figura' && b.tipo !== 'codigo') ctx.errores.push(`${d}: contiene <script>, <style> o atributo style`);
  });
}

function validarModulo(m, fichero) {
  const errores = [];
  const avisos = [];
  for (const k of ['id', 'numero', 'titulo', 'subtitulo', 'duracion', 'nivel', 'objetivos', 'secciones', 'resumen', 'quiz']) {
    if (m[k] === undefined) errores.push(`falta "${k}"`);
  }
  if (m.id && !/^m\d\d$/.test(m.id)) errores.push(`id "${m.id}" no sigue el formato mNN`);
  const idsSeccion = new Set();
  const ctx = { errores, idsSeccion, idsBloque: new Set(), stats: { palabras: 0, bloques: {}, interactivos: 0, checkpoints: 0 } };
  (m.secciones || []).forEach((s) => {
    if (idsSeccion.has(s.id)) errores.push(`sección duplicada ${s.id}`);
    idsSeccion.add(s.id);
  });
  (m.secciones || []).forEach((s) => validarBloques(s.bloques, s.id, ctx));
  (m.quiz || []).forEach((q, i) => validarPregunta(q, `quiz[${i}]`, errores, idsSeccion));
  if ((m.quiz || []).length < 10) avisos.push(`el test tiene ${(m.quiz || []).length} preguntas (recomendado 10-14)`);
  if (ctx.stats.interactivos < (m.secciones || []).length / 2) avisos.push('pocos bloques interactivos');
  const tipos = {};
  (m.quiz || []).forEach((q) => { tipos[q.tipo] = (tipos[q.tipo] || 0) + 1; });
  return { errores, avisos, stats: ctx.stats, tipos };
}

let total = 0;
let fallos = 0;
const args = process.argv.slice(2);
if (!args.length) { console.error('Uso: node scripts/validar.js curso/modulos/*.js'); process.exit(2); }
for (const f of args) {
  const registrados = [];
  const extras = [];
  const sandbox = {
    registrarModulo: (m) => registrados.push(m),
    registrarExtra: (k, v) => extras.push([k, v]),
    window: {},
    console,
  };
  try {
    vm.runInNewContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f });
  } catch (e) {
    console.log(`✗ ${f}\n   Error de sintaxis/ejecución: ${e.message}`);
    fallos++;
    continue;
  }
  if (!registrados.length && extras.length) {
    console.log(`✓ ${path.basename(f)}: extras ${extras.map((e) => e[0]).join(', ')}`);
    continue;
  }
  for (const m of registrados) {
    total++;
    const r = validarModulo(m, f);
    const ok = !r.errores.length;
    if (!ok) fallos++;
    console.log(`${ok ? '✓' : '✗'} ${path.basename(f)} — ${m.id} "${m.titulo}"`);
    console.log(`   secciones: ${(m.secciones || []).length} · palabras ≈ ${r.stats.palabras} · interactivos: ${r.stats.interactivos} · checkpoints: ${r.stats.checkpoints} · test: ${(m.quiz || []).length} ${JSON.stringify(r.tipos)}`);
    console.log(`   bloques: ${JSON.stringify(r.stats.bloques)}`);
    r.avisos.forEach((a) => console.log(`   ⚠ ${a}`));
    r.errores.forEach((e) => console.log(`   ✗ ${e}`));
  }
}
process.exit(fallos ? 1 : 0);
