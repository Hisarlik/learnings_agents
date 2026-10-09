"""Laboratorio 2: compara patrones de agente sobre las mismas tareas.

Ejemplos:
    python comparar.py
    python comparar.py --trials 10 --seed 0 --comparar react_verificacion voto_mayoria_3
    python comparar.py --patrones react react_verificacion --trials 20

Qué imprime:
    1. Tabla principal: éxito, IC, pass^k, coste por ensayo y por éxito.
    2. Éxito por tipo de tarea (¿dónde ayuda cada patrón?).
    3. Modos de fallo por patrón (solo posible porque es una simulación).
    4. Comparación pareada A vs B: tabla 2×2, McNemar exacto e IC bootstrap por tareas.
    5. Ablación: react con y sin verificación.
"""
from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

from patrones import crear_patrones  # también añade lab01 al sys.path

from harness import agrupar_por_tarea, cargar_tareas, ejecutar_eval  # noqa: E402
from metricas import bootstrap_diferencia_pareada, bootstrap_ic, mcnemar_exacto, media, pass_hat_k  # noqa: E402

DIR_LAB01 = Path(__file__).resolve().parent.parent / "lab01_mini_harness"


def resumen_patron(resultados: list[dict], k_fiab: int) -> dict:
    grupos = agrupar_por_tarea(resultados)
    por_tarea = [[1.0 if e["exito"] else 0.0 for e in g] for g in grupos.values()]
    n = len(next(iter(por_tarea)))
    exitos = sum(r["exito"] for r in resultados)
    coste_total = sum(r["coste"] for r in resultados)
    return {
        "exito": exitos / len(resultados),
        "ic": bootstrap_ic(por_tarea, b=2000, semilla=0),
        "pass_hat": media([pass_hat_k(n, int(sum(g)), k_fiab) for g in por_tarea]),
        "pass_hat_n": media([pass_hat_k(n, int(sum(g)), n) for g in por_tarea]),
        "coste": coste_total / len(resultados),
        "coste_exito": coste_total / max(1, exitos),
        "llamadas": media([r["llamadas_modelo"] for r in resultados]),
    }


def imprimir_tabla_principal(res: dict[str, list[dict]], n: int, k_fiab: int) -> dict[str, dict]:
    print(f"1) RESULTADOS POR PATRÓN  ({n} ensayos por tarea; IC95% bootstrap remuestreando tareas)\n")
    cab = f"{'Patrón':<23}{'Éxito':>7}{'IC95%':>16}{f'pass^{k_fiab}':>9}{f'pass^{n}':>9}" \
          f"{'Coste/ens.':>12}{'Coste/éxito':>13}{'Llamadas':>10}"
    print(cab)
    print("-" * len(cab))
    resumenes = {}
    for nombre, resultados in res.items():
        r = resumen_patron(resultados, k_fiab)
        resumenes[nombre] = r
        ic = f"[{r['ic'][0]:.2f}, {r['ic'][1]:.2f}]"
        print(f"{nombre:<23}{r['exito']:>7.3f}{ic:>16}{r['pass_hat']:>9.3f}{r['pass_hat_n']:>9.3f}"
              f"{r['coste']:>12.5f}{r['coste_exito']:>13.5f}{r['llamadas']:>10.2f}")
    return resumenes


def imprimir_por_tipo(res: dict[str, list[dict]]) -> None:
    tipos = sorted({r["tipo"] for rs in res.values() for r in rs})
    print("\n2) ÉXITO POR TIPO DE TAREA\n")
    print(f"{'Patrón':<23}" + "".join(f"{t[:11]:>12}" for t in tipos))
    for nombre, resultados in res.items():
        fila = []
        for t in tipos:
            del_tipo = [r["exito"] for r in resultados if r["tipo"] == t]
            fila.append(f"{sum(del_tipo) / len(del_tipo):>12.2f}")
        print(f"{nombre:<23}" + "".join(fila))


def imprimir_modos_fallo(res: dict[str, list[dict]]) -> None:
    print("\n3) MODOS DE FALLO (nº de ensayos fallidos por causa interna de la simulación)\n")
    conteos = {}
    for nombre, resultados in res.items():
        c = Counter()
        for r in resultados:
            if not r["exito"]:
                c[r["terminado_por"] if r["terminado_por"] != "respuesta" else (r["modo_interno"] or "otro")] += 1
        conteos[nombre] = c
    modos = sorted({m for c in conteos.values() for m in c})
    print(f"{'Patrón':<23}" + "".join(f"  {m}" for m in modos))
    for nombre, c in conteos.items():
        print(f"{nombre:<23}" + "".join(f"{c.get(m, 0):>{len(m) + 2}}" for m in modos))


