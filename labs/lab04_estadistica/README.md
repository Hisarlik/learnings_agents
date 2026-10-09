# Laboratorio 4 · Estadística para evals

Tres scripts cortos (solo biblioteca estándar) para desarrollar intuición sobre la incertidumbre.

| Script | Pregunta que responde |
|--------|-----------------------|
| `varianza_reruns.py` | ¿Cuánto cambia la puntuación si repito la misma eval? ¿Y si el benchmark fuera otro igual de válido? ¿Cuántas veces "gana" un agente a otro idéntico? |
| `tamano_muestra.py` | ¿Cuántas tareas necesito para detectar una mejora de X puntos? ¿Cuánto ayuda un diseño pareado? |
| `curvas_passk.py` | ¿Cómo crecen pass@k y caen pass^k con k? ¿Qué cambia si las tareas son heterogéneas? |

## Ejecutar

```bash
python varianza_reruns.py                       # 50 tareas, 1 ensayo, p media 0,65
python varianza_reruns.py --tareas 200 --ensayos 3
python tamano_muestra.py --p1 0.70 --p2 0.80
python curvas_passk.py --p 0.9 --kmax 20
```

## Salida esperada (extractos)

```text
1) RE-EJECUCIONES de la misma eval (2000 veces)
   media 0.675  desviación 0.058  95% de las ejecuciones en [0.560, 0.780]
3) DOS AGENTES IDÉNTICOS (misma p en cada tarea), misma eval
   |diferencia| >=    5 puntos en el  53.4% de las comparaciones
   |diferencia| >=   10 puntos en el  26.2% de las comparaciones

Detectar 0.70 -> 0.80 con potencia 80% y α = 0.05:
  Independientes: 294 tareas POR AGENTE
  Pareadas (mismas tareas, 20% de discrepancias): 155 tareas en total
  Comprobación Monte Carlo con n = 294: potencia ≈ 0.799
```

## Preguntas y ejercicios

1. Con 50 tareas y 1 ensayo, ¿qué diferencia mínima entre dos agentes te tomarías en serio?
   Repite con `--tareas 200` y `--ensayos 3`. ¿Qué reduce más el ruido de re-ejecución?
2. Compara la desviación del apartado 1 (mismas tareas) con la del 2 (otras tareas). ¿Qué fuente de
   variación ignoras si solo re-ejecutas tu benchmark?
3. En `tamano_muestra.py`, ¿por qué hacen falta menos tareas con p base 0,85 que con 0,50?
4. ¿Por qué el diseño pareado necesita menos tareas cuanto menor es la discordancia?
5. En `curvas_passk.py`, los dos benchmarks tienen la misma tasa media pero pass^10 muy distinto.
   ¿Cuál se parece más a un agente "inestable" y cuál a uno "con huecos de capacidad"? ¿Qué harías
   para mejorar cada uno?
