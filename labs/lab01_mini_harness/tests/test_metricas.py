"""Pruebas de las métricas. Ejecuta desde lab01_mini_harness/:  python -m unittest"""
import math
import random
import unittest

from metricas import (bootstrap_ic, error_estandar_agrupado, error_estandar_ingenuo, mcnemar_exacto, pass_at_k,
                      pass_hat_k, wilson)


class TestPassK(unittest.TestCase):
    def test_k1_es_la_tasa_de_exito(self):
        # Con k = 1, pass@1 y pass^1 coinciden con c / n.
        self.assertAlmostEqual(pass_at_k(10, 6, 1), 0.6)
        self.assertAlmostEqual(pass_hat_k(10, 6, 1), 0.6)

    def test_casos_extremos(self):
        self.assertEqual(pass_at_k(5, 0, 3), 0.0)
        self.assertEqual(pass_at_k(5, 5, 3), 1.0)
        self.assertEqual(pass_hat_k(5, 5, 3), 1.0)
        self.assertEqual(pass_hat_k(5, 2, 3), 0.0)   # imposible que 3 de 3 elegidos sean éxitos
        self.assertEqual(pass_at_k(5, 3, 3), 1.0)    # solo hay 2 fallos: imposible elegir 3 fallos

    def test_valor_conocido(self):
        # n=10, c=6, k=3: pass@k = 1 - C(4,3)/C(10,3) = 1 - 4/120; pass^k = C(6,3)/C(10,3) = 20/120
        self.assertAlmostEqual(pass_at_k(10, 6, 3), 1 - 4 / 120)
        self.assertAlmostEqual(pass_hat_k(10, 6, 3), 20 / 120)

    def test_monotonia_en_k(self):
        a = [pass_at_k(10, 4, k) for k in range(1, 11)]
        b = [pass_hat_k(10, 4, k) for k in range(1, 11)]
        self.assertEqual(a, sorted(a))                 # pass@k crece con k
        self.assertEqual(b, sorted(b, reverse=True))   # pass^k decrece con k

    def test_insesgado_por_simulacion(self):
        # Con p conocida, la media del estimador de pass^k debe acercarse a p^k.
        rng = random.Random(0)
        p, n, k = 0.7, 8, 3
        estimaciones = []
        for _ in range(20000):
            c = sum(rng.random() < p for _ in range(n))
            estimaciones.append(pass_hat_k(n, c, k))
        self.assertAlmostEqual(sum(estimaciones) / len(estimaciones), p ** k, delta=0.01)

    def test_argumentos_invalidos(self):
        with self.assertRaises(ValueError):
            pass_at_k(5, 6, 1)
        with self.assertRaises(ValueError):
            pass_hat_k(5, 2, 6)


class TestIntervalos(unittest.TestCase):
    def test_wilson_contiene_la_proporcion(self):
        lo, hi = wilson(30, 50)
        self.assertLess(lo, 0.6)
        self.assertGreater(hi, 0.6)
        # Valor de referencia (calculado aparte): aprox. [0.462, 0.724]
        self.assertAlmostEqual(lo, 0.4618, places=3)
        self.assertAlmostEqual(hi, 0.7239, places=3)

    def test_wilson_en_los_bordes(self):
        lo, hi = wilson(0, 10)
        self.assertAlmostEqual(lo, 0.0)
        self.assertGreater(hi, 0.2)   # con 0/10 no podemos afirmar que p = 0

    def test_agrupado_mayor_con_tareas_heterogeneas(self):
        # Tareas que o siempre salen o nunca salen: los ensayos repetidos no aportan información nueva.
        grupos = [[1.0] * 5] * 5 + [[0.0] * 5] * 5
        todos = [x for g in grupos for x in g]
        self.assertGreater(error_estandar_agrupado(grupos), 2 * error_estandar_ingenuo(todos))

    def test_bootstrap_cubre_la_media(self):
        grupos = [[1, 1, 0], [0, 0, 1], [1, 1, 1], [0, 1, 0]]
        lo, hi = bootstrap_ic(grupos, b=500, semilla=1)
        self.assertLessEqual(lo, 7 / 12)
        self.assertGreaterEqual(hi, 7 / 12)


class TestMcNemar(unittest.TestCase):
    def test_simetrico_y_sin_discordancias(self):
        self.assertEqual(mcnemar_exacto(0, 0), 1.0)
        self.assertAlmostEqual(mcnemar_exacto(3, 9), mcnemar_exacto(9, 3))

    def test_valor_conocido(self):
        # b=1, c=9: p = 2 * (C(10,0) + C(10,1)) / 2^10 = 22/1024
        self.assertAlmostEqual(mcnemar_exacto(1, 9), 22 / 1024)
        self.assertTrue(math.isclose(mcnemar_exacto(5, 5), 1.0))


if __name__ == "__main__":
    unittest.main()
