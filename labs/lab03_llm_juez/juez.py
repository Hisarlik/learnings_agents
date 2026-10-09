"""Juez LLM con rúbrica de criterios binarios (y modo pareado con intercambio de posiciones).

Modos de funcionamiento:
* REAL: si existe la variable ANTHROPIC_API_KEY y está instalado el paquete
  ``anthropic``, llama a la Messages API con el modelo indicado en la
  variable de entorno MODELO_JUEZ (obligatoria en ese modo).
* SIMULADO: si no, usa un juez heurístico determinista y lo avisa claramente.
  El juez heurístico es deliberadamente imperfecto (busca números y nombres
  propios en las fuentes) para que la calibración tenga algo que enseñar.

Diseño de la rúbrica:
* Tres criterios BINARIOS, cada uno con una pregunta concreta y comprobable.
* El juez razona ANTES de dar cada veredicto.
* La agregación (pass si los tres son "si") la hace el CÓDIGO, no el modelo:
  así la regla de decisión es explícita y estable.
"""
from __future__ import annotations

import json
import os
import re
import sys


CRITERIOS = {
    "responde": "¿La respuesta contesta directamente a la pregunta (o, si las fuentes no contienen la "
                "información, dice explícitamente que no está)?",
    "fiel": "¿TODAS las afirmaciones factuales de la respuesta están respaldadas por las fuentes, sin "
            "contradecirlas ni añadir datos que no aparecen en ellas? Un cambio de formato (12.480 vs 12480, "
            "14/05/1996 vs 14 de mayo de 1996) NO es un error.",
    "cita": "¿La respuesta cita al menos una fuente con su identificador entre corchetes, p. ej. [1], y la "
            "fuente citada respalda lo que se afirma?",
}

PLANTILLA_SISTEMA = (
    "Eres un evaluador riguroso de respuestas de un agente de investigación. Evalúas con una rúbrica de "
    "criterios binarios. No premias la extensión ni el tono seguro: solo lo que pide cada criterio."
)

PLANTILLA_JUICIO = """Evalúa la RESPUESTA a la PREGUNTA usando SOLO las FUENTES como verdad.

<pregunta>
{pregunta}
</pregunta>

<fuentes>
{fuentes}
</fuentes>

<respuesta>
{respuesta}
</respuesta>

Criterios (responde "si" o "no" a cada uno):
{criterios}

Para cada criterio, escribe primero un razonamiento breve (1-2 frases) y después el veredicto.
Devuelve SOLO un objeto JSON con esta forma exacta:
{{"responde": {{"razon": "...", "veredicto": "si"}},
  "fiel": {{"razon": "...", "veredicto": "no"}},
  "cita": {{"razon": "...", "veredicto": "si"}}}}"""

PLANTILLA_PAREADA = """Dos agentes han respondido a la misma PREGUNTA. Usa SOLO las FUENTES como verdad.

<pregunta>
{pregunta}
</pregunta>

<fuentes>
{fuentes}
</fuentes>

<respuesta_A>
{a}
</respuesta_A>

<respuesta_B>
{b}
</respuesta_B>

¿Qué respuesta cumple mejor estos criterios?
{criterios}

No premies la extensión. Razona brevemente y devuelve SOLO un JSON:
{{"razon": "...", "ganadora": "A"}}   (valores posibles de "ganadora": "A", "B" o "empate")"""


# ------------------------------------------------------------------ utilidades
def formatear_fuentes(fuentes: list[str]) -> str:
    return "\n".join(f"[{i + 1}] {f}" for i, f in enumerate(fuentes))


def formatear_criterios() -> str:
    return "\n".join(f"- {nombre}: {texto}" for nombre, texto in CRITERIOS.items())


def extraer_json(texto: str) -> dict:
    """Extrae el primer objeto JSON del texto (los modelos a veces añaden texto alrededor)."""
    inicio, fin = texto.find("{"), texto.rfind("}")
    if inicio == -1 or fin == -1:
        raise ValueError("la respuesta del juez no contiene JSON")
    return json.loads(texto[inicio:fin + 1])


def agregar(criterios: dict) -> str:
    """Regla de decisión explícita: pass solo si TODOS los criterios son 'si'."""
    return "pass" if all(c.get("veredicto") == "si" for c in criterios.values()) else "fail"


# ------------------------------------------------------------- selección de modo
def modo_real_disponible() -> bool:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return False
    try:
        import anthropic  # noqa: F401
    except ImportError:
        print("AVISO: hay ANTHROPIC_API_KEY pero falta el paquete 'anthropic' (pip install anthropic). "
              "Uso el juez simulado.", file=sys.stderr)
        return False
    return True


