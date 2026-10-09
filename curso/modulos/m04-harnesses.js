registrarModulo({
  id: 'm04',
  numero: 4,
  titulo: 'Harnesses: el del agente y el de evaluación',
  subtitulo: 'Distingue el código que hace actuar al modelo del que lo pone a prueba, entiende por qué ambos cambian la nota y aprende a montar un harness de evaluación fiable y reproducible.',
  duracion: '110 min',
  nivel: 'Intermedio',
  objetivos: [
    'Distinguir con precisión el <em>agent harness</em> (o <em>scaffold</em>) del <em>evaluation harness</em> y ubicar cada pieza de un sistema en uno de los dos o en el entorno',
    'Describir los componentes de un agent harness (bucle, condiciones de parada, herramientas, gestión de contexto, permisos, trazas) y explicar por qué el diseño de herramientas importa tanto como el prompt',
    'Diseñar experimentos controlados que aíslen el efecto del modelo, del harness o de la combinación de ambos',
    'Comparar frameworks de agentes y de evaluación (Inspect AI, Harbor, SWE-bench, BrowserGym, promptfoo, plataformas de observabilidad...) y elegir según criterios explícitos',
    'Montar un harness de evaluación robusto: aislamiento, determinismo, límites de recursos, separación entre errores de infraestructura y fallos del agente, y manifiesto de reproducibilidad',
    'Reconocer las trampas típicas al comparar resultados obtenidos con harnesses distintos',
  ],
  secciones: [
    // ─────────────────────────────────────────────────────────────── s1
    {
      id: 's1',
      titulo: 'Una palabra, dos significados',
      bloques: [
        { tipo: 'p', html: `Si lees artículos, <em>leaderboards</em> o hilos sobre agentes, verás la palabra <em>harness</em> (literalmente «arnés») en dos sentidos que se confunden con muchísima frecuencia. En el módulo 2 los presentamos de pasada; aquí vamos a desmontarlos pieza a pieza, porque buena parte de los errores al evaluar agentes vienen de mezclar uno con otro o de olvidar que existen.` },
        { tipo: 'h', texto: 'La intuición: coche, ayudas a la conducción y pista de pruebas' },
        { tipo: 'p', html: `Piensa en un coche de competición. El <strong>motor</strong> es el modelo de lenguaje: aporta la potencia bruta. Pero un motor suelto no gana carreras. Necesita un <strong>chasis, una transmisión, un volante, sensores y ayudas a la conducción</strong> (control de tracción, ABS) que convierten la potencia en movimiento útil. Eso es el <em>agent harness</em>: el código que rodea al modelo y le permite <em>actuar</em> en el mundo.` },
        { tipo: 'p', html: `Ahora piensa en cómo se homologa ese coche. Hace falta una <strong>pista de pruebas</strong> con conos colocados siempre igual, cronómetros, sensores, cámaras, un protocolo de cuántas vueltas se dan, en qué condiciones de asfalto y temperatura, y un registro de cada vuelta. Eso es el <em>evaluation harness</em>: la infraestructura que ejecuta las pruebas de principio a fin, mide y guarda los resultados.` },
        { tipo: 'p', html: `La analogía revela dos cosas importantes. Primera: si cambias el chasis, el mismo motor da tiempos distintos; no puedes atribuir el tiempo de vuelta solo al motor. Segunda: si la pista está mal montada (un cono movido, un cronómetro que se cuelga, restos de aceite de la vuelta anterior), el tiempo medido no refleja ni el motor ni el chasis, sino un defecto de la pista.` },
        { tipo: 'h', texto: 'Definiciones precisas' },
        { tipo: 'terminos', items: [
          { termino: 'Agent harness (scaffold, andamiaje)', html: `Todo el software que envuelve al modelo para convertirlo en un agente: el bucle de control que alterna llamadas al modelo y ejecución de herramientas, el <em>system prompt</em>, las definiciones de herramientas y el formato de sus resultados, la gestión del contexto, el manejo de errores, los permisos, el <em>sandbox</em>, los puntos de intervención humana y la instrumentación. Ejemplos: Claude Code, Codex CLI, OpenHands, SWE-agent o tu propio bucle de 60 líneas.` },
          { termino: 'Evaluation harness (eval harness)', html: `La infraestructura que ejecuta una evaluación completa: carga las tareas, crea un entorno limpio para cada <em>trial</em>, lanza el agente (con su agent harness) bajo unos límites, recoge el <em>transcript</em> y el estado final, ejecuta los <em>graders</em>, agrega métricas y guarda todo con metadatos para que se pueda reproducir. Ejemplos: Inspect AI, Harbor, el harness de SWE-bench o tu propio script.` },
          { termino: 'Entorno (environment)', html: `El «mundo» sobre el que actúa el agente durante un trial: un repositorio en un contenedor, una web, una base de datos simulada, un usuario simulado. No es código del agente ni de la evaluación; es el escenario. El eval harness lo crea y lo destruye; el agent harness lo manipula a través de herramientas.` },
          { termino: 'Sistema evaluado', html: `Lo que realmente recibe la nota: casi nunca es «el modelo» a secas, sino el par <strong>modelo + agent harness</strong> (más su configuración: prompt, herramientas, límites). Esta idea guía todo el módulo.` },
        ] },
        { tipo: 'figura', svg: `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13"><rect x="10" y="10" width="620" height="280" rx="12" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="24" y="34" fill="var(--accent)" font-weight="bold">Eval harness: tareas, trials, límites, graders, logs, métricas</text><rect x="40" y="52" width="400" height="200" rx="10" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="6 4"/><text x="54" y="74" fill="var(--muted)">Entorno del trial (contenedor, web, BD, usuario simulado)</text><rect x="70" y="90" width="340" height="140" rx="10" fill="none" stroke="var(--ink)" stroke-width="2"/><text x="84" y="112" fill="var(--ink)" font-weight="bold">Agent harness</text><text x="84" y="132" fill="var(--muted)">bucle · prompt · herramientas · contexto · permisos</text><rect x="160" y="150" width="160" height="60" rx="8" fill="none" stroke="var(--pass)" stroke-width="2"/><text x="240" y="185" fill="var(--pass)" text-anchor="middle" font-weight="bold">Modelo</text><rect x="470" y="70" width="140" height="50" rx="8" fill="none" stroke="var(--accent)" stroke-width="1.5"/><text x="540" y="100" fill="var(--ink)" text-anchor="middle">Graders</text><rect x="470" y="140" width="140" height="50" rx="8" fill="none" stroke="var(--accent)" stroke-width="1.5"/><text x="540" y="170" fill="var(--ink)" text-anchor="middle">Logs + manifiesto</text><rect x="470" y="210" width="140" height="50" rx="8" fill="none" stroke="var(--accent)" stroke-width="1.5"/><text x="540" y="240" fill="var(--ink)" text-anchor="middle">Métricas</text><line x1="440" y1="150" x2="470" y2="95" stroke="var(--muted)" stroke-width="1.5"/><line x1="440" y1="160" x2="470" y2="165" stroke="var(--muted)" stroke-width="1.5"/><line x1="440" y1="170" x2="470" y2="235" stroke="var(--muted)" stroke-width="1.5"/></svg>`, pie: 'El modelo vive dentro del agent harness; ambos actúan dentro de un entorno; el eval harness crea ese entorno, lanza el agente, califica el resultado y lo registra todo.' },
        { tipo: 'comparar', columnas: [
          { titulo: 'Agent harness', tono: 'accent', items: [
            '<strong>Pregunta que responde:</strong> ¿cómo actúa el modelo?',
            'Forma parte del <strong>sistema evaluado</strong>; cambia la nota',
            'Bucle, prompt, herramientas, contexto, permisos, reintentos de API',
            'Se despliega en producción junto al modelo',
            'Lo optimizas para que el agente sea mejor',
            'Ejemplos: Claude Code, Codex CLI, OpenHands, SWE-agent, Aider',
          ] },
          { titulo: 'Eval harness', tono: 'ink', items: [
            '<strong>Pregunta que responde:</strong> ¿cómo medimos lo que hace?',
            'Es el <strong>instrumento de medida</strong>; idealmente no cambia la nota',
            'Tareas, trials, entornos limpios, límites, graders, logs, métricas',
            'No va a producción; vive en tu CI o en tu clúster de evals',
            'Lo optimizas para que la medida sea fiable y reproducible',
            'Ejemplos: Inspect AI, Harbor, harness de SWE-bench, promptfoo',
          ] },
        ] },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico', html: `Decir «el modelo X saca un tanto por ciento en el benchmark Y» cuando lo que se midió fue «el modelo X <strong>dentro del agente Z</strong>, con N intentos y un límite de M turnos». La frase correcta siempre nombra el par modelo + agent harness y la configuración. Al final de este módulo verás que el mismo modelo puede subir o bajar mucho solo cambiando el andamiaje.` },
        { tipo: 'pregunta', id: 'm04-c1', pregunta: { tipo: 'unica',
          pregunta: 'Tu equipo cambia la herramienta de edición de ficheros del agente (de «reescribir el fichero entero» a «reemplazar un fragmento exacto»). ¿Qué has modificado?',
          opciones: [
            'El agent harness: cambia el sistema evaluado, así que la nota puede cambiar legítimamente',
            'El eval harness: es parte de la infraestructura de medida',
            'El entorno: los ficheros del repositorio son el entorno',
            'Nada relevante para la evaluación: las herramientas son un detalle de implementación',
          ],
          correcta: 0,
          explicacion: `Las herramientas que el agente puede invocar, su interfaz y el formato de sus resultados son parte del <strong>agent harness</strong>. No es la infraestructura de medida (eso sería, por ejemplo, cómo se crean los contenedores o cómo se ejecutan los tests de calificación) ni el entorno (los ficheros existen igual con una herramienta u otra). Y no es un detalle: como verás con SWE-agent, el diseño de herramientas puede mover los resultados tanto como el prompt.`,
          seccion: 's1' } },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s2
    {
      id: 's2',
      titulo: 'Anatomía de un agent harness',
      bloques: [
        { tipo: 'p', html: `Un modelo de lenguaje, por sí solo, recibe texto y devuelve texto (o bloques estructurados como una petición de herramienta). No ejecuta nada, no recuerda nada entre llamadas y no sabe cuándo parar. Todo eso lo pone el agent harness. Vamos a recorrer sus componentes en el orden en que aparecen durante una ejecución.` },
        { tipo: 'flujo', titulo: 'El bucle de control de un agente', pasos: [
          { titulo: 'Construir el contexto', texto: 'System prompt + definiciones de herramientas + historial (posiblemente compactado) + memoria' },
          { titulo: 'Llamar al modelo', texto: 'Con reintentos ante errores transitorios de la API' },
          { titulo: '¿Pide herramientas?', texto: 'Si no: comprobar condición de parada y terminar' },
          { titulo: 'Comprobar permisos', texto: 'Política automática o confirmación humana' },
          { titulo: 'Ejecutar herramientas', texto: 'En sandbox, con timeout, en paralelo si son independientes' },
          { titulo: 'Formatear resultados', texto: 'Truncar, resumir errores, marcar is_error' },
          { titulo: 'Registrar la traza', texto: 'Cada paso, tokens, latencia, coste' },
        ], bucle: 'Repetir hasta que el modelo termine o salte un límite' },
        { tipo: 'p', html: `Este bucle es engañosamente simple: cabe en unas decenas de líneas (lo verás en la sección 3). La dificultad, y la diferencia entre un agente mediocre y uno bueno, está en las decisiones que se toman en cada caja. Despliega cada componente para ver qué decisiones hay y cómo afectan a la evaluación.` },
        { tipo: 'acordeon', items: [
          { titulo: '1. Bucle de control y condiciones de parada', bloques: [
            { tipo: 'p', html: `El bucle alterna «el modelo decide» y «el harness ejecuta». La pregunta crítica es <strong>cuándo termina</strong>. Las condiciones habituales son: (a) el modelo responde sin pedir herramientas (en la API de Anthropic, <code>stop_reason</code> distinto de <code>tool_use</code>); (b) el modelo invoca una herramienta explícita de finalización (<code>submit</code>, <code>done</code>, <code>finish</code>), que obliga a declarar el final de forma inequívoca; (c) se alcanza un <strong>máximo de turnos</strong>; (d) se agota un <strong>presupuesto de tokens o de coste</strong>; (e) vence un <strong>timeout de reloj</strong>.` },
            { tipo: 'p', html: `Para la evaluación esto importa muchísimo: un límite de 20 turnos convierte en fallo cualquier tarea que necesite 25, aunque el agente iba por buen camino. Por eso el motivo de parada debe registrarse en cada trial (<code>end_turn</code>, <code>submit</code>, <code>max_turnos</code>, <code>timeout</code>, <code>presupuesto</code>) y analizarse: si el 30 % de los fallos son por <code>max_turnos</code>, lo que estás midiendo es en parte tu límite, no tu agente.` },
          ] },
          { titulo: '2. System prompt e instrucciones', bloques: [
            { tipo: 'p', html: `El <em>system prompt</em> fija el rol, el estilo de trabajo («verifica con los tests antes de terminar»), las restricciones («no modifiques los tests») y el contexto del entorno («estás en un contenedor Linux con Python 3.11»). Muchos harnesses añaden instrucciones dinámicas: el directorio actual, la fecha, ficheros de memoria del proyecto (por ejemplo, un <code>CLAUDE.md</code> o <code>AGENTS.md</code>) o recordatorios periódicos.` },
            { tipo: 'p', html: `En evaluación, el prompt es una variable experimental más. Un prompt ajustado a una familia de modelos puede perjudicar a otra; un prompt que menciona detalles del benchmark puede filtrar información. Versiona el prompt y regístralo (o su hash) en cada ejecución.` },
          ] },
          { titulo: '3. Definiciones de herramientas y la interfaz agente-ordenador (ACI)', bloques: [
            { tipo: 'p', html: `Cada herramienta tiene un nombre, una descripción en lenguaje natural y un esquema de parámetros. El modelo solo «ve» eso: si la descripción es ambigua, la usará mal. El trabajo de <strong>SWE-agent (Yang et al., 2024)</strong> acuñó el término <em>Agent-Computer Interface</em> (ACI): igual que diseñamos interfaces para personas (HCI), hay que diseñar interfaces para agentes. En lugar de dar al modelo una shell en bruto, SWE-agent le daba comandos pensados para él: un visor de ficheros que muestra una <strong>ventana</strong> de líneas con números y permite desplazarse, comandos de <strong>búsqueda</strong> en ficheros y directorios con resultados resumidos, y un comando de <strong>edición</strong> por rangos de líneas que pasa un <em>linter</em> y rechaza los cambios con errores de sintaxis antes de aplicarlos. Además, cuidaba que el <em>feedback</em> fuera conciso (por ejemplo, un mensaje explícito cuando un comando no producía salida, para que el modelo no se quedara dudando).` },
            { tipo: 'p', html: `Sus experimentos de ablación mostraron que esta interfaz mejoraba los resultados frente a usar solo la shell de Linux con el mismo modelo. La lección general, que Anthropic repite en su guía «Building effective agents» (Schluntz y Zhang, 2024), es que <strong>el diseño de herramientas merece tanta atención como el prompt</strong>. Esa guía cuenta, por ejemplo, que en su agente para SWE-bench el modelo se equivocaba con rutas relativas después de cambiar de directorio, y que el problema desapareció al exigir rutas absolutas en la herramienta: un cambio de interfaz, no de modelo.` },
          ] },
          { titulo: '4. Formato y truncado de las salidas de herramientas', bloques: [
            { tipo: 'p', html: `Un <code>cat</code> de un log de 50 MB o un <code>pytest</code> con miles de líneas puede llenar el contexto de un golpe. El harness decide cómo truncar (¿cabeza?, ¿cola?, ¿ambas con un aviso de cuántos caracteres se omitieron?), si convierte HTML a texto, si resume trazas de error, si pagina los resultados. Un truncado que corta justo la línea del error final hace que el agente «no vea» por qué fallan los tests: un fallo que parece de razonamiento y es de harness.` },
            { tipo: 'p', html: `Buenas prácticas: mantener cabeza y cola, indicar explícitamente que hubo truncado y cuánto, permitir pedir más (paginación) y marcar los errores con un campo estructurado (en la API de Anthropic, <code>is_error: true</code> en el <code>tool_result</code>).` },
          ] },
          { titulo: '5. Gestión del contexto', bloques: [
            { tipo: 'p', html: `En tareas largas el historial crece hasta acercarse a la ventana de contexto, y mucho antes de llegar al límite la calidad puede degradarse porque la información relevante queda enterrada. Las técnicas principales son:` },
            { tipo: 'lista', items: [
              '<strong>Compactación o resumen</strong>: cuando el historial supera un umbral, se sustituye la parte antigua por un resumen (generado por el propio modelo o por otro). Riesgo: perder un detalle que luego hace falta.',
              '<strong>Edición de contexto</strong>: borrar selectivamente lo que ya no aporta (por ejemplo, resultados de herramientas antiguos), dejando un marcador. Más barato que resumir, pero igual de arriesgado si se borra algo útil.',
              '<strong>Ficheros de memoria</strong>: el agente escribe notas persistentes (plan, decisiones, progreso) en ficheros que se recargan; sobreviven a compactaciones y a sesiones distintas.',
              '<strong>Subagentes con contexto limpio</strong>: el agente principal delega una subtarea (investigar, buscar en el código) a otro agente que empieza con contexto vacío y devuelve solo un resumen. Mantiene limpio el contexto principal a costa de más llamadas.',
            ] },
            { tipo: 'p', html: `Cada técnica es una decisión de harness que cambia la nota en tareas largas y casi no la cambia en tareas cortas. Por eso, para evaluar una estrategia de contexto necesitas tareas que realmente la activen (lo practicarás en el ejercicio de la sección 4).` },
          ] },
          { titulo: '6. Manejo de errores y reintentos', bloques: [
            { tipo: 'p', html: `Hay dos niveles muy distintos. <strong>Errores de la API del modelo</strong> (límite de tasa, sobrecarga, cortes de red): el harness debe reintentar con espera exponencial, porque no dicen nada del agente. <strong>Errores de herramientas</strong> (un comando que falla, un fichero inexistente): se devuelven al modelo como resultado, para que razone y corrija; ocultarlos o reintentarlos a ciegas le quita información.` },
            { tipo: 'p', html: `Para la evaluación, distingue además un tercer tipo: <strong>errores de infraestructura del eval harness</strong> (el contenedor no arranca, el nodo se queda sin disco). Esos no son del agente y se tratan en la sección 7.` },
          ] },
          { titulo: '7. Llamadas a herramientas en paralelo', bloques: [
            { tipo: 'p', html: `Los modelos actuales pueden pedir varias herramientas en un mismo turno (leer cinco ficheros a la vez). El harness puede ejecutarlas en paralelo y devolver todos los resultados juntos. Ahorra turnos y tiempo de reloj, pero introduce condiciones de carrera si dos herramientas escriben en el mismo sitio. En evaluación, cambia métricas como «número de turnos» o «latencia»: no compares turnos entre un harness que paraleliza y otro que no.` },
          ] },
          { titulo: '8. Permisos y sandboxing', bloques: [
            { tipo: 'p', html: `¿Puede el agente borrar ficheros, hacer <code>git push</code>, acceder a internet, gastar dinero? Los harnesses de producción definen políticas: listas de comandos permitidos, modos «pedir confirmación» y «automático», y aislamiento en contenedores o máquinas virtuales. En evaluación, la configuración de permisos debe ser <strong>idéntica entre condiciones</strong> y lo bastante permisiva para que la tarea sea resoluble sin un humano; y el sandbox protege tu infraestructura de un agente que hace algo destructivo o que intenta salir del entorno.` },
          ] },
          { titulo: '9. Puntos de intervención humana (human-in-the-loop)', bloques: [
            { tipo: 'p', html: `En producción, muchos agentes se detienen a pedir aprobación antes de acciones sensibles o cuando están bloqueados. En una eval automática no hay humano: o bien se desactivan esos puntos, o bien se sustituye al humano por una política fija («aprobar todo lo que no sea destructivo») o por un usuario simulado. Documenta qué hiciste: un agente que en producción pediría ayuda puede quedar atascado en la eval, y eso es un artefacto de la configuración.` },
          ] },
          { titulo: '10. Observabilidad y trazas', bloques: [
            { tipo: 'p', html: `El harness debe poder emitir la traza completa: cada mensaje, cada llamada a herramienta con sus argumentos y resultado, tokens de entrada y salida, latencias, coste, motivo de parada. Sin trazas no hay depuración ni calificación de la trayectoria. Muchos frameworks integran OpenTelemetry o exportan a plataformas de observabilidad (las verás en la sección 6).` },
          ] },
        ] },
        { tipo: 'callout', variante: 'clave', titulo: 'Idea clave', html: `Cada componente del agent harness es una <strong>palanca que cambia el comportamiento del agente</strong>. Cuando comparas dos agentes, cualquier diferencia en cualquiera de estas palancas es una variable de confusión, salvo que sea precisamente lo que quieres comparar.` },
        { tipo: 'pregunta', id: 'm04-c2', pregunta: { tipo: 'multiple',
          pregunta: '¿Cuáles de estas decisiones de harness pueden hacer que un agente <strong>parezca</strong> peor razonando cuando el problema está en el andamiaje?',
          opciones: [
            'Truncar la salida de <code>pytest</code> quedándose solo con las primeras líneas, de modo que el error final no aparece',
            'Un límite de turnos inferior a lo que necesitan las tareas largas',
            'Una descripción ambigua de la herramienta de edición que no aclara si las rutas son relativas o absolutas',
            'Registrar el coste en tokens de cada trial en el log',
          ],
          correctas: [0, 1, 2],
          explicacion: `Las tres primeras alteran lo que el agente ve o lo que puede hacer: sin el error final no puede diagnosticar; con pocos turnos se corta antes de terminar; con una interfaz ambigua comete errores evitables. Registrar el coste es observabilidad pura: no cambia lo que el agente ve ni lo que hace (y es una buena práctica).`,
          seccion: 's2' } },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s3
    {
      id: 's3',
      titulo: 'Un agent harness mínimo, línea a línea',
      bloques: [
        { tipo: 'p', html: `Para desmitificarlo, aquí tienes un agent harness completo con la API de Mensajes de Anthropic y uso de herramientas. Tiene una sola herramienta (<code>bash</code>), un límite de turnos, truncado de salidas y marca los errores. Es el tipo de agente minimalista que conviene tener como <strong>línea base</strong>: si tu agente sofisticado no supera a este, algo falla.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'mini_agente.py: un agente con bash en ~60 líneas', codigo: `import subprocess
import anthropic

client = anthropic.Anthropic()        # lee ANTHROPIC_API_KEY del entorno
MODEL = "<id-del-modelo>"            # id exacto del modelo que quieras evaluar
MAX_TURNOS = 30                       # condición de parada dura
MAX_SALIDA = 8_000                    # caracteres por resultado de herramienta

SYSTEM = (
    "Eres un agente de programación que trabaja en un repositorio. "
    "Resuelve la tarea y verifica con los tests antes de terminar."
)

TOOLS = [{
    "name": "bash",
    "description": "Ejecuta un comando bash en el directorio del repositorio y devuelve "
                   "stdout y stderr combinados. Úsalo para leer, editar y probar código.",
    "input_schema": {
        "type": "object",
        "properties": {"comando": {"type": "string", "description": "Comando a ejecutar"}},
        "required": ["comando"],
    },
}]


def ejecutar_bash(comando: str, timeout: int = 120) -> tuple[str, bool]:
    # ¡Solo dentro de un sandbox! Aquí no hay ninguna política de permisos.
    try:
        r = subprocess.run(comando, shell=True, capture_output=True, text=True, timeout=timeout)
        salida = (r.stdout + r.stderr) or f"(sin salida; código de salida {r.returncode})"
        return salida, r.returncode != 0
    except subprocess.TimeoutExpired:
        return f"ERROR: el comando superó {timeout} s y se interrumpió", True


def truncar(texto: str, limite: int = MAX_SALIDA) -> str:
    if len(texto) <= limite:
        return texto
    mitad = limite // 2
    omitidos = len(texto) - limite
    return texto[:mitad] + f"\\n[... {omitidos} caracteres omitidos ...]\\n" + texto[-mitad:]


def correr_agente(tarea: str) -> dict:
    messages = [{"role": "user", "content": tarea}]
    for turno in range(1, MAX_TURNOS + 1):
        resp = client.messages.create(
            model=MODEL, max_tokens=16000, system=SYSTEM, tools=TOOLS, messages=messages,
        )
        messages.append({"role": "assistant", "content": resp.content})
        if resp.stop_reason != "tool_use":          # end_turn, max_tokens, refusal...
            return {"motivo_parada": resp.stop_reason, "turnos": turno, "messages": messages}

        resultados = []
        for bloque in resp.content:
            if bloque.type == "tool_use":
                salida, es_error = ejecutar_bash(bloque.input["comando"])
                resultados.append({
                    "type": "tool_result",
                    "tool_use_id": bloque.id,        # debe coincidir con el tool_use
                    "content": truncar(salida),
                    "is_error": es_error,
                })
        # Todos los resultados del turno van juntos en UN mensaje de usuario
        messages.append({"role": "user", "content": resultados})

    return {"motivo_parada": "max_turnos", "turnos": MAX_TURNOS, "messages": messages}` },
        { tipo: 'p', html: `Fíjate en cómo cada línea corresponde a un componente de la sección anterior. <code>SYSTEM</code> es el prompt. <code>TOOLS</code> es la interfaz agente-ordenador, aquí en su versión más cruda (una shell). El <code>for</code> con <code>MAX_TURNOS</code> es el bucle con su condición de parada dura; la comprobación de <code>stop_reason</code> es la parada natural. <code>truncar</code> es la política de formato de salidas (cabeza + cola + aviso). <code>is_error</code> le comunica al modelo que algo falló. Y el diccionario que devuelve, con el motivo de parada y el historial completo, es la materia prima del <em>transcript</em> que luego calificará el eval harness.` },
        { tipo: 'p', html: `Un detalle técnico que importa: todos los bloques <code>tool_result</code> de un turno se devuelven en un único mensaje, cada uno con el <code>tool_use_id</code> del bloque que lo pidió. Así el harness soporta de forma natural que el modelo pida varias herramientas en paralelo (aquí se ejecutan una tras otra, pero podrías lanzarlas en hilos).` },
        { tipo: 'h', texto: 'Lo que le falta a este harness' },
        { tipo: 'p', html: `Este agente funciona, pero está muy lejos de un harness de producción. No tiene reintentos ante errores de la API (el SDK reintenta algunos por defecto, pero no hay una política propia), no gestiona el contexto (en tareas largas el historial crece sin límite), no tiene herramientas especializadas de edición ni búsqueda, no aplica permisos (ejecuta cualquier comando: <strong>nunca lo lances fuera de un contenedor</strong>), no registra tokens ni coste y no serializa el historial (los bloques del SDK son objetos; para guardarlos en JSON tendrías que convertirlos, por ejemplo con <code>model_dump()</code>).` },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Una línea base que existe de verdad', html: `<strong>mini-SWE-agent</strong>, de los autores de SWE-agent, sigue esta filosofía: un agente muy pequeño que solo usa bash, con historial lineal y cada comando ejecutado de forma independiente. Su valor no es ser el mejor, sino ser <strong>simple y fácil de reproducir</strong>, lo que lo convierte en una buena referencia para comparar modelos con un andamiaje mínimo y para comprobar cuánto aporta un harness más elaborado.` },
        { tipo: 'revelar', pregunta: `Si comparas dos modelos usando este mini-agente, ¿qué estás evaluando exactamente? ¿Y qué conclusión <strong>no</strong> puedes sacar?`,
          respuesta: `Estás evaluando cada modelo <strong>con este agent harness concreto</strong> (bash, este prompt, 30 turnos, truncado a 8.000 caracteres). Como el harness es el mismo para ambos, la diferencia se puede atribuir a los modelos <em>en estas condiciones</em>. Lo que no puedes concluir es que el modelo ganador también ganará dentro de Claude Code, Codex CLI u OpenHands: un modelo puede aprovechar mejor herramientas especializadas, contextos largos o subagentes, y el orden puede invertirse con otro andamiaje. Es una comparación válida pero condicionada al harness.` },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s4
    {
      id: 's4',
      titulo: 'Por qué el harness cambia la nota (y cómo diseñar experimentos)',
      bloques: [
        { tipo: 'p', html: `Si el agent harness decide qué ve el modelo, qué puede hacer y cuándo se detiene, es inevitable que influya en el resultado. Y no un poco: en benchmarks agénticos como SWE-bench o Terminal-Bench se observa de forma habitual que <strong>el mismo modelo obtiene resultados muy distintos según el andamiaje</strong> que lo rodea. Por eso el leaderboard de Terminal-Bench no lista modelos sueltos, sino <strong>pares agente + modelo</strong>; y por eso los resultados de SWE-bench publicados por distintos equipos dependen del scaffold, del número de intentos permitidos y de cuánto cómputo se gasta en tiempo de prueba (por ejemplo, generar varias soluciones y elegir una).` },
        { tipo: 'p', html: `No damos cifras porque caducan en semanas, pero el patrón es estable: cambios de harness que parecen menores (formato de edición, truncado de salidas, límite de turnos, prompt) mueven la nota lo bastante como para invertir el orden entre modelos cercanos.` },
        { tipo: 'h', texto: '¿Qué estás evaluando? Tres preguntas distintas' },
        { tipo: 'tabla', titulo: 'Fija lo que no quieres medir', columnas: ['Pregunta', 'Qué fijas', 'Qué varías', 'Ejemplo'], filas: [
          ['<strong>¿Qué modelo es mejor?</strong>', 'Agent harness (prompt, herramientas, límites), tareas, eval harness', 'El modelo', '¿Migramos nuestro agente interno del modelo A al B?'],
          ['<strong>¿Qué harness es mejor?</strong>', 'Modelo (versión exacta), tareas, eval harness', 'El agent harness o un componente suyo', '¿La nueva estrategia de compactación mejora las tareas largas?'],
          ['<strong>¿Qué producto es mejor?</strong>', 'Tareas y eval harness', 'El par completo (cada uno con su configuración recomendada)', '¿Compramos licencias de la herramienta X o de la Y?'],
        ] },
        { tipo: 'p', html: `Las tres preguntas son legítimas, pero tienen respuestas distintas. Un equipo de producto que elige herramienta quiere la tercera: le da igual si la ventaja viene del modelo o del andamiaje. Un equipo que entrena modelos quiere la primera y debe usar un harness neutro (o varios). Un equipo que construye su agente quiere la segunda y debe congelar la versión del modelo.` },
        { tipo: 'callout', variante: 'clave', titulo: 'Regla de oro', html: `<strong>Informa siempre del par</strong>: modelo (con versión exacta) + agent harness (con versión o commit) + configuración relevante (límite de turnos, intentos, herramientas, presupuesto). Un número sin ese contexto no es comparable con nada.` },
        { tipo: 'h', texto: 'Diseño de experimentos: un factor cada vez o factorial' },
        { tipo: 'p', html: `<strong>Un factor cada vez</strong> (<em>one-factor-at-a-time</em>): cambias una sola cosa respecto a una línea base y mantienes todo lo demás idéntico. Es simple y la atribución es clara. Su limitación: no detecta <strong>interacciones</strong>. Puede que la nueva herramienta de edición ayude mucho al modelo A y perjudique al B; si solo la pruebas con A, generalizarás mal.` },
        { tipo: 'p', html: `<strong>Diseño factorial</strong>: cruzas todos los niveles de varios factores. Con 2 modelos × 2 harnesses tienes 4 condiciones; ejecutas las mismas tareas con el mismo número de trials en cada una. Así estimas el efecto principal de cada factor y su interacción. El coste crece multiplicativamente (3 modelos × 3 harnesses × 2 prompts = 18 condiciones), así que reserva el factorial para los factores que de verdad sospechas que interactúan.` },
        { tipo: 'tabla', titulo: 'Ejemplo de diseño factorial 2 × 2 (tasa de éxito por condición, valores ilustrativos)', columnas: ['', 'Harness H1 (bash)', 'Harness H2 (herramientas especializadas)', 'Lectura'], filas: [
          ['<strong>Modelo A</strong>', 'a<sub>1</sub>', 'a<sub>2</sub>', 'a<sub>2</sub> − a<sub>1</sub> = efecto del harness con A'],
          ['<strong>Modelo B</strong>', 'b<sub>1</sub>', 'b<sub>2</sub>', 'b<sub>2</sub> − b<sub>1</sub> = efecto del harness con B'],
          ['<strong>Interacción</strong>', '', '', 'Si (a<sub>2</sub> − a<sub>1</sub>) y (b<sub>2</sub> − b<sub>1</sub>) difieren mucho, el efecto del harness depende del modelo'],
        ] },
        { tipo: 'lista', items: [
          '<strong>Mismas tareas en todas las condiciones</strong> (diseño pareado): la variabilidad entre tareas es enorme y el emparejamiento la elimina de la comparación.',
          '<strong>Varios trials por tarea</strong>: los agentes son estocásticos; con un solo trial confundes suerte con mejora (ver M08).',
          '<strong>Intercala las ejecuciones</strong> de las condiciones en el tiempo en lugar de lanzar todo A el lunes y todo B el martes: la API, la latencia o los límites de tasa cambian.',
          '<strong>Decide antes de mirar</strong> la métrica principal y el criterio de decisión, para no elegir a posteriori la métrica que favorece a tu idea.',
          '<strong>Registra el coste</strong>: una mejora de éxito que triplica tokens puede no compensar (frontera de Pareto, M08).',
        ] },
        { tipo: 'pregunta', id: 'm04-c3', pregunta: { tipo: 'unica',
          pregunta: 'Quieres saber si tu nuevo prompt de sistema mejora tu agente. Tienes presupuesto para 300 trials. ¿Qué diseño es más sólido?',
          opciones: [
            '30 tareas × 5 trials con el prompt viejo y las mismas 30 tareas × 5 trials con el nuevo, mismo modelo y versión, ejecuciones intercaladas',
            '150 trials con el prompt viejo el lunes y 150 con el nuevo el viernes, tras actualizar al modelo más reciente para aprovechar mejoras',
            '60 tareas × 5 trials solo con el prompt nuevo y comparar con la cifra que obtuviste hace dos meses con el viejo',
            '300 tareas distintas, 150 para cada prompt, 1 trial por tarea, para maximizar la cobertura',
          ],
          correcta: 0,
          explicacion: `La primera opción es un diseño pareado (mismas tareas), con varios trials para capturar la variabilidad, con el modelo fijo y con las condiciones intercaladas en el tiempo. La segunda cambia dos factores a la vez (prompt y modelo) y además separa las ejecuciones en el tiempo. La tercera compara con un número antiguo obtenido con otra versión del harness, del modelo y posiblemente de la infraestructura. La cuarta no es pareada: la diferencia entre conjuntos de tareas distintos puede ser mayor que el efecto del prompt, y un trial por tarea es muy ruidoso.`,
          seccion: 's4' } },
        { tipo: 'ejercicio', id: 'm04-ej1', titulo: 'Diseña el experimento: ¿mejora la nueva compactación?',
          enunciado: `Tu equipo ha implementado una nueva estrategia de gestión de contexto: en lugar de resumir todo el historial antiguo cuando se alcanza el 80 % de la ventana (estrategia A, la actual), la estrategia B borra los resultados de herramientas antiguos y mantiene un fichero de notas que el agente actualiza. Quieres decidir si B mejora el agente.<br><br>Diseña el experimento: qué fijas, qué tareas usas, cuántos trials, qué métricas registras, cómo compruebas que el experimento mide lo que crees y con qué criterio decides. Escribe tu diseño antes de mirar las pistas.`,
          pistas: [
            '¿Todas las tareas de tu suite llegan a activar la compactación? Si una tarea termina en 20.000 tokens, A y B se comportan igual en ella.',
            'Piensa en las variables de confusión: versión del modelo, prompt, herramientas, límites, imagen del contenedor, momento de ejecución.',
            'Además del éxito, ¿qué fallos específicos puede causar una mala compactación? ¿Cómo los detectarías en los transcripts?',
            '¿Cómo sabes que la compactación se activó realmente en cada trial? Necesitas instrumentarla.',
          ],
          solucion: `<strong>Un diseño razonable:</strong><ol><li><strong>Hipótesis y criterio previo</strong>: «B aumenta la tasa de éxito en tareas largas sin empeorar las cortas ni aumentar el coste más de un X %». Escríbelo antes de ejecutar.</li><li><strong>Fija todo lo demás</strong>: misma versión exacta del modelo, mismo system prompt, mismas herramientas, mismo límite de turnos y de presupuesto, misma imagen de contenedor (por digest), mismos recursos. La <em>única</em> diferencia es la estrategia de contexto.</li><li><strong>Tareas</strong>: un bloque de tareas <em>largas</em> que con seguridad superan el umbral (verificado en una ejecución piloto) y un bloque de tareas cortas como control de regresión. Analiza ambos bloques por separado.</li><li><strong>Trials</strong>: varios por tarea (por ejemplo, 5) en ambas condiciones, con las mismas tareas (diseño pareado). Calcula el tamaño de muestra necesario para el efecto que te importa (M08) en lugar de elegir un número al azar.</li><li><strong>Ejecución</strong>: intercala A y B en el tiempo, entornos limpios por trial, mismos límites de concurrencia.</li><li><strong>Instrumentación</strong>: registra cuántas veces se compacta o se borra contexto en cada trial, tokens antes y después, y el motivo de parada. Excluye del análisis principal (o analiza aparte) los trials en los que no hubo compactación.</li><li><strong>Métricas</strong>: tasa de éxito (y pass^k si importa la consistencia), coste en tokens y dinero, número de turnos, latencia, tasa de errores de infraestructura por condición, y una métrica específica: fallos atribuibles a «olvido» (el agente repite trabajo ya hecho, reintroduce un bug corregido, pregunta algo que ya sabía), detectados por revisión de transcripts a ciegas (sin saber la condición) o con un juez LLM calibrado.</li><li><strong>Análisis</strong>: comparación pareada por tarea con intervalos de confianza (bootstrap por tareas o test para proporciones pareadas). Mira también la distribución, no solo la media.</li><li><strong>Generalización</strong>: si planeas usar varios modelos, repite con un segundo modelo (diseño 2 × 2) para detectar interacción.</li></ol><strong>Errores típicos</strong> que evita este diseño: usar solo tareas cortas (efecto nulo garantizado), cambiar el modelo a la vez, un trial por tarea, decidir la métrica después de ver los datos y no comprobar que la compactación se activó.` },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s5
    {
      id: 's5',
      titulo: 'Catálogo de agent harnesses y frameworks de agentes',
      bloques: [
        { tipo: 'p', html: `Existen decenas de agent harnesses. Algunos son <strong>productos terminados</strong> (un agente de programación listo para usar), otros son <strong>frameworks o SDK</strong> para construir tus propios agentes. Para evaluar te interesa conocerlos por tres motivos: (1) puede que tengas que evaluar uno de ellos como producto; (2) puede que los uses como línea base o como «harness neutro» para comparar modelos; (3) aparecen constantemente en leaderboards como la mitad del par agente + modelo.` },
        { tipo: 'callout', variante: 'aviso', titulo: 'El ecosistema cambia muy rápido', html: `Las descripciones siguientes son cualitativas y se centran en rasgos estables. Nombres, funciones y APIs cambian con frecuencia (varios de estos proyectos se han renombrado o reestructurado). Antes de basar una decisión en una característica concreta, compruébala en la documentación oficial actual.` },
        { tipo: 'tabla', titulo: 'Agent harnesses y frameworks (selección)', columnas: ['Nombre', 'Tipo', 'Rasgos característicos', 'Interés para evaluar'], filas: [
          ['<strong>Claude Code</strong> (Anthropic)', 'Producto: agente de programación en terminal/IDE', 'Herramientas de lectura, edición, búsqueda y bash; permisos configurables; ficheros de memoria del proyecto; subagentes; hooks', 'Evaluarlo como producto; harness de referencia para modelos Claude'],
          ['<strong>Claude Agent SDK</strong> (Anthropic)', 'SDK', 'Expone el harness de Claude Code como biblioteca para construir agentes propios con sus herramientas, gestión de contexto y permisos', 'Construir agentes evaluables reutilizando un harness maduro'],
          ['<strong>OpenAI Agents SDK</strong>', 'SDK', 'Agentes con herramientas, traspasos (<em>handoffs</em>) entre agentes, guardarraíles y trazas integradas', 'Sistemas multiagente; las trazas facilitan calificar trayectorias'],
          ['<strong>Codex CLI</strong> (OpenAI)', 'Producto: agente de programación en terminal, código abierto', 'Ejecución de comandos con sandbox y modos de aprobación', 'Evaluarlo como producto; aparece en leaderboards de terminal'],
          ['<strong>OpenHands</strong> (antes OpenDevin)', 'Plataforma abierta de agentes de software', 'Agentes que actúan escribiendo código y comandos en un entorno aislado; incluye utilidades para correr benchmarks', 'Harness abierto muy usado en investigación sobre SWE-bench'],
          ['<strong>SWE-agent</strong>', 'Agente de investigación', 'Origen del concepto ACI: visor con ventanas, búsqueda, edición con linter, feedback conciso', 'Referencia clásica; estudiar cómo influye el diseño de herramientas'],
          ['<strong>mini-SWE-agent</strong>', 'Agente minimalista', 'Muy pocas líneas, solo bash, historial lineal', 'Línea base simple y reproducible para comparar modelos'],
          ['<strong>Aider</strong>', 'Producto: programación en pareja en terminal', 'Mapa del repositorio, varios formatos de edición, commits automáticos en git', 'Ilustra cómo el formato de edición óptimo depende del modelo'],
          ['<strong>LangGraph</strong> (LangChain)', 'Framework', 'Agentes como grafos de estados; persistencia, puntos de control, intervención humana', 'Workflows y agentes con estado; fácil instrumentar cada nodo'],
          ['<strong>smolagents</strong> (Hugging Face)', 'Framework ligero', 'Énfasis en <em>code agents</em>: el modelo escribe acciones en Python en lugar de JSON', 'Comparar acción como código frente a llamadas a herramientas'],
          ['<strong>CrewAI</strong>', 'Framework multiagente', 'Equipos de agentes con roles y tareas', 'Evaluar orquestación por roles (M03)'],
          ['<strong>AutoGen / AG2</strong>', 'Framework multiagente', 'Conversaciones entre agentes; AutoGen nació en Microsoft y AG2 es una continuación comunitaria', 'Patrones conversacionales multiagente'],
          ['<strong>Google ADK</strong> (Agent Development Kit)', 'Framework', 'Construcción de agentes y sistemas multiagente con herramientas de evaluación integradas', 'Agentes en el ecosistema de Google; incluye utilidades de eval'],
          ['<strong>Terminus</strong>', 'Agente de referencia de Terminal-Bench', 'Agente sencillo que interactúa con una sesión de terminal', 'Harness neutro para comparar modelos en tareas de terminal'],
        ] },
        { tipo: 'h', texto: 'Cómo leer este catálogo con ojos de evaluador' },
        { tipo: 'p', html: `Fíjate en que los productos (Claude Code, Codex CLI, Aider) llevan un harness <em>optimizado conjuntamente</em> con ciertos modelos: sus prompts, herramientas y formatos se han afinado probando con esos modelos. Evaluar otro modelo dentro de ellos puede ser injusto para ese modelo. Los agentes minimalistas (mini-SWE-agent, Terminus) intentan ser más neutrales a cambio de no exprimir al máximo a ningún modelo. Ninguno es «el» harness correcto: elige el que responde a tu pregunta (modelo, harness o producto).` },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Formatos de edición y familias de modelos', html: `Aider documenta que distintos modelos funcionan mejor con distintos formatos de edición (por ejemplo, reescribir el fichero entero frente a bloques de búsqueda y reemplazo o diffs) y elige por defecto un formato según el modelo. Es un ejemplo perfecto de que «la misma herramienta» no es neutral: si fijas un formato para todos los modelos, puedes estar favoreciendo a uno.` },
        { tipo: 'tarjetas', items: [
          { frente: '¿Qué aporta un agente minimalista como línea base?', reverso: 'Una referencia simple y reproducible: si tu harness sofisticado no lo supera, la complejidad no está aportando; y permite comparar modelos con poco andamiaje que los favorezca.' },
          { frente: '¿Por qué los leaderboards agénticos listan pares agente + modelo?', reverso: 'Porque el agent harness cambia la nota tanto que el modelo solo no está bien definido como objeto evaluado.' },
          { frente: '¿Qué es un code agent (smolagents)?', reverso: 'Un agente cuyas acciones son fragmentos de código (Python) que se ejecutan, en lugar de llamadas a herramientas en JSON; permite componer varias operaciones en una sola acción.' },
          { frente: '¿Por qué evaluar un modelo dentro de un producto afinado para otro modelo puede ser injusto?', reverso: 'Prompts, herramientas y formatos se han optimizado con el modelo original; el modelo nuevo compite con desventaja de andamiaje.' },
        ] },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s6
    {
      id: 's6',
      titulo: 'Evaluation harnesses: qué hacen y cuál elegir',
      bloques: [
        { tipo: 'p', html: `Cambiamos de lado: ahora el objeto de estudio es la pista de pruebas. Un eval harness para agentes tiene responsabilidades que un harness clásico de benchmarks de preguntas y respuestas no necesita: crear entornos con estado, ejecutar acciones con efectos reales, aguantar trials de muchos minutos y calificar estados finales y trayectorias, no solo textos.` },
        { tipo: 'flujo', titulo: 'Ciclo de vida de un trial dentro del eval harness', pasos: [
          { titulo: 'Cargar tarea', texto: 'Enunciado, entorno, graders, límites' },
          { titulo: 'Crear entorno limpio', texto: 'Contenedor/VM desde imagen fijada' },
          { titulo: 'Lanzar el agente', texto: 'Con su agent harness, bajo límites de tiempo, turnos y coste' },
          { titulo: 'Recoger resultados', texto: 'Transcript completo + estado final (outcome)' },
          { titulo: 'Calificar', texto: 'Graders de código, de modelo o humanos (M06)' },
          { titulo: 'Registrar', texto: 'Notas, métricas, metadatos, errores' },
          { titulo: 'Destruir el entorno', texto: 'Nada sobrevive al siguiente trial' },
        ], bucle: 'Por cada tarea × cada trial' },
        { tipo: 'h', texto: 'Inspect AI: el ejemplo de referencia' },
        { tipo: 'p', html: `<strong>Inspect AI</strong>, desarrollado por el UK AI Security Institute, es un framework de código abierto en Python para evaluar modelos y agentes. Su modelo mental es muy limpio: una <strong>Task</strong> combina un <strong>dataset</strong> (muestras con entrada y objetivo), un <strong>solver</strong> (lo que se hace con cada muestra: desde una sola llamada al modelo hasta un agente completo con herramientas) y un <strong>scorer</strong> (cómo se califica). Soporta <em>sandboxes</em> (por ejemplo, Docker) donde se ejecutan las herramientas del agente, permite repetir cada muestra varias veces (<em>epochs</em>) y trae un visor de logs para inspeccionar cada transcript.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'mi_tarea.py: una tarea agéntica mínima en Inspect AI', codigo: `from inspect_ai import Task, task
from inspect_ai.dataset import Sample
from inspect_ai.scorer import includes
from inspect_ai.solver import basic_agent, system_message
from inspect_ai.tool import bash, python


@task
def mi_tarea():
    return Task(
        dataset=[
            Sample(
                input="En /data/ventas.csv hay ventas por región. "
                      "¿Qué región tiene el mayor total? Responde solo con su nombre.",
                target="Norte",
            ),
        ],
        solver=basic_agent(
            init=system_message("Eres un analista de datos. Usa las herramientas para "
                                "inspeccionar los ficheros antes de responder."),
            tools=[bash(timeout=180), python(timeout=180)],
            max_attempts=2,      # si la respuesta se califica como incorrecta, puede reintentar
            message_limit=30,    # condición de parada: máximo de mensajes
        ),
        scorer=includes(),       # ¿la respuesta contiene el target?
        sandbox="docker",        # las herramientas se ejecutan en un contenedor
    )` },
        { tipo: 'codigo', lenguaje: 'bash', titulo: 'Ejecutar y revisar', codigo: `# Ejecuta la tarea con un modelo concreto (el par modelo + solver queda en el log)
inspect eval mi_tarea.py --model anthropic/<id-del-modelo>

# Varios trials por muestra para medir variabilidad
inspect eval mi_tarea.py --model anthropic/<id-del-modelo> --epochs 5

# Abre el visor web de logs: transcripts, llamadas a herramientas, puntuaciones
inspect view` },
        { tipo: 'p', html: `Observa qué parte es cada cosa. <code>basic_agent</code> con sus herramientas, su prompt y su <code>message_limit</code> es un <strong>agent harness</strong> sencillo que Inspect te ofrece ya hecho. <code>sandbox="docker"</code>, la orquestación de muestras y epochs, el scorer y los logs son el <strong>eval harness</strong>. El fichero de la tarea (los datos de <code>/data/ventas.csv</code> que habría que montar en el contenedor) es el <strong>entorno</strong>. Ojo con <code>max_attempts=2</code>: permite al agente reintentar tras una respuesta calificada como incorrecta, lo cual es cómputo extra en tiempo de prueba que debes declarar al informar (sección 9). Las versiones más recientes de Inspect ofrecen además un agente <code>react()</code> en <code>inspect_ai.agent</code>, y permiten conectar agentes externos; consulta la documentación actual. El laboratorio del módulo 11 trabaja con Inspect en detalle.` },
        { tipo: 'h', texto: 'Catálogo de eval harnesses y plataformas' },
        { tipo: 'tabla', titulo: 'Frameworks y plataformas de evaluación (selección)', columnas: ['Nombre', 'Foco', 'Rasgos característicos', 'Cuándo encaja'], filas: [
          ['<strong>Inspect AI</strong> (UK AI Security Institute)', 'Evals de modelos y agentes', 'Task = dataset + solver + scorer; sandboxes (Docker y otros); agentes con herramientas; epochs; visor de logs; colección comunitaria de evals implementadas', 'Evals agénticas reproducibles en Python, investigación y seguridad'],
          ['<strong>Harbor</strong> (Laude Institute)', 'Evals de agentes en contenedores a escala', 'Publicado junto con Terminal-Bench 2.0; ejecuta agentes sobre tareas en contenedores, en local o en proveedores en la nube, y permite enchufar distintos agentes', 'Benchmarks de terminal y tareas en contenedores con mucho paralelismo'],
          ['<strong>Harness de SWE-bench</strong>', 'Calificación de parches de código', 'Imágenes Docker por instancia; aplica el parche del agente y ejecuta los tests FAIL_TO_PASS (deben pasar a verde) y PASS_TO_PASS (no deben romperse)', 'Evaluar agentes que corrigen issues reales en repositorios Python'],
          ['<strong>BrowserGym</strong> (ServiceNow)', 'Entornos web', 'Interfaz tipo gym común para varios benchmarks de navegación web', 'Agentes de navegador con observaciones y acciones estandarizadas'],
          ['<strong>τ-bench</strong> (Sierra)', 'Agentes conversacionales con herramientas', 'Usuario simulado por un LLM, herramientas sobre una base de datos; se califica el estado final de la BD frente al esperado', 'Atención al cliente, políticas de negocio, consistencia (pass^k)'],
          ['<strong>lm-evaluation-harness</strong> (EleutherAI)', 'Benchmarks de modelos de lenguaje', 'Gran colección de tareas mayoritariamente no agénticas (opción múltiple, generación)', 'Contraste: medir capacidades del modelo base, no agentes'],
          ['<strong>HELM</strong> (Stanford CRFM)', 'Evaluación holística de modelos', 'Muchos escenarios y métricas más allá de la exactitud', 'Contraste: comparativas amplias de modelos'],
          ['<strong>OpenAI Evals</strong>', 'Framework y registro de evals', 'Evals definidas por datos y plantillas de calificación', 'Evals de prompts y modelos con plantillas'],
          ['<strong>promptfoo</strong>', 'Pruebas de prompts y apps LLM', 'Configuración declarativa (YAML), aserciones, comparación de proveedores, red teaming, CLI pensada para CI', 'Regresiones en CI de prompts y aplicaciones'],
          ['<strong>DeepEval</strong>', 'Tests de apps LLM', 'Estilo pytest, métricas listas (muchas con juez LLM)', 'Equipos que quieren evals como tests unitarios'],
          ['<strong>Ragas</strong>', 'Sistemas RAG', 'Métricas de recuperación y fidelidad de respuestas al contexto', 'Evaluar el componente RAG de un agente'],
          ['<strong>LangSmith, Langfuse, Braintrust, Arize Phoenix, W&amp;B Weave</strong>', 'Observabilidad + evaluación', 'Trazas de producción, datasets, experimentos, jueces LLM, anotación humana; Langfuse y Phoenix tienen versiones de código abierto', 'Conectar trazas reales con evals offline y online'],
        ] },
        { tipo: 'p', html: `Fíjate en la diferencia de categoría. Inspect, Harbor, el harness de SWE-bench, BrowserGym y τ-bench saben <strong>crear y gestionar entornos</strong> donde un agente actúa. lm-evaluation-harness y HELM evalúan sobre todo modelos con entradas y salidas de texto. promptfoo, DeepEval y Ragas son excelentes para probar prompts y componentes, pero el entorno agéntico (contenedor, estado) normalmente lo pones tú. Y las plataformas de observabilidad brillan en trazas, datasets y anotación, sobre todo para cerrar el círculo con producción.` },
        { tipo: 'h', texto: 'Cómo elegir: criterios explícitos' },
        { tipo: 'tabla', titulo: 'Criterios para elegir un eval harness', columnas: ['Criterio', 'Qué preguntar', 'Por qué importa'], filas: [
          ['<strong>Sandboxing</strong>', '¿Crea un entorno aislado por trial (contenedor, VM)? ¿Con qué límites de recursos?', 'Sin aislamiento hay contaminación entre trials y riesgo para tu infraestructura'],
          ['<strong>Soporte de agentes</strong>', '¿Puedo usar mi propio agent harness o solo el suyo? ¿Herramientas personalizadas?', 'Si evalúas tu producto, necesitas enchufar tu agente tal cual'],
          ['<strong>Multiturno y usuarios simulados</strong>', '¿Soporta conversaciones largas y un usuario simulado?', 'Imprescindible para agentes conversacionales (tipo τ-bench)'],
          ['<strong>Flexibilidad de calificación</strong>', '¿Graders de código, de modelo y humanos? ¿Acceso al estado final y al transcript?', 'Las tareas agénticas suelen necesitar calificar el estado, no el texto (M06)'],
          ['<strong>Visor de logs</strong>', '¿Puedo leer transcripts cómodamente y filtrar fallos?', 'Leer transcripts es la mitad del trabajo de evaluación'],
          ['<strong>Escala</strong>', '¿Paraleliza? ¿Soporta clústeres o la nube? ¿Reanuda ejecuciones interrumpidas?', 'Suites de cientos de tareas × varios trials no caben en un portátil'],
          ['<strong>Integración en CI</strong>', '¿Se lanza desde la línea de comandos con códigos de salida y umbrales?', 'Las evals de regresión deben correr en cada cambio (M09)'],
          ['<strong>Reproducibilidad</strong>', '¿Registra versiones, configuración y semillas? ¿Exporta los logs?', 'Sin ello no puedes comparar ejecuciones en el tiempo'],
        ] },
        { tipo: 'clasificar', id: 'm04-cl1',
          instrucciones: 'Clasifica cada elemento según dónde vive: en el <strong>agent harness</strong> (cómo actúa el agente), en el <strong>eval harness</strong> (cómo se mide) o en el <strong>entorno</strong> (el mundo sobre el que actúa).',
          categorias: ['Agent harness', 'Eval harness', 'Entorno'],
          items: [
            { texto: 'Un límite de 40 turnos tras el cual el bucle del agente se detiene', categoria: 'Agent harness', explicacion: 'Es una condición de parada del bucle de control. Aunque el eval harness pueda fijar su valor como parámetro, el mecanismo vive en el bucle del agente y cambia su comportamiento (y su nota).' },
            { texto: 'Truncar a 10.000 caracteres la salida de cada herramienta', categoria: 'Agent harness', explicacion: 'Decide qué ve el modelo: es política de formato de salidas, parte del agent harness.' },
            { texto: 'Lanzar 5 trials por tarea con un máximo de 20 en paralelo', categoria: 'Eval harness', explicacion: 'Orquestación de la medida: cuántas repeticiones y con qué concurrencia. No cambia lo que el agente sabe o puede hacer (salvo que la concurrencia provoque límites de tasa, que debes vigilar).' },
            { texto: 'La imagen Docker con el repositorio en el commit base y las dependencias instaladas', categoria: 'Entorno', explicacion: 'Es el escenario sobre el que actúa el agente. El eval harness la instancia, pero su contenido es el entorno de la tarea.' },
            { texto: 'Resumir el historial cuando se alcanza el 80 % de la ventana de contexto', categoria: 'Agent harness', explicacion: 'Gestión de contexto: una de las palancas del agent harness que más afecta a tareas largas.' },
            { texto: 'Ejecutar los tests FAIL_TO_PASS después del trial y guardar el resultado', categoria: 'Eval harness', explicacion: 'Es calificación: ocurre después de que el agente termina y no forma parte de lo que el agente hace.' },
            { texto: 'La base de datos de reservas de vuelos que el agente consulta y modifica', categoria: 'Entorno', explicacion: 'Es el estado del mundo de la tarea; el grader comparará su estado final con el esperado.' },
            { texto: 'Volver a lanzar desde cero un trial cuyo contenedor no llegó a arrancar', categoria: 'Eval harness', explicacion: 'Gestión de errores de infraestructura: responsabilidad del eval harness, que debe reintentar solo este tipo de fallos.' },
            { texto: 'Pedir confirmación antes de ejecutar <code>git push</code>', categoria: 'Agent harness', explicacion: 'Política de permisos / human-in-the-loop del agente. En una eval automática tendrás que decidir cómo se resuelve esa confirmación, y documentarlo.' },
            { texto: 'Un usuario simulado por un LLM que responde a las preguntas del agente', categoria: 'Entorno', explicacion: 'En benchmarks como τ-bench el usuario simulado forma parte del mundo de la tarea: el agente interactúa con él como con cualquier otra pieza del entorno. Su configuración debe fijarse igual que una imagen de contenedor.' },
          ] },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s7
    {
      id: 's7',
      titulo: 'Diseñar un eval harness robusto',
      bloques: [
        { tipo: 'p', html: `Un eval harness es un instrumento de medida. Como un termómetro, su trabajo es no alterar lo que mide y dar la misma lectura en las mismas condiciones. En evals agénticas hay muchas formas de fallar en eso, y casi todas son silenciosas: no dan error, simplemente producen números equivocados. Vamos con los principios.` },
        { tipo: 'h', texto: '1. Aislamiento: entorno limpio por trial' },
        { tipo: 'p', html: `<strong>Intuición:</strong> cada trial debe empezar en el mismo mundo, como si fuera el primero. <strong>Definición:</strong> ningún estado (ficheros, procesos, cachés, historial de git, bases de datos, variables de entorno, memoria del agente) debe sobrevivir de un trial a otro ni filtrarse desde fuera. <strong>Cómo:</strong> crear un contenedor o VM nuevo desde una imagen fijada para cada trial y destruirlo al final; nunca reutilizar contenedores «calientes» de un <em>pool</em> sin restaurarlos a un estado verificado.` },
        { tipo: 'callout', variante: 'error', titulo: 'Una clase real de bugs: el agente ve lo que no debería', html: `Se han documentado casos en los que agentes evaluados en benchmarks de código encontraban la respuesta por vías no previstas. Por ejemplo, se reportó públicamente que en algunas configuraciones de SWE-bench el repositorio conservaba historial de git posterior al commit base, y que agentes ejecutaban comandos como <code>git log</code> y encontraban el commit con la solución real. Otros fallos típicos: ficheros residuales de un trial anterior (un parche a medio aplicar, un <code>.bak</code>), cachés de compilación o de tests que hacen que algo «pase» sin haberse arreglado, o directorios con las soluciones o los tests ocultos montados por error. El agente no hace trampa a propósito: explora, y lo que encuentra cuenta. La solución es del harness: imágenes limpias, historial recortado y nada en el entorno que no deba estar ahí (M10 trata el reward hacking en profundidad).` },
        { tipo: 'h', texto: '2. Controles de determinismo' },
        { tipo: 'p', html: `Los agentes son estocásticos y nunca tendrás reproducibilidad bit a bit. Pero puedes eliminar toda la variabilidad que <strong>no</strong> viene del modelo: fija las imágenes por <em>digest</em> (no por etiqueta <code>latest</code>), fija versiones de herramientas y dependencias, congela los datos del entorno, usa semillas donde se pueda (generadores de datos, usuarios simulados) y registra los parámetros de muestreo que uses. Si el entorno descarga algo de internet durante el trial, ese algo puede cambiar entre ejecuciones: mejor tenerlo dentro de la imagen.` },
        { tipo: 'h', texto: '3. Límites de recursos (y por qué hay que declararlos)' },
        { tipo: 'p', html: `CPU, memoria, disco, tiempo de reloj, número de turnos, tokens y dinero son límites que <strong>cambian la nota</strong>. Una tarea que compila un proyecto grande puede fallar por falta de memoria con 2 GB y pasar con 8 GB; un timeout de 10 minutos penaliza a un agente lento pero cuidadoso; un límite de coste corta a los agentes que exploran mucho. Ninguno de estos límites es incorrecto, pero todos forman parte de las condiciones de la prueba: <strong>fíjalos por tarea, mantenlos iguales entre condiciones e infórmalos</strong> junto a los resultados.` },
        { tipo: 'h', texto: '4. Concurrencia y límites de tasa' },
        { tipo: 'p', html: `Para que una suite grande termine en horas y no en días, lanzarás muchos trials en paralelo. Eso crea dos problemas: <strong>contención de recursos</strong> (veinte contenedores compilando a la vez en una máquina que solo tiene recursos para cinco, con timeouts que antes no ocurrían) y <strong>límites de tasa de la API</strong> (errores 429 o de sobrecarga). Ajusta la concurrencia a los recursos reales, reserva recursos por contenedor y haz que los reintentos ante límites de tasa ocurran dentro del agent harness con espera exponencial, sin consumir el presupuesto de turnos del agente.` },
        { tipo: 'h', texto: '5. Errores de infraestructura frente a fallos del agente' },
        { tipo: 'p', html: `Este es probablemente el principio más importante y el más descuidado. <strong>Un error de infraestructura</strong> es un fallo que no tiene nada que ver con la capacidad del agente: el contenedor no arranca, el nodo se queda sin disco, el proceso muere por falta de memoria del <em>host</em>, la API está caída durante minutos, el sandbox pierde la conexión. <strong>Un fallo del agente</strong> es que el agente, con un entorno sano, no resolvió la tarea.` },
        { tipo: 'comparar', columnas: [
          { titulo: 'Error de infraestructura', tono: 'fail', items: [
            'Detectarlo con señales explícitas: códigos de salida (137 = proceso matado), errores del runtime de contenedores, excepciones del sandbox',
            '<strong>Reintentar</strong> el trial completo en un entorno nuevo (con un máximo de reintentos)',
            'Excluirlo del denominador o marcarlo aparte; nunca contarlo como fallo del agente',
            '<strong>Informar la tasa</strong> de errores de infraestructura por condición',
          ] },
          { titulo: 'Fallo del agente', tono: 'ink', items: [
            'El entorno estaba sano y el agente no resolvió la tarea (o se pasó de límites declarados)',
            '<strong>Nunca reintentar</strong>: reintentar hasta que pase es inflar la nota con cómputo oculto',
            'Cuenta en el denominador como cualquier trial',
            'Analizarlo leyendo el transcript para entender por qué falló',
          ] },
        ] },
        { tipo: 'callout', variante: 'aviso', titulo: 'Por qué la tasa de errores de infraestructura debe informarse', html: `Si la condición A tiene un 2 % de errores de infraestructura y la B un 15 %, algo en B (más memoria, más tiempo, más llamadas) está estresando la infraestructura. Excluir esos trials sin decirlo puede sesgar la comparación: los trials que mueren suelen ser los de tareas más pesadas, que también son las más difíciles. Informa la tasa por condición y, si es alta, arregla la infraestructura antes de sacar conclusiones.` },
        { tipo: 'h', texto: '6. Registro completo, caché y reanudación' },
        { tipo: 'p', html: `Guarda para cada trial el <strong>transcript completo</strong> (no un resumen), el estado final relevante (diff, estado de la BD), las notas de cada grader con su justificación, el motivo de parada, tokens, coste, latencia y marcas de tiempo, y los metadatos de la ejecución: versión exacta del modelo, commit del agent harness, commit del eval harness, digest de la imagen, hash de la configuración. Con eso puedes: recalificar sin reejecutar (si cambias un grader), <strong>reanudar</strong> una ejecución interrumpida saltándote los trials ya completados, y auditar cualquier número meses después.` },
        { tipo: 'p', html: `La <strong>caché</strong> es útil para desarrollar el propio harness (no gastar dinero en llamadas repetidas mientras depuras un grader), pero peligrosa al medir: una respuesta cacheada no es una muestra nueva del modelo. Desactívala en las ejecuciones que vayan a informarse o asegúrate de que la clave incluye el número de trial.` },
        { tipo: 'h', texto: '7. El manifiesto de reproducibilidad' },
        { tipo: 'p', html: `Reúne toda la configuración de una ejecución en un fichero versionado que se guarda junto a los resultados. Si alguien te pregunta «¿cómo obtuviste este número?», la respuesta es el manifiesto.` },
        { tipo: 'codigo', lenguaje: 'yaml', titulo: 'run_manifest.yaml', codigo: `run_id: 2026-10-09-compactacion-B-01
creado: 2026-10-09T10:42:00Z
proposito: "Comparar estrategia de contexto B frente a A en tareas largas"

sistema_evaluado:
  modelo: <id-exacto-del-modelo>     # id exacto, nunca un alias que cambie
  parametros_modelo: {max_tokens: 16000, effort: high}
  agent_harness:
    nombre: agente-interno
    commit: 3f9c2ab
    prompt_sha256: 9b1e...d4
    herramientas: [bash, editar_fichero, buscar]
    contexto: {estrategia: B, umbral: 0.8}
    limites: {max_turnos: 60, max_tokens_totales: 2000000, max_coste_usd: 5.0}

eval_harness:
  nombre: harness-casero
  commit: a71e0d4
  suite: tareas-largas-v3            # versión congelada de la suite
  tareas: 40
  trials_por_tarea: 5
  concurrencia: 16
  orden: intercalado                 # A y B mezclados en el tiempo

entorno:
  imagen: registry.local/repo-tareas@sha256:5c1d...e2
  recursos: {cpus: 4, memoria: 8g, disco: 20g}
  red: deshabilitada
  timeout_trial_s: 1800

reintentos:
  errores_infra: 2                   # solo infraestructura; nunca fallos del agente
  errores_agente: 0

graders:
  - {tipo: codigo, nombre: tests_ocultos, version: 1.2}
  - {tipo: modelo, nombre: juez_calidad, modelo: <id-del-modelo-juez>, rubrica_sha256: 77ac...01}

salida:
  resultados: runs/2026-10-09-compactacion-B-01/resultados.jsonl
  transcripts: runs/2026-10-09-compactacion-B-01/transcripts/` },
        { tipo: 'transcript', id: 'm04-tr1', titulo: '¿Fallo del agente o de la infraestructura?',
          contexto: `Trial 3 de 5 de la tarea <code>fix-parser-017</code>: el agente debe corregir un bug en un parser para que pasen los tests. El manifiesto de la ejecución especifica <code>memoria: 4g</code> y entornos limpios por trial. El grader marca el trial como FAIL. Tu compañero propone apuntarlo como fallo del agente.`,
          pasos: [
            { rol: 'sistema', html: `[harness] trial 3/5 · tarea fix-parser-017 · contenedor <code>pool-07</code> reutilizado del pool (warm start) · mem_limit=512m`, nota: 'Dos señales de infraestructura en una línea: el contenedor se reutiliza (no es un entorno limpio) y el límite real de memoria (512 MB) no coincide con el del manifiesto (4 GB).' },
            { rol: 'usuario', html: `Los tests de <code>tests/test_parser.py</code> fallan con expresiones anidadas. Corrige el bug en <code>parser.py</code> sin modificar los tests.`, nota: 'Enunciado normal de la tarea.' },
            { rol: 'agente', html: `Voy a ver el estado del repositorio. <code>git status &amp;&amp; ls</code>`, nota: 'Exploración inicial razonable.' },
            { rol: 'resultado', html: `modified: parser.py<br>Untracked: parser.py.bak, .pytest_cache/, notas_agente.md`, nota: 'Estado residual: el agente aún no ha tocado nada y ya hay cambios en parser.py, una copia .bak y notas de otro agente. Son restos de un trial anterior en el contenedor reutilizado.' },
            { rol: 'pensamiento', html: `Parece que alguien empezó a arreglarlo. Leeré <code>notas_agente.md</code> y el diff para aprovechar el trabajo previo.`, nota: 'El razonamiento del agente es sensato dado lo que ve; el problema es que no debería verlo. Este trial ya no mide la tarea original.' },
            { rol: 'herramienta', html: `bash: <code>python -m pytest tests/test_parser.py -q</code>`, nota: 'Acción correcta: verificar con los tests.' },
            { rol: 'resultado', html: `Killed<br>(exit code 137)`, nota: 'El código 137 indica que el proceso fue terminado (SIGKILL), típico de quedarse sin memoria. Con 512 MB en lugar de 4 GB, la suite de tests no cabe: es un problema de configuración del entorno, no del código del agente.' },
            { rol: 'agente', html: `Los tests se han matado; probaré a ejecutar solo un test con <code>-x -k nested</code>.`, nota: 'Reacción razonable del agente ante un fallo que no puede controlar.' },
            { rol: 'resultado', html: `Error response from daemon: container pool-07 is not running`, nota: 'El contenedor ha muerto. A partir de aquí el agente no puede hacer nada: es un fallo de la infraestructura del eval harness.' },
            { rol: 'grader', html: `tests_ocultos: 0/3 FAIL_TO_PASS ejecutados · resultado = FAIL`, nota: 'El grader no distingue «los tests fallaron» de «los tests no se pudieron ejecutar». Es un defecto del harness: debería marcar el trial como error de infraestructura.' },
          ],
          pregunta: 'Pulsa los pasos que muestran que este «fallo» se debe a la infraestructura y no al agente.',
          culpables: [0, 3, 6, 8],
          explicacion: `Las pruebas de que es un problema de infraestructura son: (0) el contenedor se reutiliza y su límite de memoria no coincide con el manifiesto; (3) hay estado residual de un trial anterior; (6) el proceso de tests muere con código 137 por falta de memoria; (8) el contenedor deja de existir. El agente actuó de forma razonable en todo momento. Lo correcto es: marcar el trial como <code>error_infra</code>, reintentarlo en un contenedor nuevo con los recursos del manifiesto, excluirlo del denominador e informar la tasa de errores de infraestructura. Y además arreglar el harness: prohibir la reutilización de contenedores sin restaurarlos, verificar los límites reales al arrancar y hacer que el grader distinga «tests no ejecutados» de «tests fallidos». Cuidado también con el paso 9: si el harness no se corrige, este tipo de trial seguirá contándose como fallo del agente sin que nadie lo note.` },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s8
    {
      id: 's8',
      titulo: 'Esqueleto de un eval harness casero',
      bloques: [
        { tipo: 'p', html: `Antes de adoptar un framework conviene entender qué hace por dentro. Aquí tienes el esqueleto de un eval harness casero que aplica los principios de la sección anterior: tareas × trials, entorno limpio por trial, agente con timeout, recogida de transcript, graders, distinción entre errores de infraestructura y fallos del agente y escritura en JSONL con metadatos. Las funciones de entorno y de agente son interfaces: en el laboratorio del módulo 11 las implementarás por completo.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'harness_eval.py: esqueleto', codigo: `import hashlib, json, time
from concurrent.futures import ThreadPoolExecutor, as_completed


class ErrorInfra(Exception):
    """Fallo ajeno al agente: el contenedor no arranca o muere, el host se queda sin
    recursos, el sandbox pierde la conexión... Se reintenta; nunca cuenta como fallo."""


def hash_config(config: dict) -> str:
    return hashlib.sha256(json.dumps(config, sort_keys=True).encode()).hexdigest()[:12]


def un_intento(tarea: dict, config: dict) -> dict:
    entorno = crear_entorno_limpio(tarea["imagen"], **config["recursos"])   # contenedor NUEVO
    try:
        entorno.verificar(config["recursos"])          # ¿los límites reales son los pedidos?
        res = correr_agente_en(entorno, tarea["enunciado"], config["agente"],
                               timeout_s=config["timeout_trial_s"])
        # res: transcript, motivo_parada, tokens, coste (un timeout del agente NO es error infra)
        outcome = entorno.estado_final()               # diff, estado de la BD, ficheros...
        notas = {g.nombre: g.calificar(tarea, outcome, res["transcript"])
                 for g in graders_de(tarea)}
        return {"estado": "ok", **res, "notas": notas}
    finally:
        entorno.destruir()                             # nada sobrevive al trial


def ejecutar_trial(tarea: dict, n_trial: int, config: dict, meta: dict) -> dict:
    registro = {"tarea": tarea["id"], "trial": n_trial, **meta, "inicio": time.time()}
    for intento in range(config["reintentos_infra"] + 1):
        try:
            registro.update(un_intento(tarea, config), intentos_infra=intento)
            break
        except ErrorInfra as e:                        # solo esto se reintenta
            registro.update(estado="error_infra", error=str(e), intentos_infra=intento + 1)
    registro["fin"] = time.time()
    return registro


def ejecutar_suite(tareas: list[dict], config: dict, salida: str) -> None:
    meta = {"run_id": config["run_id"], "modelo": config["agente"]["modelo"],
            "agent_harness_commit": config["agente"]["commit"],
            "eval_harness_commit": config["eval_commit"], "config_hash": hash_config(config)}
    hechos = cargar_hechos(salida)                     # reanudación: (tarea, trial) ya escritos
    pendientes = [(t, k) for t in tareas for k in range(config["trials"])
                  if (t["id"], k) not in hechos]
    with ThreadPoolExecutor(max_workers=config["concurrencia"]) as pool, open(salida, "a") as f:
        futuros = [pool.submit(ejecutar_trial, t, k, config, meta) for t, k in pendientes]
        for fut in as_completed(futuros):
            f.write(json.dumps(fut.result(), ensure_ascii=False) + "\\n")
            f.flush()                                  # si se interrumpe, no se pierde nada` },
        { tipo: 'p', html: `Recorre el código con los principios en mente. <code>crear_entorno_limpio</code> y <code>destruir</code> en un <code>finally</code> garantizan el aislamiento. <code>verificar</code> comprueba que los recursos reales son los declarados (el bug del transcript anterior). Solo <code>ErrorInfra</code> se reintenta; si el agente agota su timeout, eso es un resultado del agente y se califica el estado que haya dejado. Cada línea del JSONL lleva los metadatos (modelo, commits, hash de configuración) y el fichero se abre en modo <em>append</em> con <code>flush</code> tras cada trial, así que una ejecución interrumpida se reanuda saltándose lo ya hecho.` },
        { tipo: 'p', html: `Lo que el esqueleto deja fuera, y que un harness real necesita: escribir los transcripts completos en ficheros aparte (el JSONL guarda la referencia), cálculo de métricas agregadas con intervalos de confianza (M08), un modo de recalificación que reutilice transcripts sin reejecutar, control de límites de tasa y un informe que incluya la tasa de errores de infraestructura por condición.` },
        { tipo: 'revelar', pregunta: `En el esqueleto, ¿por qué un timeout del agente <strong>no</strong> se trata como <code>ErrorInfra</code>, si en apariencia también es «el trial no terminó»?`,
          respuesta: `Porque el límite de tiempo forma parte de las condiciones declaradas de la tarea: si el agente se pierde explorando, entra en un bucle o es demasiado lento, eso es comportamiento del agente y debe contar. Reintentarlo sería darle más oportunidades que a los demás (cómputo oculto). La excepción es cuando el tiempo se pierde por causas externas (la API estuvo caída, el contenedor se congeló por contención de recursos); por eso conviene registrar cuánto tiempo consumió el modelo, cuánto las herramientas y cuánto se pasó esperando reintentos de API, y tratar como infraestructura solo lo que tenga una causa externa demostrable.` },
        { tipo: 'checklist', id: 'm04-ck1', titulo: 'Checklist: ¿está listo tu eval harness?', items: [
          'Cada trial arranca en un entorno <strong>nuevo</strong> creado desde una imagen fijada por digest, y se destruye al terminar',
          'He comprobado que el entorno no contiene soluciones, tests ocultos, historial de git futuro ni restos de otros trials',
          'Los límites de recursos (CPU, memoria, disco, red) se <strong>verifican</strong> al arrancar y coinciden con el manifiesto',
          'Los límites del agente (turnos, tiempo, tokens, coste) son iguales en todas las condiciones y se informan con los resultados',
          'El motivo de parada de cada trial se registra (fin natural, submit, max_turnos, timeout, presupuesto)',
          'Los errores de infraestructura se detectan con señales explícitas, se reintentan en un entorno nuevo y se informan como tasa por condición',
          'Los fallos del agente <strong>nunca</strong> se reintentan',
          'Los graders distinguen «la verificación falló» de «la verificación no pudo ejecutarse»',
          'Se guarda el transcript completo y el estado final de cada trial, no solo la nota',
          'Cada registro incluye modelo exacto, commit del agent harness, commit del eval harness, hash de configuración, tokens, coste y marcas de tiempo',
          'La ejecución se puede reanudar sin repetir trials completados',
          'La caché de respuestas está desactivada (o es por trial) en las ejecuciones que se van a informar',
          'La concurrencia está ajustada a los recursos y a los límites de tasa, y las condiciones se intercalan en el tiempo',
          'He ejecutado un piloto pequeño y he leído a mano varios transcripts, incluidos éxitos, antes de lanzar la suite completa',
          'Existe un manifiesto de ejecución versionado junto a los resultados',
        ] },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s9
    {
      id: 's9',
      titulo: 'Trampas sensibles al harness',
      bloques: [
        { tipo: 'p', html: `Con todo lo anterior ya puedes reconocer las trampas más comunes al leer o producir resultados de agentes. Todas tienen la misma raíz: atribuir al modelo (o a tu cambio) un efecto que en realidad viene del andamiaje o de la infraestructura.` },
        { tipo: 'acordeon', items: [
          { titulo: 'Comparar números obtenidos con harnesses distintos', bloques: [
            { tipo: 'p', html: `El laboratorio A informa una cifra para su modelo en SWE-bench Verified con su propio scaffold; el laboratorio B informa otra con un scaffold distinto. La diferencia mezcla modelo, scaffold, número de intentos, límites y versión del harness de calificación. <strong>Qué hacer:</strong> si necesitas comparar modelos, ejecútalos tú en el mismo harness; si solo tienes cifras publicadas, compáralas únicamente cuando el informe declare el mismo agente y configuración, y trata el resto como indicios.` },
          ] },
          { titulo: 'Formatos de prompt y de herramientas afinados para una familia de modelos', bloques: [
            { tipo: 'p', html: `Un harness desarrollado iterando con el modelo A tiene prompts, descripciones de herramientas y formatos de edición que funcionan bien con A. Al probar el modelo B en ese harness, B parte con desventaja. <strong>Qué hacer:</strong> si comparas modelos, usa un harness neutro (o varios) o permite a cada modelo su configuración recomendada y declara que comparas productos, no modelos.` },
          ] },
          { titulo: 'Cómputo oculto en tiempo de prueba', bloques: [
            { tipo: 'p', html: `Best-of-N (generar N soluciones y elegir una con un verificador o con los tests visibles), reintentos tras un fallo calificado (como <code>max_attempts</code> en Inspect), votación entre varias ejecuciones, o un presupuesto de tokens mucho mayor. Todo eso sube la nota, y es legítimo si se declara, pero no es comparable con un único intento. Es especialmente grave si la selección usa información que en producción no existiría (por ejemplo, los tests ocultos de la evaluación). <strong>Qué hacer:</strong> informa siempre el número de intentos, cómo se selecciona y el coste total; compara pass@1 con pass@1.` },
          ] },
          { titulo: 'Límites de turnos que truncan tareas largas', bloques: [
            { tipo: 'p', html: `Si las tareas difíciles necesitan muchos pasos, un límite bajo convierte la eval en una medida de «quién resuelve rápido», no de «quién resuelve». Puede invertir el orden entre un agente cuidadoso y uno precipitado. <strong>Qué hacer:</strong> mira la distribución de motivos de parada; si muchos fallos son por límite, súbelo o informa resultados con varios límites.` },
          ] },
          { titulo: 'Diferencias de ventana de contexto y de gestión de contexto', bloques: [
            { tipo: 'p', html: `Un modelo con ventana mayor, o un harness con mejor compactación, rinde mejor en tareas largas por razones que poco tienen que ver con la capacidad de razonamiento. Si tu harness trunca el historial a una longitud fija para todos los modelos, perjudicas a los que podrían usar más. <strong>Qué hacer:</strong> declara la política de contexto; analiza por separado las tareas que superan cierto tamaño de contexto.` },
          ] },
          { titulo: 'Infraestructura distinta entre condiciones', bloques: [
            { tipo: 'p', html: `La condición A se ejecutó en un clúster con máquinas grandes; la B, en otro más cargado. O una se ejecutó con concurrencia 4 y la otra con 32, provocando contención y timeouts. <strong>Qué hacer:</strong> mismos recursos, mismo clúster, ejecuciones intercaladas y tasa de errores de infraestructura informada por condición.` },
          ] },
        ] },
        { tipo: 'pregunta', id: 'm04-c4', pregunta: { tipo: 'vf',
          afirmacion: 'Si un agente obtiene más éxito con best-of-5 seleccionando con los tests ocultos del benchmark que otro agente con un único intento, podemos concluir que el primero es mejor agente.',
          correcta: false,
          explicacion: `Falso. La comparación mezcla cómputo en tiempo de prueba (5 intentos frente a 1) y, peor aún, usa los tests ocultos para elegir, información que en producción no existiría: es una forma de filtrar la respuesta. Para comparar hay que igualar número de intentos y método de selección (pass@1 contra pass@1), o al menos declarar y costear la diferencia. Y la selección nunca debe usar el grader de la evaluación.`,
          seccion: 's9' } },
        { tipo: 'pregunta', id: 'm04-c5', pregunta: { tipo: 'unica',
          pregunta: 'Al analizar una ejecución ves que el 35 % de los fallos del agente tienen como motivo de parada <code>max_turnos</code>. ¿Cuál es la lectura más prudente?',
          opciones: [
            'Una parte importante de la nota depende del límite de turnos: conviene revisar esos transcripts y repetir con un límite mayor o informar resultados con varios límites',
            'El agente es ineficiente y hay que penalizarlo: el límite está bien por definición',
            'Son errores de infraestructura y deben excluirse del denominador',
            'Es irrelevante: el motivo de parada no afecta a la tasa de éxito',
          ],
          correcta: 0,
          explicacion: `Un porcentaje alto de paradas por límite indica que el límite está condicionando el resultado. Puede que el agente sea ineficiente (bucles, repeticiones), o puede que las tareas necesiten más pasos: solo leyendo los transcripts lo sabrás. No son errores de infraestructura (el entorno estaba sano: es una condición declarada de la prueba), así que no se excluyen; y desde luego afecta a la tasa de éxito, porque todos esos trials cuentan como fallos.`,
          seccion: 's9' } },
      ],
    },

    // ─────────────────────────────────────────────────────────────── s10
    {
      id: 's10',
      titulo: 'Recapitulación y lecturas',
      bloques: [
        { tipo: 'p', html: `Recapitulemos con una sola frase por idea. El <strong>agent harness</strong> es parte de lo que evalúas; el <strong>eval harness</strong> es el instrumento con el que lo evalúas; el <strong>entorno</strong> es el escenario. Cambiar el primero cambia legítimamente la nota; que el segundo o el tercero cambien la nota es un defecto de medida. Para responder a una pregunta (¿qué modelo?, ¿qué harness?, ¿qué producto?) fija todo lo demás, usa las mismas tareas con varios trials e intercala las ejecuciones. Y al informar, nombra siempre el par modelo + harness, sus límites, el número de intentos y la tasa de errores de infraestructura.` },
        { tipo: 'p', html: `En los próximos módulos usarás todo esto. El módulo 5 recorre benchmarks como SWE-bench, Terminal-Bench, τ-bench o los de navegación web, cada uno con su eval harness. El módulo 6 profundiza en los graders que el eval harness ejecuta. El módulo 8 te da las herramientas estadísticas para decidir cuántos trials necesitas. El módulo 10 vuelve sobre los entornos con fugas desde la perspectiva del reward hacking. Y en el laboratorio del módulo 11 construirás un mini-harness completo y una tarea en Inspect AI.` },
        { tipo: 'enlaces', items: [
          { titulo: 'SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering (Yang et al., 2024)', url: 'https://arxiv.org/abs/2405.15793', html: 'El artículo que introdujo la idea de ACI y mostró que el diseño de herramientas cambia los resultados.' },
          { titulo: 'Building effective agents (Anthropic, 2024)', url: 'https://www.anthropic.com/engineering/building-effective-agents', html: 'Patrones de agentes y un apéndice sobre cómo diseñar herramientas (prompt engineering de herramientas).' },
          { titulo: 'Documentación de Inspect AI', url: 'https://inspect.aisi.org.uk/', html: 'Tasks, solvers, scorers, agentes, sandboxes y visor de logs.' },
          { titulo: 'Terminal-Bench y Harbor', url: 'https://www.tbench.ai/', html: 'Benchmark de tareas en terminal, su leaderboard de pares agente + modelo y el framework Harbor.' },
          { titulo: 'SWE-bench', url: 'https://www.swebench.com/', html: 'Benchmark, leaderboard y documentación del harness de evaluación con Docker.' },
          { titulo: 'mini-SWE-agent', url: 'https://github.com/SWE-agent/mini-swe-agent', html: 'Agente minimalista útil como línea base.' },
          { titulo: 'BrowserGym', url: 'https://github.com/ServiceNow/BrowserGym', html: 'Entornos unificados para agentes web.' },
          { titulo: 'τ-bench (Yao et al., 2024)', url: 'https://arxiv.org/abs/2406.12045', html: 'Agentes con herramientas y usuario simulado; introduce la métrica pass^k.' },
        ] },
      ],
    },
  ],

  resumen: [
    '«Harness» tiene dos significados: el <strong>agent harness</strong> (scaffold que hace actuar al modelo) y el <strong>eval harness</strong> (infraestructura que mide). Mezclarlos es una fuente constante de errores.',
    'El agent harness —bucle, condiciones de parada, prompt, herramientas (ACI), truncado, gestión de contexto, errores, permisos, trazas— forma parte del sistema evaluado y puede cambiar mucho la nota.',
    'El diseño de herramientas importa tanto como el prompt: SWE-agent mostró que una interfaz pensada para el agente mejora los resultados frente a una shell en bruto.',
    'Decide qué evalúas (modelo, harness o producto), fija lo demás, usa diseños pareados con varios trials e intercala las condiciones; usa diseños factoriales si sospechas interacciones.',
    'Informa siempre el par modelo + agent harness con versiones, límites, número de intentos y coste.',
    'Un eval harness robusto aísla cada trial, fija imágenes y versiones, declara y verifica límites de recursos, registra transcripts completos con metadatos y se puede reanudar.',
    'Reintenta los errores de infraestructura, nunca los fallos del agente, e informa la tasa de errores de infraestructura por condición.',
    'Desconfía de comparar cifras de harnesses distintos, del cómputo oculto (best-of-N, reintentos), de límites de turnos que truncan y de formatos afinados para una familia de modelos.',
  ],

  quiz: [
    { tipo: 'unica',
      pregunta: '¿Cuál de estas descripciones corresponde a un <strong>evaluation harness</strong> y no a un agent harness?',
      opciones: [
        'Crea un contenedor limpio por trial, lanza el agente con límites, ejecuta los graders y guarda los resultados con metadatos',
        'Alterna llamadas al modelo con ejecución de herramientas hasta que el modelo deja de pedirlas',
        'Resume el historial cuando se acerca al límite de la ventana de contexto',
        'Pide confirmación al usuario antes de ejecutar comandos destructivos',
      ],
      correcta: 0,
      explicacion: `Crear entornos, orquestar trials, calificar y registrar es la infraestructura de medida: el eval harness. Las otras tres opciones son componentes del agent harness: el bucle de control, la gestión de contexto y la política de permisos. Todas ellas cambian cómo actúa el agente y, por tanto, forman parte del sistema evaluado.`,
      seccion: 's1' },
    { tipo: 'vf',
      afirmacion: 'Si dos equipos evalúan el mismo modelo en el mismo benchmark, sus resultados deberían coincidir aproximadamente aunque usen agent harnesses distintos.',
      correcta: false,
      explicacion: `Falso. El agent harness decide qué ve el modelo, qué herramientas tiene, cómo se gestiona el contexto y cuándo se detiene. En benchmarks agénticos es habitual que el mismo modelo obtenga resultados muy diferentes con andamiajes distintos; por eso leaderboards como el de Terminal-Bench listan pares agente + modelo.`,
      seccion: 's4' },
    { tipo: 'unica',
      pregunta: '¿Qué mostró principalmente el trabajo de SWE-agent (Yang et al., 2024) sobre las interfaces agente-ordenador (ACI)?',
      opciones: [
        'Que comandos diseñados para el agente (visor con ventanas, búsqueda resumida, edición con linter, feedback conciso) mejoraban los resultados frente a una shell en bruto con el mismo modelo',
        'Que dar al modelo acceso directo a la shell sin restricciones siempre da mejores resultados porque es más flexible',
        'Que el diseño de herramientas es irrelevante si el system prompt es suficientemente detallado',
        'Que los agentes solo funcionan bien con interfaces gráficas que imitan a las humanas',
      ],
      correcta: 0,
      explicacion: `SWE-agent introdujo el concepto de ACI y mostró con ablaciones que una interfaz pensada para el modelo mejora frente a la shell en bruto. La segunda opción es justo lo contrario de su resultado; la tercera contradice la lección central (las herramientas importan tanto como el prompt); la cuarta confunde «diseñar para el agente» con «imitar interfaces humanas»: la ACI de SWE-agent era textual.`,
      seccion: 's2' },
    { tipo: 'multiple',
      pregunta: 'Quieres responder «¿qué modelo funciona mejor en nuestro agente interno?». ¿Qué debes mantener <strong>fijo</strong> entre condiciones?',
      opciones: [
        'El system prompt y las definiciones de herramientas',
        'Los límites de turnos, tiempo y presupuesto',
        'El conjunto de tareas y el número de trials por tarea',
        'El modelo',
        'La imagen del entorno y los recursos del contenedor',
      ],
      correctas: [0, 1, 2, 4],
      explicacion: `Para atribuir la diferencia al modelo hay que fijar todo lo demás: agent harness (prompt, herramientas, límites), tareas y trials, y entorno/recursos. El modelo es precisamente el factor que varías. Si, por ejemplo, cambiaras también el prompt, no sabrías qué parte de la diferencia viene de cada cambio.`,
      seccion: 's4' },
    { tipo: 'unica',
      pregunta: 'Quieres saber si una nueva herramienta de edición mejora tu agente, y sospechas que el efecto puede depender del modelo. ¿Qué diseño es más adecuado?',
      opciones: [
        'Un diseño factorial 2 × 2 (2 modelos × herramienta vieja/nueva) con las mismas tareas y varios trials en cada condición',
        'Un factor cada vez: probar la herramienta nueva solo con el modelo actual',
        'Probar la herramienta nueva con el modelo B y compararla con la vieja usada con el modelo A',
        'Probar ambas herramientas con un trial por tarea en el máximo número de tareas posible',
      ],
      correcta: 0,
      explicacion: `Si sospechas interacción (el efecto de la herramienta depende del modelo), solo un diseño factorial la detecta: cruzas modelos y herramientas y comparas el efecto de la herramienta en cada modelo. Un factor cada vez no la detecta; la tercera opción confunde dos factores; la cuarta no tiene varios trials y no aborda la interacción.`,
      seccion: 's4' },
    { tipo: 'emparejar',
      pregunta: 'Empareja cada herramienta con su propósito principal.',
      pares: [
        ['Inspect AI', 'Framework de evals con Task = dataset + solver + scorer, sandboxes y visor de logs'],
        ['Harbor', 'Ejecutar evals de agentes en contenedores a escala, publicado con Terminal-Bench 2.0'],
        ['BrowserGym', 'Entornos unificados para agentes de navegación web'],
        ['Ragas', 'Métricas para evaluar sistemas RAG'],
        ['lm-evaluation-harness', 'Benchmarks de modelos de lenguaje, mayoritariamente no agénticos'],
        ['mini-SWE-agent', 'Agente minimalista solo con bash, útil como línea base'],
      ],
      explicacion: `Inspect AI (UK AI Security Institute) estructura las evals en dataset + solver + scorer con sandboxes. Harbor nació con Terminal-Bench 2.0 para correr agentes en contenedores a escala. BrowserGym unifica entornos web. Ragas se especializa en RAG. lm-evaluation-harness (EleutherAI) cubre benchmarks clásicos de LM. mini-SWE-agent no es un eval harness sino un agent harness minimalista, muy útil como referencia.`,
      seccion: 's6' },
    { tipo: 'unica',
      pregunta: 'Durante un trial, el proceso de tests del entorno muere con código de salida 137 porque el contenedor tenía 512 MB en lugar de los 4 GB del manifiesto. ¿Cómo debe tratarlo el eval harness?',
      opciones: [
        'Como error de infraestructura: reintentar el trial en un contenedor nuevo con los recursos correctos, no contarlo como fallo del agente e informar la tasa de errores de infraestructura',
        'Como fallo del agente: debería haber previsto que la memoria era limitada',
        'Ignorarlo y quedarse con la nota del grader, porque así se trata a todos los agentes por igual',
        'Reintentar el trial hasta que el agente apruebe, ya que el primer intento no fue válido',
      ],
      correcta: 0,
      explicacion: `El entorno no cumplía las condiciones declaradas: es un fallo de infraestructura y se reintenta en un entorno nuevo y correcto, fuera del denominador, informando su tasa. No es culpa del agente; ignorarlo contamina la nota (y no afecta igual a todos: las tareas pesadas sufren más). Reintentar «hasta que apruebe» confunde la regla: se reintenta hasta tener un trial válido, no hasta tener un éxito.`,
      seccion: 's7' },
    { tipo: 'multiple',
      pregunta: '¿Cuáles de estas situaciones rompen el <strong>aislamiento</strong> entre trials o con la solución?',
      opciones: [
        'Reutilizar un contenedor de un pool sin restaurarlo, de modo que quedan ficheros del trial anterior',
        'Un repositorio con historial de git posterior al commit base, donde el agente puede encontrar el commit de la solución',
        'Una caché de tests compartida entre trials que hace que algunos tests aparezcan como superados',
        'Crear cada contenedor desde una imagen fijada por digest y destruirlo al terminar',
      ],
      correctas: [0, 1, 2],
      explicacion: `Las tres primeras dejan pasar información que no debería estar: restos de otros trials, la solución futura o resultados cacheados. Se han documentado casos reales de agentes que encontraban soluciones en el historial de git. Crear cada contenedor desde una imagen fijada y destruirlo es precisamente la práctica correcta.`,
      seccion: 's7' },
    { tipo: 'vf',
      afirmacion: 'Un eval harness bien diseñado reintenta automáticamente los trials en los que el agente no resolvió la tarea, para reducir la varianza de la medida.',
      correcta: false,
      explicacion: `Falso. Los fallos del agente nunca se reintentan: hacerlo convierte la métrica en «éxito en algún intento», que es cómputo oculto e infla la nota. Solo se reintentan los errores de infraestructura. Para reducir la varianza se ejecutan varios trials por tarea desde el principio y se informa la media (y pass@k o pass^k si interesa), no se repite selectivamente lo que falló.`,
      seccion: 's7' },
    { tipo: 'numerica',
      pregunta: 'Una suite de 40 tareas × 5 trials produce 200 trials. 10 terminan con error de infraestructura (no reintentados aún) y, de los 190 válidos, 95 pasan. ¿Cuál es la tasa de éxito, en %, sobre los trials válidos?',
      respuesta: 50,
      tolerancia: 0.5,
      unidad: '%',
      explicacion: `95 / 190 = 0,50, es decir, un 50 %. Si hubieras contado los errores de infraestructura como fallos, obtendrías 95 / 200 = 47,5 %, penalizando al agente por problemas ajenos. Lo correcto es reintentar esos 10 trials en entornos nuevos y, mientras tanto, informar el 50 % junto con la tasa de errores de infraestructura (10 / 200 = 5 %).`,
      seccion: 's7' },
    { tipo: 'orden',
      pregunta: 'Ordena el ciclo de vida de un trial dentro de un eval harness robusto.',
      items: [
        'Crear un entorno limpio desde una imagen fijada y verificar sus recursos',
        'Lanzar el agente (con su agent harness) bajo los límites declarados',
        'Recoger el transcript completo y el estado final del entorno',
        'Ejecutar los graders sobre el outcome y el transcript',
        'Escribir el registro con notas y metadatos (modelo, commits, hash de configuración, coste)',
        'Destruir el entorno',
      ],
      explicacion: `Primero se prepara un mundo limpio y verificado; después actúa el agente; se captura lo que hizo y cómo quedó el mundo; se califica; se registra todo con metadatos; y se destruye el entorno para que nada sobreviva al siguiente trial. Calificar antes de capturar el estado o destruir el entorno antes de calificar son errores típicos que impiden auditar o recalificar.`,
      seccion: 's6' },
    { tipo: 'unica',
      pregunta: 'Un informe dice: «Nuestro modelo resuelve más tareas que el modelo X en el benchmark», pero su cifra se obtuvo con best-of-8 y un límite de 200 turnos, y la de X es pass@1 con 50 turnos publicada por otro equipo con otro scaffold. ¿Cuál es el problema principal?',
      opciones: [
        'La comparación mezcla agent harness, número de intentos y límites: no permite atribuir la diferencia al modelo',
        'Ninguno, siempre que ambos usen el mismo benchmark',
        'Solo que deberían haber usado más tareas',
        'Que best-of-8 está prohibido en cualquier evaluación',
      ],
      correcta: 0,
      explicacion: `La diferencia puede venir del scaffold, del cómputo en tiempo de prueba (8 intentos frente a 1) o del límite de turnos, además del modelo. Usar el mismo benchmark no basta. Más tareas no arreglan una comparación confundida. Y best-of-N no está prohibido: es legítimo si se declara y se compara con configuraciones equivalentes.`,
      seccion: 's9' },
    { tipo: 'unica',
      pregunta: 'En una tarea de Inspect AI defines <code>basic_agent(..., max_attempts=2, message_limit=30)</code> y <code>sandbox="docker"</code>. ¿Qué afirmación es correcta?',
      opciones: [
        '<code>max_attempts</code> y <code>message_limit</code> configuran el comportamiento del agente (agent harness) y deben declararse al informar; el sandbox Docker lo gestiona el eval harness',
        'Todos los parámetros son del eval harness y no afectan a la nota',
        '<code>max_attempts=2</code> significa que cada muestra se ejecuta dos veces de forma independiente para calcular pass@2',
        'El sandbox Docker forma parte del agent harness porque el agente ejecuta comandos en él',
      ],
      correcta: 0,
      explicacion: `<code>basic_agent</code> es un agent harness: <code>message_limit</code> es una condición de parada y <code>max_attempts</code> permite reintentar tras una respuesta calificada como incorrecta (cómputo extra que hay que declarar). No es lo mismo que ejecutar trials independientes: para eso están las epochs. El sandbox lo crea y gestiona Inspect como parte de la infraestructura de evaluación, aunque el agente actúe dentro de él.`,
      seccion: 's6' },
  ],
});
