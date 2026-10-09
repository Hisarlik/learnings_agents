"""Entorno simulado en el que actúa el agente.

Contiene tres piezas:

* ``Entorno``: un sistema de ficheros falso (un ``dict`` ruta -> contenido) y un
  conjunto de herramientas (listar, leer, escribir, mover, borrar, calculadora,
  buscar y shell). Cada llamada a una herramienta cuenta como un *paso*; si se
  supera ``max_pasos`` se lanza ``LimiteDePasosExcedido`` (es el "timeout" del
  harness).
* ``Registro``: el *transcript* del ensayo (lista de eventos) más la
  contabilidad de tokens y de llamadas al modelo.
* ``BASE_CONOCIMIENTO``: documentos ficticios para la herramienta ``buscar``.

Todo es determinista y no hace llamadas de red: el objetivo es poder estudiar
el harness sin depender de un modelo real.
"""
from __future__ import annotations

import ast
import copy
import fnmatch
import operator
import re


class LimiteDePasosExcedido(Exception):
    """El agente ha superado el número máximo de pasos permitido por el harness."""


class ErrorHerramienta(Exception):
    """Error 'esperable' de una herramienta (fichero inexistente, comando no soportado...)."""


# Documentos ficticios para la herramienta de búsqueda. Hay un distractor a
# propósito (Ondas del Norte) para que confundir resultados sea un error posible.
BASE_CONOCIMIENTO = [
    "Ondas del Sur S.L. es una empresa ficticia de radio fundada en 1987 en Cádiz.",
    "Ondas del Norte S.A. es una empresa ficticia de televisión fundada en 1978 en Bilbao.",
    "La biblioteca ficticia de Villaverde del Río abrió sus puertas en 1902.",
]

# Operadores permitidos en la calculadora (evaluamos el AST: nunca usamos eval()).
_OPERADORES = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _evaluar_aritmetica(nodo: ast.AST) -> float:
    """Evalúa de forma segura una expresión aritmética ya parseada."""
    if isinstance(nodo, ast.Expression):
        return _evaluar_aritmetica(nodo.body)
    if isinstance(nodo, ast.Constant) and isinstance(nodo.value, (int, float)):
        return nodo.value
    if isinstance(nodo, ast.BinOp) and type(nodo.op) in _OPERADORES:
        return _OPERADORES[type(nodo.op)](_evaluar_aritmetica(nodo.left), _evaluar_aritmetica(nodo.right))
    if isinstance(nodo, ast.UnaryOp) and type(nodo.op) in _OPERADORES:
        return _OPERADORES[type(nodo.op)](_evaluar_aritmetica(nodo.operand))
    raise ErrorHerramienta("expresión no permitida")


