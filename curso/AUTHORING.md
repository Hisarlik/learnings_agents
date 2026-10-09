# Guía de autoría de módulos

Cada módulo del curso es un fichero JavaScript en `curso/modulos/` que llama una sola vez a
`registrarModulo({...})`. El motor (`curso/assets/app.js`) se encarga de pintar todo: no escribas
HTML de página, CSS ni lógica; solo **datos**.

Valida siempre tu módulo con:

```bash
node scripts/validar.js curso/modulos/mXX-nombre.js
```

El validador comprueba la sintaxis, el esquema, los tipos de bloque y de pregunta, y muestra
estadísticas (palabras, bloques interactivos, preguntas).

---

## 1. Estructura del módulo

```js
registrarModulo({
  id: 'm03',                    // 'm' + dos dígitos, único
  numero: 3,                    // orden en el curso
  titulo: 'Patrones de agentes y cómo evaluarlos',
  subtitulo: 'Una frase que diga qué vas a ser capaz de hacer al terminar.',
  duracion: '70 min',
  nivel: 'Intermedio',          // 'Básico' | 'Intermedio' | 'Avanzado'
  objetivos: [                  // 4-6 objetivos de aprendizaje, verbos de acción
    'Distinguir workflows de agentes autónomos',
  ],
  secciones: [
    { id: 's1', titulo: 'Título de la sección', bloques: [ /* bloques */ ] },
    { id: 's2', titulo: '...', bloques: [ ] },
  ],
  resumen: [                    // 5-8 ideas clave; se muestran antes del test
    'Evalúa cada componente por separado y el sistema completo.',
  ],
  quiz: [ /* 10-14 preguntas, ver §3 */ ],
});
```

Los `id` de sección son `s1`, `s2`, ... y deben ser únicos dentro del módulo.

---

## 2. Bloques de contenido

Todos los campos `html` aceptan HTML en línea sencillo: `<strong>`, `<em>`, `<code>`, `<br>`,
`<a href="..." target="_blank" rel="noopener">`, `<ul><li>`, `<ol><li>`, `<sub>`, `<sup>`, `<kbd>`.
No uses `<script>`, `<style>`, atributos `style` ni clases propias.

| tipo | campos | qué pinta |
|------|--------|-----------|
| `p` | `html` | Párrafo. |
| `h` | `texto` | Subtítulo dentro de una sección (nivel 3). |
| `lista` | `items: [html]`, `ordenada?: bool` | Lista con viñetas o numerada. |
| `callout` | `variante: 'info'\|'clave'\|'aviso'\|'ejemplo'\|'error'`, `titulo?`, `html` | Caja destacada. `clave` = idea fundamental; `aviso` = trampa habitual; `ejemplo` = caso concreto; `error` = anti-patrón. |
| `codigo` | `lenguaje: 'python'\|'javascript'\|'yaml'\|'json'\|'bash'\|'text'`, `titulo?`, `codigo` | Bloque de código con botón de copiar. `codigo` es texto plano (no HTML). |
| `tabla` | `columnas: [texto]`, `filas: [[html]]`, `titulo?` | Tabla con scroll horizontal en móvil. |
| `flujo` | `titulo?`, `pasos: [{titulo, texto?}]`, `bucle?: texto` | Diagrama de proceso (cajas con flechas). `bucle` dibuja una flecha de retorno con ese texto. |
| `comparar` | `columnas: [{titulo, tono?: 'pass'\|'fail'\|'accent'\|'ink', items: [html]}]` | Tarjetas lado a lado (p. ej. pros/contras, antes/después). 2-4 columnas. |
| `pestanas` | `pestanas: [{titulo, bloques: [...]}]` | Pestañas; cada una contiene bloques (anidables). |
| `acordeon` | `items: [{titulo, bloques: [...]}]` | Desplegables; cada uno contiene bloques. |
| `terminos` | `items: [{termino, html}]` | Lista de definiciones. |
| `cita` | `html`, `fuente` | Cita destacada con su fuente. |
| `figura` | `svg`, `pie?` | SVG en línea propio. Usa `currentColor` y las variables `var(--accent)`, `var(--ink)`, `var(--muted)`, `var(--line)`, `var(--pass)`, `var(--fail)` para que funcione en tema claro y oscuro. Pon siempre `viewBox`. |
| `enlaces` | `items: [{titulo, url, html?}]` | Lista de lecturas recomendadas. |
| `tarjetas` | `items: [{frente, reverso}]` (html) | Flashcards que se giran al pulsar. |

### Bloques interactivos (úsalos a menudo)

