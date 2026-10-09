"""Métricas e incertidumbre para resultados de evals (solo biblioteca estándar).

Notación: para una tarea hacemos ``n`` ensayos y ``c`` salen bien.

* pass@k: probabilidad de que AL MENOS UNO de k intentos salga bien.
  Estimador insesgado (Chen et al., 2021): 1 - C(n-c, k) / C(n, k).
* pass^k: probabilidad de que LOS k intentos salgan bien (fiabilidad).
  Estimador insesgado: C(c, k) / C(n, k).

Ambos se calculan por tarea y luego se promedian entre tareas.
"""
from __future__ import annotations

import math
import random
from statistics import NormalDist


# ------------------------------------------------------------------ pass@k
def pass_at_k(n: int, c: int, k: int) -> float:
    """Estimador insesgado de pass@k para una tarea (n ensayos, c éxitos)."""
    if not 0 <= c <= n or not 1 <= k <= n:
        raise ValueError("se necesita 0 <= c <= n y 1 <= k <= n")
    if n - c < k:  # es imposible elegir k ensayos y que todos fallen
        return 1.0
    return 1.0 - math.comb(n - c, k) / math.comb(n, k)


def pass_hat_k(n: int, c: int, k: int) -> float:
    """Estimador insesgado de pass^k para una tarea (n ensayos, c éxitos)."""
    if not 0 <= c <= n or not 1 <= k <= n:
        raise ValueError("se necesita 0 <= c <= n y 1 <= k <= n")
    return math.comb(c, k) / math.comb(n, k)  # math.comb(c, k) = 0 si k > c


def media(valores: list[float]) -> float:
    return sum(valores) / len(valores) if valores else float("nan")


def promedio_por_tareas(conteos: list[tuple[int, int]], k: int, funcion) -> float:
    """Promedia pass@k o pass^k sobre tareas. ``conteos`` = [(n, c), ...]."""
    return media([funcion(n, c, k) for n, c in conteos])


# --------------------------------------------------------- incertidumbre
def wilson(exitos: int, n: int, confianza: float = 0.95) -> tuple[float, float]:
    """Intervalo de Wilson para una proporción. Se porta bien con n pequeño o p cerca de 0/1.

    OJO: supone ensayos independientes. Si hay varios ensayos por tarea no lo
    son (están agrupados por tarea) y el intervalo sale demasiado estrecho.
    """
    if n == 0:
        return (0.0, 1.0)
    z = NormalDist().inv_cdf(0.5 + confianza / 2)
    p = exitos / n
    denominador = 1 + z * z / n
    centro = (p + z * z / (2 * n)) / denominador
    margen = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denominador
    return (max(0.0, centro - margen), min(1.0, centro + margen))


def error_estandar_ingenuo(valores: list[float]) -> float:
    """EE de la media tratando cada ensayo como independiente."""
    n = len(valores)
    if n < 2:
        return float("nan")
    m = media(valores)
    varianza = sum((x - m) ** 2 for x in valores) / (n - 1)
    return math.sqrt(varianza / n)


def error_estandar_agrupado(grupos: list[list[float]]) -> float:
    """EE de la media global con errores agrupados (*clustered*) por tarea.

    Fórmula "sándwich" para la media: sqrt( sum_c (sum_{i en c} (x_i - media))^2 ) / N.
    Si los ensayos de una misma tarea se parecen mucho entre sí (lo normal), este
    EE es mayor que el ingenuo: tienes menos información de la que parece.
    """
    todos = [x for g in grupos for x in g]
    n = len(todos)
    if n == 0:
        return float("nan")
    m = media(todos)
    suma = sum(sum(x - m for x in g) ** 2 for g in grupos)
    # Corrección para pocos grupos (G / (G - 1)), habitual en EE agrupados.
    G = len(grupos)
    factor = G / (G - 1) if G > 1 else 1.0
    return math.sqrt(factor * suma) / n


def bootstrap_ic(grupos: list[list[float]], b: int = 2000, confianza: float = 0.95,
                 semilla: int = 0) -> tuple[float, float]:
    """IC por bootstrap remuestreando TAREAS (no ensayos sueltos).

    Remuestrear tareas respeta que los ensayos de una misma tarea están
    correlacionados. Devuelve el intervalo percentil de la media global.
    """
    rng = random.Random(semilla)
    estadisticos = []
    for _ in range(b):
        muestra = [rng.choice(grupos) for _ in grupos]
        estadisticos.append(media([x for g in muestra for x in g]))
    estadisticos.sort()
    alfa = 1 - confianza
    lo = estadisticos[int(alfa / 2 * b)]
    hi = estadisticos[min(b - 1, int((1 - alfa / 2) * b))]
    return (lo, hi)


# ------------------------------------------------------ comparación pareada
def mcnemar_exacto(b: int, c: int) -> float:
    """Test exacto de McNemar (bilateral).

    b = pares en los que A acierta y B falla; c = A falla y B acierta.
    Bajo H0 (mismo rendimiento) cada par discordante cae de un lado con p=0,5,
    así que b ~ Binomial(b + c, 0,5). Los pares concordantes no informan.
    """
    n = b + c
    if n == 0:
        return 1.0
    cola = sum(math.comb(n, i) for i in range(min(b, c) + 1)) / 2 ** n
    return min(1.0, 2 * cola)


def bootstrap_diferencia_pareada(dif_por_tarea: list[list[float]], b: int = 2000,
                                 confianza: float = 0.95, semilla: int = 0) -> tuple[float, float]:
    """IC bootstrap (por tareas) de la diferencia media A - B en datos pareados."""
    return bootstrap_ic(dif_por_tarea, b=b, confianza=confianza, semilla=semilla)
