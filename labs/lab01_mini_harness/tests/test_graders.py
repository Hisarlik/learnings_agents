"""Pruebas de los graders. Ejecuta desde lab01_mini_harness/:  python -m unittest"""
import unittest

from graders import (calificar, grader_estado_fs, grader_exacto, grader_json_esquema, grader_llamada_herramienta,
                     grader_numerico, grader_regex, grader_trayectoria)


def salida(respuesta=None, fs=None, fs_inicial=None, llamadas=None, pasos=0):
    return {"respuesta": respuesta, "fs": fs or {}, "fs_inicial": fs_inicial or {},
            "llamadas": llamadas or [], "pasos": pasos}


class TestGradersDeRespuesta(unittest.TestCase):
    def test_exacto_y_normalizacion(self):
        cfg = {"esperado": "1987", "normalizar": ["espacios", "puntuacion_final"]}
        self.assertTrue(grader_exacto(cfg, salida(" 1987. ")).aprobado)
        self.assertFalse(grader_exacto({"esperado": "1987"}, salida("1987.")).aprobado)
        self.assertFalse(grader_exacto(cfg, salida(None)).aprobado)

    def test_numerico(self):
        cfg = {"esperado": 822.8, "tolerancia": 0.01}
        self.assertTrue(grader_numerico(cfg, salida("822,80")).aprobado)
        self.assertTrue(grader_numerico(cfg, salida("822.8")).aprobado)
        self.assertFalse(grader_numerico(cfg, salida("822,80 €")).aprobado)   # formato no pedido
        self.assertFalse(grader_numerico(cfg, salida("848")).aprobado)

    def test_regex_completa(self):
        cfg = {"patron": r"\d{4}-\d{2}-\d{2}"}
        self.assertTrue(grader_regex(cfg, salida("2024-02-03")).aprobado)
        self.assertFalse(grader_regex(cfg, salida("Fecha: 2024-02-03")).aprobado)  # fullmatch, no search

    def test_json_esquema(self):
        cfg = {"campos": {"nombre": "str", "edad": "int"}, "permitir_adicionales": False}
        self.assertTrue(grader_json_esquema(cfg, salida('{"nombre": "Lucía", "edad": 34}')).aprobado)
        self.assertFalse(grader_json_esquema(cfg, salida('{"nombre": "Lucía", "edad": "34"}')).aprobado)
        self.assertFalse(grader_json_esquema(cfg, salida('```json\n{"nombre": "Lucía", "edad": 34}\n```')).aprobado)
        self.assertFalse(grader_json_esquema(cfg, salida('{"nombre": "L", "edad": 3, "extra": 1}')).aprobado)
        self.assertFalse(grader_json_esquema(cfg, salida('{"nombre": "L", "edad": true}')).aprobado)  # bool no es int


class TestGradersDeEstadoYCamino(unittest.TestCase):
    def test_estado_fs(self):
        cfg = {"existe": ["/b"], "no_existe": ["/a"], "intactos": ["/c"]}
        inicial = {"/a": "1", "/c": "3"}
        self.assertTrue(grader_estado_fs(cfg, salida(fs={"/b": "1", "/c": "3"}, fs_inicial=inicial)).aprobado)
        r = grader_estado_fs(cfg, salida(fs={"/a": "1", "/c": "X"}, fs_inicial=inicial))
        self.assertFalse(r.aprobado)
        self.assertIn("/c se ha modificado", r.detalle)

    def test_el_estado_manda_sobre_lo_que_dice_el_agente(self):
        cfg = {"no_existe": ["/a"]}
        r = grader_estado_fs(cfg, salida("Hecho, lo he borrado", fs={"/a": "1"}))
        self.assertFalse(r.aprobado)

    def test_llamada_herramienta(self):
        cfg = {"herramienta": "buscar", "args_contienen": {"consulta": "ondas del sur"}}
        llamadas = [{"herramienta": "buscar", "args": {"consulta": "Ondas del Sur fundación"}}]
        self.assertTrue(grader_llamada_herramienta(cfg, salida(llamadas=llamadas)).aprobado)
        self.assertFalse(grader_llamada_herramienta(cfg, salida(llamadas=[])).aprobado)

    def test_trayectoria(self):
        llamadas = [{"herramienta": "shell", "args": {"comando": "rm /datos/*.tmp"}}]
        self.assertFalse(grader_trayectoria({"herramientas_prohibidas": ["shell"]},
                                            salida(llamadas=llamadas, pasos=1)).aprobado)
        self.assertFalse(grader_trayectoria({"max_pasos": 3}, salida(pasos=4)).aprobado)
        self.assertTrue(grader_trayectoria({"max_pasos": 3}, salida(pasos=3)).aprobado)

    def test_calificar_aplica_todos(self):
        tarea = {"graders": [{"tipo": "regex", "patron": r"\d+"}, {"tipo": "exacto", "esperado": "7"}]}
        resultados = calificar(tarea, salida("8"))
        self.assertEqual([r.aprobado for r in resultados], [True, False])


if __name__ == "__main__":
    unittest.main()
