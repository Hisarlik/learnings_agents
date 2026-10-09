"""Harness de evaluación: ejecuta tareas × k ensayos, califica y guarda transcripts.

Responsabilidades del harness (y no del agente):

1. **Aislamiento**: un ``Entorno`` NUEVO por ensayo, copiado del estado inicial
   de la tarea. Ningún ensayo ve los efectos de otro.
2. **Límites**: el entorno corta al agente si supera ``max_pasos`` (nuestro
   "timeout"). Un ensayo cortado cuenta como fallo.
3. **Reproducibilidad**: la semilla de cada ensayo se deriva de
   (semilla global, tarea, nº de ensayo). Dos agentes distintos ven la misma
   secuencia aleatoria en el mismo ensayo (*números aleatorios comunes*), lo
   que hace más precisas las comparaciones pareadas.
4. **Registro**: guarda cada ensayo (transcript incluido) en JSONL para poder
   leerlo después. ¡Leer transcripts es parte del trabajo!
5. **Robustez**: si el agente lanza una excepción inesperada, se registra como
   fallo del ensayo en vez de tumbar toda la eval.
"""
from __future__ import annotations

import json
import random
from pathlib import Path

from entorno import Entorno, LimiteDePasosExcedido, Registro
from graders import calificar

# Precios FICTICIOS por millón de tokens, solo para comparar configuraciones entre sí.
PRECIO_ENTRADA_MTOK = 3.0
PRECIO_SALIDA_MTOK = 15.0


def cargar_tareas(ruta: str | Path) -> list[dict]:
    with open(ruta, encoding="utf-8") as f:
        tareas = json.load(f)
    ids = [t["id"] for t in tareas]
    if len(ids) != len(set(ids)):
        raise ValueError("hay ids de tarea repetidos")
    return tareas


def coste(registro: Registro) -> float:
    return (registro.tokens_entrada * PRECIO_ENTRADA_MTOK + registro.tokens_salida * PRECIO_SALIDA_MTOK) / 1e6


def ejecutar_ensayo(tarea: dict, agente, ensayo: int, semilla: int, max_pasos: int = 12,
                    entorno: Entorno | None = None) -> dict:
    """Ejecuta UN ensayo de una tarea y devuelve un registro serializable."""
    rng = random.Random(f"{semilla}:{tarea['id']}:{ensayo}")
    if entorno is None:  # lo normal: entorno limpio para cada ensayo
        entorno = Entorno(tarea.get("fs_inicial"), max_pasos=max_pasos)
    registro = Registro(tokens_sistema=getattr(getattr(agente, "perfil", None), "tokens_sistema", 400))

    respuesta, terminado_por = None, "respuesta"
    try:
        respuesta = agente.resolver(tarea, entorno, registro, rng)
    except LimiteDePasosExcedido as exc:
        terminado_por = "limite_pasos"
        registro.eventos.append({"tipo": "error_harness", "texto": f"Ensayo cortado: {exc}"})
    except Exception as exc:  # noqa: BLE001 - un fallo del agente no debe tumbar la eval
        terminado_por = "excepcion"
        registro.eventos.append({"tipo": "error_harness", "texto": f"{type(exc).__name__}: {exc}"})

    salida = {
        "respuesta": respuesta,
        "fs": entorno.fs,
        "fs_inicial": tarea.get("fs_inicial", {}),
        "llamadas": entorno.llamadas,
        "pasos": entorno.pasos,
    }
    resultados_graders = calificar(tarea, salida)
    exito = terminado_por == "respuesta" and all(r.aprobado for r in resultados_graders)

    return {
        "tarea_id": tarea["id"],
        "tipo": tarea["tipo"],
        "agente": getattr(agente, "nombre", type(agente).__name__),
        "ensayo": ensayo,
        "semilla": semilla,
        "exito": exito,
        "terminado_por": terminado_por,
        "graders": [r.a_dict() for r in resultados_graders],
        "respuesta_final": respuesta,
        "pasos": entorno.pasos,
        "llamadas_modelo": registro.llamadas_modelo,
        "tokens_entrada": registro.tokens_entrada,
        "tokens_salida": registro.tokens_salida,
        "coste": coste(registro),
        # Solo existe porque es una simulación: qué error "decidió" cometer el agente.
        "modo_interno": registro.meta.get("modo_interno"),
        "transcript": registro.eventos,
    }


def ejecutar_eval(tareas: list[dict], agente, k: int = 5, semilla: int = 0, max_pasos: int = 12,
                  ruta_transcripts: str | Path | None = None, compartir_entorno: bool = False) -> list[dict]:
    """Ejecuta todas las tareas k veces.

    ``compartir_entorno=True`` reutiliza el MISMO entorno para todos los ensayos
    de una tarea. Es un error de aislamiento deliberado para el experimento del
    README: verás cómo cambian los resultados de las tareas con estado.
    """
    resultados = []
    for tarea in tareas:
        compartido = Entorno(tarea.get("fs_inicial"), max_pasos=max_pasos) if compartir_entorno else None
        for ensayo in range(k):
            if compartido is not None:
                compartido.pasos, compartido.llamadas = 0, []  # el "timeout" sí se reinicia
            resultados.append(ejecutar_ensayo(tarea, agente, ensayo, semilla, max_pasos, entorno=compartido))

    if ruta_transcripts:
        ruta = Path(ruta_transcripts)
        ruta.parent.mkdir(parents=True, exist_ok=True)
        with open(ruta, "w", encoding="utf-8") as f:
            for r in resultados:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
    return resultados


def agrupar_por_tarea(resultados: list[dict]) -> dict[str, list[dict]]:
    grupos: dict[str, list[dict]] = {}
    for r in resultados:
        grupos.setdefault(r["tarea_id"], []).append(r)
    return grupos
