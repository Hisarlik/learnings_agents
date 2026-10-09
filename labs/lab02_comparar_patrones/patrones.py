"""Patrones de agente construidos sobre el agente simulado del laboratorio 1.

Todos exponen la misma interfaz que ``AgenteSimulado``:
``resolver(tarea, entorno, registro, rng) -> respuesta``, así que el MISMO
harness del laboratorio 1 puede evaluarlos sin cambios. Esa es la idea clave:
el harness no sabe (ni le importa) qué patrón hay dentro.

Patrones:
* un_disparo           -> una sola llamada que emite todas las acciones sin ver resultados.
* react                -> bucle pensar/actuar/observar, sin verificación.
* react_verificacion   -> igual, pero revisa su trabajo antes de responder.
* voto_mayoria_3       -> 3 muestras independientes en entornos clonados y voto por mayoría.
* evaluador_optimizador -> un generador + un evaluador (otro "modelo") que lo critica hasta 3 rondas.

AVISO: es una simulación. Las probabilidades de detección del evaluador son
supuestos razonables para practicar, no medidas de ningún modelo real.
"""
from __future__ import annotations

import random
import sys
from collections import Counter
from pathlib import Path

# Reutilizamos los componentes del laboratorio 1.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "lab01_mini_harness"))

from agente_simulado import HABILIDAD_BASE, AgenteSimulado, PerfilAgente  # noqa: E402
from entorno import Entorno, LimiteDePasosExcedido, Registro, estimar_tokens  # noqa: E402


def _normalizar_para_voto(texto: str) -> str:
    return " ".join(texto.lower().split()).rstrip(".")


class VotoMayoria:
    """Ejecuta n muestras del agente base en clones del entorno y vota la respuesta.

    El "commit" del estado se hace con la rama ganadora: es lo que haría un
    sistema real que ejecuta las ramas en sandboxes y luego aplica una.
    """

    def __init__(self, base: AgenteSimulado, n: int = 3):
        self.base = base
        self.n = n
        self.nombre = f"voto_mayoria_{n}"
        self.perfil = base.perfil

    def resolver(self, tarea: dict, entorno: Entorno, registro: Registro, rng: random.Random) -> str:
        ramas = []
        for i in range(self.n):
            clon = entorno.clonar()
            sub = Registro(self.perfil.tokens_sistema)
            rng_rama = random.Random(f"{rng.random()}:{i}")
            try:
                respuesta = self.base.resolver(tarea, clon, sub, rng_rama)
            except LimiteDePasosExcedido:
                respuesta = None  # esta muestra no termina: no vota
            registro.absorber(sub, f"muestra{i + 1}")
            ramas.append((respuesta, clon, sub))

        validas = [r for r in ramas if r[0] is not None]
        if not validas:
            raise LimiteDePasosExcedido("ninguna muestra terminó dentro del límite de pasos")
        votos = Counter(_normalizar_para_voto(r[0]) for r in validas)
        ganadora, _ = votos.most_common(1)[0]  # en empate gana la primera que apareció
        respuesta, clon, sub = next(r for r in validas if _normalizar_para_voto(r[0]) == ganadora)

        # Aplicamos el estado de la rama elegida al entorno "real".
        entorno.fs, entorno.llamadas, entorno.pasos = clon.fs, clon.llamadas, clon.pasos
        registro.meta["modo_interno"] = sub.meta.get("modo_interno")
        registro.agregar("agregacion", 0, texto=f"votos={dict(votos)} -> {ganadora!r}")
        registro.agregar("respuesta_final", 0, texto=respuesta)  # el agregador es código, no un LLM
        return respuesta


# Probabilidad de que el EVALUADOR detecte cada modo de error. Suponemos que un
# crítico dedicado detecta algo mejor los errores de razonamiento que la
# auto-verificación, pero tampoco puede deshacer una herramienta prohibida.
P_DETECTAR_EVALUADOR = {
    "formato": 0.85,
    "exito_falso": 0.7,
    "args_erroneos": 0.7,
    "sin_herramienta": 0.8,
    "respuesta_incorrecta": 0.6,
    "herramienta_prohibida": 0.0,
    "bucle": 0.0,
}


class EvaluadorOptimizador:
    """Bucle generador -> evaluador -> (feedback) -> generador, hasta ``max_rondas``."""

    def __init__(self, generador: AgenteSimulado, max_rondas: int = 3, p_falsa_alarma: float = 0.10):
        self.gen = generador
        self.max_rondas = max_rondas
        self.p_falsa_alarma = p_falsa_alarma
        self.nombre = "evaluador_optimizador"
        self.perfil = generador.perfil

    def resolver(self, tarea: dict, entorno: Entorno, registro: Registro, rng: random.Random) -> str:
        plan = self.gen.planificar(tarea, rng)
        registro.meta["modo_interno"] = plan.modo
        self.gen.pensar(registro, rng, f"Tarea: {tarea['enunciado'][:60]}...")
        self.gen.ejecutar_plan(plan, entorno, registro, rng)

        for ronda in range(1, self.max_rondas + 1):
            # El evaluador es otra llamada a un modelo: lee todo el contexto y emite un veredicto.
            # (En la simulación usamos el modo de error real para decidir si lo detecta;
            #  un evaluador real NO tiene acceso a esa verdad.)
            if plan.modo is not None:
                rechaza = rng.random() < P_DETECTAR_EVALUADOR.get(plan.modo, 0.0)
            else:
                rechaza = rng.random() < self.p_falsa_alarma
            veredicto = "RECHAZADO: revisa el resultado" if rechaza else "APROBADO"
            registro.agregar("evaluacion", 80, cierra_turno=True, texto=f"[ronda {ronda}] {veredicto}")
            if not rechaza:
                break
            plan = self.gen.corregir(tarea, plan, entorno, registro, rng, "El evaluador señala un problema.")

        registro.meta["modo_interno"] = plan.modo
        registro.agregar("respuesta_final", 20 + estimar_tokens(plan.respuesta), cierra_turno=True,
                         texto=plan.respuesta)
        return plan.respuesta


def _habilidad_un_disparo() -> dict[str, float]:
    # Sin ver los resultados de las herramientas, las tareas con estado o herramientas son más difíciles.
    h = dict(HABILIDAD_BASE)
    h["archivos"] -= 0.15
    h["herramientas"] -= 0.10
    return h


def crear_patrones() -> dict:
    """Devuelve {nombre: agente}. Todos comparten el mismo "modelo" simulado."""
    react = AgenteSimulado(PerfilAgente("react", dict(HABILIDAD_BASE)))
    return {
        "un_disparo": AgenteSimulado(PerfilAgente("un_disparo", _habilidad_un_disparo(), una_llamada=True)),
        "react": react,
        "react_verificacion": AgenteSimulado(PerfilAgente("react_verificacion", dict(HABILIDAD_BASE), verificar=True)),
        "voto_mayoria_3": VotoMayoria(react, n=3),
        "evaluador_optimizador": EvaluadorOptimizador(react),
    }
