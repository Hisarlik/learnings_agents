# Laboratorio 1 · Un mini *harness* de evaluación

Objetivo: construir y entender, pieza a pieza, un *harness* de evaluación de agentes: tareas,
entorno aislado, agente, *graders*, *transcripts*, métricas e intervalos de confianza. Todo con la
biblioteca estándar y un agente **simulado** (sin API key, reproducible con semilla).

## Estructura

| Fichero | Papel |
|---------|-------|
| `tareas.json` | 12 tareas: aritmética, texto, JSON, fechas, sistema de ficheros (estado) y uso de herramientas. Cada una con su solución de referencia, sus errores realistas y sus graders. |
| `entorno.py` | `Entorno` (sistema de ficheros falso + herramientas + contador de pasos) y `Registro` (transcript + tokens). |
| `agente_simulado.py` | Agente que "decide" con una moneda trucada por tarea, ejecuta acciones reales contra el entorno y comete errores realistas. Perfiles `basico` y `con_verificacion`. |
| `graders.py` | `exacto`, `numerico`, `regex`, `json_esquema`, `estado_fs`, `llamada_herramienta`, `trayectoria`. |
| `harness.py` | Ejecuta tareas × k ensayos con entorno nuevo por ensayo, límite de pasos, semillas derivadas y JSONL de transcripts. |
| `metricas.py` | pass@k y pass^k insesgados, Wilson, bootstrap por tareas, EE agrupado, McNemar exacto. |
| `ejecutar.py` | CLI: tabla por tarea + resumen. |
| `tests/` | Pruebas `unittest` de métricas y graders. |

## Ejecutar

```bash
python ejecutar.py --trials 5 --seed 0 --agente basico
python ejecutar.py --trials 5 --seed 0 --agente con_verificacion
python ejecutar.py --trials 5 --agente basico --ver fs-01     # imprime un transcript fallido
python ejecutar.py --trials 5 --agente basico --compartir-entorno   # experimento: sin aislamiento
python -m unittest -v
```

Opciones: `--max-pasos` (límite de llamadas a herramientas, por defecto 12), `--tareas`, `--salida`.

## Salida esperada (agente `basico`, semilla 0, 5 ensayos)

```text
Tarea     Tipo           Éxitos  pass@1  pass@5  pass^5  Pasos  Coste/ens.  Fallo más común
arit-01   aritmetica        4/5    0.80    1.00    0.00    0.0     0.00288  numerico (1)
...
fs-03     archivos          2/5    0.40    1.00    0.00    3.0     0.01608  estado_fs (2)
tool-01   herramientas      3/5    0.60    1.00    0.00    0.8     0.00603  numerico (2)

RESUMEN  agente=basico  (12 tareas × 5 ensayos = 60 ensayos)
  pass@1 (tasa de éxito media): 0.733
    IC95% Wilson (trata los 60 ensayos como independientes): [0.610, 0.829]
    IC95% bootstrap remuestreando tareas:                  [0.633, 0.833]
    EE ingenuo: 0.058   EE agrupado por tarea: 0.051
  k   pass@k   pass^k
  1    0.733    0.733
  2    0.942    0.525
  3    0.992    0.367
  5    1.000    0.167
```

Con `con_verificacion` la tasa sube a 0,817 y el coste por ensayo pasa de 0,00637 a 0,00923 (dólares
**ficticios**: los precios por token de `harness.py` son inventados y solo sirven para comparar).

## Ideas de diseño que debes encontrar en el código

1. **Aislamiento**: `Entorno(tarea["fs_inicial"])` hace una copia profunda en cada ensayo.
2. **Graders de estado**: `estado_fs` mira el sistema de ficheros final, no lo que el agente *dice*.
   Así se cazan los "éxitos falsos" ("Hecho: he movido todos los .log" cuando falta uno).
3. **Graders de camino**: `trayectoria` suspende si se usa una herramienta prohibida aunque el
   resultado final sea correcto (tarea `fs-03`).
4. **Timeout**: `LimiteDePasosExcedido` corta los bucles; el ensayo cuenta como fallo.
5. **Semillas derivadas**: `random.Random(f"{semilla}:{tarea}:{ensayo}")`. Dos agentes ven la misma
   secuencia en el mismo ensayo: sus resultados se pueden comparar *por pares*.
6. **`modo_interno`**: solo existe porque es una simulación (la verdad sobre qué error cometió el
   agente). En un sistema real tendrías que deducirlo **leyendo transcripts**.

## Preguntas y ejercicios

1. En la tabla, ¿por qué casi todas las tareas tienen pass@5 = 1,00 y pass^5 = 0,00? ¿Qué te dice
   cada columna sobre si pondrías este agente en producción?
2. Ejecuta con `--seed 0` y con `--seed 1..3`. En la semilla 0 el EE agrupado sale *menor* que el
   ingenuo; en las otras, mayor. ¿Por qué puede pasar con solo 12 tareas? ¿Cuál deberías reportar?
3. Con `--seed 5 --ver tool-01`, `tool-01` falla con "no es un número: 'El resultado es 7.005.653'" aunque el agente usó bien la calculadora. ¿Es un fallo del agente
   o del grader? Argumenta según el enunciado de la tarea.
4. Con `--compartir-entorno`, `fs-03` pasa de 2/5 a 3/5 sin que el agente haya mejorado. Explica por qué
   leyendo el transcript (`--ver fs-03`).
5. Añade un grader `contiene` (la respuesta contiene un texto) y úsalo en una tarea nueva. Escribe su
   prueba en `tests/test_graders.py`.
6. Baja `--max-pasos` a 3. ¿Qué tareas empiezan a fallar y por qué? ¿Es justo ese límite?
7. Sube `--trials` a 20 y compara la anchura de los intervalos con 5 ensayos. ¿Se estrecha igual el
   intervalo bootstrap por tareas que el de Wilson? ¿Por qué no?