class JuezLLM:
    """Juez real: Anthropic Messages API."""

    def __init__(self, modelo: str | None = None):
        import anthropic

        self.cliente = anthropic.Anthropic()  # lee ANTHROPIC_API_KEY del entorno
        self.modelo = modelo or os.environ.get("MODELO_JUEZ")
        if not self.modelo:
            raise SystemExit("Define MODELO_JUEZ con el id exacto del modelo juez (o quita ANTHROPIC_API_KEY para usar el juez simulado).")
        self.nombre = f"llm:{self.modelo}"

    def _llamar(self, prompt: str) -> str:
        respuesta = self.cliente.messages.create(
            model=self.modelo,
            max_tokens=1024,
            system=PLANTILLA_SISTEMA,
            messages=[{"role": "user", "content": prompt}],
        )
        return "".join(b.text for b in respuesta.content if b.type == "text")

    def juzgar(self, ejemplo: dict) -> dict:
        prompt = PLANTILLA_JUICIO.format(pregunta=ejemplo["pregunta"], fuentes=formatear_fuentes(ejemplo["fuentes"]),
                                         respuesta=ejemplo["respuesta"], criterios=formatear_criterios())
        try:
            criterios = extraer_json(self._llamar(prompt))
            criterios = {k: criterios[k] for k in CRITERIOS}
        except (ValueError, KeyError, json.JSONDecodeError) as exc:
            # Un juicio que no se puede parsear se registra como error, no como pass ni como fail.
            return {"veredicto": "error", "criterios": {}, "error": str(exc)}
        return {"veredicto": agregar(criterios), "criterios": criterios}

    def comparar(self, pregunta: str, fuentes: list[str], a: str, b: str) -> str:
        prompt = PLANTILLA_PAREADA.format(pregunta=pregunta, fuentes=formatear_fuentes(fuentes), a=a, b=b,
                                          criterios=formatear_criterios())
        try:
            return extraer_json(self._llamar(prompt)).get("ganadora", "error")
        except (ValueError, json.JSONDecodeError):
            return "error"


class JuezSimulado:
    """Juez heurístico SIN LLM. Útil para practicar el flujo de calibración.

    Fallos deliberados (realistas en jueces baratos):
    * Comprueba los números como SUBCADENAS de las fuentes: "2" aparece dentro de "2020".
    * No entiende la semántica: si el número o el nombre aparecen en las fuentes,
      da la afirmación por buena aunque se refiera a otra cosa.
    * No reconoce formatos de fecha alternativos (14/05/1996).
    * En modo pareado, ante un empate elige la respuesta en posición A (sesgo de posición).
    """

    nombre = "simulado"

    @staticmethod
    def _normalizar_numero(n: str) -> str:
        n = n.rstrip(".,")
        return re.sub(r"(?<=\d)\.(?=\d{3}\b)", "", n)  # 12.480 -> 12480 (punto de miles)

    def juzgar(self, ejemplo: dict) -> dict:
        respuesta = ejemplo["respuesta"]
        texto_fuentes = " ".join(ejemplo["fuentes"])
        fuentes_norm = re.sub(r"(?<=\d)\.(?=\d{3}\b)", "", texto_fuentes).lower()
        contexto = (texto_fuentes + " " + ejemplo["pregunta"]).lower()

        # Criterio "responde": basta con que haya algo de contenido.
        responde = len(respuesta.split()) >= 2
        # Criterio "fiel": números y nombres propios deben aparecer en las fuentes.
        sin_respaldo = []
        sin_citas = re.sub(r"\[\d+\]", " ", respuesta)
        for numero in re.findall(r"\d[\d.,/]*", sin_citas):
            for parte in self._normalizar_numero(numero).split("/"):
                if parte and parte not in fuentes_norm:
                    sin_respaldo.append(parte)
        # Nombres propios: palabras con mayúscula que no van al inicio de frase.
        for match in re.finditer(r"\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+", sin_citas):
            anterior = sin_citas[:match.start()].rstrip()
            if not anterior or anterior[-1] in ".!?;:":
                continue  # inicio de frase: la mayúscula no indica nombre propio
            palabra = match.group(0)
            if palabra.lower() not in contexto:
                sin_respaldo.append(palabra)
        fiel = not sin_respaldo
        # Criterio "cita": al menos un [n] que exista.
        citas = [int(x) for x in re.findall(r"\[(\d+)\]", respuesta)]
        cita = bool(citas) and all(1 <= c <= len(ejemplo["fuentes"]) for c in citas)

        criterios = {
            "responde": {"razon": "tiene contenido" if responde else "vacía", "veredicto": "si" if responde else "no"},
            "fiel": {"razon": "números y nombres presentes en las fuentes" if fiel
                     else f"no encuentro en las fuentes: {sin_respaldo}", "veredicto": "si" if fiel else "no"},
            "cita": {"razon": f"citas {citas}" if cita else "sin citas válidas", "veredicto": "si" if cita else "no"},
        }
        return {"veredicto": agregar(criterios), "criterios": criterios}

    def comparar(self, pregunta: str, fuentes: list[str], a: str, b: str) -> str:
        def puntos(resp: str) -> int:
            j = self.juzgar({"pregunta": pregunta, "fuentes": fuentes, "respuesta": resp})
            return sum(c["veredicto"] == "si" for c in j["criterios"].values())

        pa, pb = puntos(a), puntos(b)
        if pa == pb:
            return "A"  # sesgo de posición: ante la duda, la primera
        return "A" if pa > pb else "B"


def crear_juez(forzar_simulado: bool = False):
    if not forzar_simulado and modo_real_disponible():
        return JuezLLM()
    print("=" * 78, file=sys.stderr)
    print("AVISO: usando el JUEZ SIMULADO (heurístico, sin LLM). Define ANTHROPIC_API_KEY e instala", file=sys.stderr)
    print("'anthropic' para usar un juez LLM real. Los números de abajo NO dicen nada de un juez LLM.", file=sys.stderr)
    print("=" * 78, file=sys.stderr)
    return JuezSimulado()


if __name__ == "__main__":
    # Prueba rápida: juzga el primer ejemplo del conjunto de datos.
    from pathlib import Path

    with open(Path(__file__).with_name("datos.jsonl"), encoding="utf-8") as f:
        ejemplo = json.loads(f.readline())
    juez = crear_juez()
    print(json.dumps(juez.juzgar(ejemplo), ensure_ascii=False, indent=2))
