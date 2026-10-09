"""(b) ¿Cuántas tareas necesito para detectar una mejora?

Dos fórmulas clásicas (aproximación normal, alfa bilateral):

* Muestras INDEPENDIENTES (dos agentes evaluados en conjuntos de tareas distintos):
      n = ( z_{1-α/2} * sqrt(2 p̄ q̄) + z_{1-β} * sqrt(p1 q1 + p2 q2) )² / (p1 - p2)²     por grupo
* Muestras PAREADAS (los dos agentes sobre las MISMAS tareas; test de McNemar):
      n = ( z_{1-α/2} * sqrt(p_disc) + z_{1-β} * sqrt(p_disc - δ²) )² / δ²
  donde p_disc es la proporción de tareas en las que los agentes discrepan y δ = p2 - p1.

Además verificamos la fórmula con una simulación de Monte Carlo.

Uso:
    python tamano_muestra.py
    python tamano_muestra.py --p1 0.70 --p2 0.75 --potencia 0.8
"""
from __future__ import annotations

import argparse
import math
import random
from statistics import NormalDist

Z = NormalDist()


def n_independientes(p1: float, p2: float, alfa: float = 0.05, potencia: float = 0.8) -> int:
    za, zb = Z.inv_cdf(1 - alfa / 2), Z.inv_cdf(potencia)
    p_barra = (p1 + p2) / 2
    num = za * math.sqrt(2 * p_barra * (1 - p_barra)) + zb * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))
    return math.ceil(num ** 2 / (p1 - p2) ** 2)


def n_pareadas(delta: float, p_disc: float, alfa: float = 0.05, potencia: float = 0.8) -> int:
    if p_disc <= delta ** 2 or p_disc < abs(delta):
        raise ValueError("p_disc debe ser >= |delta| (no puede haber menos discrepancias que la diferencia)")
    za, zb = Z.inv_cdf(1 - alfa / 2), Z.inv_cdf(potencia)
    return math.ceil((za * math.sqrt(p_disc) + zb * math.sqrt(p_disc - delta ** 2)) ** 2 / delta ** 2)


def potencia_simulada(p1: float, p2: float, n: int, alfa: float = 0.05, reps: int = 4000, seed: int = 0) -> float:
    """Fracción de simulaciones en las que un test z de dos proporciones detecta la diferencia."""
    rng = random.Random(seed)
    za = Z.inv_cdf(1 - alfa / 2)
    detecciones = 0
    for _ in range(reps):
        x1 = sum(rng.random() < p1 for _ in range(n))
        x2 = sum(rng.random() < p2 for _ in range(n))
        pb = (x1 + x2) / (2 * n)
        ee = math.sqrt(2 * pb * (1 - pb) / n)
        if ee > 0 and abs(x2 / n - x1 / n) / ee > za:
            detecciones += 1
    return detecciones / reps


def main() -> None:
    parser = argparse.ArgumentParser(description="Tamaño de muestra para comparar dos tasas de éxito (laboratorio 4b)")
    parser.add_argument("--p1", type=float, default=0.70)
    parser.add_argument("--p2", type=float, default=0.80)
    parser.add_argument("--alfa", type=float, default=0.05)
    parser.add_argument("--potencia", type=float, default=0.80)
    parser.add_argument("--discordancia", type=float, default=0.20,
                        help="proporción de tareas en que los dos agentes discrepan (diseño pareado)")
    args = parser.parse_args()

    n = n_independientes(args.p1, args.p2, args.alfa, args.potencia)
    print(f"Detectar {args.p1:.2f} -> {args.p2:.2f} con potencia {args.potencia:.0%} y α = {args.alfa}:")
    print(f"  Independientes: {n} tareas POR AGENTE")
    try:
        npar = n_pareadas(args.p2 - args.p1, args.discordancia, args.alfa, args.potencia)
        print(f"  Pareadas (mismas tareas, {args.discordancia:.0%} de discrepancias): {npar} tareas en total")
    except ValueError as exc:
        print(f"  Pareadas: {exc}")
    print(f"  Comprobación Monte Carlo con n = {n}: potencia ≈ {potencia_simulada(args.p1, args.p2, n, args.alfa):.3f}")

    print("\nTabla: tareas por agente (muestras independientes, potencia 80 %, α = 0,05)")
    deltas = [0.02, 0.05, 0.10, 0.15]
    print(f"  {'p base':>7}" + "".join(f"{f'+{d * 100:.0f} pts':>11}" for d in deltas))
    for p1 in (0.30, 0.50, 0.70, 0.85):
        fila = [n_independientes(p1, min(0.999, p1 + d)) for d in deltas]
        print(f"  {p1:>7.2f}" + "".join(f"{x:>11}" for x in fila))

    print("\nTabla: tareas en diseño PAREADO para +5 puntos según la discordancia")
    for disc in (0.05, 0.10, 0.20, 0.30):
        print(f"  discordancia {disc:.0%}: {n_pareadas(0.05, disc):>6} tareas")
    print("\nMoraleja: detectar mejoras de pocos puntos exige cientos o miles de tareas; evaluar ambos agentes")
    print("sobre las MISMAS tareas (y analizarlo de forma pareada) reduce mucho el número necesario.")


if __name__ == "__main__":
    main()