def comparacion_pareada(res: dict[str, list[dict]], a: str, b: str) -> None:
    """McNemar exacto sobre pares (tarea, ensayo) + IC bootstrap de la diferencia por tareas."""
    print(f"\n4) COMPARACIÓN PAREADA: {a} (A) vs {b} (B)\n")
    clave = lambda r: (r["tarea_id"], r["ensayo"])  # noqa: E731
    ra = {clave(r): r["exito"] for r in res[a]}
    rb = {clave(r): r["exito"] for r in res[b]}
    tabla = Counter((ra[k], rb[k]) for k in ra)
    ambos, solo_a, solo_b, ninguno = tabla[(True, True)], tabla[(True, False)], tabla[(False, True)], tabla[(False, False)]
    print(f"                 B acierta   B falla")
    print(f"   A acierta     {ambos:>9}   {solo_a:>7}")
    print(f"   A falla       {solo_b:>9}   {ninguno:>7}")
    p = mcnemar_exacto(solo_a, solo_b)
    print(f"\n   Pares discordantes: A sí/B no = {solo_a}, A no/B sí = {solo_b}")
    print(f"   McNemar exacto (bilateral): p = {p:.4f}")

    # Diferencia por tarea (A - B) en cada ensayo; bootstrap remuestreando tareas.
    tareas = sorted({k[0] for k in ra})
    dif = [[float(ra[k]) - float(rb[k]) for k in sorted(ra) if k[0] == t] for t in tareas]
    lo, hi = bootstrap_diferencia_pareada(dif, b=2000, semilla=0)
    diferencia = media([x for g in dif for x in g])
    print(f"   Diferencia de éxito A - B = {diferencia:+.3f}  IC95% bootstrap por tareas [{lo:+.3f}, {hi:+.3f}]")
    print("   Nota: McNemar trata cada (tarea, ensayo) como independiente; los ensayos de una misma")
    print("   tarea están correlacionados, así que su p-valor es optimista. El IC por tareas es más honesto.")


def ablacion(res: dict[str, list[dict]], resumenes: dict[str, dict]) -> None:
    if not {"react", "react_verificacion"} <= set(res):
        return
    sin, con = resumenes["react"], resumenes["react_verificacion"]
    print("\n5) ABLACIÓN: react SIN vs CON auto-verificación (mismo modelo, mismas semillas)\n")
    print(f"   Éxito:        {sin['exito']:.3f} -> {con['exito']:.3f}  ({con['exito'] - sin['exito']:+.3f})")
    print(f"   Coste/ensayo: {sin['coste']:.5f} -> {con['coste']:.5f}  (x{con['coste'] / sin['coste']:.2f})")
    print(f"   Coste/éxito:  {sin['coste_exito']:.5f} -> {con['coste_exito']:.5f}")

    def modos(nombre):
        return Counter(r["modo_interno"] for r in res[nombre] if not r["exito"] and r["modo_interno"])

    m_sin, m_con = modos("react"), modos("react_verificacion")
    print("   Fallos por modo (sin -> con):")
    for modo in sorted(set(m_sin) | set(m_con)):
        print(f"     {modo:<22} {m_sin.get(modo, 0):>3} -> {m_con.get(modo, 0):>3}")


def main() -> None:
    patrones = crear_patrones()
    parser = argparse.ArgumentParser(description="Compara patrones de agente (laboratorio 2)")
    parser.add_argument("--trials", type=int, default=10)
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--k-fiabilidad", type=int, default=3, help="k para la columna pass^k")
    parser.add_argument("--patrones", nargs="+", choices=sorted(patrones), default=list(patrones))
    parser.add_argument("--comparar", nargs=2, metavar=("A", "B"), default=["react", "react_verificacion"])
    parser.add_argument("--tareas", default=str(DIR_LAB01 / "tareas.json"))
    args = parser.parse_args()

    tareas = cargar_tareas(args.tareas)
    salida = Path(__file__).resolve().parent / "resultados"
    res = {}
    for nombre in args.patrones:
        res[nombre] = ejecutar_eval(tareas, patrones[nombre], k=args.trials, semilla=args.seed,
                                    ruta_transcripts=salida / f"{nombre}.jsonl")

    print(f"{len(tareas)} tareas × {args.trials} ensayos, semilla {args.seed}. Mismas semillas para todos los patrones.\n")
    resumenes = imprimir_tabla_principal(res, args.trials, min(args.k_fiabilidad, args.trials))
    imprimir_por_tipo(res)
    imprimir_modos_fallo(res)
    a, b = args.comparar
    if a in res and b in res:
        comparacion_pareada(res, a, b)
    ablacion(res, resumenes)
    print(f"\nTranscripts en {salida.name}/<patrón>.jsonl")


if __name__ == "__main__":
    main()
