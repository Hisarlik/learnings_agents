"""Graders (calificadores) deterministas.

Cada grader recibe su configuración (la parte de ``tareas.json``) y la *salida*
del ensayo, y devuelve un ``ResultadoGrader`` con un veredicto binario y un
detalle legible (el detalle es lo que te ayudará a depurar al leer resultados).

La salida de un ensayo es un dict con:
    respuesta      -> str | None   (respuesta final del agente)
    fs             -> dict         (estado final del sistema de ficheros)
    fs_inicial     -> dict         (estado inicial, para comprobar "intactos")
    llamadas       -> list[dict]   (herramientas usadas, en orden)
    pasos          -> int          (número de llamadas a herramientas)

Fíjate en qué mira cada grader:
    * exacto, numerico, regex, json_esquema -> la RESPUESTA (texto)
    * estado_fs                             -> el RESULTADO en el entorno
    * llamada_herramienta, trayectoria      -> el CAMINO (transcript)
"""
from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass


@dataclass
class ResultadoGrader:
    nombre: str
    aprobado: bool
    detalle: str = ""

    def a_dict(self) -> dict:
        return asdict(self)


# --------------------------------------------------------------- utilidades
def normalizar_texto(texto: str, opciones: list[str]) -> str:
    """Normalizaciones opcionales. Cuantas más apliques, más permisivo es el grader."""
    if "espacios" in opciones:
        texto = " ".join(texto.split())
    if "minusculas" in opciones:
        texto = texto.lower()
    if "puntuacion_final" in opciones:
        texto = texto.rstrip(".!?;: ")
    return texto


def parsear_numero(texto: str) -> float | None:
    """Convierte '14', ' 822,80 ' o '822.8' en float. Rechaza '14 €' o '7.005.653'."""
    limpio = texto.strip().replace(" ", "")
    if "," in limpio and "." not in limpio:
        limpio = limpio.replace(",", ".")  # coma decimal
    try:
        return float(limpio)
    except ValueError:
        return None


_TIPOS_JSON = {
    "str": lambda v: isinstance(v, str),
    "int": lambda v: isinstance(v, int) and not isinstance(v, bool),
    "float": lambda v: isinstance(v, (int, float)) and not isinstance(v, bool),
    "bool": lambda v: isinstance(v, bool),
    "list": lambda v: isinstance(v, list),
    "dict": lambda v: isinstance(v, dict),
}


# ------------------------------------------------------- graders de respuesta
def grader_exacto(cfg: dict, salida: dict) -> ResultadoGrader:
    respuesta = salida.get("respuesta")
    if respuesta is None:
        return ResultadoGrader("exacto", False, "sin respuesta final")
    opciones = cfg.get("normalizar", [])
    obtenido = normalizar_texto(respuesta, opciones)
    esperado = normalizar_texto(cfg["esperado"], opciones)
    ok = obtenido == esperado
    return ResultadoGrader("exacto", ok, "" if ok else f"esperado {esperado!r}, obtenido {obtenido!r}")


def grader_numerico(cfg: dict, salida: dict) -> ResultadoGrader:
    respuesta = salida.get("respuesta")
    if respuesta is None:
        return ResultadoGrader("numerico", False, "sin respuesta final")
    valor = parsear_numero(respuesta)
    if valor is None:
        return ResultadoGrader("numerico", False, f"no es un número: {respuesta!r}")
    ok = abs(valor - cfg["esperado"]) <= cfg.get("tolerancia", 0)
    return ResultadoGrader("numerico", ok, "" if ok else f"esperado {cfg['esperado']}, obtenido {valor}")


def grader_regex(cfg: dict, salida: dict) -> ResultadoGrader:
    respuesta = salida.get("respuesta")
    if respuesta is None:
        return ResultadoGrader("regex", False, "sin respuesta final")
    ok = re.fullmatch(cfg["patron"], respuesta.strip()) is not None
    return ResultadoGrader("regex", ok, "" if ok else f"{respuesta!r} no encaja con /{cfg['patron']}/")


