# Laboratorio 3 · LLM como juez: rúbrica y calibración

Objetivo: construir un juez con una **rúbrica de criterios binarios** para respuestas cortas de un
agente de investigación y **calibrarlo** contra etiquetas humanas antes de fiarte de él.

## Ficheros

| Fichero | Contenido |
|---------|-----------|
| `datos.jsonl` | 16 ejemplos (8 preguntas × 2 respuestas) con fuentes, respuesta del agente, etiqueta humana (`pass`/`fail`) y una nota que la justifica. Incluye casos trampa: afirmación segura pero falsa, respuesta correcta pero verbosa, correcta con otro formato (12480 vs 12.480, 14/05/1996), sin citas, inferencia no respaldada y abstención correcta. |
| `juez.py` | Plantillas de prompt, juez real (Anthropic Messages API) y juez simulado (heurístico, sin LLM). Modo pareado. |
| `calibrar.py` | Ejecuta el juez, calcula acuerdo, TPR, TNR, kappa de Cohen y sesgo de la puntuación; lista los desacuerdos; prueba de intercambio de posiciones. |

## La rúbrica

Tres criterios binarios; el **código** (no el modelo) decide: `pass` solo si los tres son "si".

* **responde**: contesta directamente (o dice explícitamente que las fuentes no tienen el dato).
* **fiel**: todas las afirmaciones están respaldadas por las fuentes; un cambio de formato no es error.
* **cita**: cita al menos una fuente con `[n]` y esa fuente respalda lo afirmado.

## Ejecutar

```bash
python calibrar.py --simulado --pareado         # sin API key (juez heurístico, con aviso)

pip install -r requirements.txt                 # para el juez real
export ANTHROPIC_API_KEY=...
export MODELO_JUEZ=<id-del-modelo>              # obligatorio con el juez real
python calibrar.py --pareado
python calibrar.py --reusar                     # recalcula métricas sin volver a llamar a la API
```

Los juicios se guardan en `resultados/juicios.jsonl`.

## Salida esperada (juez simulado)

```text
                  juez pass   juez fail
  humano pass             7           1
  humano fail             4           4

  Acuerdo (accuracy): 0.688   IC95% Wilson [0.44, 0.86]  (n = 16: ¡intervalo ancho!)
  TPR (sensibilidad): 0.875
  TNR (especificidad): 0.500
  Kappa de Cohen:     0.375
  Tasa de pass según humanos: 0.500   según el juez: 0.688   (sesgo de la puntuación: +0.188)
```

y, con `--pareado`, 5 de 8 comparaciones **inconsistentes** al intercambiar el orden (el juez
simulado tiene sesgo de posición a propósito). Con un juez LLM real los números serán otros: mídelos.

## Preguntas y ejercicios

1. El juez simulado tiene TPR alta y TNR baja. ¿Qué consecuencia tiene sobre la tasa de éxito que
   reportarías de tu agente? Relaciónalo con el "sesgo de la puntuación".
2. Lee los 4 falsos positivos. ¿Qué tienen en común? ¿Qué criterio de la rúbrica debería haberlos
   cazado y por qué una heurística de "buscar números y nombres en las fuentes" no puede?
3. `q5a` es un falso negativo por formato de fecha. ¿Lo arreglarías en el juez, en la rúbrica o
   normalizando antes de juzgar?
4. Con API key: ejecuta el juez real. ¿Mejora kappa? ¿Qué desacuerdos quedan? ¿Alguno te hace dudar
   de la **etiqueta humana**?
5. Modifica `PLANTILLA_JUICIO` (por ejemplo, pide citar literalmente el fragmento de la fuente que
   respalda cada afirmación) y vuelve a calibrar. ¿Cómo evitarías sobreajustar el prompt a estos 16
   ejemplos? Propón una partición desarrollo/prueba.
6. ¿Por qué un veredicto que cambia al intercambiar A y B debe contarse como empate?
