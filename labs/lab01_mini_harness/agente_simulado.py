"""Agente simulado para practicar con el harness sin API key.

No hay ningún modelo de lenguaje: el agente "decide" con una moneda trucada.

1. Para cada tarea calcula una probabilidad de éxito ``p`` a partir de su
   habilidad en ese *tipo* de tarea, la dificultad de la tarea y un desplazamiento
   aleatorio *fijo por tarea* (hay tareas que a este "modelo" se le dan
   especialmente bien o mal, como pasa con los modelos reales).
2. En cada ensayo tira la moneda: con probabilidad ``p`` sigue la solución de
   referencia; si no, elige uno de los errores realistas que define la tarea
   (formato incorrecto, éxito falso, argumentos erróneos, bucle, herramienta
   prohibida...).
3. Ejecuta de verdad las acciones contra el ``Entorno`` (el estado cambia de
   verdad) y deja un *transcript*: pensamiento, llamada_herramienta,
   resultado_herramienta y respuesta_final.
4. Si el perfil tiene ``verificar=True``, después revisa su trabajo: detecta el
   error con cierta probabilidad (que depende del tipo de error) e intenta
   corregirlo. Verificar cuesta pasos y tokens.

Todo depende de un ``random.Random`` que le pasa el harness: con la misma
semilla el resultado es idéntico.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field

from entorno import Entorno, Registro, estimar_tokens

# Probabilidad de que la auto-verificación detecte cada tipo de error.
# Es más fácil darse cuenta de un problema de formato o de una acción que falta
# (basta con mirar el estado) que de un error de razonamiento.
P_DETECTAR_AUTOVERIFICACION = {
    "formato": 0.8,
    "exito_falso": 0.8,
    "args_erroneos": 0.6,
    "sin_herramienta": 0.6,
    "respuesta_incorrecta": 0.35,
    "herramienta_prohibida": 0.0,  # ya se usó: no se puede deshacer
    "bucle": 0.0,                  # nunca llega a verificar
}


@dataclass
class PerfilAgente:
    """Configuración del agente simulado."""

    nombre: str
    habilidad: dict[str, float]          # probabilidad base de éxito por tipo de tarea
    modelo: str = "simulado-v1"          # fija el desplazamiento por tarea (mismo modelo => mismo desplazamiento)
    ruido: float = 0.15                  # desviación típica del desplazamiento por tarea
    peso_dificultad: float = 0.5         # cuánto penaliza la dificultad
    verificar: bool = False
    max_reintentos: int = 2
    p_detectar: dict[str, float] = field(default_factory=lambda: dict(P_DETECTAR_AUTOVERIFICACION))
    p_falsa_alarma: float = 0.05         # verificar "ve" un problema que no existe (solo coste)
    una_llamada: bool = False            # True = patrón de un solo disparo (todas las acciones en una llamada)
    tokens_sistema: int = 400


HABILIDAD_BASE = {
    "aritmetica": 0.90,
    "texto": 0.97,
    "json": 0.90,
    "fecha": 0.95,
    "archivos": 0.85,
    "herramientas": 0.90,
}

PERFILES = {
    "basico": PerfilAgente(nombre="basico", habilidad=dict(HABILIDAD_BASE)),
    "con_verificacion": PerfilAgente(nombre="con_verificacion", habilidad=dict(HABILIDAD_BASE), verificar=True),
}


@dataclass
class Plan:
    """Lo que el agente va a hacer en este ensayo."""

    modo: str | None           # None = sigue la solución; si no, el modo de error
    acciones: list[dict]
    respuesta: str
    correccion: list[dict]     # acciones que arreglarían el error (si el agente se da cuenta)


class AgenteSimulado:
    def __init__(self, perfil: PerfilAgente):
        self.perfil = perfil
        self.nombre = perfil.nombre

    # ------------------------------------------------------------ decisiones
    def probabilidad_exito(self, tarea: dict) -> float:
        """p de seguir la solución correcta en un ensayo de esta tarea."""
        # Desplazamiento determinista por (modelo, tarea): no cambia entre ensayos.
        rng_tarea = random.Random(f"{self.perfil.modelo}:{tarea['id']}")
        desplazamiento = rng_tarea.gauss(0, self.perfil.ruido)
        base = self.perfil.habilidad.get(tarea["tipo"], 0.7)
        p = base - self.perfil.peso_dificultad * tarea.get("dificultad", 0.5) + desplazamiento
        return min(0.98, max(0.02, p))

    def planificar(self, tarea: dict, rng: random.Random) -> Plan:
        solucion = tarea["solucion"]
        if rng.random() < self.probabilidad_exito(tarea) or not tarea.get("errores"):
            return Plan(None, solucion["acciones"], solucion["respuesta"], [])
        errores = tarea["errores"]
        error = rng.choices(errores, weights=[e.get("peso", 1) for e in errores])[0]
        return Plan(
            modo=error["modo"],
            # Si el error no redefine las acciones, se hacen las correctas (p. ej. error de formato).
            acciones=error.get("acciones", solucion["acciones"]),
            respuesta=error.get("respuesta", solucion["respuesta"]),
            correccion=error.get("correccion", solucion["acciones"]),
        )

    # ------------------------------------------------------------- ejecución
    def pensar(self, registro: Registro, rng: random.Random, texto: str) -> None:
        registro.agregar("pensamiento", rng.randint(40, 120), texto=texto)

    def actuar(self, accion: dict, entorno: Entorno, registro: Registro, cierra_turno: bool = True) -> tuple[bool, str]:
        registro.agregar("llamada_herramienta", 30 + estimar_tokens(accion["args"]), cierra_turno=cierra_turno,
                         herramienta=accion["herramienta"], args=accion["args"])
        ok, salida = entorno.ejecutar(accion["herramienta"], accion["args"])
        registro.agregar("resultado_herramienta", 10 + estimar_tokens(salida),
                         herramienta=accion["herramienta"], ok=ok, salida=salida)
        return ok, salida

    def ejecutar_plan(self, plan: Plan, entorno: Entorno, registro: Registro, rng: random.Random) -> None:
        if plan.modo == "bucle":
            # El agente no se da cuenta de que repite lo mismo: solo el límite de pasos lo para.
            self.pensar(registro, rng, "Necesito ver qué ficheros hay antes de seguir.")
            while True:
                self.actuar(plan.acciones[0], entorno, registro)
        # En el patrón de un disparo, todas las llamadas se emiten en una sola respuesta del modelo.
        for i, accion in enumerate(plan.acciones):
            if not self.perfil.una_llamada:
                self.pensar(registro, rng, f"Siguiente paso: usar '{accion['herramienta']}'.")
            self.actuar(accion, entorno, registro, cierra_turno=not self.perfil.una_llamada or i == 0)

    def corregir(self, tarea: dict, plan: Plan, entorno: Entorno, registro: Registro,
                 rng: random.Random, motivo: str) -> Plan:
        """Intenta arreglar un error detectado. Sale bien con la misma p que el primer intento."""
        self.pensar(registro, rng, f"{motivo} Voy a corregirlo.")
        if plan.modo is None:
            return plan  # falsa alarma: solo cuesta tokens
        if rng.random() < self.probabilidad_exito(tarea):
            for accion in plan.correccion:
                self.actuar(accion, entorno, registro)
            return Plan(None, plan.acciones, tarea["solucion"]["respuesta"], [])
        self.pensar(registro, rng, "No consigo arreglarlo; mantengo lo que tenía.")
        return plan

    def verificar(self, tarea: dict, plan: Plan, entorno: Entorno, registro: Registro, rng: random.Random) -> Plan:
        """Bucle de auto-verificación (solo si el perfil lo activa)."""
        for _ in range(self.perfil.max_reintentos):
            if "verificacion" in tarea:
                self.pensar(registro, rng, "Compruebo el estado final antes de responder.")
                self.actuar(tarea["verificacion"], entorno, registro)
            else:
                self.pensar(registro, rng, "Reviso que la respuesta cumple exactamente el formato pedido.")
            if plan.modo is not None:
                detecta = rng.random() < self.perfil.p_detectar.get(plan.modo, 0.0)
            else:
                detecta = rng.random() < self.perfil.p_falsa_alarma
            if not detecta:
                break
            plan = self.corregir(tarea, plan, entorno, registro, rng, "Algo no cuadra.")
            if plan.modo is None:
                break
        return plan

    # ------------------------------------------------------- punto de entrada
    def resolver(self, tarea: dict, entorno: Entorno, registro: Registro, rng: random.Random) -> str:
        """Resuelve la tarea y devuelve la respuesta final (texto)."""
        plan = self.planificar(tarea, rng)
        registro.meta["modo_interno"] = plan.modo  # verdad de la simulación (los graders NO la ven)
        self.pensar(registro, rng, f"Tarea: {tarea['enunciado'][:60]}...")
        self.ejecutar_plan(plan, entorno, registro, rng)
        if self.perfil.verificar:
            plan = self.verificar(tarea, plan, entorno, registro, rng)
        registro.meta["modo_interno"] = plan.modo
        registro.agregar("respuesta_final", 20 + estimar_tokens(plan.respuesta), cierra_turno=True, texto=plan.respuesta)
        return plan.respuesta


def crear_agente(nombre: str) -> AgenteSimulado:
    if nombre not in PERFILES:
        raise ValueError(f"Agente desconocido '{nombre}'. Opciones: {', '.join(PERFILES)}")
    return AgenteSimulado(PERFILES[nombre])
