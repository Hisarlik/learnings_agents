# Laboratorios del Curso de Evaluación de Agentes de IA

Cinco laboratorios para pasar de la teoría a la práctica: construir un *harness*, comparar
patrones de agente, calibrar un juez LLM, entender la incertidumbre estadística y ver cómo se hace
todo esto con una herramienta real (Inspect AI).

| Lab | Qué construyes | Necesita | Tiempo |
|-----|----------------|----------|--------|
| [01 · Mini harness](lab01_mini_harness/) | Harness con entornos aislados, graders, transcripts, pass@k/pass^k e intervalos | Python 3.10+ | 60-90 min |
| [02 · Comparar patrones](lab02_comparar_patrones/) | Un disparo, ReAct, verificación, voto por mayoría y evaluador-optimizador; McNemar y ablación | Python 3.10+ | 45-60 min |
| [03 · LLM como juez](lab03_llm_juez/) | Rúbrica binaria, calibración contra etiquetas humanas, kappa y sesgo de posición | Python 3.10+ (opcional: `anthropic` + API key) | 45-60 min |
| [04 · Estadística](lab04_estadistica/) | Varianza entre re-ejecuciones, tamaño de muestra y curvas pass@k vs pass^k | Python 3.10+ | 30-45 min |
| [05 · Inspect AI](lab05_inspect_ai/) | Una tarea CTF mínima con sandbox Docker, agente con bash y scorer | Docker + API key | 30-45 min |

Los laboratorios 1, 2 y 4 usan **solo la biblioteca estándar** y un **agente simulado** con
aleatoriedad controlada por semilla: no necesitas API key y los resultados son reproducibles.
El 3 funciona sin API key (con un juez heurístico simulado que avisa de que lo es) y usa un LLM real si
la tienes. El 5 es opcional y necesita Docker y una API key.

## Puesta en marcha

```bash
cd labs
python -m venv .venv
source .venv/bin/activate          # En Windows: .venv\Scripts\activate
python --version                   # 3.10 o superior

# Opcional, solo para el laboratorio 3 con juez real:
pip install -r lab03_llm_juez/requirements.txt
export ANTHROPIC_API_KEY=...        # y opcionalmente: export MODELO_JUEZ=claude-sonnet-4-5

# Opcional, solo para el laboratorio 5:
pip install -r lab05_inspect_ai/requirements.txt
```

## Cómo ejecutar cada laboratorio

```bash
# Lab 1: harness + agente simulado
cd lab01_mini_harness
python ejecutar.py --trials 5 --seed 0 --agente basico
python ejecutar.py --trials 5 --seed 0 --agente con_verificacion
python ejecutar.py --trials 5 --agente basico --ver fs-01        # lee un transcript fallido
python -m unittest                                              # pruebas de métricas y graders

# Lab 2: comparar patrones
cd ../lab02_comparar_patrones
python comparar.py                                              # 12 tareas × 10 ensayos × 5 patrones
python comparar.py --comparar react_verificacion voto_mayoria_3

# Lab 3: juez LLM
cd ../lab03_llm_juez
python calibrar.py --pareado            # juez real si hay API key; si no, simulado (con aviso)
python calibrar.py --simulado --pareado

# Lab 4: estadística
cd ../lab04_estadistica
python varianza_reruns.py
python tamano_muestra.py
python curvas_passk.py

# Lab 5: Inspect AI (requiere Docker y API key)
cd ../lab05_inspect_ai
inspect eval tarea_ctf.py --model anthropic/claude-sonnet-4-5
inspect view
```

## Qué salida esperar

* **Lab 1**: una tabla por tarea (éxitos, pass@1, pass@k, pass^k, pasos, coste, grader que más
  falla) y un resumen con la tasa de éxito, dos intervalos de confianza (Wilson ingenuo y bootstrap
  por tareas), errores estándar ingenuo y agrupado, pass@k/pass^k para varios k y coste simulado.
  Con `--seed 0 --trials 5` el agente `basico` obtiene 0,733 y `con_verificacion` 0,817.
* **Lab 2**: cinco patrones con sus tasas de éxito, pass^k, coste por ensayo y por éxito; éxito por
  tipo de tarea; modos de fallo; tabla 2×2 + McNemar exacto; y la ablación de la verificación.
* **Lab 3**: matriz de confusión juez vs. humano, acuerdo, TPR, TNR, kappa, sesgo de la puntuación y
  la lista de desacuerdos para leer. En modo simulado: acuerdo 0,688 y kappa 0,375.
* **Lab 4**: histogramas ASCII, tablas de tamaño de muestra y curvas pass@k/pass^k.
* **Lab 5**: un log de Inspect con 3 muestras; `inspect view` muestra cada transcript.

Los ficheros generados se guardan en `resultados/` dentro de cada laboratorio (ignorados por git).

## Ejercicios sugeridos (transversales)

1. **Añade una tarea** a `lab01_mini_harness/tareas.json` con estado (por ejemplo, renombrar
   ficheros) y al menos dos graders: uno de estado y otro de trayectoria. Ejecuta y lee un transcript.
2. **Encuentra un grader injusto**: localiza un caso en el que una respuesta razonable suspende por
   formato. Decide si el problema está en el enunciado, en el grader o en el agente, y arréglalo.
3. **Rompe el aislamiento** con `--compartir-entorno` y explica qué tareas cambian y por qué.
4. **Compara dos patrones con rigor**: elige dos en el lab 2, sube `--trials` hasta que el IC de la
   diferencia no contenga el 0 (o concluye que no hay diferencia detectable) y estima el coste.
5. **Mejora el juez** del lab 3 y vuelve a calibrar. ¿Cuánto sube kappa? ¿Te arriesgas a sobreajustar
   a 16 ejemplos? Propón cómo separar ejemplos de desarrollo y de prueba.
6. **Lleva una tarea del lab 1 a Inspect** (lab 5): conjunto de datos, solver y scorer.
