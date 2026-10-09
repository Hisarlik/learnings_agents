#!/usr/bin/env python3
"""Genera las dos versiones del curso a partir de curso/assets y curso/modulos.

- curso/index.html: documento completo que carga los ficheros por separado
  (ábrelo directamente en el navegador o sírvelo con `python -m http.server`).
- dist/curso-evaluacion-agentes.html: un único fichero autocontenido (CSS y JS
  en línea), pensado para publicarse como página.

Uso: python3 scripts/build.py
"""
from __future__ import annotations

import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CURSO = RAIZ / "curso"
DIST = RAIZ / "dist"

TITULO = "Curso de Evaluación de Agentes"
FUENTES = (
    "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800"
    "&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
)
HLJS = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"

CUERPO = """<header class="topbar">
  <button class="btn-icono btn-menu" id="btn-menu" type="button" aria-label="Abrir índice">
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
  </button>
  <a class="marca" href="#inicio">
    <span class="marca-logo" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 13l4-5 3 3 6-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="3" r="1.6" fill="currentColor"/></svg>
    </span>
    <span class="marca-texto">Evaluación de Agentes</span>
  </a>
  <span class="espacio"></span>
  <div class="progreso-global" title="Progreso del curso">
    <span class="txt">progreso</span>
    <span class="barra"><span id="barra-global"></span></span>
    <span id="txt-global">0 %</span>
  </div>
  <button class="btn-icono" id="btn-tema" type="button" aria-label="Cambiar tema claro/oscuro">
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 2.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg>
  </button>
</header>
<div class="layout">
  <aside class="sidebar" id="nav" aria-label="Índice del curso"></aside>
  <main class="main"><div id="vista" class="contenido"></div></main>
</div>
"""


def modulos() -> list[pathlib.Path]:
    ficheros = sorted((CURSO / "modulos").glob("m*.js"))
    extras = CURSO / "modulos" / "extras.js"
    return ficheros + ([extras] if extras.exists() else [])


def index_local() -> str:
    scripts = ["assets/app.js", "assets/widgets.js"] + [f"modulos/{p.name}" for p in modulos()]
    tags = "\n".join(f'<script src="{s}"></script>' for s in scripts)
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITULO}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FUENTES}">
<link rel="stylesheet" href="assets/styles.css">
<script src="{HLJS}"></script>
</head>
<body>
<!-- Generado por scripts/build.py: no editar a mano -->
{CUERPO}
{tags}
</body>
</html>
"""


def js_en_linea(texto: str) -> str:
    # Evita que un "</script" dentro de una cadena cierre la etiqueta.
    return re.sub(r"</(script)", r"<\\/\1", texto, flags=re.IGNORECASE)


def artefacto() -> str:
    css = (CURSO / "assets" / "styles.css").read_text(encoding="utf-8")
    partes = [CURSO / "assets" / "app.js", CURSO / "assets" / "widgets.js", *modulos()]
    js = "\n;\n".join(js_en_linea(p.read_text(encoding="utf-8")) for p in partes)
    return f"""<title>{TITULO}</title>
<link rel="stylesheet" href="{FUENTES}">
<style>
{css}
</style>
{CUERPO}
<script src="{HLJS}"></script>
<script>
{js}
</script>
"""


def main() -> None:
    (CURSO / "index.html").write_text(index_local(), encoding="utf-8")
    DIST.mkdir(exist_ok=True)
    salida = DIST / "curso-evaluacion-agentes.html"
    salida.write_text(artefacto(), encoding="utf-8")
    print(f"✓ {CURSO / 'index.html'}")
    print(f"✓ {salida} ({salida.stat().st_size / 1024:.0f} KB)")
    print(f"  módulos: {', '.join(p.name for p in modulos())}")


if __name__ == "__main__":
    main()
