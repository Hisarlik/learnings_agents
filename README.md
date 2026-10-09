# Curso interactivo: Evaluación de Agentes de IA

Un curso extenso y práctico, en español, para aprender a **evaluar agentes de IA**: desde el
vocabulario básico hasta el diseño de una suite completa, pasando por los patrones de agentes y sus
combinaciones, los *harnesses*, los benchmarks públicos y todas las formas de puntuar lo que hace un
agente (tests, comprobaciones de estado, jueces LLM y revisión humana).

Es muy interactivo: cada módulo combina explicación con preguntas de control, ejercicios de
clasificación, análisis de *transcripts* reales de agentes (encuentra el paso donde algo falla),
calculadoras y simuladores, ejercicios abiertos con pistas y solución, y un test final con
corrección explicada. Al final hay un caso práctico integrador y un examen.

## Cómo abrirlo

- **Directamente**: abre `curso/index.html` en el navegador (doble clic). No necesita servidor ni
  instalación.
- **Con servidor local** (opcional): `cd curso && python3 -m http.server 8000` y visita
  <http://localhost:8000>.
- **Versión de un solo fichero**: `dist/curso-evaluacion-agentes.html` contiene todo el curso
  (CSS y JS en línea).

El progreso, las notas de los tests, las checklists y los borradores de los ejercicios se guardan en
el `localStorage` de tu navegador.

## Contenido

| # | Módulo | Qué aprendes |
|---|--------|--------------|
| 01 | ¿Por qué evaluar agentes es diferente? | No determinismo, composición del error, tipos de evaluación, modelo del queso suizo |
| 02 | Anatomía de una evaluación | Tarea, ensayo, transcript, outcome, grader, suite, eval harness vs. agent harness |
| 03 | Patrones de agentes y sus combinaciones | Chaining, routing, paralelización, orquestador-trabajadores, evaluador-optimizador, ReAct, multiagente; evaluación por componentes, ablaciones, oráculos, MAST |
| 04 | Harnesses | Anatomía del agent harness, ACI, por qué el harness cambia la nota, Inspect AI, Harbor, aislamiento y reproducibilidad |
| 05 | Benchmarks | Catálogo filtrable (SWE-bench, Terminal-Bench, τ-bench, WebArena, OSWorld, GAIA…), lectura crítica, contaminación, leaderboards |
| 06 | Graders | Graders de código, jueces LLM (rúbricas, pares, sesgos, calibración), humanos, resultado vs. trayectoria, crédito parcial |
| 07 | Evaluar según el tipo de tarea | Código, conversacional, investigación, navegador, RAG, SQL, tareas abiertas, larga duración, multiagente, seguridad |
| 08 | Métricas y estadística | pass@k, pass^k, varianza, intervalos de Wilson, errores agrupados, McNemar, tamaño de muestra, Pareto coste-éxito |
| 09 | Diseña tu propia suite | Hoja de ruta paso a paso, CI/CD, capacidad vs. regresión, producción |
| 10 | Trampas y reward hacking | Bugs de graders, fugas de entorno, ruido de infraestructura, specification gaming, Goodhart |
| 11 | Laboratorio práctico | Ejecuta los labs de Python y el simulador de evals en el navegador |
| CF | Caso final | Evalúa de principio a fin un agente de gastos de viaje |
| EX | Examen final | Preguntas barajadas de todo el curso con desglose por módulo |

Además: **glosario** con buscador y **recursos** con lecturas recomendadas.

### Herramientas interactivas incluidas

Calculadora de composición del error · calculadora pass@k / pass^k · intervalos de confianza y
comparación de agentes · tamaño de muestra · simulador de varianza · frontera de Pareto coste-éxito ·
combinador de patrones (cadenas, routers, votación) · asistente para elegir grader · kappa de Cohen
juez vs. humano · mini-runner de evaluaciones con agente simulado · constructor de especificaciones
YAML de tareas.

## Laboratorios en Python

La carpeta [`labs/`](labs/README.md) contiene laboratorios ejecutables (solo biblioteca estándar,
sin necesidad de clave de API salvo el opcional del juez LLM):

1. Un mini *eval harness* completo con agente simulado, graders y métricas.
2. Comparación de patrones de agente con test de McNemar y ablación.
3. Juez LLM con rúbrica y calibración frente a etiquetas humanas (kappa).
4. Estadística: varianza entre ejecuciones, potencia, curvas pass@k / pass^k.
5. Una tarea de ejemplo con Inspect AI (requiere Docker y clave de API).

## Estructura del repositorio

```
curso/
  index.html          # generado por scripts/build.py
  assets/             # motor (app.js), widgets.js y estilos
  modulos/            # un fichero de datos por módulo + extras.js (glosario, recursos, caso, examen)
  AUTHORING.md        # esquema para escribir o ampliar módulos
dist/                 # versión de un solo fichero
labs/                 # laboratorios en Python
scripts/
  validar.js          # valida módulos contra el esquema
  build.py            # genera curso/index.html y dist/
```

## Ampliar el curso

1. Lee `curso/AUTHORING.md`.
2. Crea o edita un fichero en `curso/modulos/`.
3. Valida: `node scripts/validar.js curso/modulos/*.js`.
4. Regenera: `python3 scripts/build.py`.

## Nota sobre el contenido

El catálogo de benchmarks y herramientas refleja el estado del campo hasta mediados de 2026. No se
incluyen puntuaciones del estado del arte a propósito, porque caducan en semanas: consulta la página
oficial de cada benchmark. Los datos numéricos de los ejemplos y simuladores son ficticios e
ilustrativos salvo que se cite su fuente.
