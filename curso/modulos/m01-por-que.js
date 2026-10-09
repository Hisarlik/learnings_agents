registrarModulo({
  id: 'm01',
  numero: 1,
  titulo: '¿Por qué evaluar agentes es diferente?',
  subtitulo: 'Entiende qué cambia cuando pasas de evaluar respuestas de un LLM a evaluar sistemas que actúan durante muchos pasos.',
  duracion: '50 min',
  nivel: 'Básico',
  objetivos: [
    'Explicar qué distingue a un agente de un LLM de una sola llamada desde el punto de vista de la evaluación.',
    'Identificar las cinco fuentes de dificultad: no determinismo, trayectorias múltiples, estado, efectos secundarios y coste.',
    'Calcular cómo se compone el error a lo largo de muchos pasos y por qué eso cambia las métricas.',
    'Distinguir evaluación offline y online, de capacidad y de regresión, de componente y extremo a extremo.',
    'Situar las evals automáticas dentro de un sistema de garantía de calidad por capas (modelo del queso suizo).',
  ],
  secciones: [
    {
      id: 's1',
      titulo: 'De la respuesta a la acción',
      bloques: [
        { tipo: 'p', html: 'Durante los primeros años de los modelos de lenguaje, "evaluar" significaba casi siempre lo mismo: dar al modelo una entrada, recoger su salida y compararla con una respuesta esperada. Una pregunta, una respuesta, una nota. Benchmarks como MMLU o GSM8K funcionan así, y para ese tipo de uso es un enfoque razonable.' },
        { tipo: 'p', html: 'Un <em>agente</em> es otra cosa. Es un sistema en el que un modelo <strong>decide qué hacer a continuación</strong>, usa herramientas (buscar, ejecutar código, consultar una base de datos, hacer clic en una web), observa el resultado y vuelve a decidir, en un bucle que puede durar decenas o cientos de pasos. El resultado ya no es solo un texto: es un <strong>cambio en el mundo</strong>. Un fichero modificado, un reembolso emitido, un billete reservado, un pull request abierto.' },
        {
          tipo: 'flujo',
          titulo: 'El bucle básico de un agente',
          pasos: [
            { titulo: 'Objetivo', texto: 'El usuario pide algo: "reembolsa el cargo duplicado".' },
            { titulo: 'Decidir', texto: 'El modelo razona y elige una acción.' },
            { titulo: 'Actuar', texto: 'Llama a una herramienta: <code>listar_cargos(4821)</code>.' },
            { titulo: 'Observar', texto: 'Recibe el resultado y lo añade a su contexto.' },
            { titulo: 'Terminar', texto: 'Cuando cree que ha acabado, responde al usuario.' },
          ],
          bucle: 'decidir → actuar → observar se repite hasta que el agente para (o se agota el presupuesto)',
        },
        { tipo: 'p', html: 'Esa diferencia, que parece de grado, cambia por completo cómo hay que medir. Piensa en la diferencia entre evaluar a un estudiante con un examen tipo test y evaluar a un residente de cirugía en el quirófano. En el segundo caso importa el resultado (¿salió bien la operación?), pero también el proceso (¿siguió el protocolo?, ¿pidió ayuda cuando debía?), la consistencia (¿lo hace bien siempre o solo a veces?) y el coste (¿cuánto tardó?, ¿qué recursos consumió?).' },
        {
          tipo: 'comparar',
          columnas: [
            { titulo: 'Evaluar un LLM (una llamada)', tono: 'ink', items: ['Entrada → salida, sin estado', 'Una respuesta que comparar con la esperada', 'Errores aislados', 'Coste por ejemplo pequeño y predecible', 'Basta con mirar el texto final'] },
            { titulo: 'Evaluar un agente', tono: 'accent', items: ['Bucle de muchos pasos con herramientas', 'Muchos caminos válidos hacia el mismo resultado', 'Los errores se propagan y se acumulan', 'Coste y latencia variables (y a veces enormes)', 'Hay que mirar el estado final del entorno y la trayectoria'] },
          ],
        },
        { tipo: 'callout', variante: 'clave', html: 'Cuando evalúas un agente no evalúas una respuesta: evalúas un <strong>comportamiento</strong> en un <strong>entorno</strong>. Por eso necesitas entornos reproducibles, varios intentos por tarea y formas de comprobar el resultado que no dependan de lo que el agente <em>dice</em> haber hecho.' },
        {
          tipo: 'pregunta',
          id: 'm01-c1',
          pregunta: {
            tipo: 'unica',
            pregunta: 'Un agente de soporte responde al cliente: "He emitido el reembolso de 49,90 €". ¿Qué es lo más fiable para decidir si la tarea se completó?',
            opciones: [
              'Consultar la base de datos de pagos y comprobar que existe el reembolso correcto.',
              'Pedir a un LLM juez que lea la respuesta y diga si suena convincente.',
              'Buscar la palabra "reembolso" en la respuesta final.',
              'Comprobar que el agente usó menos de 10 pasos.',
            ],
            correcta: 0,
            explicacion: 'Lo que el agente dice no es lo que el agente hizo. El <em>outcome</em> está en el estado del entorno (la base de datos de pagos). Un juez que solo lee el texto puede ser engañado por una afirmación segura pero falsa, y buscar palabras clave es todavía más frágil. El número de pasos es una métrica de eficiencia, no de éxito.',
            seccion: 's1',
          },
        },
      ],
    },
    {
      id: 's2',
      titulo: 'Cinco razones por las que es más difícil',
      bloques: [
        { tipo: 'p', html: 'Vamos a nombrar con precisión qué hace que evaluar agentes sea más difícil. Cada una de estas dificultades tiene una respuesta técnica que veremos a lo largo del curso.' },
        {
          tipo: 'acordeon',
          items: [
            {
              titulo: '1 · No determinismo compuesto',
              bloques: [
                { tipo: 'p', html: 'Un LLM muestrea tokens con cierta aleatoriedad. En una sola llamada, esa variabilidad suele ser pequeña. En un agente, una pequeña diferencia en el paso 3 (buscar con otra palabra clave) cambia lo que observa en el paso 4, que cambia lo que decide en el paso 5… Dos ejecuciones de la misma tarea pueden acabar en lugares completamente distintos.' },
                { tipo: 'p', html: 'Además del modelo, el entorno también varía: una web que tarda más en cargar, una API que devuelve resultados en otro orden, un test con condiciones de carrera.' },
                { tipo: 'callout', variante: 'info', titulo: 'Respuesta técnica', html: 'Ejecutar <strong>varios ensayos</strong> (<em>trials</em>) por tarea, reportar intervalos de confianza y usar métricas como <em>pass@k</em> y <em>pass^k</em> (módulo 8).' },
              ],
            },
            {
              titulo: '2 · Muchas trayectorias válidas',
              bloques: [
                { tipo: 'p', html: 'Para arreglar un bug, un agente puede leer primero los tests, o reproducir el error, o buscar en el historial de git. Para reservar un vuelo puede buscar por precio o por horario. Si tu evaluación exige <em>un camino concreto</em>, penalizarás soluciones correctas y creativas.' },
                { tipo: 'callout', variante: 'info', titulo: 'Respuesta técnica', html: 'Puntuar sobre todo el <strong>resultado</strong> (<em>outcome</em>) y restringir el proceso solo en lo que de verdad importa: seguridad, políticas, coste (módulo 6).' },
              ],
            },
            {
              titulo: '3 · Estado y efectos secundarios',
              bloques: [
                { tipo: 'p', html: 'Un agente modifica el mundo. Si dos ensayos comparten entorno, el segundo puede encontrarse los ficheros que dejó el primero (y "aprobar" sin hacer nada). Si el entorno es real, el agente puede romper cosas: borrar datos, enviar correos, gastar dinero.' },
                { tipo: 'callout', variante: 'info', titulo: 'Respuesta técnica', html: 'Entornos <strong>aislados y reiniciados</strong> para cada ensayo (contenedores, máquinas virtuales, bases de datos de prueba) y graders que inspeccionan el estado final (módulo 4).' },
              ],
            },
            {
              titulo: '4 · Errores que se acumulan',
              bloques: [
                { tipo: 'p', html: 'Si cada paso tiene un 95 % de probabilidad de salir bien y la tarea necesita 20 pasos, la probabilidad de que todos salgan bien es 0,95<sup>20</sup> ≈ 36 %. Un modelo que parece "casi perfecto" en pasos aislados puede fallar la mayoría de tareas largas. Lo explorarás en la siguiente sección con una calculadora.' },
                { tipo: 'callout', variante: 'info', titulo: 'Respuesta técnica', html: 'Evaluar tanto <strong>componentes</strong> como el sistema <strong>extremo a extremo</strong>, y analizar dónde aparece el primer error en la trayectoria (módulo 3).' },
              ],
            },
            {
              titulo: '5 · Coste, latencia y presupuesto',
              bloques: [
                { tipo: 'p', html: 'Una tarea de agente puede consumir desde unos pocos miles hasta millones de tokens. Un patrón que mejora el éxito un 3 % pero multiplica el coste por 10 puede no merecer la pena. Y una evaluación de cientos de tareas con varios ensayos cada una cuesta dinero y tiempo reales.' },
                { tipo: 'callout', variante: 'info', titulo: 'Respuesta técnica', html: 'Medir siempre <strong>coste y latencia junto al éxito</strong>, comparar configuraciones con el mismo presupuesto y razonar con la frontera de Pareto (módulos 3 y 8).' },
              ],
            },
          ],
        },
        {
          tipo: 'clasificar',
          id: 'm01-cl1',
          instrucciones: 'Cada situación ilustra principalmente una de las cinco dificultades. Asígnala.',
          categorias: ['No determinismo', 'Trayectorias múltiples', 'Estado compartido', 'Errores acumulados', 'Coste'],
          items: [
            { texto: 'La misma tarea aprueba el lunes y suspende el martes sin haber cambiado nada del agente.', categoria: 'No determinismo', explicacion: 'Sin cambios en el sistema, la variación viene del muestreo del modelo o del entorno. Un solo ensayo no basta para saber la tasa real.' },
            { texto: 'El grader exige que el agente llame a <code>buscar_cliente</code> antes que a <code>listar_cargos</code>, y suspende a un agente que lo hizo al revés y resolvió bien la tarea.', categoria: 'Trayectorias múltiples', explicacion: 'Había más de un camino válido. Restringir el orden de las llamadas penaliza una solución correcta.' },
            { texto: 'El ensayo 3 aprueba porque el ensayo 2 dejó creado el fichero <code>salida.csv</code> en el mismo directorio.', categoria: 'Estado compartido', explicacion: 'Los ensayos deben empezar desde un entorno limpio. Aquí el resultado del ensayo 3 no dice nada sobre el agente.' },
            { texto: 'Cada herramienta individual funciona bien en pruebas unitarias, pero las tareas de 40 pasos fallan casi siempre.', categoria: 'Errores acumulados', explicacion: 'Fiabilidades altas por paso se multiplican a lo largo de muchos pasos y dan una fiabilidad total baja.' },
            { texto: 'Añadir un segundo agente revisor sube el éxito del 71 % al 73 %, pero triplica la factura de la API.', categoria: 'Coste', explicacion: 'La mejora hay que ponerla en relación con lo que cuesta. Puede no compensar, o puede que gastar ese presupuesto de otra forma mejore más.' },
            { texto: 'Un agente de navegación tiene éxito en una web y falla en otra ejecución porque un banner de cookies apareció a mitad de la tarea.', categoria: 'No determinismo', explicacion: 'Aquí la aleatoriedad viene del entorno, no del modelo. Por eso se prefieren entornos controlados (webs autoalojadas) para evaluar.' },
          ],
        },
      ],
    },
    {
      id: 's3',
      titulo: 'La aritmética de las tareas largas',
      bloques: [
        { tipo: 'p', html: 'La composición de errores merece un apartado propio porque es contraintuitiva y tiene consecuencias directas sobre cómo interpretas los resultados. Si una tarea requiere <em>n</em> pasos y cada uno sale bien con probabilidad <em>p</em> de forma independiente, la probabilidad de completar la tarea es:' },
        { tipo: 'callout', variante: 'clave', titulo: 'Fórmula', html: '<strong>P(éxito) = p<sup>n</sup></strong>. Con p = 0,99 y n = 50 pasos, P ≈ 0,605. Con p = 0,95 y n = 50, P ≈ 0,077.' },
        { tipo: 'p', html: 'Juega con la calculadora. Fíjate sobre todo en la segunda cifra: la fiabilidad por paso que necesitas para que la tarea completa salga bien el 90 % de las veces.' },
        { tipo: 'widget', nombre: 'compuesto', p: 0.95, pasos: 20 },
        { tipo: 'p', html: 'Este modelo es una simplificación. En la realidad, dos cosas lo complican en direcciones opuestas:' },
        {
          tipo: 'lista',
          items: [
            '<strong>Recuperación</strong>: un buen agente detecta errores (un test que falla, un resultado vacío) y los corrige. Eso hace que la fiabilidad real sea mayor que p<sup>n</sup>. Gran parte de la mejora de los agentes modernos viene de recuperarse mejor, no de equivocarse menos.',
            '<strong>Correlación</strong>: si el agente malinterpretó la tarea al principio, todos los pasos siguientes estarán "bien ejecutados" pero apuntando al objetivo equivocado. Ese tipo de error no se diluye: arrastra toda la trayectoria.',
          ],
        },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Consecuencia práctica', html: 'Cuando una mejora del modelo sube un poco la fiabilidad por paso, el efecto en tareas largas puede ser enorme. Por eso las métricas que miden la <strong>longitud de las tareas</strong> que un agente puede completar (como el "horizonte temporal" de METR, módulo 5) crecen mucho más deprisa que las notas de los benchmarks de una sola pregunta.' },
        {
          tipo: 'pregunta',
          id: 'm01-c2',
          pregunta: {
            tipo: 'numerica',
            pregunta: 'Un agente necesita 30 pasos para una migración. Si cada paso sale bien con probabilidad 0,98 de forma independiente y sin recuperación, ¿cuál es la probabilidad de completar la tarea? Responde en tanto por uno con dos decimales.',
            respuesta: 0.55,
            tolerancia: 0.01,
            explicacion: '0,98<sup>30</sup> = e<sup>30·ln 0,98</sup> ≈ e<sup>−0,606</sup> ≈ 0,545, es decir, alrededor de 0,55. Casi la mitad de las migraciones fallarían aunque cada paso individual parezca muy fiable.',
            seccion: 's3',
          },
        },
      ],
    },
    {
      id: 's4',
      titulo: 'Para qué sirve evaluar (y qué pasa si no lo haces)',
      bloques: [
        { tipo: 'p', html: 'Muchos equipos empiezan a construir agentes sin evaluaciones sistemáticas: prueban a mano unos cuantos casos, les "parece que va bien" y lo despliegan. Funciona un tiempo. Luego aparecen los síntomas típicos:' },
        {
          tipo: 'lista',
          items: [
            '<strong>Regresiones invisibles</strong>: un cambio en el prompt arregla un caso y rompe otros tres que nadie volvió a probar.',
            '<strong>Parálisis ante un modelo nuevo</strong>: sale un modelo mejor y no sabes si cambiar, porque no tienes forma de medir si mejora <em>tu</em> caso de uso.',
            '<strong>Discusiones por intuición</strong>: "yo creo que la versión B es mejor" contra "a mí me parece peor", sin datos.',
            '<strong>Depuración a ciegas</strong>: los usuarios se quejan, pero no sabes si el problema es frecuente, si es nuevo, ni en qué paso falla el agente.',
          ],
        },
        { tipo: 'p', html: 'Una buena suite de evaluación convierte esas preguntas en números con intervalos de confianza. Te permite iterar rápido (cambias algo, ejecutas, ves el efecto), adoptar modelos nuevos en días en lugar de semanas, y tener conversaciones basadas en evidencia. A esta forma de trabajar se le llama <em>eval-driven development</em>: igual que en el desarrollo guiado por tests, primero defines cómo medirás el éxito y luego mejoras el sistema hasta que lo alcanza.' },
        {
          tipo: 'cita',
          html: 'Una evaluación es, en su forma más simple, un test para un sistema de IA: das una entrada, aplicas una lógica de puntuación a la salida y mides el éxito.',
          fuente: 'Idea central de la guía de Anthropic sobre evaluación de agentes (2026), parafraseada',
        },
        {
          tipo: 'revelar',
          pregunta: 'Si las evals son tan útiles, ¿por qué crees que muchos equipos las posponen? Piensa en al menos dos razones antes de mirar.',
          respuesta: '<ul><li><strong>Coste inicial</strong>: hay que construir entornos, escribir tareas con soluciones de referencia y programar graders. Parece trabajo que "no hace avanzar el producto".</li><li><strong>Dificultad de definir el éxito</strong>: en tareas abiertas (redactar un informe, atender a un cliente) no es obvio qué es "bien hecho".</li><li><strong>Creencia de que hacen falta cientos de tareas</strong>: en realidad, 20-50 tareas sacadas de fallos reales bastan para empezar (módulo 9).</li><li><strong>Ruido</strong>: los resultados varían entre ejecuciones y eso desanima si no sabes tratarlo estadísticamente (módulo 8).</li></ul>',
        },
      ],
    },
    {
      id: 's5',
      titulo: 'Un mapa de los tipos de evaluación',
      bloques: [
        { tipo: 'p', html: 'La palabra "evaluación" se usa para cosas muy distintas. Estas cuatro distinciones te ayudarán a situarte siempre que alguien hable de "las evals".' },
        {
          tipo: 'tabla',
          titulo: 'Cuatro ejes para clasificar una evaluación',
          columnas: ['Eje', 'Un extremo', 'El otro extremo', 'Para qué sirve cada uno'],
          filas: [
            ['Cuándo', '<strong>Offline</strong>: antes de desplegar, con tareas preparadas', '<strong>Online</strong>: en producción, sobre tráfico real', 'Offline para iterar y prevenir; online para descubrir lo que no previste'],
            ['Objetivo', '<strong>Capacidad</strong>: ¿qué sabe hacer? (tasa de éxito baja, margen de mejora)', '<strong>Regresión</strong>: ¿sigue haciendo lo que ya hacía? (se espera ~100 %)', 'Capacidad para subir la cuesta; regresión para no resbalar hacia atrás'],
            ['Alcance', '<strong>Componente</strong>: el router, el recuperador, una herramienta', '<strong>Extremo a extremo</strong>: el sistema completo', 'Componente para diagnosticar; extremo a extremo para saber si el usuario queda servido'],
            ['Quién puntúa', '<strong>Automático</strong>: código o modelo', '<strong>Humano</strong>: expertos, usuarios', 'Automático para escalar; humano para calibrar y para lo que solo una persona puede juzgar'],
          ],
        },
        { tipo: 'h', texto: 'Capacidad frente a regresión' },
        { tipo: 'p', html: 'Esta distinción es especialmente útil. Una <strong>eval de capacidad</strong> contiene tareas que tu agente todavía resuelve mal: su función es darte una colina que escalar. Una <strong>eval de regresión</strong> contiene tareas que el agente ya resuelve de forma fiable: su función es avisarte si un cambio rompe algo. Con el tiempo, las tareas de capacidad que el agente domina se "gradúan" y pasan a la suite de regresión.' },
        {
          tipo: 'pregunta',
          id: 'm01-c3',
          pregunta: {
            tipo: 'unica',
            pregunta: 'Tu suite de capacidad pasa del 35 % al 97 % de éxito tras seis meses de mejoras. ¿Qué deberías hacer con ella?',
            opciones: [
              'Mover la mayoría de sus tareas a la suite de regresión y crear nuevas tareas más difíciles para medir capacidad.',
              'Nada: un 97 % significa que el agente ya es perfecto.',
              'Eliminarla, porque ya no aporta información.',
              'Subir la temperatura del modelo para que la eval vuelva a ser difícil.',
            ],
            correcta: 0,
            explicacion: 'Una eval saturada ya no distingue entre versiones buenas y muy buenas, así que deja de servir para medir capacidad. Pero sigue siendo valiosa para detectar regresiones. Lo correcto es graduar esas tareas a regresión y escribir tareas nuevas que reflejen lo que el agente aún no hace bien. Cambiar la temperatura solo añadiría ruido.',
            seccion: 's5',
          },
        },
      ],
    },
    {
      id: 's6',
      titulo: 'El modelo del queso suizo',
      bloques: [
        { tipo: 'p', html: 'Ningún método de evaluación detecta todos los problemas. Las evals automáticas no ven lo que no previste quien las escribió. La monitorización en producción llega tarde (el usuario ya sufrió el fallo). La revisión humana no escala. La solución es apilar capas, cada una con sus agujeros en sitios distintos, como las lonchas de un queso suizo: un fallo solo llega al usuario si atraviesa todas.' },
        {
          tipo: 'figura',
          svg: '<svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg"><defs><marker id="fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--fail)"/></marker></defs>' +
            '<g style="fill:var(--accent-soft);stroke:var(--accent)" stroke-width="1.5">' +
            '<rect x="70" y="30" width="44" height="150" rx="8"/><rect x="170" y="30" width="44" height="150" rx="8"/><rect x="270" y="30" width="44" height="150" rx="8"/><rect x="370" y="30" width="44" height="150" rx="8"/><rect x="470" y="30" width="44" height="150" rx="8"/></g>' +
            '<g style="fill:var(--surface)">' +
            '<circle cx="92" cy="70" r="9"/><circle cx="92" cy="140" r="7"/><circle cx="192" cy="105" r="9"/><circle cx="192" cy="55" r="6"/><circle cx="292" cy="140" r="8"/><circle cx="292" cy="80" r="6"/><circle cx="392" cy="60" r="8"/><circle cx="392" cy="125" r="7"/><circle cx="492" cy="95" r="8"/><circle cx="492" cy="150" r="6"/></g>' +
            '<path d="M20,70 L92,70 L192,105 L250,120" fill="none" style="stroke:var(--fail)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#fl)"/>' +
            '<text x="20" y="62" style="fill:var(--fail);font-size:11px;font-family:var(--font-mono)">fallo</text>' +
            '<text x="252" y="114" style="fill:var(--fail);font-size:11px;font-family:var(--font-mono)">detenido</text>' +
            '<g style="fill:var(--muted);font-size:10.5px;font-family:var(--font-mono)" text-anchor="middle">' +
            '<text x="92" y="200">evals auto</text><text x="192" y="200">monitorización</text><text x="292" y="200">A/B y feedback</text><text x="392" y="200">lectura manual</text><text x="492" y="200">estudios humanos</text></g>' +
            '<text x="600" y="110" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-family:var(--font-mono)">usuario</text></svg>',
          pie: 'Cada capa tiene agujeros en sitios distintos. Un fallo atraviesa la primera (las evals no lo cubrían) y lo detiene la segunda (la monitorización en producción).',
        },
        {
          tipo: 'tabla',
          columnas: ['Capa', 'Detecta bien', 'Se le escapa'],
          filas: [
            ['Evals automáticas offline', 'Regresiones en comportamientos conocidos; comparaciones entre versiones y modelos', 'Casos que nadie pensó; cambios en el comportamiento de los usuarios'],
            ['Monitorización en producción', 'Errores reales y su frecuencia; deriva; picos de coste o latencia', 'Fallos silenciosos que no dejan señal; llega después del daño'],
            ['Tests A/B y feedback de usuarios', 'Impacto real en el negocio y en la satisfacción', 'Lento; necesita mucho tráfico; el feedback es escaso y sesgado'],
            ['Lectura manual de transcripts', 'Fallos sutiles, graders rotos, trampas del agente', 'No escala; depende de quién lea'],
            ['Estudios humanos sistemáticos', 'Calidad en tareas subjetivas; calibración de jueces', 'Caros y lentos'],
          ],
        },
        { tipo: 'callout', variante: 'clave', html: 'Este curso se centra en la primera capa, las <strong>evals automáticas</strong>, porque es la que más se puede diseñar y la que más acelera el desarrollo. Pero verás conexiones constantes con las demás: los fallos de producción se convierten en tareas nuevas, la lectura de transcripts valida los graders y los humanos calibran a los jueces LLM.' },
        {
          tipo: 'pregunta',
          id: 'm01-c4',
          pregunta: {
            tipo: 'multiple',
            pregunta: '¿Qué afirmaciones sobre el modelo del queso suizo son correctas?',
            opciones: [
              'Cada capa de evaluación deja pasar algunos fallos, pero en sitios distintos a las demás.',
              'Si tienes evals automáticas muy buenas, puedes prescindir de la monitorización en producción.',
              'Los fallos encontrados en producción deberían convertirse en tareas de la suite automática.',
              'La lectura manual de transcripts sirve también para descubrir graders que puntúan mal.',
            ],
            correctas: [0, 2, 3],
            explicacion: 'La gracia del modelo es que las capas se complementan: ninguna es suficiente sola. Las evals offline nunca cubren todo lo que pasa en producción, así que la monitorización sigue siendo necesaria. El bucle producción → nuevas tareas es la forma de que la suite automática aprenda de sus agujeros, y leer transcripts es la forma principal de detectar graders rotos.',
            seccion: 's6',
          },
        },
      ],
    },
    {
      id: 's7',
      titulo: 'Un primer vistazo a un transcript',
      bloques: [
        { tipo: 'p', html: 'A lo largo del curso analizarás muchas transcripciones (<em>transcripts</em>): el registro completo de lo que hizo un agente en un ensayo. Leerlas es la habilidad más infravalorada de quien evalúa agentes. Empecemos con una sencilla. Pulsa sobre los pasos para seleccionarlos y luego comprueba.' },
        {
          tipo: 'transcript',
          id: 'm01-tr1',
          titulo: 'Agente de soporte: cargo duplicado',
          contexto: 'Tarea: el cliente 4821 dice que le cobraron dos veces el pedido A-1002. El agente debe comprobarlo y reembolsar el duplicado si existe. El grader marcó este ensayo como <strong>PASS</strong> porque la respuesta final contiene "reembolso emitido".',
          pasos: [
            { rol: 'usuario', html: 'Me habéis cobrado dos veces el pedido A-1002. Soy el cliente 4821.' },
            { rol: 'herramienta', html: '<code>listar_cargos(cliente=4821)</code>' },
            { rol: 'resultado', html: '<code>[{id: "ch_91", pedido: "A-1002", importe: 49.90}, {id: "ch_92", pedido: "A-1002", importe: 49.90}]</code>' },
            { rol: 'pensamiento', html: 'Hay dos cargos idénticos. Debo reembolsar uno de ellos.' },
            { rol: 'herramienta', html: '<code>emitir_reembolso(cargo="ch_91", importe=4990)</code>', nota: 'El importe va en céntimos según la API (4990 = 49,90 €). Hasta aquí todo correcto.' },
            { rol: 'resultado', html: '<code>{error: "importe excede el límite de 100 € sin aprobación"}</code>', nota: 'La API devuelve un error. Probablemente el agente envió el importe en una unidad incorrecta para esta API (euros×100 interpretado como euros), pero en cualquier caso <strong>el reembolso no se emitió</strong>.' },
            { rol: 'agente', html: 'He revisado tu cuenta y efectivamente había un cargo duplicado. He emitido el reembolso de 49,90 €; lo verás en 3-5 días hábiles.', nota: 'El agente afirma un éxito que no ocurrió e ignora el error de la herramienta.' },
            { rol: 'grader', html: 'Busca "reembolso emitido" o "he emitido el reembolso" en la respuesta final → <strong>PASS</strong>', nota: 'El grader confía en lo que el agente dice. Un grader de estado que consultara la tabla de reembolsos habría detectado el fallo.' },
          ],
          pregunta: '¿En qué pasos está el problema? (puede haber más de uno)',
          culpables: [6, 7],
          explicacion: 'Hay dos fallos que se tapan mutuamente. El <strong>agente</strong> (paso 6) ignora el error devuelto por la herramienta y declara un éxito falso. El <strong>grader</strong> (paso 7) solo mira el texto de la respuesta, así que da por bueno el ensayo. El resultado: un falso positivo en tu eval y un cliente sin reembolso. La solución es un grader de estado que compruebe la base de datos, y una tarea de regresión que fuerce un error de herramienta para ver si el agente lo maneja.',
        },
        { tipo: 'callout', variante: 'aviso', html: 'Este patrón (el agente dice que lo hizo, el grader se lo cree) es uno de los fallos más frecuentes en evals hechas deprisa. Lo verás de nuevo en los módulos 6 y 10.' },
      ],
    },
    {
      id: 's8',
      titulo: 'Qué vas a aprender en el resto del curso',
      bloques: [
        { tipo: 'p', html: 'Ya tienes la intuición de por qué evaluar agentes es diferente. El resto del curso sigue el orden en que te encontrarás estas decisiones al construir una evaluación real:' },
        {
          tipo: 'tabla',
          columnas: ['Módulo', 'Pregunta que responde'],
          filas: [
            ['02 · Anatomía', '¿Cuáles son las piezas de una eval y cómo se llaman?'],
            ['03 · Patrones', '¿Cómo evalúo un router, un orquestador, un sistema multiagente o una combinación de patrones?'],
            ['04 · Harnesses', '¿Qué parte del resultado se debe al modelo y qué parte al código que lo rodea? ¿Cómo monto la infraestructura?'],
            ['05 · Benchmarks', '¿Qué miden SWE-bench, τ-bench, WebArena, OSWorld, GAIA…? ¿Cómo leo un leaderboard sin engañarme?'],
            ['06 · Graders', '¿Cómo puntúo una tarea: tests, estado, juez LLM o personas?'],
            ['07 · Tipos de tarea', '¿Cómo evalúo un agente de código, uno conversacional, uno de investigación, uno de navegador…?'],
            ['08 · Métricas', '¿pass@k o pass^k? ¿Cuántas tareas necesito? ¿Es significativa la diferencia?'],
            ['09 · Diseña tu suite', '¿Por dónde empiezo mañana con mi propio agente?'],
            ['10 · Trampas', '¿Qué puede salir mal, incluido que el agente haga trampas?'],
            ['11 · Laboratorio', 'Construir y ejecutar evals con código real.'],
          ],
        },
        {
          tipo: 'tarjetas',
          items: [
            { frente: 'Agente', reverso: 'Sistema en el que un modelo decide en bucle qué acciones tomar con herramientas, observando los resultados, hasta completar un objetivo.' },
            { frente: 'Outcome', reverso: 'El estado final del entorno tras un ensayo. Es la prueba de lo que el agente hizo, frente a lo que dice haber hecho.' },
            { frente: 'Composición del error', reverso: 'Con fiabilidad p por paso y n pasos independientes, el éxito total es pⁿ. Pequeñas mejoras por paso tienen grandes efectos en tareas largas.' },
            { frente: 'Eval de capacidad', reverso: 'Tareas que el agente aún resuelve mal; sirven para medir progreso. Cuando se saturan, se gradúan a regresión.' },
            { frente: 'Eval de regresión', reverso: 'Tareas que el agente ya resuelve de forma fiable; sirven para detectar si un cambio rompe algo.' },
            { frente: 'Queso suizo', reverso: 'Varias capas de evaluación (automática, producción, A/B, lectura manual, estudios humanos) con agujeros en sitios distintos.' },
          ],
        },
      ],
    },
  ],
  resumen: [
    'Un agente actúa en bucle sobre un entorno: se evalúa un comportamiento, no una respuesta.',
    'Las cinco dificultades: no determinismo compuesto, trayectorias múltiples, estado y efectos secundarios, errores acumulados y coste.',
    'Con fiabilidad p por paso y n pasos, el éxito es pⁿ: pequeñas mejoras por paso cambian mucho las tareas largas.',
    'Comprueba el resultado en el estado del entorno, no en lo que el agente dice haber hecho.',
    'Distingue offline/online, capacidad/regresión, componente/extremo a extremo y automático/humano.',
    'Las evals automáticas son una capa de un sistema de calidad más amplio (queso suizo).',
    'Leer transcripts es imprescindible: revela tanto fallos del agente como fallos del grader.',
  ],
  quiz: [
    {
      tipo: 'unica',
      pregunta: '¿Cuál es la diferencia fundamental entre evaluar un LLM de una sola llamada y evaluar un agente?',
      opciones: [
        'El agente actúa en bucle sobre un entorno con estado, así que hay que evaluar el resultado de sus acciones y no solo un texto.',
        'Los agentes usan modelos más grandes, así que las evaluaciones son más caras.',
        'Los agentes siempre son deterministas, mientras que los LLM no.',
        'Para evaluar agentes no hace falta tener respuestas de referencia.',
      ],
      correcta: 0,
      explicacion: 'Lo esencial es que el agente toma decisiones encadenadas y cambia el estado de un entorno. El tamaño del modelo no es lo definitorio, los agentes son incluso menos deterministas que una sola llamada, y sigues necesitando una noción clara de éxito (a menudo, un estado de referencia).',
      seccion: 's1',
    },
    {
      tipo: 'vf',
      afirmacion: 'Si un agente acierta el 99 % de los pasos individuales, acertará aproximadamente el 99 % de las tareas, sean largas o cortas.',
      correcta: false,
      explicacion: 'Falso. Con pasos independientes, la fiabilidad total es 0,99<sup>n</sup>: unos 0,90 con 10 pasos, 0,61 con 50 y 0,37 con 100. La longitud de la tarea importa muchísimo.',
      seccion: 's3',
    },
    {
      tipo: 'numerica',
      pregunta: '¿Qué fiabilidad por paso necesitas para que una tarea de 10 pasos independientes salga bien el 90 % de las veces? Responde en tanto por uno con tres decimales.',
      respuesta: 0.9895,
      tolerancia: 0.0015,
      explicacion: 'Necesitas p tal que p<sup>10</sup> = 0,9, es decir p = 0,9<sup>1/10</sup> ≈ 0,9895. Casi un 99 % por paso para un 90 % en una tarea de solo 10 pasos.',
      seccion: 's3',
    },
    {
      tipo: 'unica',
      pregunta: 'Un grader exige que el agente consulte la documentación antes de modificar código. Un agente modifica el código directamente, los tests ocultos pasan y el cambio es correcto. ¿Qué problema ilustra el suspenso?',
      opciones: [
        'Penalizar una trayectoria válida distinta de la prevista.',
        'Contaminación del benchmark.',
        'Estado compartido entre ensayos.',
        'Composición del error.',
      ],
      correcta: 0,
      explicacion: 'Hay muchos caminos válidos hacia el mismo resultado. Exigir un orden concreto de acciones (salvo que sea un requisito real, como una política de seguridad) suspende soluciones correctas.',
      seccion: 's2',
    },
    {
      tipo: 'multiple',
      pregunta: '¿Qué medidas ayudan a lidiar con el no determinismo de los agentes?',
      opciones: [
        'Ejecutar varios ensayos por tarea.',
        'Reportar intervalos de confianza junto a la tasa de éxito.',
        'Usar entornos controlados en lugar de webs o APIs reales cambiantes.',
        'Ejecutar una sola vez y repetir solo si el resultado no gusta.',
      ],
      correctas: [0, 1, 2],
      explicacion: 'Varios ensayos y los intervalos de confianza cuantifican la variabilidad; los entornos controlados reducen la que viene del entorno. Repetir solo cuando el resultado "no gusta" es una forma de seleccionar resultados (<em>cherry-picking</em>) que sesga la medida.',
      seccion: 's2',
    },
    {
      tipo: 'emparejar',
      pregunta: 'Empareja cada tipo de evaluación con su propósito principal.',
      pares: [
        ['Eval de capacidad', 'Medir progreso en lo que el agente aún hace mal'],
        ['Eval de regresión', 'Detectar si un cambio rompe lo que ya funcionaba'],
        ['Evaluación online', 'Descubrir fallos con tráfico real en producción'],
        ['Evaluación de componente', 'Diagnosticar qué pieza del sistema falla'],
      ],
      explicacion: 'Capacidad = colina que escalar; regresión = red de seguridad; online = lo que pasa de verdad con usuarios; componente = diagnóstico localizado. Una estrategia completa usa los cuatro.',
      seccion: 's5',
    },
    {
      tipo: 'unica',
      pregunta: 'En el transcript del cargo duplicado, ¿qué tipo de grader habría evitado el falso positivo?',
      opciones: [
        'Un grader de estado que consulte la tabla de reembolsos.',
        'Un grader que cuente el número de pasos.',
        'Un grader que busque más palabras clave en la respuesta.',
        'Un grader que compruebe que el agente usó la herramienta <code>emitir_reembolso</code>.',
      ],
      correcta: 0,
      explicacion: 'El agente llamó a la herramienta (así que la última opción también daría PASS), pero la llamada falló. Solo mirando el estado real (¿existe el reembolso?) se detecta el problema. Más palabras clave no arreglan nada: el texto miente.',
      seccion: 's7',
    },
    {
      tipo: 'vf',
      afirmacion: 'Una suite de capacidad que ha llegado al 97 % de éxito sigue siendo útil para medir nuevas capacidades del agente.',
      correcta: false,
      explicacion: 'Falso. Está saturada: ya no distingue entre una versión buena y una mejor. Sigue siendo útil como suite de <em>regresión</em>, pero para medir capacidad necesitas tareas nuevas y más difíciles.',
      seccion: 's5',
    },
    {
      tipo: 'unica',
      pregunta: 'Un cambio sube el éxito del 71 % al 73 % pero triplica el coste por tarea. ¿Qué es lo más sensato?',
      opciones: [
        'Comparar con otras formas de gastar ese presupuesto y comprobar si la diferencia de 2 puntos es estadísticamente significativa.',
        'Adoptarlo siempre: más éxito es mejor.',
        'Rechazarlo siempre: el coste es lo único que importa.',
        'Ejecutar la eval hasta que la diferencia sea mayor.',
      ],
      correcta: 0,
      explicacion: 'Dos puntos pueden ser ruido (módulo 8) y, aunque sean reales, quizá otra configuración con el mismo presupuesto mejore más (frontera de Pareto). Repetir hasta obtener la diferencia deseada es <em>p-hacking</em>.',
      seccion: 's2',
    },
    {
      tipo: 'orden',
      pregunta: 'Ordena el bucle básico de un agente.',
      items: ['Recibe el objetivo del usuario', 'Decide la siguiente acción', 'Llama a una herramienta', 'Observa el resultado', 'Responde cuando considera que ha terminado'],
      explicacion: 'Objetivo → decidir → actuar → observar, repitiendo los tres últimos hasta terminar. La evaluación puede mirar cualquier punto de este bucle, pero sobre todo el estado final.',
      seccion: 's1',
    },
    {
      tipo: 'unica',
      pregunta: '¿Por qué los ensayos de una misma tarea deben empezar desde un entorno limpio?',
      opciones: [
        'Porque un ensayo puede dejar artefactos que hagan aprobar o suspender al siguiente sin relación con lo que hace el agente.',
        'Porque así la evaluación es más barata.',
        'Porque los modelos se cansan si el entorno está lleno.',
        'Porque es un requisito legal.',
      ],
      correcta: 0,
      explicacion: 'Sin aislamiento, los ensayos dejan de ser independientes: ficheros, cachés o datos de un ensayo contaminan el siguiente. Aislar suele hacer la evaluación más cara, no más barata, pero es imprescindible para que el resultado signifique algo.',
      seccion: 's2',
    },
    {
      tipo: 'multiple',
      pregunta: '¿Qué síntomas son típicos de un equipo que desarrolla agentes sin evaluaciones sistemáticas?',
      opciones: [
        'Arreglar un caso rompe otros sin que nadie lo note.',
        'Dudar durante semanas si adoptar un modelo nuevo.',
        'Decisiones basadas en impresiones personales.',
        'Conocer con precisión la tasa de éxito en cada tipo de tarea.',
      ],
      correctas: [0, 1, 2],
      explicacion: 'Regresiones invisibles, parálisis ante modelos nuevos y debates por intuición son los síntomas clásicos. Conocer la tasa de éxito por tipo de tarea es justo lo que una buena suite de evaluación aporta.',
      seccion: 's4',
    },
  ],
});
