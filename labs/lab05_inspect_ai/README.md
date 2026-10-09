# Laboratorio 5 · Inspect AI: una eval agéntica real

> **Requisitos**: Docker instalado y en marcha, y una API key del proveedor del modelo
> (por ejemplo `ANTHROPIC_API_KEY`). Ejecutarlo **cuesta dinero** (pocas llamadas, pero reales).
> Este laboratorio no se puede hacer en modo simulado.

[Inspect AI](https://inspect.aisi.org.uk/) es un framework de código abierto del UK AI Security
Institute para escribir evals. Aquí verás en una herramienta real las mismas piezas que construiste
a mano en el laboratorio 1:

| Lab 1 (a mano) | Inspect AI |
|----------------|------------|
| `tareas.json` | `dataset=[Sample(input=..., target=..., files=...)]` |
| `AgenteSimulado` | `solver=basic_agent(...)` o `react(...)` |
| herramientas del `Entorno` | `tools=[bash(timeout=60)]` |
| `Entorno(fs_inicial)` por ensayo | `sandbox=("docker", "compose.yaml")` + `files` de cada muestra |
| `--max-pasos` | `message_limit=30` (también hay `token_limit`, `time_limit`...) |
| graders | `scorer=includes()` (y muchos más: `match`, `model_graded_qa`...) |
| `--trials k` | `--epochs k` y reductores (`mean`, `max`, `at_least_k`, `pass_at_k`) |
| `transcripts.jsonl` | logs de Inspect + `inspect view` |

## Ficheros

* `tarea_ctf.py`: 3 retos tipo CTF (fichero oculto, mensaje en base64, contar líneas ERROR de un log
  con trampas). Define tres tareas: `ctf_mini` (`basic_agent`), `ctf_mini_react` (`inspect_ai.agent.react`,
  versiones recientes) y `ctf_mini_fiabilidad` (3 épocas).
* `compose.yaml`: contenedor `python:3.12-bookworm` **sin red**, 1 CPU y 512 MB.
* `requirements.txt`: `inspect-ai` y `anthropic`.

## Pasos

```bash
pip install -r requirements.txt
docker info                                   # comprueba que Docker responde
export ANTHROPIC_API_KEY=...

inspect eval tarea_ctf.py --model anthropic/claude-sonnet-4-5          # tarea ctf_mini
inspect eval tarea_ctf.py@ctf_mini_react --model anthropic/claude-sonnet-4-5
inspect eval tarea_ctf.py@ctf_mini_fiabilidad --model anthropic/claude-sonnet-4-5
inspect eval tarea_ctf.py --model anthropic/claude-sonnet-4-5 --epochs 5 --epochs-reducer mean,max,at_least_5

inspect view                                  # abre el visor de logs en el navegador
```

Sustituye `claude-sonnet-4-5` por el modelo que quieras evaluar (cualquier proveedor soportado por
Inspect). Los nombres de parámetros pueden cambiar entre versiones: si algo falla, consulta
`inspect eval --help` y la documentación de tu versión.

## Qué mirar en `inspect view`

1. La puntuación por muestra y el *accuracy* global.
2. El transcript de cada muestra: ¿qué comandos ejecutó el agente? ¿Usó `ls -la` en el reto 1?
   ¿Usó `grep -cw ERROR` o contó también "ERRORES" y "error" en el reto 3?
3. Tokens y tiempo por muestra (coste).
4. Con épocas: las muestras que pasan unas veces sí y otras no (inestabilidad → pass^k bajo).

## Ejercicios

1. ¿Por qué `includes()` es un scorer arriesgado para el reto 3? (Pista: ¿qué pasa si el agente
   envía "FLAG{17} o FLAG{18}"?) Propón un scorer más estricto (por ejemplo `match` o uno propio).
2. Quita `network_mode: none` del `compose.yaml`. ¿Qué riesgo introduces en una eval con bash?
3. Ejecuta `ctf_mini_fiabilidad`. Compara `max` (≈ pass@3) con `at_least_3` (≈ pass^3).
4. Porta la tarea `fs-01` del laboratorio 1 a Inspect: ficheros con `files`, solver con `bash`, y un
   scorer propio que compruebe el **estado** del sandbox (`sandbox().exec(["ls", ...])`) en vez de la
   respuesta del agente.
