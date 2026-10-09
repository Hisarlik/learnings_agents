registrarModulo({
  id: 'm02',
  numero: 2,
  titulo: 'Anatomía de una evaluación: vocabulario y piezas',
  subtitulo: 'Aprende a nombrar con precisión cada pieza de una evaluación de agentes y a ver cómo encajan, desde la tarea hasta el informe.',
  duracion: '70 min',
  nivel: 'Básico',
  objetivos: [
    'Descomponer un agente en modelo, harness del agente y entorno, y explicar por qué se evalúan juntos',
    'Usar con precisión los términos tarea, ensayo, transcript, resultado, grader, suite y harness de evaluación',
    'Distinguir lo que el agente dice que hizo (transcript) de lo que realmente cambió en el mundo (resultado)',
    'Describir el ciclo de vida completo de una ejecución de evaluación, del dataset al informe',
    'Escribir la especificación de una tarea con entorno, límites, graders y métricas',
    'Elegir la unidad de análisis (ensayo, tarea, suite, segmento) y el nivel de evaluación (unitaria, integración, extremo a extremo)',
  ],
  secciones: [
    // ───────────────────────────────────────────────────────────── s1
    {
      id: 's1',
      titulo: '¿Qué estamos evaluando exactamente?',
      bloques: [
        { tipo: 'p', html: `Antes de hablar de métricas, <em>graders</em> o benchmarks necesitamos responder una pregunta que parece trivial y no lo es: <strong>¿qué objeto estamos evaluando?</strong> Cuando alguien dice «hemos evaluado el agente X y resuelve el 62 % de las tareas», ese 62 % no es una propiedad del modelo de lenguaje que hay dentro. Es una propiedad de un <em>sistema</em> completo funcionando dentro de un <em>entorno</em> concreto. Si no tienes claro qué piezas forman ese sistema, no sabrás qué has medido ni qué tienes que cambiar para mejorar.` },
        { tipo: 'h', texto: 'La intuición: un chef no cocina en el vacío' },
        { tipo: 'p', html: `Piensa en un concurso de cocina. Al chef (el <strong>modelo</strong>) le das una cocina equipada: fogones, cuchillos, una despensa, un recetario y un ayudante que le va pasando los ingredientes y le recuerda qué lleva hecho (el <strong>harness del agente</strong>). Y le pones a cocinar en un restaurante concreto, con unos ingredientes concretos y unos comensales concretos (el <strong>entorno</strong>). El plato final depende de los tres. El mismo chef en una cocina sin horno no hará el mismo plato; el mismo chef con la misma cocina pero con ingredientes en mal estado tampoco. Y cuando el jurado puntúa, puntúa <em>el plato</em>, no el talento abstracto del chef.` },
        { tipo: 'h', texto: 'La definición precisa: agente = modelo + harness + entorno' },
        { tipo: 'terminos', items: [
          { termino: 'Modelo', html: `El LLM que, dado un contexto, genera la siguiente salida: texto, razonamiento o una llamada a herramienta. Es la pieza «que piensa», pero por sí sola no actúa: solo produce tokens.` },
          { termino: 'Harness del agente (<em>agent harness</em> o <em>scaffold</em>)', html: `Todo el software que rodea al modelo y le permite actuar como agente: el <strong>bucle</strong> que llama al modelo, ejecuta las herramientas que pide y le devuelve los resultados; los <strong>prompts</strong> (de sistema, plantillas, ejemplos); la <strong>definición de herramientas</strong> (nombres, descripciones, esquemas de argumentos, formato de las respuestas); y la <strong>gestión del contexto</strong> (qué se resume, qué se trunca, qué memoria se guarda entre pasos). En el M04 lo estudiaremos a fondo, incluido el diseño de la interfaz agente-ordenador (<em>ACI</em>).` },
          { termino: 'Entorno', html: `El «mundo» sobre el que el agente actúa y que puede observar: un repositorio de código dentro de un contenedor, una base de datos de reservas, un navegador con una web, un usuario simulado que contesta preguntas. El entorno tiene un <strong>estado</strong> que las acciones del agente modifican.` },
        ] },
        { tipo: 'figura', svg: `<svg viewBox="0 0 640 230" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13"><rect x="10" y="10" width="400" height="210" rx="10" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="24" y="32" fill="var(--accent)" font-weight="bold">Agente evaluado (lo que puntúas)</text><rect x="30" y="50" width="140" height="70" rx="8" fill="none" stroke="var(--ink)"/><text x="100" y="82" text-anchor="middle" fill="var(--ink)" font-weight="bold">Modelo</text><text x="100" y="100" text-anchor="middle" fill="var(--muted)">genera tokens</text><rect x="200" y="50" width="190" height="150" rx="8" fill="none" stroke="var(--ink)"/><text x="295" y="72" text-anchor="middle" fill="var(--ink)" font-weight="bold">Harness del agente</text><text x="215" y="96" fill="var(--muted)">· bucle de control</text><text x="215" y="118" fill="var(--muted)">· prompts</text><text x="215" y="140" fill="var(--muted)">· herramientas</text><text x="215" y="162" fill="var(--muted)">· gestión del contexto</text><text x="215" y="184" fill="var(--muted)">· límites y reintentos</text><line x1="170" y1="85" x2="200" y2="85" stroke="var(--ink)" stroke-width="2"/><rect x="460" y="50" width="160" height="150" rx="8" fill="none" stroke="var(--pass)" stroke-width="2"/><text x="540" y="72" text-anchor="middle" fill="var(--pass)" font-weight="bold">Entorno</text><text x="475" y="100" fill="var(--muted)">contenedor, BD,</text><text x="475" y="120" fill="var(--muted)">navegador, APIs,</text><text x="475" y="140" fill="var(--muted)">usuario simulado</text><text x="475" y="172" fill="var(--ink)">estado S</text><line x1="390" y1="110" x2="452" y2="110" stroke="var(--ink)" stroke-width="2"/><polygon points="460,110 450,105 450,115" fill="var(--ink)"/><text x="425" y="102" text-anchor="middle" fill="var(--muted)" font-size="11">acciones</text><line x1="460" y1="150" x2="398" y2="150" stroke="var(--ink)" stroke-width="2"/><polygon points="390,150 400,145 400,155" fill="var(--ink)"/><text x="425" y="168" text-anchor="middle" fill="var(--muted)" font-size="11">observaciones</text></svg>`, pie: 'Lo que llamamos «agente» es la combinación de modelo y harness. Actúa sobre un entorno con estado. Una evaluación puntúa esa combinación en ese entorno.' },
        { tipo: 'callout', variante: 'clave', titulo: 'Evalúas el sistema, no el modelo', html: `Cuando evalúas «un agente», evalúas <strong>harness + modelo juntos</strong>, en un entorno concreto. Cambiar el prompt de sistema, la descripción de una herramienta, la estrategia de truncado del contexto o el número máximo de turnos produce <em>otro agente</em>, aunque el modelo sea idéntico. Por eso una puntuación sin la versión del harness es casi imposible de interpretar.` },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Mismo modelo, resultados distintos', html: `Un equipo prueba el mismo modelo con dos harnesses: el primero da al agente una herramienta <code>bash</code> genérica; el segundo añade una herramienta <code>editar_archivo</code> que exige rutas absolutas y muestra el fragmento editado tras cada cambio. En la misma suite de tareas de programación, el segundo resuelve claramente más tareas. No ha cambiado «la inteligencia» del modelo; ha cambiado la interfaz con la que actúa. Este tipo de diferencias es habitual en la práctica (el trabajo de SWE-agent, de Yang et al., 2024, lo documentó con detalle) y es una de las razones por las que el M03 y el M04 insisten en documentar el scaffold.` },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico', html: `Comparar el «modelo A» con el «modelo B» usando las cifras que cada proveedor publica con su propio harness, y concluir que A es mejor modelo. Si los harnesses, los límites de turnos o las versiones del entorno difieren, estás comparando sistemas distintos. Para comparar modelos, fija el harness y el entorno y cambia solo el modelo (es una <em>ablación</em>, lo veremos en el M03).` },
        { tipo: 'revelar', pregunta: `Tu equipo mantiene el mismo modelo pero sube el límite de turnos de 20 a 50 y añade un paso que resume el historial cuando supera cierto tamaño. La tasa de éxito pasa de 48 % a 57 %. ¿Ha mejorado el modelo? ¿Qué ha mejorado?`, respuesta: `El modelo es el mismo. Ha mejorado <strong>el agente</strong>, porque has cambiado dos piezas del harness: los límites (más turnos dan más oportunidades de terminar tareas largas) y la gestión del contexto (resumir evita que la información relevante se pierda o que el contexto se desborde). Para saber cuánto aporta cada cambio tendrías que hacer una ablación: probar cada cambio por separado con el resto fijo. Y antes de celebrar, comprueba si 9 puntos es una diferencia real o ruido: con pocas tareas puede no serlo (lo veremos en el M08).` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s2
    {
      id: 's2',
      titulo: 'Vocabulario I: tarea, ensayo, transcript y resultado',
      bloques: [
        { tipo: 'p', html: `En evaluación de agentes se usan muchas palabras de forma intercambiable («test», «caso», «ejecución», «log», «resultado»...) y eso genera confusiones caras: alguien cree que ha medido una cosa y ha medido otra. En este curso usaremos un vocabulario fijo, alineado con el que emplean los equipos que publican sobre el tema (por ejemplo, el artículo de ingeniería de Anthropic «Demystifying evals for AI agents», de 2026) y con herramientas como Inspect AI. Empezamos por las cuatro piezas que describen <em>qué se pide</em> y <em>qué pasó</em>.` },
        { tipo: 'h', texto: 'Tarea (task)' },
        { tipo: 'p', html: `<strong>Intuición:</strong> es el «examen» concreto que le pones al agente. <strong>Definición:</strong> una <em>tarea</em> es un problema individual con (1) una <strong>entrada</strong> (instrucciones, prompt, datos del usuario), (2) unos <strong>criterios de éxito</strong> definidos de antemano y (3) una <strong>configuración del entorno</strong> que fija el estado inicial (qué ficheros hay, qué registros tiene la base de datos, qué herramientas están disponibles). Sin cualquiera de las tres, la tarea está incompleta: sin entrada no hay nada que hacer; sin criterios no sabemos qué es «bien»; sin entorno fijado, dos ejecuciones no parten del mismo sitio. En la jerga de algunos frameworks a cada tarea se le llama también <em>sample</em>, <em>caso</em> o <em>instancia</em>.` },
        { tipo: 'callout', variante: 'ejemplo', html: `<strong>Entrada:</strong> «Soy el cliente C-204. Quiero cancelar mi suscripción premium y que me devolváis el último mes». <strong>Entorno:</strong> base de datos con el cliente C-204, suscripción activa desde hace 3 meses, último cobro hace 10 días; política de reembolso: devolución si el cobro tiene menos de 14 días. <strong>Criterios de éxito:</strong> la suscripción queda con estado <code>cancelada</code>, existe un reembolso del importe del último cobro al método de pago original y no se ha reembolsado ningún otro cobro.` },
        { tipo: 'h', texto: 'Ensayo (trial)' },
        { tipo: 'p', html: `<strong>Intuición:</strong> si lanzas un dado una vez y sale 6, no sabes si el dado está trucado. <strong>Definición:</strong> un <em>ensayo</em> (<em>trial</em>) es <strong>un intento</strong> del agente de resolver una tarea, desde el estado inicial hasta que termina (o se agota un límite). Como las salidas del modelo varían de una ejecución a otra (muestreo, entorno no determinista, temporizaciones de red), ejecutamos <strong>varios ensayos por tarea</strong> para estimar con qué frecuencia la resuelve. Cada ensayo debe empezar en un entorno limpio, idéntico al de los demás, y no debe poder ver nada de los ensayos anteriores.` },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico', html: `Ejecutar cada tarea una sola vez y tratar el resultado como «la verdad». Con un solo ensayo, una tarea que el agente resuelve la mitad de las veces aparece como «resuelta» o «fallada» por puro azar. Peor todavía: reutilizar el mismo contenedor entre ensayos, de modo que el segundo intento encuentra los ficheros que dejó el primero (y parece mucho más listo de lo que es).` },
        { tipo: 'h', texto: 'Transcript o trayectoria' },
        { tipo: 'p', html: `<strong>Intuición:</strong> la «caja negra» del avión: todo lo que pasó, en orden. <strong>Definición:</strong> el <em>transcript</em> (también <em>trayectoria</em> o <em>trace</em>) es el <strong>registro completo de un ensayo</strong>: los mensajes de sistema y de usuario, las salidas del modelo (incluido el razonamiento visible si lo hay), cada llamada a herramienta con sus argumentos, cada resultado devuelto, los errores, los tiempos y el consumo de tokens. Es la materia prima para depurar, para los graders que evalúan el proceso y para entender <em>por qué</em> falló algo. En la sección 6 veremos su estructura de datos.` },
        { tipo: 'h', texto: 'Resultado (outcome)' },
        { tipo: 'p', html: `<strong>Intuición:</strong> lo que hay en la nevera al final, no lo que el cocinero dice que ha guardado. <strong>Definición:</strong> el <em>resultado</em> (<em>outcome</em>) es el <strong>estado final del entorno</strong> cuando termina el ensayo: los ficheros del repositorio, las filas de la base de datos, el correo enviado (o no), la página en la que quedó el navegador. Es lo que de verdad le importa al usuario. Ojo con la palabra: en español «resultado» se usa también para «puntuación»; en este curso, cuando hablemos de <em>outcome</em>, nos referimos al estado del mundo, y a la nota la llamaremos <strong>puntuación</strong>.` },
        { tipo: 'comparar', columnas: [
          { titulo: 'Lo que el agente DICE (transcript)', tono: 'fail', items: [
            '«¡Listo! Tu vuelo a Lisboa está reservado.»',
            '«He corregido el bug y todos los tests pasan.»',
            '«He enviado el informe a tu jefa.»',
            'Es una afirmación: puede ser verdad, mentira o una confusión honesta.',
          ] },
          { titulo: 'Lo que REALMENTE ocurrió (resultado)', tono: 'pass', items: [
            '¿Existe una fila en <code>bookings</code> con estado <code>confirmed</code>?',
            '¿Pasan los tests ocultos al ejecutarlos sobre el estado final del repo?',
            '¿Hay un correo en el servidor de pruebas con ese destinatario y ese adjunto?',
            'Es un hecho verificable en el entorno.',
          ] },
        ] },
        { tipo: 'callout', variante: 'clave', titulo: 'Dicho no es hecho', html: `El ejemplo canónico: un agente de aerolínea termina con «Tu vuelo ha sido reservado». Ese mensaje está en el transcript. Pero el <strong>resultado</strong> es si la reserva existe en la base de datos del entorno. Un grader que solo lee el último mensaje del agente premia a los agentes que <em>afirman</em> con seguridad, no a los que <em>hacen</em>. Siempre que puedas, comprueba el estado final.` },
        { tipo: 'p', html: `Esto no significa que el transcript sobre: hay criterios que solo están en él. «¿Pidió confirmación antes de cobrar?», «¿llamó a una herramienta prohibida?», «¿fue amable?». La regla práctica es: <strong>el resultado responde a «¿se consiguió?» y el transcript responde a «¿cómo se consiguió?»</strong>. Una buena tarea suele mirar ambas cosas, con más peso en la primera. En el M06 veremos con detalle la diferencia entre evaluar el resultado y evaluar la trayectoria.` },
        { tipo: 'pregunta', id: 'm02-c1', pregunta: {
          tipo: 'unica',
          pregunta: 'Un agente de soporte termina con «He cancelado tu suscripción y tramitado el reembolso». ¿Cuál es la forma más fiable de saber si la tarea se completó?',
          opciones: [
            'Consultar en la base de datos del entorno el estado de la suscripción y si existe el reembolso correcto',
            'Pedir a un juez LLM que lea el último mensaje y diga si el agente completó la tarea',
            'Comprobar en el transcript que el agente llamó a la herramienta <code>cancelar_suscripcion</code>',
            'Preguntar al propio agente, en un turno adicional, si está seguro de haberlo hecho',
          ],
          correcta: 0,
          explicacion: `El <strong>resultado</strong> (estado final del entorno) es lo que define el éxito. El juez que lee el último mensaje evalúa una afirmación, no un hecho. Ver la llamada a <code>cancelar_suscripcion</code> es mejor, pero la llamada pudo fallar, tener argumentos erróneos o faltar el reembolso. Preguntar al agente solo produce otra afirmación.`,
          seccion: 's2',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s3
    {
      id: 's3',
      titulo: 'Vocabulario II: grader, suite y los dos harnesses',
      bloques: [
        { tipo: 'p', html: `Ya sabemos qué se pide (tarea), cuántas veces se intenta (ensayos), qué pasó por el camino (transcript) y cómo quedó el mundo (resultado). Nos faltan las piezas que <em>juzgan</em>, <em>agrupan</em> y <em>ejecutan</em>.` },
        { tipo: 'h', texto: 'Grader (evaluador)' },
        { tipo: 'p', html: `<strong>Intuición:</strong> el corrector del examen, con su plantilla de respuestas. <strong>Definición:</strong> un <em>grader</em> es la <strong>lógica que puntúa algún aspecto</strong> del desempeño del agente a partir del resultado, del transcript o de ambos. Puede ser código (ejecutar tests, consultar la base de datos, comparar con una respuesta esperada), un modelo (un LLM que aplica una rúbrica: <em>LLM-as-judge</em>) o una persona. Una tarea puede tener <strong>varios graders</strong>, y cada grader puede contener varias <strong>aserciones</strong> o <em>checks</em> (comprobaciones individuales: «la suscripción está cancelada», «el importe es 9,99», «no se tocó otro cobro»).` },
        { tipo: 'p', html: `Las puntuaciones de varios graders se combinan en la puntuación del ensayo. Hay dos estilos habituales y conviene decidir cuál usas <em>antes</em> de ver los datos:` },
        { tipo: 'lista', items: [
          `<strong>Puertas (<em>gating</em>):</strong> algunos graders son obligatorios; si fallan, el ensayo puntúa 0 aunque el resto sea perfecto. Ejemplo: si el agente reembolsó un cobro que no debía, da igual lo amable que fuera.`,
          `<strong>Media ponderada:</strong> cada grader aporta un peso y la puntuación del ensayo es un número entre 0 y 1 (crédito parcial). Útil para tareas con varios objetivos independientes; lo veremos en el M06.`,
          `<strong>Combinación:</strong> lo más frecuente en la práctica: una puerta de corrección (el resultado es correcto) y, solo si se supera, una media ponderada de criterios secundarios (estilo, eficiencia, tono).`,
        ] },
        { tipo: 'h', texto: 'Suite de evaluación' },
        { tipo: 'p', html: `<strong>Definición:</strong> una <em>suite</em> es una <strong>colección de tareas</strong> diseñada para medir una capacidad o un comportamiento concreto: «resolución de incidencias de facturación», «uso seguro de herramientas destructivas», «regresiones del agente de soporte». Una suite tiene un propósito; no es «todas las tareas que se nos ocurrieron». Es frecuente mantener varias: una de capacidades (difícil, para ver cuánto mejora el agente) y otra de regresión (tareas que ya resuelve y no debe dejar de resolver), como vimos en el M01.` },
        { tipo: 'h', texto: 'Harness de evaluación frente a harness del agente' },
        { tipo: 'p', html: `Aquí está la confusión de vocabulario más frecuente, porque las dos cosas se llaman <em>harness</em>. Son sistemas diferentes con responsabilidades diferentes:` },
        { tipo: 'comparar', columnas: [
          { titulo: 'Harness del agente (scaffold)', tono: 'accent', items: [
            'Permite que el modelo actúe como agente.',
            'Bucle modelo ↔ herramientas, prompts, gestión del contexto.',
            'Es <strong>parte de lo que evalúas</strong>: si lo cambias, cambia el agente.',
            'Existe también en producción.',
            'Ejemplos: tu propio bucle ReAct, un SDK de agentes, el agente de un IDE.',
          ] },
          { titulo: 'Harness de evaluación', tono: 'ink', items: [
            'Ejecuta las evaluaciones de principio a fin.',
            'Prepara entornos, da instrucciones y herramientas, lanza tareas en paralelo, registra cada paso, aplica graders y agrega puntuaciones.',
            'Es <strong>el instrumento de medida</strong>: debería ser neutral.',
            'Solo existe para evaluar.',
            'Ejemplos: Inspect AI (UK AISI), Harbor, un script propio con pytest.',
          ] },
        ] },
        { tipo: 'p', html: `La analogía: el harness del agente es el coche; el harness de evaluación es el circuito con su cronometraje. Si cambias el motor, cambias el coche. Si el cronómetro falla, el coche no ha cambiado pero la medida sí está mal. Muchos «saltos» o «caídas» de rendimiento que se investigan en la práctica resultan ser fallos del harness de evaluación (un timeout demasiado corto, un contenedor sin memoria suficiente, un grader con un bug), no cambios del agente. En el M04 los estudiaremos por separado.` },
        { tipo: 'callout', variante: 'info', titulo: 'Cómo lo llama Inspect AI', html: `En Inspect AI, el framework de evaluación del UK AI Security Institute, una <code>Task</code> combina un <em>dataset</em> (las muestras o <code>Sample</code>, cada una con su entrada y su objetivo), un <em>solver</em> (lo que produce la respuesta: aquí vive el harness del agente) y un <em>scorer</em> (el grader). Los nombres cambian entre herramientas, pero las piezas son las mismas que en este módulo.` },
        { tipo: 'clasificar', id: 'm02-clasificar', instrucciones: 'Asigna cada elemento a la pieza de la evaluación que es. Piensa en su <strong>función</strong>, no en el formato.', categorias: ['Tarea', 'Ensayo', 'Transcript', 'Resultado', 'Grader'], items: [
          { texto: '«Reserva el vuelo más barato MAD→LIS para el 14/11. Éxito si existe una reserva confirmada para el pasajero P-552. Entorno: BD con 3 vuelos semilla.»', categoria: 'Tarea', explicacion: 'Tiene entrada, criterio de éxito y configuración del entorno: es la definición del problema.' },
          { texto: 'La tercera de las cinco ejecuciones de la tarea <code>vuelos-017</code> con el agente v1.4.', categoria: 'Ensayo', explicacion: 'Es un intento concreto de una tarea. Las cinco ejecuciones son cinco ensayos.' },
          { texto: 'La lista ordenada de mensajes, llamadas a herramientas con sus argumentos, respuestas y razonamiento de una ejecución.', categoria: 'Transcript', explicacion: 'Es el registro completo de lo que ocurrió durante un ensayo.' },
          { texto: 'La tabla <code>bookings</code> contiene una fila con <code>status = confirmed</code> para P-552 al terminar.', categoria: 'Resultado', explicacion: 'Es el estado final del entorno, independientemente de lo que dijera el agente.' },
          { texto: 'Un script que ejecuta <code>pytest</code> sobre el repositorio al terminar y devuelve 1 si pasan todos los tests ocultos.', categoria: 'Grader', explicacion: 'Es lógica que puntúa un aspecto (la corrección del código) a partir del resultado. Un grader basado en código.' },
          { texto: 'Un LLM que puntúa de 1 a 5 la claridad de la explicación final siguiendo una rúbrica escrita.', categoria: 'Grader', explicacion: 'Es un grader basado en modelo (LLM-as-judge). Que lo ejecute un LLM no lo convierte en parte del agente.' },
          { texto: 'El repositorio con el bug corregido y un test nuevo añadido, tal y como queda cuando el agente termina.', categoria: 'Resultado', explicacion: 'Es el estado final del entorno (ficheros del repositorio).' },
          { texto: 'El registro de que el agente ejecutó <code>run_tests</code> cuatro veces y editó <code>utils.py</code> dos veces.', categoria: 'Transcript', explicacion: 'Describe el camino seguido (acciones y su orden), no el estado final.' },
          { texto: 'Enunciado del issue #1234, Dockerfile con el repo en el commit previo y tests ocultos que deben pasar.', categoria: 'Tarea', explicacion: 'Entrada + entorno + criterio de éxito: así se definen las tareas en benchmarks tipo SWE-bench.' },
        ] },
      ],
    },

    // ───────────────────────────────────────────────────────────── s4
    {
      id: 's4',
      titulo: 'El ciclo de vida de una ejecución de evaluación',
      bloques: [
        { tipo: 'p', html: `Con el vocabulario ya fijado, veamos cómo se mueven las piezas. Una ejecución de evaluación (un <em>eval run</em>) sigue siempre, con variaciones, el mismo recorrido. Conviene tenerlo en la cabeza como un diagrama, porque cada caja es un sitio donde algo puede ir mal, y saber <em>en qué caja</em> está el problema es media depuración.` },
        { tipo: 'flujo', titulo: 'De la suite al informe', pasos: [
          { titulo: '1. Dataset de tareas', texto: 'Se cargan las tareas de la suite (entrada, entorno, criterios, metadatos y etiquetas).' },
          { titulo: '2. Preparar el entorno', texto: 'Para cada ensayo: contenedor limpio, fixtures, BD semilla, herramientas disponibles.' },
          { titulo: '3. El agente se ejecuta', texto: 'Bucle modelo ↔ herramientas hasta terminar o agotar límites (turnos, tokens, tiempo).' },
          { titulo: '4. Transcript + estado final', texto: 'Se guarda todo lo ocurrido y se captura el resultado del entorno.' },
          { titulo: '5. Graders', texto: 'Tests, comprobaciones de estado, rúbricas LLM; cada uno puntúa un aspecto.' },
          { titulo: '6. Puntuación por ensayo', texto: 'Se combinan los graders (puertas, pesos) en una nota por ensayo.' },
          { titulo: '7. Agregación', texto: 'Por tarea, por suite y por segmentos; con incertidumbre (M08).' },
          { titulo: '8. Informe', texto: 'Métricas, coste, latencia, versiones del agente y del harness, fecha.' },
          { titulo: '9. Leer transcripts', texto: 'Revisar fallos (y algunos éxitos) para entender el porqué y corregir tareas o agente.' },
        ], bucle: 'Lo aprendido al leer transcripts mejora las tareas, los graders y el agente' },
        { tipo: 'acordeon', items: [
          { titulo: '1-2. Dataset y preparación del entorno', bloques: [
            { tipo: 'p', html: `El harness de evaluación lee las tareas (de un YAML, un JSONL, una base de datos) y, por cada ensayo, levanta un entorno <strong>aislado y reproducible</strong>: una imagen de contenedor fijada por versión, la base de datos cargada con los mismos datos semilla, los ficheros de partida, las variables de entorno. Si el entorno no es idéntico entre ensayos, mezclarás la variabilidad del agente con la del entorno.` },
            { tipo: 'p', html: `<strong>Qué falla aquí:</strong> imágenes con etiqueta <code>latest</code> que cambian sin avisar, dependencias que se descargan de internet en cada ejecución, cachés compartidas entre ensayos, recursos insuficientes (memoria, CPU) que provocan fallos que parecen del agente.` },
          ] },
          { titulo: '3. El agente se ejecuta', bloques: [
            { tipo: 'p', html: `El harness de evaluación entrega al agente la entrada de la tarea y las herramientas, y el agente (su propio harness + modelo) hace su bucle: el modelo propone una acción, el harness la ejecuta en el entorno, el resultado vuelve al modelo... hasta que el agente declara que ha terminado o se agota un <strong>límite</strong>: número máximo de turnos, de tokens o de tiempo. Los límites no son un detalle: forman parte de la definición de la tarea y cambian la puntuación.` },
            { tipo: 'p', html: `Para que la suite termine en un tiempo razonable, el harness de evaluación ejecuta muchos ensayos <strong>en paralelo</strong>. Eso introduce riesgos propios: límites de tasa de la API, contención de recursos, ensayos que se interfieren si comparten algo.` },
          ] },
          { titulo: '4. Transcript y estado final', bloques: [
            { tipo: 'p', html: `Al terminar, se guardan dos cosas distintas: el <strong>transcript</strong> (todo lo que pasó) y una <strong>instantánea del resultado</strong> (diff del repositorio, volcado de tablas relevantes, capturas de pantalla). Guarda ambas aunque tus graders actuales no las usen: dentro de un mes querrás añadir un grader nuevo y reevaluar sin volver a ejecutar al agente.` },
          ] },
          { titulo: '5-6. Graders y puntuación por ensayo', bloques: [
            { tipo: 'p', html: `Cada grader recibe lo que necesita (resultado, transcript o ambos) y devuelve una puntuación y, muy recomendable, una <strong>justificación</strong> (qué aserción falló, por qué el juez puso un 2). Después se combinan según las reglas de la tarea. Los graders deben ejecutarse <em>fuera</em> del alcance del agente: si el agente puede leer o modificar los tests ocultos, la evaluación deja de medir lo que crees (lo veremos en el M10, <em>reward hacking</em>).` },
          ] },
          { titulo: '7-8. Agregación e informe', bloques: [
            { tipo: 'p', html: `Las puntuaciones por ensayo se agregan por tarea (¿qué fracción de ensayos tuvo éxito?), por suite y por segmentos (por tipo de tarea, dificultad, idioma...). Cada cifra agregada debería ir acompañada de su incertidumbre, del número de tareas y ensayos, de las versiones del agente y del harness y de su coste. Todo eso es materia del M08.` },
          ] },
          { titulo: '9. Leer transcripts', bloques: [
            { tipo: 'p', html: `El paso que más se salta y el que más enseña. Una métrica agregada te dice <em>cuánto</em>; los transcripts te dicen <em>por qué</em>. Al leerlos descubrirás tareas mal especificadas (el agente «falla» porque la tarea era ambigua), graders demasiado estrictos o laxos, fallos de infraestructura disfrazados de fallos del agente y patrones de error del agente que ninguna métrica captura. Lee también algunos éxitos: a veces el agente «acierta» por el motivo equivocado.` },
          ] },
        ] },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'El ciclo en código (esquema simplificado y secuencial)', codigo: `def ejecutar_suite(suite, agente, n_ensayos=5):
    registros = []
    for tarea in suite.tareas:
        for ensayo in range(n_ensayos):
            entorno = crear_entorno(tarea.entorno)          # 2. limpio y aislado
            try:
                transcript = agente.ejecutar(                # 3. bucle modelo <-> herramientas
                    entrada=tarea.prompt,
                    herramientas=entorno.herramientas(tarea.herramientas),
                    limites=tarea.limites,
                )
                estado_final = entorno.capturar_estado()     # 4. resultado
                notas = {g.nombre: g.puntuar(transcript, estado_final)   # 5. graders
                         for g in tarea.graders}
                puntuacion = combinar(notas, tarea.reglas)   # 6. puertas / pesos
            except ErrorInfraestructura as e:
                transcript, notas, puntuacion = None, {"infra": str(e)}, None  # ¡no es un 0 del agente!
            finally:
                entorno.destruir()
            registros.append(Registro(tarea.id, ensayo, transcript, notas, puntuacion))
    return agregar(registros)                                # 7. por tarea, suite, segmentos` },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: contar un fallo de infraestructura como fallo del agente', html: `Fíjate en el <code>except</code> del esquema: si el contenedor se queda sin memoria o la API devuelve un error de tasa, ese ensayo <strong>no</strong> es un fracaso del agente; es un ensayo inválido que hay que repetir o excluir (y contar aparte). Mezclarlos hunde la puntuación de forma aleatoria y hace que dos ejecuciones de la misma suite parezcan distintas.` },
        { tipo: 'pregunta', id: 'm02-c2', pregunta: {
          tipo: 'unica',
          pregunta: 'Tras una ejecución, la tasa de éxito cae 15 puntos respecto a ayer sin que nadie haya tocado el agente. ¿Cuál es el primer paso más razonable?',
          opciones: [
            'Leer transcripts de ensayos fallidos y revisar errores de infraestructura (timeouts, memoria, límites de tasa) antes de concluir nada',
            'Revertir el último cambio del prompt de sistema, por si acaso',
            'Subir la temperatura del modelo para que explore más soluciones',
            'Cambiar los graders por un juez LLM, que es más tolerante',
          ],
          correcta: 0,
          explicacion: `Si el agente no ha cambiado, lo primero es sospechar del <strong>harness de evaluación o del entorno</strong> (o del ruido estadístico). Los transcripts y los registros de errores lo revelan en minutos. Revertir un cambio que no se ha hecho, tocar la temperatura o cambiar de grader son acciones a ciegas que pueden ocultar la causa real.`,
          seccion: 's4',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s5
    {
      id: 's5',
      titulo: 'Anatomía de una buena definición de tarea',
      bloques: [
        { tipo: 'p', html: `Una tarea bien escrita es un contrato: cualquier persona (u otro equipo, o tú dentro de seis meses) debería poder leerla y saber exactamente qué se le pide al agente, en qué mundo, con qué recursos y cómo se decide si lo consiguió. Lo habitual es escribirla en un formato declarativo (YAML o JSON) que el harness de evaluación sabe leer. Veamos un ejemplo completo de una tarea de programación y luego campo a campo.` },
        { tipo: 'codigo', lenguaje: 'yaml', titulo: 'tareas/facturacion-iva-redondeo-001.yaml', codigo: `id: facturacion-iva-redondeo-001
version: 3
descripcion: >
  Corregir el redondeo del IVA en calcular_total(): hoy redondea cada línea
  hacia abajo y el total de la factura no cuadra con el desglose.
etiquetas: [coding, bugfix, python, dificultad-media]

prompt: |
  En el repositorio /workspace/facturacion, varios clientes reportan que el
  total de algunas facturas difiere en 1 céntimo de la suma del desglose.
  Encuentra la causa y corrígela. No modifiques los tests existentes.

entorno:
  imagen: registro.interno/evals/facturacion:2026-09-01   # versión fijada, nunca "latest"
  setup:
    - git checkout 4f2c1ab
    - pip install -e .
  fixtures:
    - datos/facturas_ejemplo.csv
  red: deshabilitada

herramientas: [bash, editor_archivos]

limites:
  max_turnos: 40
  max_tokens: 200000
  timeout_seg: 900

graders:
  - nombre: tests_ocultos
    tipo: tests_unitarios
    comando: pytest tests_ocultos/test_iva.py -q
    requerido: true          # puerta: si falla, el ensayo puntúa 0
  - nombre: no_toca_tests
    tipo: comprobacion_estado
    descripcion: el diff no modifica tests/ ni migrations/
    requerido: true
  - nombre: calidad_parche
    tipo: rubrica_llm
    rubrica: rubricas/calidad_parche.md   # cambio mínimo, nombres claros, sin código muerto
    escala: [0, 1, 2]
    peso: 1.0

solucion_referencia: soluciones/facturacion-iva-redondeo-001.patch
ensayos: 5
metricas: [n_turnos, tokens_entrada, tokens_salida, latencia_seg, coste_usd]` },
        { tipo: 'tabla', titulo: 'Qué aporta cada campo', columnas: ['Campo', 'Para qué sirve', 'Si falta o está mal...'], filas: [
          ['<code>id</code>, <code>version</code>', 'Identificar la tarea de forma estable y saber qué versión se evaluó.', 'No podrás comparar resultados entre semanas: ¿cambió el agente o cambió la tarea?'],
          ['<code>descripcion</code>, <code>etiquetas</code>', 'Explicar a humanos qué mide la tarea y permitir agregar por segmentos.', 'No podrás responder «¿en qué tipo de tareas empeoramos?».'],
          ['<code>prompt</code>', 'La entrada exacta que recibe el agente.', 'Ambigüedad: el agente «falla» haciendo algo razonable que no era lo esperado.'],
          ['<code>entorno</code>', 'Fijar el estado inicial: imagen versionada, setup, fixtures, red.', 'Ensayos no reproducibles; resultados que cambian sin que cambie el agente.'],
          ['<code>herramientas</code>', 'Qué puede hacer el agente en esta tarea.', 'El agente usa herramientas que en producción no tendría (o le faltan las que sí).'],
          ['<code>limites</code>', 'Turnos, tokens y tiempo máximos.', 'Ensayos infinitos, costes disparados y comparaciones injustas entre agentes.'],
          ['<code>graders</code>', 'Cómo se puntúa: tipos, puertas, pesos, rúbricas.', 'Sin criterio de éxito explícito no hay evaluación, solo opinión.'],
          ['<code>solucion_referencia</code>', 'Demostrar que la tarea es resoluble y que los graders aceptan una solución correcta.', 'Tareas imposibles o graders rotos que nadie detecta: un 0 % «misterioso».'],
          ['<code>ensayos</code>, <code>metricas</code>', 'Cuántos intentos por tarea y qué se mide además del éxito.', 'Puntuaciones ruidosas; no sabrás cuánto cuesta cada punto de éxito.'],
        ] },
        { tipo: 'h', texto: 'Propiedades de una buena tarea' },
        { tipo: 'lista', items: [
          `<strong>No ambigua:</strong> dos expertos humanos que lean el prompt estarían de acuerdo en qué cuenta como éxito. Una prueba útil: pide a un compañero que la resuelva sin ayuda.`,
          `<strong>Resoluble y verificada:</strong> existe una solución de referencia que pasa todos los graders. Si ningún agente la resuelve nunca, sospecha primero de la tarea.`,
          `<strong>Graders alineados con el objetivo:</strong> miden lo que importa al usuario (el resultado), no un indicador fácil de falsear. Comprueba también que una solución <em>incorrecta</em> razonable falla.`,
          `<strong>Entorno reproducible y aislado:</strong> versiones fijadas, sin dependencias de red no controladas, limpio en cada ensayo.`,
          `<strong>Límites realistas:</strong> parecidos a los que tendrá el agente en producción.`,
          `<strong>Representativa:</strong> se parece a lo que los usuarios piden de verdad (idealmente, sale de casos reales anonimizados); las etiquetas permiten ver la cobertura.`,
        ] },
        { tipo: 'callout', variante: 'error', titulo: 'Anti-patrón: el grader que acepta cualquier cosa (o ninguna)', html: `Una tarea pide «añade validación al formulario» y su grader comprueba que el fichero <code>form.py</code> ha cambiado. Cualquier edición pasa, incluida una que rompe el formulario. El caso opuesto: un grader que compara la salida carácter a carácter con una respuesta esperada y rechaza soluciones correctas escritas de otra forma. Los dos se detectan igual: ejecuta los graders contra la solución de referencia <em>y</em> contra un par de soluciones malas antes de usar la tarea.` },
        { tipo: 'ejercicio', id: 'm02-ej-spec', titulo: 'Escribe la especificación de una tarea', enunciado: `Tu empresa tiene un agente de soporte para una tienda online. Herramientas disponibles en producción: <code>buscar_pedido</code>, <code>crear_devolucion</code>, <code>emitir_reembolso</code>, <code>enviar_mensaje</code>. Escenario: el cliente Ana (ID <code>CL-77</code>) escribe: «Quiero devolver las zapatillas del pedido A-1009, me quedan pequeñas». El pedido tiene dos artículos (zapatillas 59,90 € y calcetines 6,00 €), se entregó hace 12 días y se pagó con tarjeta. Política: devoluciones hasta 30 días desde la entrega; el reembolso va al método de pago original; los gastos de envío (4,95 €) no se reembolsan.<br><br>Escribe la especificación de la tarea: id, prompt, entorno (qué datos semilla), herramientas, límites, graders (al menos uno de estado y uno sobre el transcript), métricas y qué incluirías como solución de referencia. Piensa también qué <strong>errores plausibles</strong> del agente deberían hacer fallar a tus graders.`, pistas: [
          'Empieza por el <strong>resultado</strong>: ¿qué filas deberían existir (o no existir) en la base de datos al final?',
          'Piensa en errores verosímiles: reembolsar el pedido entero, incluir el envío, reembolsar a otro método de pago, no crear la devolución, devolver los calcetines.',
          'Hay criterios que solo están en el transcript, por ejemplo qué se le dice a la clienta y si se le confirma el importe.',
          '¿Cómo sabrás que la tarea es resoluble y que tus graders no rechazan una solución buena?',
        ], solucion: `Una posible especificación (no hay una única correcta):<ul>
<li><code>id: soporte-devolucion-parcial-001</code>, <code>version: 1</code>, <code>etiquetas: [soporte, devoluciones, parcial, dificultad-baja]</code>.</li>
<li><strong>prompt</strong>: el mensaje literal de Ana, más el contexto que el agente tendría en producción (ID del cliente autenticado <code>CL-77</code>).</li>
<li><strong>entorno</strong>: BD semilla versionada con el cliente CL-77, el pedido A-1009 (dos líneas: zapatillas 59,90 €, calcetines 6,00 €, envío 4,95 €), fecha de entrega = fecha simulada − 12 días, pago con tarjeta <code>T-1</code>; algún otro pedido de Ana como distractor. Reloj del entorno fijado para que «hace 12 días» sea reproducible.</li>
<li><strong>herramientas</strong>: las cuatro de producción, ni una más.</li>
<li><strong>límites</strong>: p. ej. <code>max_turnos: 15</code>, <code>timeout_seg: 300</code>.</li>
<li><strong>graders de estado (requeridos)</strong>: existe una devolución para A-1009 que incluye solo la línea de zapatillas; existe un único reembolso de <strong>59,90 €</strong> a <code>T-1</code>; no hay reembolsos de los calcetines, del envío ni de otros pedidos.</li>
<li><strong>grader sobre el transcript</strong>: se envió a la clienta un mensaje que confirma el importe (59,90 €) y explica que el envío no se reembolsa (rúbrica LLM, o comprobación de que el mensaje contiene el importe correcto); no se llamó a <code>emitir_reembolso</code> más de una vez.</li>
<li><strong>métricas</strong>: turnos, tokens, latencia, coste.</li>
<li><strong>solución de referencia</strong>: la secuencia <code>buscar_pedido → crear_devolucion(linea=zapatillas) → emitir_reembolso(59,90, T-1) → enviar_mensaje</code>, ejecutada contra el entorno para comprobar que todos los graders la aceptan; y dos soluciones malas (reembolso de 64,85 € con envío; reembolso del pedido entero) para comprobar que fallan.</li>
<li><code>ensayos: 5</code> o más: es una tarea corta y barata.</li></ul>` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s6
    {
      id: 's6',
      titulo: 'El transcript por dentro',
      bloques: [
        { tipo: 'p', html: `Un transcript no es un fichero de texto con la conversación: es un <strong>registro estructurado de eventos</strong>. Que sea estructurado importa, porque los graders, los paneles y tú mismo vais a hacerle preguntas: «¿cuántas veces llamó a <code>bash</code>?», «¿qué herramienta devolvió error?», «¿cuántos tokens consumió el turno 7?». Cada framework tiene su formato, pero casi todos guardan algo parecido a esto:` },
        { tipo: 'codigo', lenguaje: 'json', titulo: 'Fragmento de un transcript (simplificado)', codigo: `{
  "run_id": "2026-10-09T10:14:03Z-a1b2",
  "task_id": "facturacion-iva-redondeo-001",
  "task_version": 3,
  "trial": 3,
  "agent": { "model": "modelo-x-2026-08", "harness": "mi-agente@1.4.2", "temperature": 1.0 },
  "events": [
    { "t": 0.0, "type": "message", "role": "system", "content": "Eres un agente de programación..." },
    { "t": 0.0, "type": "message", "role": "user", "content": "En el repositorio /workspace/facturacion..." },
    { "t": 2.3, "type": "model_output",
      "reasoning": "Busco dónde se define calcular_total.",
      "tool_calls": [ { "id": "c1", "name": "bash", "input": { "cmd": "grep -rn calcular_total src/" } } ],
      "usage": { "input_tokens": 1830, "output_tokens": 64 } },
    { "t": 2.9, "type": "tool_result", "tool_call_id": "c1", "is_error": false,
      "output": "src/totales.py:12:def calcular_total(lineas):" },
    { "t": 61.0, "type": "tool_result", "tool_call_id": "c7", "is_error": true,
      "output": "FAILED tests/test_totales.py::test_redondeo - AssertionError" },
    { "t": 95.4, "type": "final", "content": "He corregido el redondeo en src/totales.py..." }
  ],
  "final_state": { "diff_files": ["src/totales.py"] },
  "scores": { "tests_ocultos": 1, "no_toca_tests": 1, "calidad_parche": 2 },
  "metrics": { "turns": 9, "input_tokens": 41250, "output_tokens": 3120, "latency_s": 95.4 }
}` },
        { tipo: 'terminos', items: [
          { termino: 'Metadatos del ensayo', html: `<code>run_id</code>, <code>task_id</code>, <code>task_version</code>, <code>trial</code> y la identidad del agente (modelo, versión del harness, parámetros de muestreo). Sin ellos, el transcript es un huérfano: no sabrás a qué comparar.` },
          { termino: 'Eventos', html: `La secuencia ordenada y con marca de tiempo de mensajes, salidas del modelo, llamadas a herramientas (con un <code>id</code> que enlaza cada llamada con su resultado) y resultados (marcando los errores). Es lo que leen los graders de trayectoria.` },
          { termino: 'Consumo', html: `Tokens de entrada y salida por turno y totales, latencia. Permiten calcular coste y eficiencia (M08).` },
          { termino: 'Estado final y puntuaciones', html: `La instantánea del resultado y la salida de cada grader con su justificación. Guardarlas junto al transcript permite auditar cada nota.` },
        ] },
        { tipo: 'callout', variante: 'info', titulo: 'Qué mirar al leer un transcript', html: `<ol><li>¿Entendió bien la tarea? (primer turno).</li><li>¿Las herramientas devolvieron lo que el agente creyó que devolvieron? Busca <code>is_error: true</code> ignorados.</li><li>¿Verificó su trabajo antes de declarar éxito?</li><li>¿Hay bucles (la misma acción repetida) o abandono prematuro?</li><li>¿El fallo es del agente, de la tarea, del grader o de la infraestructura?</li></ol>` },
        { tipo: 'transcript', id: 'm02-tr-vuelo', titulo: 'El agente que reservó un vuelo (o eso dijo)', contexto: `Tarea de evaluación de un agente de aerolínea. Criterio de éxito: al final debe existir en la tabla <code>bookings</code> una reserva con estado <code>confirmed</code> para el pasajero P-552 en el vuelo más barato. El entorno ofrece las herramientas <code>search_flights</code>, <code>hold_seat</code>, <code>confirm_booking</code> y <code>get_booking</code>.`, pasos: [
          { rol: 'sistema', html: 'Eres el asistente de reservas. Una reserva solo existe cuando <code>confirm_booking</code> devuelve <code>status: confirmed</code>. Las retenciones (<code>hold</code>) caducan a los 15 minutos.', nota: 'La política deja claro qué cuenta como reserva.' },
          { rol: 'usuario', html: 'Quiero el vuelo más barato de Madrid a Lisboa el 14 de noviembre. Paga con mi tarjeta guardada.', nota: 'Petición clara.' },
          { rol: 'herramienta', html: '<code>search_flights(origin="MAD", dest="LIS", date="2026-11-14")</code>', nota: 'Correcto: primero busca.' },
          { rol: 'resultado', html: '<code>[{"flight": "TP1027", "price": 89}, {"flight": "IB3110", "price": 112}]</code>', nota: 'TP1027 es el más barato.' },
          { rol: 'herramienta', html: '<code>hold_seat(flight="TP1027", passenger_id="P-552")</code>', nota: 'Correcto: retener el asiento es un paso previo razonable.' },
          { rol: 'resultado', html: '<code>{"hold_id": "H-88", "status": "held", "expires_in_min": 15}</code>', nota: 'El resultado dice claramente <code>held</code>, no <code>confirmed</code>.' },
          { rol: 'pensamiento', html: 'El asiento ya está retenido, así que la reserva está hecha. Puedo responder al usuario.', nota: 'Aquí está el error de razonamiento: confunde retención con reserva, contra la política del sistema, y decide no llamar a <code>confirm_booking</code> ni verificar con <code>get_booking</code>.' },
          { rol: 'agente', html: '¡Listo! Tu vuelo TP1027 Madrid-Lisboa del 14 de noviembre está reservado por 89 €. Tu localizador es H-88.', nota: 'Declara éxito sin verificarlo e incluso presenta el ID de la retención como localizador.' },
          { rol: 'grader', html: 'Rúbrica LLM (tono y claridad): 5/5. Comprobación de estado: <code>SELECT * FROM bookings WHERE passenger = \'P-552\'</code> → 0 filas. <strong>FALLO</strong>.', nota: 'El juez de tono aprueba; el grader de resultado detecta que no hay reserva. Si solo tuvieras el primero, este ensayo contaría como éxito.' },
        ], pregunta: 'Marca el paso o pasos en los que el agente <strong>da por hecho el éxito sin haberlo verificado</strong>.', culpables: [6, 7], explicacion: `El problema no está en buscar ni en retener el asiento, que son pasos correctos. Está en el <strong>pensamiento</strong> del paso 6, donde el agente decide que una retención es una reserva (contra la política explícita) y se salta <code>confirm_booking</code> y <code>get_booking</code>, y en el <strong>mensaje final</strong> del paso 7, donde afirma con total seguridad algo falso. Fíjate en la lección para el diseño de evaluaciones: el grader de tono puntuó 5/5. Solo la <strong>comprobación del estado final</strong> descubrió el fallo. Un buen agente habría llamado a <code>confirm_booking</code> y después a <code>get_booking</code> para verificar antes de responder.` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s7
    {
      id: 's7',
      titulo: 'Unidades de análisis y niveles de evaluación',
      bloques: [
        { tipo: 'p', html: `Una ejecución de evaluación produce muchas puntuaciones. Para sacar conclusiones tienes que decidir a qué nivel las miras. Confundir niveles es la fuente de muchas afirmaciones engañosas («el agente acierta el 80 %», ¿80 % de qué?).` },
        { tipo: 'tabla', titulo: 'Las cuatro unidades de análisis', columnas: ['Unidad', 'Qué es', 'Pregunta que responde'], filas: [
          ['<strong>Puntuación por ensayo</strong>', 'La nota de un intento (0/1 o crédito parcial entre 0 y 1).', '¿Salió bien este intento concreto?'],
          ['<strong>Agregado por tarea</strong>', 'Resumen de los ensayos de una tarea: fracción de éxitos, ¿alguno tuvo éxito?, ¿todos?', '¿Con qué frecuencia y fiabilidad resuelve el agente <em>esta</em> tarea?'],
          ['<strong>Agregado de la suite</strong>', 'Media de los agregados por tarea (con su incertidumbre).', '¿Cómo de bueno es el agente en esta capacidad?'],
          ['<strong>Segmentos (<em>slices</em>)</strong>', 'Agregados sobre subconjuntos definidos por etiquetas: dificultad, tipo, idioma, cliente...', '¿Dónde es fuerte y dónde débil? ¿Qué empeoró?'],
        ] },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Un ejemplo pequeño', html: `Tres tareas, cuatro ensayos cada una (1 = éxito):<ul><li>T1: 1, 1, 1, 1 → éxito por tarea 4/4 = 1,00</li><li>T2: 1, 0, 1, 0 → 2/4 = 0,50</li><li>T3: 0, 0, 0, 0 → 0/4 = 0,00</li></ul>Tasa de éxito de la suite (media de las tareas) = (1 + 0,5 + 0)/3 = <strong>0,50</strong>. Pero fíjate en la información que da el nivel de tarea: «¿lo resuelve <em>alguna</em> vez?» es cierto en 2 de 3 tareas (T1 y T2); «¿lo resuelve <em>siempre</em>?» solo en 1 de 3 (T1). Estas dos preguntas son, respectivamente, las ideas detrás de <em>pass@k</em> y <em>pass^k</em>, que formalizaremos en el M08. Y si T1 y T2 fueran «fáciles» y T3 «difícil», el segmento de difíciles tendría un 0 % que la media esconde.` },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: mezclar unidades', html: `Juntar todos los ensayos en un saco y calcular «éxitos/ensayos» cuando las tareas tienen distinto número de ensayos (por ejemplo, porque algunos se repitieron tras errores de infraestructura). Las tareas con más ensayos pesan más sin que nadie lo haya decidido. Agrega primero por tarea y luego por suite, o documenta explícitamente otra elección.` },
        { tipo: 'h', texto: 'Niveles de evaluación: unitaria, de integración y extremo a extremo' },
        { tipo: 'p', html: `Igual que en el software clásico, puedes evaluar piezas pequeñas o el sistema entero. Cada nivel es útil para cosas distintas y se complementan (es la idea del «queso suizo» del M01: ninguna capa lo atrapa todo).` },
        { tipo: 'pestanas', pestanas: [
          { titulo: 'Unitaria', bloques: [
            { tipo: 'p', html: `<strong>Qué:</strong> una sola llamada al modelo o un componente aislado, con entrada fija. <strong>Ejemplo:</strong> dado un mensaje de cliente, ¿el router lo clasifica en la categoría correcta? Dado este contexto, ¿el modelo elige la herramienta correcta con los argumentos correctos? <strong>Ventajas:</strong> rápida, barata, determinista en el entorno, fácil de depurar; ideal para CI. <strong>Límite:</strong> no ve los errores que solo aparecen al encadenar pasos (contexto que crece, errores que se acumulan).` },
          ] },
          { titulo: 'Integración', bloques: [
            { tipo: 'p', html: `<strong>Qué:</strong> varias piezas reales juntas, pero no el sistema completo. <strong>Ejemplo:</strong> el modelo más la herramienta SQL real contra una base de datos de pruebas: ¿las consultas que genera se ejecutan y devuelven lo correcto? El subagente de búsqueda más el buscador real: ¿encuentra los documentos relevantes? <strong>Ventajas:</strong> detecta problemas en las interfaces (formatos, errores de herramienta mal interpretados). <strong>Límite:</strong> sigue sin capturar el comportamiento a lo largo de una tarea larga.` },
          ] },
          { titulo: 'Extremo a extremo', bloques: [
            { tipo: 'p', html: `<strong>Qué:</strong> el agente completo resuelve tareas completas en un entorno realista, y se puntúa el resultado. <strong>Ejemplo:</strong> todo lo de este módulo: el agente de soporte procesa la devolución de principio a fin. <strong>Ventajas:</strong> mide lo que le importa al usuario. <strong>Límites:</strong> lenta, cara, más ruidosa y, cuando falla, no dice <em>qué pieza</em> falló: para eso necesitas los transcripts y las evaluaciones por componente (atribución de errores, M03).` },
          ] },
        ] },
        { tipo: 'h', texto: 'Offline y online' },
        { tipo: 'p', html: `Todo lo anterior es evaluación <strong>offline</strong>: tareas preparadas, entorno controlado, antes de desplegar. La evaluación <strong>online</strong> mide el agente en producción con usuarios reales: monitorización de tasas de éxito observables (¿se cerró el ticket?, ¿el usuario volvió a preguntar?), valoraciones de usuarios, tests A/B, revisión de muestras de transcripts reales por personas o por graders automáticos. Las dos se alimentan: los fallos que encuentras en producción se convierten en nuevas tareas offline (lo veremos en el M09). Las piezas son las mismas, aunque en online a menudo no tienes un criterio de éxito definido de antemano ni puedes repetir ensayos.` },
        { tipo: 'pregunta', id: 'm02-c3', pregunta: {
          tipo: 'multiple',
          pregunta: 'Quieres comprobar en cada <em>pull request</em> que un cambio en el prompt del router no rompe la clasificación de mensajes, y además saber cada semana si el agente completo resuelve bien los casos reales. ¿Qué combinación es adecuada? (Marca todas las correctas.)',
          opciones: [
            'Una suite unitaria del router (mensaje → categoría esperada) en CI en cada PR',
            'Una suite extremo a extremo con entorno simulado, ejecutada periódicamente con varios ensayos por tarea',
            'Revisión de una muestra de transcripts de producción para descubrir fallos nuevos y convertirlos en tareas',
            'Ejecutar la suite extremo a extremo completa con un solo ensayo en cada PR y bloquear el merge si baja un punto',
          ],
          correctas: [0, 1, 2],
          explicacion: `La suite unitaria es rápida y barata, perfecta para CI. La extremo a extremo mide lo que importa, pero es cara y ruidosa: se ejecuta con menos frecuencia y con varios ensayos. La revisión de producción (online) alimenta la suite offline. La última opción es un error: con un solo ensayo, una bajada de un punto es casi siempre ruido y bloquearías PRs al azar.`,
          seccion: 's7',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s8
    {
      id: 's8',
      titulo: 'Recapitulación y constructor de tareas',
      bloques: [
        { tipo: 'p', html: `Repasa el vocabulario con estas tarjetas: intenta decir la definición antes de girarlas. Si dudas en alguna, vuelve a su sección; el resto del curso las usa sin volver a explicarlas.` },
        { tipo: 'tarjetas', items: [
          { frente: 'Agente', reverso: 'Modelo + harness del agente (bucle, prompts, herramientas, gestión del contexto). Se evalúa en un entorno.' },
          { frente: 'Tarea', reverso: 'Un problema con entrada, criterios de éxito y configuración del entorno.' },
          { frente: 'Ensayo (<em>trial</em>)', reverso: 'Un intento de resolver una tarea desde un entorno limpio. Se hacen varios porque las salidas varían.' },
          { frente: 'Transcript', reverso: 'Registro completo de un ensayo: mensajes, llamadas a herramientas, resultados, razonamiento, tiempos y tokens.' },
          { frente: 'Resultado (<em>outcome</em>)', reverso: 'Estado final del entorno. Lo que pasó de verdad, no lo que el agente dice.' },
          { frente: 'Grader', reverso: 'Lógica que puntúa un aspecto (código, LLM o persona). Una tarea puede tener varios, cada uno con varias aserciones.' },
          { frente: 'Suite', reverso: 'Colección de tareas para medir una capacidad o comportamiento concreto.' },
          { frente: 'Harness de evaluación', reverso: 'Infraestructura que ejecuta la evaluación: prepara entornos, lanza ensayos en paralelo, registra, puntúa y agrega.' },
          { frente: 'Segmento (<em>slice</em>)', reverso: 'Subconjunto de tareas definido por etiquetas para agregar por separado y ver dónde falla el agente.' },
          { frente: 'Unitaria / integración / extremo a extremo', reverso: 'Un componente aislado / varias piezas reales juntas / el agente completo en tareas completas.' },
        ] },
        { tipo: 'p', html: `Ahora practica con el constructor: rellena el formulario para una tarea de tu propio dominio y observa el YAML que genera. Compáralo con el ejemplo de la sección 5: ¿has fijado la versión del entorno?, ¿tienes al menos un grader sobre el resultado?, ¿tus límites se parecen a los de producción?` },
        { tipo: 'widget', nombre: 'constructor_eval' },
        { tipo: 'checklist', id: 'm02-check-tarea', titulo: 'Antes de añadir una tarea a la suite', items: [
          'Tiene <code>id</code> y <code>version</code> estables, y etiquetas para segmentar.',
          'El prompt es inequívoco: un experto humano sabría qué cuenta como éxito.',
          'El entorno está versionado (imagen, datos semilla, reloj) y es limpio en cada ensayo.',
          'Las herramientas y los límites se parecen a los de producción.',
          'Al menos un grader comprueba el <strong>resultado</strong> en el entorno, no solo lo que dice el agente.',
          'La solución de referencia pasa todos los graders y una solución mala plausible falla.',
          'Se registran transcript, estado final, puntuaciones con justificación y consumo.',
        ] },
        { tipo: 'enlaces', items: [
          { titulo: 'Anthropic: Demystifying evals for AI agents (2026)', url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents', html: 'Artículo de ingeniería con el vocabulario de tareas, ensayos, graders, transcripts, resultados y harnesses.' },
          { titulo: 'Inspect AI: documentación', url: 'https://inspect.aisi.org.uk/', html: 'Framework de evaluación del UK AI Security Institute: tareas, datasets, solvers, scorers y logs.' },
          { titulo: 'Anthropic: Building effective agents (2024)', url: 'https://www.anthropic.com/engineering/building-effective-agents', html: 'Sobre workflows, agentes y la importancia de la interfaz de herramientas; base del M03.' },
        ] },
      ],
    },
  ],

  resumen: [
    'Un agente es modelo + harness del agente (bucle, prompts, herramientas, contexto) y se evalúa en un entorno: cambiar cualquier pieza del harness es cambiar el agente.',
    'Una tarea tiene entrada, criterios de éxito y configuración del entorno; un ensayo es un intento, y hacemos varios porque las salidas varían.',
    'El transcript registra cómo se hizo; el resultado es el estado final del entorno. Lo que el agente dice no es lo que pasó: comprueba el estado.',
    'Los graders puntúan aspectos concretos (código, LLM o persona); se combinan con puertas y pesos decididos de antemano.',
    'El harness de evaluación es el instrumento de medida; el del agente es parte de lo medido. Muchos «cambios de rendimiento» son fallos del primero.',
    'El ciclo completo termina leyendo transcripts: la métrica dice cuánto, los transcripts dicen por qué.',
    'Agrega por ensayo, tarea, suite y segmentos, y combina evaluaciones unitarias, de integración, extremo a extremo y online.',
  ],

  quiz: [
    {
      tipo: 'unica',
      pregunta: 'Tu equipo cambia la descripción de la herramienta <code>buscar_pedido</code> y repite la evaluación con el mismo modelo. Desde el punto de vista de la evaluación, ¿qué has evaluado?',
      opciones: [
        'Un agente distinto, porque la definición de herramientas forma parte del harness del agente',
        'El mismo agente, porque el modelo no ha cambiado',
        'El mismo agente con otro entorno, porque las herramientas pertenecen al entorno',
        'Solo el grader, porque la descripción de la herramienta afecta a cómo se puntúa',
      ],
      correcta: 0,
      explicacion: `Las descripciones y esquemas de herramientas son parte del <strong>harness del agente</strong>: cambian lo que el modelo ve y cómo actúa. Por tanto, es otro agente aunque el modelo sea idéntico. El entorno es el mundo sobre el que actúan las herramientas (la BD de pedidos), no la forma en que se le presentan al modelo. El grader no depende de la descripción.`,
      seccion: 's1',
    },
    {
      tipo: 'vf',
      afirmacion: 'Si un juez LLM lee el mensaje final «He reservado tu vuelo, localizador H-88» y lo valida como correcto, podemos concluir que la tarea de reserva se completó.',
      correcta: false,
      explicacion: `El juez está evaluando una <strong>afirmación del transcript</strong>, no el <strong>resultado</strong>. Solo consultando el estado final del entorno (¿existe la reserva confirmada en la BD?) sabes si se completó. En el transcript de la sección 6, el juez de tono daba 5/5 a un ensayo en el que no existía ninguna reserva.`,
      seccion: 's2',
    },
    {
      tipo: 'unica',
      pregunta: '¿Por qué se ejecutan varios ensayos de una misma tarea?',
      opciones: [
        'Porque las salidas del agente varían entre ejecuciones y un solo intento no permite estimar con qué frecuencia la resuelve',
        'Para que el agente aprenda de sus intentos anteriores y mejore en los siguientes',
        'Porque cada ensayo usa un modelo distinto y así se comparan modelos',
        'Para que el grader tenga varias respuestas y se quede con la mejor',
      ],
      correcta: 0,
      explicacion: `Los ensayos existen por el <strong>no determinismo</strong>: muestreo del modelo, entorno, temporizaciones. Son repeticiones independientes desde un entorno limpio: el agente <strong>no</strong> debe ver los intentos anteriores (eso contaminaría la medida). Quedarse con el mejor intento es una métrica concreta (pass@k, M08), no el motivo general.`,
      seccion: 's2',
    },
    {
      tipo: 'multiple',
      pregunta: '¿Qué elementos forman parte de la <strong>definición</strong> de una tarea? (Marca todos los correctos.)',
      opciones: [
        'La entrada o prompt que recibe el agente',
        'La configuración del estado inicial del entorno (imagen, datos semilla, fixtures)',
        'Los criterios de éxito y los graders que los comprueban',
        'Los límites de turnos, tokens o tiempo',
        'El transcript del último ensayo',
        'La puntuación media obtenida la semana pasada',
      ],
      correctas: [0, 1, 2, 3],
      explicacion: `La tarea se define <strong>antes</strong> de ejecutar: entrada, entorno, criterios/graders y límites (los límites cambian la puntuación, así que forman parte de la definición). El transcript y las puntuaciones son <strong>productos</strong> de ejecutar la tarea, no parte de su definición.`,
      seccion: 's5',
    },
    {
      tipo: 'orden',
      pregunta: 'Ordena las fases del ciclo de vida de una ejecución de evaluación.',
      items: [
        'Cargar las tareas de la suite',
        'Preparar un entorno limpio para el ensayo',
        'Ejecutar el agente (bucle modelo ↔ herramientas)',
        'Guardar el transcript y capturar el estado final',
        'Aplicar los graders y combinar la puntuación del ensayo',
        'Agregar por tarea, suite y segmentos',
        'Leer transcripts para entender los fallos',
      ],
      explicacion: `El orden sigue el flujo de la sección 4: dataset → entorno → ejecución → transcript y estado → graders → agregación → informe y lectura de transcripts. Leer transcripts va al final porque necesitas saber qué falló para saber qué leer, y lo aprendido realimenta las tareas, los graders y el agente.`,
      seccion: 's4',
    },
    {
      tipo: 'emparejar',
      pregunta: 'Empareja cada tipo de grader con lo que mejor comprueba.',
      pares: [
        ['Tests unitarios ejecutados sobre el repo final', 'Que el código se comporta como debe'],
        ['Comprobación de estado (consulta a la BD)', 'Que el cambio pedido existe realmente en el sistema'],
        ['Rúbrica aplicada por un LLM', 'Cualidades difíciles de codificar, como claridad o tono'],
        ['Revisión humana de una muestra', 'Calibrar a los demás graders y detectar fallos sutiles'],
      ],
      explicacion: `Los tests verifican comportamiento del código; las comprobaciones de estado verifican el resultado en el entorno; las rúbricas LLM cubren criterios subjetivos o abiertos; las personas son el patrón de referencia con el que se calibra a los jueces automáticos. El M06 profundiza en cada uno.`,
      seccion: 's3',
    },
    {
      tipo: 'unica',
      pregunta: '¿Cuál de estas responsabilidades corresponde al <strong>harness de evaluación</strong> y no al harness del agente?',
      opciones: [
        'Lanzar ensayos en paralelo en entornos aislados, aplicar los graders y agregar las puntuaciones',
        'Decidir qué parte del historial se resume cuando el contexto crece',
        'Ejecutar la herramienta que el modelo pide y devolverle el resultado',
        'Definir el prompt de sistema con la política de devoluciones',
      ],
      correcta: 0,
      explicacion: `Gestionar ensayos, graders y agregación es trabajo del <strong>instrumento de medida</strong>. Resumir el contexto, ejecutar herramientas en el bucle y el prompt de sistema son piezas del <strong>harness del agente</strong>: forman parte de lo que se evalúa y existirían también en producción.`,
      seccion: 's3',
    },
    {
      tipo: 'numerica',
      pregunta: 'Una suite tiene 3 tareas con 4 ensayos cada una. Éxitos: T1 = 4/4, T2 = 1/4, T3 = 2/4. ¿Cuál es la tasa de éxito de la suite, calculada como media de las tasas por tarea, en porcentaje?',
      respuesta: 58.3,
      tolerancia: 0.5,
      unidad: '%',
      explicacion: `Tasas por tarea: 1,00; 0,25; 0,50. Media = (1 + 0,25 + 0,5)/3 = 1,75/3 ≈ 0,583 → <strong>58,3 %</strong>. Como todas las tareas tienen el mismo número de ensayos, coincide con 7/12 éxitos sobre el total de ensayos; si tuvieran distinto número de ensayos, las dos cuentas diferirían.`,
      seccion: 's7',
    },
    {
      tipo: 'multiple',
      pregunta: '¿Cuáles de estas prácticas mejoran la calidad de una tarea de evaluación? (Marca todas las correctas.)',
      opciones: [
        'Incluir una solución de referencia y comprobar que pasa todos los graders',
        'Comprobar que una solución incorrecta pero plausible falla los graders',
        'Fijar versiones de la imagen del entorno y de los datos semilla',
        'Reutilizar el mismo contenedor entre ensayos para ahorrar tiempo de arranque',
        'Puntuar solo el mensaje final del agente, que es lo que ve el usuario',
      ],
      correctas: [0, 1, 2],
      explicacion: `La solución de referencia demuestra que la tarea es resoluble y que los graders no rechazan lo correcto; la solución mala comprueba que no aceptan cualquier cosa; las versiones fijadas dan reproducibilidad. Reutilizar contenedores contamina los ensayos (el segundo intento ve lo que dejó el primero). Puntuar solo el mensaje final ignora el resultado real.`,
      seccion: 's5',
    },
    {
      tipo: 'vf',
      afirmacion: 'Un ensayo que no termina porque el contenedor se quedó sin memoria debería registrarse como un fallo del agente (puntuación 0) para no inflar los resultados.',
      correcta: false,
      explicacion: `Es un <strong>fallo de infraestructura</strong>, no del agente: hay que marcarlo como ensayo inválido, repetirlo o excluirlo, y contar esos casos aparte. Puntuarlo como 0 introduce ruido aleatorio que depende de la carga de las máquinas, no del agente, y puede hacer que dos ejecuciones idénticas parezcan distintas.`,
      seccion: 's4',
    },
    {
      tipo: 'unica',
      pregunta: 'La tasa de éxito global de tu agente no ha cambiado entre dos versiones, pero los usuarios de habla portuguesa se quejan más. ¿Qué herramienta de análisis te habría avisado?',
      opciones: [
        'Agregar por segmentos usando una etiqueta de idioma en cada tarea',
        'Aumentar el número de ensayos por tarea',
        'Cambiar el grader de resultado por una rúbrica LLM',
        'Calcular la media sobre todos los ensayos en lugar de por tarea',
      ],
      correcta: 0,
      explicacion: `Un empeoramiento en un subconjunto puede compensarse con mejoras en otro y desaparecer en la media global. Los <strong>segmentos</strong> (slices), basados en etiquetas de la tarea, lo hacen visible. Más ensayos reducen el ruido pero no separan por idioma; cambiar de grader o de forma de promediar no resuelve el problema.`,
      seccion: 's7',
    },
    {
      tipo: 'unica',
      pregunta: '¿Qué afirmación describe mejor la relación entre evaluación unitaria y extremo a extremo?',
      opciones: [
        'Se complementan: la unitaria es rápida y localiza fallos de un componente; la extremo a extremo mide lo que importa al usuario pero no dice qué pieza falló',
        'La extremo a extremo hace innecesaria la unitaria, porque si el sistema funciona sus piezas también',
        'La unitaria es más fiable porque evalúa al modelo sin el ruido del harness, así que basta con ella',
        'Son lo mismo con distinto número de tareas',
      ],
      correcta: 0,
      explicacion: `Cada nivel captura cosas distintas (la idea del queso suizo). La unitaria no ve errores que solo aparecen al encadenar pasos; la extremo a extremo es cara, ruidosa y no localiza el fallo. Que el sistema funcione en tu suite no garantiza que cada pieza funcione en todos los casos, y evaluar «sin harness» no mide al agente que vas a desplegar.`,
      seccion: 's7',
    },
  ],
});
