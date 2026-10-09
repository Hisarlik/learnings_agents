"""(c) Curvas de pass@k y pass^k como tablas y gráficos ASCII.

Para una tarea con probabilidad de éxito p por intento (intentos independientes):
    pass@k = 1 - (1 - p)^k     (al menos uno de k sale bien)
    pass^k = p^k               (los k salen bien)

En un benchmark real cada tarea tiene su propia p. Promediar pass^k sobre
tareas NO es lo mismo que elevar la media de p a k: la heterogeneidad importa.

Uso:
    python curvas_passk.py
    python curvas_passk.py --p 0.9 --kmax 20
"""
from __future__ import annotations

import argparse
from statistics import mean


def pass_at(p: float, k: int) -> float:
    return 1 - (1 - p) ** k


def pass_hat(p: float, k: int) -> float:
    return p ** k


def tabla(ps: list[float], kmax: int) -> None:
    ks = [k for k in (1, 2, 3, 5, 8, 10, 15, 20) if k <= kmax]
    print(f"{'p':>6} | " + " ".join(f"{f'@{k}':>6}" for k in ks) + " || " + " ".join(f"{f'^{k}':>6}" for k in ks))
    print("-" * (9 + 14 * len(ks) + 3))
    for p in ps:
        print(f"{p:>6.2f} | " + " ".join(f"{pass_at(p, k):>6.3f}" for k in ks)
              + " || " + " ".join(f"{pass_hat(p, k):>6.3f}" for k in ks))


def grafico(p: float, kmax: int, alto: int = 10) -> None:
    """Dibuja pass@k ('@') y pass^k ('^') frente a k."""
    print(f"\nCurvas para p = {p}   ('@' = pass@k, '^' = pass^k, '*' = ambas)")
    for fila in range(alto, -1, -1):
        y = fila / alto
        linea = ""
        for k in range(1, kmax + 1):
            a = round(pass_at(p, k) * alto) == fila
            h = round(pass_hat(p, k) * alto) == fila
            linea += " * " if a and h else " @ " if a else " ^ " if h else "   "
        print(f"{y:4.2f} |{linea}")
    print("     +" + "---" * kmax)
    print("      " + "".join(f"{k:^3}" for k in range(1, kmax + 1)) + "  k")


def main() -> None:
    parser = argparse.ArgumentParser(description="pass@k frente a pass^k (laboratorio 4c)")
    parser.add_argument("--p", type=float, default=0.7, help="p para el gráfico")
    parser.add_argument("--kmax", type=int, default=10)
    args = parser.parse_args()

    print("TABLA: pass@k (izquierda) y pass^k (derecha) para una tarea con éxito p por intento\n")
    tabla([0.3, 0.5, 0.7, 0.9, 0.95, 0.99], args.kmax)
    grafico(args.p, args.kmax)

    # Heterogeneidad: dos benchmarks con la MISMA media de p.
    homogeneo = [0.7] * 10
    heterogeneo = [1.0] * 7 + [0.0] * 3  # 7 tareas siempre bien, 3 siempre mal
    print("\nDOS BENCHMARKS CON LA MISMA TASA MEDIA (0,70)")
    print(f"{'k':>3} | {'homog. pass@k':>14} {'homog. pass^k':>14} | {'heter. pass@k':>14} {'heter. pass^k':>14}")
    for k in (1, 3, 5, 10):
        print(f"{k:>3} | {mean(pass_at(p, k) for p in homogeneo):>14.3f} {mean(pass_hat(p, k) for p in homogeneo):>14.3f}"
              f" | {mean(pass_at(p, k) for p in heterogeneo):>14.3f} {mean(pass_hat(p, k) for p in heterogeneo):>14.3f}")
    print("\nCon tareas homogéneas, pass^k se desploma con k (fallos aleatorios); con tareas heterogéneas,")
    print("pass^k se queda en 0,70 (los fallos son sistemáticos: siempre las mismas tareas).")


if __name__ == "__main__":
    main()