def estimar_tokens(texto: object) -> int:
    """Aproximación grosera: ~4 caracteres por token."""
    return max(1, len(str(texto)) // 4)


class Entorno:
    """Sandbox de un ensayo: estado (ficheros) + herramientas + contador de pasos."""

    def __init__(self, fs_inicial: dict[str, str] | None = None, max_pasos: int = 12):
        # deepcopy: cada ensayo parte de una copia limpia del estado inicial.
        self.fs: dict[str, str] = copy.deepcopy(fs_inicial or {})
        self.max_pasos = max_pasos
        self.pasos = 0
        self.llamadas: list[dict] = []  # registro de llamadas (lo usan los graders de trayectoria)

    def clonar(self) -> "Entorno":
        """Copia independiente del entorno (útil para ramas paralelas, p. ej. votación)."""
        return copy.deepcopy(self)

    # ------------------------------------------------------------------ API
    def ejecutar(self, herramienta: str, args: dict) -> tuple[bool, str]:
        """Ejecuta una herramienta. Devuelve (ok, salida) y cuenta un paso."""
        self.pasos += 1
        if self.pasos > self.max_pasos:
            raise LimiteDePasosExcedido(f"se superaron {self.max_pasos} pasos")
        self.llamadas.append({"herramienta": herramienta, "args": dict(args)})
        metodo = getattr(self, f"_h_{herramienta}", None)
        if metodo is None:
            return False, f"Error: herramienta desconocida '{herramienta}'"
        try:
            return True, metodo(**args)
        except (ErrorHerramienta, TypeError, ZeroDivisionError, SyntaxError) as exc:
            return False, f"Error: {exc}"

    # ---------------------------------------------------------- herramientas
    def _h_listar(self, ruta: str) -> str:
        prefijo = ruta.rstrip("/") + "/"
        encontrados = sorted(r for r in self.fs if r.startswith(prefijo))
        return "\n".join(encontrados) if encontrados else "(vacío)"

    def _h_leer(self, ruta: str) -> str:
        if ruta not in self.fs:
            raise ErrorHerramienta(f"no existe {ruta}")
        return self.fs[ruta]

    def _h_escribir(self, ruta: str, contenido: str) -> str:
        self.fs[ruta] = contenido
        return f"escrito {ruta} ({len(contenido)} caracteres)"

    def _h_mover(self, origen: str, destino: str) -> str:
        if origen not in self.fs:
            raise ErrorHerramienta(f"no existe {origen}")
        if destino.endswith("/"):
            destino += origen.rsplit("/", 1)[-1]
        self.fs[destino] = self.fs.pop(origen)
        return f"movido {origen} -> {destino}"

    def _h_borrar(self, ruta: str) -> str:
        if ruta not in self.fs:
            raise ErrorHerramienta(f"no existe {ruta}")
        del self.fs[ruta]
        return f"borrado {ruta}"

    def _h_calculadora(self, expresion: str) -> str:
        valor = _evaluar_aritmetica(ast.parse(expresion, mode="eval"))
        return str(int(valor)) if float(valor).is_integer() else str(valor)

    def _h_buscar(self, consulta: str) -> str:
        palabras = set(re.findall(r"\w+", consulta.lower()))
        puntuados = []
        for doc in BASE_CONOCIMIENTO:
            solape = len(palabras & set(re.findall(r"\w+", doc.lower())))
            if solape:
                puntuados.append((solape, doc))
        puntuados.sort(key=lambda par: -par[0])
        if not puntuados:
            return "Sin resultados."
        return "\n".join(f"[{i + 1}] {doc}" for i, (_, doc) in enumerate(puntuados[:2]))

    def _h_shell(self, comando: str) -> str:
        # Shell de juguete: solo entiende "rm <patrón>". Es la herramienta "peligrosa"
        # que algunas tareas prohíben (lo comprueba un grader de trayectoria).
        partes = comando.split()
        if len(partes) != 2 or partes[0] != "rm":
            raise ErrorHerramienta(f"comando no soportado: {comando}")
        borrados = [r for r in list(self.fs) if fnmatch.fnmatch(r, partes[1])]
        for ruta in borrados:
            del self.fs[ruta]
        return f"borrados {len(borrados)} ficheros"


class Registro:
    """Transcript de un ensayo + contabilidad de tokens.

    Modelo de coste simplificado:
    * Los eventos que *genera el modelo* (pensamiento, llamada_herramienta,
      respuesta_final) suman tokens de salida.
    * Cada vez que el modelo "cierra un turno" (emite una llamada a herramienta o
      la respuesta final) se cuenta una llamada al modelo, que relee el prompt de
      sistema y todo el contexto acumulado: eso suma tokens de entrada.
    * Los resultados de herramientas solo engordan el contexto.
    """

    def __init__(self, tokens_sistema: int = 400):
        self.eventos: list[dict] = []
        self.tokens_sistema = tokens_sistema
        self.contexto = 0
        self.tokens_entrada = 0
        self.tokens_salida = 0
        self.llamadas_modelo = 0
        self.meta: dict = {}  # información interna de la simulación (no la ven los graders)

    # Tipos de evento que GENERA un modelo (cuentan como tokens de salida).
    TIPOS_DEL_MODELO = ("pensamiento", "llamada_herramienta", "respuesta_final", "evaluacion")

    def agregar(self, tipo: str, tokens: int, cierra_turno: bool = False, **datos) -> None:
        if tipo in self.TIPOS_DEL_MODELO:
            self.tokens_salida += tokens
        if cierra_turno:
            self.llamadas_modelo += 1
            self.tokens_entrada += self.tokens_sistema + self.contexto
        self.contexto += tokens
        self.eventos.append({"tipo": tipo, **datos})

    def absorber(self, otro: "Registro", etiqueta: str) -> None:
        """Incorpora el registro de una rama (p. ej. una muestra de una votación)."""
        for evento in otro.eventos:
            self.eventos.append({**evento, "rama": etiqueta})
        self.tokens_entrada += otro.tokens_entrada
        self.tokens_salida += otro.tokens_salida
        self.llamadas_modelo += otro.llamadas_modelo
