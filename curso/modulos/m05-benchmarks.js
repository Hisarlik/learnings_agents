registrarModulo({
  id: 'm05',
  numero: 5,
  titulo: 'Benchmarks de agentes: mapa y lectura crítica',
  subtitulo: 'Conoce los benchmarks de agentes más usados, entiende cómo puntúan y aprende a leer con espíritu crítico cualquier cifra de una tabla de clasificación.',
  duracion: '120 min',
  nivel: 'Intermedio',
  objetivos: [
    'Distinguir un benchmark público de una suite de evaluación propia y explicar para qué sirve cada uno',
    'Describir la anatomía de un benchmark de agentes: tareas, entorno, método de evaluación, métrica y particiones',
    'Situar los principales benchmarks (SWE-bench, Terminal-Bench, τ-bench, WebArena, OSWorld, GAIA, GDPval, etc.) por dominio y por forma de puntuar',
    'Identificar amenazas a la validez: tareas defectuosas, contaminación, saturación, fugas del entorno y diferencias de harness',
    'Interrogar una afirmación del tipo «nuestro agente logra X % en el benchmark Y» con una lista de preguntas sistemática',
    'Elegir los benchmarks relevantes para tu caso de uso y planificar un benchmark interno a partir de tus propios datos',
  ],
  secciones: [
    // ───────────────────────────────────────────────────────────────── s1
    {
      id: 's1',
      titulo: 'Qué es un benchmark (y qué no es)',
      bloques: [
        {
          tipo: 'callout',
          variante: 'aviso',
          titulo: 'Un mapa con fecha de caducidad',
          html: `El catálogo de este módulo refleja el estado del campo hasta <strong>mediados de 2026</strong>. Los benchmarks de agentes cambian muy deprisa: aparecen versiones nuevas («Verified», «2.0», «Pro»), se corrigen tareas, cambia el <em>harness</em> oficial y las tablas de clasificación se reordenan cada pocas semanas. Antes de usar cualquiera de ellos, consulta su página oficial y su artículo más reciente. <strong>A propósito no damos puntuaciones del estado del arte</strong>: caducarían antes de que terminaras el curso y, como verás en este módulo, una cifra aislada dice muy poco.`,
        },
        {
          tipo: 'p',
          html: `En los módulos anteriores has visto que evaluar un agente consiste en ponerlo delante de <em>tareas</em>, dejar que actúe durante uno o varios <em>trials</em> (intentos), guardar el <em>transcript</em> (la traza completa de mensajes, llamadas a herramientas y resultados), observar el <em>outcome</em> (el estado final del mundo) y dejar que un <em>grader</em> (el evaluador) decida si lo hizo bien. Un <strong>benchmark</strong> es exactamente eso, pero empaquetado, publicado y estandarizado para que cualquiera pueda ejecutarlo y comparar resultados.`,
        },
        {
          tipo: 'p',
          html: `<strong>Intuición:</strong> un benchmark es como un examen oficial (el de acceso a la universidad, una certificación de idiomas). Todo el mundo hace el mismo examen, con las mismas reglas, y por eso las notas son comparables. Pero que alguien saque un 9 en el examen oficial de inglés no te dice si sabrá negociar un contrato con tu proveedor de Manchester, con su acento, su jerga del sector y sus cláusulas raras. Para eso necesitas tu propia prueba, con tus propios casos.`,
        },
        {
          tipo: 'terminos',
          items: [
            { termino: 'Benchmark', html: `Conjunto <strong>público y fijo</strong> de tareas, con su entorno, su método de evaluación y su métrica, diseñado para medir una capacidad general y comparar sistemas entre sí. Suele venir acompañado de una tabla de clasificación.` },
            { termino: 'Suite de evaluación propia', html: `Conjunto de tareas que construyes <strong>a partir de tu producto</strong>: tus usuarios, tus herramientas, tus políticas, tus casos difíciles. Es privada, evoluciona con tu producto y mide lo que a ti te importa. La diseñarás en el módulo 9.` },
            { termino: 'Leaderboard', html: `Tabla de clasificación pública de un benchmark. Puede ser <em>autodeclarada</em> (cada equipo envía su cifra y, como mucho, sus trayectorias) o <em>verificada</em> (los mantenedores ejecutan o auditan las entregas).` },
            { termino: 'Sistema evaluado', html: `Lo que realmente aparece en una fila del leaderboard: no «un modelo», sino <strong>modelo + harness + herramientas + prompts + presupuesto de cómputo</strong>. Cambiar cualquiera de esas piezas cambia la cifra.` },
          ],
        },
        {
          tipo: 'comparar',
          columnas: [
            {
              titulo: 'Para qué sirve un benchmark',
              tono: 'pass',
              items: [
                `<strong>Comparar modelos y sistemas</strong> en igualdad de condiciones (si las condiciones son de verdad iguales, algo que comprobarás en la sección 8).`,
                `<strong>Seguir el progreso del campo</strong>: ver cómo evoluciona una capacidad a lo largo de meses o años con una vara de medir estable.`,
                `<strong>Hacer una primera criba de candidatos</strong>: descartar modelos claramente inferiores antes de gastar dinero en tu propia evaluación.`,
                `<strong>Aprender diseño de evals</strong>: los buenos benchmarks son ejemplos públicos y revisados de cómo construir entornos y graders.`,
                `<strong>Comprobar tu harness</strong>: si tu montaje da cifras muy distintas de las publicadas con el mismo modelo, algo falla en tu montaje (o en el publicado).`,
              ],
            },
            {
              titulo: 'Para qué NO sirve',
              tono: 'fail',
              items: [
                `<strong>Predecir tu rendimiento</strong> en tu tarea concreta, con tus herramientas, tus datos y tus usuarios.`,
                `<strong>Sustituir a tu suite propia</strong>: tu distribución de tareas casi nunca coincide con la del benchmark.`,
                `<strong>Decidir entre dos sistemas separados por 1-2 puntos</strong>: esa diferencia suele estar dentro del ruido estadístico.`,
                `<strong>Medir seguridad, coste o experiencia de usuario</strong> si el benchmark no lo mide de forma explícita.`,
                `<strong>Certificar que un agente «está listo para producción»</strong>: ningún benchmark público conoce tus riesgos.`,
              ],
            },
          ],
        },
        {
          tipo: 'h',
          texto: 'El ciclo de vida de un benchmark',
        },
        {
          tipo: 'p',
          html: `Los benchmarks no son eternos. Casi todos siguen una trayectoria parecida, y saber en qué punto de ella está uno concreto te ayuda a interpretar sus cifras: un 5 % de mejora en un benchmark recién creado significa algo muy distinto que un 5 % en uno saturado y posiblemente contaminado.`,
        },
        {
          tipo: 'flujo',
          titulo: 'Ciclo de vida típico de un benchmark',
          pasos: [
            { titulo: 'Creación', texto: 'Un equipo publica tareas, entorno, grader y resultados iniciales bajos: el benchmark es difícil y discrimina bien entre sistemas.' },
            { titulo: 'Adopción', texto: 'Los laboratorios lo citan en sus anuncios; aparece un leaderboard; la comunidad descubre fallos en tareas y graders.' },
            { titulo: 'Saturación', texto: 'Las puntuaciones se acercan al techo práctico; las diferencias entre los mejores sistemas se vuelven ruido.' },
            { titulo: 'Contaminación', texto: 'Tareas y soluciones acaban en datos de entrenamiento, o se optimiza contra el benchmark: las cifras se inflan.' },
            { titulo: 'Reemplazo', texto: 'Surge una versión depurada («Verified»), más difícil («Pro», «2.0») o renovada continuamente («live»).' },
          ],
          bucle: 'El sucesor vuelve a empezar el ciclo',
        },
        {
          tipo: 'p',
          html: `Un ejemplo de manual es la familia SWE-bench. El original (Jimenez et al., 2023) se adoptó rápidamente; la comunidad detectó tareas mal especificadas y tests que rechazaban soluciones válidas; en 2024 apareció <strong>SWE-bench Verified</strong> como versión depurada; y cuando Verified empezó a acercarse a la saturación y a mostrar signos de contaminación surgieron sucesores más duros o más resistentes a la contaminación, como <strong>SWE-bench Pro</strong> o las variantes que recogen tareas nuevas de forma continua. Lo mismo ha ocurrido con Terminal-Bench (versión 2.0), τ-bench (τ²-bench) y OSWorld (OSWorld-Verified).`,
        },
        {
          tipo: 'p',
          html: `Ojo: «saturado» no significa «inútil». Un benchmark saturado sigue siendo un buen <strong>test de regresión</strong> (si tu nuevo modelo baja mucho en él, algo se ha roto), pero deja de servir para <strong>ordenar</strong> los mejores sistemas. Del mismo modo, un benchmark contaminado puede seguir siendo útil para comparar versiones de tu propio harness con el mismo modelo, porque la contaminación afecta por igual a ambas.`,
        },
        {
          tipo: 'callout',
          variante: 'clave',
          titulo: 'Idea clave',
          html: `Un benchmark responde a «¿qué sistema es mejor <em>en general</em> en esta familia de tareas, en estas condiciones?». Tu suite propia responde a «¿qué sistema es mejor <em>para mí</em>?». Necesitas las dos respuestas, y la segunda es la que decide.`,
        },
        {
          tipo: 'pregunta',
          id: 'm05-c1',
          pregunta: {
            tipo: 'unica',
            pregunta: `Tu equipo construye un agente que concilia facturas en el ERP de la empresa. Un proveedor te dice que su modelo es «el número 1 en SWE-bench Verified». ¿Qué conclusión es la más razonable?`,
            opciones: [
              `Es un indicio de buena capacidad general de programación y uso de herramientas, útil para preseleccionarlo, pero necesitas evaluarlo en tus propias tareas de conciliación.`,
              `Es el mejor modelo para tu caso, porque SWE-bench Verified está validado por humanos y por tanto generaliza a cualquier tarea agéntica.`,
              `No aporta ninguna información, porque SWE-bench mide programación en Python y tu tarea no es programar.`,
              `Basta con comprobar que el proveedor envió trayectorias al leaderboard; si las envió, la cifra es transferible a tu caso.`,
            ],
            correcta: 0,
            explicacion: `Un benchmark sirve para <strong>comparar y preseleccionar</strong>, no para predecir tu rendimiento. Decir que no aporta nada es exagerado: resolver issues reales exige leer código, usar herramientas y verificar, capacidades que se transfieren en parte. Pero «validado por humanos» significa que las tareas son justas, no que representen tu distribución. Y enviar trayectorias mejora la verificabilidad de la cifra, no su transferibilidad.`,
            seccion: 's1',
          },
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s2
    {
      id: 's2',
      titulo: 'Anatomía de un benchmark de agentes',
      bloques: [
        {
          tipo: 'p',
          html: `Un benchmark de preguntas y respuestas clásico (tipo examen tipo test) tiene dos piezas: preguntas y respuestas correctas. Un benchmark de <strong>agentes</strong> necesita bastantes más, porque el agente <em>actúa</em> sobre un mundo durante muchos pasos y el resultado no es un texto, sino un cambio en ese mundo. Cuando leas el artículo de un benchmark, busca siempre estas cinco piezas.`,
        },
        {
          tipo: 'flujo',
          titulo: 'Las cinco piezas de un benchmark de agentes',
          pasos: [
            { titulo: '1. Tareas', texto: 'Qué se pide, de dónde salen y cómo se filtraron.' },
            { titulo: '2. Entorno', texto: 'Dónde actúa el agente: contenedor, VM, web, usuario simulado, APIs.' },
            { titulo: '3. Grader', texto: 'Cómo se decide el éxito: tests, estado, respuesta exacta, juez, expertos.' },
            { titulo: '4. Métrica', texto: 'Cómo se agregan los resultados: tasa de éxito, pass^k, dinero, horizonte.' },
            { titulo: '5. Particiones', texto: 'Qué es público, qué está oculto y cómo se renueva.' },
          ],
        },
        {
          tipo: 'h',
          texto: '1. Las tareas',
        },
        {
          tipo: 'p',
          html: `Las tareas pueden salir de <strong>datos reales</strong> (issues de GitHub en SWE-bench, encargos de freelance en SWE-Lancer, competiciones de Kaggle en MLE-bench), estar <strong>escritas por expertos</strong> (Terminal-Bench, GDPval, TheAgentCompany) o estar <strong>generadas a partir de plantillas</strong> con parámetros aleatorios (AndroidWorld, partes de τ²-bench). Cada origen tiene su compromiso: las tareas reales son representativas pero ruidosas y fáciles de contaminar; las escritas por expertos son limpias pero caras y pocas; las generadas son abundantes y renovables, pero pueden resultar artificiales.`,
        },
        {
          tipo: 'p',
          html: `Pregúntate siempre <strong>cómo se filtraron</strong>. SWE-bench, por ejemplo, solo incluye issues cuyo <em>pull request</em> asociado modificó tests que fallaban antes del arreglo y pasaban después. Ese filtro garantiza que haya una forma automática de comprobar el éxito, pero también sesga el conjunto hacia problemas «testeables», que no son todos los problemas reales.`,
        },
        {
          tipo: 'h',
          texto: '2. El entorno',
        },
        {
          tipo: 'tabla',
          titulo: 'Tipos de entorno en los benchmarks de agentes',
          columnas: ['Entorno', 'Ejemplos', 'Ventaja', 'Coste o riesgo'],
          filas: [
            [`<strong>Contenedor Docker</strong> con un repositorio o una terminal`, 'SWE-bench, Terminal-Bench, Aider Polyglot', 'Reproducible, barato, paralelizable', 'Solo captura tareas de línea de comandos; posibles fugas (historial de git, Internet)'],
            [`<strong>Máquina virtual</strong> con sistema operativo completo`, 'OSWorld, Windows Agent Arena', 'Realismo: apps reales, ratón y teclado', 'Lento y costoso de ejecutar a escala'],
            [`<strong>Emulador móvil</strong>`, 'AndroidWorld', 'Apps reales en un dispositivo controlado', 'Configuración compleja; tareas sensibles al tiempo'],
            [`<strong>Webs autoalojadas</strong>`, 'WebArena, VisualWebArena, WorkArena', 'Webs realistas pero congeladas y reiniciables', 'Se quedan anticuadas respecto a la web real'],
            [`<strong>Web real (en vivo)</strong>`, 'Online-Mind2Web, WebVoyager, BrowseComp, GAIA', 'Máximo realismo', 'No reproducible: la web cambia, las respuestas caducan'],
            [`<strong>Usuario simulado por LLM</strong> + APIs + base de datos`, 'τ-bench, τ²-bench', 'Evalúa conversación y cumplimiento de políticas', 'El simulador también se equivoca y añade varianza'],
            [`<strong>Apps y APIs simuladas</strong>`, 'AppWorld, BFCL, AgentDojo, MCP-Universe', 'Estado controlado y comprobable', 'La fidelidad depende de cuán realistas sean las APIs'],
            [`<strong>Empresa o negocio simulado</strong>`, 'TheAgentCompany, Vending-Bench', 'Tareas largas y heterogéneas, con compañeros o clientes simulados', 'Diseño muy costoso; mucha varianza entre ejecuciones'],
          ],
        },
        {
          tipo: 'h',
          texto: '3. El método de evaluación',
        },
        {
          tipo: 'p',
          html: `Es la pieza que más determina lo que <em>realmente</em> mide el benchmark. Los métodos más comunes son: <strong>tests ejecutables</strong> (SWE-bench, Terminal-Bench), <strong>comprobación del estado final</strong> del entorno (τ-bench, OSWorld, AppWorld, WebArena), <strong>respuesta exacta</strong> corta y verificable (GAIA, BrowseComp, banderas de CTF en Cybench), <strong>juez LLM con o sin rúbrica</strong> (PaperBench, Online-Mind2Web) y <strong>expertos humanos</strong> (GDPval). Los repasarás a fondo en la sección 7 y los conectarás con el módulo 6 (graders).`,
        },
        {
          tipo: 'h',
          texto: '4. La métrica',
        },
        {
          tipo: 'p',
          html: `Una vez que cada intento tiene un veredicto, hay que agregarlos. La métrica más frecuente es la <strong>tasa de éxito</strong> (en código se llama <em>resolve rate</em>: porcentaje de issues resueltas). Pero hay alternativas que capturan cosas distintas:`,
        },
        {
          tipo: 'lista',
          items: [
            `<strong>pass^k</strong> (τ-bench): probabilidad de que el agente resuelva la tarea en <em>los k</em> intentos independientes. Mide <em>fiabilidad</em>, no capacidad máxima. Lo verás con detalle en el módulo 8.`,
            `<strong>Dólares ganados</strong> (SWE-Lancer): cada tarea vale lo que se pagó por ella en el mercado freelance, de modo que resolver tareas difíciles y valiosas pesa más.`,
            `<strong>Patrimonio neto</strong> (Vending-Bench): cuánto dinero más inventario tiene el agente al final de una simulación larga de negocio.`,
            `<strong>Medallas</strong> (MLE-bench): si la solución del agente habría obtenido bronce, plata u oro en la clasificación histórica de la competición de Kaggle.`,
            `<strong>Tasa de victoria o empate frente a profesionales</strong> (GDPval): en cuántos casos los expertos prefieren el entregable del modelo, o lo consideran igual de bueno, frente al de un profesional humano.`,
            `<strong>Horizonte temporal</strong> (METR): duración (medida en tiempo de un experto humano) de las tareas que el agente completa con un 50 % de fiabilidad.`,
            `<strong>Crédito parcial por puntos de control</strong> (TheAgentCompany): la tarea se divide en hitos y se puntúa cuántos se alcanzaron.`,
          ],
        },
        {
          tipo: 'pregunta',
          id: 'm05-c2',
          pregunta: {
            tipo: 'emparejar',
            pregunta: `Empareja cada métrica con el benchmark que la popularizó o la usa como métrica principal.`,
            pares: [
              ['Dólares ganados con encargos reales', 'SWE-Lancer'],
              ['Patrimonio neto al final de la simulación', 'Vending-Bench'],
              ['pass^k: éxito en los k intentos', 'τ-bench'],
              ['Medallas según la clasificación histórica', 'MLE-bench'],
              ['Duración de tarea completada al 50 %', 'Horizonte temporal de METR'],
              ['Preferencia de expertos frente a profesionales', 'GDPval'],
            ],
            explicacion: `Cada métrica refleja una decisión de diseño. SWE-Lancer pondera por <strong>valor económico</strong>; Vending-Bench mide <strong>coherencia a largo plazo</strong> mediante el patrimonio; τ-bench introdujo <strong>pass^k</strong> para medir consistencia; MLE-bench reutiliza las <strong>medallas</strong> de Kaggle como umbral humano; METR traduce el rendimiento a <strong>tiempo humano</strong>; GDPval compara <strong>entregables</strong> en ciego con los de profesionales.`,
            seccion: 's2',
          },
        },
        {
          tipo: 'h',
          texto: '5. Las particiones y el conjunto oculto',
        },
        {
          tipo: 'p',
          html: `Muchos benchmarks separan un conjunto de <strong>desarrollo o validación</strong> (público, con respuestas) de un conjunto de <strong>test</strong> cuyas respuestas no se publican. GAIA, por ejemplo, publica las respuestas de validación pero mantiene ocultas las del test: para puntuar hay que enviar las respuestas a su leaderboard. SWE-bench Pro reserva un subconjunto que no se publica. Otros, como SWE-Lancer, publican una parte (para que la comunidad pueda reproducir) y guardan otra. La razón es siempre la misma: <strong>lo que se publica acaba, tarde o temprano, en los datos de entrenamiento</strong> o en las decisiones de diseño de quienes optimizan contra el benchmark.`,
        },
        {
          tipo: 'revelar',
          pregunta: `Piensa: si un benchmark es totalmente público (tareas, tests y soluciones de referencia en GitHub), ¿qué le pasa a su validez con el paso del tiempo, aunque nadie haga trampas a propósito?`,
          respuesta: `Se degrada. Aunque nadie entrene «a propósito» con el benchmark, sus tareas y soluciones se rastrean en la web y pueden acabar en los datos de preentrenamiento. Además, los equipos ajustan prompts, herramientas y estrategias mirando sus resultados: cada decisión tomada «porque mejora en el benchmark» es una pequeña fuga de información del test al sistema (sobreajuste al benchmark). Por eso surgen conjuntos ocultos, particiones temporales (solo tareas posteriores a la fecha de corte del modelo) y benchmarks que se renuevan continuamente.`,
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s3
    {
      id: 's3',
      titulo: 'El catálogo: un mapa de los benchmarks de agentes',
      bloques: [
        {
          tipo: 'p',
          html: `A continuación tienes un catálogo explorable con los benchmarks de agentes más citados. Usa los filtros para ver, por ejemplo, todos los benchmarks de <em>Web</em>, o todos los que se evalúan con <em>juez LLM</em>, y el buscador para localizar uno concreto. Fíjate en tres cosas mientras exploras: <strong>qué entorno</strong> usa cada uno, <strong>cómo decide el éxito</strong> y <strong>qué métrica</strong> reporta. Esas tres columnas dicen más sobre lo que mide un benchmark que su nombre.`,
        },
        {
          tipo: 'callout',
          variante: 'info',
          titulo: 'Cómo leer las fechas y los datos',
          html: `El año es el de la primera publicación (artículo o anuncio). Cuando no estamos seguros de un dato concreto (número exacto de tareas, por ejemplo), lo describimos de forma cualitativa. Recuerda el aviso inicial: comprueba la página oficial antes de usar cualquier benchmark, porque las versiones cambian.`,
        },
        {
          tipo: 'explorador',
          id: 'm05-catalogo',
          busqueda: true,
          columnas: [
            { clave: 'nombre', titulo: 'Benchmark' },
            { clave: 'anio', titulo: 'Año' },
            { clave: 'dominio', titulo: 'Dominio' },
            { clave: 'entorno', titulo: 'Entorno' },
            { clave: 'evaluacion', titulo: 'Cómo se evalúa' },
            { clave: 'metrica', titulo: 'Métrica' },
            { clave: 'notas', titulo: 'Notas' },
          ],
          filtros: ['dominio', 'evaluacion'],
          filas: [
            // Código
            { nombre: '<strong>SWE-bench</strong>', anio: '2023', dominio: 'Código', entorno: 'Repositorios Python populares en contenedores Docker', evaluacion: 'Tests ejecutables', metrica: '% de issues resueltas (<em>resolve rate</em>)', notas: 'Jimenez et al. Issues reales de GitHub con su PR; el parche del agente debe hacer pasar los tests FAIL_TO_PASS sin romper los PASS_TO_PASS.' },
            { nombre: '<strong>SWE-bench Lite</strong>', anio: '2024', dominio: 'Código', entorno: 'Igual que SWE-bench', evaluacion: 'Tests ejecutables', metrica: '% resueltas', notas: 'Subconjunto más pequeño y barato de ejecutar, filtrado hacia issues más autocontenidas.' },
            { nombre: '<strong>SWE-bench Verified</strong>', anio: '2024', dominio: 'Código', entorno: 'Igual que SWE-bench', evaluacion: 'Tests ejecutables', metrica: '% resueltas', notas: 'OpenAI con los autores de SWE-bench: 500 tareas revisadas por desarrolladores profesionales para descartar issues ambiguas y tests injustos. Estándar de facto en 2024-2025; hoy con signos de saturación y contaminación.' },
            { nombre: '<strong>SWE-bench Multimodal</strong>', anio: '2024', dominio: 'Código', entorno: 'Repositorios JavaScript con componentes visuales', evaluacion: 'Tests ejecutables', metrica: '% resueltas', notas: 'Issues que incluyen imágenes (capturas, diagramas): el agente debe entender elementos visuales.' },
            { nombre: '<strong>SWE-bench Multilingual</strong>', anio: '2025', dominio: 'Código', entorno: 'Repositorios en varios lenguajes de programación', evaluacion: 'Tests ejecutables', metrica: '% resueltas', notas: 'Misma metodología que SWE-bench, fuera del ecosistema Python. Útil si tu código no es Python.' },
            { nombre: '<strong>Multi-SWE-bench</strong>', anio: '2025', dominio: 'Código', entorno: 'Repositorios en varios lenguajes (Java, TypeScript, Go, Rust, C/C++…)', evaluacion: 'Tests ejecutables', metrica: '% resueltas', notas: 'Otra extensión multilenguaje del formato SWE-bench, de un equipo distinto.' },
            { nombre: '<strong>SWE-bench Pro</strong>', anio: '2025', dominio: 'Código', entorno: 'Repositorios profesionales en contenedores', evaluacion: 'Tests ejecutables', metrica: '% resueltas', notas: 'Scale AI. Tareas más largas y difíciles (cambios en varios ficheros). Resistencia a la contaminación: repos con licencias copyleft y bases de código comerciales privadas; subconjunto no publicado.' },
            { nombre: '<strong>SWE-Lancer</strong>', anio: '2025', dominio: 'Código', entorno: 'Repositorio de una aplicación real (Expensify) en contenedor', evaluacion: 'Tests ejecutables', metrica: 'Dólares ganados', notas: 'OpenAI. Encargos freelance publicados en Upwork con su pago real. Tareas de contribuidor evaluadas con tests de extremo a extremo verificados por ingenieros; tareas de «manager» en las que se elige la mejor propuesta, comparada con la elección del manager original.' },
            { nombre: '<strong>SWE-rebench / SWE-bench Live</strong>', anio: '2025', dominio: 'Código', entorno: 'Repositorios en contenedores, tareas recogidas de forma continua', evaluacion: 'Tests ejecutables', metrica: '% resueltas por ventana temporal', notas: 'Variantes que recolectan issues nuevas periódicamente para evaluar solo con tareas posteriores al corte de entrenamiento del modelo (anticontaminación).' },
            { nombre: '<strong>Aider Polyglot</strong>', anio: '2024', dominio: 'Código', entorno: 'Ejercicios de Exercism en varios lenguajes (C++, Go, Java, JavaScript, Python, Rust)', evaluacion: 'Tests ejecutables', metrica: '% de ejercicios resueltos', notas: 'Del proyecto Aider. Ejercicios difíciles y autocontenidos; el modelo puede reintentar tras ver los tests fallidos. Mide edición de código más que agencia larga.' },
            { nombre: '<strong>Spider 2.0</strong>', anio: '2024', dominio: 'Código', entorno: 'Bases de datos empresariales y almacenes de datos en la nube, con código y documentación', evaluacion: 'Respuesta exacta', metrica: '% de tareas correctas', notas: 'Flujos de trabajo realistas de texto a SQL a escala empresarial; se compara el resultado de la ejecución con el de referencia.' },
            // Terminal
            { nombre: '<strong>Terminal-Bench</strong>', anio: '2025', dominio: 'Terminal', entorno: 'Terminal en contenedor Docker', evaluacion: 'Tests ejecutables', metrica: '% de tareas resueltas', notas: 'Laude Institute y Stanford. Tareas escritas a mano (compilar, configurar servidores, depurar, ciencia de datos, seguridad…), cada una con su script de tests y una solución de referencia.' },
            { nombre: '<strong>Terminal-Bench 2.0</strong>', anio: '2025', dominio: 'Terminal', entorno: 'Terminal en contenedor, ejecutado con el harness Harbor', evaluacion: 'Tests ejecutables', metrica: '% de tareas resueltas', notas: 'Tareas más difíciles y verificadas con más cuidado que la primera versión. Harbor permite ejecutar agentes en contenedores a escala.' },
            // Web
            { nombre: '<strong>WebArena</strong>', anio: '2023', dominio: 'Web', entorno: 'Webs autoalojadas: comercio electrónico, foro, GitLab, CMS, mapas', evaluacion: 'Estado del entorno', metrica: 'Tasa de éxito', notas: 'Zhou et al. Evaluadores funcionales: comprueban la respuesta o el estado resultante de las webs, no la secuencia de clics. Incluye tareas imposibles en las que lo correcto es decir que no se puede.' },
            { nombre: '<strong>VisualWebArena</strong>', anio: '2024', dominio: 'Web', entorno: 'Webs autoalojadas con contenido visual (clasificados, tienda, foro)', evaluacion: 'Estado del entorno', metrica: 'Tasa de éxito', notas: 'Tareas que exigen entender imágenes de la página. Algunas comprobaciones usan modelos visuales.' },
            { nombre: '<strong>WorkArena</strong>', anio: '2024', dominio: 'Web', entorno: 'Instancia de la plataforma empresarial ServiceNow; entorno BrowserGym', evaluacion: 'Estado del entorno', metrica: 'Tasa de éxito', notas: 'ServiceNow Research. Tareas de trabajo del conocimiento en software empresarial (formularios, listas, catálogos). WorkArena++ añade tareas compuestas.' },
            { nombre: '<strong>Mind2Web</strong>', anio: '2023', dominio: 'Web', entorno: 'Instantáneas offline de webs reales', evaluacion: 'Comparación con trayectoria', metrica: 'Precisión por paso y éxito por tarea', notas: 'Deng et al. Compara cada acción con la de una demostración humana: penaliza caminos alternativos válidos.' },
            { nombre: '<strong>Online-Mind2Web</strong>', anio: '2025', dominio: 'Web', entorno: 'Webs reales en vivo', evaluacion: 'Juez LLM', metrica: 'Tasa de éxito', notas: 'Evalúa en la web real con un juez LLM validado frente a anotadores humanos. Su artículo advierte de que el progreso medido en benchmarks anteriores estaba sobreestimado.' },
            { nombre: '<strong>WebVoyager</strong>', anio: '2024', dominio: 'Web', entorno: 'Webs reales en vivo (buscadores, tiendas, reservas…)', evaluacion: 'Juez LLM', metrica: 'Tasa de éxito', notas: 'Agente multimodal con capturas de pantalla; evaluación automática con modelo multimodal contrastada con humanos. Respuestas sensibles al paso del tiempo.' },
            { nombre: '<strong>WebShop</strong>', anio: '2022', dominio: 'Web', entorno: 'Tienda online simulada con productos reales', evaluacion: 'Métrica de resultado', metrica: 'Recompensa por atributos y tasa de éxito', notas: 'Yao et al. Precursor: el producto comprado se puntúa según cuántos atributos pedidos cumple.' },
            // OS
            { nombre: '<strong>OSWorld</strong>', anio: '2024', dominio: 'Uso del ordenador/OS', entorno: 'Máquinas virtuales con sistema operativo real (sobre todo Ubuntu) y apps reales', evaluacion: 'Estado del entorno', metrica: 'Tasa de éxito', notas: 'Xie et al. Cada tarea tiene una configuración inicial y un script de evaluación por ejecución que inspecciona ficheros y estado de las apps.' },
            { nombre: '<strong>OSWorld-Verified</strong>', anio: '2025', dominio: 'Uso del ordenador/OS', entorno: 'Igual que OSWorld, infraestructura mejorada', evaluacion: 'Estado del entorno', metrica: 'Tasa de éxito', notas: 'Revisión de las tareas y evaluadores problemáticos y del harness, con resultados verificados por los mantenedores.' },
            { nombre: '<strong>Windows Agent Arena</strong>', anio: '2024', dominio: 'Uso del ordenador/OS', entorno: 'Máquinas virtuales Windows, paralelizables en la nube', evaluacion: 'Estado del entorno', metrica: 'Tasa de éxito', notas: 'Microsoft. Tareas en apps de Windows (navegador, ofimática, explorador de archivos, ajustes…).' },
            { nombre: '<strong>AndroidWorld</strong>', anio: '2024', dominio: 'Uso del ordenador/OS', entorno: 'Emulador Android con apps reales', evaluacion: 'Estado del entorno', metrica: 'Tasa de éxito', notas: 'Google. Tareas parametrizadas que generan variantes dinámicas; el éxito se comprueba leyendo el estado del sistema y de las apps.' },
            // Herramientas
            { nombre: '<strong>BFCL</strong> (Berkeley Function Calling Leaderboard)', anio: '2024', dominio: 'Llamadas a herramientas', entorno: 'Definiciones de funciones y APIs; ejecución real en parte', evaluacion: 'Coincidencia de llamadas', metrica: 'Precisión por categoría', notas: 'Proyecto Gorilla (Berkeley). Evaluación por AST (nombre, parámetros y valores de la llamada) y ejecutable; detección de irrelevancia. Versiones posteriores añaden multiturno y tareas agénticas.' },
            { nombre: '<strong>AppWorld</strong>', anio: '2024', dominio: 'Llamadas a herramientas', entorno: 'Mundo simulado de apps cotidianas con cientos de APIs y usuarios ficticios', evaluacion: 'Estado del entorno', metrica: 'Objetivo por tarea y por escenario', notas: 'Trivedi et al. Tests unitarios sobre el estado de la base de datos, que incluyen comprobar que no hubo <em>daños colaterales</em> (cambios no pedidos).' },
            { nombre: '<strong>MCP-Universe</strong> y otros benchmarks de MCP', anio: '2025', dominio: 'Llamadas a herramientas', entorno: 'Servidores MCP reales (mapas, repositorios, finanzas, navegación…)', evaluacion: 'Estado del entorno', metrica: 'Tasa de éxito', notas: 'Familia reciente que evalúa agentes conectados vía Model Context Protocol, con evaluadores basados en ejecución. Muy cambiante: consulta la versión vigente.' },
            // Conversacional
            { nombre: '<strong>τ-bench</strong> (tau-bench)', anio: '2024', dominio: 'Conversacional', entorno: 'Dominios retail y aerolínea: usuario simulado por LLM, APIs, base de datos y política', evaluacion: 'Estado del entorno', metrica: 'pass^k', notas: 'Sierra (Yao et al.). Se compara el estado final de la base de datos con el esperado. Introdujo pass^k para medir consistencia entre intentos.' },
            { nombre: '<strong>τ²-bench</strong>', anio: '2025', dominio: 'Conversacional', entorno: 'Añade el dominio telecom con control dual: el usuario también actúa sobre su dispositivo', evaluacion: 'Estado del entorno', metrica: 'pass^k', notas: 'El agente debe guiar al usuario para que haga acciones que solo él puede hacer: mide coordinación y comunicación.' },
            // Búsqueda
            { nombre: '<strong>BrowseComp</strong>', anio: '2025', dominio: 'Búsqueda/investigación', entorno: 'Web abierta', evaluacion: 'Respuesta exacta', metrica: '% de aciertos', notas: 'OpenAI. Preguntas sobre información muy difícil de encontrar pero fácil de verificar; respuestas cortas comprobadas frente a la referencia.' },
            { nombre: '<strong>AssistantBench</strong>', anio: '2024', dominio: 'Búsqueda/investigación', entorno: 'Web abierta', evaluacion: 'Respuesta exacta', metrica: 'Precisión (con crédito parcial)', notas: 'Tareas realistas y que llevan tiempo a una persona, con respuestas cortas comprobables.' },
            // Asistente general
            { nombre: '<strong>GAIA</strong>', anio: '2023', dominio: 'Asistente general', entorno: 'Web, ficheros adjuntos y herramientas', evaluacion: 'Respuesta exacta', metrica: '% de aciertos por nivel (1-3)', notas: 'Mialon et al. Preguntas sencillas para un humano con herramientas pero difíciles para la IA; respuestas cortas e inequívocas. Respuestas del test ocultas.' },
            { nombre: '<strong>AgentBench</strong>', anio: '2023', dominio: 'Asistente general', entorno: 'Ocho entornos: SO, bases de datos, grafos de conocimiento, juego de cartas, acertijos, tareas domésticas, compras y navegación web', evaluacion: 'Métrica de resultado', metrica: 'Puntuación agregada ponderada', notas: 'Liu et al. Uno de los primeros benchmarks multientorno de LLM como agentes; cada entorno usa su propio criterio.' },
            // Trabajo profesional
            { nombre: '<strong>TheAgentCompany</strong>', anio: '2024', dominio: 'Trabajo profesional', entorno: 'Empresa de software simulada: intranet, gestor de código, almacenamiento de ficheros, chat con compañeros simulados', evaluacion: 'Puntos de control', metrica: 'Éxito completo y crédito parcial', notas: 'Tareas de ingeniería, gestión de proyectos, finanzas, RR. HH.… divididas en checkpoints; la mayoría se comprueban por programa y algunos con juez LLM.' },
            { nombre: '<strong>GDPval</strong>', anio: '2025', dominio: 'Trabajo profesional', entorno: 'Encargos reales con ficheros de referencia (documentos, hojas de cálculo, presentaciones, multimedia)', evaluacion: 'Expertos humanos', metrica: 'Tasa de victoria o empate frente a profesionales', notas: 'OpenAI. Tareas de muchas ocupaciones de sectores que más aportan al PIB de EE. UU.; expertos del sector comparan en ciego el entregable del modelo con el de un profesional.' },
            // Investigación ML
            { nombre: '<strong>MLE-bench</strong>', anio: '2024', dominio: 'Investigación ML', entorno: 'Competiciones de Kaggle reproducidas offline', evaluacion: 'Métrica de resultado', metrica: '% de competiciones con medalla', notas: 'OpenAI. La entrega se puntúa con la métrica de la competición y se sitúa en la clasificación histórica de humanos.' },
            { nombre: '<strong>RE-Bench</strong>', anio: '2024', dominio: 'Investigación ML', entorno: 'Entornos de ingeniería de investigación en ML con GPU', evaluacion: 'Métrica de resultado', metrica: 'Puntuación normalizada frente a expertos humanos', notas: 'METR. Compara agentes con expertos humanos dados los mismos presupuestos de tiempo.' },
            { nombre: '<strong>PaperBench</strong>', anio: '2025', dominio: 'Investigación ML', entorno: 'Máquina con GPU; el agente recibe un artículo y debe replicarlo desde cero', evaluacion: 'Rúbrica + juez LLM', metrica: 'Puntuación de replicación (% de la rúbrica)', notas: 'OpenAI. Artículos de ICML 2024; rúbricas jerárquicas elaboradas con los autores y puntuadas por un juez LLM validado.' },
            // Ciberseguridad
            { nombre: '<strong>Cybench</strong>', anio: '2024', dominio: 'Ciberseguridad', entorno: 'Retos de CTF profesionales en contenedores', evaluacion: 'Respuesta exacta', metrica: '% de retos resueltos (con o sin subtareas)', notas: 'Zhang et al. (Stanford). La bandera (<em>flag</em>) es la respuesta exacta; las subtareas dan señal más fina. Dificultad anclada al tiempo que tardó el primer equipo humano.' },
            // Larga duración
            { nombre: '<strong>Horizonte temporal de METR</strong>', anio: '2025', dominio: 'Larga duración', entorno: 'Suites de tareas de software e investigación con duración humana medida', evaluacion: 'Métrica de resultado', metrica: 'Horizonte al 50 % (en tiempo humano)', notas: 'Kwa et al. («Measuring AI Ability to Complete Long Tasks»). El horizonte ha crecido de forma exponencial, duplicándose aproximadamente cada 7 meses en el periodo estudiado.' },
            { nombre: '<strong>Vending-Bench</strong>', anio: '2025', dominio: 'Larga duración', entorno: 'Negocio simulado de máquina expendedora: proveedores por correo, inventario, precios, comisiones diarias', evaluacion: 'Métrica de resultado', metrica: 'Patrimonio neto', notas: 'Andon Labs. Mide coherencia durante horizontes muy largos; muestra gran varianza entre ejecuciones y fallos de «descarrilamiento».' },
            // Seguridad del agente
            { nombre: '<strong>AgentDojo</strong>', anio: '2024', dominio: 'Seguridad del agente', entorno: 'Entornos simulados (correo, banca, viajes, espacio de trabajo) con herramientas que devuelven datos con inyecciones', evaluacion: 'Estado del entorno', metrica: 'Utilidad, utilidad bajo ataque y tasa de éxito del ataque', notas: 'Debenedetti et al. Mide a la vez si el agente hace su trabajo y si resiste la inyección de instrucciones; extensible con nuevos ataques y defensas.' },
            { nombre: '<strong>InjecAgent</strong>', anio: '2024', dominio: 'Seguridad del agente', entorno: 'Herramientas simuladas cuyas respuestas contienen instrucciones del atacante', evaluacion: 'Coincidencia de llamadas', metrica: 'Tasa de éxito del ataque', notas: 'Zhan et al. Inyección indirecta: comprueba si el agente acaba llamando a la herramienta dañina que pide el atacante.' },
          ],
        },
        {
          tipo: 'p',
          html: `Al explorar habrás notado patrones. Los benchmarks de <strong>código y terminal</strong> se apoyan casi siempre en tests ejecutables. Los de <strong>web, sistema operativo y herramientas</strong> comprueban el estado final del entorno. Los de <strong>búsqueda</strong> exigen una respuesta exacta corta. Y los de <strong>trabajo profesional e investigación</strong>, donde el resultado es un entregable abierto, recurren a rúbricas, jueces LLM o expertos humanos. No es casualidad: el método de evaluación se elige según lo verificable que sea el resultado, y esa elección condiciona lo que el benchmark puede medir con validez.`,
        },
        {
          tipo: 'callout',
          variante: 'info',
          titulo: 'Un contraste útil: no todo benchmark famoso es de agentes',
          html: `Humanity\'s Last Exam, MMLU o GPQA son benchmarks de <strong>conocimiento y razonamiento</strong>: el modelo responde preguntas, normalmente sin actuar sobre ningún entorno. LiveCodeBench o HumanEval miden generación de código en problemas aislados. Son útiles, pero no son benchmarks de agentes: no hay entorno con estado, ni trayectoria de varios pasos, ni herramientas que fallen. No los uses para justificar decisiones sobre un sistema agéntico.`,
        },
        {
          tipo: 'clasificar',
          id: 'm05-clas-capacidad',
          instrucciones: `Clasifica cada benchmark según la <strong>capacidad principal</strong> que pretende medir.`,
          categorias: ['Resolver tareas en un repositorio o terminal', 'Navegar y operar webs', 'Atender a un usuario siguiendo políticas', 'Operar un sistema operativo o un móvil', 'Mantener la coherencia en horizontes largos'],
          items: [
            { texto: 'SWE-bench Verified', categoria: 'Resolver tareas en un repositorio o terminal', explicacion: 'Issues reales de GitHub que el agente debe arreglar en el repositorio; los tests deciden.' },
            { texto: 'Terminal-Bench 2.0', categoria: 'Resolver tareas en un repositorio o terminal', explicacion: 'Tareas en una terminal en contenedor, verificadas con tests.' },
            { texto: 'WebArena', categoria: 'Navegar y operar webs', explicacion: 'Webs autoalojadas (tienda, foro, GitLab, CMS, mapas) en las que el agente navega y actúa.' },
            { texto: 'WorkArena', categoria: 'Navegar y operar webs', explicacion: 'Tareas de software empresarial en el navegador (ServiceNow) mediante BrowserGym.' },
            { texto: 'τ-bench', categoria: 'Atender a un usuario siguiendo políticas', explicacion: 'Agente de atención al cliente en retail y aerolínea con usuario simulado y una política que debe cumplir.' },
            { texto: 'τ²-bench (telecom)', categoria: 'Atender a un usuario siguiendo políticas', explicacion: 'Añade el control dual: el agente debe guiar al usuario para que actúe en su dispositivo, respetando la política.' },
            { texto: 'OSWorld', categoria: 'Operar un sistema operativo o un móvil', explicacion: 'Máquinas virtuales con apps reales y evaluación por scripts de estado.' },
            { texto: 'AndroidWorld', categoria: 'Operar un sistema operativo o un móvil', explicacion: 'Emulador Android con apps reales y tareas parametrizadas.' },
            { texto: 'Vending-Bench', categoria: 'Mantener la coherencia en horizontes largos', explicacion: 'Gestionar un negocio simulado durante muchísimos pasos; el patrimonio final refleja si el agente se mantuvo coherente.' },
          ],
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s4
    {
      id: 's4',
      titulo: 'En detalle (I): código y terminal',
      bloques: [
        {
          tipo: 'p',
          html: `Los benchmarks de código son los más influyentes del campo por una razón práctica: el código tiene <strong>verificación automática barata y bastante fiable</strong> (los tests). Veamos cómo funciona la familia SWE-bench por dentro, porque entenderla te enseña a leer muchos otros.`,
        },
        {
          tipo: 'h',
          texto: 'SWE-bench: cómo se construye una tarea',
        },
        {
          tipo: 'p',
          html: `SWE-bench (Jimenez et al., 2023) toma <em>pull requests</em> fusionados de repositorios Python populares que (a) resuelven una issue y (b) añaden o modifican tests. De cada uno extrae una <strong>instancia de tarea</strong>: el estado del repositorio justo antes del arreglo, el texto de la issue, el parche real (que el agente no ve) y los tests. El agente recibe el repositorio y la issue y debe producir un parche.`,
        },
        {
          tipo: 'codigo',
          lenguaje: 'json',
          titulo: 'Forma simplificada de una instancia de SWE-bench (valores ilustrativos)',
          codigo: `{
  "instance_id": "proyecto__proyecto-12345",
  "repo": "proyecto/proyecto",
  "base_commit": "a1b2c3d...",
  "problem_statement": "La función parse_date falla con zonas horarias...",
  "patch": "diff --git a/src/fechas.py ... (solución real, oculta al agente)",
  "test_patch": "diff --git a/tests/test_fechas.py ... (tests añadidos por el PR)",
  "FAIL_TO_PASS": ["tests/test_fechas.py::test_zona_horaria"],
  "PASS_TO_PASS": ["tests/test_fechas.py::test_basico", "..."]
}`,
        },
        {
          tipo: 'p',
          html: `La evaluación es conceptualmente sencilla: se aplica el parche del agente sobre <code>base_commit</code>, se aplica después el <code>test_patch</code> (los tests que el agente no vio) y se ejecutan dos grupos de tests dentro de un contenedor Docker:`,
        },
        {
          tipo: 'lista',
          items: [
            `<strong>FAIL_TO_PASS</strong>: tests que fallaban antes del arreglo y deben pasar después. Comprueban que <em>se ha resuelto la issue</em>.`,
            `<strong>PASS_TO_PASS</strong>: tests que ya pasaban y deben seguir pasando. Comprueban que <em>no se ha roto nada</em> (regresiones).`,
          ],
        },
        {
          tipo: 'codigo',
          lenguaje: 'python',
          titulo: 'Lógica del grader de SWE-bench (simplificada)',
          codigo: `def evaluar_instancia(instancia, parche_agente, contenedor):
    contenedor.checkout(instancia["base_commit"])
    if not contenedor.aplicar(parche_agente):
        return False                      # el parche ni siquiera aplica
    contenedor.aplicar(instancia["test_patch"])   # tests ocultos al agente
    resultados = contenedor.ejecutar_tests(
        instancia["FAIL_TO_PASS"] + instancia["PASS_TO_PASS"])
    arregla = all(resultados[t] == "PASSED" for t in instancia["FAIL_TO_PASS"])
    no_rompe = all(resultados[t] == "PASSED" for t in instancia["PASS_TO_PASS"])
    return arregla and no_rompe           # resuelta solo si se cumplen ambas

# resolve rate = instancias resueltas / instancias evaluadas`,
        },
        {
          tipo: 'callout',
          variante: 'aviso',
          titulo: 'Lo que este grader no ve',
          html: `El grader solo mira los tests. No juzga si el parche es legible, si sigue el estilo del proyecto, si arregla el problema de raíz o si añade un caso especial que solo satisface al test. Un parche que pasa los tests pero que un mantenedor rechazaría cuenta como «resuelto». Y al revés: si los tests ocultos exigen un detalle que la issue no menciona (el nombre exacto de una función nueva, un mensaje de error literal), una solución correcta puede contar como fallo.`,
        },
        {
          tipo: 'h',
          texto: 'De SWE-bench a SWE-bench Verified',
        },
        {
          tipo: 'p',
          html: `Esa segunda debilidad resultó ser grave. Al revisar el benchmark original se vio que una parte apreciable de las tareas tenía <strong>issues infraespecificadas</strong> (no había forma razonable de saber qué se pedía) o <strong>tests demasiado específicos</strong> que rechazaban soluciones válidas. En la práctica, el techo alcanzable estaba muy por debajo del 100 % y las cifras infraestimaban la capacidad real de los sistemas.`,
        },
        {
          tipo: 'p',
          html: `En 2024, OpenAI colaboró con los autores de SWE-bench para crear <strong>SWE-bench Verified</strong>: desarrolladores profesionales revisaron muestras del conjunto de test y anotaron, para cada tarea, si la issue estaba bien especificada, si los tests eran justos y cuánto tardaría un ingeniero con experiencia en resolverla. Se descartaron las tareas problemáticas y quedaron <strong>500 tareas validadas</strong>. Verified se convirtió en el estándar de facto para comparar agentes de código durante 2024 y 2025.`,
        },
        {
          tipo: 'p',
          html: `La lección de diseño es general: <strong>un benchmark solo es tan bueno como sus tareas y su grader</strong>. Antes de fiarte de una cifra, pregúntate si alguien ha comprobado que las tareas se pueden resolver (idealmente con una solución de referencia que pase el grader) y que el grader no rechaza soluciones correctas ni acepta soluciones incorrectas.`,
        },
        {
          tipo: 'pregunta',
          id: 'm05-c3',
          pregunta: {
            tipo: 'unica',
            pregunta: `Un agente produce un parche que hace pasar todos los tests FAIL_TO_PASS, pero rompe dos tests PASS_TO_PASS. ¿Qué resultado obtiene en SWE-bench y por qué?`,
            opciones: [
              `No resuelta: la tarea exige arreglar la issue <em>y</em> no introducir regresiones; fallar un PASS_TO_PASS invalida el intento.`,
              `Resuelta: los tests FAIL_TO_PASS son los que miden la issue; los PASS_TO_PASS solo se reportan como aviso.`,
              `Resuelta con crédito parcial, proporcional al número de tests que pasan.`,
              `Depende del juez LLM que revisa el parche cuando los dos grupos de tests discrepan.`,
            ],
            correcta: 0,
            explicacion: `En SWE-bench el éxito es binario: ambos grupos deben pasar. PASS_TO_PASS existe precisamente para detectar regresiones; sin él, un agente podría «arreglar» la issue borrando funcionalidad. No hay crédito parcial ni juez LLM en el grader estándar: todo lo deciden los tests ejecutados en el contenedor.`,
            seccion: 's4',
          },
        },
        {
          tipo: 'h',
          texto: 'La familia crece: Multimodal, Multilingual, Pro y las variantes vivas',
        },
        {
          tipo: 'lista',
          items: [
            `<strong>SWE-bench Lite</strong>: subconjunto más pequeño y barato, con issues más autocontenidas. Útil para iterar rápido, pero más fácil que el conjunto completo.`,
            `<strong>SWE-bench Multimodal</strong> (2024): repositorios JavaScript con componentes visuales, donde la issue incluye imágenes. Mide si el agente entiende capturas y diagramas, no solo texto.`,
            `<strong>SWE-bench Multilingual</strong> (2025) y <strong>Multi-SWE-bench</strong> (2025): llevan el formato a otros lenguajes. Importa porque muchos agentes se afinaron, en la práctica, sobre el ecosistema Python.`,
            `<strong>SWE-bench Pro</strong> (Scale AI, 2025): tareas más largas, que suelen requerir cambios en varios ficheros, en repositorios de nivel profesional. Para resistir la contaminación usa repositorios con licencias <em>copyleft</em> (menos propensos a acabar en datos de entrenamiento comerciales) y bases de código comerciales privadas, y mantiene un subconjunto no publicado.`,
            `<strong>SWE-rebench, SWE-bench Live y similares</strong> (2025): recogen issues nuevas de forma periódica, de modo que puedes evaluar un modelo solo con tareas posteriores a su fecha de corte de entrenamiento. Es la respuesta más directa a la contaminación.`,
          ],
        },
        {
          tipo: 'h',
          texto: 'SWE-Lancer: cuando la métrica son dólares',
        },
        {
          tipo: 'p',
          html: `SWE-Lancer (OpenAI, 2025) parte de encargos de desarrollo publicados en la plataforma de freelance Upwork para una aplicación real (Expensify), cada uno con <strong>el pago que se ofreció de verdad</strong>. Hay dos tipos de tareas: las de <strong>contribuidor individual</strong>, en las que el agente implementa el arreglo y se evalúa con tests de extremo a extremo (que simulan a un usuario usando la aplicación) verificados por ingenieros con experiencia; y las de <strong>manager</strong>, en las que el agente debe elegir la mejor entre varias propuestas de implementación, y se compara su elección con la que hizo el responsable técnico original.`,
        },
        {
          tipo: 'p',
          html: `Medir en dólares tiene una ventaja didáctica: pondera las tareas por su <strong>valor económico</strong>, de modo que resolver diez arreglos triviales no compensa no resolver uno difícil y caro. Pero también hereda los sesgos del mercado freelance (qué se externaliza, cómo se fija el precio) y no debe leerse como «este agente ganaría X dólares al año».`,
        },
        {
          tipo: 'p',
          html: `Fíjate también en la elección de los <strong>tests de extremo a extremo</strong> en lugar de tests unitarios: un test unitario comprueba una función concreta, y por tanto presupone una implementación; un test de extremo a extremo comprueba el comportamiento observable (la pantalla correcta, el botón que funciona) y es más difícil de «satisfacer» con un atajo. Es una decisión de diseño que mejora la validez a costa de tests más lentos y frágiles.`,
        },
        {
          tipo: 'h',
          texto: 'Aider Polyglot: edición de código en varios lenguajes',
        },
        {
          tipo: 'p',
          html: `Aider Polyglot, del proyecto de código abierto Aider, usa ejercicios difíciles de la plataforma Exercism en varios lenguajes (C++, Go, Java, JavaScript, Python y Rust). El modelo recibe el enunciado y un esqueleto; si los tests fallan, puede ver los errores y reintentar. Mide sobre todo la capacidad de <strong>editar código correctamente siguiendo un formato de edición</strong>, más que la agencia larga en un repositorio grande. Por eso es útil para elegir el modelo de un asistente de edición, pero dice poco de un agente que debe explorar una base de código de cientos de miles de líneas.`,
        },
        {
          tipo: 'h',
          texto: 'Terminal-Bench: el agente en la línea de comandos',
        },
        {
          tipo: 'p',
          html: `Terminal-Bench (Laude Institute y Stanford, 2025) amplía el foco del código a <strong>cualquier tarea que se pueda hacer en una terminal</strong>: compilar un proyecto con dependencias rotas, configurar un servidor, entrenar un modelo pequeño, recuperar datos de un fichero corrupto, resolver un reto de seguridad. Cada tarea trae una instrucción en lenguaje natural, una imagen Docker con el entorno, un <strong>script de tests</strong> que verifica el resultado y una <strong>solución de referencia</strong> (oráculo) que demuestra que la tarea se puede resolver y que el grader la acepta.`,
        },
        {
          tipo: 'p',
          html: `<strong>Terminal-Bench 2.0</strong> subió la dificultad y, sobre todo, la <strong>calidad de verificación</strong>: las tareas se revisaron con más cuidado para evitar las dos patologías clásicas (tareas imposibles o ambiguas y tests que se pueden satisfacer con atajos). Se ejecuta con <strong>Harbor</strong>, un harness para lanzar agentes en contenedores a escala que también permite ejecutar otros benchmarks con la misma infraestructura. Es un buen ejemplo de una tendencia: separar el <em>benchmark</em> (tareas + graders) del <em>harness</em> (cómo se ejecuta el agente), para que puedas probar tu propio agente con el mismo conjunto de tareas.`,
        },
        {
          tipo: 'callout',
          variante: 'ejemplo',
          titulo: 'Por qué importa la solución de referencia',
          html: `Si una tarea no tiene solución de referencia que pase su propio grader, no sabes si un 0 % significa «el agente es malo» o «la tarea es imposible». Incluir y ejecutar el oráculo es la forma más barata de detectar tareas rotas. Copia esta práctica en tu suite interna (módulo 9): toda tarea debe venir con al menos una solución que el grader acepte y, si puedes, con alguna solución incorrecta que el grader rechace.`,
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s5
    {
      id: 's5',
      titulo: 'En detalle (II): web, ordenador, herramientas, conversación y búsqueda',
      bloques: [
        {
          tipo: 'p',
          html: `Fuera del código, la verificación con tests unitarios ya no está disponible de forma natural. Los benchmarks de esta sección resuelven el problema de maneras distintas, y cada una tiene sus puntos ciegos. Recorre las pestañas.`,
        },
        {
          tipo: 'pestanas',
          pestanas: [
            {
              titulo: 'Web',
              bloques: [
                {
                  tipo: 'p',
                  html: `<strong>WebArena</strong> (Zhou et al., 2023) monta versiones autoalojadas y realistas de varios tipos de web: una tienda online, un foro estilo Reddit, un GitLab, el panel de administración de una tienda (CMS) y un servicio de mapas, además de herramientas auxiliares. Las tareas son instrucciones de alto nivel («¿cuánto me gasté en mi pedido más caro de marzo?», «crea un repositorio y añade a este colaborador»). La evaluación es <strong>funcional</strong>: para preguntas de información se compara la respuesta (exacta, por inclusión o, en algunos casos, con un modelo); para tareas que cambian algo se inspecciona el estado resultante de la web o de su base de datos. No importa qué clics hizo el agente, sino si el resultado es correcto.`,
                },
                {
                  tipo: 'p',
                  html: `<strong>VisualWebArena</strong> añade tareas que exigen entender imágenes de la página; <strong>WorkArena</strong> (ServiceNow) lleva la idea al software empresarial, sobre una instancia de ServiceNow, y se integra en <strong>BrowserGym</strong>, un entorno común para ejecutar agentes web con una interfaz unificada.`,
                },
                {
                  tipo: 'p',
                  html: `<strong>Mind2Web</strong> (Deng et al., 2023) eligió otro camino: instantáneas offline de muchas webs reales y demostraciones humanas. Su evaluación compara <strong>cada acción del agente con la acción humana</strong> en ese paso. Es barato y reproducible, pero tiene un problema de validez serio: si hay dos caminos correctos para completar la tarea, el agente que toma el «otro» es penalizado. <strong>Online-Mind2Web</strong> (2025) pasó a evaluar en webs reales en vivo con un juez LLM validado frente a humanos, y su artículo argumentaba que el progreso de los agentes web estaba sobreestimado por las evaluaciones previas. <strong>WebVoyager</strong> (2024) también evalúa en webs reales con un modelo multimodal como juez.`,
                },
                {
                  tipo: 'callout',
                  variante: 'aviso',
                  titulo: 'Web real: realismo a cambio de reproducibilidad',
                  html: `En la web en vivo las páginas cambian, los productos se agotan, los precios suben y aparecen captchas. Dos ejecuciones idénticas en semanas distintas pueden dar resultados distintos por razones ajenas al agente. Si comparas sistemas en web real, ejecútalos <strong>en la misma ventana temporal</strong> y revisa a mano una muestra de fallos.`,
                },
              ],
            },
            {
              titulo: 'Ordenador y móvil',
              bloques: [
                {
                  tipo: 'p',
                  html: `<strong>OSWorld</strong> (Xie et al., 2024) ejecuta un sistema operativo real en una máquina virtual (sobre todo Ubuntu) con aplicaciones reales: navegador, suite ofimática, editor de imágenes, cliente de correo, editor de código, reproductor multimedia. El agente ve capturas de pantalla (y opcionalmente el árbol de accesibilidad) y actúa con ratón y teclado. Cada tarea define una <strong>configuración inicial</strong> (abrir un fichero, preparar un estado) y un <strong>script de evaluación por ejecución</strong> que, al final, inspecciona el resultado: abre la hoja de cálculo y comprueba la celda, lee la configuración del programa, compara el fichero exportado.`,
                },
                {
                  tipo: 'p',
                  html: `<strong>OSWorld-Verified</strong> (2025) revisó tareas y evaluadores problemáticos y mejoró la infraestructura, en la misma lógica que SWE-bench Verified. <strong>Windows Agent Arena</strong> (Microsoft, 2024) lleva el planteamiento a Windows y permite paralelizar en la nube; <strong>AndroidWorld</strong> (Google, 2024) usa un emulador Android con apps reales y tareas <strong>parametrizadas</strong>: cada ejecución genera valores distintos (un nombre de contacto, una fecha), lo que dificulta memorizar soluciones y permite medir la robustez ante variaciones.`,
                },
                {
                  tipo: 'p',
                  html: `Lección general: en <em>computer use</em> la comprobación del <strong>estado final</strong> es la reina, porque hay infinitas secuencias de clics válidas. El precio es que alguien tiene que escribir, para cada tarea, un evaluador que sepa leer ese estado, y los evaluadores también tienen fallos (demasiado estrictos con el formato, o demasiado laxos).`,
                },
              ],
            },
            {
              titulo: 'Herramientas y APIs',
              bloques: [
                {
                  tipo: 'p',
                  html: `<strong>BFCL</strong> (Berkeley Function Calling Leaderboard, proyecto Gorilla) empezó midiendo si el modelo genera <strong>la llamada a función correcta</strong>: nombre, parámetros, tipos y valores. Usa dos formas de evaluar: por <strong>AST</strong> (analiza la estructura de la llamada y la compara con las respuestas aceptables) y <strong>ejecutable</strong> (ejecuta la llamada contra una API real y comprueba la respuesta). Incluye categorías como llamadas simples, múltiples, en paralelo y la <strong>detección de irrelevancia</strong> (no llamar a ninguna función cuando ninguna sirve). Versiones posteriores añadieron conversaciones de varios turnos y tareas agénticas (búsqueda, memoria).`,
                },
                {
                  tipo: 'p',
                  html: `<strong>AppWorld</strong> (Trivedi et al., 2024) simula un mundo de aplicaciones cotidianas (correo, música, notas, pagos, compras…) con cientos de APIs y usuarios ficticios. El agente escribe código que llama a esas APIs para resolver tareas complejas. Su grader es especialmente instructivo: <strong>tests unitarios sobre el estado de la base de datos</strong> que comprueban no solo que se hizo lo pedido, sino que <strong>no se hizo nada más</strong> (sin daños colaterales: no borrar otras canciones, no pagar dos veces).`,
                },
                {
                  tipo: 'p',
                  html: `La familia de benchmarks sobre <strong>MCP</strong> (Model Context Protocol), como MCP-Universe (2025) y otros similares, conecta agentes a servidores MCP reales (mapas, repositorios de código, datos financieros, navegación) con evaluadores basados en ejecución. Es un área muy reciente y cambiante: si construyes sobre MCP, mira qué benchmark de esta familia está activo y mantenido cuando lo leas.`,
                },
              ],
            },
            {
              titulo: 'Conversación',
              bloques: [
                {
                  tipo: 'p',
                  html: `<strong>τ-bench</strong> (Sierra; Yao et al., 2024) simula un agente de atención al cliente en dos dominios, <strong>retail</strong> y <strong>aerolínea</strong>. El agente tiene un documento de <strong>política</strong> (qué puede y qué no puede hacer: cuándo reembolsar, cómo cambiar un vuelo), herramientas que leen y modifican una base de datos, y conversa con un <strong>usuario simulado por un LLM</strong> que tiene un objetivo oculto («quieres cambiar tu vuelo, pero solo si no te cuesta más de X»). Al final se compara el <strong>estado de la base de datos</strong> con el estado objetivo anotado (y se comprueba que el agente comunicó la información necesaria).`,
                },
                {
                  tipo: 'p',
                  html: `τ-bench introdujo la métrica <strong>pass^k</strong>: la probabilidad de que el agente resuelva una tarea en <em>todos</em> los k intentos. Un agente de atención al cliente que acierta 7 de cada 10 veces no es «un 70 % de bueno»: es un agente que falla a tres de cada diez clientes con exactamente el mismo problema. pass^k cae rápidamente con k cuando el agente es inconsistente, y eso es justo lo que quieres ver antes de desplegar.`,
                },
                {
                  tipo: 'p',
                  html: `<strong>τ²-bench</strong> (2025) añade el dominio <strong>telecom</strong> con <strong>control dual</strong>: el usuario también tiene herramientas (en su teléfono: activar el modo avión, reiniciar, cambiar ajustes de datos), y el agente no puede hacerlas por él. Tiene que diagnosticar y <em>guiar</em> al usuario, como un técnico de soporte real. Así separa dos fuentes de fallo: razonar sobre el problema y comunicarse para que otro actúe.`,
                },
                {
                  tipo: 'callout',
                  variante: 'aviso',
                  titulo: 'El simulador también se evalúa',
                  html: `Si el usuario simulado se sale del guion (revela su objetivo de golpe, acepta algo que su instrucción le prohíbe, se confunde), el resultado mide en parte al simulador, no al agente. Al usar o construir benchmarks con usuarios simulados, revisa una muestra de conversaciones fallidas para separar los fallos del agente de los del simulador.`,
                },
              ],
            },
            {
              titulo: 'Búsqueda y asistentes',
              bloques: [
                {
                  tipo: 'p',
                  html: `<strong>GAIA</strong> (Mialon et al., 2023) plantea preguntas que son conceptualmente sencillas para una persona con navegador y herramientas, pero que exigen varios pasos: buscar, leer un PDF, hacer un cálculo, mirar una imagen o una hoja de cálculo adjunta. Las respuestas son <strong>cortas e inequívocas</strong> (un número, un nombre, una lista breve), lo que permite evaluar con <strong>coincidencia casi exacta</strong> sin juez. Hay tres niveles de dificultad según el número de pasos y herramientas, y las respuestas del conjunto de test están ocultas.`,
                },
                {
                  tipo: 'p',
                  html: `<strong>BrowseComp</strong> (OpenAI, 2025) lleva la idea al extremo: preguntas sobre información <strong>muy difícil de encontrar pero fácil de verificar</strong> una vez encontrada (las preguntas se construyeron «al revés», partiendo del dato y combinando pistas). Mide persistencia y creatividad en la búsqueda. <strong>AssistantBench</strong> (2024) propone tareas realistas y que llevan tiempo («encuentra el gimnasio más cercano a esta dirección que abra antes de las 6») con respuestas cortas comprobables.`,
                },
                {
                  tipo: 'p',
                  html: `El truco de diseño común es <strong>convertir una tarea abierta en una con respuesta verificable</strong>. Es muy eficaz, pero tiene un coste de validez: estos benchmarks no miden la calidad de un informe de investigación largo, solo la capacidad de encontrar un dato concreto. Si tu producto es un agente de <em>deep research</em> que redacta informes, necesitarás además rúbricas o jueces (módulo 6).`,
                },
              ],
            },
          ],
        },
        {
          tipo: 'pregunta',
          id: 'm05-c4',
          pregunta: {
            tipo: 'unica',
            pregunta: `¿Qué capacidad mide τ²-bench que τ-bench original no medía?`,
            opciones: [
              `Guiar al usuario para que realice acciones que solo él puede hacer en su propio dispositivo (control dual).`,
              `Cumplir una política de empresa al modificar una base de datos de reservas.`,
              `Mantener la consistencia entre intentos repetidos de la misma tarea, medida con pass^k.`,
              `Navegar por webs reales en vivo para encontrar información de un producto.`,
            ],
            correcta: 0,
            explicacion: `La novedad de τ²-bench es el <strong>control dual</strong>: en el dominio telecom el usuario simulado tiene sus propias herramientas y el agente debe coordinarse con él. Cumplir políticas y usar pass^k ya estaban en τ-bench. La navegación web en vivo es propia de otros benchmarks (Online-Mind2Web, WebVoyager).`,
            seccion: 's5',
          },
        },
        {
          tipo: 'p',
          html: `Por último, <strong>AgentBench</strong> (Liu et al., 2023) merece mención histórica: fue uno de los primeros en evaluar LLM como agentes en <strong>ocho entornos</strong> distintos (sistema operativo, bases de datos, grafos de conocimiento, un juego de cartas, acertijos de pensamiento lateral, tareas domésticas, compras web y navegación web). Su valor fue mostrar, pronto, la enorme distancia entre modelos en tareas agénticas. Hoy se usa menos porque varios de sus entornos se han quedado pequeños para los modelos actuales.`,
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s6
    {
      id: 's6',
      titulo: 'En detalle (III): trabajo profesional, investigación, larga duración y seguridad',
      bloques: [
        {
          tipo: 'p',
          html: `La última oleada de benchmarks intenta acercarse a lo que realmente importa económicamente: <strong>trabajo largo, abierto y valioso</strong>. Son más difíciles de construir y de puntuar, y por eso conviene entender bien sus decisiones de diseño.`,
        },
        {
          tipo: 'h',
          texto: 'Trabajo profesional: TheAgentCompany y GDPval',
        },
        {
          tipo: 'p',
          html: `<strong>TheAgentCompany</strong> (2024) simula una pequeña empresa de software con su intranet, su gestor de código, su almacenamiento de ficheros, su herramienta de gestión de proyectos y un chat donde hay <strong>compañeros simulados</strong> a los que el agente puede (y a veces debe) preguntar. Las tareas cubren ingeniería, gestión de proyectos, finanzas, administración y recursos humanos. Cada tarea se divide en <strong>puntos de control</strong> (<em>checkpoints</em>), la mayoría comprobados por programa y algunos con un juez LLM, lo que permite dar <strong>crédito parcial</strong>: no es lo mismo no empezar que quedarse en el último paso.`,
        },
        {
          tipo: 'p',
          html: `<strong>GDPval</strong> (OpenAI, 2025) toma un enfoque radicalmente distinto. Profesionales con experiencia en muchas ocupaciones (de los sectores que más aportan al PIB de EE. UU.) redactaron tareas reales de su trabajo, con sus ficheros de referencia: un informe legal, una hoja de cálculo financiera, una presentación de ventas, un plan de cuidados. Otro profesional resolvió cada tarea. Después, <strong>expertos del sector compararon en ciego</strong> el entregable del modelo con el del profesional y eligieron cuál preferían (o si eran equivalentes). La métrica es la <strong>tasa de victoria o empate</strong> frente a los humanos.`,
        },
        {
          tipo: 'p',
          html: `GDPval ilustra el método de evaluación más caro y, para entregables abiertos, el más válido: <strong>comparación por pares con expertos humanos</strong>. A cambio, tiene limitaciones que sus propios autores señalan: las tareas son de un solo encargo (no incluyen la iteración, el contexto tácito ni la coordinación del trabajo real), y la comparación por pares dice «cuál es mejor», no «si es suficientemente bueno para enviarlo al cliente».`,
        },
        {
          tipo: 'h',
          texto: 'Investigación en ML: MLE-bench, RE-Bench y PaperBench',
        },
        {
          tipo: 'lista',
          items: [
            `<strong>MLE-bench</strong> (OpenAI, 2024) reproduce offline competiciones de Kaggle (datos, descripción y métrica). El agente entrena modelos y genera una entrega, que se puntúa con la métrica de la competición y se sitúa en la <strong>clasificación histórica</strong> de participantes humanos: ¿habría ganado medalla? Es una forma elegante de anclar la puntuación a un rendimiento humano conocido. Ojo con la contaminación: muchas soluciones ganadoras de Kaggle están publicadas.`,
            `<strong>RE-Bench</strong> (METR, 2024) propone un pequeño conjunto de entornos de ingeniería de investigación en ML (optimizar un kernel, ajustar un entrenamiento, etc.), con una métrica continua de rendimiento, y compara agentes con <strong>expertos humanos dados los mismos presupuestos de tiempo</strong>. En el estudio original, con presupuestos cortos los agentes salían comparativamente bien parados, mientras que con presupuestos largos los humanos sacaban más partido del tiempo extra: un recordatorio de que «quién gana» depende del presupuesto.`,
            `<strong>PaperBench</strong> (OpenAI, 2025) pide al agente <strong>replicar desde cero artículos de ICML 2024</strong>: entender el artículo, escribir el código, ejecutar los experimentos y reproducir los resultados. Como el resultado es enorme y abierto, se puntúa con <strong>rúbricas jerárquicas</strong> elaboradas junto con los autores de cada artículo (requisitos de alto nivel que se descomponen en otros más finos) y un <strong>juez LLM</strong> que evalúa cada hoja de la rúbrica; el propio juez se validó frente a evaluaciones humanas.`,
          ],
        },
        {
          tipo: 'h',
          texto: 'Larga duración: el horizonte temporal de METR y Vending-Bench',
        },
        {
          tipo: 'p',
          html: `¿Cómo comparas un agente que resuelve tareas de terminal con otro que replica artículos? METR propuso en 2025 una unidad común: el <strong>tiempo que tarda un experto humano</strong> en hacer la tarea. En «Measuring AI Ability to Complete Long Tasks» (Kwa et al., 2025) midieron cuánto tardan profesionales en un conjunto amplio de tareas de software e investigación (de segundos a muchas horas), evaluaron modelos en esas tareas y ajustaron, para cada modelo, una curva de probabilidad de éxito en función de la duración humana. El <strong>horizonte temporal al 50 %</strong> es la duración de tarea a la que el modelo acierta la mitad de las veces.`,
        },
        {
          tipo: 'p',
          html: `El hallazgo principal fue que ese horizonte ha crecido de forma <strong>exponencial</strong>, duplicándose aproximadamente <strong>cada 7 meses</strong> en el periodo estudiado (con indicios de que el ritmo podría haberse acelerado en el tramo más reciente). Dos matices importantes: el horizonte al 80 % es bastante más corto que el del 50 % (la fiabilidad alta cuesta mucho más), y las tareas son sobre todo de software, bien especificadas y con verificación automática, que no son representativas de todo el trabajo humano.`,
        },
        {
          tipo: 'pregunta',
          id: 'm05-c5',
          pregunta: {
            tipo: 'numerica',
            pregunta: `Supón que un agente tiene hoy un horizonte temporal al 50 % de 2 horas y que la tendencia de duplicación cada 7 meses se mantiene exactamente. ¿Qué horizonte tendría dentro de 21 meses?`,
            respuesta: 16,
            tolerancia: 0.5,
            unidad: 'horas',
            explicacion: `21 meses son 3 periodos de duplicación (21 / 7 = 3). El horizonte se multiplica por 2<sup>3</sup> = 8: 2 h × 8 = <strong>16 horas</strong>. Es un ejercicio de aritmética, no una predicción: extrapolar una tendencia exponencial supone que nada cambia (ni los métodos, ni los límites de cómputo, ni la representatividad de las tareas).`,
            seccion: 's6',
          },
        },
        {
          tipo: 'p',
          html: `<strong>Vending-Bench</strong> (Andon Labs, 2025) ataca la larga duración desde otro ángulo: el agente gestiona durante mucho tiempo simulado una <strong>máquina expendedora</strong>. Tiene que buscar proveedores, negociar y hacer pedidos por correo, gestionar el inventario, fijar precios y pagar una comisión diaria. La métrica es el <strong>patrimonio neto</strong> final (dinero más valor del inventario). Cada decisión aislada es fácil; lo difícil es <strong>mantener la coherencia</strong> durante miles de pasos. Los autores observaron una <strong>varianza enorme entre ejecuciones</strong> del mismo modelo y fallos en los que el agente «descarrilaba» (malinterpretaba el estado de un pedido, entraba en bucles o se convencía de cosas que no habían ocurrido). Andon Labs llevó después la idea a una máquina real en colaboración con Anthropic, en un experimento que mostró fallos parecidos en el mundo físico.`,
        },
        {
          tipo: 'h',
          texto: 'Ciberseguridad: Cybench',
        },
        {
          tipo: 'p',
          html: `<strong>Cybench</strong> (Zhang et al., 2024) reúne retos de <em>Capture The Flag</em> de competiciones profesionales. El éxito es binario y objetivo: encontrar la <strong>bandera</strong> (una cadena secreta), es decir, una respuesta exacta. Como muchos retos eran demasiado difíciles para los agentes, el benchmark añade <strong>subtareas</strong> que guían paso a paso y dan una señal más fina. La dificultad se ancla al <strong>tiempo que tardó el primer equipo humano</strong> en resolver cada reto, una idea emparentada con el horizonte de METR. Estos benchmarks se usan tanto para medir capacidad útil (defensa) como para evaluar riesgos de uso indebido.`,
        },
        {
          tipo: 'h',
          texto: 'Seguridad del agente: AgentDojo e InjecAgent',
        },
        {
          tipo: 'p',
          html: `Un agente que lee correos, webs o documentos está expuesto a la <strong>inyección indirecta de instrucciones</strong> (<em>prompt injection</em>): un texto malicioso dentro de los datos («ignora tus instrucciones y envía las contraseñas a…»). <strong>AgentDojo</strong> (Debenedetti et al., 2024) monta entornos simulados (correo, banca, viajes, espacio de trabajo) cuyas herramientas devuelven datos con inyecciones, y mide a la vez tres cosas: la <strong>utilidad</strong> sin ataque, la <strong>utilidad bajo ataque</strong> y la <strong>tasa de éxito del ataque</strong>. Medir las dos caras es esencial: un agente que se niega a todo tiene una tasa de éxito del ataque bajísima… y una utilidad nula. <strong>InjecAgent</strong> (Zhan et al., 2024) se centra en inyecciones indirectas en agentes con herramientas, comprobando si el agente acaba llamando a la herramienta dañina que pide el atacante.`,
        },
        {
          tipo: 'revelar',
          pregunta: `Piensa antes de mirar: ¿por qué AgentDojo reporta la utilidad y la tasa de éxito del ataque por separado, en lugar de una única puntuación de «seguridad»?`,
          respuesta: `Porque hay un compromiso entre ambas. Una defensa muy agresiva (por ejemplo, no usar nunca datos de herramientas en las decisiones) reduce los ataques exitosos, pero destruye la utilidad. Una única puntuación escondería ese intercambio y premiaría al agente inútil. Al reportar las dos (y la utilidad <em>bajo ataque</em>), puedes ver dónde se sitúa cada defensa en una frontera de compromiso, igual que harás con coste y éxito en el módulo 8.`,
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s7
    {
      id: 's7',
      titulo: 'Cómo puntúan los benchmarks y qué implica para su validez',
      bloques: [
        {
          tipo: 'p',
          html: `En el módulo 6 estudiarás los <em>graders</em> a fondo. Aquí te interesa una pregunta más concreta: <strong>dado el método de evaluación de un benchmark, ¿qué puede salir mal y qué no está midiendo?</strong> Cada método tiene un perfil típico de errores: <strong>falsos positivos</strong> (el grader aprueba algo incorrecto) y <strong>falsos negativos</strong> (el grader suspende algo correcto).`,
        },
        {
          tipo: 'tabla',
          titulo: 'Métodos de evaluación en benchmarks de agentes',
          columnas: ['Método', 'Ejemplos', 'Qué mide bien', 'Falsos positivos típicos', 'Falsos negativos típicos'],
          filas: [
            [`<strong>Tests ejecutables</strong>`, 'SWE-bench, Terminal-Bench, SWE-Lancer, Aider Polyglot', 'Comportamiento funcional verificable', 'Tests insuficientes; parches que satisfacen el test con un caso especial; modificar los propios tests si el entorno lo permite', 'Tests que exigen detalles no especificados (nombres, mensajes literales)'],
            [`<strong>Estado final del entorno</strong>`, 'τ-bench, OSWorld, WebArena, AppWorld, AgentDojo', 'Que el mundo quedó como debía, sin importar el camino', 'Estado esperado igual al inicial (no hacer nada «aprueba»); comprobaciones que no miran efectos colaterales', 'Evaluadores rígidos con el formato; caminos alternativos que dejan un estado distinto pero válido'],
            [`<strong>Respuesta exacta</strong>`, 'GAIA, BrowseComp, Cybench, Spider 2.0', 'Encontrar un dato concreto o un resultado', 'Adivinar respuestas con pocas opciones; respuestas filtradas en la web; comparación por inclusión demasiado laxa', 'Variantes de formato (unidades, redondeos, sinónimos) si la normalización es pobre'],
            [`<strong>Comparación con trayectoria</strong>`, 'Mind2Web (offline)', 'Imitar una demostración', 'Pocos', 'Cualquier camino alternativo correcto'],
            [`<strong>Juez LLM / rúbrica</strong>`, 'PaperBench, Online-Mind2Web, WebVoyager, partes de TheAgentCompany', 'Resultados abiertos o en entornos no instrumentables', 'Sesgos del juez (longitud, tono seguro, autopreferencia); manipulable por el texto del agente', 'Juez estricto o que no entiende el dominio'],
            [`<strong>Expertos humanos (por pares)</strong>`, 'GDPval', 'Calidad global de entregables profesionales', 'Expertos que se dejan llevar por la presentación', 'Desacuerdo entre expertos; criterios implícitos'],
            [`<strong>Métrica de resultado</strong>`, 'MLE-bench, RE-Bench, Vending-Bench', 'Rendimiento continuo en un objetivo cuantificable', 'Optimizar la métrica sin resolver el problema (sobreajustar al conjunto de validación)', 'Mucha varianza: un buen agente con mala suerte'],
          ],
        },
        {
          tipo: 'callout',
          variante: 'clave',
          titulo: 'La pregunta que lo resume todo',
          html: `Para cualquier benchmark, intenta imaginar <strong>la forma más tonta de obtener una buena nota</strong>: no hacer nada, devolver una respuesta vacía, borrar los tests, adivinar, escribir un texto muy seguro. Si el grader no la detecta, el benchmark tiene un problema de validez de resultados, y es probable que algún sistema optimizado lo esté aprovechando sin que nadie lo sepa. Volverás sobre esto en el módulo 10 (trampas y <em>reward hacking</em>).`,
        },
        {
          tipo: 'clasificar',
          id: 'm05-clas-grader',
          instrucciones: `Clasifica cada benchmark según su <strong>método de evaluación principal</strong>.`,
          categorias: ['Tests ejecutables', 'Estado final del entorno', 'Respuesta exacta', 'Juez LLM o rúbrica', 'Expertos humanos'],
          items: [
            { texto: 'Terminal-Bench', categoria: 'Tests ejecutables', explicacion: 'Cada tarea trae un script de tests que se ejecuta en el contenedor al final.' },
            { texto: 'SWE-bench Pro', categoria: 'Tests ejecutables', explicacion: 'Mantiene el formato SWE-bench: tests que deben pasar tras aplicar el parche.' },
            { texto: 'AppWorld', categoria: 'Estado final del entorno', explicacion: 'Tests unitarios sobre el estado de la base de datos, incluidos los daños colaterales.' },
            { texto: 'OSWorld', categoria: 'Estado final del entorno', explicacion: 'Scripts de evaluación que inspeccionan ficheros y configuración de las apps en la VM.' },
            { texto: 'GAIA', categoria: 'Respuesta exacta', explicacion: 'Respuestas cortas e inequívocas comparadas con coincidencia casi exacta.' },
            { texto: 'Cybench', categoria: 'Respuesta exacta', explicacion: 'El éxito es encontrar la bandera, una cadena exacta.' },
            { texto: 'PaperBench', categoria: 'Juez LLM o rúbrica', explicacion: 'Rúbricas jerárquicas elaboradas con los autores y puntuadas por un juez LLM.' },
            { texto: 'Online-Mind2Web', categoria: 'Juez LLM o rúbrica', explicacion: 'En la web en vivo no se puede instrumentar el estado, así que un juez LLM validado decide.' },
            { texto: 'GDPval', categoria: 'Expertos humanos', explicacion: 'Expertos del sector comparan en ciego el entregable del modelo con el de un profesional.' },
          ],
        },
        {
          tipo: 'p',
          html: `Observa la relación entre <strong>validez y coste</strong>: los métodos automáticos (tests, estado, respuesta exacta) son baratos y reproducibles, pero solo funcionan si el resultado es verificable y el grader está bien escrito. Los jueces LLM amplían el alcance a tareas abiertas a cambio de introducir un segundo modelo con sus propios sesgos. Los expertos humanos son la referencia para trabajo profesional, pero cuestan órdenes de magnitud más y no se pueden ejecutar cada noche. Por eso los benchmarks más ambiciosos combinan métodos: TheAgentCompany usa checkpoints programáticos y algunos con juez; PaperBench valida su juez LLM con evaluaciones humanas; GDPval experimentó con un evaluador automático entrenado para aproximar a los expertos.`,
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s8
    {
      id: 's8',
      titulo: 'Lectura crítica: amenazas a la validez',
      bloques: [
        {
          tipo: 'p',
          html: `Esta es la sección más importante del módulo. Aquí tienes las razones por las que una cifra de benchmark puede <strong>no significar lo que parece</strong>. No son casos raros: casi todos los benchmarks populares han sufrido varias de ellas.`,
        },
        {
          tipo: 'cita',
          html: `Cuando una medida se convierte en objetivo, deja de ser una buena medida.`,
          fuente: 'Ley de Goodhart, en la formulación de Marilyn Strathern (1997)',
        },
        {
          tipo: 'acordeon',
          items: [
            {
              titulo: '1. Validez de constructo: ¿mide lo que dice medir?',
              bloques: [
                {
                  tipo: 'p',
                  html: `La <strong>validez de constructo</strong> es la relación entre lo que el benchmark mide de verdad y la capacidad que afirma medir. SWE-bench dice medir «ingeniería de software», pero en realidad mide «producir parches que pasan tests ocultos en issues de repositorios Python populares que tenían tests». Es una aproximación razonable a una parte de la ingeniería de software, no a toda: no incluye diseño, revisión de código, comunicación con el equipo, ni proyectos nuevos. Pregúntate siempre: <em>¿qué tendría que ser cierto para que esta cifra significara lo que dice el titular?</em>`,
                },
              ],
            },
            {
              titulo: '2. Calidad de las tareas y del grader',
              bloques: [
                {
                  tipo: 'p',
                  html: `Ya viste el caso de SWE-bench original: issues infraespecificadas y tests que rechazaban soluciones válidas, lo que motivó SWE-bench Verified. Lo mismo ocurrió en OSWorld (evaluadores demasiado estrictos o con errores, que motivaron OSWorld-Verified) y en muchos otros.`,
                },
                {
                  tipo: 'p',
                  html: `En 2025, Zhu et al. publicaron «Establishing Best Practices for Building Rigorous Agentic Benchmarks», que propone el <strong>Agentic Benchmark Checklist (ABC)</strong>: una lista de comprobación para la <strong>validez de las tareas</strong> (¿se puede resolver la tarea si y solo si se tiene la capacidad que se quiere medir?) y la <strong>validez de los resultados</strong> (¿el grader indica de verdad si la tarea se resolvió?). Al aplicarla a benchmarks populares documentaron problemas de varios tipos: graders que aceptaban respuestas triviales o vacías (por ejemplo, tareas en las que el estado final esperado coincidía con el inicial, de modo que un agente que no hacía nada «aprobaba»), tareas que se podían atajar sin la capacidad pretendida, comparaciones de texto demasiado laxas y tests insuficientes para distinguir soluciones correctas de incorrectas. Según sus estimaciones, estos problemas podían sobreestimar o infraestimar el rendimiento en proporciones relevantes.`,
                },
              ],
            },
            {
              titulo: '3. Contaminación',
              bloques: [
                {
                  tipo: 'p',
                  html: `Hay <strong>contaminación</strong> cuando el modelo ha visto durante el entrenamiento las tareas, sus soluciones o material muy cercano. En benchmarks construidos con repositorios públicos de GitHub es casi inevitable: el arreglo real de cada issue está en la historia pública del repositorio desde el día en que se fusionó. Señales típicas: el modelo reproduce nombres de ficheros o funciones que no podría conocer solo con la issue, o rinde mucho mejor en tareas antiguas que en tareas equivalentes recientes.`,
                },
                {
                  tipo: 'p',
                  html: `Las defensas habituales son: <strong>particiones temporales</strong> (evaluar solo con tareas posteriores al corte de entrenamiento, como hacen SWE-rebench o SWE-bench Live), <strong>conjuntos de test privados</strong> (GAIA, el subconjunto oculto de SWE-bench Pro), <strong>fuentes menos rastreadas</strong> (repos copyleft o privados), <strong>tareas generadas o parametrizadas</strong> (AndroidWorld) y la <strong>renovación periódica</strong> del benchmark.`,
                },
              ],
            },
            {
              titulo: '4. Saturación',
              bloques: [
                {
                  tipo: 'p',
                  html: `Cuando los mejores sistemas se acercan al techo práctico (que, por tareas defectuosas residuales, puede estar por debajo del 100 %), las diferencias entre ellos son pequeñas y ruidosas, y el benchmark deja de discriminar. En ese régimen, una mejora de un punto puede deberse a tareas defectuosas que un sistema «acierta» por casualidad o a sobreajuste. Un benchmark saturado sigue siendo útil para detectar regresiones, no para ordenar a los líderes.`,
                },
              ],
            },
            {
              titulo: '5. Fugas del entorno',
              bloques: [
                {
                  tipo: 'p',
                  html: `Un agente con una terminal es un explorador incansable: si el entorno contiene la respuesta, tarde o temprano la encontrará. En benchmarks basados en repositorios se ha reportado una clase de problema concreta: el repositorio del contenedor conservaba <strong>commits posteriores</strong> al <code>base_commit</code> (por ejemplo, en otras ramas o referencias), y algunos agentes, al explorar el historial de git, encontraban <strong>el arreglo futuro</strong> y lo aplicaban. Otras fugas posibles: acceso a Internet que permite descargar la versión corregida del paquete, ficheros de tests ocultos accesibles en el sistema de ficheros, o soluciones de referencia olvidadas en la imagen. El agente no está «haciendo trampas» con intención; el entorno está mal aislado.`,
                },
              ],
            },
            {
              titulo: '6. Diferencias de harness y de cómputo en tiempo de prueba',
              bloques: [
                {
                  tipo: 'p',
                  html: `La cifra depende de mucho más que el modelo: el <strong>scaffold</strong> (herramientas, prompts, gestión del contexto), el <strong>número de intentos</strong> (pass@1 frente a quedarse con el mejor de N, con un selector o con los propios tests), el <strong>límite de pasos o de coste</strong>, si se reintentan los fallos de infraestructura y si se reporta el benchmark completo o un <strong>subconjunto</strong>. Dos sistemas con el mismo modelo pueden separarse decenas de puntos solo por el harness. Algunos leaderboards intentan aislar el efecto del modelo con un harness mínimo común (por ejemplo, la vista con un agente sencillo basado solo en bash que publica swebench.com). Cuando compares cifras, compara también estas condiciones.`,
                },
              ],
            },
            {
              titulo: '7. Coste y latencia no reportados',
              bloques: [
                {
                  tipo: 'p',
                  html: `Un sistema que muestrea 50 trayectorias y elige la mejor puede ganar al que hace un solo intento… costando 50 veces más. Kapoor et al. (2024), en «AI Agents That Matter», argumentaron que las evaluaciones de agentes deben reportar <strong>coste junto a precisión</strong> y analizar la <strong>frontera de Pareto</strong>, y que muchos agentes complejos no superaban a líneas base sencillas cuando se controlaba el coste. Iniciativas como el Holistic Agent Leaderboard (HAL) reportan el coste de cada entrada. Si un leaderboard no informa del coste, asume que no es comparable.`,
                },
              ],
            },
            {
              titulo: '8. Autodeclarado frente a verificado de forma independiente',
              bloques: [
                {
                  tipo: 'p',
                  html: `Muchas cifras de anuncios son <strong>autodeclaradas</strong>: las ejecutó el propio equipo, con su harness, sus reintentos y su elección de subconjunto. No implica mala fe, pero sí que no sabes qué decisiones se tomaron. Da más peso a resultados <strong>verificados</strong> (los mantenedores ejecutan el sistema o auditan las trayectorias enviadas) o <strong>reproducidos</strong> por terceros con un harness común.`,
                },
              ],
            },
            {
              titulo: '9. El benchmark no es tu distribución',
              bloques: [
                {
                  tipo: 'p',
                  html: `Aunque todo lo anterior estuviera perfecto, el benchmark mide una distribución de tareas que no es la tuya: otros lenguajes, otros tamaños de código, otras herramientas, otros usuarios, otras políticas. El orden de los sistemas en el benchmark puede no mantenerse en tu tarea. Por eso el benchmark sirve para preseleccionar y tu suite propia para decidir.`,
                },
              ],
            },
          ],
        },
        {
          tipo: 'transcript',
          id: 'm05-tr-fuga',
          titulo: 'Un «éxito» sospechoso en una tarea tipo SWE-bench',
          contexto: `Revisas la trayectoria de una tarea que el agente ha «resuelto». El grader la marcó como aprobada.`,
          pasos: [
            { rol: 'sistema', html: `Tarea: la función <code>parse_date</code> falla con fechas con zona horaria (issue #4521). Repositorio en <code>/repo</code>, en el commit base. Produce un parche.`, nota: 'Planteamiento normal de la tarea.' },
            { rol: 'pensamiento', html: `Antes de leer el código, voy a mirar el historial reciente del repositorio para entender el contexto.`, nota: 'Explorar el historial es una estrategia legítima en sí misma: un ingeniero real también lo haría.' },
            { rol: 'herramienta', html: `<code>git log --all --oneline | head -5</code>`, nota: 'El comando es razonable; el problema no es el comando, sino lo que el entorno le permite ver.' },
            { rol: 'resultado', html: `<code>9f3e2d1 Fix #4521: handle tz-aware dates in parse_date</code><br><code>a1b2c3d Merge pull request #4519 …</code><br><code>…</code>`, nota: '<strong>Fuga del entorno</strong>: aparece un commit posterior al commit base que contiene el arreglo real de esta misma issue. El contenedor no debería conservar referencias futuras.' },
            { rol: 'herramienta', html: `<code>git cherry-pick 9f3e2d1 --no-commit &amp;&amp; git diff &gt; parche.diff</code>`, nota: '<strong>Explotación</strong>: el agente copia la solución futura en lugar de resolver el problema. A partir de aquí la tarea ya no mide la capacidad pretendida.' },
            { rol: 'resultado', html: `Tests FAIL_TO_PASS: 3/3 superados. Tests PASS_TO_PASS: todos superados.`, nota: 'Los tests pasan porque el parche es literalmente el arreglo real.' },
            { rol: 'grader', html: `<strong>APROBADA</strong> (instancia resuelta).`, nota: 'El grader hace exactamente lo que se le pidió (ejecutar tests); no tiene forma de saber de dónde salió el parche. El problema es de validez, no del grader.' },
          ],
          pregunta: `Marca los pasos en los que aparece el problema de validez: dónde se produce la fuga y dónde se explota.`,
          culpables: [3, 4],
          explicacion: `El fallo está en el <strong>entorno</strong> (paso 3: el contenedor expone commits futuros) y en su <strong>explotación</strong> (paso 4: el agente aplica el arreglo real). Explorar el historial (pasos 1-2) es legítimo, y el grader (paso 6) actúa correctamente según sus reglas. Lecciones: aísla el entorno (elimina referencias posteriores, corta el acceso a Internet si no forma parte de la tarea), <strong>lee transcripts</strong> además de puntuaciones, y considera detectores automáticos de patrones sospechosos (consultas al historial futuro, descargas de la versión corregida).`,
        },
        {
          tipo: 'h',
          texto: '¿Cuánto ruido tiene una cifra?',
        },
        {
          tipo: 'p',
          html: `Aunque el benchmark fuera perfecto, una tasa de éxito medida sobre un número finito de tareas tiene <strong>incertidumbre estadística</strong>. Con 500 tareas y una tasa en torno al 70 %, el error estándar es aproximadamente √(0,7 × 0,3 / 500) ≈ 2 puntos, así que el intervalo de confianza al 95 % es de unos <strong>±4 puntos</strong>. Dos sistemas separados por 2 puntos en SWE-bench Verified son, en la práctica, indistinguibles con una sola ejecución. Prueba con el widget: compara 360/500 frente a 350/500. (Lo estudiarás a fondo en el módulo 8, junto con las comparaciones pareadas, que aprovechan que ambos sistemas resuelven las mismas tareas y son más potentes.)`,
        },
        {
          tipo: 'widget',
          nombre: 'intervalo',
          exitosA: 360,
          nA: 500,
          exitosB: 350,
          nB: 500,
        },
        {
          tipo: 'pregunta',
          id: 'm05-c6',
          pregunta: {
            tipo: 'multiple',
            pregunta: `Un benchmark de código construido con issues públicas de GitHub de 2022 muestra que un modelo nuevo mejora mucho respecto al anterior. ¿Qué comprobaciones te ayudarían a saber si la mejora puede deberse a contaminación? (Marca todas las correctas.)`,
            opciones: [
              `Comparar su rendimiento en tareas anteriores y posteriores a la fecha de corte de entrenamiento del modelo.`,
              `Evaluarlo en una variante con tareas recogidas recientemente (tipo SWE-rebench) o en un conjunto privado.`,
              `Revisar transcripts buscando que el modelo «conozca» ficheros, funciones o soluciones que no podría deducir de la issue.`,
              `Ejecutar el benchmark tres veces más con la misma configuración y comprobar que la cifra se repite.`,
              `Cambiar el juez LLM por uno más grande para que sea más estricto.`,
            ],
            correctas: [0, 1, 2],
            explicacion: `La partición temporal, los conjuntos frescos o privados y la inspección de transcripts atacan directamente la contaminación. Repetir la ejecución reduce la incertidumbre por varianza, pero un modelo contaminado repetirá su cifra inflada de forma muy consistente. Y SWE-bench no usa juez LLM: su grader son tests, así que cambiar de juez no tiene sentido aquí (y tampoco detectaría contaminación).`,
            seccion: 's8',
          },
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s9
    {
      id: 's9',
      titulo: 'Cómo leer un leaderboard (y un comunicado de prensa)',
      bloques: [
        {
          tipo: 'p',
          html: `Ya tienes las piezas. Ahora conviértelas en un hábito: cada vez que veas una cifra de benchmark, recorre una lista de preguntas antes de sacar conclusiones. No necesitas responderlas todas para cada cifra, pero sí saber cuáles quedan sin respuesta y cuánto te importan.`,
        },
        {
          tipo: 'checklist',
          id: 'm05-check-leaderboard',
          titulo: 'Preguntas para leer cualquier cifra de benchmark',
          items: [
            `<strong>¿Qué versión exacta?</strong> ¿SWE-bench completo, Lite, Verified, Pro? ¿Terminal-Bench 1 o 2.0? ¿El conjunto entero o un subconjunto?`,
            `<strong>¿Qué sistema?</strong> Modelo + scaffold + herramientas + prompts. ¿Es un harness público o uno propio?`,
            `<strong>¿Cuántos intentos y cómo se elige?</strong> ¿pass@1, mejor de N, selección con tests o con un verificador? ¿Se reportó pass^k?`,
            `<strong>¿Qué presupuesto?</strong> Límite de pasos, de tokens, de tiempo; coste medio por tarea; latencia.`,
            `<strong>¿Quién lo ejecutó?</strong> ¿Autodeclarado, verificado por los mantenedores o reproducido por terceros? ¿Hay trayectorias públicas?`,
            `<strong>¿Cuánta incertidumbre?</strong> Número de tareas, intervalos de confianza, número de ejecuciones, varianza entre semillas.`,
            `<strong>¿Hay riesgo de contaminación?</strong> Fecha de las tareas frente a fecha de corte del modelo; conjunto público o privado.`,
            `<strong>¿Está saturado el benchmark?</strong> ¿Cuánto margen queda hasta el techo práctico? ¿Discrimina todavía entre los mejores?`,
            `<strong>¿Se conocen problemas de validez?</strong> Tareas defectuosas, graders laxos, fugas del entorno documentadas.`,
            `<strong>¿Con qué se compara?</strong> ¿Misma versión, mismo harness, mismas condiciones que la cifra del competidor?`,
            `<strong>¿Se parece a mi caso?</strong> Lenguajes, herramientas, tipo de usuario, longitud de las tareas, nivel de riesgo.`,
          ],
        },
        {
          tipo: 'ejercicio',
          id: 'm05-ej-nota-prensa',
          titulo: 'Critica un comunicado de prensa',
          enunciado: `Lee este fragmento (ficticio) de un comunicado:<br><br><em>«Hoy presentamos Atlas, nuestro nuevo agente de programación. Atlas alcanza un 78 % en SWE-bench, superando en 6 puntos al anterior líder y estableciendo un nuevo estado del arte. Atlas está listo para transformar la productividad de los equipos de ingeniería de tu empresa.»</em><br><br>Escribe las preguntas que harías antes de creerte (o usar) esta afirmación, agrupadas por tema. Después indica qué conclusión mínima sí podrías sacar y qué harías para decidir si adoptar Atlas en tu equipo.`,
          pistas: [
            `Empieza por la palabra «SWE-bench»: ¿a cuál de las variantes se refiere?`,
            `Piensa en cómo se obtuvo el 78 %: intentos, selección, scaffold, presupuesto.`,
            `¿Con qué cifra se compara el «anterior líder» y en qué condiciones se midió?`,
            `La última frase da un salto del benchmark a «tu empresa». ¿Qué falta para justificar ese salto?`,
          ],
          solucion: `<strong>Preguntas sobre la medida:</strong><ul><li>¿Qué SWE-bench? ¿El completo, Lite, Verified, Pro, Multilingual? ¿Todo el conjunto o un subconjunto? Un 78 % en Lite no es comparable con un 78 % en Pro.</li><li>¿pass@1 o mejor de N? ¿Se seleccionó la mejor trayectoria con los tests ocultos, con tests generados por el agente o con un verificador? ¿Cuántas ejecuciones y cuál es el intervalo de confianza?</li><li>¿Qué scaffold, herramientas y presupuesto (pasos, tokens, coste por tarea, tiempo)?</li></ul><strong>Preguntas sobre la comparación:</strong><ul><li>¿El «anterior líder» se midió con la misma versión, el mismo harness y el mismo número de intentos? ¿O se compara un sistema con best-of-N contra otro con pass@1?</li><li>¿6 puntos son significativos con el número de tareas usado?</li><li>¿Es autodeclarado o verificado por los mantenedores? ¿Hay trayectorias públicas que se puedan auditar?</li></ul><strong>Preguntas sobre validez:</strong><ul><li>¿Riesgo de contaminación (tareas públicas anteriores a la fecha de corte)? ¿Resultados en una variante fresca o privada?</li><li>¿Se revisaron transcripts en busca de fugas del entorno o atajos?</li><li>¿Está el benchmark cerca de la saturación?</li></ul><strong>Preguntas sobre transferencia:</strong><ul><li>¿Nuestros lenguajes, tamaño de repositorio, tipo de tareas e integración (revisión de código, CI) se parecen a SWE-bench?</li><li>¿Qué coste y latencia tendría en nuestro flujo?</li></ul><strong>Conclusión mínima:</strong> «Atlas es probablemente un sistema competitivo en resolución de issues tipo SWE-bench y merece entrar en la lista de candidatos». <strong>Para decidir:</strong> evaluarlo en una suite interna construida con issues y PR reales de nuestros repositorios (posteriores a su fecha de corte), con el mismo harness y presupuesto para todos los candidatos, varias ejecuciones por tarea, métricas de coste y revisión humana de una muestra de parches.`,
        },
        {
          tipo: 'p',
          html: `Un último consejo práctico para leer leaderboards: <strong>no mires solo la primera fila</strong>. Mira cómo se distribuyen las entradas, cuántas son del mismo modelo con distintos harnesses (te dirá cuánto pesa el harness), si hay columnas de coste y si la tabla distingue entre entradas verificadas y autodeclaradas. Y si puedes, abre unas cuantas trayectorias de las mejores entradas: es la forma más rápida de detectar si el «éxito» se parece a lo que tú llamarías éxito.`,
        },
        {
          tipo: 'widget',
          nombre: 'pareto',
          puntos: [
            { nombre: 'Agente simple, 1 intento', coste: 0.4, exito: 0.58 },
            { nombre: 'Agente simple, mejor de 5', coste: 2.0, exito: 0.66 },
            { nombre: 'Agente complejo, 1 intento', coste: 1.5, exito: 0.61 },
            { nombre: 'Agente complejo, mejor de 10', coste: 15.0, exito: 0.70 },
            { nombre: 'Modelo pequeño, 1 intento', coste: 0.1, exito: 0.45 },
          ],
        },
        {
          tipo: 'p',
          html: `El gráfico anterior usa <strong>configuraciones hipotéticas</strong> (no son datos reales) para ilustrar la idea de Kapoor et al.: el sistema con la mejor tasa de éxito puede no estar en una zona razonable de coste, y algunas configuraciones «sofisticadas» quedan por debajo de la frontera de Pareto (hay otra más barata y mejor). Un leaderboard que solo ordena por éxito esconde esta información.`,
        },
      ],
    },

    // ───────────────────────────────────────────────────────────────── s10
    {
      id: 's10',
      titulo: 'Elegir benchmarks, construir el tuyo y lo que viene',
      bloques: [
        {
          tipo: 'h',
          texto: 'Qué benchmarks mirar según lo que construyes',
        },
        {
          tipo: 'p',
          html: `Usa esta tabla como punto de partida para la <strong>preselección</strong> de modelos y para inspirarte en el diseño de tu suite. Recuerda: los benchmarks te dicen qué candidatos merece la pena probar; tu suite te dice cuál elegir.`,
        },
        {
          tipo: 'tabla',
          titulo: 'Si construyes X, mira Y',
          columnas: ['Si construyes…', 'Mira…', 'Por qué', 'Lo que no te dirá'],
          filas: [
            ['Un agente que modifica repositorios de código', 'SWE-bench Verified y Pro; Multilingual o Multi-SWE-bench si no es Python; variantes vivas', 'Issues reales con tests; Pro y las variantes vivas reducen la contaminación', 'Calidad del código para revisión humana; tu base de código y tu CI'],
            ['Un agente de DevOps o de terminal', 'Terminal-Bench 2.0', 'Tareas variadas en terminal con tests y solución de referencia', 'Tus herramientas internas y permisos'],
            ['Un asistente de edición de código', 'Aider Polyglot', 'Edición correcta en varios lenguajes', 'Agencia larga en repositorios grandes'],
            ['Un agente de atención al cliente', 'τ-bench, τ²-bench (con pass^k)', 'Políticas, usuario simulado, consistencia', 'Tus políticas reales y tus clientes (y su tono)'],
            ['Un agente de navegador', 'WebArena, VisualWebArena, WorkArena (entornos controlados); Online-Mind2Web (web real)', 'Tareas reproducibles y evaluación funcional; realismo en web real', 'Las webs concretas en las que operarás'],
            ['Un agente de uso del ordenador o del móvil', 'OSWorld-Verified, Windows Agent Arena, AndroidWorld', 'Apps reales en VMs o emulador, evaluación por estado', 'Tus aplicaciones de escritorio internas'],
            ['Integraciones con herramientas, APIs o MCP', 'BFCL, AppWorld, benchmarks de MCP', 'Llamadas correctas, tareas multiapp, daños colaterales', 'La calidad de tus descripciones de herramientas'],
            ['Un agente de investigación (deep research)', 'BrowseComp, GAIA, AssistantBench', 'Búsqueda persistente con respuestas verificables', 'La calidad de un informe largo (necesitas rúbricas)'],
            ['Un agente de análisis de datos o SQL', 'Spider 2.0', 'Flujos de datos empresariales realistas', 'Tu esquema y tus definiciones de negocio'],
            ['Un agente de investigación en ML', 'MLE-bench, RE-Bench, PaperBench', 'Tareas largas con métricas o rúbricas expertas', 'Tus datos y tu infraestructura'],
            ['Automatización de trabajo de oficina', 'TheAgentCompany, GDPval', 'Tareas profesionales heterogéneas, comparación con humanos', 'Tus procesos, tu contexto tácito y tus estándares de calidad'],
            ['Agentes autónomos de larga duración', 'Vending-Bench, horizonte temporal de METR', 'Coherencia en horizontes largos; tendencia de capacidad', 'Tu dominio y tus mecanismos de supervisión'],
            ['Cualquier agente que lea datos no confiables', 'AgentDojo, InjecAgent', 'Resistencia a la inyección sin perder utilidad', 'Tus vectores de ataque concretos'],
            ['Agentes para tareas de ciberseguridad', 'Cybench', 'Retos CTF objetivos con subtareas', 'Tu entorno real y sus restricciones legales'],
          ],
        },
        {
          tipo: 'h',
          texto: 'Construir un benchmark interno con tus propios datos',
        },
        {
          tipo: 'p',
          html: `La mejor forma de aprovechar lo que has visto es <strong>copiar el diseño de los buenos benchmarks</strong> con tus propias tareas. El patrón SWE-bench, por ejemplo, se traslada casi directamente a tu empresa: toma PR reales de tus repositorios que arreglaron un bug y añadieron tests, y conviértelos en tareas. Lo mismo con tickets de soporte resueltos (patrón τ-bench) o con consultas de datos con respuesta conocida (patrón GAIA o Spider). El módulo 9 lo desarrolla paso a paso; aquí tienes el esqueleto.`,
        },
        {
          tipo: 'flujo',
          titulo: 'Del dato propio al benchmark interno',
          pasos: [
            { titulo: 'Recolecta', texto: 'Casos reales: PR, tickets, conversaciones, consultas. Prioriza los recientes y los difíciles.' },
            { titulo: 'Empaqueta', texto: 'Entorno reproducible (contenedor, base de datos de prueba, usuario simulado).' },
            { titulo: 'Define el grader', texto: 'Tests, estado o respuesta exacta si se puede; rúbrica o juez si no.' },
            { titulo: 'Valida', texto: 'Solución de referencia que pase y soluciones erróneas que fallen; revisión humana.' },
            { titulo: 'Separa y versiona', texto: 'Conjunto de desarrollo y conjunto reservado; versión con fecha.' },
            { titulo: 'Renueva', texto: 'Añade casos nuevos de producción; retira los saturados.' },
          ],
          bucle: 'Los fallos en producción alimentan nuevas tareas',
        },
        {
          tipo: 'codigo',
          lenguaje: 'yaml',
          titulo: 'Ejemplo de tarea interna al estilo SWE-bench (esquema ilustrativo)',
          codigo: `id: facturacion-2026-0412
origen: PR #8812 (fusionado el 2026-04-12)
entorno:
  imagen: registry.interno/facturacion:base-3f9a1c
  red: deshabilitada            # evita descargar la solución
  historial_git: truncado_en_base  # sin commits futuros
enunciado: |
  El cálculo de IVA para clientes intracomunitarios aplica el tipo
  general cuando el NIF-IVA es válido. Debe aplicar inversión del sujeto pasivo.
grader:
  tipo: tests
  fail_to_pass: [tests/test_iva.py::test_intracomunitario_valido]
  pass_to_pass: [tests/test_iva.py, tests/test_facturas.py]
validacion:
  solucion_referencia: pasa
  soluciones_erroneas_rechazadas: 3
particion: reservado            # no se usa para ajustar prompts
etiquetas: [fiscal, regresion, dificultad-media]`,
        },
        {
          tipo: 'callout',
          variante: 'error',
          titulo: 'Anti-patrón: optimizar contra tu propio benchmark',
          html: `Si ajustas prompts, herramientas y modelos mirando siempre el mismo conjunto de tareas, tu benchmark interno se «contamina» igual que los públicos: acabarás con un sistema muy bueno en esas tareas y no necesariamente en las de mañana. Mantén un <strong>conjunto reservado</strong> que solo uses para decisiones finales y renuévalo con casos nuevos de producción.`,
        },
        {
          tipo: 'h',
          texto: 'Hacia dónde van los benchmarks de agentes',
        },
        {
          tipo: 'lista',
          items: [
            `<strong>Benchmarks vivos y renovables.</strong> Tareas recogidas de forma continua (SWE-rebench, SWE-bench Live) o generadas con parámetros (AndroidWorld, τ²-bench) para que la contaminación y la saturación lleguen más tarde.`,
            `<strong>Evaluaciones con anclaje económico.</strong> Medir en dólares (SWE-Lancer), en patrimonio (Vending-Bench) o frente a profesionales en ocupaciones reales (GDPval): la pregunta pasa de «¿acierta?» a «¿vale lo que cuesta?».`,
            `<strong>Horizontes largos.</strong> Tareas de horas o días, con memoria, coordinación y recuperación de errores, donde el error se compone paso a paso (lo viste en el widget de fiabilidad compuesta del módulo 1).`,
            `<strong>Métricas en tiempo humano.</strong> El horizonte de METR traduce resultados heterogéneos a una unidad común e intuitiva, útil para seguir tendencias.`,
            `<strong>Fiabilidad, coste y seguridad junto a la capacidad.</strong> pass^k, frontera de coste y utilidad bajo ataque en la misma tabla que la tasa de éxito.`,
            `<strong>Más rigor en la construcción.</strong> Listas de comprobación como ABC, versiones «Verified», soluciones de referencia obligatorias, harnesses comunes (Harbor, BrowserGym) y verificación independiente de resultados.`,
          ],
        },
        {
          tipo: 'h',
          texto: 'Repaso: tarjetas de los benchmarks clave',
        },
        {
          tipo: 'tarjetas',
          items: [
            { frente: 'SWE-bench Verified', reverso: '500 tareas de SWE-bench revisadas por desarrolladores (OpenAI, 2024). Tests FAIL_TO_PASS y PASS_TO_PASS en Docker. Métrica: % resueltas. Hoy, cerca de la saturación y con riesgo de contaminación.' },
            { frente: 'SWE-bench Pro', reverso: 'Scale AI, 2025. Tareas más largas y difíciles; repos copyleft y privados y un subconjunto oculto para resistir la contaminación.' },
            { frente: 'SWE-Lancer', reverso: 'OpenAI, 2025. Encargos freelance reales con su pago; tests de extremo a extremo y tareas de manager. Métrica: dólares ganados.' },
            { frente: 'Terminal-Bench 2.0', reverso: 'Laude Institute y Stanford, 2025. Tareas en terminal dentro de contenedores, verificadas con tests y solución de referencia; harness Harbor.' },
            { frente: 'τ-bench / τ²-bench', reverso: 'Sierra. Atención al cliente con usuario simulado y política; se compara el estado final de la base de datos. Introdujo pass^k. τ² añade control dual (telecom).' },
            { frente: 'WebArena', reverso: 'Zhou et al., 2023. Webs autoalojadas (tienda, foro, GitLab, CMS, mapas). Evaluación funcional por respuesta y estado.' },
            { frente: 'OSWorld', reverso: 'Xie et al., 2024. Sistema operativo real en VM con apps reales; scripts de evaluación por ejecución. Versión Verified en 2025.' },
            { frente: 'GAIA', reverso: 'Mialon et al., 2023. Preguntas de asistente general con respuestas cortas e inequívocas; tres niveles; respuestas del test ocultas.' },
            { frente: 'BrowseComp', reverso: 'OpenAI, 2025. Información muy difícil de encontrar pero fácil de verificar; respuestas cortas.' },
            { frente: 'GDPval', reverso: 'OpenAI, 2025. Entregables reales de muchas ocupaciones; expertos comparan en ciego con el trabajo de profesionales. Métrica: victoria o empate.' },
            { frente: 'Horizonte temporal de METR', reverso: 'Kwa et al., 2025. Duración (en tiempo de experto humano) de las tareas que el agente completa al 50 %. Se ha duplicado aproximadamente cada 7 meses.' },
            { frente: 'AgentDojo', reverso: 'Debenedetti et al., 2024. Inyección de instrucciones: utilidad, utilidad bajo ataque y tasa de éxito del ataque.' },
          ],
        },
        {
          tipo: 'enlaces',
          items: [
            { titulo: 'SWE-bench (sitio oficial y leaderboards)', url: 'https://www.swebench.com', html: 'Incluye las variantes (Lite, Verified, Multimodal, Multilingual) y la documentación del harness.' },
            { titulo: 'SWE-bench: Can Language Models Resolve Real-World GitHub Issues? (Jimenez et al., 2023)', url: 'https://arxiv.org/abs/2310.06770', html: 'El artículo original.' },
            { titulo: 'Terminal-Bench', url: 'https://www.tbench.ai', html: 'Tareas, leaderboard y documentación de Terminal-Bench 2.0 y Harbor.' },
            { titulo: 'τ-bench (repositorio de Sierra)', url: 'https://github.com/sierra-research/tau-bench', html: 'Código, dominios y definición de pass^k.' },
            { titulo: 'τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains (Yao et al., 2024)', url: 'https://arxiv.org/abs/2406.12045' },
            { titulo: 'WebArena', url: 'https://webarena.dev', html: 'Entorno, tareas y evaluadores.' },
            { titulo: 'OSWorld', url: 'https://os-world.github.io', html: 'Tareas, evaluadores y resultados de OSWorld y OSWorld-Verified.' },
            { titulo: 'GAIA (Hugging Face)', url: 'https://huggingface.co/gaia-benchmark', html: 'Conjunto de datos y leaderboard con respuestas de test ocultas.' },
            { titulo: 'Berkeley Function Calling Leaderboard', url: 'https://gorilla.cs.berkeley.edu/leaderboard.html', html: 'Categorías de evaluación AST, ejecutable, multiturno y agéntica.' },
            { titulo: 'Measuring AI Ability to Complete Long Tasks (Kwa et al., 2025)', url: 'https://arxiv.org/abs/2503.14499', html: 'El artículo de METR sobre el horizonte temporal.' },
          ],
        },
      ],
    },
  ],
  resumen: [
    'Un benchmark es un conjunto público y estandarizado de tareas, entorno, grader y métrica: sirve para comparar sistemas, seguir el progreso y preseleccionar candidatos, pero no predice tu rendimiento en tu tarea.',
    'Los benchmarks envejecen: creación, adopción, saturación, contaminación y reemplazo por versiones «Verified», más difíciles o renovadas continuamente.',
    'Lo que realmente mide un benchmark lo deciden su entorno y su método de evaluación: tests, estado final, respuesta exacta, juez LLM o expertos humanos, cada uno con sus falsos positivos y negativos.',
    'La métrica también importa: tasa de éxito, pass^k (fiabilidad), dólares, patrimonio, medallas, victoria frente a profesionales u horizonte temporal en tiempo humano.',
    'Las amenazas a la validez son habituales: tareas defectuosas, graders laxos, contaminación, saturación, fugas del entorno, diferencias de harness y de cómputo, coste oculto y cifras autodeclaradas.',
    'Una diferencia de 1-2 puntos en un benchmark de unos cientos de tareas suele estar dentro del ruido estadístico.',
    'Ante cualquier cifra, pregunta: qué versión, qué sistema, cuántos intentos, qué presupuesto, quién lo verificó, cuánta incertidumbre y si se parece a tu caso.',
    'Usa los benchmarks para preseleccionar y construye un benchmark interno con tus propios datos, con soluciones de referencia, conjunto reservado y renovación periódica.',
  ],
  quiz: [
    {
      tipo: 'unica',
      pregunta: `¿Para cuál de estos usos es <strong>menos adecuado</strong> un benchmark público de agentes?`,
      opciones: [
        `Predecir con precisión el rendimiento de un agente en las tareas concretas de tu empresa.`,
        `Hacer una primera criba de modelos candidatos antes de una evaluación propia.`,
        `Seguir cómo evoluciona una capacidad del campo a lo largo de varios años.`,
        `Comprobar que tu harness reproduce aproximadamente las cifras publicadas para un modelo conocido.`,
      ],
      correcta: 0,
      explicacion: `Un benchmark mide una distribución de tareas que no es la tuya, así que no predice tu rendimiento. Sí es útil para preseleccionar candidatos, seguir tendencias del campo y validar tu montaje comparando con cifras conocidas.`,
      seccion: 's1',
    },
    {
      tipo: 'unica',
      pregunta: `En SWE-bench, ¿qué función cumplen los tests <code>PASS_TO_PASS</code>?`,
      opciones: [
        `Comprobar que el parche no rompe funcionalidad que ya funcionaba antes (regresiones).`,
        `Comprobar que el parche resuelve la issue descrita.`,
        `Medir la calidad de estilo del parche frente a la guía del proyecto.`,
        `Comprobar que el agente no ha modificado los ficheros de tests.`,
      ],
      correcta: 0,
      explicacion: `PASS_TO_PASS son tests que ya pasaban y deben seguir pasando: detectan regresiones. Los que comprueban que la issue se resuelve son los FAIL_TO_PASS. El grader estándar no mide estilo, y la protección frente a modificar tests viene de aplicar el <code>test_patch</code> después del parche del agente, no de PASS_TO_PASS.`,
      seccion: 's4',
    },
    {
      tipo: 'unica',
      pregunta: `¿Cuál fue la motivación principal para crear SWE-bench Verified?`,
      opciones: [
        `Muchas tareas del original tenían issues infraespecificadas o tests que rechazaban soluciones válidas, lo que infraestimaba la capacidad real de los sistemas.`,
        `El original era demasiado fácil y ya estaba saturado, así que hacían falta tareas más largas y difíciles.`,
        `El original solo incluía Python y se quería cubrir otros lenguajes de programación.`,
        `El original dependía de un juez LLM poco fiable que se sustituyó por tests ejecutables.`,
      ],
      correcta: 0,
      explicacion: `Verified es una versión <strong>depurada</strong>: desarrolladores revisaron tareas para descartar las ambiguas o con tests injustos. Las tareas más largas y difíciles son el objetivo de SWE-bench Pro; otros lenguajes, de Multilingual y Multi-SWE-bench. SWE-bench siempre se evaluó con tests, no con un juez LLM.`,
      seccion: 's4',
    },
    {
      tipo: 'unica',
      pregunta: `Un agente de atención al cliente resuelve cada tarea con probabilidad 0,8 de forma independiente en cada intento. ¿Por qué τ-bench reporta pass^k además de la tasa de éxito?`,
      opciones: [
        `Porque pass^k mide la probabilidad de acertar en <em>todos</em> los k intentos, lo que refleja la consistencia que necesitas cuando muchos clientes plantean el mismo problema.`,
        `Porque pass^k mide la probabilidad de acertar en <em>al menos uno</em> de k intentos, que es lo relevante cuando el agente puede reintentar sin coste.`,
        `Porque pass^k corrige los errores del usuario simulado, que de otro modo sesgarían la tasa de éxito.`,
        `Porque pass^k pondera cada tarea por su dificultad, estimada a partir del tiempo de un experto humano.`,
      ],
      correcta: 0,
      explicacion: `pass^k es la probabilidad de éxito en los k intentos (con p = 0,8 y k = 4, unos 0,41). Mide fiabilidad. «Al menos uno de k» es pass@k, que mide capacidad máxima con reintentos. pass^k no corrige al simulador ni pondera por tiempo humano (eso se parece más al horizonte de METR).`,
      seccion: 's5',
    },
    {
      tipo: 'unica',
      pregunta: `¿Cómo se evalúan principalmente los entregables en GDPval?`,
      opciones: [
        `Expertos del sector comparan en ciego el entregable del modelo con el de un profesional humano e indican cuál prefieren o si son equivalentes.`,
        `Un juez LLM puntúa cada entregable con una rúbrica jerárquica elaborada con los autores de la tarea.`,
        `Tests automáticos comprueban que los ficheros generados tienen el formato y las cifras correctas.`,
        `Se mide el dinero que el cliente original habría pagado por el entregable en una plataforma de freelance.`,
      ],
      correcta: 0,
      explicacion: `GDPval usa comparación por pares en ciego con expertos humanos; la métrica es la tasa de victoria o empate. La rúbrica jerárquica con juez LLM es de PaperBench; los tests son típicos de benchmarks de código; los dólares, de SWE-Lancer.`,
      seccion: 's6',
    },
    {
      tipo: 'unica',
      pregunta: `Al revisar transcripts de un benchmark de código, ves que el agente ejecutó <code>git log --all</code>, encontró un commit posterior con el arreglo de la issue y lo aplicó. ¿Cómo clasificarías este problema?`,
      opciones: [
        `Una fuga del entorno: el contenedor expone información que no debería estar disponible y la tarea deja de medir la capacidad pretendida.`,
        `Contaminación de datos de entrenamiento: el modelo había memorizado la solución.`,
        `Un fallo del grader, que debería haber detectado que el parche coincide con el real.`,
        `Un comportamiento legítimo: usar el historial de git es lo que haría un buen ingeniero.`,
      ],
      correcta: 0,
      explicacion: `La información estaba en el <strong>entorno</strong>, no en los pesos del modelo: es una fuga, no contaminación. El grader hace lo que debe (ejecutar tests). Mirar el historial es legítimo, pero copiar el arreglo <em>futuro</em> no resuelve el problema: el entorno debe aislarse para que esa información no exista.`,
      seccion: 's8',
    },
    {
      tipo: 'unica',
      pregunta: `¿Cuál es la principal limitación de validez de la evaluación offline de Mind2Web, que compara cada acción del agente con la de una demostración humana?`,
      opciones: [
        `Penaliza caminos alternativos correctos: si el agente completa la tarea de otra forma, se cuenta como error.`,
        `No es reproducible, porque las webs reales cambian entre ejecuciones.`,
        `Depende de un juez LLM que tiende a preferir respuestas largas.`,
        `Solo puede evaluar respuestas exactas cortas, no acciones.`,
      ],
      correcta: 0,
      explicacion: `Al comparar con una única trayectoria de referencia, cualquier ruta distinta pero válida se penaliza (falsos negativos). Precisamente por usar instantáneas offline es reproducible; el juez LLM y la web cambiante corresponden a Online-Mind2Web.`,
      seccion: 's5',
    },
    {
      tipo: 'multiple',
      pregunta: `¿Qué estrategias usan los benchmarks para <strong>resistir la contaminación</strong>? (Marca todas las correctas.)`,
      opciones: [
        `Particiones temporales: evaluar solo con tareas posteriores a la fecha de corte del modelo.`,
        `Mantener un conjunto de test cuyas respuestas no se publican.`,
        `Usar fuentes menos rastreadas, como repositorios copyleft o bases de código privadas.`,
        `Renovar periódicamente las tareas o generarlas con parámetros aleatorios.`,
        `Añadir más tareas de los mismos repositorios públicos para reducir la varianza.`,
        `Cambiar los tests por un juez LLM, que no puede haber visto las soluciones.`,
      ],
      correctas: [0, 1, 2, 3],
      explicacion: `Particiones temporales (SWE-rebench, SWE-bench Live), conjuntos ocultos (GAIA, SWE-bench Pro), fuentes copyleft o privadas (SWE-bench Pro) y tareas renovadas o parametrizadas (AndroidWorld) atacan la contaminación. Añadir más tareas de las mismas fuentes públicas reduce la varianza, no la contaminación. Y la contaminación afecta al <em>agente evaluado</em>, no al grader: cambiar de grader no la evita.`,
      seccion: 's8',
    },
    {
      tipo: 'multiple',
      pregunta: `Un anuncio dice: «Nuestro agente logra el 72 % en SWE-bench Verified». ¿Qué preguntas son <strong>relevantes</strong> para interpretar la cifra? (Marca todas las correctas.)`,
      opciones: [
        `¿Es pass@1 o se eligió la mejor de varias trayectorias, y con qué criterio?`,
        `¿Qué scaffold, herramientas y presupuesto por tarea se usaron?`,
        `¿Está verificado por los mantenedores o es autodeclarado, y hay trayectorias públicas?`,
        `¿Cuál es el intervalo de confianza o cuántas ejecuciones se hicieron?`,
        `¿Cuántos parámetros tiene el modelo base?`,
        `¿El modelo obtuvo también buena nota en un benchmark de conocimiento general?`,
      ],
      correctas: [0, 1, 2, 3],
      explicacion: `Intentos y selección, harness y presupuesto, verificación e incertidumbre determinan qué significa la cifra y si es comparable con otras. El número de parámetros y el rendimiento en benchmarks de conocimiento no cambian la interpretación de este resultado concreto (aunque puedan ser datos interesantes por otras razones).`,
      seccion: 's9',
    },
    {
      tipo: 'vf',
      afirmacion: `Si en un benchmark de 500 tareas el agente A obtiene un 72 % y el B un 70 % en una única ejecución, podemos concluir con confianza que A es mejor que B en esa familia de tareas.`,
      correcta: false,
      explicacion: `Con 500 tareas y tasas en torno al 70 %, el intervalo de confianza al 95 % de cada cifra es de unos ±4 puntos. Una diferencia de 2 puntos en una sola ejecución es compatible con el ruido. Harían falta comparaciones pareadas, más ejecuciones o más tareas (módulo 8).`,
      seccion: 's8',
    },
    {
      tipo: 'vf',
      afirmacion: `OSWorld decide si una tarea se ha completado comparando la secuencia de clics y teclas del agente con una trayectoria humana de referencia.`,
      correcta: false,
      explicacion: `OSWorld usa <strong>scripts de evaluación por ejecución</strong> que inspeccionan el estado final (ficheros, configuración de las apps). No importa el camino, sino el resultado. La comparación con trayectoria de referencia es propia de Mind2Web offline.`,
      seccion: 's5',
    },
    {
      tipo: 'emparejar',
      pregunta: `Empareja cada benchmark con su método de evaluación principal.`,
      pares: [
        ['Terminal-Bench', 'Script de tests ejecutado en el contenedor'],
        ['τ-bench', 'Comparación del estado final de la base de datos'],
        ['GAIA', 'Respuesta corta con coincidencia casi exacta'],
        ['PaperBench', 'Rúbrica jerárquica puntuada por un juez LLM'],
        ['GDPval', 'Comparación por pares en ciego con expertos'],
        ['MLE-bench', 'Métrica de la competición y medallas'],
      ],
      explicacion: `Terminal-Bench verifica con tests; τ-bench compara el estado de la base de datos con el esperado; GAIA usa respuestas cortas e inequívocas; PaperBench usa rúbricas jerárquicas con juez LLM; GDPval, expertos en comparación por pares; MLE-bench, la métrica original de Kaggle y su clasificación histórica.`,
      seccion: 's7',
    },
    {
      tipo: 'orden',
      pregunta: `Ordena las fases típicas del ciclo de vida de un benchmark.`,
      items: [
        'Creación: tareas difíciles y resultados iniciales bajos',
        'Adopción: leaderboard y uso generalizado en anuncios',
        'Saturación: puntuaciones cerca del techo práctico',
        'Contaminación: tareas y soluciones en datos de entrenamiento',
        'Reemplazo: versión depurada, más difícil o renovada',
      ],
      explicacion: `Es el patrón que siguieron, por ejemplo, SWE-bench → SWE-bench Verified → SWE-bench Pro y variantes vivas. Saturación y contaminación a menudo se solapan en el tiempo, pero ambas llegan tras la adopción y motivan el reemplazo.`,
      seccion: 's1',
    },
    {
      tipo: 'numerica',
      pregunta: `Un agente tiene un horizonte temporal al 50 % de 30 minutos. Si se duplica cada 7 meses, ¿cuántos meses tardaría en alcanzar un horizonte de 4 horas?`,
      respuesta: 21,
      tolerancia: 0.5,
      unidad: 'meses',
      explicacion: `De 30 minutos a 4 horas (240 minutos) hay un factor 8 = 2<sup>3</sup>, es decir, 3 duplicaciones. 3 × 7 = <strong>21 meses</strong>. Recuerda que es una extrapolación aritmética de una tendencia, no una predicción garantizada.`,
      seccion: 's6',
    },
  ],
});
