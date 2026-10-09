"""CLI del laboratorio 1: ejecuta la eval y muestra resultados por tarea y globales.

Ejemplos:
    python ejecutar.py --trials 5 --seed 0 --agente basico
    python ejecutar.py --trials 5 --seed 0 --agente con_verificacion
    python ejecutar.py --trials 5 --agente basico --ver fs-01      # lee un transcript fallido
    python ejecutar.py --trials 5 --agente basico --compartir-entorno   # rompe el aislamiento
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

from agente_simulado import PERFILES, crear_agente
from harness import agrupar_por_tarea, cargar_tareas, ejecutar_eval
from metricas import (bootstrap_ic, error_estandar_agrupado, error_estandar_ingenuo, media, pass_at_k,
                      pass_hat_k, wilson)

DIRECTORIO = Path(__file__).resolve().parent


def fallo_mas_comun(ensayos: list[dict]) -> str:
    """Nombre del grader (o del motivo de corte) que más veces ha fallado."""
    motivos = Counter()
    for e in ensayos:
        if e["exito"]:
            continue
        if e["terminado_por"] != "respuesta":
            motivos[e["terminado_por"]] += 1
        for g in e["graders"]:
            if not g["aprobado"]:
                motivos[g["nombre"]] += 1
    if not motivos:
        return "-"
    nombre, veces = motivos.most_common(1)[0]
    return f"{nombre} ({veces})"


def imprimir_tabla_tareas(grupos: dict[str, list[dict]], k: int) -> None:
    cabecera = f"{'Tarea':<10}{'Tipo':<14}{'Éxitos':>7}{'pass@1':>8}{f'pass@{k}':>8}{f'pass^{k}':>8}" \
               f"{'Pasos':>7}{'Coste/ens.':>12}  Fallo más común"
    print(cabecera)
    print("-" * len(cabecera) + "-" * 14)
    for tarea_id, ensayos in grupos.items():
        n = len(ensayos)
        c = sum(e["exito"] for e in ensayos)
        print(f"{tarea_id:<10}{ensayos[0]['tipo']:<14}{f'{c}/{n}':>7}{c / n:>8.2f}"
              f"{pass_at_k(n, c, k):>8.2f}{pass_hat_k(n, c, k):>8.2f}"
              f"{media([e['pasos'] for e in ensayos]):>7.1f}"
              f"{media([e['coste'] for e in ensayos]):>12.5f}  {fallo_mas_comun(ensayos)}")


def imprimir_resumen(resultados: list[dict], grupos: dict[str, list[dict]], k: int, agente: str) -> None:
    exitos = [1.0 if r["exito"] else 0.0 for r in resultados]
    por_tarea = [[1.0 if e["exito"] else 0.0 for e in ensayos] for ensayos in grupos.values()]
    conteos = [(len(g), int(sum(g))) for g in por_tarea]
    n_total, c_total = len(exitos), int(sum(exitos))

    print(f"\nRESUMEN  agente={agente}  ({len(grupos)} tareas × {k} ensayos = {n_total} ensayos)")
    print(f"  pass@1 (tasa de éxito media): {media(exitos):.3f}")
    lo, hi = wilson(c_total, n_total)
    print(f"    IC95% Wilson (trata los {n_total} ensayos como independientes): [{lo:.3f}, {hi:.3f}]")
    lo, hi = bootstrap_ic(por_tarea, b=2000, semilla=0)
    print(f"    IC95% bootstrap remuestreando tareas:                  [{lo:.3f}, {hi:.3f}]")
    print(f"    EE ingenuo: {error_estandar_ingenuo(exitos):.3f}   EE agrupado por tarea: "
          f"{error_estandar_agrupado(por_tarea):.3f}")

    print("\n  k   pass@k   pass^k   (promedio sobre tareas, estimadores insesgados)")
    for kk in sorted({1, 2, 3, k} & set(range(1, k + 1))):
        print(f"  {kk:<3} {media([pass_at_k(n, c, kk) for n, c in conteos]):>6.3f}"
              f"   {media([pass_hat_k(n, c, kk) for n, c in conteos]):>6.3f}")

    coste_total = sum(r["coste"] for r in resultados)
    print(f"\n  Coste simulado total: ${coste_total:.4f}  |  por ensayo: ${coste_total / n_total:.5f}"
          f"  |  por éxito: ${coste_total / max(1, c_total):.5f}")
    print(f"  Llamadas al modelo por ensayo: {media([r['llamadas_modelo'] for r in resultados]):.2f}"
          f"  |  pasos (herramientas) por ensayo: {media([r['pasos'] for r in resultados]):.2f}")
    terminaciones = Counter(r["terminado_por"] for r in resultados)
    print("  Terminación de los ensayos: " + ", ".join(f"{t}={v}" for t, v in terminaciones.items()))


def imprimir_transcript(resultados: list[dict], tarea_id: str) -> None:
    ensayos = [r for r in resultados if r["tarea_id"] == tarea_id]
    if not ensayos:
        print(f"\nNo hay ensayos de la tarea {tarea_id!r}.")
        return
    elegido = next((r for r in ensayos if not r["exito"]), ensayos[0])
    estado = "FALLIDO" if not elegido["exito"] else "correcto (no hubo fallos)"
    print(f"\nTRANSCRIPT de {tarea_id}, ensayo {elegido['ensayo']} ({estado})")
    for i, ev in enumerate(elegido["transcript"]):
        rama = f"[{ev['rama']}] " if "rama" in ev else ""
        if ev["tipo"] == "llamada_herramienta":
            texto = f"{ev['herramienta']}({json.dumps(ev['args'], ensure_ascii=False)})"
        elif ev["tipo"] == "resultado_herramienta":
            texto = ("OK  " if ev["ok"] else "ERR ") + ev["salida"].replace("\n", " | ")
        else:
            texto = ev.get("texto", "")
        print(f"  {i:>2} {rama}{ev['tipo']:<22} {texto}")
    print("  Graders:")
    for g in elegido["graders"]:
        print(f"    {'PASA' if g['aprobado'] else 'FALLA':<6}{g['nombre']:<20} {g['detalle']}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Mini harness de evaluación de agentes (laboratorio 1)")
    parser.add_argument("--trials", type=int, default=5, help="ensayos por tarea (k)")
    parser.add_argument("--seed", type=int, default=0, help="semilla global")
    parser.add_argument("--agente", choices=sorted(PERFILES), default="basico")
    parser.add_argument("--max-pasos", type=int, default=12, help="límite de llamadas a herramientas por ensayo")
    parser.add_argument("--tareas", default=str(DIRECTORIO / "tareas.json"))
    parser.add_argument("--salida", default=str(DIRECTORIO / "resultados" / "transcripts.jsonl"))
    parser.add_argument("--ver", metavar="TAREA_ID", help="imprime un transcript (fallido si lo hay) de esa tarea")
    parser.add_argument("--compartir-entorno", action="store_true",
                        help="EXPERIMENTO: reutiliza el entorno entre ensayos (rompe el aislamiento)")
    args = parser.parse_args()

    tareas = cargar_tareas(args.tareas)
    agente = crear_agente(args.agente)
    resultados = ejecutar_eval(tareas, agente, k=args.trials, semilla=args.seed, max_pasos=args.max_pasos,
                               ruta_transcripts=args.salida, compartir_entorno=args.compartir_entorno)
    grupos = agrupar_por_tarea(resultados)

    if args.compartir_entorno:
        print("AVISO: entorno compartido entre ensayos (aislamiento roto a propósito).\n")
    imprimir_tabla_tareas(grupos, args.trials)
    imprimir_resumen(resultados, grupos, args.trials, args.agente)
    print(f"\n  Transcripts guardados en {Path(args.salida).relative_to(DIRECTORIO) if Path(args.salida).is_relative_to(DIRECTORIO) else args.salida}")
    if args.ver:
        imprimir_transcript(resultados, args.ver)


if __name__ == "__main__":
    main()