| tipo | campos | comportamiento |
|------|--------|----------------|
| `pregunta` | `id` único (p. ej. `'m03-c1'`) + `pregunta`: un **objeto** pregunta del §3 anidado, p. ej. `{ tipo: 'pregunta', id: 'm03-c1', pregunta: { tipo: 'unica', pregunta: '...', opciones: [...], correcta: 0, explicacion: '...' } }` | Pregunta de control en mitad de la lección con corrección inmediata. |
| `revelar` | `pregunta` (html), `respuesta` (html) | "Piensa antes de mirar": muestra la respuesta al pulsar. |
| `ejercicio` | `id`, `titulo`, `enunciado` (html), `pistas?: [html]`, `solucion` (html) | Ejercicio abierto: el alumno escribe en un área de texto (se guarda), puede pedir pistas una a una y luego ver la solución. |
| `clasificar` | `id`, `instrucciones` (html), `categorias: [texto]`, `items: [{texto (html), categoria (texto exacto de categorias), explicacion (html)}]` | El alumno asigna una categoría a cada elemento y comprueba. 5-10 items. |
| `transcript` | `id`, `titulo`, `contexto?` (html), `pasos: [{rol, html, nota?}]`, `pregunta` (html), `culpables: [índices]`, `explicacion` (html) | Transcripción de un agente. El alumno pulsa el/los paso(s) que cree problemáticos y comprueba. `rol`: `'sistema'\|'usuario'\|'agente'\|'pensamiento'\|'herramienta'\|'resultado'\|'grader'`. `nota` se muestra en cada paso tras comprobar. Índices desde 0. |
| `checklist` | `id`, `titulo`, `items: [html]` | Lista de verificación que el alumno marca (se guarda). |
| `widget` | `nombre`, más su configuración | Herramienta interactiva (ver tabla siguiente). |

### Widgets disponibles

| nombre | config (todas opcionales) | qué hace |
|--------|---------------------------|----------|
| `compuesto` | `p: 0.95, pasos: 20` | Fiabilidad por paso elevada al número de pasos: muestra cómo se compone el error en tareas largas. |
| `passk` | `n: 10, c: 6, k: 3` | Calcula pass@k y pass^k (estimadores insesgados) y dibuja ambas curvas en función de k. |
| `intervalo` | `exitosA, nA, exitosB, nB` | Intervalos de Wilson para dos agentes y test de diferencia de proporciones. |
| `tamano_muestra` | `p1: 0.6, p2: 0.7` | Número de tareas necesario para detectar una diferencia con potencia 80 % y α = 0,05. |
| `varianza` | `p: 0.65, n: 50` | Simula ejecutar la misma eval muchas veces y muestra el histograma de puntuaciones observadas. |
| `pareto` | `puntos?: [{nombre, coste, exito}]` | Gráfico coste vs. éxito con frontera de Pareto; el alumno puede activar/desactivar configuraciones. |
| `combinador` | — | Calcula el éxito extremo a extremo de cadenas, routers y votación por mayoría a partir de la fiabilidad de cada componente (suponiendo independencia). |
| `elegir_grader` | — | Asistente de decisión: preguntas → tipo de grader recomendado. |
| `kappa` | `a, b, c, d` | Kappa de Cohen y métricas de acuerdo juez-LLM vs. humano a partir de una tabla 2×2. |
| `mini_runner` | — | Simulador de una eval: agente simulado, varios patrones, k ensayos por tarea, graders, pass@1/pass@k/pass^k y coste. |
| `constructor_eval` | — | Formulario que genera la especificación YAML de una tarea de evaluación. |

Ejemplo:

```js
{ tipo: 'widget', nombre: 'passk', n: 10, c: 4, k: 5 }
```

---

## 3. Preguntas (para `quiz` y para el bloque `pregunta`)

Campos comunes: `tipo`, `explicacion` (html, obligatorio: explica **por qué** la respuesta es correcta
y por qué las otras no), `seccion?` (id de la sección a repasar si se falla, p. ej. `'s3'`).

| tipo | campos |
|------|--------|
| `unica` | `pregunta` (html), `opciones: [html]`, `correcta: índice` |
| `multiple` | `pregunta`, `opciones: [html]`, `correctas: [índices]` |
| `vf` | `afirmacion` (html), `correcta: true\|false` |
| `orden` | `pregunta`, `items: [html]` en el orden **correcto** (se barajan al mostrarse) |
| `emparejar` | `pregunta`, `pares: [[izquierda, derecha]]` (3-6 pares; derechas distintas) |
| `numerica` | `pregunta`, `respuesta: número`, `tolerancia: número`, `unidad?` |

Las opciones de `unica` y `multiple` se barajan. **No** uses "todas las anteriores" ni "ninguna de las
anteriores"; si de verdad lo necesitas, añade `noMezclar: true`.

Reparto recomendado en un test de 12 preguntas: 5-6 `unica`, 2 `multiple`, 2 `vf`, 1 `orden` o
`emparejar`, 0-1 `numerica`. Los distractores deben ser plausibles (errores que comete gente real), no
absurdos.

---

## 4. Guía de estilo

- **Idioma**: español neutro, tuteo ("verás", "piensa"). Términos técnicos en inglés en cursiva la
  primera vez con su explicación (*harness*, *grader*, *transcript*, *pass@k*). Después úsalos con
  naturalidad.
- **Didáctico**: cada concepto con (1) intuición, (2) definición precisa, (3) ejemplo concreto,
  (4) error típico. Usa analogías cuando ayuden.
- **Interactivo**: al menos un bloque interactivo cada dos secciones; mejor uno por sección.
- **Rigor**: no inventes cifras. No pongas puntuaciones del estado del arte (caducan en semanas).
  Cita trabajos por nombre y año (p. ej. "SWE-bench (Jimenez et al., 2023)"). Si no estás seguro de un
  dato (número de tareas, autor), descríbelo de forma cualitativa.
- **Código**: ejemplos cortos, ejecutables o casi, en Python salvo que se indique otra cosa.
- **Strings JS**: usa comillas simples o backticks. Dentro de backticks no escribas `${`. Escapa los
  apóstrofes si usas comillas simples. En `codigo`, usa backticks y escapa los backticks internos.
