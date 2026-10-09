"""Calibra el juez contra las etiquetas humanas de datos.jsonl.

Uso:
    python calibrar.py                 # juez real si hay API key; si no, simulado
    python calibrar.py --simulado      # fuerza el juez simulado
    python calibrar.py --pareado       # añade la prueba de intercambio de posiciones
    python calibrar.py --reusar        # reutiliza resultados/juicios.jsonl (no vuelve a llamar a la API)

Métricas (positivo = "pass"):
    acuerdo (accuracy), TPR (de los que el humano aprueba, cuántos aprueba el juez),
    TNR (de los que el humano suspende, cuántos suspende el juez) y kappa de Cohen
    (acuerdo corregido por azar). Después lista los DESACUERDOS para que los leas.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from juez import crear_juez

DIRECTORIO = Path(__file__).resolve().parent
sys.path.insert(0, str(DIRECTORIO.parent / "lab01_mini_harness"))
from metricas import wilson  # noqa: E402


def cargar(ruta: Path) -> list[dict]:
    with open(ruta, encoding="utf-8") as f:
        return [json.loads(linea) for linea in f if linea.strip()]


def kappa_cohen(tp: int, fp: int, fn: int, tn: int) -> float:
    n = tp + fp + fn + tn
    acuerdo_observado = (tp + tn) / n
    # Acuerdo esperado por azar: ambos dicen pass por casualidad + ambos dicen fail por casualidad.
    p_juez_pass, p_humano_pass = (tp + fp) / n, (tp + fn) / n
    acuerdo_azar = p_juez_pass * p_humano_pass + (1 - p_juez_pass) * (1 - p_humano_pass)
    if acuerdo_azar == 1:
        return 1.0
    return (acuerdo_observado - acuerdo_azar) / (1 - acuerdo_azar)


def informe(datos: list[dict], juicios: dict[str, dict]) -> None:
    validos = [d for d in datos if juicios[d["id"]]["veredicto"] in ("pass", "fail")]
    errores = len(datos) - len(validos)
    tp = sum(1 for d in validos if d["etiqueta_humana"] == "pass" and juicios[d["id"]]["veredicto"] == "pass")
    fn = sum(1 for d in validos if d["etiqueta_humana"] == "pass" and juicios[d["id"]]["veredicto"] == "fail")
    fp = sum(1 for d in validos if d["etiqueta_humana"] == "fail" and juicios[d["id"]]["veredicto"] == "pass")
    tn = sum(1 for d in validos if d["etiqueta_humana"] == "fail" and juicios[d["id"]]["veredicto"] == "fail")
    n = len(validos)

    print("\nMATRIZ DE CONFUSIÓN (filas = humano, columnas = juez)")
    print("                  juez pass   juez fail")
    print(f"  humano pass     {tp:>9}   {fn:>9}")
    print(f"  humano fail     {fp:>9}   {tn:>9}")
    if errores:
        print(f"  ({errores} juicios no se pudieron parsear y se excluyen)")

    acc = (tp + tn) / n
    lo, hi = wilson(tp + tn, n)
    print(f"\n  Acuerdo (accuracy): {acc:.3f}   IC95% Wilson [{lo:.2f}, {hi:.2f}]  (n = {n}: ¡intervalo ancho!)")
    print(f"  TPR (sensibilidad): {tp / max(1, tp + fn):.3f}   -> aprueba lo que el humano aprueba")
    print(f"  TNR (especificidad): {tn / max(1, tn + fp):.3f}  -> suspende lo que el humano suspende")
    print(f"  Kappa de Cohen:     {kappa_cohen(tp, fp, fn, tn):.3f}")
    tasa_humana, tasa_juez = (tp + fn) / n, (tp + fp) / n
    print(f"\n  Tasa de pass según humanos: {tasa_humana:.3f}   según el juez: {tasa_juez:.3f}"
          f"   (sesgo de la puntuación: {tasa_juez - tasa_humana:+.3f})")

    print("\nDESACUERDOS (léelos uno a uno: ¿se equivoca el juez, la rúbrica o la etiqueta?)")
    for d in validos:
        j = juicios[d["id"]]
        if j["veredicto"] == d["etiqueta_humana"]:
            continue
        tipo = "FALSO POSITIVO" if j["veredicto"] == "pass" else "FALSO NEGATIVO"
        print(f"\n  [{d['id']}] {tipo}: humano={d['etiqueta_humana']} juez={j['veredicto']}")
        print(f"    Pregunta:  {d['pregunta']}")
        print(f"    Respuesta: {d['respuesta']}")
        print(f"    Nota humana: {d['nota_humana']}")
        for nombre, c in j["criterios"].items():
            print(f"    - {nombre:<9} {c.get('veredicto', '?'):<3} {c.get('razon', '')}")


def prueba_pareada(datos: list[dict], juez) -> None:
    """Compara las dos respuestas de cada pregunta en ambos órdenes (A,B) y (B,A)."""
    print("\nPRUEBA PAREADA CON INTERCAMBIO DE POSICIONES")
    por_pregunta: dict[str, list[dict]] = {}
    for d in datos:
        por_pregunta.setdefault(d["pregunta_id"], []).append(d)
    consistentes = acierta = total = 0
    for qid, (x, y) in ((q, v[:2]) for q, v in por_pregunta.items() if len(v) >= 2):
        g1 = juez.comparar(x["pregunta"], x["fuentes"], x["respuesta"], y["respuesta"])  # x en A
        g2 = juez.comparar(x["pregunta"], x["fuentes"], y["respuesta"], x["respuesta"])  # x en B
        elegido1 = {"A": x["id"], "B": y["id"]}.get(g1, g1)
        elegido2 = {"A": y["id"], "B": x["id"]}.get(g2, g2)
        consistente = elegido1 == elegido2
        preferida_humana = x["id"] if x["etiqueta_humana"] == "pass" and y["etiqueta_humana"] == "fail" else (
            y["id"] if y["etiqueta_humana"] == "pass" and x["etiqueta_humana"] == "fail" else None)
        total += 1
        consistentes += consistente
        acierta += consistente and elegido1 == preferida_humana
        marca = "ok  " if consistente else "INCONSISTENTE"
        print(f"  {qid}: orden ({x['id']},{y['id']}) -> {elegido1:<7} orden ({y['id']},{x['id']}) -> {elegido2:<7} {marca}"
              f"  (humano prefiere {preferida_humana})")
    print(f"\n  Consistencia al intercambiar posiciones: {consistentes}/{total}")
    print(f"  Consistente Y de acuerdo con la preferencia humana: {acierta}/{total}")
    print("  Un veredicto que cambia al cambiar el orden NO es un veredicto: cuéntalo como empate o descártalo.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Calibra un juez LLM contra etiquetas humanas (laboratorio 3)")
    parser.add_argument("--simulado", action="store_true", help="fuerza el juez simulado")
    parser.add_argument("--pareado", action="store_true", help="ejecuta también la prueba de intercambio de posiciones")
    parser.add_argument("--reusar", action="store_true", help="reutiliza resultados/juicios.jsonl si existe")
    parser.add_argument("--datos", default=str(DIRECTORIO / "datos.jsonl"))
    args = parser.parse_args()

    datos = cargar(Path(args.datos))
    cache = DIRECTORIO / "resultados" / "juicios.jsonl"
    juez = crear_juez(forzar_simulado=args.simulado)

    if args.reusar and cache.exists():
        juicios = {j["id"]: j for j in cargar(cache)}
        print(f"Reutilizando {len(juicios)} juicios de {cache.relative_to(DIRECTORIO)}")
    else:
        juicios = {}
        for d in datos:
            juicios[d["id"]] = {"id": d["id"], "juez": juez.nombre, **juez.juzgar(d)}
            print(f"  juzgado {d['id']}: {juicios[d['id']]['veredicto']}", file=sys.stderr)
        cache.parent.mkdir(exist_ok=True)
        with open(cache, "w", encoding="utf-8") as f:
            for j in juicios.values():
                f.write(json.dumps(j, ensure_ascii=False) + "\n")

    print(f"Juez: {juez.nombre}   Ejemplos: {len(datos)}")
    informe(datos, juicios)
    if args.pareado:
        prueba_pareada(datos, juez)


if __name__ == "__main__":
    main()
