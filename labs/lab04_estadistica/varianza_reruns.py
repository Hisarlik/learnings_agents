"""(a) ¿Cuánto varía una puntuación si vuelves a ejecutar la MISMA eval?

Simulamos un agente con una probabilidad de éxito "verdadera" distinta en cada
tarea (unas fáciles, otras difíciles) y repetimos la eval muchas veces:

1. Re-ejecuciones: mismas tareas, nuevos ensayos -> ruido de muestreo de ensayos.
2. Otro conjunto de tareas: tareas nuevas de la misma "población" -> además,
   ruido de muestreo de tareas (lo que pasa si tu benchmark fuera otro igual de válido).
3. Dos agentes IDÉNTICOS: ¿con qué frecuencia uno "gana" al otro por X puntos?

Uso:
    python varianza_reruns.py
    python varianza_reruns.py --tareas 200 --ensayos 3
"""
from __future__ import annotations

import argparse
import random
from statistics import mean, pstdev


def generar_tareas(n: int, p_media: float, concentracion: float, rng: random.Random) -> list[float]:
    """Probabilidades verdaderas por tarea ~ Beta(a, b) con media p_media.

    Concentración baja => tareas muy heterogéneas (muchas casi siempre bien o casi siempre mal).
    """
    a, b = p_media * concentracion, (1 - p_media) * concentracion
    return [rng.betavariate(a, b) for _ in range(n)]


def ejecutar_eval(ps: list[float], ensayos: int, rng: random.Random) -> float:
    """Puntuación observada = media de éxitos sobre tareas × ensayos."""
    return mean(sum(rng.random() < p for _ in range(ensayos)) / ensayos for p in ps)


def histograma(valores: list[float], ancho_bin: float = 0.02, ancho_barra: int = 50) -> None:
    lo = min(valores)
    inicio = int(lo / ancho_bin) * ancho_bin
    bins: dict[int, int] = {}
    for v in valores:
        bins[int((v - inicio) / ancho_bin + 1e-9)] = bins.get(int((v - inicio) / ancho_bin + 1e-9), 0) + 1
    maximo = max(bins.values())
    for i in range(min(bins), max(bins) + 1):
        c = bins.get(i, 0)
        barra = "#" * round(c / maximo * ancho_barra)
        print(f"  {inicio + i * ancho_bin:5.2f}-{inicio + (i + 1) * ancho_bin:4.2f} | {barra} {c}")


def percentiles(valores: list[float]) -> tuple[float, float]:
    s = sorted(valores)
    return s[int(0.025 * len(s))], s[int(0.975 * len(s)) - 1]


def main() -> None:
    parser = argparse.ArgumentParser(description="Varianza de una eval entre re-ejecuciones (laboratorio 4a)")
    parser.add_argument("--tareas", type=int, default=50)
    parser.add_argument("--ensayos", type=int, default=1, help="ensayos por tarea en cada ejecución")
    parser.add_argument("--p-media", type=float, default=0.65)
    parser.add_argument("--concentracion", type=float, default=2.0, help="baja = tareas más heterogéneas")
    parser.add_argument("--repeticiones", type=int, default=2000)
    parser.add_argument("--seed", type=int, default=0)
    args = parser.parse_args()

    rng = random.Random(args.seed)
    ps = generar_tareas(args.tareas, args.p_media, args.concentracion, rng)
    verdadera = mean(ps)
    print(f"{args.tareas} tareas, {args.ensayos} ensayo(s) por tarea. Éxito verdadero medio de ESTAS tareas: {verdadera:.3f}")

    # 1) Re-ejecutar la misma eval.
    reruns = [ejecutar_eval(ps, args.ensayos, rng) for _ in range(args.repeticiones)]
    lo, hi = percentiles(reruns)
    print(f"\n1) RE-EJECUCIONES de la misma eval ({args.repeticiones} veces)")
    print(f"   media {mean(reruns):.3f}  desviación {pstdev(reruns):.3f}  95% de las ejecuciones en [{lo:.3f}, {hi:.3f}]")
    histograma(reruns)

    # 2) Cambiar también el conjunto de tareas.
    otros = [ejecutar_eval(generar_tareas(args.tareas, args.p_media, args.concentracion, rng), args.ensayos, rng)
             for _ in range(args.repeticiones)]
    lo2, hi2 = percentiles(otros)
    print(f"\n2) OTRO CONJUNTO de {args.tareas} tareas de la misma población en cada repetición")
    print(f"   media {mean(otros):.3f}  desviación {pstdev(otros):.3f}  95% en [{lo2:.3f}, {hi2:.3f}]")
    histograma(otros)

    # 3) Dos agentes idénticos sobre las mismas tareas.
    difs = [ejecutar_eval(ps, args.ensayos, rng) - ejecutar_eval(ps, args.ensayos, rng)
            for _ in range(args.repeticiones)]
    print("\n3) DOS AGENTES IDÉNTICOS (misma p en cada tarea), misma eval")
    for umbral in (0.02, 0.05, 0.10):
        frac = mean(abs(d) >= umbral - 1e-12 for d in difs)
        print(f"   |diferencia| >= {umbral * 100:>4.0f} puntos en el {frac * 100:5.1f}% de las comparaciones")
    print("\n   Moraleja: una 'mejora' más pequeña que este ruido no es evidencia de nada.")


if __name__ == "__main__":
    main()
