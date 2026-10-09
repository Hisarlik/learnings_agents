# Laboratorio 2 · Comparar patrones de agente

Objetivo: evaluar varios **patrones** de agente sobre las MISMAS tareas del laboratorio 1 con el
MISMO harness, y aprender a comparar resultados con rigor (coste, fiabilidad, comparación pareada y
ablación).

## Patrones (`patrones.py`)

| Patrón | Idea | Cómo se simula |
|--------|------|----------------|
| `un_disparo` | Una sola llamada que emite todas las acciones sin ver resultados intermedios | Menos llamadas al modelo; peor en tareas con estado o herramientas |
| `react` | Bucle pensar → actuar → observar | Agente base del lab 1 |
| `react_verificacion` | ReAct + revisión del propio trabajo antes de responder | Detecta y corrige algunos errores; cuesta más |
| `voto_mayoria_3` | 3 muestras en entornos clonados y voto por mayoría de la respuesta | Coste ×3; se aplica el estado de la rama ganadora |
| `evaluador_optimizador` | Un generador y un evaluador que lo critica hasta 3 rondas | El evaluador detecta errores con cierta probabilidad y a veces da falsas alarmas |

Todos implementan `resolver(tarea, entorno, registro, rng)`, así que `harness.ejecutar_eval` del
laboratorio 1 los evalúa sin cambios. Las probabilidades de detección son **supuestos didácticos**,
no medidas de modelos reales.

## Ejecutar

```bash
python comparar.py                          # 5 patrones, 10 ensayos por tarea
python comparar.py --comparar react_verificacion voto_mayoria_3
python comparar.py --patrones react react_verificacion --trials 30
python comparar.py --seed 1
```

## Salida esperada (semilla 0, 10 ensayos)

```text
Patrón                   Éxito           IC95%   pass^3  pass^10  Coste/ens.  Coste/éxito  Llamadas
un_disparo               0.683    [0.55, 0.82]    0.398    0.167     0.00447      0.00655      1.49
react                    0.750    [0.65, 0.85]    0.454    0.167     0.00642      0.00856      1.82
react_verificacion       0.850    [0.78, 0.92]    0.619    0.250     0.00932      0.01097      2.17
voto_mayoria_3           0.808    [0.70, 0.91]    0.575    0.333     0.01984      0.02455      5.60
evaluador_optimizador    0.858    [0.78, 0.93]    0.651    0.250     0.01117      0.01302      3.14
```

Después verás el éxito por tipo de tarea, los modos de fallo por patrón, la comparación pareada
(tabla 2×2, McNemar exacto, IC bootstrap de la diferencia por tareas) y la ablación de la verificación.

## Preguntas para responder

1. ¿Qué patrón elegirías si el coste no importa? ¿Y si cada ensayo cuesta dinero real? Usa la columna
   *coste por éxito* y dibuja (en papel) la frontera de Pareto coste-éxito.
2. En la tabla por tipo, ¿dónde ayuda el voto por mayoría y dónde casi no? Pista: ¿qué se vota en una
   tarea de ficheros cuya respuesta es "Hecho"?
3. En la comparación `react` vs `react_verificacion`, la casilla "A acierta / B falla" vale 0. ¿Por qué?
   (Piensa en las semillas compartidas y en qué cambia la verificación.) ¿Qué ventaja tiene para medir?
4. McNemar da p ≈ 0,0005, pero los 120 pares no son independientes (10 ensayos por tarea). ¿Es más
   honesto el IC bootstrap por tareas? Calcula McNemar usando solo un ensayo por tarea y compáralo.
5. En la ablación, ¿qué modos de fallo elimina la verificación y cuáles no? ¿Por qué no puede arreglar
   `herramienta_prohibida`? ¿Qué harías en su lugar (pista: permisos del harness, no del agente)?
6. Compara `react_verificacion` con `voto_mayoria_3`. ¿Hay diferencia significativa? ¿Cuántos ensayos
   necesitarías para detectar una diferencia de 4 puntos? (Usa el laboratorio 4.)
7. Cambia `P_DETECTAR_EVALUADOR` para que el evaluador sea peor que la auto-verificación. ¿Sigue
   mereciendo la pena el patrón evaluador-optimizador?