def grader_json_esquema(cfg: dict, salida: dict) -> ResultadoGrader:
    """Comprobación de esquema "casera": claves, tipos y (opcional) valores."""
    respuesta = salida.get("respuesta")
    if respuesta is None:
        return ResultadoGrader("json_esquema", False, "sin respuesta final")
    try:
        datos = json.loads(respuesta)
    except json.JSONDecodeError as exc:
        return ResultadoGrader("json_esquema", False, f"JSON inválido ({exc.msg})")
    if not isinstance(datos, dict):
        return ResultadoGrader("json_esquema", False, "se esperaba un objeto JSON")
    problemas = []
    for clave, tipo in cfg.get("campos", {}).items():
        if clave not in datos:
            problemas.append(f"falta '{clave}'")
        elif not _TIPOS_JSON[tipo](datos[clave]):
            problemas.append(f"'{clave}' debería ser {tipo}, es {type(datos[clave]).__name__}")
    if not cfg.get("permitir_adicionales", True):
        sobran = set(datos) - set(cfg.get("campos", {}))
        if sobran:
            problemas.append(f"claves no permitidas: {sorted(sobran)}")
    for clave, valor in cfg.get("valores", {}).items():
        if clave in datos and datos[clave] != valor:
            problemas.append(f"'{clave}' = {datos[clave]!r}, se esperaba {valor!r}")
    return ResultadoGrader("json_esquema", not problemas, "; ".join(problemas))


# ------------------------------------------------------ graders de resultado
def grader_estado_fs(cfg: dict, salida: dict) -> ResultadoGrader:
    """Comprueba el ESTADO final del entorno, no lo que el agente dice que hizo."""
    fs, fs_inicial = salida["fs"], salida.get("fs_inicial", {})
    problemas = []
    for ruta in cfg.get("existe", []):
        if ruta not in fs:
            problemas.append(f"falta {ruta}")
    for ruta in cfg.get("no_existe", []):
        if ruta in fs:
            problemas.append(f"sobra {ruta}")
    for ruta in cfg.get("intactos", []):
        if fs.get(ruta) != fs_inicial.get(ruta):
            problemas.append(f"{ruta} se ha modificado")
    for ruta, esperado in cfg.get("contenido_json", {}).items():
        try:
            if json.loads(fs.get(ruta, "")) != esperado:
                problemas.append(f"{ruta} tiene un contenido distinto del esperado")
        except json.JSONDecodeError:
            problemas.append(f"{ruta} no es JSON válido")
    return ResultadoGrader("estado_fs", not problemas, "; ".join(problemas))


# -------------------------------------------------------- graders de camino
def grader_llamada_herramienta(cfg: dict, salida: dict) -> ResultadoGrader:
    """Exige que se haya usado una herramienta (y, opcionalmente, con ciertos argumentos)."""
    nombre = cfg["herramienta"]
    llamadas = [c for c in salida["llamadas"] if c["herramienta"] == nombre]
    if not llamadas:
        return ResultadoGrader("llamada_herramienta", False, f"no se llamó a '{nombre}'")
    for clave, fragmento in cfg.get("args_contienen", {}).items():
        if not any(fragmento.lower() in str(c["args"].get(clave, "")).lower() for c in llamadas):
            return ResultadoGrader("llamada_herramienta", False, f"ninguna llamada a '{nombre}' con {clave}~{fragmento!r}")
    return ResultadoGrader("llamada_herramienta", True)


def grader_trayectoria(cfg: dict, salida: dict) -> ResultadoGrader:
    """Restricciones sobre el camino: número de pasos y herramientas prohibidas."""
    problemas = []
    if "max_pasos" in cfg and salida["pasos"] > cfg["max_pasos"]:
        problemas.append(f"{salida['pasos']} pasos (máx. {cfg['max_pasos']})")
    usadas = {c["herramienta"] for c in salida["llamadas"]}
    prohibidas = usadas & set(cfg.get("herramientas_prohibidas", []))
    if prohibidas:
        problemas.append(f"usó herramientas prohibidas: {sorted(prohibidas)}")
    return ResultadoGrader("trayectoria", not problemas, "; ".join(problemas))


GRADERS = {
    "exacto": grader_exacto,
    "numerico": grader_numerico,
    "regex": grader_regex,
    "json_esquema": grader_json_esquema,
    "estado_fs": grader_estado_fs,
    "llamada_herramienta": grader_llamada_herramienta,
    "trayectoria": grader_trayectoria,
}


def calificar(tarea: dict, salida: dict) -> list[ResultadoGrader]:
    """Aplica todos los graders de la tarea. La tarea pasa si pasan TODOS."""
    resultados = []
    for cfg in tarea["graders"]:
        if cfg["tipo"] not in GRADERS:
            raise ValueError(f"grader desconocido: {cfg['tipo']}")
        resultados.append(GRADERS[cfg["tipo"]](cfg, salida))
    return resultados
