registrarModulo({
  id: 'm11',
  numero: 11,
  titulo: 'Laboratorio práctico: construye y ejecuta tus evals',
  subtitulo: 'Cinco laboratorios en Python para construir un harness, comparar patrones, calibrar un juez LLM y razonar con incertidumbre, casi todos sin API key.',
  duracion: '240 min',
  nivel: 'Intermedio',
  objetivos: [
    'Ejecutar un harness de evaluación con entornos aislados, límite de pasos y transcripts, y leer sus resultados por tarea y en agregado',
    'Implementar y probar graders de respuesta, de estado y de trayectoria, y reconocer cuándo un grader es injusto',
    'Comparar patrones de agente con un diseño pareado (McNemar e intervalo bootstrap por tareas) y una ablación, sin perder de vista el coste',
    'Calibrar un juez LLM contra etiquetas humanas con TPR, TNR y kappa de Cohen, y comprobar su sesgo de posición',
    'Estimar la variación entre re-ejecuciones y el tamaño de muestra necesario antes de afirmar que un agente ha mejorado',
    'Trasladar las piezas del harness casero a Inspect AI: dataset, solver, sandbox, scorer y épocas',
  ],
  secciones: [
    // ───────────────────────────────────────────────────────────── s1
    {
      id: 's1',
      titulo: 'Antes de empezar: el mini-runner y tu entorno',
      bloques: [
        { tipo: 'p', html: `Hasta ahora has visto la teoría: qué es un <em>harness</em> (M04), cómo se diseñan los <em>graders</em> (M06), qué miden pass@k y pass^k (M08) y qué trampas acechan (M10). En este módulo <strong>lo vas a construir y ejecutar</strong>. Encontrarás cinco laboratorios en la carpeta <code>labs/</code> del repositorio. Cada sección de este módulo corresponde a uno de ellos y te dice qué hace, qué código mirar, qué comando ejecutar, qué salida esperar y qué preguntas responder.` },
        { tipo: 'tabla', titulo: 'Los cinco laboratorios', columnas: ['Lab', 'Qué construyes', 'Necesita'], filas: [
          ['<code>lab01_mini_harness</code>', 'Harness con tareas en JSON, entorno aislado, agente simulado, siete tipos de grader, transcripts y métricas con intervalos', 'Python 3.10+'],
          ['<code>lab02_comparar_patrones</code>', 'Cinco patrones de agente sobre las mismas tareas, comparación pareada con McNemar y ablación', 'Python 3.10+'],
          ['<code>lab03_llm_juez</code>', 'Juez con rúbrica binaria, calibración contra etiquetas humanas y prueba de intercambio de posiciones', 'Python 3.10+ (opcional: <code>anthropic</code> y API key)'],
          ['<code>lab04_estadistica</code>', 'Varianza entre re-ejecuciones, tamaño de muestra y curvas pass@k frente a pass^k', 'Python 3.10+'],
          ['<code>lab05_inspect_ai</code>', 'Una tarea tipo CTF en Inspect AI con sandbox Docker, agente con bash y scorer', 'Docker y API key'],
        ] },
        { tipo: 'codigo', lenguaje: 'bash', titulo: 'Puesta en marcha', codigo: `cd labs
python -m venv .venv
source .venv/bin/activate        # En Windows: .venv\\Scripts\\activate
python --version                 # 3.10 o superior

# Los labs 1, 2 y 4 no necesitan instalar nada más.
# Opcional (lab 3 con juez real):  pip install -r lab03_llm_juez/requirements.txt
# Opcional (lab 5):               pip install -r lab05_inspect_ai/requirements.txt` },
        { tipo: 'callout', variante: 'info', titulo: '¿Por qué un agente simulado?', html: `Los laboratorios 1, 2 y 4 usan un <strong>agente simulado</strong>: no hay ningún modelo, solo una «moneda trucada» por tarea y una lista de errores realistas (formato incorrecto, éxito falso, argumentos erróneos, bucles, herramienta prohibida). Tiene tres ventajas didácticas: es <strong>gratis</strong>, es <strong>reproducible</strong> (misma semilla, mismo resultado) y conoces la <strong>verdad</strong> de lo que pasó en cada ensayo, cosa que en la vida real solo averiguas leyendo transcripts. La desventaja: las cifras no dicen nada de ningún modelo real. Úsalo para entender el <em>harness</em>, no para sacar conclusiones sobre modelos.` },
        { tipo: 'h', texto: 'Calentamiento en el navegador: el mini-runner' },
        { tipo: 'p', html: `Antes de abrir la terminal, juega con un <em>runner</em> en miniatura. Simula un agente de facturación sobre ocho tareas de dificultad creciente. Puedes cambiar la <strong>habilidad del modelo</strong>, el <strong>patrón</strong> (un intento, ReAct con autoverificación, votación ×3, evaluador-optimizador), el número de <strong>ensayos por tarea</strong> <em>k</em> y el <strong>grader</strong> (normalizado o <em>exact match</em> estricto). Cada ejecución es aleatoria y queda en un historial para que compares configuraciones.` },
        { tipo: 'widget', nombre: 'mini_runner' },
        { tipo: 'h', texto: 'Experimentos guiados' },
        { tipo: 'lista', ordenada: true, items: [
          `<strong>Ruido.</strong> Deja la configuración por defecto y pulsa ▶ cinco veces seguidas. Anota el pass@1 de cada ejecución en el historial. ¿Cuánto varía sin que hayas cambiado nada?`,
          `<strong>pass@k frente a pass^k.</strong> Con habilidad 0,6 y el patrón «Un intento», pon <em>k</em> = 1, luego 5 y luego 10. Observa cómo se separan pass@k y pass^k.`,
          `<strong>El grader también falla.</strong> Repite con el grader «Exact match estricto». Mira la cifra de «falsos negativos del grader»: respuestas correctas que se suspenden por formato.`,
          `<strong>Patrones y coste.</strong> Con <em>k</em> = 5 compara los cuatro patrones. Para cada uno apunta pass@1, pass^5 y el coste por ensayo exitoso.`,
          `<strong>Techo de capacidad.</strong> Sube la habilidad a 2,0. ¿Siguen mereciendo la pena los patrones caros?`,
        ] },
        { tipo: 'revelar', pregunta: '¿Qué deberías haber observado en los experimentos 1 y 2?', respuesta: `En el 1, el pass@1 baila varios puntos entre ejecuciones idénticas: con solo 8 tareas, cada tarea pesa 12,5 puntos y el azar de cada ensayo se nota mucho. En el 2, con <em>k</em> = 1 ambas métricas coinciden; al subir <em>k</em>, pass@k crece hacia 1 (basta un acierto) y pass^k cae (hacen falta todos). Con <em>k</em> = 10 es normal ver pass@10 cerca de 1 y pass^10 por debajo de 0,3: el agente <em>sabe</em> resolver casi todo, pero no de forma <em>fiable</em>.` },
        { tipo: 'revelar', pregunta: '¿Y en los experimentos 4 y 5?', respuesta: `Los patrones con verificación o evaluador suelen subir pass@1 y, sobre todo, pass^k, a cambio de más llamadas al modelo. La votación ×3 multiplica el coste por tres y su ganancia queda limitada porque los errores están correlacionados (el widget usa ρ = 0,3). Con habilidad 2,0 el modelo ya acierta casi siempre: los patrones caros apenas suben el éxito y el <strong>coste por éxito</strong> empeora. Esa es la lección que repetirás en el laboratorio 2 con más detalle.` },
        { tipo: 'pregunta', id: 'm11-c1', pregunta: {
          tipo: 'unica',
          pregunta: 'En el mini-runner obtienes pass@10 = 0,95 y pass^10 = 0,20. ¿Qué conclusión es la más correcta?',
          opciones: [
            'El agente puede resolver casi todas las tareas, pero en la mayoría falla alguna vez en 10 intentos: no es fiable para usarlo sin supervisión',
            'El agente resuelve el 95 % de las tareas a la primera',
            'Hay un error: pass^k nunca puede ser tan inferior a pass@k',
            'El agente es fiable en el 95 % de las tareas y solo el 20 % son difíciles',
          ],
          correcta: 0,
          explicacion: `pass@10 = 0,95 significa que en el 95 % de las tareas hay al menos un acierto en 10 intentos (capacidad). pass^10 = 0,20 significa que solo en el 20 % de las tareas aciertan los 10 intentos (fiabilidad). No dice nada directo del primer intento (eso es pass@1), y la distancia entre ambas métricas es completamente normal cuando el éxito por intento es moderado.`,
          seccion: 's1',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s2
    {
      id: 's2',
      titulo: 'Lab 1 (I): anatomía de un mini harness',
      bloques: [
        { tipo: 'p', html: `<strong>Objetivo:</strong> entender, pieza a pieza, un harness de evaluación pequeño pero bien estructurado. Abre <code>labs/lab01_mini_harness/</code>: cada fichero tiene una sola responsabilidad, igual que en un harness profesional.` },
        { tipo: 'tabla', columnas: ['Fichero', 'Responsabilidad'], filas: [
          ['<code>tareas.json</code>', '12 tareas de seis tipos: aritmética, texto, JSON, fechas, sistema de ficheros (con estado) y uso de herramientas (calculadora y buscador).'],
          ['<code>entorno.py</code>', '<code>Entorno</code>: sistema de ficheros falso + herramientas + contador de pasos. <code>Registro</code>: transcript y tokens.'],
          ['<code>agente_simulado.py</code>', 'Agente con habilidad por tipo de tarea, errores realistas y verificación opcional.'],
          ['<code>graders.py</code>', 'Siete graders: exacto, numérico, regex, esquema JSON, estado del sistema de ficheros, llamada a herramienta y trayectoria.'],
          ['<code>harness.py</code>', 'Bucle tareas × ensayos, entorno nuevo por ensayo, semillas derivadas, límites y JSONL de transcripts.'],
          ['<code>metricas.py</code>', 'pass@k y pass^k insesgados, Wilson, bootstrap por tareas, error estándar agrupado y McNemar exacto.'],
          ['<code>ejecutar.py</code>', 'Interfaz de línea de comandos: tabla por tarea y resumen.'],
        ] },
        { tipo: 'h', texto: 'Las tareas son datos, no código' },
        { tipo: 'p', html: `Cada tarea declara su enunciado, su solución de referencia, los errores que el agente simulado puede cometer (con su peso) y los graders que la califican. Esta es la tarea <code>tool-01</code> tal cual aparece en <code>tareas.json</code>:` },
        { tipo: 'codigo', lenguaje: 'json', titulo: 'tareas.json (tarea tool-01)', codigo: `{
  "id": "tool-01",
  "tipo": "herramientas",
  "dificultad": 0.3,
  "enunciado": "Calcula (1234 × 5678) − 999 usando la herramienta 'calculadora'. Responde solo con el número, sin separadores de miles.",
  "solucion": {
    "acciones": [
      {"herramienta": "calculadora", "args": {"expresion": "1234 * 5678 - 999"}}
    ],
    "respuesta": "7005653"
  },
  "errores": [
    {"modo": "args_erroneos", "peso": 2,
     "acciones": [
       {"herramienta": "calculadora", "args": {"expresion": "1234 * 5678 + 999"}}
     ],
     "respuesta": "7007651"},
    {"modo": "sin_herramienta", "peso": 2, "acciones": [], "respuesta": "7005553"},
    {"modo": "formato", "peso": 1, "respuesta": "El resultado es 7.005.653"}
  ],
  "graders": [
    {"tipo": "llamada_herramienta", "herramienta": "calculadora"},
    {"tipo": "numerico", "esperado": 7005653, "tolerancia": 0}
  ]
}` },
        { tipo: 'p', html: `Fíjate en los dos graders: uno comprueba el <strong>camino</strong> (¿usó la calculadora?) y otro la <strong>respuesta</strong> (¿el número es correcto?). Un agente que «calcula de cabeza» y acierta por casualidad suspendería el primero; uno que usa la calculadora con la expresión equivocada suspendería el segundo. La tarea pasa solo si pasan <strong>todos</strong> sus graders.` },
        { tipo: 'callout', variante: 'clave', titulo: 'Separa la especificación de la tarea del harness', html: `Si las tareas viven en un fichero de datos, puedes añadir, revisar y versionar tareas sin tocar el código, y otra persona puede auditar qué se mide. Es la misma idea que verás en Inspect AI (lab 5) con <code>Sample</code> y en cualquier benchmark serio.` },
        { tipo: 'h', texto: 'Aislamiento y límites: el entorno' },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'entorno.py (extracto)', codigo: `class Entorno:
    """Sandbox de un ensayo: estado (ficheros) + herramientas + contador de pasos."""

    def __init__(self, fs_inicial: dict[str, str] | None = None, max_pasos: int = 12):
        # deepcopy: cada ensayo parte de una copia limpia del estado inicial.
        self.fs: dict[str, str] = copy.deepcopy(fs_inicial or {})
        self.max_pasos = max_pasos
        self.pasos = 0
        self.llamadas: list[dict] = []  # registro de llamadas (lo usan los graders de trayectoria)

    # ------------------------------------------------------------------ API
    def ejecutar(self, herramienta: str, args: dict) -> tuple[bool, str]:
        """Ejecuta una herramienta. Devuelve (ok, salida) y cuenta un paso."""
        self.pasos += 1
        if self.pasos > self.max_pasos:
            raise LimiteDePasosExcedido(f"se superaron {self.max_pasos} pasos")` },
        { tipo: 'p', html: `Dos decisiones de diseño importantes en pocas líneas. La copia profunda (<code>deepcopy</code>) garantiza que cada ensayo empieza con el estado inicial intacto: ningún ensayo ve lo que hizo el anterior. Y el contador de pasos es el <em>timeout</em> del harness: si el agente entra en bucle, el entorno lanza <code>LimiteDePasosExcedido</code>, el harness lo captura y el ensayo cuenta como fallo. El límite lo impone el harness, no el agente: nunca confíes en que el propio agente se pare.` },
        { tipo: 'h', texto: 'El agente simulado y sus errores' },
        { tipo: 'p', html: `En cada tarea, el agente calcula una probabilidad de éxito <em>p</em> = habilidad del tipo − 0,5 × dificultad + un desplazamiento aleatorio <strong>fijo por tarea</strong> (hay tareas que a este «modelo» se le dan especialmente bien o mal). En cada ensayo tira la moneda: con probabilidad <em>p</em> sigue la solución; si no, elige uno de los errores de la tarea según su peso y lo ejecuta <strong>de verdad</strong> contra el entorno. Con el perfil <code>con_verificacion</code>, después revisa su trabajo y detecta el error con una probabilidad que depende del tipo (0,8 para formato y éxito falso, 0,35 para errores de razonamiento, 0 para una herramienta prohibida, porque ya no se puede deshacer).` },
        { tipo: 'tabla', titulo: 'Modos de error del agente simulado', columnas: ['Modo', 'Ejemplo en las tareas', 'Qué grader lo caza'], filas: [
          ['<code>formato</code>', '<code>14 €</code> en vez de <code>14</code>; JSON dentro de un bloque Markdown', '<code>numerico</code>, <code>exacto</code>, <code>json_esquema</code>'],
          ['<code>respuesta_incorrecta</code>', '<code>848</code> en vez de <code>822.8</code> (orden de descuento e IVA)', 'graders de respuesta'],
          ['<code>exito_falso</code>', '«Hecho: he movido todos los .log» cuando falta uno', '<code>estado_fs</code>'],
          ['<code>args_erroneos</code>', 'mover a <code>/proyecto/archivos/</code> en vez de <code>/proyecto/archivo/</code>', '<code>estado_fs</code> o el de respuesta'],
          ['<code>sin_herramienta</code>', 'responder sin usar la calculadora pedida', '<code>llamada_herramienta</code>'],
          ['<code>herramienta_prohibida</code>', '<code>shell("rm /datos/*.tmp")</code> cuando estaba prohibido', '<code>trayectoria</code>'],
          ['<code>bucle</code>', 'listar el mismo directorio una y otra vez', 'el límite de pasos del harness'],
        ] },
        { tipo: 'h', texto: 'El bucle del harness' },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'harness.py (extracto de ejecutar_ensayo)', codigo: `    rng = random.Random(f"{semilla}:{tarea['id']}:{ensayo}")
    if entorno is None:  # lo normal: entorno limpio para cada ensayo
        entorno = Entorno(tarea.get("fs_inicial"), max_pasos=max_pasos)
    registro = Registro(tokens_sistema=getattr(getattr(agente, "perfil", None), "tokens_sistema", 400))

    respuesta, terminado_por = None, "respuesta"
    try:
        respuesta = agente.resolver(tarea, entorno, registro, rng)
    except LimiteDePasosExcedido as exc:
        terminado_por = "limite_pasos"
        registro.eventos.append({"tipo": "error_harness", "texto": f"Ensayo cortado: {exc}"})
    except Exception as exc:  # noqa: BLE001 - un fallo del agente no debe tumbar la eval
        terminado_por = "excepcion"
        registro.eventos.append({"tipo": "error_harness", "texto": f"{type(exc).__name__}: {exc}"})` },
        { tipo: 'p', html: `Observa la semilla: se deriva de (semilla global, tarea, número de ensayo) y <strong>no</strong> del nombre del agente. Así, dos agentes distintos reciben la misma secuencia aleatoria en el mismo ensayo (<em>números aleatorios comunes</em>). Parece un detalle, pero es lo que hará muy precisas las comparaciones pareadas del laboratorio 2. Y fíjate en que un error inesperado del agente se registra como fallo de ese ensayo en vez de tumbar toda la evaluación.` },
        { tipo: 'transcript', id: 'm11-t1', titulo: 'Un transcript real del lab 1 (tarea fs-01, agente basico, semilla 0, ensayo 0)',
          contexto: `Salida de <code>python ejecutar.py --trials 5 --seed 0 --agente basico --ver fs-01</code>. El estado inicial tiene <code>a.log</code>, <code>b.log</code>, <code>main.py</code> y <code>notas.txt</code> en <code>/proyecto</code>.`,
          pasos: [
            { rol: 'usuario', html: 'Mueve todos los ficheros .log de /proyecto a la carpeta /proyecto/archivo/ sin tocar el resto de ficheros.', nota: 'Enunciado claro y comprobable por estado.' },
            { rol: 'pensamiento', html: 'Siguiente paso: usar \'listar\'.', nota: 'Correcto: primero inspecciona.' },
            { rol: 'herramienta', html: '<code>listar({"ruta": "/proyecto"})</code>', nota: 'Llamada correcta.' },
            { rol: 'resultado', html: 'OK /proyecto/a.log | /proyecto/b.log | /proyecto/main.py | /proyecto/notas.txt', nota: 'El agente ya sabe que hay DOS ficheros .log.' },
            { rol: 'pensamiento', html: 'Siguiente paso: usar \'mover\'.', nota: 'Bien, aunque solo planifica un movimiento.' },
            { rol: 'herramienta', html: '<code>mover({"origen": "/proyecto/a.log", "destino": "/proyecto/archivo/a.log"})</code>', nota: 'Llamada correcta, pero falta la de b.log.' },
            { rol: 'resultado', html: 'OK movido /proyecto/a.log -> /proyecto/archivo/a.log', nota: 'La herramienta funciona.' },
            { rol: 'agente', html: 'Hecho: he movido todos los .log a /proyecto/archivo/.', nota: 'ÉXITO FALSO: afirma haber movido todos los .log cuando b.log sigue en /proyecto.' },
            { rol: 'grader', html: 'FALLA estado_fs: falta /proyecto/archivo/b.log; sobra /proyecto/b.log · PASA trayectoria', nota: 'El grader de estado mira el sistema de ficheros, no la afirmación del agente.' },
          ],
          pregunta: '¿En qué paso está el problema que hace fallar el ensayo?',
          culpables: [7],
          explicacion: `El agente vio dos ficheros .log (paso 3) pero solo movió uno y, aun así, respondió que había movido «todos». Es un <strong>éxito falso</strong>, uno de los modos de fallo más peligrosos de los agentes, porque la respuesta suena perfecta. Un grader que solo leyera la respuesta final lo daría por bueno; el grader <code>estado_fs</code> lo caza porque comprueba el resultado en el entorno. El perfil <code>con_verificacion</code> lo habría detectado con probabilidad 0,8 al volver a listar el directorio.` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s3
    {
      id: 's3',
      titulo: 'Lab 1 (II): graders, resultados e incertidumbre',
      bloques: [
        { tipo: 'h', texto: 'Tres familias de graders' },
        { tipo: 'p', html: `En <code>graders.py</code> los graders se agrupan según <strong>qué miran</strong>: la <em>respuesta</em> (<code>exacto</code>, <code>numerico</code>, <code>regex</code>, <code>json_esquema</code>), el <em>resultado</em> en el entorno (<code>estado_fs</code>) o el <em>camino</em> (<code>llamada_herramienta</code>, <code>trayectoria</code>). Este es el grader de estado:` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'graders.py (grader_estado_fs)', codigo: `def grader_estado_fs(cfg: dict, salida: dict) -> ResultadoGrader:
    """Comprueba el ESTADO final del entorno, no lo que el agente dice que hizo."""
    fs, fs_inicial = salida["fs"], salida.get("fs_inicial", {})
    problemas = []
    for ruta in cfg.get("existe", []):
        if ruta not in fs:
            problemas.append(f"falta {ruta}")
    for ruta in cfg.get("no_existe", []):
        if ruta in fs:
            problemas.append(f"sobra {ruta}")
    for ruta in cfg.get("intactos", []):
        if fs.get(ruta) != fs_inicial.get(ruta):
            problemas.append(f"{ruta} se ha modificado")` },
        { tipo: 'p', html: `Cada grader devuelve un veredicto binario y un <strong>detalle legible</strong> («falta /proyecto/archivo/b.log»). El detalle no es un adorno: cuando tengas cientos de fallos, es lo que te permitirá agruparlos sin abrir cada transcript. Las pruebas de <code>tests/test_graders.py</code> fijan el comportamiento esperado, incluidos los casos límite (un booleano no es un entero en JSON, <code>regex</code> usa <em>fullmatch</em>, la respuesta del agente no cuenta frente al estado).` },
        { tipo: 'h', texto: 'Ejecuta la evaluación' },
        { tipo: 'codigo', lenguaje: 'bash', codigo: `cd labs/lab01_mini_harness
python ejecutar.py --trials 5 --seed 0 --agente basico
python ejecutar.py --trials 5 --seed 0 --agente con_verificacion
python ejecutar.py --trials 5 --seed 0 --agente basico --ver tool-01
python -m unittest                 # 21 pruebas de métricas y graders` },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real: agente basico, semilla 0, 5 ensayos', codigo: `Tarea     Tipo           Éxitos  pass@1  pass@5  pass^5  Pasos  Coste/ens.  Fallo más común
---------------------------------------------------------------------------------------------------------
arit-01   aritmetica        4/5    0.80    1.00    0.00    0.0     0.00288  numerico (1)
arit-02   aritmetica        4/5    0.80    1.00    0.00    0.0     0.00299  numerico (1)
arit-03   aritmetica        3/5    0.60    1.00    0.00    0.0     0.00331  numerico (2)
txt-01    texto             5/5    1.00    1.00    1.00    0.0     0.00340  -
txt-02    texto             4/5    0.80    1.00    0.00    0.0     0.00329  exacto (1)
json-01   json              5/5    1.00    1.00    1.00    0.0     0.00314  -
fecha-01  fecha             4/5    0.80    1.00    0.00    0.0     0.00292  exacto (1)
fs-01     archivos          4/5    0.80    1.00    0.00    2.8     0.01583  estado_fs (1)
fs-02     archivos          3/5    0.60    1.00    0.00    2.0     0.01097  estado_fs (2)
fs-03     archivos          2/5    0.40    1.00    0.00    3.0     0.01608  estado_fs (2)
tool-01   herramientas      3/5    0.60    1.00    0.00    0.8     0.00603  numerico (2)
tool-02   herramientas      3/5    0.60    1.00    0.00    0.8     0.00557  exacto (2)

RESUMEN  agente=basico  (12 tareas × 5 ensayos = 60 ensayos)
  pass@1 (tasa de éxito media): 0.733
    IC95% Wilson (trata los 60 ensayos como independientes): [0.610, 0.829]
    IC95% bootstrap remuestreando tareas:                  [0.633, 0.833]
    EE ingenuo: 0.058   EE agrupado por tarea: 0.051

  k   pass@k   pass^k   (promedio sobre tareas, estimadores insesgados)
  1    0.733    0.733
  2    0.942    0.525
  3    0.992    0.367
  5    1.000    0.167

  Coste simulado total: $0.3820  |  por ensayo: $0.00637  |  por éxito: $0.00868
  Llamadas al modelo por ensayo: 1.78  |  pasos (herramientas) por ensayo: 0.78
  Terminación de los ensayos: respuesta=60` },
        { tipo: 'h', texto: 'Cómo leer esta tabla' },
        { tipo: 'lista', items: [
          `<strong>Empieza por la columna «Fallo más común»</strong>, no por la media: te dice <em>dónde</em> mirar. En las tareas de ficheros falla <code>estado_fs</code> (el agente hace menos de lo que dice); en <code>tool-02</code>, <code>exacto</code> (si lees los transcripts, responde «1978», el año de la empresa distractora Ondas del Norte que también devuelve el buscador, o «1992» sin haber buscado nada).`,
          `<strong>pass@5 = 1,00 en todas las tareas</strong> solo dice que, con cinco intentos, cada tarea se resolvió alguna vez. <strong>pass^5</strong> es 1,00 solo en las dos tareas que salieron bien las cinco veces: es la medida de fiabilidad.`,
          `<strong>El coste por ensayo</strong> de las tareas de ficheros es entre tres y cinco veces mayor que el de las de respuesta directa: más pasos, más llamadas al modelo y más contexto acumulado. Los precios por token son ficticios; sirven para comparar configuraciones, no para presupuestar.`,
          `<strong>Dos intervalos distintos.</strong> El de Wilson trata los 60 ensayos como independientes; el bootstrap remuestrea <em>tareas</em>. Con varios ensayos por tarea, el segundo es el honesto (los ensayos de una tarea se parecen entre sí).`,
        ] },
        { tipo: 'p', html: `Con <code>--agente con_verificacion</code> y la misma semilla, la tasa sube de 0,733 a <strong>0,817</strong>, pass^5 de 0,167 a <strong>0,250</strong> y el coste por ensayo de 0,00637 a <strong>0,00923</strong> (×1,45). El coste por éxito pasa de 0,00868 a 0,01130: cada éxito sale más caro, pero hay más. Si eso compensa depende de lo que cueste un fallo en tu aplicación.` },
        { tipo: 'h', texto: 'Las métricas, en código' },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'metricas.py (extracto)', codigo: `def pass_at_k(n: int, c: int, k: int) -> float:
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
    return math.comb(c, k) / math.comb(n, k)  # math.comb(c, k) = 0 si k > c` },
        { tipo: 'p', html: `Los dos estimadores responden a la misma pregunta combinatoria: si eliges <em>k</em> de los <em>n</em> ensayos al azar, ¿qué probabilidad hay de que al menos uno sea un éxito (pass@k) o de que lo sean todos (pass^k)? La prueba <code>test_insesgado_por_simulacion</code> lo comprueba: con <em>p</em> = 0,7 y 20.000 simulaciones, la media del estimador de pass^3 coincide con 0,7³ = 0,343. En <code>metricas.py</code> encontrarás también <code>error_estandar_agrupado</code>, que suma los residuos <em>por tarea</em> antes de elevarlos al cuadrado: así reconoce que diez ensayos de la misma tarea no son diez observaciones independientes.` },
        { tipo: 'ejercicio', id: 'm11-e1', titulo: 'El EE agrupado que salió más pequeño',
          enunciado: `En la salida de arriba, el error estándar agrupado (0,051) es <em>menor</em> que el ingenuo (0,058), al revés de lo que dice la teoría para tareas heterogéneas. Ejecuta <code>python ejecutar.py --trials 5 --seed 1</code>, <code>--seed 2</code> y <code>--seed 3</code> y apunta ambos errores estándar. Explica qué ha pasado con la semilla 0 y cuál de los dos deberías reportar.`,
          pistas: [
            'Mira la columna de éxitos con la semilla 0: casi todas las tareas tienen 3/5, 4/5 o 5/5. ¿Cómo de distintas parecen las tareas entre sí?',
            'El EE agrupado se estima a partir de solo 12 tareas: él mismo es una estimación ruidosa.',
          ],
          solucion: `Con las semillas 1, 2 y 3 se obtienen EE ingenuo/agrupado de 0,062/0,078, 0,056/0,061 y 0,055/0,064: el agrupado es mayor, como esperábamos, porque las tareas tienen probabilidades de éxito distintas (de ~0,4 a ~0,98) y los ensayos de una misma tarea están correlacionados. Con la semilla 0 los resultados observados salieron, por azar, muy parecidos entre tareas, y con solo 12 tareas la estimación del EE agrupado es a su vez muy variable. Debes reportar el <strong>agrupado</strong> (o el bootstrap por tareas) porque es el que respeta la estructura de los datos; y la lección extra es que con pocas tareas incluso tu medida de incertidumbre es incierta: más tareas, mejor.` },
        { tipo: 'ejercicio', id: 'm11-e2', titulo: '¿Grader injusto o agente que no sigue instrucciones?',
          enunciado: `Ejecuta <code>python ejecutar.py --trials 5 --seed 5 --agente basico --ver tool-01</code>. Verás este transcript real:<br><code>calculadora({"expresion": "1234 * 5678 - 999"})</code> → <code>OK 7005653</code> → respuesta final «El resultado es 7.005.653» → <code>FALLA numerico: no es un número</code>.<br>El agente usó bien la herramienta y obtuvo el número correcto. ¿Es un falso negativo del grader? ¿Qué cambiarías, si cambias algo?`,
          pistas: [ 'Relee el enunciado de la tarea: ¿qué formato pide exactamente?' ],
          solucion: `El enunciado dice «Responde solo con el número, sin separadores de miles». La respuesta incumple dos instrucciones explícitas (añade texto y separadores), así que suspenderla es <strong>correcto</strong>: el grader mide el seguimiento de instrucciones, que forma parte de la tarea. Sería un falso negativo si el enunciado no especificara el formato; en ese caso lo justo sería relajar el grader (extraer el número) o, mejor, aclarar el enunciado. Regla práctica: cuando un grader suspende algo «correcto», decide primero si el enunciado era inequívoco y documenta la decisión. Compáralo con el experimento 3 del mini-runner, donde los falsos negativos sí eran culpa del grader.` },
        { tipo: 'revelar', pregunta: 'Ejecuta <code>python ejecutar.py --trials 5 --seed 0 --compartir-entorno</code>. La tarea fs-03 pasa de 2/5 a 3/5 sin que el agente haya cambiado. ¿Por qué?', respuesta: `Con el entorno compartido, los ensayos de una tarea heredan el estado del anterior. En fs-03 (borrar los .tmp), un ensayo previo ya había borrado ficheros; el ensayo que «olvida» borrar <code>c.tmp</code> ahora pasa porque <code>c.tmp</code> ya no existía. El grader de estado ve un estado correcto que el agente no produjo. Es exactamente la contaminación entre ensayos que el aislamiento evita, y puede inflar o desinflar resultados según la tarea. Por eso el harness crea un <code>Entorno</code> nuevo por ensayo.` },
        { tipo: 'pregunta', id: 'm11-c2', pregunta: {
          tipo: 'multiple',
          pregunta: 'En la tabla del agente basico, la tarea fs-03 tiene 2/5 éxitos y su fallo más común es <code>estado_fs</code>. ¿Qué afirmaciones son correctas?',
          opciones: [
            'Su pass@1 estimado es 0,40 y su pass^5 es 0',
            'Su pass@5 es 1,00 porque al menos uno de los cinco ensayos salió bien',
            'Para saber si falló por un éxito falso o por usar la herramienta prohibida hay que leer los transcripts o los detalles de los graders',
            'Como pass@5 = 1,00, la tarea se puede considerar resuelta de forma fiable',
          ],
          correctas: [0, 1, 2],
          explicacion: `2/5 da pass@1 = 0,40; pass^5 exige los cinco éxitos, así que vale 0; y con n = k = 5, pass@5 vale 1 en cuanto hay un éxito. La columna de fallos agrega por grader, pero la causa (éxito falso, herramienta prohibida) se ve en el detalle y en el transcript. La última opción confunde capacidad (pass@k) con fiabilidad (pass^k).`,
          seccion: 's3',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s4
    {
      id: 's4',
      titulo: 'Lab 2: comparar patrones de agente',
      bloques: [
        { tipo: 'p', html: `<strong>Objetivo:</strong> evaluar cinco patrones de agente (M03) sobre las <strong>mismas</strong> tareas, con el <strong>mismo</strong> harness y las <strong>mismas</strong> semillas, y decidir entre ellos con números: éxito, fiabilidad, coste y una comparación estadística pareada. Todos los patrones implementan <code>resolver(tarea, entorno, registro, rng)</code>, así que el harness del lab 1 los evalúa sin cambiar una línea. Esa es la gracia de separar el harness del agente.` },
        { tipo: 'tabla', columnas: ['Patrón', 'Idea', 'Cómo se simula'], filas: [
          ['<code>un_disparo</code>', 'Una llamada que emite todas las acciones sin ver resultados', 'Menos llamadas; habilidad menor en tareas con estado o herramientas'],
          ['<code>react</code>', 'Bucle pensar → actuar → observar', 'El agente base del lab 1'],
          ['<code>react_verificacion</code>', 'ReAct + revisión del propio trabajo', 'Detecta y corrige parte de los errores'],
          ['<code>voto_mayoria_3</code>', 'Tres muestras independientes y voto por mayoría', 'Cada muestra en un clon del entorno; se aplica el estado de la rama ganadora'],
          ['<code>evaluador_optimizador</code>', 'Generador + evaluador que critica, hasta 3 rondas', 'Evaluador imperfecto: detecta errores con cierta probabilidad y a veces da falsas alarmas'],
        ] },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'patrones.py (VotoMayoria.resolver, final)', codigo: `        validas = [r for r in ramas if r[0] is not None]
        if not validas:
            raise LimiteDePasosExcedido("ninguna muestra terminó dentro del límite de pasos")
        votos = Counter(_normalizar_para_voto(r[0]) for r in validas)
        ganadora, _ = votos.most_common(1)[0]  # en empate gana la primera que apareció
        respuesta, clon, sub = next(r for r in validas if _normalizar_para_voto(r[0]) == ganadora)

        # Aplicamos el estado de la rama elegida al entorno "real".
        entorno.fs, entorno.llamadas, entorno.pasos = clon.fs, clon.llamadas, clon.pasos` },
        { tipo: 'p', html: `Detente en el «commit» del estado. En una tarea de respuesta, votar tiene sentido: tres muestras dicen «14», «14» y «10.8», y gana «14». Pero en una tarea con efectos (mover ficheros) cada muestra ha actuado en su propio clon y la respuesta es un «Hecho: ...» que apenas informa. Votar sobre ese texto no te dice qué rama dejó el sistema bien. Un sistema real tendría que elegir la rama por otro criterio (por ejemplo, ejecutando comprobaciones sobre cada clon).` },
        { tipo: 'codigo', lenguaje: 'bash', codigo: `cd labs/lab02_comparar_patrones
python comparar.py                               # 12 tareas × 10 ensayos × 5 patrones
python comparar.py --comparar react_verificacion voto_mayoria_3` },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real (semilla 0, 10 ensayos): tablas 1 y 2', codigo: `1) RESULTADOS POR PATRÓN  (10 ensayos por tarea; IC95% bootstrap remuestreando tareas)

Patrón                   Éxito           IC95%   pass^3  pass^10  Coste/ens.  Coste/éxito  Llamadas
---------------------------------------------------------------------------------------------------
un_disparo               0.683    [0.55, 0.82]    0.398    0.167     0.00447      0.00655      1.49
react                    0.750    [0.65, 0.85]    0.454    0.167     0.00642      0.00856      1.82
react_verificacion       0.850    [0.78, 0.92]    0.619    0.250     0.00932      0.01097      2.17
voto_mayoria_3           0.808    [0.70, 0.91]    0.575    0.333     0.01984      0.02455      5.60
evaluador_optimizador    0.858    [0.78, 0.93]    0.651    0.250     0.01117      0.01302      3.14

2) ÉXITO POR TIPO DE TAREA

Patrón                     archivos  aritmetica       fecha herramienta        json       texto
un_disparo                     0.40        0.73        0.80        0.55        1.00        0.95
react                          0.57        0.73        0.80        0.70        1.00        0.95
react_verificacion             0.77        0.83        0.80        0.80        1.00        1.00
voto_mayoria_3                 0.63        0.77        0.90        0.80        1.00        1.00
evaluador_optimizador          0.73        0.83        0.90        0.85        1.00        1.00` },
        { tipo: 'h', texto: 'Leer la tabla con el coste delante' },
        { tipo: 'lista', items: [
          `<strong>El más barato por éxito</strong> es <code>un_disparo</code> (0,00655), aunque es el que menos acierta. Si los fallos se pueden reintentar a bajo coste, puede ser la mejor opción.`,
          `<strong>La votación es la más cara</strong> con diferencia (5,6 llamadas por ensayo, coste por éxito 0,02455) y no es la que más acierta. En «archivos» se queda en 0,63, lejos de la verificación (0,77): el voto no arregla efectos laterales.`,
          `<strong>La votación tiene el mejor pass^10</strong> (0,333): agregar tres muestras reduce la varianza de cada ensayo. Si lo que te importa es la consistencia en respuestas cortas, eso cuenta.`,
          `<strong>Verificación y evaluador-optimizador</strong> están muy cerca en éxito (0,850 y 0,858) y sus intervalos se solapan casi por completo. No declares un ganador sin una comparación pareada.`,
        ] },
        { tipo: 'h', texto: 'Comparación pareada y McNemar' },
        { tipo: 'p', html: `Como todos los patrones se ejecutan con las mismas semillas sobre los mismos pares (tarea, ensayo), podemos compararlos <strong>par a par</strong>. Lo que importa son los pares <em>discordantes</em>: aquellos en los que un patrón acierta y el otro falla. Si los dos fueran igual de buenos, cada par discordante caería de un lado o del otro con probabilidad 1/2. El test exacto de McNemar calcula lo improbable que es el reparto observado:` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'metricas.py (mcnemar_exacto)', codigo: `def mcnemar_exacto(b: int, c: int) -> float:
    """Test exacto de McNemar (bilateral).

    b = pares en los que A acierta y B falla; c = A falla y B acierta.
    Bajo H0 (mismo rendimiento) cada par discordante cae de un lado con p=0,5,
    así que b ~ Binomial(b + c, 0,5). Los pares concordantes no informan.
    """
    n = b + c
    if n == 0:
        return 1.0
    cola = sum(math.comb(n, i) for i in range(min(b, c) + 1)) / 2 ** n
    return min(1.0, 2 * cola)` },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real: dos comparaciones pareadas', codigo: `4) COMPARACIÓN PAREADA: react (A) vs react_verificacion (B)

                 B acierta   B falla
   A acierta            90         0
   A falla              12        18

   Pares discordantes: A sí/B no = 0, A no/B sí = 12
   McNemar exacto (bilateral): p = 0.0005
   Diferencia de éxito A - B = -0.100  IC95% bootstrap por tareas [-0.158, -0.050]

4) COMPARACIÓN PAREADA: react_verificacion (A) vs voto_mayoria_3 (B)

                 B acierta   B falla
   A acierta            83        19
   A falla              14         4

   Pares discordantes: A sí/B no = 19, A no/B sí = 14
   McNemar exacto (bilateral): p = 0.4869
   Diferencia de éxito A - B = +0.042  IC95% bootstrap por tareas [-0.042, +0.150]` },
        { tipo: 'callout', variante: 'clave', titulo: 'Números aleatorios comunes: la ablación más limpia posible', html: `En la primera comparación, la casilla «A acierta / B falla» vale <strong>0</strong>. No es casualidad: <code>react</code> y <code>react_verificacion</code> son el mismo agente con las mismas semillas, así que hacen exactamente lo mismo hasta el momento de verificar. La verificación solo puede <em>añadir</em> éxitos (o costar tokens). Con este diseño, 12 pares discordantes bastan para una conclusión clara; con agentes evaluados en ensayos independientes necesitarías muchos más (lo verás en el lab 4).` },
        { tipo: 'callout', variante: 'aviso', titulo: 'McNemar con ensayos repetidos es optimista', html: `Los 120 pares no son independientes: hay 10 ensayos de cada una de 12 tareas. McNemar los trata como independientes, así que su p-valor es demasiado pequeño. El intervalo bootstrap que remuestrea <em>tareas</em> es más honesto. En la segunda comparación ambos coinciden en lo esencial: la diferencia entre verificación y votación (+4,2 puntos) no es distinguible del ruido con estos datos.` },
        { tipo: 'h', texto: 'Ablación: ¿qué arregla la verificación?' },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real: ablación', codigo: `5) ABLACIÓN: react SIN vs CON auto-verificación (mismo modelo, mismas semillas)

   Éxito:        0.750 -> 0.850  (+0.100)
   Coste/ensayo: 0.00642 -> 0.00932  (x1.45)
   Coste/éxito:  0.00856 -> 0.01097
   Fallos por modo (sin -> con):
     args_erroneos            3 ->   2
     bucle                    1 ->   1
     exito_falso              6 ->   1
     formato                  4 ->   0
     herramienta_prohibida    4 ->   4
     respuesta_incorrecta    10 ->   9
     sin_herramienta          2 ->   1` },
        { tipo: 'clasificar', id: 'm11-cl1', instrucciones: 'Según la ablación (y la lógica del agente simulado), clasifica cada modo de fallo según si la auto-verificación lo reduce claramente o casi no lo toca.', categorias: ['La verificación lo reduce claramente', 'La verificación casi no lo toca'], items: [
          { texto: '<code>formato</code>: «14 €» en vez de «14»', categoria: 'La verificación lo reduce claramente', explicacion: 'De 4 a 0. Revisar el formato contra el enunciado es fácil y barato.' },
          { texto: '<code>exito_falso</code>: dice «Hecho» con trabajo pendiente', categoria: 'La verificación lo reduce claramente', explicacion: 'De 6 a 1. Volver a listar el directorio muestra que falta un fichero.' },
          { texto: '<code>herramienta_prohibida</code>: usa <code>shell</code> estando prohibido', categoria: 'La verificación casi no lo toca', explicacion: 'De 4 a 4. La llamada ya se hizo y no se puede deshacer: esto se previene con permisos en el harness, no revisando después.' },
          { texto: '<code>bucle</code>: repite la misma acción', categoria: 'La verificación casi no lo toca', explicacion: 'De 1 a 1. El agente nunca llega a la fase de verificación: lo corta el límite de pasos.' },
          { texto: '<code>respuesta_incorrecta</code>: error de razonamiento (848 en vez de 822,8)', categoria: 'La verificación casi no lo toca', explicacion: 'De 10 a 9. Quien se equivoca razonando suele repetir el mismo razonamiento al revisarse; un evaluador independiente ayuda algo más.' },
        ] },
        { tipo: 'ejercicio', id: 'm11-e3', titulo: 'Elige un patrón para producción',
          enunciado: `Tu agente resolverá tareas de ficheros y de herramientas para usuarios internos. Un fallo cuesta unos 20 minutos de trabajo humano, y cada ensayo del agente cuesta lo que indica la tabla (en una escala real, multiplica por mil). Con la tabla 1, la tabla 2 y las comparaciones pareadas, ¿qué patrón eliges y qué medirías antes de decidir del todo?`,
          pistas: [ 'Compara el coste extra por ensayo con el coste de los fallos que evita cada patrón.', 'Mira la columna «archivos» y la ablación: ¿qué fallos quedan sin resolver con cualquier patrón?' ],
          solucion: `Cuando un fallo cuesta mucho más que un ensayo, manda la tasa de éxito en las tareas que importan: <code>react_verificacion</code> o <code>evaluador_optimizador</code>, mucho mejores que <code>un_disparo</code> y <code>react</code> en «archivos» y «herramientas». La votación queda descartada: es la más cara y en «archivos» rinde peor. Entre verificación y evaluador-optimizador no hay diferencia demostrada (intervalos solapados), y la verificación es más barata (0,00932 frente a 0,01117 por ensayo), así que es una buena opción por defecto. Antes de decidir: (1) una comparación pareada entre ambos con más ensayos o más tareas, (2) leer los transcripts de los fallos que quedan, y (3) cerrar el fallo de <code>herramienta_prohibida</code> con permisos en el harness, porque ningún patrón lo arregla.` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s5
    {
      id: 's5',
      titulo: 'Lab 3: un juez LLM calibrado',
      bloques: [
        { tipo: 'p', html: `<strong>Objetivo:</strong> construir un juez para respuestas cortas de un agente de investigación y <strong>medir cuánto te puedes fiar de él</strong> antes de usarlo (M06). El conjunto <code>datos.jsonl</code> tiene 16 ejemplos: 8 preguntas con dos respuestas cada una, fuentes numeradas, una etiqueta humana (<code>pass</code>/<code>fail</code>) y una nota que la justifica. Las fuentes hablan de lugares y organizaciones <strong>ficticios</strong>, para que la única verdad sea la que hay en ellas y no lo que «sabe» el modelo.` },
        { tipo: 'lista', items: [
          '<strong>Afirmación segura pero falsa</strong>: «La biblioteca abrió en 1958 [2]» (1958 es el año del traslado).',
          '<strong>Correcta pero verbosa</strong>: un párrafo largo que acaba dando el dato bien citado (debe pasar: la rúbrica no penaliza la extensión).',
          '<strong>Correcta con otro formato</strong>: «12480» frente a «12.480», «14/05/1996» frente a «14 de mayo de 1996».',
          '<strong>Afirmación sin respaldo</strong> añadida a un dato correcto («la ciudad más poblada de la comarca»).',
          '<strong>Inferencia no respaldada</strong>: «La capital es Santa Luz» cuando la fuente dice que es el principal puerto.',
          '<strong>Abstención correcta</strong>: «Las fuentes no indican cuál es la capital» (debe pasar).',
        ] },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'juez.py (rúbrica y regla de decisión)', codigo: `CRITERIOS = {
    "responde": "¿La respuesta contesta directamente a la pregunta (o, si las fuentes no contienen la "
                "información, dice explícitamente que no está)?",
    "fiel": "¿TODAS las afirmaciones factuales de la respuesta están respaldadas por las fuentes, sin "
            "contradecirlas ni añadir datos que no aparecen en ellas? Un cambio de formato (12.480 vs 12480, "
            "14/05/1996 vs 14 de mayo de 1996) NO es un error.",
    "cita": "¿La respuesta cita al menos una fuente con su identificador entre corchetes, p. ej. [1], y la "
            "fuente citada respalda lo que se afirma?",
}` },
        { tipo: 'callout', variante: 'clave', titulo: 'Tres decisiones de diseño del juez', html: `<ol><li><strong>Criterios binarios y concretos</strong> en vez de una nota del 1 al 10: son más fáciles de calibrar y de discutir.</li><li><strong>Razonar antes del veredicto</strong> en cada criterio: la plantilla pide el razonamiento primero y el «si»/«no» después, en un JSON.</li><li><strong>La agregación la hace el código</strong> (<code>pass</code> solo si los tres criterios son «si»), no el modelo: la regla de decisión es explícita y no cambia de un juicio a otro.</li></ol>` },
        { tipo: 'codigo', lenguaje: 'bash', codigo: `cd labs/lab03_llm_juez
python calibrar.py --simulado --pareado          # sin API key: juez heurístico (avisa)

pip install -r requirements.txt                  # con API key: juez LLM real
export ANTHROPIC_API_KEY=...
export MODELO_JUEZ=<modelo>                      # opcional; el valor por defecto está en juez.py
python calibrar.py --pareado` },
        { tipo: 'callout', variante: 'aviso', titulo: 'El juez simulado no es un LLM', html: `Sin API key, <code>calibrar.py</code> usa un juez heurístico que busca los números y nombres propios de la respuesta en las fuentes, y lo anuncia con un aviso bien visible. Es <strong>deliberadamente imperfecto</strong> (compara números como subcadenas, no entiende la semántica y tiene sesgo de posición) para que la calibración tenga algo que enseñar. Sus cifras no dicen nada sobre los jueces LLM: con un modelo real tienes que medirlas tú.` },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real (juez simulado)', codigo: `Juez: simulado   Ejemplos: 16

MATRIZ DE CONFUSIÓN (filas = humano, columnas = juez)
                  juez pass   juez fail
  humano pass             7           1
  humano fail             4           4

  Acuerdo (accuracy): 0.688   IC95% Wilson [0.44, 0.86]  (n = 16: ¡intervalo ancho!)
  TPR (sensibilidad): 0.875   -> aprueba lo que el humano aprueba
  TNR (especificidad): 0.500  -> suspende lo que el humano suspende
  Kappa de Cohen:     0.375

  Tasa de pass según humanos: 0.500   según el juez: 0.688   (sesgo de la puntuación: +0.188)` },
        { tipo: 'p', html: `Lee las cifras en orden. La TPR es alta (aprueba casi todo lo que aprueba el humano), pero la TNR es de 0,5: <strong>aprueba la mitad de las respuestas malas</strong>. Por eso, si usaras este juez para puntuar tu agente, inflaría la tasa de éxito en casi 19 puntos. La kappa de 0,375 descuenta el acuerdo que se daría por azar y lo deja en un nivel débil. Y con 16 ejemplos, el intervalo de la accuracy va de 0,44 a 0,86: calibrar con tan pocos ejemplos sirve para detectar problemas gordos, no para certificar un juez.` },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Un desacuerdo (salida real)', codigo: `  [q6b] FALSO POSITIVO: humano=fail juez=pass
    Pregunta:  ¿Cuál es la capital de la provincia de Marvega?
    Respuesta: La capital de Marvega es Santa Luz [2].
    Nota humana: Inferencia no respaldada: la fuente dice que es el principal puerto, no la capital.
    - responde  si  tiene contenido
    - fiel      si  números y nombres presentes en las fuentes
    - cita      si  citas [2]` },
        { tipo: 'p', html: `Los cuatro falsos positivos (q1b, q2b, q6b, q7b) tienen algo en común: todas las palabras «comprobables» de la respuesta aparecen en las fuentes, pero la <strong>relación</strong> que afirma la respuesta es falsa o no está respaldada. Una heurística léxica no puede verlo; un juez LLM con el criterio «fiel» bien redactado debería, y eso es justo lo que vas a medir si tienes API key. El único falso negativo (q5a, fecha en formato 14/05/1996) es el error contrario: penalizar un cambio de formato que la rúbrica permite expresamente.` },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Prueba de intercambio de posiciones (salida real, extracto)', codigo: `PRUEBA PAREADA CON INTERCAMBIO DE POSICIONES
  q1: orden (q1a,q1b) -> q1a     orden (q1b,q1a) -> q1b     INCONSISTENTE  (humano prefiere q1a)
  q3: orden (q3a,q3b) -> q3a     orden (q3b,q3a) -> q3a     ok    (humano prefiere q3a)
  q5: orden (q5a,q5b) -> q5a     orden (q5b,q5a) -> q5b     INCONSISTENTE  (humano prefiere q5a)

  Consistencia al intercambiar posiciones: 3/8
  Consistente Y de acuerdo con la preferencia humana: 3/8` },
        { tipo: 'p', html: `En modo pareado, el juez compara las dos respuestas de cada pregunta dos veces, cambiando el orden. Si el ganador cambia al cambiar el orden, el veredicto dependía de la posición y no del contenido: hay que contarlo como empate o descartarlo. El juez simulado elige siempre la respuesta A cuando ve un empate, así que falla esta prueba en 5 de 8 preguntas. Los jueces LLM reales también pueden mostrar sesgo de posición (Zheng et al., 2023), por eso esta comprobación es barata y obligatoria.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'calibrar.py (kappa_cohen)', codigo: `def kappa_cohen(tp: int, fp: int, fn: int, tn: int) -> float:
    n = tp + fp + fn + tn
    acuerdo_observado = (tp + tn) / n
    # Acuerdo esperado por azar: ambos dicen pass por casualidad + ambos dicen fail por casualidad.
    p_juez_pass, p_humano_pass = (tp + fp) / n, (tp + fn) / n
    acuerdo_azar = p_juez_pass * p_humano_pass + (1 - p_juez_pass) * (1 - p_humano_pass)
    if acuerdo_azar == 1:
        return 1.0
    return (acuerdo_observado - acuerdo_azar) / (1 - acuerdo_azar)` },
        { tipo: 'revelar', pregunta: 'Calcula a mano la kappa de la matriz TP = 7, FN = 1, FP = 4, TN = 4.', respuesta: `n = 16. Acuerdo observado = (7 + 4)/16 = 0,6875. El juez dice pass en 11/16 = 0,6875 y el humano en 8/16 = 0,5. Acuerdo por azar = 0,6875 × 0,5 + 0,3125 × 0,5 = 0,5. Kappa = (0,6875 − 0,5)/(1 − 0,5) = <strong>0,375</strong>, la misma cifra que imprime el script.` },
        { tipo: 'ejercicio', id: 'm11-e4', titulo: 'Mejora el juez sin hacerte trampas',
          enunciado: `Quieres mejorar la plantilla <code>PLANTILLA_JUICIO</code> (por ejemplo, pidiendo que el juez cite literalmente el fragmento de la fuente que respalda cada afirmación). Describe un procedimiento para mejorar el juez y comprobar que la mejora es real, teniendo en cuenta que solo hay 16 ejemplos etiquetados.`,
          pistas: [ 'Si ajustas el prompt mirando los 16 ejemplos y mides en esos mismos 16, ¿qué estás midiendo?', '¿Qué haces cuando el juez y la etiqueta humana discrepan y crees que el juez tiene razón?' ],
          solucion: `(1) Separa los ejemplos en <strong>desarrollo</strong> y <strong>prueba</strong> (por pregunta, para que las dos respuestas de una misma pregunta queden en el mismo lado), o mejor, etiqueta más ejemplos. (2) Itera la plantilla solo mirando los desacuerdos de desarrollo. (3) Mide una única vez en prueba: accuracy, TPR, TNR, kappa y sesgo de la puntuación, con su intervalo. (4) Repite la prueba de intercambio de posiciones. (5) Revisa los desacuerdos restantes: algunos pueden ser errores de la <strong>etiqueta humana</strong>; corrígelos con una segunda persona y anota el criterio, pero no cambies etiquetas solo para que el juez «acierte». (6) Usa <code>--reusar</code> para recalcular métricas sin volver a pagar las llamadas a la API.` },
        { tipo: 'pregunta', id: 'm11-c3', pregunta: {
          tipo: 'unica',
          pregunta: 'Un juez tiene TPR = 0,95 y TNR = 0,50 frente a las etiquetas humanas. Lo usas para puntuar un agente nuevo. ¿Qué es lo más probable?',
          opciones: [
            'La tasa de éxito que reporte el juez será más alta que la real, porque deja pasar muchas respuestas malas',
            'La tasa de éxito reportada será más baja que la real, porque el juez es muy estricto',
            'La tasa reportada será correcta en promedio, porque una TPR alta compensa una TNR baja',
            'No se puede decir nada sin conocer la kappa',
          ],
          correcta: 0,
          explicacion: `Una TNR de 0,5 significa que la mitad de las respuestas que un humano suspendería, el juez las aprueba: son éxitos fantasma que inflan la puntuación. La TPR alta no compensa nada: solo dice que casi no suspende respuestas buenas. La kappa resume el acuerdo, pero no te dice la dirección del sesgo; TPR y TNR sí.`,
          seccion: 's5',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s6
    {
      id: 's6',
      titulo: 'Lab 4: estadística que cabe en la terminal',
      bloques: [
        { tipo: 'p', html: `<strong>Objetivo:</strong> desarrollar intuición numérica sobre la incertidumbre (M08) con tres scripts cortos que solo usan la biblioteca estándar. No hay agente: se simulan directamente probabilidades de éxito por tarea.` },
        { tipo: 'codigo', lenguaje: 'bash', codigo: `cd labs/lab04_estadistica
python varianza_reruns.py                     # 50 tareas, 1 ensayo, p media 0,65
python varianza_reruns.py --tareas 200 --ensayos 3
python tamano_muestra.py --p1 0.70 --p2 0.80
python curvas_passk.py --p 0.7 --kmax 10` },
        { tipo: 'h', texto: '(a) ¿Cuánto se mueve la puntuación si repites la eval?' },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real de varianza_reruns.py (extracto)', codigo: `50 tareas, 1 ensayo(s) por tarea. Éxito verdadero medio de ESTAS tareas: 0.676

1) RE-EJECUCIONES de la misma eval (2000 veces)
   media 0.675  desviación 0.058  95% de las ejecuciones en [0.560, 0.780]
   0.56-0.58 | ####### 37
   0.58-0.60 | ############# 76
   0.60-0.62 | ################### 109
   0.62-0.64 | ############################ 156
   0.64-0.66 | ######################################## 229
   0.66-0.68 | ################################################## 283
   0.68-0.70 | ################################################ 272
   0.70-0.72 | ############################################### 264
   0.72-0.74 | ################################### 199
   0.74-0.76 | ########################## 147
   0.76-0.78 | ################# 94

2) OTRO CONJUNTO de 50 tareas de la misma población en cada repetición
   media 0.651  desviación 0.068  95% en [0.520, 0.780]

3) DOS AGENTES IDÉNTICOS (misma p en cada tarea), misma eval
   |diferencia| >=    2 puntos en el  91.1% de las comparaciones
   |diferencia| >=    5 puntos en el  53.4% de las comparaciones
   |diferencia| >=   10 puntos en el  26.2% de las comparaciones` },
        { tipo: 'p', html: `Tres lecciones. Primera: con 50 tareas y un ensayo, la misma eval da cualquier cosa entre 0,56 y 0,78 el 95 % de las veces. Segunda: si además el conjunto de tareas fuera otro igual de válido, la desviación crece (0,068 frente a 0,058); re-ejecutar tu benchmark solo mide una de las dos fuentes de variación. Tercera, la más incómoda: dos agentes <strong>idénticos</strong> difieren en 10 puntos o más en una de cada cuatro comparaciones. Un «+5 puntos» con 50 tareas y sin intervalo no es evidencia de nada.` },
        { tipo: 'h', texto: '(b) ¿Cuántas tareas necesito?' },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'tamano_muestra.py (n_independientes)', codigo: `def n_independientes(p1: float, p2: float, alfa: float = 0.05, potencia: float = 0.8) -> int:
    za, zb = Z.inv_cdf(1 - alfa / 2), Z.inv_cdf(potencia)
    p_barra = (p1 + p2) / 2
    num = za * math.sqrt(2 * p_barra * (1 - p_barra)) + zb * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))
    return math.ceil(num ** 2 / (p1 - p2) ** 2)` },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real de tamano_muestra.py', codigo: `Detectar 0.70 -> 0.80 con potencia 80% y α = 0.05:
  Independientes: 294 tareas POR AGENTE
  Pareadas (mismas tareas, 20% de discrepancias): 155 tareas en total
  Comprobación Monte Carlo con n = 294: potencia ≈ 0.799

Tabla: tareas por agente (muestras independientes, potencia 80 %, α = 0,05)
   p base     +2 pts     +5 pts    +10 pts    +15 pts
     0.30       8394       1377        356        163
     0.50       9806       1565        388        170
     0.70       8080       1251        294        121
     0.85       4724        686        141         49

Tabla: tareas en diseño PAREADO para +5 puntos según la discordancia
  discordancia 5%:    155 tareas
  discordancia 10%:    312 tareas
  discordancia 20%:    626 tareas
  discordancia 30%:    940 tareas` },
        { tipo: 'p', html: `La simulación de Monte Carlo confirma la fórmula: con 294 tareas por agente se detecta la diferencia el 79,9 % de las veces (el objetivo era el 80 %). Fíjate en el orden de magnitud: para +5 puntos desde el 70 % hacen falta unas 1.250 tareas por agente con muestras independientes. Con un diseño pareado, el número depende de cuántas tareas «discrepan»: cuanto más se parecen los dos agentes en qué tareas resuelven, menos tareas necesitas. Puedes contrastar el cálculo con el widget:` },
        { tipo: 'widget', nombre: 'tamano_muestra', p1: 0.7, p2: 0.8 },
        { tipo: 'h', texto: '(c) pass@k frente a pass^k: la heterogeneidad importa' },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real de curvas_passk.py (extracto)', codigo: `DOS BENCHMARKS CON LA MISMA TASA MEDIA (0,70)
  k |  homog. pass@k  homog. pass^k |  heter. pass@k  heter. pass^k
  1 |          0.700          0.700 |          0.700          0.700
  3 |          0.973          0.343 |          0.700          0.700
  5 |          0.998          0.168 |          0.700          0.700
 10 |          1.000          0.028 |          0.700          0.700` },
        { tipo: 'p', html: `Dos benchmarks con la misma tasa media de 0,70. En el homogéneo, todas las tareas tienen <em>p</em> = 0,7: los fallos son aleatorios, pass@k sube hacia 1 y pass^k se desploma. En el heterogéneo, 7 tareas salen siempre y 3 nunca: los fallos son sistemáticos y ni pass@k ni pass^k se mueven con <em>k</em>. Por eso pass@1 no basta para describir un agente: dos agentes con el mismo pass@1 pueden necesitar arreglos completamente distintos (más consistencia en un caso, más capacidad en el otro).` },
        { tipo: 'ejercicio', id: 'm11-e5', titulo: 'Planifica una comparación',
          enunciado: `Tu agente actual acierta alrededor del 70 % de tu suite. Un compañero propone un cambio de prompt que, según él, «sube unos 5 puntos». Tu suite tiene 150 tareas y cada ensayo cuesta tiempo y dinero. Usando las salidas del lab 4 (y, si quieres, el lab 2), diseña la comparación: cuántas tareas, cuántos ensayos, qué análisis y qué conclusión sacarías si la diferencia observada fuera +4 puntos con un intervalo que incluye el 0.`,
          pistas: [ 'Con muestras independientes harían falta unas 1.250 tareas por agente. ¿Y con un diseño pareado?', 'Un cambio de prompt suele dejar igual la mayoría de las tareas: ¿qué implica eso para la discordancia?' ],
          solucion: `Con 150 tareas e independencia no hay ninguna posibilidad de detectar +5 puntos con potencia razonable. Usa un diseño <strong>pareado</strong>: las mismas 150 tareas, mismas semillas si puedes y análisis por pares (McNemar o, mejor, IC bootstrap por tareas de la diferencia). Si el cambio de prompt solo altera el resultado en ~5-10 % de las tareas, la tabla pareada indica entre 155 y 312 tareas para +5 puntos: con 150 tareas y varios ensayos por tarea te acercas, pero vas justo. Si observas +4 puntos con un IC que incluye el 0, la conclusión correcta es «no hemos podido detectar una diferencia»; <em>no</em> «el cambio no funciona» ni «mejora 4 puntos». Siguientes pasos: añadir tareas (más eficaz que añadir ensayos), leer los transcripts de los pares discordantes y decidir según el coste del cambio.` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s7
    {
      id: 's7',
      titulo: 'Lab 5: lo mismo con Inspect AI',
      bloques: [
        { tipo: 'callout', variante: 'aviso', titulo: 'Requisitos de este laboratorio', html: `Necesitas <strong>Docker</strong> instalado y en marcha y una <strong>API key</strong> del proveedor del modelo (por ejemplo <code>ANTHROPIC_API_KEY</code>). Son pocas llamadas, pero <strong>cuestan dinero</strong>. No hay modo simulado: si no puedes ejecutarlo, lee el código y la tabla de equivalencias, que es lo más importante.` },
        { tipo: 'p', html: `<strong>Objetivo:</strong> reconocer en una herramienta real las piezas que has construido a mano. <a href="https://inspect.aisi.org.uk/" target="_blank" rel="noopener">Inspect AI</a> es un framework de evaluación de código abierto del UK AI Security Institute. La tarea de ejemplo es un mini-CTF con tres retos: encontrar un fichero oculto, decodificar un mensaje en base64 y contar las líneas ERROR de un log que tiene trampas («ERRORES», «error» en minúsculas).` },
        { tipo: 'tabla', titulo: 'Del harness casero a Inspect AI', columnas: ['Lab 1 (a mano)', 'Inspect AI'], filas: [
          ['<code>tareas.json</code>', '<code>dataset=[Sample(input=..., target=..., files=...)]</code>'],
          ['<code>AgenteSimulado</code>', '<code>solver=basic_agent(...)</code> o <code>react(...)</code>'],
          ['Herramientas del <code>Entorno</code>', '<code>tools=[bash(timeout=60)]</code>'],
          ['<code>Entorno(fs_inicial)</code> nuevo por ensayo', '<code>sandbox=("docker", "compose.yaml")</code> + <code>files</code> de cada muestra'],
          ['<code>--max-pasos</code>', '<code>message_limit</code> (y también <code>token_limit</code>, <code>time_limit</code>...)'],
          ['Graders', '<code>scorer=includes()</code>, <code>match()</code>, <code>model_graded_qa()</code> o uno propio'],
          ['<code>--trials k</code>', '<code>--epochs k</code> con reductores (<code>mean</code>, <code>max</code>, <code>at_least_k</code>, <code>pass_at_k</code>)'],
          ['<code>transcripts.jsonl</code>', 'Logs de Inspect y el visor <code>inspect view</code>'],
        ] },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'tarea_ctf.py (tarea principal)', codigo: `@task
def ctf_mini():
    """Versión clásica: \`basic_agent\` (bucle de herramientas + submit + reintentos)."""
    return Task(
        dataset=MUESTRAS,
        solver=basic_agent(
            init=system_message(SISTEMA),
            tools=[bash(timeout=60)],
            max_attempts=2,      # si envía una flag incorrecta, puede intentarlo otra vez
            message_limit=30,    # límite de mensajes: el "timeout" del harness
        ),
        scorer=includes(),       # correcto si el target aparece en la respuesta enviada
        sandbox=("docker", "compose.yaml"),
    )` },
        { tipo: 'p', html: `El fichero define también <code>ctf_mini_react</code>, que usa el agente <code>react</code> de <code>inspect_ai.agent</code> (versiones recientes), y <code>ctf_mini_fiabilidad</code>, con <code>epochs=Epochs(3, ["mean", "max", "at_least_3"])</code>: tres ensayos por muestra donde <code>max</code> se comporta como un pass@3 empírico y <code>at_least_3</code> como un pass^3 empírico. El sandbox está definido en <code>compose.yaml</code>:` },
        { tipo: 'codigo', lenguaje: 'yaml', titulo: 'compose.yaml', codigo: `services:
  default:
    image: python:3.12-bookworm
    init: true
    command: tail -f /dev/null   # mantener el contenedor vivo
    network_mode: none           # sin red: el agente no puede salir a internet
    cpus: 1.0
    mem_limit: 0.5gb` },
        { tipo: 'codigo', lenguaje: 'bash', titulo: 'Ejecutar y ver resultados', codigo: `cd labs/lab05_inspect_ai
pip install -r requirements.txt
docker info                                     # comprueba que Docker responde
export ANTHROPIC_API_KEY=...

inspect list tasks tarea_ctf.py
inspect eval tarea_ctf.py --model anthropic/<modelo>
inspect eval tarea_ctf.py@ctf_mini_fiabilidad --model anthropic/<modelo>
inspect view                                    # visor web de los logs` },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Salida real de inspect list tasks', codigo: `tarea_ctf.py@ctf_mini
tarea_ctf.py@ctf_mini_fiabilidad
tarea_ctf.py@ctf_mini_react` },
        { tipo: 'p', html: `Cuando lo ejecutes, en <code>inspect view</code> mira: (1) la puntuación por muestra; (2) el transcript de cada una: ¿qué comandos usó el agente? ¿Hizo <code>ls -la</code> en el reto 1? ¿Contó con <code>grep -cw ERROR</code> o se dejó engañar por «ERRORES» y «error»?; (3) tokens y tiempo por muestra; y (4) con épocas, qué muestras pasan unas veces sí y otras no. Los nombres de parámetros cambian entre versiones de Inspect: si algo falla, consulta <code>inspect eval --help</code> y la documentación de tu versión.` },
        { tipo: 'ejercicio', id: 'm11-e6', titulo: 'Un scorer más estricto (y uno de estado)',
          enunciado: `El scorer <code>includes()</code> da por correcta cualquier respuesta que <em>contenga</em> el <em>target</em>. (a) Explica por qué es arriesgado en el reto 3. (b) Propón cómo portarías la tarea <code>fs-01</code> del lab 1 a Inspect con un scorer que compruebe el <strong>estado</strong> del sandbox en lugar de la respuesta.`,
          pistas: [ '¿Qué pasa si el agente envía «FLAG{17} o quizá FLAG{18}»?', 'Dentro de un scorer de Inspect puedes ejecutar comandos en el sandbox de la muestra.' ],
          solucion: `(a) Un agente que envía «FLAG{17} o quizá FLAG{18}» o una lista de candidatas aprueba con <code>includes()</code>: el scorer premia la ambigüedad. Mejor un scorer que exija que la respuesta enviada sea exactamente la flag (por ejemplo <code>match()</code> o uno propio que normalice espacios y compare la cadena completa), y que <code>max_attempts</code> sea bajo y conocido. (b) Crea las muestras con <code>files</code> que reproduzcan <code>fs_inicial</code> (<code>proyecto/a.log</code>, <code>proyecto/b.log</code>...), da al agente <code>bash()</code> y escribe un <code>@scorer</code> propio que llame a <code>sandbox().exec(["ls", "proyecto", "proyecto/archivo"])</code> y compruebe que los .log están en <code>archivo/</code>, que ya no están en <code>proyecto/</code> y que <code>main.py</code> y <code>notas.txt</code> siguen intactos. Es el mismo <code>estado_fs</code> del lab 1, pero contra un contenedor real.` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s8
    {
      id: 's8',
      titulo: 'Cierre: checklist y siguientes pasos',
      bloques: [
        { tipo: 'p', html: `Si has llegado hasta aquí ejecutando los comandos, has hecho en pequeño todo el ciclo de una evaluación seria: especificar tareas, aislar ensayos, calificar resultado y camino, leer transcripts, cuantificar la incertidumbre, comparar con un diseño pareado, calibrar un juez y pasar a una herramienta real. Marca lo que hayas completado:` },
        { tipo: 'checklist', id: 'm11-ck1', titulo: 'Checklist del laboratorio', items: [
          'He creado el entorno virtual y ejecutado <code>python -m unittest</code> en el lab 1 con las 21 pruebas en verde',
          'He ejecutado el lab 1 con los dos agentes y sé explicar la diferencia entre pass@5 y pass^5 en la tabla',
          'He leído al menos un transcript fallido con <code>--ver</code> y he identificado el paso culpable',
          'He ejecutado el experimento <code>--compartir-entorno</code> y sé explicar por qué cambia fs-03',
          'He añadido una tarea propia a <code>tareas.json</code> con un grader de estado o de trayectoria',
          'He ejecutado el lab 2 y he interpretado una comparación pareada (tabla 2×2, McNemar e IC por tareas)',
          'He ejecutado el lab 3 (simulado o real) y sé calcular TPR, TNR y kappa a partir de la matriz de confusión',
          'He ejecutado los tres scripts del lab 4 y sé estimar cuántas tareas necesito para detectar una mejora',
          'He leído (o ejecutado) la tarea de Inspect AI y sé qué pieza del lab 1 corresponde a cada parámetro',
        ] },
        { tipo: 'h', texto: 'Para seguir practicando' },
        { tipo: 'lista', items: [
          '<strong>Sustituye el agente simulado por uno real</strong>: implementa <code>resolver(tarea, entorno, registro, rng)</code> con un bucle de llamadas a un modelo y las herramientas del <code>Entorno</code>. El resto del harness no cambia.',
          '<strong>Añade un grader <code>contiene</code></strong> y su prueba en <code>tests/test_graders.py</code>.',
          '<strong>Haz más estricto el límite de pasos</strong> (<code>--max-pasos 3</code>) y decide qué tareas se vuelven injustas.',
          '<strong>Calibra un juez LLM real</strong> en el lab 3 y compara su kappa con la del simulado.',
          '<strong>Porta una tarea con estado a Inspect AI</strong> con un scorer propio (ejercicio de la sección anterior).',
        ] },
        { tipo: 'enlaces', items: [
          { titulo: 'Inspect AI: documentación', url: 'https://inspect.aisi.org.uk/', html: 'Tareas, solvers, agentes, sandboxes, scorers, épocas y el visor de logs.' },
          { titulo: 'Chen et al. (2021): Evaluating Large Language Models Trained on Code', url: 'https://arxiv.org/abs/2107.03374', html: 'Origen del estimador insesgado de pass@k que usa <code>metricas.py</code>.' },
          { titulo: 'Yao et al. (2024): τ-bench', url: 'https://arxiv.org/abs/2406.12045', html: 'Benchmark de agentes con herramientas que popularizó pass^k como medida de fiabilidad.' },
          { titulo: 'Miller (2024): Adding Error Bars to Evals', url: 'https://arxiv.org/abs/2411.00640', html: 'Errores estándar agrupados, análisis pareado y potencia estadística para evals.' },
          { titulo: 'Zheng et al. (2023): Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena', url: 'https://arxiv.org/abs/2306.05685', html: 'Sesgos de los jueces LLM, incluido el sesgo de posición.' },
        ] },
      ],
    },
  ],
  resumen: [
    'Un harness separa las tareas (datos), el agente, el entorno y los graders; así puedes cambiar el agente o el patrón sin tocar la evaluación.',
    'Cada ensayo necesita un entorno nuevo: compartirlo contamina los resultados de las tareas con estado, como muestra fs-03 con --compartir-entorno.',
    'Combina graders de respuesta, de estado y de camino: el estado caza los éxitos falsos y la trayectoria las herramientas prohibidas.',
    'pass@k mide capacidad (alguno de k sale bien) y pass^k fiabilidad (todos salen bien); con pocos ensayos, pass@k satura enseguida.',
    'Con varios ensayos por tarea, usa intervalos que remuestreen tareas o errores estándar agrupados; Wilson sobre ensayos sueltos es optimista.',
    'Compara agentes con las mismas tareas y semillas y analiza los pares discordantes; McNemar sobre ensayos repetidos exagera la significación.',
    'Antes de fiarte de un juez LLM, mide TPR, TNR y kappa contra etiquetas humanas y comprueba que su veredicto no cambia al intercambiar posiciones.',
    'Detectar mejoras de pocos puntos exige cientos o miles de tareas; el diseño pareado reduce mucho esa cifra.',
  ],
  quiz: [
    {
      tipo: 'unica',
      pregunta: 'En la tabla del lab 1 una tarea muestra «Éxitos 4/5, pass@1 0.80, pass@5 1.00, pass^5 0.00». ¿Qué lectura es correcta?',
      opciones: [
        'La tarea se resolvió en 4 de 5 ensayos: el agente es capaz de hacerla, pero no la hace bien de forma consistente',
        'La tarea es fiable al 100 % porque pass@5 vale 1',
        'pass^5 = 0 indica que el agente nunca resolvió la tarea',
        'Hay un error de cálculo: si pass@1 es 0,8, pass^5 no puede ser 0',
      ],
      correcta: 0,
      explicacion: 'Con n = k = 5, pass@5 vale 1 en cuanto hay un éxito, y pass^5 vale 1 solo si los cinco son éxitos. 4/5 significa capacidad sin fiabilidad completa. pass^5 = 0 no significa «nunca»: significa «no siempre». Que pass^5 sea 0 con 4/5 es exactamente lo que da el estimador C(4,5)/C(5,5).',
      seccion: 's3',
    },
    {
      tipo: 'unica',
      pregunta: 'Con <code>--compartir-entorno</code>, la tarea fs-03 («borra los .tmp») pasa de 2/5 a 3/5 sin cambiar el agente. ¿Cuál es la explicación?',
      opciones: [
        'Un ensayo anterior dejó borrados ficheros que el ensayo siguiente «olvidó» borrar, y el grader de estado vio un estado correcto que ese ensayo no produjo',
        'Compartir el entorno da más pasos al agente y por eso acierta más',
        'El agente aprende de los ensayos anteriores porque recuerda el transcript',
        'El grader de trayectoria deja de comprobar la herramienta prohibida',
      ],
      correcta: 0,
      explicacion: 'El agente simulado no tiene memoria entre ensayos y el límite de pasos se reinicia en cada ensayo. Lo que se hereda es el estado del sistema de ficheros: la contaminación entre ensayos que el aislamiento (un Entorno nuevo por ensayo) evita. Puede inflar o desinflar resultados según la tarea.',
      seccion: 's3',
    },
    {
      tipo: 'vf',
      afirmacion: 'En la tarea fs-01, si el agente responde «Hecho: he movido todos los .log a /proyecto/archivo/», un grader que compare esa respuesta con la esperada basta para saber si la tarea se hizo.',
      correcta: false,
      explicacion: 'Esa es precisamente la respuesta de un éxito falso: en el transcript del lab, el agente solo movió a.log. Las tareas con efectos se califican mirando el estado final del entorno (estado_fs), no lo que el agente dice que hizo.',
      seccion: 's2',
    },
    {
      tipo: 'emparejar',
      pregunta: 'Empareja cada grader del lab 1 con lo que comprueba.',
      pares: [
        ['<code>estado_fs</code>', 'Qué ficheros existen, faltan o se han modificado al terminar'],
        ['<code>trayectoria</code>', 'Número de pasos y uso de herramientas prohibidas'],
        ['<code>json_esquema</code>', 'Que la respuesta sea un objeto JSON con las claves y tipos pedidos'],
        ['<code>numerico</code>', 'Que la respuesta sea un número dentro de una tolerancia'],
        ['<code>llamada_herramienta</code>', 'Que se haya usado una herramienta concreta, opcionalmente con ciertos argumentos'],
      ],
      explicacion: 'Los dos primeros miran el resultado y el camino; los dos siguientes, la respuesta; el último, el camino. Una buena tarea suele combinar al menos dos familias de graders.',
      seccion: 's3',
    },
    {
      tipo: 'unica',
      pregunta: 'En la comparación pareada react frente a react_verificacion, la tabla 2×2 es: ambos aciertan 90, solo A 0, solo B 12, ninguno 18. ¿Qué datos usa el test de McNemar?',
      opciones: [
        'Solo los pares discordantes: 0 y 12',
        'Los 120 pares, ponderando más los 90 en que ambos aciertan',
        'Solo los pares en que ambos aciertan o ambos fallan (90 y 18)',
        'Las tasas globales de éxito de cada patrón (0,75 y 0,85)',
      ],
      correcta: 0,
      explicacion: 'Los pares concordantes no dicen nada sobre cuál es mejor. Bajo la hipótesis nula, cada par discordante cae a un lado u otro con probabilidad 1/2; con 0 frente a 12 el p-valor exacto es 2 × (1/2)^12 ≈ 0,0005. Comparar las tasas globales como si fueran muestras independientes desaprovecha el emparejamiento.',
      seccion: 's4',
    },
    {
      tipo: 'numerica',
      pregunta: 'Calcula el p-valor exacto (bilateral) de McNemar con b = 1 y c = 9 pares discordantes. Pista: 2 × [C(10,0) + C(10,1)] / 2^10.',
      respuesta: 0.0215,
      tolerancia: 0.001,
      explicacion: 'C(10,0) + C(10,1) = 1 + 10 = 11; 2 × 11 / 1024 = 22/1024 ≈ 0,0215. Es el valor que fija la prueba test_valor_conocido de tests/test_metricas.py.',
      seccion: 's4',
    },
    {
      tipo: 'multiple',
      pregunta: 'En el lab 2 hay 10 ensayos de cada una de 12 tareas. ¿Qué afirmaciones sobre el análisis son correctas?',
      opciones: [
        'Los ensayos de una misma tarea están correlacionados, así que McNemar sobre los 120 pares da un p-valor demasiado optimista',
        'El intervalo bootstrap que remuestrea tareas respeta esa estructura y es más honesto',
        'Usar las mismas semillas para todos los patrones hace que la comparación pareada sea más precisa',
        'Si los intervalos de dos patrones se solapan, eso demuestra que son igual de buenos',
      ],
      correctas: [0, 1, 2],
      explicacion: 'Las tres primeras resumen el diseño del lab. La última es un error clásico: el solapamiento no demuestra igualdad (y tampoco es un buen test de diferencia); como mucho dice que con estos datos no has detectado una diferencia.',
      seccion: 's4',
    },
    {
      tipo: 'multiple',
      pregunta: 'Según la salida del lab 2, ¿qué afirmaciones sobre <code>voto_mayoria_3</code> son correctas?',
      opciones: [
        'Es el patrón con mayor coste por ensayo y por éxito',
        'Mejora poco en las tareas de ficheros, porque votar sobre respuestas como «Hecho» no indica qué rama dejó bien el sistema',
        'Obtiene el mejor pass^10 de la tabla',
        'Es significativamente mejor que react_verificacion según McNemar',
      ],
      correctas: [0, 1, 2],
      explicacion: 'Coste por ensayo 0,01984 y por éxito 0,02455 (los más altos); 0,63 en «archivos» frente a 0,77 de la verificación; pass^10 de 0,333, el mejor. La comparación con react_verificacion dio p = 0,4869 y un IC de la diferencia que incluye el 0: no hay diferencia demostrada.',
      seccion: 's4',
    },
    {
      tipo: 'unica',
      pregunta: 'En el lab 3, la matriz del juez simulado es TP = 7, FN = 1, FP = 4, TN = 4 (positivo = pass). ¿Cuánto vale la TNR?',
      opciones: [ '0,50', '0,875', '0,688', '0,375' ],
      correcta: 0,
      explicacion: 'TNR = TN / (TN + FP) = 4 / 8 = 0,50: de las respuestas que el humano suspende, el juez solo suspende la mitad. 0,875 es la TPR, 0,688 la accuracy y 0,375 la kappa.',
      seccion: 's5',
    },
    {
      tipo: 'vf',
      afirmacion: 'Si un juez elige la respuesta A cuando se la presentas primero y la B cuando las intercambias, su veredicto en esa comparación debe contarse como empate o descartarse.',
      correcta: true,
      explicacion: 'Un veredicto que depende del orden refleja sesgo de posición, no calidad. Por eso calibrar.py --pareado ejecuta cada comparación en los dos órdenes y solo acepta los veredictos consistentes.',
      seccion: 's5',
    },
    {
      tipo: 'unica',
      pregunta: 'Según tamano_muestra.py, para detectar una mejora de 0,70 a 0,80 con potencia del 80 % y α = 0,05 con muestras independientes hacen falta unas 294 tareas por agente. ¿Qué cambio reduce más esa cifra sin cambiar la diferencia a detectar?',
      opciones: [
        'Evaluar ambos agentes sobre las mismas tareas y analizar los resultados por pares',
        'Repetir la misma evaluación de 50 tareas varias veces y quedarse con la mejor ejecución',
        'Usar el intervalo de Wilson en lugar del bootstrap',
        'Aumentar el nivel de confianza al 99 %',
      ],
      correcta: 0,
      explicacion: 'Con un diseño pareado y un 20 % de discordancia bastan 155 tareas en total. Quedarse con la mejor ejecución es seleccionar ruido (sesgo optimista), cambiar de intervalo no cambia la información disponible y subir la confianza aumenta el número de tareas necesario.',
      seccion: 's6',
    },
    {
      tipo: 'unica',
      pregunta: 'En el lab 5, ¿qué parámetro de la tarea de Inspect AI cumple el papel del <code>Entorno</code> nuevo por ensayo del lab 1?',
      opciones: [
        '<code>sandbox=("docker", "compose.yaml")</code> junto con los <code>files</code> de cada <code>Sample</code>',
        '<code>scorer=includes()</code>',
        '<code>message_limit=30</code>',
        '<code>max_attempts=2</code>',
      ],
      correcta: 0,
      explicacion: 'El sandbox Docker crea un contenedor aislado para la muestra y copia en él sus ficheros: es el equivalente del Entorno con fs_inicial. message_limit equivale al límite de pasos, includes() a un grader y max_attempts a los reintentos que permite el solver.',
      seccion: 's7',
    },
  ],
});
