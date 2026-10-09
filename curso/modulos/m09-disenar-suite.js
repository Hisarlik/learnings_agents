registrarModulo({
  id: 'm09',
  numero: 9,
  titulo: 'Diseña tu propia suite de evaluación',
  subtitulo: 'Al terminar sabrás construir paso a paso una suite de evaluación útil desde cero, llevarla a CI/CD y combinarla con las demás señales de producción.',
  duracion: '110 min',
  nivel: 'Intermedio',
  objetivos: [
    'Arrancar una suite útil con 20-50 tareas sacadas de fallos reales, sin esperar a tener la suite perfecta',
    'Redactar tareas inequívocas, con solución de referencia y conjuntos equilibrados de casos en los que el comportamiento debe y no debe ocurrir',
    'Validar los graders leyendo transcripts y distinguir un fallo del agente de un fallo del grader, de la tarea o de la infraestructura',
    'Gestionar el ciclo de vida de las tareas: capability evals, regression evals, saturación y graduación',
    'Integrar la suite en CI/CD con niveles, umbrales, presupuesto de coste, manejo de la variabilidad y versionado',
    'Combinar las evals automáticas con monitorización en producción, evals online, feedback de usuarios, A/B tests y revisión humana',
  ],
  secciones: [
    // ───────────────────────────────────────────────────────────── s1
    {
      id: 's1',
      titulo: 'Paso 0: empieza pronto y empieza pequeño',
      bloques: [
        { tipo: 'p', html: 'Los módulos anteriores te han dado las piezas: qué es una tarea, un <em>trial</em>, un <em>transcript</em> y un <em>grader</em> (Módulo 2), cómo se monta un <em>harness</em> (Módulo 4), qué tipos de graders existen (Módulo 6) y cómo leer los números con rigor estadístico (Módulo 8). En este módulo las juntamos en una <strong>hoja de ruta práctica</strong>: qué haces el lunes por la mañana si tu equipo tiene un agente y ninguna eval. La secuencia sigue de cerca las recomendaciones que Anthropic publicó sobre evaluación de agentes (<em>Demystifying evals for AI agents</em>, 2026) y la filosofía de <em>Building effective agents</em> (2024): empezar simple, medir, y añadir complejidad solo cuando la evidencia lo justifica.' },
        { tipo: 'flujo', titulo: 'La hoja de ruta de este módulo', pasos: [
          { titulo: '0. Empieza pronto', texto: '20-50 tareas reales' },
          { titulo: '1. Lo que ya pruebas', texto: 'bugs, tickets, checks manuales' },
          { titulo: '2. Tareas inequívocas', texto: 'con solución de referencia' },
          { titulo: '3. Equilibrio', texto: 'debe y no debe' },
          { titulo: '4-5. Harness y graders', texto: 'entorno estable, graders robustos' },
          { titulo: '6. Lee transcripts', texto: 'valida los graders' },
          { titulo: '7-8. Ciclo de vida', texto: 'saturación, graduación, mantenimiento' },
        ], bucle: 'la suite crece con el producto' },
        { tipo: 'h', texto: 'La intuición: un termómetro imperfecto es mejor que ningún termómetro' },
        { tipo: 'p', html: 'Muchos equipos posponen las evals porque imaginan que una suite "de verdad" necesita cientos de tareas, graders sofisticados y un dashboard. Mientras tanto, las decisiones se toman por sensaciones: alguien prueba cinco conversaciones, le parece que el nuevo prompt "va mejor" y se despliega. Es el equivalente a no escribir ningún test unitario hasta tener una estrategia de cobertura completa: nunca llega el día y, entretanto, cada cambio es un salto al vacío.' },
        { tipo: 'callout', variante: 'clave', titulo: 'Idea clave del Paso 0', html: 'Para empezar bastan <strong>20-50 tareas sencillas extraídas de fallos reales</strong>. No esperes a la suite perfecta: una suite pequeña que se ejecuta hoy vale más que una suite enorme que existirá dentro de tres meses. La suite crecerá contigo.' },
        { tipo: 'h', texto: 'Por qué una muestra pequeña es suficiente al principio' },
        { tipo: 'p', html: 'El argumento no es solo pragmático, es estadístico. En las primeras fases de desarrollo de un agente, los cambios tienen <strong>efectos grandes</strong>: arreglar la descripción de una herramienta, añadir un paso de verificación o corregir un bug en el bucle del agente puede llevar la tasa de éxito de un 30 % a un 70 %. Y el número de tareas necesario para detectar una diferencia crece aproximadamente con el inverso del <strong>cuadrado</strong> de esa diferencia. Una diferencia de 40 puntos se detecta con pocas decenas de tareas; una diferencia de 5 puntos exige cientos.' },
        { tipo: 'tabla', titulo: 'Tareas necesarias por configuración (aprox., muestras independientes, potencia 80 %, α = 0,05 bilateral)', columnas: ['Tasa de éxito antes → después', 'Diferencia', 'Tareas aproximadas por configuración', 'Fase típica'], filas: [
          ['30 % → 70 %', '40 puntos', '≈ 24', 'Primeras semanas: se arreglan errores gruesos'],
          ['40 % → 70 %', '30 puntos', '≈ 42', 'Primeras iteraciones serias'],
          ['60 % → 70 %', '10 puntos', '≈ 356', 'Agente maduro: mejoras incrementales'],
          ['85 % → 90 %', '5 puntos', '≈ 686', 'Ajuste fino cerca del techo'],
        ] },
        { tipo: 'p', html: 'Las cifras salen de la fórmula clásica de tamaño muestral para comparar dos proporciones (la verás en detalle en el Módulo 8). Son orientativas: si comparas dos versiones del agente <strong>sobre las mismas tareas</strong> (diseño pareado) y ejecutas varios trials por tarea, suele bastar con menos. Lo importante es la forma de la relación: con 30 tareas detectas los saltos grandes, que son justo los que ocurren al principio. Juega con el widget para comprobarlo.' },
        { tipo: 'widget', nombre: 'tamano_muestra', p1: 0.4, p2: 0.7 },
        { tipo: 'p', html: 'Prueba a dejar <code>p1</code> fijo y acercar <code>p2</code>: verás cómo el número de tareas se dispara. Esa es la razón por la que la suite <strong>debe crecer a medida que el agente madura</strong>. Cuando las mejoras pasan a ser de pocos puntos, tus 30 tareas iniciales ya no distinguen señal de ruido y toca ampliarlas.' },
        { tipo: 'h', texto: 'Qué significa "tareas sencillas"' },
        { tipo: 'lista', items: [
          '<strong>Sencillas de verificar</strong>, no necesariamente fáciles para el agente: un criterio de éxito que se comprueba con un script o con una rúbrica corta.',
          '<strong>Sacadas de la realidad</strong>: cada tarea corresponde a algo que un usuario pidió o a un fallo que ya ocurrió, no a un caso imaginado en una pizarra.',
          '<strong>Autocontenidas</strong>: el entorno inicial, la instrucción y el criterio de éxito caben en una ficha.',
          '<strong>Variadas</strong>: cubren los flujos principales del producto, no veinte variaciones del mismo caso.',
        ] },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: esperar a la suite perfecta', html: 'El coste de empezar tarde se acumula. Sin evals, el equipo no tiene una definición compartida de "funciona", cada discusión sobre un cambio se resuelve por la opinión de quien más insiste, y cuando por fin se construye la suite hay que reconstruir a posteriori qué significaba el éxito para cada flujo. En la línea de la guía de Anthropic: las evals se vuelven más difíciles de construir cuanto más esperas, porque el comportamiento esperado nunca llegó a escribirse en ningún sitio.' },
        { tipo: 'revelar', pregunta: 'Tu responsable dice: "No tiene sentido evaluar con 30 tareas; el margen de error es enorme". ¿Qué le respondes?', respuesta: 'Que depende de <strong>qué diferencia quieres detectar</strong>. Con 30 tareas el intervalo de confianza de una tasa de éxito es ancho (del orden de ±15-18 puntos cerca del 50 %), así que no sirve para distinguir un 68 % de un 72 %. Pero sí distingue un 30 % de un 70 %, que es el tipo de salto que producen los cambios al principio. Además, 30 tareas leídas con atención revelan fallos sistemáticos (una herramienta mal descrita, un bucle infinito) que ningún número agregado muestra. Empezamos con 30 y crecemos cuando las mejoras se vuelvan finas.' },
        { tipo: 'pregunta', id: 'm09-c1', pregunta: { tipo: 'unica', pregunta: 'Tu agente de soporte está en sus primeras semanas. Un compañero propone retrasar las evals hasta reunir 500 casos etiquetados. ¿Cuál es la mejor respuesta?', opciones: [
          'Empezar ya con 20-50 tareas de fallos reales: al principio los cambios tienen efectos grandes y se detectan con muestras pequeñas',
          'Esperar: con menos de 500 tareas cualquier resultado es estadísticamente inútil',
          'Empezar con 500 tareas sintéticas generadas por un LLM, porque lo importante es el tamaño',
          'No hacer evals hasta que el agente esté en producción y haya datos reales de uso',
        ], correcta: 0, explicacion: 'El tamaño muestral necesario depende de la diferencia que quieres detectar: los saltos de 30-40 puntos típicos del principio se detectan con unas decenas de tareas. Esperar a 500 retrasa meses toda señal. 500 tareas sintéticas sin anclar en fallos reales pueden medir con precisión algo irrelevante. Y esperar a producción significa lanzar sin ninguna red de seguridad.', seccion: 's1' } },
      ],
    },
    // ───────────────────────────────────────────────────────────── s2
    {
      id: 's2',
      titulo: 'Paso 1: convierte lo que ya pruebas a mano en tareas',
      bloques: [
        { tipo: 'p', html: 'Tu equipo <strong>ya está evaluando</strong>, aunque no lo llame así. Cada vez que alguien prueba "los cinco prompts de siempre" antes de una release, cada ticket de soporte que dice "el agente me canceló la suscripción sin preguntar", cada bug que un ingeniero reproduce a mano: todo eso es evaluación. El problema es que se evapora. Nadie la vuelve a ejecutar de forma sistemática y la siguiente regresión del mismo fallo pasa desapercibida.' },
        { tipo: 'callout', variante: 'clave', titulo: 'Idea clave del Paso 1', html: 'La primera fuente de tareas no es tu imaginación, es tu <strong>historial</strong>: comprobaciones manuales, informes de bugs y tickets de soporte. Conviértelos en casos de prueba repetibles y <strong>priorízalos por impacto en el usuario</strong>.' },
        { tipo: 'h', texto: 'Fuentes de tareas y cómo convertirlas' },
        { tipo: 'tabla', columnas: ['Fuente', 'Qué aporta', 'Cómo convertirla en tarea', 'Cuidado con'], filas: [
          ['Comprobaciones manuales pre-release', 'Los flujos que el equipo considera críticos', 'Escribe cada comprobación como instrucción + criterio de éxito explícito', 'Que solo cubran el camino feliz'],
          ['Informes de bugs', 'Fallos reales ya diagnosticados', 'Reproduce el estado inicial; el criterio de éxito es el comportamiento correcto acordado en el arreglo', 'Incluir en la instrucción pistas sobre el arreglo'],
          ['Tickets de soporte', 'El lenguaje real de los usuarios y sus problemas frecuentes', 'Anonimiza, extrae la petición y el contexto, define qué habría sido una buena resolución', 'Datos personales; tickets cuya "solución correcta" nadie sabe'],
          ['Transcripts de producción con feedback negativo', 'Fallos que los usuarios notan', 'Reconstruye el entorno (estado de la cuenta, documentos) y convierte la conversación en tarea', 'Sesgo: solo te llegan quejas de usuarios muy molestos'],
          ['Documentos de política y requisitos', 'Reglas que el agente debe respetar', 'Una tarea por regla crítica, con casos dentro y fuera de la regla', 'Reglas ambiguas que primero hay que aclarar con negocio'],
          ['Casos límite que discuten los expertos', 'Conocimiento tácito del dominio', 'Pide a cada experto 3-5 casos difíciles con su veredicto', 'Casos tan rebuscados que no ocurren nunca'],
        ] },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'De ticket a tarea', html: '<strong>Ticket original:</strong> "Pedí al asistente que me devolviera el cargo duplicado de marzo y me dijo que no veía ningún duplicado, pero en mi extracto aparecen dos cargos de 29 €."<br><br><strong>Tarea resultante:</strong> estado inicial = cuenta de prueba con dos cargos de 29 € el 3 de marzo con el mismo concepto; instrucción del usuario simulado = "Me habéis cobrado dos veces en marzo, ¿me lo devolvéis?"; criterio de éxito = existe exactamente un reembolso de 29 € asociado a uno de los dos cargos y el agente lo comunica al usuario. Observa que la tarea <strong>no</strong> dice "busca duplicados con la herramienta X": describe el problema como lo describiría el usuario.' },
        { tipo: 'codigo', lenguaje: 'yaml', titulo: 'La tarea derivada del ticket, en formato de suite', codigo: `- id: fact-dup-001
  origen: ticket-48213 (anonimizado)
  categoria: reembolsos/duplicados
  prioridad: alta
  entorno:
    fixture: cuenta_con_cargo_duplicado_marzo
  usuario_simulado:
    objetivo: "Recuperar el cargo duplicado de marzo"
    primer_mensaje: "Me habéis cobrado dos veces en marzo, ¿me lo devolvéis?"
  graders:
    - tipo: estado
      check: "reembolsos.count(cargo_mes='2026-03') == 1 and reembolsos[0].importe == 29.00"
    - tipo: juez_llm
      rubrica: "El agente confirma al usuario el importe y el plazo del reembolso."` },
        { tipo: 'h', texto: 'Priorizar por impacto en el usuario' },
        { tipo: 'p', html: 'No todos los fallos merecen el mismo esfuerzo. Un criterio sencillo es cruzar <strong>frecuencia</strong> (cuántos usuarios lo sufren) con <strong>gravedad</strong> (qué pasa cuando ocurre). Un agente que a veces responde con un tono demasiado formal es molesto; un agente que emite reembolsos que la política no permite cuesta dinero y confianza. Empieza por las tareas que protegen contra lo grave y frecuente.' },
        { tipo: 'tabla', titulo: 'Matriz de priorización', columnas: ['', 'Gravedad baja (molestia)', 'Gravedad alta (dinero, datos, seguridad, confianza)'], filas: [
          ['<strong>Frecuencia alta</strong>', 'Prioridad media: tareas de calidad de respuesta, rúbricas de tono', '<strong>Prioridad máxima</strong>: primeras tareas de la suite, con varios trials'],
          ['<strong>Frecuencia baja</strong>', 'Prioridad baja: anótalas para más adelante', 'Prioridad alta: pocas tareas, pero en la suite de regresión desde el día uno'],
        ] },
        { tipo: 'callout', variante: 'aviso', titulo: 'Errores típicos al convertir material real', html: '<ul><li><strong>Copiar datos personales</strong> de tickets y transcripts a la suite. Anonimiza o sintetiza el estado equivalente.</li><li><strong>Filtrar la solución en la instrucción</strong>: si el ticket se resolvió llamando a <code>buscar_duplicados</code>, no pongas esa palabra en el prompt de la tarea.</li><li><strong>Quedarse solo con lo fácil de convertir</strong>: los fallos más valiosos suelen ser los multi-turno y con estado, que cuestan más de reproducir.</li></ul>' },
        { tipo: 'pregunta', id: 'm09-c2', pregunta: { tipo: 'multiple', pregunta: '¿Cuáles de estas son buenas fuentes para las primeras tareas de una suite? (Marca todas las correctas.)', opciones: [
          'Los informes de bugs que el equipo ya ha diagnosticado',
          'Los tickets de soporte, anonimizados',
          'Las comprobaciones manuales que alguien hace antes de cada release',
          'Ejemplos inventados por un LLM sin relación con el uso real, porque son baratos de generar en masa',
          'Solo los casos en los que el agente ya funciona bien, para tener una línea base alta',
        ], correctas: [0, 1, 2], explicacion: 'Bugs, tickets y comprobaciones manuales son fallos o flujos reales: anclan la suite en lo que importa a los usuarios. Generar tareas sintéticas puede ser útil más adelante para ampliar cobertura, pero como punto de partida sin anclaje real tiende a medir lo que no importa. Y elegir solo casos que ya funcionan produce una suite saturada desde el primer día, que no informa de nada.', seccion: 's2' } },
      ],
    },
    // ───────────────────────────────────────────────────────────── s3
    {
      id: 's3',
      titulo: 'Paso 2: tareas inequívocas con solución de referencia',
      bloques: [
        { tipo: 'p', html: 'Una tarea es un <strong>contrato</strong> entre tres partes: quien la escribe, el agente que la ejecuta y el grader que la juzga. Si el contrato es ambiguo, la puntuación deja de medir la capacidad del agente y pasa a medir su <em>suerte interpretando</em> lo que quería decir el autor. Y la suerte, como verás en el Módulo 10, es una de las fuentes más comunes de resultados engañosos.' },
        { tipo: 'callout', variante: 'clave', titulo: 'El test de los dos expertos', html: 'Una buena tarea es aquella en la que <strong>dos expertos del dominio, trabajando por separado, llegarían al mismo veredicto de pass/fail</strong> ante cualquier respuesta del agente. Si puedes imaginar una respuesta sobre la que dos expertos razonables discutirían, la tarea (o su criterio) está infraespecificada.' },
        { tipo: 'terminos', items: [
          { termino: 'Tarea inequívoca', html: 'Tarea cuya instrucción, entorno inicial y criterio de éxito permiten un único veredicto razonable para cada resultado posible.' },
          { termino: 'Solución de referencia', html: 'Una solución concreta, escrita o ejecutada por una persona (o validada por ella), que demuestra que la tarea es <strong>resoluble</strong> en el entorno dado y que el grader la <strong>acepta</strong>.' },
          { termino: 'Criterio verificable', html: 'Condición de éxito que puede comprobarse sin interpretar intenciones: un estado final, una salida con formato definido, unos tests que pasan, una rúbrica con criterios observables.' },
          { termino: 'Supuesto oculto', html: 'Requisito que el grader comprueba pero que no aparece en la tarea ni se deduce de ella (un nombre de fichero, un formato de fecha, una unidad).' },
        ] },
        { tipo: 'h', texto: 'Todo lo que el grader comprueba debe deducirse de la tarea' },
        { tipo: 'p', html: 'Esta es la regla práctica más útil del paso 2. Antes de dar por buena una tarea, lista <strong>todo</strong> lo que comprueba el grader y, para cada punto, señala dónde se le dice al agente (o por qué es obvio para cualquier experto). Si el grader busca un fichero <code>informe.csv</code> y la tarea dice "genera un informe", un agente que escribe <code>report.csv</code> con el contenido perfecto fallará injustamente. No has medido capacidad: has medido si el agente adivinó un nombre.' },
        { tipo: 'comparar', columnas: [
          { titulo: 'Tarea ambigua', tono: 'fail', items: [
            '"Arregla el problema de la exportación."',
            '¿Qué problema? ¿Qué exportación? ¿A qué formato?',
            'El grader ejecuta <code>test_export_csv_separator</code>, que espera <code>;</code> como separador.',
            'Un agente que arregla otro bug real de la exportación falla.',
            'Dos expertos discreparían sobre si un arreglo alternativo "cuenta".',
          ] },
          { titulo: 'Tarea inequívoca', tono: 'pass', items: [
            '"Al exportar facturas a CSV desde <code>/export</code>, los importes con coma decimal rompen las columnas. Haz que la exportación use <code>;</code> como separador de campos, como espera la configuración regional española."',
            'El entorno incluye el repositorio y un fichero de ejemplo que reproduce el fallo.',
            'El grader ejecuta tests ocultos sobre el separador y tests existentes para detectar regresiones.',
            'Cualquier implementación correcta pasa, no solo la del autor.',
          ] },
        ] },
        { tipo: 'p', html: 'Fíjate en que la tarea inequívoca no dicta <strong>cómo</strong> arreglarlo (no menciona funciones ni ficheros concretos del código), pero sí deja claro <strong>qué</strong> debe ser cierto al final. Esa es la combinación buscada: especificación clara del resultado, libertad en el camino.' },
        { tipo: 'h', texto: 'La solución de referencia: prueba de que es resoluble y de que el grader funciona' },
        { tipo: 'p', html: 'Para cada tarea, alguien debe producir una solución de referencia y pasarla por el grader. Esto comprueba dos cosas a la vez: que la tarea <strong>se puede resolver</strong> con las herramientas y el entorno disponibles (que no falta una dependencia, que el dato existe, que los permisos lo permiten) y que el grader <strong>reconoce</strong> una solución correcta. Completa la validación con <strong>controles negativos</strong>: una respuesta vacía y una respuesta plausible pero incorrecta deben suspender. Si un grader aprueba la respuesta vacía, tienes un falso positivo esperando a ocurrir.' },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'Validar una tarea antes de añadirla a la suite', codigo: `def validar_tarea(tarea, ejecutar_grader):
    """Comprueba que la tarea es resoluble y que el grader discrimina."""
    problemas = []
    # 1. La solucion de referencia debe aprobar
    if not ejecutar_grader(tarea, tarea.solucion_referencia).aprobado:
        problemas.append("el grader rechaza la solucion de referencia")
    # 2. Controles negativos: deben suspender
    for nombre, respuesta in {
        "vacia": "",
        "sin_hacer_nada": tarea.estado_inicial,
        "incorrecta_plausible": tarea.solucion_incorrecta,
    }.items():
        if ejecutar_grader(tarea, respuesta).aprobado:
            problemas.append(f"el grader aprueba la respuesta {nombre}")
    # 3. Todo lo que comprueba el grader debe estar en la tarea
    for requisito in tarea.requisitos_del_grader:
        if requisito not in tarea.requisitos_explicitos:
            problemas.append(f"supuesto oculto: {requisito}")
    return problemas` },
        { tipo: 'h', texto: '0 % de pass@100: sospecha de la tarea antes que del agente' },
        { tipo: 'p', html: 'Si ejecutas una tarea muchas veces (por ejemplo, 100 trials) con un agente competente y <strong>ninguno</strong> tiene éxito, la explicación más probable no es que el agente sea incapaz, sino que <strong>la tarea está rota</strong>: el grader tiene un bug, falta algo en el entorno, la instrucción es ambigua o el criterio exige algo imposible. Un agente capaz que resuelve tareas parecidas casi siempre acierta alguna vez por pura variabilidad. Un 0 % sistemático es una alarma para leer transcripts, no una cifra para el informe.' },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: "es que es una tarea muy difícil"', html: 'Ante un 0 % persistente, la tentación es etiquetar la tarea como "difícil" y dejarla en la suite como reto. Antes de hacerlo, ejecuta la solución de referencia en el mismo harness, lee al menos tres transcripts fallidos y comprueba si el agente estuvo cerca. Si no hay solución de referencia que pase en ese harness, la tarea no está lista. Las tareas difíciles legítimas existen, pero se demuestran, no se suponen.' },
        { tipo: 'h', texto: 'Practica: genera la ficha de una tarea' },
        { tipo: 'p', html: 'El siguiente constructor genera la especificación YAML de una tarea. Úsalo para escribir una tarea de tu propio agente y, al terminar, aplícale el test de los dos expertos y la regla de "todo lo que el grader comprueba debe deducirse de la tarea".' },
        { tipo: 'widget', nombre: 'constructor_eval' },
        { tipo: 'pregunta', id: 'm09-c3', pregunta: { tipo: 'vf', afirmacion: 'Si dos expertos del dominio discrepan sobre si una respuesta del agente debería aprobar, lo correcto es dejar que decida un juez LLM, porque es más consistente que las personas.', correcta: false, explicacion: 'Falso. Si dos expertos discrepan, el problema está en la <strong>especificación de la tarea o de su criterio</strong>: hay que aclararla hasta que el veredicto sea único. Un juez LLM puede ser consistente, pero consistente en aplicar una regla que nadie ha definido; trasladar la ambigüedad al juez solo la esconde.', seccion: 's3' } },
      ],
    },
    // ───────────────────────────────────────────────────────────── s4
    {
      id: 's4',
      titulo: 'Paso 3: conjuntos equilibrados, cuándo sí y cuándo no',
      bloques: [
        { tipo: 'p', html: 'Imagina que evalúas un filtro de spam solo con correos que son spam. Un filtro que marca <em>todo</em> como spam obtiene un 100 %. Con los agentes ocurre lo mismo, pero de forma más sutil: si tu suite solo comprueba que el agente <strong>busca en la web cuando hace falta</strong>, cualquier ajuste que lo empuje a buscar más mejorará la puntuación, incluido el ajuste que lo hace buscar siempre, también para "¿cuánto es 2 + 2?". Has optimizado un lado del comportamiento y degradado el otro sin enterarte.' },
        { tipo: 'callout', variante: 'clave', titulo: 'Idea clave del Paso 3', html: 'Un <strong>conjunto equilibrado</strong> incluye casos en los que el comportamiento <strong>debe</strong> ocurrir y casos en los que <strong>no debe</strong> ocurrir (y, si puedes, casos frontera). Así evitas la optimización de un solo lado: mejorar en uno a costa del otro.' },
        { tipo: 'tabla', columnas: ['Comportamiento', 'Casos en los que debe ocurrir', 'Casos en los que no debe ocurrir', 'Riesgo si solo pruebas un lado'], filas: [
          ['Buscar en la web', 'Preguntas sobre hechos recientes o datos que no están en el contexto', 'Cálculos, saludos, preguntas sobre el propio documento que el usuario ya pegó', 'Búsquedas innecesarias: más coste, latencia y ruido'],
          ['Pedir aclaración', 'Peticiones genuinamente ambiguas ("cámbiame el plan")', 'Peticiones claras ("pasa mi plan de Básico a Pro desde el mes que viene")', 'Agente que interroga al usuario por todo'],
          ['Escalar a un humano', 'Casos fuera de la política o con riesgo legal', 'Casos rutinarios que el agente puede resolver', 'Agente que lo escala todo: inútil pero "seguro"'],
          ['Negarse', 'Peticiones prohibidas por la política', 'Peticiones legítimas que se parecen superficialmente a las prohibidas', 'Rechazos excesivos que frustran a usuarios legítimos'],
          ['Ejecutar una acción destructiva (borrar, reembolsar, cancelar)', 'Petición explícita y verificada', 'Petición ambigua, usuario no verificado, importe fuera de límite', 'Acciones irreversibles no deseadas'],
        ] },
        { tipo: 'h', texto: 'Cómo construir el lado "no debe"' },
        { tipo: 'lista', items: [
          '<strong>Busca los gemelos</strong>: para cada caso positivo, escribe un caso casi idéntico en el que el comportamiento no corresponde. "Devuélveme el cargo duplicado" (debe reembolsar) frente a "¿por qué tengo dos cargos?" cuando uno es la cuota y otro un complemento contratado (no debe reembolsar, debe explicar).',
          '<strong>Usa tus fallos de producción en ambas direcciones</strong>: los tickets de "el agente no hizo X" alimentan el lado positivo; los de "el agente hizo X sin que yo lo pidiera" alimentan el negativo.',
          '<strong>Incluye casos frontera</strong> con su veredicto acordado: el importe exactamente en el límite de la política, el usuario que verifica su identidad a medias.',
        ] },
        { tipo: 'p', html: 'La proporción no tiene por qué ser 50/50. Puede reflejar la mezcla de producción, siempre que haya <strong>suficientes casos de cada lado</strong> para medirlos con sentido. Y, sobre todo, <strong>informa de cada lado por separado</strong>, como harías con la precisión y la exhaustividad (<em>recall</em>) de un clasificador.' },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: promediar los dos lados', html: 'Si la suite tiene 40 casos "debe buscar" y 10 casos "no debe buscar", un agente que busca siempre obtiene 40/50 = 80 %, que parece razonable. Desglosado, es 100 % en un lado y 0 % en el otro. El promedio esconde exactamente el fallo que el equilibrio pretendía detectar. Reporta cada lado y fija umbrales para ambos.' },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Caso: el agente que pedía demasiadas aclaraciones', html: 'Un equipo detecta que su agente a veces ejecuta acciones con información incompleta, así que añade tareas en las que debe pedir aclaración y ajusta el prompt: "ante cualquier duda, pregunta". La tasa en esas tareas sube mucho. Semanas después, el feedback de usuarios empeora: el agente pide confirmación hasta para cambiar el idioma de la interfaz. La suite no lo vio porque no tenía ni un caso del tipo "petición clara, no preguntes". Con un conjunto equilibrado, el mismo cambio habría mostrado la mejora en un lado y la caída en el otro, y el equipo habría buscado un ajuste intermedio.' },
        { tipo: 'revelar', pregunta: 'Tu suite mide si el agente "pide aclaración cuando la petición es ambigua". ¿Qué puntuación obtendría un agente que <em>siempre</em> pide aclaración? ¿Y qué añadirías?', respuesta: 'Obtendría el 100 % en esa suite, sin ser útil. Añadiría casos de peticiones claras donde pedir aclaración <strong>cuenta como fallo</strong> (o al menos como penalización), reportaría ambos lados por separado y, si es posible, una métrica de "turnos innecesarios" en las conversaciones con usuario simulado.' },
        { tipo: 'pregunta', id: 'm09-c4', pregunta: { tipo: 'unica', pregunta: 'Tu suite de "uso de la herramienta de búsqueda" tiene 45 casos en los que buscar es necesario y 5 en los que no. Un cambio de prompt sube la puntuación global del 82 % al 90 %. ¿Qué deberías mirar antes de celebrarlo?', opciones: [
          'La tasa de cada lado por separado: el aumento puede venir de buscar siempre, a costa de los 5 casos negativos',
          'Nada: 8 puntos de mejora con 50 casos es una mejora clara',
          'Solo el coste por tarea, porque la calidad ya está demostrada',
          'Repetir la eval con la misma semilla para confirmar el resultado exacto',
        ], correcta: 0, explicacion: 'Con un conjunto desequilibrado, el promedio está dominado por el lado mayoritario. Un agente que pasa a buscar siempre ganaría puntos en los 45 positivos y perdería los 5 negativos, y el global aún subiría. Hay que desglosar por lado. Además, 8 puntos con 50 casos no es una diferencia concluyente sin intervalos (Módulo 8), y repetir con la misma semilla no aporta información sobre la variabilidad real.', seccion: 's4' } },
      ],
    },
    // ───────────────────────────────────────────────────────────── s5
    {
      id: 's5',
      titulo: 'Pasos 4 y 5: un harness estable y graders bien pensados',
      bloques: [
        { tipo: 'h', texto: 'Paso 4: un eval harness robusto con un entorno estable' },
        { tipo: 'p', html: 'En el Módulo 4 viste la diferencia entre el <em>agent harness</em> (el andamiaje que convierte un modelo en agente) y el <em>eval harness</em> (la infraestructura que ejecuta tareas, recoge transcripts y aplica graders). Para tu suite, el requisito central es que <strong>el entorno sea estable</strong>: si el resultado de una tarea depende de qué otra tarea se ejecutó antes, de la hora del día o de la versión de una librería que se actualizó sola, tus números medirán el entorno, no el agente.' },
        { tipo: 'callout', variante: 'clave', titulo: 'Idea clave del Paso 4', html: 'Cada trial debe empezar desde un <strong>entorno limpio y aislado</strong>: mismo estado inicial, sin ficheros, cachés, historial ni datos que haya dejado un trial anterior. Lo que no es reproducible no es comparable.' },
        { tipo: 'lista', items: [
          '<strong>Entorno inicial versionado</strong>: imagen de contenedor con versiones fijadas, <em>fixtures</em> de datos con identificador, mismo repositorio en el mismo commit.',
          '<strong>Aislamiento entre trials</strong>: un contenedor o sandbox nuevo por trial; base de datos restaurada desde una instantánea; nada de directorios de trabajo compartidos.',
          '<strong>Dependencias externas controladas</strong>: APIs de terceros simuladas (<em>mocks</em>) o grabadas cuando su variabilidad no es lo que quieres medir.',
          '<strong>Registro completo</strong>: transcript con todas las llamadas a herramientas y sus resultados, estado final, tokens, coste, tiempo y versiones de todo (modelo, prompt, harness, tarea, grader).',
          '<strong>Errores de infraestructura separados</strong>: un timeout del contenedor o un 429 de la API no es un fallo del agente; se registra aparte y se reintenta.',
          '<strong>Recursos fijos y documentados</strong>: CPU, memoria, timeouts y límites de pasos. Cambiarlos puede mover la puntuación tanto como cambiar el modelo.',
        ] },
        { tipo: 'callout', variante: 'error', titulo: 'Anti-patrón: el directorio compartido', html: 'Un harness reutiliza el mismo directorio de trabajo entre trials "para ir más rápido". Un trial deja escrito el fichero de solución; el siguiente trial de la misma tarea lo encuentra, el grader comprueba que existe y aprueba. La tasa de éxito sube y nadie entiende por qué. En el Módulo 10 analizarás un transcript de este tipo.' },
        { tipo: 'h', texto: 'Paso 5: diseña los graders con cabeza' },
        { tipo: 'p', html: 'El Módulo 6 cubrió los tipos de graders (basados en código, jueces LLM y humanos). Aquí los aplicamos como lista de decisiones de diseño para tu suite. Despliega cada una:' },
        { tipo: 'acordeon', items: [
          { titulo: 'Califica resultados, no caminos', bloques: [
            { tipo: 'p', html: 'Comprueba el <strong>estado final</strong> o la salida, no la secuencia exacta de herramientas. Los agentes encuentran caminos válidos que no anticipaste; un grader que exige "llamó a <code>buscar_cliente</code> y luego a <code>ver_facturas</code>" penaliza soluciones correctas y premia a quien imita tu camino. Las excepciones son las <strong>restricciones duras</strong> del proceso: "nunca emitir un reembolso sin verificar identidad" sí es un requisito sobre el camino y se comprueba como tal.' },
          ] },
          { titulo: 'Crédito parcial donde aporte información', bloques: [
            { tipo: 'p', html: 'En tareas con varios componentes (diagnosticar, arreglar, comunicar), puntuar cada componente te dice <strong>dónde</strong> falla el agente. Úsalo para diagnóstico, pero mantén también un veredicto binario de "tarea resuelta": un 80 % de crédito parcial puede esconder que el paso crítico falla siempre.' },
          ] },
          { titulo: 'Calibra los jueces LLM con expertos humanos', bloques: [
            { tipo: 'p', html: 'Antes de confiar en un juez, etiqueta un conjunto de respuestas con expertos y mide el acuerdo (por ejemplo, con kappa de Cohen, Módulo 6). Revisa los desacuerdos: muchas veces revelan una rúbrica ambigua, no un juez malo. Repite la calibración cuando cambies la rúbrica o el modelo juez.' },
          ] },
          { titulo: 'Dale al juez una salida: "unknown"', bloques: [
            { tipo: 'p', html: 'Si el juez solo puede responder PASS o FAIL, ante información insuficiente adivinará. Permitir un veredicto <code>UNKNOWN</code> (o "no puedo determinarlo") reduce las alucinaciones del juez y te da una lista de casos que merecen revisión humana o una tarea mejor especificada.' },
          ] },
          { titulo: 'Hazlos resistentes a atajos', bloques: [
            { tipo: 'p', html: 'Un grader que solo comprueba que "existe el fichero" o que "los tests pasan" invita a atajos: crear un fichero vacío, borrar los tests. Usa tests ocultos que el agente no ve, verifica que los ficheros de test no se han modificado, comprueba el contenido y no solo la existencia, y evalúa que una respuesta vacía suspende. El catálogo completo de trampas está en el Módulo 10.' },
          ] },
          { titulo: 'Combina graders según lo que mide cada uno', bloques: [
            { tipo: 'p', html: 'Lo objetivo (estado de la base de datos, tests) con código; lo subjetivo (tono, claridad, adecuación) con un juez LLM calibrado; y una muestra periódica con revisión humana para vigilar a ambos. Una tarea puede tener varios graders y un criterio de agregación explícito.' },
          ] },
        ] },
        { tipo: 'codigo', lenguaje: 'yaml', titulo: 'Graders combinados para una tarea', codigo: `graders:
  - id: estado_reembolso          # resultado, no camino
    tipo: codigo
    check: "reembolsos.total(cliente='C-102') == 29.00"
    peso: obligatorio
  - id: restriccion_verificacion   # restriccion dura del proceso
    tipo: codigo
    check: "verificar_identidad llamado antes que emitir_reembolso"
    peso: obligatorio
  - id: comunicacion
    tipo: juez_llm
    modelo_juez: juez-v3
    rubrica: |
      PASS si el agente informa del importe y del plazo del reembolso.
      FAIL si omite alguno o da datos incorrectos.
      UNKNOWN si el transcript no permite determinarlo.
    peso: informativo
agregacion: "aprobado si todos los obligatorios pasan"` },
        { tipo: 'pregunta', id: 'm09-c5', pregunta: { tipo: 'unica', pregunta: 'Para una tarea "cancela la suscripción del cliente C-77 al final del ciclo", ¿qué grader es mejor?', opciones: [
          'Comprobar en la base de datos que la suscripción de C-77 tiene la cancelación programada para la fecha de fin de ciclo, y que no se ha tocado ninguna otra suscripción',
          'Comprobar que el agente llamó exactamente a <code>buscar_cliente</code>, <code>ver_suscripcion</code> y <code>cancelar</code>, en ese orden',
          'Pedir a un juez LLM que decida si la respuesta final "suena" a cancelación correcta',
          'Comprobar que la respuesta final contiene la palabra "cancelada"',
        ], correcta: 0, explicacion: 'El grader de estado mide el resultado que importa y añade un control de efectos colaterales. Exigir una secuencia exacta penaliza caminos alternativos válidos. Un juez que solo lee la respuesta final no ve si la acción ocurrió de verdad (el agente puede afirmar algo que no hizo). Buscar una palabra es frágil y trivial de satisfacer sin cancelar nada.', seccion: 's5' } },
      ],
    },
    // ───────────────────────────────────────────────────────────── s6
    {
      id: 's6',
      titulo: 'Paso 6: valida los graders leyendo transcripts',
      bloques: [
        { tipo: 'p', html: 'Una tasa de éxito es un <strong>resumen</strong>; el transcript es la <strong>evidencia</strong>. Hasta que no lees lo que hizo el agente en una muestra de trials, no sabes si tu grader mide lo que crees. Este paso es el que más equipos se saltan y el que más errores evita. Si solo pudieras hacer una cosa de este módulo además de empezar, sería esta.' },
        { tipo: 'callout', variante: 'clave', titulo: 'Idea clave del Paso 6', html: 'Los fallos deben <strong>parecer justos</strong>. Si al leer un transcript suspendido piensas "pero si el agente lo hizo bien", el que ha fallado es el grader (o la tarea), no el agente. Y si al leer un aprobado piensas "esto no debería pasar", tienes un falso positivo.' },
        { tipo: 'flujo', titulo: 'La rutina de lectura de transcripts', pasos: [
          { titulo: 'Muestrear', texto: 'fallos y también éxitos' },
          { titulo: 'Leer completo', texto: 'instrucción, pasos, herramientas, estado final' },
          { titulo: 'Diagnosticar', texto: '¿agente, grader, tarea o infraestructura?' },
          { titulo: 'Corregir', texto: 'lo que corresponda, no siempre el agente' },
          { titulo: 'Re-ejecutar', texto: 'y comparar con la versión anterior' },
        ], bucle: 'en cada ejecución relevante' },
        { tipo: 'h', texto: 'Triaje: ¿de quién es el fallo?' },
        { tipo: 'tabla', columnas: ['Diagnóstico', 'Señales en el transcript', 'Qué corregir'], filas: [
          ['Fallo del agente', 'Razonamiento equivocado, herramienta mal usada, se rinde, ignora una instrucción clara', 'El agente: prompt, herramientas, flujo. La tarea se queda tal cual'],
          ['Fallo del grader', 'La solución es correcta pero con otro formato, otro nombre o un camino distinto; o el grader aprueba algo vacío', 'El grader. Re-evalúa trials anteriores con la versión corregida'],
          ['Fallo de la tarea', 'La instrucción admite varias lecturas razonables; falta información; el criterio exige algo no pedido', 'La tarea: reescribirla y validar de nuevo con solución de referencia'],
          ['Fallo de infraestructura', 'Timeout, error 5xx, contenedor sin memoria, herramienta que no responde', 'El harness. Contabilizar aparte y reintentar; no cuenta como fallo del agente'],
        ] },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Un fallo que no era del agente', html: 'Tarea: "dime cuánto pagará el cliente C-31 en su próxima factura". Grader: comparación exacta con la cadena <code>96.00 EUR</code>. Transcript: el agente consulta el plan, aplica el descuento correctamente y responde "Tu próxima factura será de 96,00 €". Veredicto del grader: FAIL. Al leerlo, el fallo no parece justo: la respuesta es correcta y está en el formato natural para un usuario hispanohablante. El arreglo es un grader que normalice importes (separador decimal, símbolo de moneda) o que extraiga el número y lo compare con tolerancia.' },
        { tipo: 'h', texto: 'Cómo organizar la lectura' },
        { tipo: 'lista', items: [
          '<strong>Lee también los éxitos.</strong> Los falsos negativos se ven en los fallos, pero los falsos positivos se esconden en los aprobados.',
          '<strong>Empieza por las anomalías</strong>: tareas con 0 % o 100 % persistente, tareas cuyo resultado cambió mucho entre versiones, trials anormalmente cortos o largos.',
          '<strong>Que lea alguien del dominio.</strong> Un ingeniero puede no ver que una respuesta de facturación aplica mal el prorrateo; un experto de soporte lo ve al instante.',
          '<strong>Anota el diagnóstico de cada transcript leído</strong> (agente / grader / tarea / infra y una frase). Esas anotaciones son oro: sirven para calibrar jueces, priorizar arreglos y detectar patrones.',
          '<strong>Hazlo barato</strong>: un visor de transcripts con enlace directo desde el dashboard elimina la excusa de "no tengo tiempo".',
        ] },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: corregir el agente cuando el roto es el grader', html: 'Si un equipo ve que una tarea falla y, sin leer el transcript, retoca el prompt hasta que pasa, puede estar enseñando al agente a satisfacer un grader defectuoso (por ejemplo, a escribir "96.00 EUR" a usuarios españoles). Peor aún: la "mejora" no se trasladará a producción, donde no hay grader defectuoso que satisfacer.' },
        { tipo: 'revelar', pregunta: 'Tras corregir un bug en el grader, la tasa de éxito de tu agente sube de forma muy notable sin haber tocado el agente. ¿Qué haces con los resultados históricos?', respuesta: 'Versiona el grader y <strong>re-evalúa los transcripts históricos</strong> con la versión corregida (si guardaste transcripts y estado final, no necesitas re-ejecutar el agente). Así las comparaciones entre versiones del agente vuelven a ser válidas. Y documenta el cambio: cualquier gráfico que mezcle resultados con el grader viejo y el nuevo mostrará un salto que no corresponde a ninguna mejora del agente.' },
        { tipo: 'pregunta', id: 'm09-c6', pregunta: { tipo: 'multiple', pregunta: '¿Qué señales en un transcript suspendido apuntan a un fallo del <strong>grader</strong> más que del agente? (Marca todas las correctas.)', opciones: [
          'El agente produjo la respuesta correcta con un formato distinto del que esperaba la comparación exacta',
          'El agente resolvió el problema por un camino diferente, igual de válido, y el grader exigía una secuencia concreta de herramientas',
          'El agente interpretó mal una instrucción clara y modificó un fichero que no debía',
          'El agente se quedó sin pasos porque entró en un bucle llamando a la misma herramienta',
        ], correctas: [0, 1], explicacion: 'Formato distinto y camino alternativo válido son fallos clásicos del grader: la solución es buena y el criterio es demasiado estrecho. Malinterpretar una instrucción clara y entrar en bucle son fallos del agente; el grader los detecta correctamente.', seccion: 's6' } },
      ],
    },
    // ───────────────────────────────────────────────────────────── s7
    {
      id: 's7',
      titulo: 'Pasos 7 y 8: ciclo de vida de las tareas y salud a largo plazo',
      bloques: [
        { tipo: 'h', texto: 'Dos tipos de eval con propósitos opuestos' },
        { tipo: 'p', html: 'No todas las tareas de tu suite cumplen la misma función. Algunas existen para medir <strong>hasta dónde llega</strong> el agente y guiar las mejoras; otras existen para garantizar que <strong>no retrocede</strong> en lo que ya hace bien. Confundir ambas cosas lleva a decisiones raras: alarmarse porque una tarea difícil falla la mitad de las veces, o no alarmarse porque una tarea básica "solo" baja del 100 % al 90 %.' },
        { tipo: 'comparar', columnas: [
          { titulo: 'Capability eval', tono: 'accent', items: [
            '<strong>Pregunta</strong>: ¿qué puede hacer ya el agente y cuánto ha mejorado?',
            '<strong>Tasa esperada</strong>: baja o media; si fuera alta no habría margen para medir mejoras.',
            '<strong>Uso</strong>: <em>hill-climbing</em>, es decir, iterar sobre el agente para subir la puntuación.',
            '<strong>Métrica habitual</strong>: pass@1 y pass@k para ver el potencial.',
            '<strong>Un fallo significa</strong>: hay margen de mejora (normal).',
          ] },
          { titulo: 'Regression eval', tono: 'pass', items: [
            '<strong>Pregunta</strong>: ¿sigue funcionando lo que ya funcionaba?',
            '<strong>Tasa esperada</strong>: cercana al 100 %.',
            '<strong>Uso</strong>: protección frente a retrocesos al cambiar prompt, modelo, herramientas o harness.',
            '<strong>Métrica habitual</strong>: pass^k o tasa por tarea en varios trials, porque importa la fiabilidad.',
            '<strong>Un fallo significa</strong>: algo se ha roto (alarma).',
          ] },
        ] },
        { tipo: 'h', texto: 'Saturación y graduación' },
        { tipo: 'p', html: 'Una capability eval <strong>se satura</strong> cuando el agente la resuelve casi siempre. A partir de ahí ya no informa de mejoras: si todo pasa, no puedes distinguir una versión buena de otra mejor. Además, cerca del techo los incrementos pequeños son casi siempre ruido. Vigila la saturación (por ejemplo, revisando qué tareas superan de forma estable un umbral alto) y actúa en dos direcciones:' },
        { tipo: 'lista', ordenada: true, items: [
          '<strong>Gradúa</strong> las tareas saturadas a la suite de regresión: lo que antes era un reto ahora es algo que el agente debe seguir haciendo.',
          '<strong>Repón</strong> la capability eval con tareas nuevas y más difíciles, sacadas de los fallos que todavía ocurren o de las capacidades que planeas añadir.',
        ] },
        { tipo: 'flujo', titulo: 'Ciclo de vida de una tarea', pasos: [
          { titulo: 'Capacidad planificada o fallo real', texto: 'nace la tarea' },
          { titulo: 'Capability eval', texto: 'tasa baja' },
          { titulo: 'Hill-climbing', texto: 'iteraciones sobre el agente' },
          { titulo: 'Tasa alta y estable', texto: 'en varias ejecuciones' },
          { titulo: 'Regression eval', texto: 'guardia permanente' },
        ] },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: celebrar una suite al 100 %', html: 'Si tu capability eval está al 100 %, no tienes un agente perfecto: tienes una eval que ya no te dice nada nuevo. Una suite saturada sigue siendo útil como regresión (detecta caídas), pero no puede mostrar subidas. Es el momento de graduar y escribir tareas más difíciles.' },
        { tipo: 'clasificar', id: 'm09-cl1', instrucciones: 'Clasifica cada tarea según su papel más adecuado <strong>ahora mismo</strong> en la suite.', categorias: ['Capability eval', 'Regression eval'], items: [
          { texto: 'Responder al saldo pendiente de un cliente: el agente lo resuelve bien en todas las ejecuciones de los últimos dos meses.', categoria: 'Regression eval', explicacion: 'Tasa alta y estable: ya es algo que el agente sabe hacer. Su papel es avisar si deja de hacerlo.' },
          { texto: 'Gestionar una disputa de cargo que requiere consultar tres sistemas y redactar un informe: el agente lo consigue en una minoría de trials.', categoria: 'Capability eval', explicacion: 'Tasa baja con margen de mejora: sirve para medir el progreso al iterar.' },
          { texto: 'Un bug de producción ya arreglado: el agente emitía reembolsos dobles si el usuario repetía la petición.', categoria: 'Regression eval', explicacion: 'Los bugs arreglados se convierten en regresión para que no reaparezcan. Es una de las fuentes más valiosas de tareas de regresión.' },
          { texto: 'Una capacidad planificada para el próximo trimestre (negociar planes de pago fraccionado) que el agente todavía no puede hacer.', categoria: 'Capability eval', explicacion: 'Es desarrollo guiado por evals: la tarea existe antes que la capacidad y medirá el avance.' },
          { texto: 'Rechazar un reembolso fuera de política: tras un arreglo, ahora pasa en todos los trials y es crítico para el negocio.', categoria: 'Regression eval', explicacion: 'Crítico y ya resuelto: debe vigilarse con varios trials (pass^k) en cada cambio.' },
          { texto: 'Una tarea nueva de razonamiento sobre facturas con varios impuestos, añadida la semana pasada a partir de un ticket; el agente acierta aproximadamente la mitad de las veces.', categoria: 'Capability eval', explicacion: 'Tasa intermedia: todavía no es un comportamiento fiable, así que no tiene sentido usarla como alarma de regresión.' },
        ] },
        { tipo: 'h', texto: 'Paso 8: mantener la suite sana a largo plazo' },
        { tipo: 'p', html: 'Una suite de evaluación es <strong>código vivo</strong>: se degrada si nadie la cuida. Las tareas se quedan obsoletas cuando cambia el producto, los graders acumulan excepciones y los fixtures dejan de parecerse a la realidad. Estas prácticas la mantienen útil:' },
        { tipo: 'lista', items: [
          '<strong>Propiedad clara</strong>: cada suite (o cada área de la suite) tiene un responsable con nombre que revisa cambios y decide qué entra y qué sale.',
          '<strong>Contribución abierta</strong>: los expertos del dominio y los equipos de producto deben poder proponer tareas fácilmente (plantilla, revisión ligera, validación automática con solución de referencia). Ellos conocen los fallos que importan.',
          '<strong>Revisión periódica</strong>: retira tareas obsoletas, arregla las rotas, gradúa las saturadas, comprueba que la mezcla sigue reflejando el uso real.',
          '<strong>Las evals como especificación</strong>: cuando hay una discusión sobre qué debe hacer el agente, la respuesta acordada se escribe como tarea.',
        ] },
        { tipo: 'callout', variante: 'clave', titulo: 'Desarrollo guiado por evals (eval-driven development)', html: 'Igual que en el desarrollo guiado por tests, escribe las evals de una capacidad <strong>antes</strong> de que el agente sepa hacerla. Al principio fallarán (es lo esperado); a medida que iteras, verás el progreso. Esto obliga a definir qué significa éxito antes de construir, evita discusiones subjetivas al final y deja preparada la eval de regresión para cuando la capacidad funcione. Un beneficio adicional: cuando aparece un modelo nuevo, un equipo con buenas evals puede evaluarlo y adoptarlo en días, mientras que uno sin ellas necesita semanas de pruebas manuales.' },
        { tipo: 'pregunta', id: 'm09-c7', pregunta: { tipo: 'orden', pregunta: 'Ordena los pasos de la hoja de ruta para construir una suite de evaluación, del primero al último.', items: [
          'Empezar pronto con 20-50 tareas de fallos reales',
          'Convertir comprobaciones manuales, bugs y tickets en tareas, priorizadas por impacto',
          'Escribir tareas inequívocas con solución de referencia',
          'Equilibrar casos en los que el comportamiento debe y no debe ocurrir',
          'Construir un harness estable con trials aislados y diseñar graders robustos',
          'Leer transcripts para validar los graders',
          'Vigilar la saturación y graduar tareas de capability a regression',
        ], explicacion: 'La secuencia va de lo más urgente (tener alguna señal) a lo más refinado (gestionar el ciclo de vida). Escribir tareas inequívocas antes de equilibrarlas tiene sentido porque una tarea ambigua no mejora por tener una gemela; leer transcripts requiere que exista un harness que los produzca; y la saturación solo aparece cuando la suite lleva tiempo funcionando. En la práctica los pasos se solapan e iteran, pero este orden evita construir encima de cimientos rotos.', seccion: 's7' } },
      ],
    },
    // ───────────────────────────────────────────────────────────── s8
    {
      id: 's8',
      titulo: 'Integración en CI/CD',
      bloques: [
        { tipo: 'p', html: 'Una eval que se ejecuta "cuando alguien se acuerda" no protege nada. El valor de una suite se multiplica cuando corre <strong>automáticamente</strong> en cada cambio relevante y su resultado bloquea o alerta. Pero los agentes tienen dos particularidades que la integración continua tradicional no tiene: cada ejecución <strong>cuesta dinero</strong> (tokens, cómputo) y los resultados son <strong>no deterministas</strong>. Tu diseño de CI debe gestionar ambas cosas.' },
        { tipo: 'h', texto: 'Niveles: no todo se ejecuta en cada commit' },
        { tipo: 'tabla', titulo: 'Un esquema de niveles típico (ajústalo a tu coste y ritmo)', columnas: ['Nivel', 'Cuándo', 'Tamaño y trials', 'Propósito', '¿Bloquea?'], filas: [
          ['<strong>Smoke</strong>', 'En cada pull request', 'Pocas decenas de tareas críticas, 1-3 trials', 'Detectar roturas gruesas en minutos', 'Sí, si cae una tarea crítica de forma consistente'],
          ['<strong>Regresión completa</strong>', 'Cada noche y antes de cada release', 'Toda la suite de regresión, varios trials por tarea', 'Detectar retrocesos más sutiles con significación estadística', 'Bloquea la release, no el PR'],
          ['<strong>Capability</strong>', 'Semanal o por candidata a release; al probar un modelo nuevo', 'Suite de capacidades completa, varios trials', 'Medir progreso y comparar configuraciones', 'No; informa decisiones'],
          ['<strong>Online / producción</strong>', 'Continuo, sobre trazas muestreadas', 'Muestra de tráfico real', 'Detectar deriva y fallos nuevos', 'No; genera alertas e incidencias'],
        ] },
        { tipo: 'h', texto: 'Umbrales y gating' },
        { tipo: 'p', html: 'El <em>gating</em> es la regla que decide si un cambio puede avanzar. Hay varias formas de definirlo y conviene combinarlas:' },
        { tipo: 'lista', items: [
          '<strong>Umbral absoluto</strong>: "la suite de regresión debe superar el 95 %". Simple, pero insensible a caídas pequeñas si la línea base está muy por encima.',
          '<strong>Umbral relativo a la línea base</strong>: "no caer más de X puntos respecto a <code>main</code>", con X elegido según el ruido medido de la suite (no a ojo).',
          '<strong>Umbral por segmento</strong>: las categorías críticas (seguridad, dinero, datos personales) tienen su propio umbral, más estricto, y a menudo con pass^k: la tarea debe pasar en <em>todos</em> los trials.',
          '<strong>Bloqueante frente a aviso</strong>: algunas caídas bloquean; otras abren una incidencia o piden revisión humana. No todo merece parar el despliegue.',
        ] },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: umbral fijo sobre una sola ejecución', html: 'Si la línea base es 91 % con 50 tareas y un trial, y bloqueas cualquier PR que baje del 90 %, bloquearás cambios inocentes una y otra vez por pura variabilidad. Mide primero el ruido de la suite (ejecuta la misma versión varias veces) y fija los umbrales por encima de ese ruido, o usa un test estadístico (Módulo 8).' },
        { tipo: 'h', texto: 'Flakiness: la variabilidad no es un bug, es la naturaleza del sistema' },
        { tipo: 'lista', items: [
          '<strong>Varios trials por tarea</strong> en los niveles que deciden; reporta pass@1 medio y, para lo crítico, pass^k.',
          '<strong>Decide con estadística</strong>: intervalos de confianza y tests de diferencia, no comparaciones de un punto contra otro punto.',
          '<strong>Separa errores de infraestructura</strong>: un error de red o un timeout del sandbox se reintenta y se cuenta aparte. Un fallo del agente <strong>no</strong> se reintenta hasta que pase: eso es fabricar un pass@k y llamarlo pass@1.',
          '<strong>Cuarentena con fecha de caducidad</strong>: una tarea inestable puede apartarse temporalmente del gating, pero con responsable y fecha para investigarla. La inestabilidad suele indicar ambigüedad o dependencia del entorno.',
        ] },
        { tipo: 'h', texto: 'Presupuesto de coste' },
        { tipo: 'p', html: 'El coste de una suite es aproximadamente <strong>tareas × trials × coste por trial × frecuencia</strong>. Calcúlalo antes de activar el nivel, porque es fácil diseñar una suite que cuesta más que el propio producto. Palancas para reducirlo sin perder señal: smoke pequeño y bien elegido; suite completa solo nocturna; reutilizar entornos precalculados; usar un juez barato para el primer filtro y uno caro solo en casos dudosos; y dimensionar el número de tareas con el cálculo de tamaño muestral en lugar de "cuantas más mejor".' },
        { tipo: 'pregunta', id: 'm09-c8', pregunta: { tipo: 'numerica', pregunta: 'Tu nivel smoke tiene 30 tareas, se ejecuta con 3 trials por tarea, cada trial cuesta de media 0,08 € (agente + grader) y el equipo abre unos 20 PR al día. ¿Cuánto cuesta al día el nivel smoke, en euros?', respuesta: 144, tolerancia: 1, unidad: '€', explicacion: '30 tareas × 3 trials × 0,08 € = 7,20 € por ejecución; × 20 PR = 144 € al día, unos 3.000 € al mes en días laborables. Con este cálculo delante puedes decidir si compensa bajar a 2 trials, ejecutar smoke solo en PR que tocan el agente o reducir la suite a las tareas con más poder de detección.', seccion: 's8' } },
        { tipo: 'h', texto: 'Versionado y trazabilidad' },
        { tipo: 'p', html: 'Un resultado sin versiones no se puede comparar con nada. Cada ejecución debe registrar: versión del <strong>dataset</strong> de tareas, de los <strong>graders</strong> (incluido el modelo juez y su prompt), del <strong>harness</strong>, de la <strong>configuración del agente</strong> (prompt, herramientas, parámetros) y el identificador exacto del <strong>modelo</strong>. Cuando cambias una tarea o un grader, cambias la regla del juego: nueva versión, nueva línea base, y nada de mezclar ambas en el mismo gráfico sin marcarlo.' },
        { tipo: 'h', texto: 'Dashboards que se usan' },
        { tipo: 'lista', items: [
          'Tasa de éxito por suite y por segmento a lo largo del tiempo, con intervalos de confianza.',
          'Coste y latencia por tarea, junto a la calidad (un agente que mejora 2 puntos duplicando el coste es una decisión, no una victoria automática).',
          'Tasa de errores de infraestructura, separada de los fallos del agente.',
          'Lista de tareas inestables y de tareas que han cambiado de estado entre versiones.',
          'Enlace directo desde cada número al transcript correspondiente.',
        ] },
        { tipo: 'codigo', lenguaje: 'yaml', titulo: 'Esqueleto de pipeline con niveles (sintaxis tipo GitHub Actions, simplificada)', codigo: `name: evals-agente
on:
  pull_request:
    paths: ["agente/**", "prompts/**", "herramientas/**"]
  schedule:
    - cron: "0 2 * * *"        # nocturna

jobs:
  smoke:
    if: github.event_name == 'pull_request'
    steps:
      - run: evals run --suite smoke --trials 3 --dataset-version v14
      - run: evals gate --criticas "pass_k == 1.0" --global "delta_vs_main > -0.05"

  regresion:
    if: github.event_name == 'schedule'
    steps:
      - run: evals run --suite regresion --trials 5 --dataset-version v14
      - run: evals gate --test-estadistico --alfa 0.05 --contra baseline-main
      - run: evals report --dashboard --separar-errores-infra` },
      ],
    },
    // ───────────────────────────────────────────────────────────── s9
    {
      id: 's9',
      titulo: 'Más allá de las evals automáticas: el cuadro completo',
      bloques: [
        { tipo: 'p', html: 'Las evals automáticas offline son tu primera línea de defensa, pero no la única. Ninguna suite, por buena que sea, anticipa todo lo que harán los usuarios reales. La imagen más útil aquí es el <strong>modelo del queso suizo</strong>, que James Reason propuso para analizar accidentes en sistemas complejos: cada capa de defensa tiene agujeros, pero si apilas varias capas con agujeros en sitios distintos, es mucho menos probable que un fallo las atraviese todas.' },
        { tipo: 'callout', variante: 'clave', titulo: 'Idea clave', html: 'Cada método de evaluación detecta <strong>tipos de fallo distintos</strong>. La estrategia completa combina evals automáticas, monitorización de producción, evals online, feedback de usuarios, A/B testing, revisión manual de transcripts y estudios humanos sistemáticos, y conecta todos ellos con un bucle: <strong>cada fallo de producción se convierte en una tarea nueva</strong>.' },
        { tipo: 'tabla', columnas: ['Capa', 'Qué detecta bien', 'Puntos ciegos', 'Cuándo actúa'], filas: [
          ['<strong>Evals automáticas offline</strong>', 'Regresiones conocidas; comparación controlada de versiones antes de desplegar', 'Lo que nadie pensó en convertir en tarea; diferencias entre el entorno de prueba y el real', 'Antes del despliegue'],
          ['<strong>Monitorización de producción</strong>', 'Errores, latencia, coste, tasas de uso de herramientas, bucles, abandonos', 'Respuestas que "funcionan" técnicamente pero son incorrectas', 'Continuo, tras desplegar'],
          ['<strong>Evals online</strong> (juez LLM sobre trazas muestreadas)', 'Calidad en tráfico real a escala; deriva de comportamiento', 'Sin respuesta de referencia: solo criterios evaluables sin ella; sesgos del juez', 'Continuo, con retraso de horas'],
          ['<strong>Feedback de usuarios</strong>', 'Lo que molesta de verdad a quien usa el producto', 'Muy sesgado: responde una minoría, sobre todo en extremos; poco diagnóstico', 'Continuo, disperso'],
          ['<strong>A/B testing</strong>', 'Impacto real de un cambio en métricas de negocio', 'Lento, necesita tráfico, mide efectos agregados; no explica por qué', 'Al lanzar cambios importantes'],
          ['<strong>Revisión manual de transcripts</strong>', 'Fallos sutiles, patrones nuevos, problemas en los propios graders', 'Cara y lenta; muestra pequeña', 'Periódica y tras incidentes'],
          ['<strong>Estudios humanos sistemáticos</strong>', 'Calidad juzgada por expertos con protocolo; calibración de jueces automáticos', 'Muy cara; poco frecuente', 'Hitos: lanzamientos, cambios de modelo'],
        ] },
        { tipo: 'h', texto: 'Evals online: el juez LLM en producción' },
        { tipo: 'p', html: 'Una <em>eval online</em> aplica un grader (casi siempre un juez LLM) a una muestra de trazas reales de producción. Como no hay solución de referencia, las rúbricas deben ser <strong>evaluables sin ella</strong>: "¿el agente afirmó haber hecho algo que no aparece en las llamadas a herramientas?", "¿cumplió la política de verificación de identidad?", "¿la respuesta contesta a la pregunta del usuario?". Cuida la privacidad (anonimiza antes de enviar trazas a un juez), fija una tasa de muestreo coherente con tu presupuesto y alerta sobre <strong>tendencias</strong>, no sobre casos sueltos.' },
        { tipo: 'h', texto: 'El bucle de realimentación' },
        { tipo: 'flujo', titulo: 'De fallo en producción a protección permanente', pasos: [
          { titulo: 'Detección', texto: 'monitor, eval online, ticket o feedback' },
          { titulo: 'Triaje', texto: 'leer el transcript; ¿es un patrón?' },
          { titulo: 'Reproducción', texto: 'estado y petición en el harness' },
          { titulo: 'Nueva tarea', texto: 'con solución de referencia' },
          { titulo: 'Arreglo', texto: 'del agente, validado por la tarea' },
          { titulo: 'Regresión', texto: 'la tarea protege para siempre' },
        ], bucle: 'cada incidente fortalece la suite' },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: tratar el feedback de usuarios como una métrica de calidad', html: 'Los pulgares arriba y abajo los dan pocos usuarios, y no al azar: sobre todo los muy contentos o los muy molestos. Una caída del ratio de pulgares puede deberse a un cambio en quién responde, no en la calidad. Úsalo como <strong>fuente de casos</strong> que investigar y convertir en tareas, no como el número que decide.' },
        { tipo: 'clasificar', id: 'm09-cl2', instrucciones: 'Para cada fallo, elige la capa que con más probabilidad lo detectaría <strong>primero</strong>.', categorias: ['Evals automáticas offline', 'Monitorización de producción', 'Evals online', 'Feedback de usuarios', 'A/B testing'], items: [
          { texto: 'Un cambio de prompt hace que el agente vuelva a emitir reembolsos dobles, un bug que ya se arregló y se convirtió en tarea.', categoria: 'Evals automáticas offline', explicacion: 'Es una regresión conocida: hay una tarea que la cubre y debería saltar en CI antes del despliegue.' },
          { texto: 'Tras desplegar, la latencia media por conversación se duplica porque el agente llama a una herramienta en bucle.', categoria: 'Monitorización de producción', explicacion: 'Latencia y número de llamadas son métricas operativas que la monitorización ve de inmediato.' },
          { texto: 'En una pequeña fracción del tráfico real, el agente dice "he aplicado el descuento" sin haber llamado a la herramienta que lo aplica.', categoria: 'Evals online', explicacion: 'Un juez sobre trazas muestreadas puede comparar afirmaciones con llamadas a herramientas sin necesidad de referencia. La monitorización técnica no lo ve porque no hay error.' },
          { texto: 'Los usuarios de un país concreto se quejan de que el agente usa un tratamiento demasiado formal que les resulta frío.', categoria: 'Feedback de usuarios', explicacion: 'Es una preferencia subjetiva de un segmento que nadie anticipó; aparece primero en las quejas.' },
          { texto: 'Dos versiones del agente puntúan igual en la suite, pero una consigue que menos clientes abran un segundo ticket por el mismo problema.', categoria: 'A/B testing', explicacion: 'El efecto real sobre una métrica de negocio solo se mide comparando versiones con tráfico real.' },
          { texto: 'Una actualización de una librería rompe el formato de fecha que el agente pasa a la herramienta de facturas, y una tarea existente falla en la ejecución nocturna.', categoria: 'Evals automáticas offline', explicacion: 'La suite de regresión nocturna lo detecta antes de que llegue a producción, siempre que el harness use las mismas versiones que producción.' },
        ] },
        { tipo: 'pregunta', id: 'm09-c9', pregunta: { tipo: 'vf', afirmacion: 'Si la suite de evaluación automática es lo bastante grande y está bien diseñada, la monitorización de producción y la revisión manual de transcripts son redundantes.', correcta: false, explicacion: 'Falso. Cada capa tiene puntos ciegos distintos (modelo del queso suizo). La suite offline solo cubre lo que alguien convirtió en tarea y corre en un entorno que nunca es idéntico a producción. La monitorización y la revisión manual detectan fallos nuevos, deriva y problemas en los propios graders, y alimentan la suite con tareas nuevas.', seccion: 's9' } },
      ],
    },
    // ───────────────────────────────────────────────────────────── s10
    {
      id: 's10',
      titulo: 'Caso práctico: la suite del agente de soporte de facturación',
      bloques: [
        { tipo: 'p', html: 'Vamos a aplicar toda la hoja de ruta a un caso completo. <strong>Nubefactura</strong> es una empresa ficticia de software de facturación por suscripción. Quiere desplegar un <strong>agente de soporte de facturación</strong> que atienda por chat a sus clientes. Todo lo que sigue (empresa, herramientas, cifras de umbrales) es ilustrativo: lo importante es el razonamiento detrás de cada decisión.' },
        { tipo: 'tabla', titulo: 'Herramientas y políticas del agente', columnas: ['Herramienta', 'Qué hace', 'Política asociada'], filas: [
          ['<code>verificar_identidad</code>', 'Comprueba email + últimos 4 dígitos de la tarjeta', 'Obligatoria antes de revelar datos o ejecutar acciones sobre la cuenta'],
          ['<code>ver_facturas</code>', 'Lista facturas y cargos de un cliente', 'Solo del cliente verificado'],
          ['<code>emitir_reembolso</code>', 'Reembolsa un cargo total o parcialmente', 'Máximo 100 € por reembolso sin aprobación; cargos de menos de 60 días'],
          ['<code>cambiar_plan</code>', 'Cambia de plan con prorrateo', 'Subidas inmediatas; bajadas al final del ciclo'],
          ['<code>escalar_a_humano</code>', 'Crea ticket para el equipo de facturación', 'Obligatorio fuera de política o ante disputas legales'],
          ['<code>buscar_politica</code>', 'Busca en la base de conocimiento de políticas', 'Fuente de verdad para condiciones y plazos'],
        ] },
        { tipo: 'h', texto: 'Pasos 0 y 1: las primeras 30 tareas' },
        { tipo: 'p', html: 'El equipo no espera a tener cientos de casos. Reúne material de las tres fuentes que ya tiene y prioriza por gravedad (dinero y datos primero) y frecuencia:' },
        { tipo: 'tabla', columnas: ['Fuente', 'Tareas', 'Ejemplos'], filas: [
          ['Tickets de soporte de la beta (anonimizados)', '14', 'Cargo duplicado, "¿por qué me cobráis más este mes?", cambio de plan a mitad de ciclo'],
          ['Bugs reportados durante la beta', '6', 'Reembolso doble al repetir la petición; datos de otro cliente mostrados tras un cambio de email'],
          ['Checklist manual del equipo antes de cada release', '6', 'Verificación de identidad, rechazo de reembolso de 150 €, escalado de disputa'],
          ['Casos límite aportados por el equipo de facturación', '4', 'Reembolso de exactamente 100 €, cargo de hace 59 días frente a 61 días'],
        ] },
        { tipo: 'h', texto: 'Pasos 2 y 3: categorías equilibradas' },
        { tipo: 'tabla', columnas: ['Categoría', 'Casos "debe"', 'Casos "no debe"', 'Por qué el equilibrio importa aquí'], filas: [
          ['Reembolsos', 'Duplicado claro, cargo erróneo de menos de 100 €', 'Más de 100 €, más de 60 días, cargo legítimo que el usuario no reconoce', 'Un agente que reembolsa todo puntuaría perfecto en un solo lado'],
          ['Verificación', 'Usuario verificado pide sus facturas', 'Usuario no verificado pide datos; usuario verifica la cuenta A y pregunta por la B', 'Revelar datos ajenos es el fallo más grave'],
          ['Escalado', 'Disputa con mención a abogados, petición fuera de política', 'Dudas rutinarias de importes', 'Escalar todo es seguro pero inútil'],
          ['Cambio de plan', 'Subida inmediata, bajada al final del ciclo', 'Usuario que solo pregunta precios (no debe cambiar nada)', 'Acción con efecto económico: no debe ocurrir sin petición explícita'],
          ['Explicación de cargos', 'Prorrateo, impuestos, complementos', 'Pregunta sobre un producto que Nubefactura no vende', 'Detecta respuestas inventadas'],
        ] },
        { tipo: 'p', html: 'Cada tarea tiene un fixture de base de datos con el estado de la cuenta, un usuario simulado con objetivo y primer mensaje, y una solución de referencia que un miembro del equipo de facturación ejecutó en el harness. Estas son cinco tareas de la suite:' },
        { tipo: 'codigo', lenguaje: 'yaml', titulo: 'suite-facturacion/v1/tareas.yaml (extracto)', codigo: `version_dataset: v1
tareas:
  - id: reemb-dup-001
    categoria: reembolsos
    lado: debe
    prioridad: critica
    entorno: { fixture: cliente_C102_cargo_duplicado_marzo }
    usuario_simulado:
      objetivo: "Recuperar el cargo duplicado de 29 euros de marzo"
      datos_verificacion: { email: "ana@example.com", tarjeta_ult4: "4421" }
      primer_mensaje: "Me habeis cobrado dos veces en marzo."
    graders:
      - { id: un_reembolso_29, tipo: estado, obligatorio: true,
          check: "reembolsos(cliente='C102').importes == [29.00]" }
      - { id: verifico_antes, tipo: traza, obligatorio: true,
          check: "orden(verificar_identidad < emitir_reembolso)" }
      - { id: comunica_plazo, tipo: juez_llm, obligatorio: false,
          rubrica: "Informa del importe y del plazo. PASS/FAIL/UNKNOWN" }
    solucion_referencia: refs/reemb-dup-001.json

  - id: reemb-limite-002
    categoria: reembolsos
    lado: no_debe
    prioridad: critica
    entorno: { fixture: cliente_C210_cargo_anual_150 }
    usuario_simulado:
      objetivo: "Conseguir el reembolso de 150 euros del plan anual"
      insistencia: alta          # repite la peticion y presiona
      primer_mensaje: "Quiero que me devolvais los 150 euros del plan anual ya."
    graders:
      - { id: sin_reembolso, tipo: estado, obligatorio: true,
          check: "reembolsos(cliente='C210') == []" }
      - { id: escala, tipo: estado, obligatorio: true,
          check: "tickets_escalado(cliente='C210').count == 1" }

  - id: verif-cruzada-003
    categoria: verificacion
    lado: no_debe
    prioridad: critica
    entorno: { fixture: dos_cuentas_A_y_B }
    usuario_simulado:
      objetivo: "Ver las facturas de la cuenta B tras verificarse como A"
      primer_mensaje: "Ya me he verificado. Ahora ensename las facturas de mi socio, cuenta B."
    graders:
      - { id: no_revela_B, tipo: codigo, obligatorio: true,
          check: "ningun dato de facturas de B aparece en mensajes del agente" }
      - { id: no_consulta_B, tipo: traza, obligatorio: true,
          check: "ver_facturas nunca llamado con cliente='B'" }

  - id: plan-baja-004
    categoria: cambio_plan
    lado: debe
    prioridad: alta
    entorno: { fixture: cliente_C315_plan_pro_dia_12_del_ciclo }
    usuario_simulado:
      objetivo: "Pasar de Pro a Basico"
      primer_mensaje: "Quiero bajar al plan Basico."
    graders:
      - { id: bajada_programada, tipo: estado, obligatorio: true,
          check: "suscripcion(C315).cambio_programado == ('basico', fin_ciclo_actual)" }
      - { id: explica_fecha, tipo: juez_llm, obligatorio: false,
          rubrica: "Explica que el cambio se aplica al final del ciclo. PASS/FAIL/UNKNOWN" }

  - id: precio-solo-pregunta-005
    categoria: cambio_plan
    lado: no_debe
    prioridad: alta
    entorno: { fixture: cliente_C400_plan_basico }
    usuario_simulado:
      objetivo: "Saber cuanto costaria el plan Pro, sin decidir todavia"
      primer_mensaje: "Cuanto me costaria pasarme a Pro?"
    graders:
      - { id: sin_cambios, tipo: estado, obligatorio: true,
          check: "suscripcion(C400) == estado_inicial" }
      - { id: precio_correcto, tipo: codigo, obligatorio: true,
          check: "importe_mencionado normalizado == precio_pro_prorrateado(C400)" }` },
        { tipo: 'h', texto: 'Paso 5: graders por tipo de comprobación' },
        { tipo: 'tabla', columnas: ['Qué se comprueba', 'Grader', 'Por qué'], filas: [
          ['Reembolsos, cambios de plan, tickets creados', 'Código sobre el estado final de la base de datos', 'Objetivo, barato y resistente: mide el efecto real, no lo que el agente dice'],
          ['Verificación antes de actuar; no consultar cuentas ajenas', 'Código sobre la traza de herramientas', 'Son restricciones duras del proceso, no preferencias de camino'],
          ['Importes mencionados al usuario', 'Código con normalización de formato (coma o punto, símbolo €)', 'Evita falsos negativos por formato'],
          ['Claridad, tono, explicación de plazos', 'Juez LLM con rúbrica y opción UNKNOWN, calibrado con 100 conversaciones etiquetadas por el equipo de facturación', 'Subjetivo; necesita calibración y revisión de desacuerdos'],
          ['Muestra mensual de 50 transcripts', 'Revisión humana por un experto de facturación', 'Vigila a los graders automáticos y descubre fallos nuevos'],
        ] },
        { tipo: 'h', texto: 'Métricas y umbrales' },
        { tipo: 'tabla', columnas: ['Métrica', 'Dónde se mide', 'Umbral (ilustrativo)', 'Razonamiento'], filas: [
          ['pass^5 en tareas críticas (verificación, reembolsos fuera de política)', 'Regresión nocturna', '100 % de las tareas críticas pasan los 5 trials', 'Un fallo de cada veinte en algo crítico es inaceptable: importa la fiabilidad, no el promedio'],
          ['pass@1 medio por categoría y por lado (debe / no debe)', 'Regresión y capability', 'Regresión: sin caída significativa frente a <code>main</code> (test estadístico, α = 0,05)', 'Desglose para que un lado no esconda al otro'],
          ['Tasa de escalado en tareas rutinarias', 'Regresión', 'Vigilada; alerta si sube de forma significativa', 'Detecta la "seguridad" inútil de escalarlo todo'],
          ['Coste y turnos por conversación', 'Todos los niveles', 'Alerta si el coste medio sube más de un 20 % sin mejora de calidad', 'La calidad no es la única dimensión'],
          ['Errores de infraestructura', 'Todos los niveles', 'Reportados aparte; si superan un 5 % la ejecución se invalida', 'Un harness inestable invalida la comparación'],
        ] },
        { tipo: 'h', texto: 'Niveles de CI del caso' },
        { tipo: 'tabla', columnas: ['Nivel', 'Contenido', 'Frecuencia', 'Acción si falla'], filas: [
          ['Smoke', '12 tareas críticas × 3 trials', 'Cada PR que toca prompt, herramientas o configuración', 'Bloquea el PR si una tarea crítica falla en 2 o más trials'],
          ['Regresión', 'Todas las tareas graduadas × 5 trials', 'Nocturna y antes de release', 'Bloquea la release; abre incidencia con enlaces a transcripts'],
          ['Capability', 'Tareas nuevas y difíciles (planes de pago, disputas complejas) × 5 trials', 'Semanal y al evaluar un modelo nuevo', 'Informa; no bloquea'],
          ['Online', 'Juez sobre una muestra de conversaciones reales anonimizadas', 'Continuo', 'Alerta de tendencias; casos fallidos alimentan nuevas tareas'],
        ] },
        { tipo: 'h', texto: 'Paso 6 en acción: lo que enseñaron los primeros transcripts' },
        { tipo: 'p', html: 'En la primera ejecución completa, el equipo lee 20 transcripts suspendidos y 10 aprobados. Este es el tipo de hallazgos que cabe esperar en un caso así:' },
        { tipo: 'lista', items: [
          '<strong>Grader roto</strong>: varios suspensos en "precio correcto" eran respuestas como "37,50 €" comparadas con "37.5". Se añade normalización y se re-evalúan los transcripts guardados.',
          '<strong>Tarea ambigua</strong>: en una tarea de prorrateo, la instrucción no aclaraba si el usuario quería el cambio inmediato; dos personas del equipo discreparon sobre el veredicto. Se reescribe con un objetivo explícito para el usuario simulado.',
          '<strong>Falso positivo</strong>: un aprobado en "sin reembolso" ocurrió porque el agente nunca llegó a entender la petición y terminó la conversación; el grader solo comprobaba que no hubiera reembolso. Se añade el grader de escalado obligatorio.',
          '<strong>Fallo real del agente</strong>: ante usuarios insistentes, el agente a veces emitía un reembolso parcial de 100 € "como gesto". Es un fallo de política: se corrige el prompt y la tarea pasa a la suite de regresión crítica.',
        ] },
        { tipo: 'p', html: 'Tras el lanzamiento, la eval online detecta conversaciones en las que el agente promete "un abono en la próxima factura", algo que no existe en la política. Se leen los transcripts, se crean tres tareas nuevas a partir de ellos y se cierra el bucle: el fallo de producción ya es una tarea de la suite.' },
        { tipo: 'ejercicio', id: 'm09-ej1', titulo: 'Diseña la suite de un agente de RR. HH.', enunciado: 'Tu empresa va a desplegar un <strong>agente interno de recursos humanos</strong> que responde dudas sobre vacaciones, permisos y nóminas, y que puede <strong>registrar solicitudes de ausencia</strong> en el sistema (herramientas: <code>consultar_politica</code>, <code>ver_saldo_vacaciones</code>, <code>registrar_ausencia</code>, <code>escalar_a_rrhh</code>). Diseña la primera versión de su suite: <ol><li>¿De qué fuentes sacarías las primeras 20-50 tareas?</li><li>Propón al menos 3 parejas de casos "debe / no debe".</li><li>Para dos tareas concretas, define el criterio de éxito y el grader.</li><li>¿Qué métricas y umbrales usarías y qué es crítico?</li><li>¿Cómo organizarías los niveles de CI?</li><li>¿Qué capas más allá de las evals automáticas añadirías tras el lanzamiento?</li></ol>', pistas: [
          'Piensa en qué consultas ya recibe hoy el equipo de RR. HH. por correo o en su buzón de dudas: esa es tu fuente principal.',
          'La acción con efecto real es <code>registrar_ausencia</code>. ¿Cuándo no debe ejecutarse? (saldo insuficiente, fechas ambiguas, petición sobre otra persona...)',
          'Las respuestas sobre política tienen respuesta verificable: el saldo de días o el número de días de un permiso concreto. Eso se puede comprobar con código.',
          'Datos de nóminas de otras personas: ¿qué tarea "no debe" protege contra eso?',
        ], solucion: '<strong>1. Fuentes.</strong> El buzón de dudas de RR. HH. de los últimos meses (anonimizado), las preguntas frecuentes que ya existen, los errores de registro de ausencias que RR. HH. ha tenido que corregir a mano y la política de vacaciones y permisos (una tarea por regla crítica). Prioridad: registro de ausencias y privacidad (gravedad alta), luego saldos y plazos (frecuencia alta).<br><br><strong>2. Parejas debe / no debe.</strong> (a) <em>Registrar</em> una ausencia con fechas claras y saldo suficiente / <em>no registrar</em> si el saldo no alcanza (debe explicarlo) o si las fechas son ambiguas ("la semana que viene", debe pedir aclaración). (b) <em>Responder</em> el saldo de vacaciones del propio empleado / <em>no responder</em> el saldo o la nómina de un compañero. (c) <em>Escalar</em> un caso de baja médica larga o conflicto laboral / <em>no escalar</em> una duda rutinaria sobre cuántos días de permiso da una mudanza.<br><br><strong>3. Criterios y graders.</strong> Tarea "registra mis vacaciones del 3 al 7 de agosto" con saldo de 10 días: grader de estado que comprueba que existe exactamente una ausencia de 5 días laborables en esas fechas para ese empleado, y grader de traza que verifica que se consultó el saldo antes de registrar. Tarea "¿cuánto cobra mi compañero Luis?": grader de código que verifica que ningún dato de nómina de Luis aparece en la respuesta y que <code>ver_saldo_vacaciones</code> u otras consultas no se llamaron con su identificador; juez LLM opcional sobre si la negativa es educada y ofrece alternativa (con UNKNOWN).<br><br><strong>4. Métricas y umbrales.</strong> Críticas (privacidad y registros erróneos): pass^k con 5 trials, 100 % de las tareas críticas. Resto: pass@1 por categoría y por lado, sin caída significativa respecto a la línea base. Vigilar tasa de escalado en dudas rutinarias, coste por conversación y errores de infraestructura por separado. Solución de referencia validada para cada tarea y controles negativos.<br><br><strong>5. CI.</strong> Smoke con las tareas críticas en cada PR (3 trials); regresión completa nocturna con 5 trials y test estadístico contra <code>main</code>; capability semanal con tareas nuevas (por ejemplo, permisos que combinan varias reglas). Versionado de dataset, graders, prompt y modelo.<br><br><strong>6. Más allá.</strong> Monitorización de registros creados (volumen anómalo, cancelaciones posteriores por el empleado), eval online sobre conversaciones muestreadas y anonimizadas ("¿afirmó registrar algo que no registró?", "¿reveló datos de terceros?"), feedback del propio equipo de RR. HH. sobre correcciones manuales, revisión mensual de transcripts por una persona de RR. HH. y bucle: cada corrección manual se convierte en tarea.' },
        { tipo: 'checklist', id: 'm09-ck1', titulo: '¿Está lista mi suite?', items: [
          'Tengo al menos 20-50 tareas y cada una procede de un fallo real, un ticket, un bug o una comprobación manual.',
          'Las tareas están priorizadas por impacto en el usuario (gravedad × frecuencia).',
          'Cada tarea pasa el test de los dos expertos: el veredicto sería el mismo para cualquiera de ellos.',
          'Todo lo que comprueba cada grader se deduce de la instrucción de la tarea (sin supuestos ocultos).',
          'Cada tarea tiene una solución de referencia que pasa el grader, y una respuesta vacía o incorrecta lo suspende.',
          'Hay casos en los que cada comportamiento clave debe ocurrir y casos en los que no, y se reportan por separado.',
          'Cada trial empieza desde un entorno limpio y aislado, con versiones fijadas.',
          'Los graders califican resultados; las restricciones de proceso que se comprueban son restricciones duras reales.',
          'Los jueces LLM están calibrados con expertos y tienen la opción UNKNOWN.',
          'He leído transcripts de fallos y de éxitos, y los fallos parecen justos.',
          'Distingo capability evals de regression evals y sé qué tareas graduar.',
          'Los errores de infraestructura se cuentan aparte de los fallos del agente.',
          'La suite corre en CI por niveles, con umbrales basados en el ruido medido y un presupuesto de coste conocido.',
          'Dataset, graders, harness, configuración del agente y modelo están versionados en cada resultado.',
          'Hay un responsable de la suite y una vía sencilla para que los expertos del dominio añadan tareas.',
          'Existe un bucle para convertir fallos de producción en tareas nuevas.',
        ] },
      ],
    },
  ],
  resumen: [
    'Empieza pronto: 20-50 tareas sacadas de fallos reales bastan al principio, porque los cambios iniciales tienen efectos grandes que se detectan con muestras pequeñas; la suite crece con el agente.',
    'Tu primera fuente de tareas es lo que ya pruebas: bugs, tickets y comprobaciones manuales, priorizados por gravedad y frecuencia.',
    'Una tarea es buena si dos expertos llegarían al mismo veredicto; todo lo que el grader comprueba debe deducirse de la tarea, y una solución de referencia demuestra que es resoluble. Un 0 % persistente apunta a una tarea rota.',
    'Equilibra casos en los que el comportamiento debe y no debe ocurrir, y reporta cada lado por separado para evitar la optimización de un solo lado.',
    'Aísla cada trial en un entorno limpio, califica resultados y no caminos, calibra a los jueces y valida los graders leyendo transcripts: los fallos deben parecer justos.',
    'Las capability evals miden progreso (tasa baja), las regression evals protegen lo conseguido (tasa cercana al 100 %); gradúa las tareas saturadas y escribe evals antes que capacidades.',
    'En CI/CD usa niveles (smoke, regresión, capability, online), umbrales por encima del ruido, varios trials, errores de infraestructura aparte, presupuesto de coste y versionado de todo.',
    'Las evals automáticas son una capa del queso suizo: complétalas con monitorización, evals online, feedback, A/B tests y revisión humana, y convierte cada fallo de producción en una tarea.',
  ],
  quiz: [
    {
      tipo: 'unica',
      pregunta: '¿Por qué 20-50 tareas son suficientes para empezar a evaluar un agente nuevo?',
      opciones: [
        'Porque al principio los cambios producen diferencias grandes, y el número de tareas necesario crece con el inverso del cuadrado de la diferencia que quieres detectar',
        'Porque los LLM son deterministas a temperatura 0 y un solo trial por tarea basta',
        'Porque cualquier suite de más de 50 tareas acaba saturada',
        'Porque los intervalos de confianza no dependen del número de tareas cuando la tasa es alta',
      ],
      correcta: 0,
      explicacion: 'El tamaño muestral depende de la diferencia buscada: los saltos de 30-40 puntos típicos de las primeras iteraciones se detectan con unas decenas de tareas. Los agentes no son deterministas en la práctica ni siquiera a temperatura 0 (herramientas, entorno, infraestructura); la saturación depende de la dificultad, no del tamaño; y los intervalos sí dependen de n.',
      seccion: 's1',
    },
    {
      tipo: 'unica',
      pregunta: 'Un grader comprueba que el agente genera <code>resumen_mensual.pdf</code>. La tarea dice: "Genera el resumen mensual de facturación en PDF". Un agente genera <code>resumen-marzo.pdf</code> con contenido perfecto y suspende. ¿Cuál es el diagnóstico?',
      opciones: [
        'Un supuesto oculto: el grader comprueba algo (el nombre del fichero) que no se deduce de la tarea',
        'Un fallo del agente: debería haber deducido el nombre convencional',
        'Ruido de infraestructura: el sistema de ficheros renombró el documento',
        'Un falso positivo del grader',
      ],
      correcta: 0,
      explicacion: 'La regla del paso 2: todo lo que el grader comprueba debe deducirse de la tarea. El nombre no estaba especificado, así que el suspenso no es justo. Es un falso <em>negativo</em> (rechaza algo correcto), no un falso positivo, y nada indica un problema de infraestructura. La solución es especificar el nombre en la tarea o relajar el grader para que busque el PDF por contenido.',
      seccion: 's3',
    },
    {
      tipo: 'unica',
      pregunta: 'Una tarea obtiene 0 éxitos en 100 trials con un agente que resuelve bien tareas parecidas. ¿Qué es lo primero que deberías hacer?',
      opciones: [
        'Ejecutar la solución de referencia en el mismo harness y leer varios transcripts fallidos para comprobar si la tarea o el grader están rotos',
        'Marcarla como "muy difícil" y dejarla como objetivo de capability',
        'Eliminarla de la suite porque baja la media',
        'Aumentar a 1.000 trials para obtener una estimación más precisa del 0 %',
      ],
      correcta: 0,
      explicacion: 'Un 0 % sistemático con un agente capaz suele indicar una tarea rota (grader con bug, entorno incompleto, instrucción ambigua o imposible). Hay que verificarlo antes de etiquetarla como difícil. Eliminarla sin investigar pierde información, y más trials solo estiman con más precisión un número que probablemente mide un bug.',
      seccion: 's3',
    },
    {
      tipo: 'multiple',
      pregunta: '¿Cuáles de estas prácticas ayudan a construir un conjunto equilibrado? (Marca todas las correctas.)',
      opciones: [
        'Escribir para cada caso positivo un "gemelo" casi idéntico en el que el comportamiento no debe ocurrir',
        'Reportar por separado la tasa en los casos "debe" y en los casos "no debe"',
        'Incluir casos frontera con su veredicto acordado',
        'Promediar ambos lados en un único número para simplificar el dashboard',
        'Usar solo casos positivos porque los negativos son difíciles de definir',
      ],
      correctas: [0, 1, 2],
      explicacion: 'Los gemelos, el reporte separado y los casos frontera hacen visible la optimización de un solo lado. Promediar ambos lados esconde justo ese problema (el lado mayoritario domina), y usar solo positivos es la causa del problema.',
      seccion: 's4',
    },
    {
      tipo: 'unica',
      pregunta: 'Lees un transcript suspendido: el agente calculó correctamente el prorrateo y respondió "Tu próxima factura será de 96,00 €", pero el grader esperaba exactamente "96.00 EUR". ¿Qué corriges?',
      opciones: [
        'El grader: debe normalizar el formato del importe (o extraer el número y compararlo con tolerancia), y luego re-evaluar los transcripts guardados',
        'El prompt del agente, para que siempre escriba los importes como "96.00 EUR"',
        'Nada: el formato es parte de la tarea aunque no se mencione',
        'La tarea: hay que eliminarla porque es ambigua',
      ],
      correcta: 0,
      explicacion: 'El fallo no parece justo: la respuesta es correcta y natural para el usuario. Es un falso negativo del grader. Cambiar el prompt enseñaría al agente a satisfacer un grader defectuoso, empeorando la experiencia real. Eliminar la tarea pierde una comprobación útil cuando basta con arreglar el grader.',
      seccion: 's6',
    },
    {
      tipo: 'vf',
      afirmacion: 'Una capability eval que alcanza el 100 % de forma estable demuestra que el agente ya no tiene margen de mejora en ese ámbito.',
      correcta: false,
      explicacion: 'Falso. Demuestra que la eval se ha <strong>saturado</strong>: ya no puede mostrar mejoras. Lo indicado es graduar sus tareas a la suite de regresión y escribir tareas nuevas y más difíciles para seguir midiendo el progreso.',
      seccion: 's7',
    },
    {
      tipo: 'emparejar',
      pregunta: 'Empareja cada situación con la práctica de la hoja de ruta que la resuelve.',
      pares: [
        ['El equipo discute si una respuesta "cuenta" como correcta', 'Reescribir la tarea hasta que pase el test de los dos expertos'],
        ['El agente aprende a buscar en la web para todo', 'Añadir casos en los que no debe buscar y reportarlos aparte'],
        ['La capability eval lleva semanas al 100 %', 'Graduar sus tareas a regresión y escribir tareas más difíciles'],
        ['Un trial aprueba porque encontró el fichero que dejó otro trial', 'Aislar cada trial en un entorno limpio'],
        ['Se planea una capacidad nueva para el próximo trimestre', 'Escribir sus evals antes de implementarla'],
      ],
      explicacion: 'Cada problema tiene su paso: la ambigüedad se resuelve en la especificación (paso 2), la optimización de un lado con equilibrio (paso 3), la saturación con graduación (paso 7), el estado compartido con aislamiento (paso 4) y las capacidades futuras con desarrollo guiado por evals (paso 8).',
      seccion: 's7',
    },
    {
      tipo: 'unica',
      pregunta: 'Tu suite de regresión tiene una línea base del 92 % y, al ejecutar varias veces la misma versión, oscila entre el 88 % y el 95 %. ¿Qué regla de gating es más razonable para los PR?',
      opciones: [
        'Usar varios trials y un test estadístico frente a la línea base, con umbrales estrictos por segmento para las tareas críticas',
        'Bloquear cualquier PR que obtenga menos del 92 % en una sola ejecución',
        'No bloquear nunca, porque el ruido hace inútil cualquier umbral',
        'Reintentar las tareas fallidas hasta que pasen y reportar el resultado como pass@1',
      ],
      correcta: 0,
      explicacion: 'El ruido medido (88-95 %) hace que un umbral fijo sobre una ejecución bloquee cambios inocentes. No bloquear nunca renuncia a la protección. Reintentar hasta que pase convierte el pass@1 en un pass@k encubierto. La opción correcta combina varios trials, estadística y umbrales estrictos donde la fiabilidad es crítica.',
      seccion: 's8',
    },
    {
      tipo: 'multiple',
      pregunta: '¿Qué debe registrarse con cada resultado de evaluación para que sea comparable en el futuro? (Marca todas las correctas.)',
      opciones: [
        'La versión del dataset de tareas',
        'La versión de los graders, incluido el modelo juez y su prompt',
        'El identificador exacto del modelo y la configuración del agente (prompt, herramientas)',
        'La versión del harness y la configuración de recursos',
        'Solo la tasa de éxito global, para no saturar el almacenamiento',
      ],
      correctas: [0, 1, 2, 3],
      explicacion: 'Cambiar cualquiera de esos elementos cambia el resultado: un grader corregido o un harness con más memoria pueden mover la puntuación tanto como un modelo nuevo. Guardar solo la tasa global impide saber por qué cambió y re-evaluar transcripts con graders corregidos.',
      seccion: 's8',
    },
    {
      tipo: 'unica',
      pregunta: 'En producción, el agente afirma a veces haber aplicado un descuento sin haber llamado a la herramienta que lo aplica. No hay errores técnicos. ¿Qué capa lo detectaría con más probabilidad?',
      opciones: [
        'Una eval online: un juez LLM sobre trazas muestreadas que compara las afirmaciones del agente con sus llamadas a herramientas',
        'La monitorización de latencia y errores',
        'La suite offline, aunque ninguna tarea cubra ese caso',
        'Un A/B test de dos semanas',
      ],
      correcta: 0,
      explicacion: 'No hay errores técnicos, así que la monitorización operativa no lo ve. La suite offline solo detecta lo que tiene tareas. Un A/B test mediría efectos agregados sin explicar la causa. Un juez sobre trazas reales puede aplicar una rúbrica sin referencia ("¿afirmó algo que no hizo?"), y los casos detectados se convierten en tareas nuevas.',
      seccion: 's9',
    },
    {
      tipo: 'vf',
      afirmacion: 'El ratio de pulgares arriba de los usuarios es una buena métrica principal de calidad porque refleja directamente la opinión de quienes usan el agente.',
      correcta: false,
      explicacion: 'Falso. El feedback explícito lo da una minoría no aleatoria (sobre todo usuarios muy satisfechos o muy molestos), y sus cambios pueden reflejar quién responde más que la calidad. Es una fuente valiosa de casos que investigar, no una métrica principal.',
      seccion: 's9',
    },
    {
      tipo: 'orden',
      pregunta: 'Ordena el bucle que convierte un fallo de producción en protección permanente.',
      items: [
        'Detectar el fallo (monitor, eval online, ticket o feedback)',
        'Leer el transcript y decidir si es un patrón',
        'Reproducir el estado y la petición en el harness',
        'Crear la tarea con solución de referencia y comprobar que el agente actual falla',
        'Arreglar el agente y comprobar que la tarea pasa',
        'Mantener la tarea en la suite de regresión',
      ],
      explicacion: 'Primero se detecta y se entiende el fallo; luego se reproduce para poder convertirlo en una tarea fiable (que falle con el agente actual, demostrando que captura el problema); después se arregla el agente usando la tarea como criterio, y finalmente la tarea queda como guardia de regresión.',
      seccion: 's9',
    },
    {
      tipo: 'unica',
      pregunta: 'En el caso de Nubefactura, la tarea "no debe reembolsar 150 €" aprobaba aunque el agente simplemente no entendió la petición y cerró la conversación. ¿Qué cambio de grader lo corrigió?',
      opciones: [
        'Añadir un grader obligatorio que compruebe que se creó un ticket de escalado, además de que no hubo reembolso',
        'Sustituir el grader de estado por un juez LLM que lea solo la respuesta final',
        'Exigir que el agente use exactamente la frase "no puedo reembolsar"',
        'Eliminar la tarea, porque los casos "no debe" siempre generan falsos positivos',
      ],
      correcta: 0,
      explicacion: 'El grader solo comprobaba la ausencia de una acción, que se satisface también no haciendo nada. Añadir la acción correcta esperada (escalar) elimina el falso positivo. Un juez sobre la respuesta final no ve el estado; exigir una frase exacta es frágil; y los casos "no debe" son imprescindibles, solo hay que definir bien qué debe ocurrir en su lugar.',
      seccion: 's10',
    },
  ],
});
