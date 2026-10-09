registrarModulo({
  id: 'm08',
  numero: 8,
  titulo: 'Métricas, estadística y no determinismo',
  subtitulo: 'Convierte puntuaciones ruidosas en conclusiones fiables: pass@k, pass^k, intervalos de confianza, comparaciones pareadas, tamaño de muestra y coste.',
  duracion: '100 min',
  nivel: 'Avanzado',
  objetivos: [
    'Calcular e interpretar la tasa de éxito, pass@k y pass^k con sus estimadores insesgados, y elegir la métrica según el uso del agente',
    'Identificar las fuentes de varianza de una evaluación de agentes y reducirlas',
    'Construir intervalos de confianza adecuados (Wilson, bootstrap, errores estándar agrupados) y saber cuándo falla el intervalo normal',
    'Comparar dos agentes con diseños pareados y el test de McNemar, evitando conclusiones por solapamiento de intervalos',
    'Estimar cuántas tareas necesitas para detectar una diferencia dada',
    'Medir coste y eficiencia, razonar con la frontera de Pareto y evaluar la fiabilidad de los propios graders',
  ],
  secciones: [
    // ───────────────────────────────────────────────────────────── s1
    {
      id: 's1',
      titulo: 'La tasa de éxito y cómo se agrega',
      bloques: [
        { tipo: 'p', html: `Empezamos por la métrica más simple y más usada: la <strong>tasa de éxito</strong>. Parece que no tiene misterio (éxitos entre intentos), pero la manera de agregarla decide qué pregunta estás respondiendo, y dos equipos con los mismos datos pueden publicar cifras distintas sin que ninguno haga trampa. Recuerda el vocabulario del M02: cada <em>ensayo</em> produce una puntuación; los ensayos se agregan por <em>tarea</em>; las tareas, por <em>suite</em> y por <em>segmentos</em>.` },
        { tipo: 'h', texto: 'pass@1: la probabilidad de acertar a la primera' },
        { tipo: 'p', html: `<strong>Intuición:</strong> si le das una tarea al agente una sola vez, ¿qué probabilidad hay de que salga bien? <strong>Definición:</strong> para la tarea <em>i</em>, sea <em>p<sub>i</sub></em> la probabilidad (desconocida) de éxito de un ensayo. Con <em>n</em> ensayos de los que <em>c</em> tienen éxito, el estimador natural es <em>p̂<sub>i</sub> = c/n</em>. La tasa de éxito de la suite (llamada a menudo <em>pass@1</em>) es la media de las <em>p̂<sub>i</sub></em> sobre las <em>T</em> tareas: <code>pass@1 = (1/T) · Σ c_i/n_i</code>. Si las puntuaciones admiten crédito parcial (entre 0 y 1), todo lo que sigue funciona igual con la puntuación media en lugar de <em>c/n</em>.` },
        { tipo: 'callout', variante: 'clave', titulo: 'Más ensayos no cambian lo que mides, cambian lo bien que lo mides', html: `Ejecutar 5 ensayos por tarea en vez de 1 no «sube» ni «baja» pass@1: estima la misma cantidad con menos ruido dentro de cada tarea. Lo que sí cambia la cifra es <em>qué tareas</em> hay en la suite. Veremos en la sección 5 que, a partir de cierto punto, añadir tareas reduce la incertidumbre mucho más que añadir ensayos.` },
        { tipo: 'h', texto: 'Micro frente a macro: ¿qué pesa más?' },
        { tipo: 'p', html: `Cuando la suite tiene categorías de distinto tamaño, hay dos formas de resumir:` },
        { tipo: 'lista', items: [
          `<strong>Media micro:</strong> todas las tareas pesan lo mismo; las categorías grandes dominan. Responde a «¿qué fracción de <em>esta mezcla de tareas</em> resuelve?».`,
          `<strong>Media macro:</strong> primero la tasa de cada categoría, después la media de las categorías; cada categoría pesa lo mismo. Responde a «¿qué tal le va <em>en cada tipo de trabajo</em>, en promedio?».`,
          `<strong>Media ponderada por uso:</strong> cada categoría pesa según su frecuencia en producción. Es la que mejor predice la experiencia del usuario, si conoces esas frecuencias.`,
        ] },
        { tipo: 'callout', variante: 'ejemplo', html: `Categoría «consultas»: 100 tareas, 90 % de éxito. Categoría «reembolsos»: 20 tareas, 40 % de éxito.<br>Micro = (90 + 8)/120 = <strong>81,7 %</strong>. Macro = (90 % + 40 %)/2 = <strong>65 %</strong>.<br>Si en producción los reembolsos son la mitad del tráfico, la cifra relevante se parece mucho más a 65 % que a 81,7 %. Ninguna es «la correcta»: lo incorrecto es no decir cuál usas.` },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: la mezcla de la suite decide el titular', html: `Añadir 50 tareas fáciles a una suite sube la media micro aunque el agente no haya cambiado. Si comparas versiones de un agente, la suite debe ser <strong>la misma</strong> (mismas tareas, mismas versiones). Y si la composición de la suite cambia, reporta por segmentos para que se vea de dónde viene el cambio.` },
        { tipo: 'p', html: `Los <strong>segmentos</strong> (<em>slices</em>) son tu herramienta de diagnóstico: tasa de éxito por dificultad, tipo de tarea, idioma, longitud de la trayectoria... Pero cuidado: cada segmento tiene menos tareas y, por tanto, más ruido; y cuantos más segmentos mires, más probable es que alguno «cambie» por azar (lo veremos en la sección 6, comparaciones múltiples).` },
        { tipo: 'pregunta', id: 'm08-c1', pregunta: {
          tipo: 'unica',
          pregunta: 'Una suite tiene 200 tareas de «programación» (éxito 70 %) y 50 de «despliegue» (éxito 30 %). La nueva versión del agente sube «despliegue» al 50 % y no cambia «programación». ¿Cuánto sube la media micro?',
          opciones: [
            '4 puntos (de 62 % a 66 %)',
            '10 puntos (de 50 % a 60 %)',
            '20 puntos, lo mismo que sube «despliegue»',
            'No cambia, porque la categoría grande no ha cambiado',
          ],
          correcta: 0,
          explicacion: `Micro antes = (140 + 15)/250 = 62 %; después = (140 + 25)/250 = 66 %: sube 4 puntos, porque «despliegue» es solo el 20 % de las tareas. La media macro sí sube 10 puntos (de 50 % a 60 %). La mejora de 20 puntos solo se ve en el segmento.`,
          seccion: 's1',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s2
    {
      id: 's2',
      titulo: 'pass@k: ¿lo consigue en alguno de k intentos?',
      bloques: [
        { tipo: 'p', html: `<strong>Intuición:</strong> imagina un agente de programación que genera varias soluciones y un conjunto de tests que te dice cuál funciona. Lo que te importa no es si acierta a la primera, sino si <em>alguna</em> de sus <em>k</em> propuestas es buena, porque podrás quedarte con ella. <strong>Definición:</strong> <em>pass@k</em> es la probabilidad de que <strong>al menos uno</strong> de <em>k</em> intentos independientes tenga éxito. Para una tarea con probabilidad de éxito <em>p</em>: <code>pass@k = 1 − (1 − p)^k</code>, y la cifra de la suite es la media sobre tareas.` },
        { tipo: 'p', html: `La métrica se popularizó en generación de código: la propusieron Kulal et al. (2019, SPoC) y el artículo de Codex (Chen et al., 2021, «Evaluating Large Language Models Trained on Code», que presentó HumanEval) la convirtió en estándar y, sobre todo, mostró cómo <strong>estimarla bien</strong>.` },
        { tipo: 'h', texto: 'El estimador insesgado' },
        { tipo: 'p', html: `La forma ingenua de calcularlo sería generar exactamente <em>k</em> intentos por tarea y mirar si alguno acierta. Eso es muy ruidoso. La alternativa de Chen et al.: genera <em>n ≥ k</em> intentos por tarea, cuenta los <em>c</em> correctos y calcula la probabilidad de que un subconjunto de <em>k</em> elegido al azar entre los <em>n</em> contenga al menos un correcto:` },
        { tipo: 'callout', variante: 'clave', titulo: 'Estimador insesgado de pass@k (Chen et al., 2021)', html: `<code>pass@k ≈ 1 − C(n − c, k) / C(n, k)</code><br><br>donde <code>C(a, b)</code> es el número de combinaciones de <em>a</em> elementos tomados de <em>b</em> en <em>b</em>. <code>C(n − c, k)/C(n, k)</code> es la probabilidad de que los <em>k</em> elegidos sean <em>todos</em> incorrectos; su complemento es la probabilidad de que haya al menos uno correcto. Se calcula por tarea y se promedia sobre tareas. Si <em>n − c &lt; k</em>, no hay forma de elegir <em>k</em> incorrectos y el estimador vale 1.` },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Ejemplo trabajado: n = 10, c = 6, k = 3', html: `C(4, 3) = 4 formas de elegir 3 intentos entre los 4 incorrectos; C(10, 3) = 120 formas de elegir 3 entre los 10.<br>pass@3 = 1 − 4/120 = <strong>0,967</strong>.<br>Con el atajo ingenuo, p̂ = 0,6 y 1 − (1 − 0,6)<sup>3</sup> = 1 − 0,064 = <strong>0,936</strong>.<br>Para k = 2: insesgado 1 − C(4,2)/C(10,2) = 1 − 6/45 = 0,867; ingenuo 1 − 0,4<sup>2</sup> = 0,84.` },
        { tipo: 'revelar', pregunta: `¿Por qué el atajo <code>1 − (1 − p̂)^k</code>, que parece «la fórmula con el estimador dentro», está sesgado? ¿Hacia dónde?`, respuesta: `Porque la función <em>f(p) = 1 − (1 − p)<sup>k</sup></em> no es lineal: es cóncava. Por la desigualdad de Jensen, el valor esperado de <em>f(p̂)</em> es <strong>menor</strong> que <em>f(p)</em> cuando <em>p̂</em> es ruidoso: los errores hacia abajo de <em>p̂</em> pesan más que los errores hacia arriba. Resultado: el atajo <strong>subestima</strong> pass@k de forma sistemática, sobre todo con pocas muestras y <em>k</em> grande. El estimador combinatorio, en cambio, tiene como esperanza exactamente <em>1 − (1 − p)<sup>k</sup></em> (es la probabilidad de un evento definido sobre una submuestra aleatoria de los <em>n</em> intentos), así que es insesgado.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'pass@k: estimador insesgado (y versión estable para n grande)', codigo: `from math import comb
import numpy as np

def pass_at_k(n: int, c: int, k: int) -> float:
    """Estimador insesgado de pass@k (Chen et al., 2021).
    n = intentos generados, c = intentos correctos, k <= n."""
    if n - c < k:            # no se pueden elegir k intentos todos fallidos
        return 1.0
    return 1.0 - comb(n - c, k) / comb(n, k)

def pass_at_k_estable(n: int, c: int, k: int) -> float:
    """Misma cantidad, como producto (forma usada en el artículo de Codex)."""
    if n - c < k:
        return 1.0
    return 1.0 - float(np.prod(1.0 - k / np.arange(n - c + 1, n + 1)))

print(pass_at_k(10, 6, 3))          # 0.9667
print(pass_at_k_estable(10, 6, 3))  # 0.9667
print(1 - (1 - 6 / 10) ** 3)        # 0.936  <- atajo ingenuo (sesgado a la baja)

# Suite: media de los estimadores por tarea, NO la fórmula aplicada a la media
resultados = {"t1": (10, 10), "t2": (10, 2)}   # (n, c) por tarea
print(np.mean([pass_at_k(n, c, 3) for n, c in resultados.values()]))  # 0.7667` },
        { tipo: 'h', texto: '¿Cuándo es pass@k la métrica correcta?' },
        { tipo: 'p', html: `pass@k mide <strong>capacidad potencial</strong>: ¿está la solución al alcance del agente? Es la métrica correcta cuando en el uso real hay <strong>algo que elige el intento bueno</strong> sin coste excesivo: tests automáticos que verifican cada candidato, un verificador o un juez fiable, o una persona que revisa varias propuestas y elige. También es útil durante el desarrollo, para saber si un fallo es «el agente no sabe» (pass@k bajo) o «el agente sabe pero es inconsistente» (pass@k alto, pass@1 bajo).` },
        { tipo: 'callout', variante: 'aviso', titulo: 'Errores típicos con pass@k', html: `<ul><li><strong>Reportarlo como si fuera pass@1.</strong> «Resuelve el 90 %» con k = 10 no significa que un usuario vea una solución buena 9 de cada 10 veces.</li><li><strong>Usarlo cuando no hay quien elija.</strong> Si el agente actúa directamente sobre el mundo (envía un correo, cobra), no puedes «quedarte con el mejor de 5».</li><li><strong>n demasiado pequeño.</strong> Con n = k el estimador es el ingenuo «¿alguno de los k acertó?», muy ruidoso; Chen et al. usaron n = 200 muestras por problema para reportar k hasta 100.</li><li><strong>Comparar pass@k con k distintos</strong> o sin decir el coste: pass@10 cuesta unas 10 veces más que pass@1.</li></ul>` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s3
    {
      id: 's3',
      titulo: 'pass^k: ¿lo consigue siempre?',
      bloques: [
        { tipo: 'p', html: `Ahora piensa en un agente de atención al cliente. Cada cliente lo usa una vez; no hay nadie que elija «el mejor de 5». Peor: si a ti te cancela bien la suscripción y a tu vecino, con la misma petición, le cancela la suscripción equivocada, el producto es un desastre aunque «sepa hacerlo». Aquí lo que importa es la <strong>consistencia</strong>: ¿lo hace bien <em>cada vez</em>?` },
        { tipo: 'p', html: `<strong>Definición:</strong> <em>pass^k</em> («pass hat k») es la probabilidad de que <strong>los k</strong> ensayos independientes de una tarea tengan éxito. La introdujeron Yao et al. (2024) en <strong>τ-bench</strong>, un benchmark de agentes que conversan con un usuario simulado y usan herramientas siguiendo políticas de dominio (atención al cliente de comercio y de aerolínea). Para una tarea con probabilidad de éxito <em>p</em>: <code>pass^k = p^k</code>. Se estima, igual que pass@k, con <em>n ≥ k</em> ensayos y <em>c</em> éxitos:` },
        { tipo: 'callout', variante: 'clave', titulo: 'Estimador insesgado de pass^k (Yao et al., 2024)', html: `<code>pass^k ≈ C(c, k) / C(n, k)</code><br><br>Es la probabilidad de que un subconjunto de <em>k</em> ensayos elegido al azar entre los <em>n</em> contenga <em>solo</em> éxitos. Si <em>c &lt; k</em>, vale 0. Se calcula por tarea y se promedia sobre tareas.` },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Ejemplo trabajado: n = 10, c = 6', html: `<ul><li>k = 1: C(6,1)/C(10,1) = 6/10 = <strong>0,60</strong> (igual que pass@1).</li><li>k = 2: C(6,2)/C(10,2) = 15/45 = <strong>0,333</strong>.</li><li>k = 3: C(6,3)/C(10,3) = 20/120 = <strong>0,167</strong> (el atajo 0,6<sup>3</sup> = 0,216 lo sobrestima: aquí la función <em>p<sup>k</sup></em> es convexa y Jensen empuja hacia arriba).</li><li>k = 5: C(6,5)/C(10,5) = 6/252 = <strong>0,024</strong>.</li></ul>Mientras tanto, pass@k con los mismos datos: 0,60 → 0,867 → 0,967 → 1,00.` },
        { tipo: 'tabla', titulo: 'pass@k frente a pass^k (n = 10 ensayos por tarea)', columnas: ['Éxitos c', 'k', 'pass@k', 'pass^k'], filas: [
          ['9', '1', '0,900', '0,900'],
          ['9', '3', '1,000', '0,700'],
          ['9', '5', '1,000', '0,500'],
          ['6', '1', '0,600', '0,600'],
          ['6', '3', '0,967', '0,167'],
          ['6', '5', '1,000', '0,024'],
          ['3', '1', '0,300', '0,300'],
          ['3', '3', '0,708', '0,008'],
        ] },
        { tipo: 'p', html: `Observa el patrón: en <strong>k = 1 las dos métricas coinciden</strong> (ambas son pass@1). Al crecer <em>k</em>, pass@k sube hacia 1 (con suficientes intentos, casi cualquier tarea que el agente resuelva <em>a veces</em> acaba resuelta) y pass^k baja hacia 0 (con suficientes intentos, casi cualquier inconsistencia acaba apareciendo). La distancia entre ambas curvas es una medida visual de lo <strong>inconsistente</strong> que es el agente. Incluso un agente con un 90 % por ensayo baja al 50 % de pass^5. En el artículo de τ-bench, ese descenso con <em>k</em> fue uno de los hallazgos centrales: agentes con una tasa de éxito por ensayo aceptable resultaban mucho menos fiables al exigirles consistencia.` },
        { tipo: 'widget', nombre: 'passk', n: 10, c: 6, k: 3 },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: elevar la media de la suite a k', html: `pass^k de la suite <strong>no</strong> es (pass@1 de la suite)<sup>k</sup>. Hay que calcularlo por tarea y promediar. Ejemplo: dos tareas con 10 ensayos; T1 acierta 10/10, T2 acierta 2/10. pass@1 = 0,60. pass^3 por tarea: T1 = 1, T2 = C(2,3)/C(10,3) = 0 → suite = <strong>0,50</strong>. En cambio, 0,6<sup>3</sup> = 0,216. La heterogeneidad entre tareas importa: un agente que siempre acierta unas tareas y siempre falla otras es más «consistente» de lo que sugiere su media.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'pass^k por tarea y para la suite', codigo: `from math import comb
import numpy as np

def pass_hat_k(n: int, c: int, k: int) -> float:
    """Estimador insesgado de pass^k (Yao et al., 2024): P(los k ensayos aciertan)."""
    if c < k:
        return 0.0
    return comb(c, k) / comb(n, k)

print(pass_hat_k(10, 6, 3), (6 / 10) ** 3)   # 0.1667 frente a 0.216 (atajo, sesgado al alza)

resultados = {"t1": (10, 10), "t2": (10, 2)}  # (n, c) por tarea
print(np.mean([pass_hat_k(n, c, 3) for n, c in resultados.values()]))  # 0.5` },
        { tipo: 'p', html: `Fíjate en el parentesco con la <strong>composición de errores</strong> del M01: allí, una tarea de 20 pasos con 95 % de fiabilidad por paso salía bien solo el 0,95<sup>20</sup> ≈ 36 % de las veces. pass^k aplica la misma matemática a <em>repeticiones</em> de una tarea en lugar de a <em>pasos</em> dentro de ella: lo que es «casi siempre» en una vez se convierte en «a menudo no» cuando se exige muchas veces seguidas.` },
        { tipo: 'pregunta', id: 'm08-c2', pregunta: {
          tipo: 'unica',
          pregunta: 'Vas a desplegar un agente que procesa reclamaciones de clientes directamente, sin revisión humana. ¿Qué métrica refleja mejor el riesgo para el negocio?',
          opciones: [
            'pass^k, porque cada cliente recibe un solo intento y lo que importa es acertar de forma consistente',
            'pass@k con k alto, porque muestra todo lo que el agente es capaz de hacer',
            'pass@1 sola, porque pass^k siempre es igual a pass@1 elevado a k',
            'pass@k con k = 5, porque los clientes pueden volver a escribir hasta 5 veces',
          ],
          correcta: 0,
          explicacion: `Sin nadie que elija el mejor intento, la pregunta es «¿lo hace bien cada vez?»: <strong>pass^k</strong>. pass@k mide capacidad potencial y sobrestima la experiencia del cliente. pass^k <em>no</em> es (pass@1)<sup>k</sup> a nivel de suite (se calcula por tarea). Y que un cliente reintente no es «elegir el mejor»: cada intento fallido ya ha tenido consecuencias.`,
          seccion: 's3',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s4
    {
      id: 's4',
      titulo: 'De dónde viene la varianza',
      bloques: [
        { tipo: 'p', html: `Ejecutas la misma suite dos veces, con el mismo agente, y obtienes 61 % y 67 %. ¿Algo se ha roto? Probablemente no: estás viendo <strong>varianza</strong>. Antes de interpretar ninguna cifra tienes que saber cuánta variación es normal, y de dónde sale.` },
        { tipo: 'tabla', titulo: 'Fuentes de varianza en evaluaciones de agentes', columnas: ['Fuente', 'Ejemplos', 'Cómo mitigarla'], filas: [
          ['<strong>Muestreo del modelo</strong>', 'Temperatura &gt; 0; incluso a temperatura 0, la inferencia puede no ser perfectamente determinista (procesamiento por lotes, aritmética en coma flotante). En agentes, una pequeña diferencia temprana cambia toda la trayectoria.', 'Varios ensayos por tarea; reportar la configuración de muestreo. No confíes en «temperatura 0 = determinista».'],
          ['<strong>Entorno</strong>', 'Webs reales que cambian, APIs externas, relojes, ordenaciones no deterministas, datos aleatorios en el setup.', 'Entornos sellados y versionados; relojes y semillas fijados; simular servicios externos.'],
          ['<strong>Infraestructura</strong>', 'Timeouts, límites de memoria o CPU, límites de tasa de la API, cortes de red, contención al ejecutar en paralelo.', 'Registrar errores de infraestructura aparte, reintentarlos y no contarlos como fallos del agente; recursos holgados y medidos.'],
          ['<strong>Grader</strong>', 'Un juez LLM puede dar notas distintas al mismo transcript; sensibilidad al orden o al formato.', 'Graders de código cuando sea posible; juez con rúbrica concreta, temperatura baja, varias evaluaciones promediadas; medir su acuerdo con humanos (sección 9).'],
          ['<strong>Simulador de usuario</strong>', 'En benchmarks conversacionales (como τ-bench) otro LLM hace de usuario y no responde siempre igual.', 'Instrucciones de usuario muy concretas; más ensayos; revisar transcripts en los que el «usuario» se salió del guion.'],
          ['<strong>Muestreo de tareas</strong>', 'La suite es una muestra de todas las tareas posibles; con otras 50 tareas «parecidas» la cifra sería otra.', 'Más tareas; intervalos de confianza que reflejen esta fuente (sección 5).'],
        ] },
        { tipo: 'p', html: `Las primeras cinco fuentes generan variación <strong>dentro de cada tarea</strong> (el mismo examen da resultados distintos). La última genera variación <strong>entre tareas</strong> (con otro examen, otra nota). Esta distinción es la base de toda la estadística del módulo, porque las dos se reducen de forma distinta: la primera con más ensayos, la segunda solo con más tareas.` },
        { tipo: 'h', texto: '¿Cuánto se mueve la cifra por puro azar?' },
        { tipo: 'p', html: `Supón un agente cuya tasa de éxito «verdadera» es 65 % y una suite de 50 tareas independientes. Si cada tarea es un lanzamiento de moneda trucada, el número de éxitos sigue una distribución binomial y el error estándar de la proporción observada es <code>√(p(1 − p)/n) = √(0,65 · 0,35 / 50) ≈ 0,067</code>. Es decir, aproximadamente el 95 % de las ejecuciones darán una cifra entre 52 % y 78 %: <strong>±13 puntos</strong> sin que el agente cambie nada. Con 200 tareas el margen baja a unos ±6,6 puntos; con 500, a unos ±4,2. Pruébalo en el simulador: ejecuta la «misma» evaluación muchas veces y mira el histograma.` },
        { tipo: 'widget', nombre: 'varianza', p: 0.65, n: 50 },
        { tipo: 'callout', variante: 'error', titulo: 'Anti-patrón: perseguir el ruido', html: `Un equipo ajusta el prompt, ve que la tasa pasa de 61 % a 66 % en 50 tareas y lo da por bueno. Siguiente cambio: baja a 62 %, lo revierte. Tras dos semanas han «optimizado» el prompt contra el ruido de una suite pequeña: los cambios retenidos son en buena parte los que tuvieron suerte. Antes de aceptar un cambio, pregúntate si la diferencia supera lo que el azar produce por sí solo (secciones 5 y 6).` },
        { tipo: 'revelar', pregunta: `Tu agente obtiene exactamente la misma puntuación, 0,64, en tres ejecuciones seguidas de la suite. ¿Es una buena noticia?`, respuesta: `Sospechoso. Con un agente que muestrea, un entorno real y ensayos independientes, lo esperable es que la cifra se mueva un poco. Que no se mueva nada puede significar que algo está en caché (respuestas del modelo, resultados del entorno), que los ensayos no son independientes (se reutiliza el estado), que el grader devuelve siempre lo mismo o que estás leyendo resultados de una ejecución antigua. Antes de celebrar la estabilidad, comprueba que de verdad se ejecutó todo de nuevo.` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s5
    {
      id: 's5',
      titulo: 'Intervalos de confianza',
      bloques: [
        { tipo: 'p', html: `Una tasa de éxito sin incertidumbre es media información. «62 %» con 30 tareas y «62 %» con 1000 tareas son afirmaciones muy distintas. Evan Miller, en «Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations» (Anthropic, 2024), lo planteó de forma directa: trata la suite como una <strong>muestra</strong> de un universo de tareas posibles y reporta cuánto podría variar la cifra si hubieras tomado otra muestra. Sus recomendaciones, que seguiremos en esta sección y la siguiente, son:` },
        { tipo: 'lista', ordenada: true, items: [
          'Calcular el <strong>error estándar de la media</strong> (SEM) y reportarlo, o un intervalo de confianza, junto a cada cifra.',
          'Usar <strong>errores estándar agrupados</strong> (<em>clustered</em>) cuando las preguntas no son independientes (varias preguntas sobre el mismo texto, varios ensayos por tarea).',
          '<strong>Reducir la varianza dentro de cada pregunta</strong> remuestreando respuestas (varios ensayos por tarea) o, cuando sea posible, usando probabilidades en lugar de aciertos sueltos.',
          'Al comparar dos modelos sobre las mismas preguntas, <strong>analizar las diferencias pareadas</strong>.',
          'Hacer un <strong>análisis de potencia</strong> para saber si la evaluación puede detectar la diferencia que te interesa.',
        ] },
        { tipo: 'h', texto: 'Error estándar e intervalo normal (Wald)' },
        { tipo: 'p', html: `Para una proporción <em>p̂</em> sobre <em>n</em> tareas independientes, el error estándar es <code>SE = √(p̂(1 − p̂)/n)</code> y el intervalo del 95 % «de libro» (de Wald) es <code>p̂ ± 1,96 · SE</code>. Ejemplo: 45 éxitos en 50 tareas: p̂ = 0,90, SE ≈ 0,042, intervalo ≈ [0,817, 0,983]. Funciona razonablemente con <em>n</em> grande y <em>p̂</em> lejos de 0 y 1. Pero falla justo donde las evaluaciones de agentes suelen estar:` },
        { tipo: 'lista', items: [
          `<strong>Con 50/50 éxitos</strong>, p̂ = 1 y SE = 0: el intervalo es [1, 1]. ¿De verdad estás seguro al 95 % de que el agente nunca falla tras 50 intentos? Obviamente no.`,
          `<strong>Con 1/20</strong>, el intervalo es [−0,046, 0,146]: incluye probabilidades negativas.`,
          `<strong>Con n pequeño</strong>, la cobertura real del intervalo de Wald queda por debajo del 95 % nominal: dice estar más seguro de lo que está.`,
        ] },
        { tipo: 'h', texto: 'El intervalo de Wilson' },
        { tipo: 'p', html: `El intervalo de Wilson (1927) resuelve estos problemas: nunca se sale de [0, 1], no colapsa en los extremos y tiene una cobertura mucho más cercana a la nominal con muestras pequeñas. Con <em>z</em> = 1,96 para el 95 %:` },
        { tipo: 'callout', variante: 'clave', titulo: 'Intervalo de Wilson', html: `centro = <code>(p̂ + z²/(2n)) / (1 + z²/n)</code><br>semiancho = <code>(z / (1 + z²/n)) · √( p̂(1 − p̂)/n + z²/(4n²) )</code><br>intervalo = centro ± semiancho<br><br>El centro se desplaza ligeramente hacia 0,5 respecto a p̂: con pocas observaciones, el intervalo es prudente con los extremos.` },
        { tipo: 'tabla', titulo: 'Wald frente a Wilson (95 %)', columnas: ['Éxitos / n', 'p̂', 'Wald', 'Wilson'], filas: [
          ['45 / 50', '0,90', '[0,817, 0,983]', '[0,786, 0,957]'],
          ['50 / 50', '1,00', '[1,000, 1,000]', '[0,929, 1,000]'],
          ['10 / 10', '1,00', '[1,000, 1,000]', '[0,722, 1,000]'],
          ['1 / 20', '0,05', '[−0,046, 0,146]', '[0,009, 0,236]'],
          ['140 / 200', '0,70', '[0,636, 0,764]', '[0,633, 0,759]'],
        ] },
        { tipo: 'p', html: `Fíjate en la última fila: con 200 tareas y p̂ = 0,70 los dos intervalos casi coinciden. La diferencia importa con pocas tareas y cerca de los extremos, es decir, en suites de regresión (casi todo pasa) y en suites de capacidades difíciles (casi todo falla). Un atajo útil para el caso extremo, la <strong>regla del tres</strong>: si observas 0 fallos en <em>n</em> ensayos, el límite superior (95 %, unilateral) de la tasa de fallo es aproximadamente <em>3/n</em>. Cero fallos en 50 tareas es compatible con una tasa de fallo de hasta ≈ 6 %.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'Wald y Wilson', codigo: `from math import sqrt

def wald(exitos: int, n: int, z: float = 1.96):
    p = exitos / n
    se = sqrt(p * (1 - p) / n)
    return p - z * se, p + z * se

def wilson(exitos: int, n: int, z: float = 1.96):
    p = exitos / n
    den = 1 + z**2 / n
    centro = (p + z**2 / (2 * n)) / den
    semi = (z / den) * sqrt(p * (1 - p) / n + z**2 / (4 * n**2))
    return centro - semi, centro + semi

print(wald(45, 50), wilson(45, 50))   # (0.817, 0.983) (0.786, 0.957)
print(wald(10, 10), wilson(10, 10))   # (1.0, 1.0)     (0.722, 1.0)` },
        { tipo: 'h', texto: 'Varios ensayos por tarea: errores estándar agrupados' },
        { tipo: 'p', html: `Aquí está el error más común en evaluaciones de agentes. Tienes 50 tareas y 3 ensayos por tarea: 150 resultados. Si calculas <code>√(p̂(1 − p̂)/150)</code> estás suponiendo 150 observaciones <strong>independientes</strong>. No lo son: los tres ensayos de una misma tarea se parecen mucho entre sí (si la tarea es fácil, suelen acertar los tres; si es imposible, fallan los tres). En realidad tienes 50 «grupos» (<em>clusters</em>), y la información se parece más a la de 50 observaciones que a la de 150.` },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Ejemplo trabajado', html: `50 tareas × 3 ensayos: 30 tareas aciertan 3/3, 15 fallan 0/3, 3 aciertan 2/3 y 2 aciertan 1/3. Total: 98 éxitos de 150, p̂ ≈ 0,653.<ul><li>SE ingenuo (150 independientes): √(0,653 · 0,347 / 150) ≈ <strong>0,039</strong>.</li><li>SE agrupado por tarea: ≈ <strong>0,064</strong>.</li></ul>El SE ingenuo es un 40 % más pequeño de lo que debería: un intervalo construido con él dice ±7,6 puntos cuando la incertidumbre real es de unos ±12,5.` },
        { tipo: 'p', html: `Hay dos formas equivalentes en la práctica de hacerlo bien:` },
        { tipo: 'lista', items: [
          `<strong>Agrega primero por tarea.</strong> Calcula la media de cada tarea (<em>s<sub>i</sub> = c<sub>i</sub>/n<sub>i</sub></em>) y trata esas <em>T</em> medias como tus observaciones: <code>SE = desviación_típica(s_i) / √T</code>. Es el enfoque más simple y es el que conviene usar por defecto.`,
          `<strong>Error estándar agrupado (<em>cluster-robust</em>).</strong> Con <em>N</em> resultados en total y media <em>x̄</em>: suma los residuos <em>(x − x̄)</em> dentro de cada tarea, eleva al cuadrado cada suma, suma sobre tareas, toma la raíz y divide entre <em>N</em>. Es la fórmula que propone Miller y generaliza a cualquier agrupación (por ejemplo, varias preguntas sobre el mismo documento o tareas generadas a partir de la misma plantilla).`,
        ] },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'SE ingenuo, por tarea y agrupado', codigo: `from math import sqrt
import numpy as np

# puntuaciones[i, j] = resultado (0/1) del ensayo j en la tarea i
puntuaciones = np.array([[1, 1, 1]] * 30 + [[0, 0, 0]] * 15
                        + [[1, 1, 0]] * 3 + [[1, 0, 0]] * 2)

x = puntuaciones.ravel()
p = x.mean()
se_ingenuo = sqrt(p * (1 - p) / x.size)

medias_tarea = puntuaciones.mean(axis=1)
se_por_tarea = medias_tarea.std(ddof=1) / sqrt(len(medias_tarea))

residuos_por_tarea = (puntuaciones - p).sum(axis=1)
se_agrupado = sqrt((residuos_por_tarea ** 2).sum()) / x.size

print(f"p = {p:.3f}")                    # 0.653
print(f"SE ingenuo   = {se_ingenuo:.3f}")  # 0.039
print(f"SE por tarea = {se_por_tarea:.3f}")# 0.065
print(f"SE agrupado  = {se_agrupado:.3f}") # 0.064` },
        { tipo: 'h', texto: 'Cuántos ensayos por tarea: rendimientos decrecientes' },
        { tipo: 'p', html: `Si cada tarea tiene una probabilidad de éxito <em>p<sub>i</sub></em> y haces <em>K</em> ensayos por tarea, la varianza de la media de la suite se descompone aproximadamente en <code>SE² ≈ (σ²_entre + σ²_dentro / K) / T</code>, donde <em>σ²<sub>entre</sub></em> es la varianza de las <em>p<sub>i</sub></em> entre tareas y <em>σ²<sub>dentro</sub></em> es la media de <em>p<sub>i</sub>(1 − p<sub>i</sub>)</em>. Lee la fórmula despacio: más ensayos (<em>K</em>) solo reducen el segundo término; el primero solo baja con más tareas (<em>T</em>). Pasar de 1 a 3-5 ensayos suele ayudar mucho; pasar de 10 a 50 casi nada, porque el término entre tareas domina. Además, los ensayos repetidos te dan pass^k y pass@k, y te dicen qué tareas son inestables.` },
        { tipo: 'h', texto: 'Bootstrap: cuando la fórmula no es obvia' },
        { tipo: 'p', html: `Para métricas complicadas (una mediana de latencia, una media ponderada por categorías, pass^k de la suite, el cociente coste/éxito) no siempre hay una fórmula de SE a mano. El <strong>bootstrap</strong> la sustituye por cómputo: remuestrea tus tareas con reemplazo muchas veces, recalcula la métrica en cada remuestra y toma los percentiles 2,5 y 97,5 de la distribución resultante. La regla de oro: <strong>remuestrea la unidad independiente</strong>, es decir, tareas completas (con todos sus ensayos), no ensayos sueltos. Si remuestreas ensayos, reproduces el error del SE ingenuo.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'Bootstrap por tareas (percentiles)', codigo: `import numpy as np

rng = np.random.default_rng(0)

def bootstrap_ic(puntuaciones, metrica=np.mean, B=10_000, alfa=0.05):
    """puntuaciones: matriz tareas x ensayos. Remuestrea TAREAS con reemplazo."""
    medias_tarea = puntuaciones.mean(axis=1)
    T = len(medias_tarea)
    idx = rng.integers(0, T, size=(B, T))
    estadisticos = np.array([metrica(medias_tarea[fila]) for fila in idx])
    return np.quantile(estadisticos, [alfa / 2, 1 - alfa / 2])

# con la matriz del ejemplo anterior: aprox. [0.53, 0.77]
# (compárese con 0.653 ± 1.96 · 0.065)` },
        { tipo: 'widget', nombre: 'intervalo', exitosA: 140, nA: 200, exitosB: 126, nB: 200 },
        { tipo: 'pregunta', id: 'm08-c3', pregunta: {
          tipo: 'unica',
          pregunta: 'Evalúas un agente en 40 tareas con 5 ensayos cada una y calculas el intervalo con <code>√(p̂(1 − p̂)/200)</code>. ¿Qué problema tiene?',
          opciones: [
            'Es demasiado estrecho: los 5 ensayos de una tarea están correlacionados y no equivalen a 5 observaciones independientes',
            'Es demasiado ancho: con 200 resultados, el error estándar debería dividirse además entre 5',
            'Ninguno, siempre que las tareas sean de la misma dificultad',
            'Es correcto solo si la temperatura del modelo es 0',
          ],
          correcta: 0,
          explicacion: `Los ensayos de una misma tarea forman un grupo: comparten la dificultad de la tarea. Tratarlos como independientes <strong>subestima</strong> el error estándar. Agrega por tarea (40 observaciones) o usa errores estándar agrupados. Dividir de nuevo entre 5 lo empeoraría. Que todas las tareas sean igual de difíciles reduce el problema pero no es verificable ni habitual, y la temperatura no elimina la correlación dentro de la tarea.`,
          seccion: 's5',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s6
    {
      id: 's6',
      titulo: 'Comparar dos agentes',
      bloques: [
        { tipo: 'p', html: `La pregunta más frecuente en la práctica no es «¿cuánto vale mi agente?» sino «¿es la versión B mejor que la A?». La forma de responderla bien es <strong>parear</strong>: ejecutar los dos agentes sobre <strong>las mismas tareas</strong> y analizar las diferencias tarea a tarea.` },
        { tipo: 'h', texto: 'Por qué el diseño pareado es tan potente' },
        { tipo: 'p', html: `<strong>Intuición:</strong> si comparas a dos estudiantes con exámenes distintos, la diferencia de notas mezcla su talento con la dificultad de cada examen. Con el mismo examen, la dificultad se cancela. <strong>Formalmente:</strong> la varianza de una diferencia es <code>Var(A − B) = Var(A) + Var(B) − 2·Cov(A, B)</code>. En las mismas tareas, A y B están <strong>positivamente correlacionados</strong> (las tareas fáciles son fáciles para ambos), así que la covarianza resta varianza. Cuanto más se parezcan los agentes, más se gana. En la práctica, se calcula la diferencia por tarea <em>d<sub>i</sub> = s<sub>A,i</sub> − s<sub>B,i</sub></em> y su error estándar <code>SE = desviación_típica(d_i) / √T</code>.` },
        { tipo: 'h', texto: 'El test de McNemar para resultados binarios pareados' },
        { tipo: 'p', html: `Cuando cada tarea da un resultado binario por agente, organiza los datos en una tabla 2×2. Las tareas en las que <strong>ambos aciertan o ambos fallan</strong> no dicen nada sobre cuál es mejor. Toda la información está en las <strong>discordantes</strong>: <em>b</em> = tareas que A resuelve y B no; <em>c</em> = tareas que B resuelve y A no. Si los dos fueran igual de buenos, cada discordancia sería «cara o cruz»: <em>b</em> seguiría una binomial(<em>b + c</em>, 0,5). El test de McNemar contrasta exactamente eso:` },
        { tipo: 'lista', items: [
          `<strong>Versión exacta</strong> (recomendable si <em>b + c</em> es pequeño, por ejemplo menor de 25): test binomial de <em>min(b, c)</em> en <em>b + c</em> ensayos con <em>p</em> = 0,5, bilateral.`,
          `<strong>Versión asintótica:</strong> <code>χ² = (b − c)² / (b + c)</code>, con 1 grado de libertad; con corrección de continuidad, <code>(|b − c| − 1)² / (b + c)</code>.`,
        ] },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Ejemplo trabajado: 200 tareas', html: `A resuelve 140 (70 %), B resuelve 126 (63 %). Tabla pareada: ambos aciertan 116, solo A 24, solo B 10, ambos fallan 50.<ul><li><strong>Intervalos individuales (Wilson):</strong> A [0,633, 0,759], B [0,561, 0,694]. Se solapan.</li><li><strong>Test no pareado</strong> de diferencia de proporciones: z ≈ 1,48, p ≈ 0,14. «No significativo».</li><li><strong>McNemar:</strong> χ² = (24 − 10)²/34 = 196/34 ≈ 5,76, p ≈ 0,016; exacto (10 o menos de 34 con p = 0,5, bilateral): p ≈ 0,024. <strong>Significativo.</strong></li><li><strong>Diferencia pareada:</strong> 0,07 con SE ≈ 0,029 → IC 95 % ≈ [0,014, 0,126], frente a SE ≈ 0,047 sin parear.</li></ul>Los mismos datos, analizados como pareados, permiten una conclusión que el análisis no pareado no permite.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'McNemar exacto y asintótico', codigo: `from math import comb

def mcnemar(b: int, c: int):
    """b = tareas que A resuelve y B no; c = tareas que B resuelve y A no."""
    n = b + c
    k = min(b, c)
    # Exacto: bajo H0, b ~ Binomial(n, 0.5). p bilateral = 2 * P(X <= k), máx. 1
    p_exacto = min(1.0, 2 * sum(comb(n, i) for i in range(k + 1)) / 2**n)
    chi2 = (b - c) ** 2 / n                  # asintótico, sin corrección
    chi2_cc = (abs(b - c) - 1) ** 2 / n      # con corrección de continuidad
    return chi2, chi2_cc, p_exacto

print(mcnemar(24, 10))   # (5.76, 4.97, 0.0243)

# Con SciPy:
from scipy.stats import binomtest, chi2
print(binomtest(10, 34, 0.5).pvalue)   # 0.0243 (exacto)
print(chi2.sf(196 / 34, df=1))         # 0.0164 (asintótico)` },
        { tipo: 'callout', variante: 'clave', titulo: 'No decidas por solapamiento de intervalos', html: `Que los intervalos de A y B se solapen <strong>no</strong> implica que la diferencia no sea significativa (el ejemplo anterior lo demuestra), por dos razones: (1) incluso sin parear, el error estándar de una diferencia es <code>√(SE_A² + SE_B²)</code>, menor que <code>SE_A + SE_B</code>, de modo que dos intervalos pueden solaparse algo y la diferencia ser significativa; (2) los intervalos individuales ignoran la correlación entre A y B en las mismas tareas, que el análisis pareado aprovecha. Lo contrario sí es fiable: si los intervalos individuales del 95 % no se solapan en absoluto, la diferencia es significativa. Para decidir, calcula el intervalo de la <strong>diferencia</strong>, idealmente pareada.` },
        { tipo: 'h', texto: 'Tamaño del efecto: significativo no es lo mismo que importante' },
        { tipo: 'p', html: `Un p-valor pequeño dice que la diferencia probablemente no es ruido, no que importe. Con 10 000 tareas, una mejora de 0,5 puntos puede ser significativa e irrelevante. Reporta siempre el <strong>tamaño del efecto</strong> con su intervalo: la diferencia absoluta en puntos («+7 puntos, IC 95 % [+1,4, +12,6]») y, si ayuda, la reducción relativa de errores (pasar de 80 % a 90 % de éxito es <em>reducir los errores a la mitad</em>, algo más impactante de lo que sugieren «10 puntos»). Y decide de antemano qué diferencia mínima te importaría (lo usaremos en la sección 7).` },
        { tipo: 'h', texto: 'Comparaciones múltiples' },
        { tipo: 'p', html: `Si comparas A y B en 20 segmentos con α = 0,05 y en realidad no hay ninguna diferencia, la probabilidad de encontrar <em>al menos un</em> segmento «significativo» es <code>1 − 0,95^20 ≈ 0,64</code> (suponiendo independencia). Lo mismo pasa si pruebas 20 variantes de prompt y te quedas con la mejor. Remedios: decidir antes qué comparaciones son las principales; corregir el umbral (Bonferroni: α/m, es decir 0,0025 para 20 comparaciones; o métodos menos conservadores como Holm o Benjamini-Hochberg); y tratar los hallazgos en segmentos como <strong>hipótesis</strong> que se confirman en una evaluación nueva, no como conclusiones.` },
        { tipo: 'ejercicio', id: 'm08-ej-decision', titulo: '¿Cambiamos al agente B?', enunciado: `Tu equipo evalúa un agente candidato B frente al actual A en la misma suite de 150 tareas de soporte, con 3 ensayos por tarea. Resultados:<ul><li>pass@1 (media de ensayos): A = 0,62; B = 0,66.</li><li>pass^3 (fracción de tareas con 3/3): A = 0,48; B = 0,45.</li><li>Comparación pareada por tarea (resultado mayoritario de los 3 ensayos): solo A resuelve 15 tareas; solo B resuelve 21.</li><li>Coste medio por ensayo: A = 0,18 $; B = 0,41 $. Latencia mediana: A = 40 s; B = 85 s.</li><li>Segmento «reembolsos con varios pasos» (30 tareas): A = 0,40, B = 0,58. Segmento «consultas simples» (60 tareas): A = 0,85, B = 0,80. Se miraron 8 segmentos en total.</li></ul>La responsable de producto propone cambiar a B «porque es 4 puntos mejor y mucho mejor en reembolsos». Escribe tu análisis y tu recomendación.`, pistas: [
          'Aplica McNemar a las discordantes 15 frente a 21.',
          'Calcula el coste por tarea resuelta de cada agente.',
          '¿Qué dice pass^3 sobre la consistencia? ¿Importa en soporte?',
          'El segmento de reembolsos: ¿cuántos segmentos se miraron?, ¿cuántas tareas tiene?',
        ], solucion: `<ul><li><strong>¿Es B mejor?</strong> No hay evidencia suficiente. McNemar exacto con 15 frente a 21 discordantes da p ≈ 0,41. La diferencia pareada es +0,04 con un IC 95 % aproximado de [−0,04, +0,12]: compatible con que B sea algo peor, igual o bastante mejor.</li><li><strong>Consistencia:</strong> B tiene pass@1 algo mayor pero pass^3 algo menor: no es más fiable. En soporte, donde cada cliente tiene un intento, eso pesa.</li><li><strong>Coste:</strong> coste por tarea resuelta ≈ 0,18/0,62 ≈ 0,29 $ (A) frente a 0,41/0,66 ≈ 0,62 $ (B): más del doble, y el doble de latencia.</li><li><strong>Segmentos:</strong> +18 puntos en 30 tareas, elegido después de mirar 8 segmentos: es exactamente el tipo de hallazgo que aparece por azar. Es una <em>hipótesis</em> prometedora, no una conclusión.</li><li><strong>Recomendación:</strong> no cambiar todavía. Siguiente paso: una evaluación confirmatoria centrada en reembolsos con varios pasos (más tareas nuevas de ese tipo, análisis de potencia previo, más ensayos), y si se confirma, considerar usar B solo para ese tipo de tareas mediante un router, lo que limita el coste extra.</li></ul>` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s7
    {
      id: 's7',
      titulo: 'Tamaño de muestra y potencia',
      bloques: [
        { tipo: 'p', html: `Antes de ejecutar una evaluación, pregúntate: <strong>si hubiera una diferencia de X puntos, ¿mi evaluación la detectaría?</strong> La <em>potencia</em> estadística es la probabilidad de detectar una diferencia real de un tamaño dado. Por convención se busca potencia del 80 % con α = 0,05 (bilateral). Una evaluación con poca potencia no es «conservadora»: es incapaz de responder la pregunta, y sus «no hay diferencia» no significan nada.` },
        { tipo: 'p', html: `Para dos tasas de éxito <em>p<sub>1</sub></em> y <em>p<sub>2</sub></em> medidas en grupos <strong>independientes</strong> de tareas, el número de tareas por grupo es aproximadamente:` },
        { tipo: 'callout', variante: 'clave', titulo: 'Tamaño de muestra para dos proporciones', html: `<code>n ≈ [ z_(1−α/2) · √(2·p̄·(1 − p̄)) + z_(1−β) · √(p₁(1 − p₁) + p₂(1 − p₂)) ]² / (p₁ − p₂)²</code><br><br>con <em>p̄</em> = (p₁ + p₂)/2, <em>z</em><sub>0,975</sub> = 1,96 y <em>z</em><sub>0,80</sub> ≈ 0,84. Lo esencial: <em>n</em> crece con el <strong>cuadrado</strong> del inverso de la diferencia. Detectar la mitad de diferencia cuesta unas cuatro veces más tareas.` },
        { tipo: 'tabla', titulo: 'Tareas por agente (no pareado, α = 0,05, potencia 80 %)', columnas: ['De', 'A', 'Diferencia', 'Tareas por grupo (aprox.)'], filas: [
          ['40 %', '70 %', '30 puntos', '42'],
          ['20 %', '50 %', '30 puntos', '39'],
          ['60 %', '70 %', '10 puntos', '356'],
          ['50 %', '60 %', '10 puntos', '388'],
          ['85 %', '90 %', '5 puntos', '686'],
          ['60 %', '65 %', '5 puntos', '1471'],
        ] },
        { tipo: 'widget', nombre: 'tamano_muestra', p1: 0.6, p2: 0.7 },
        { tipo: 'h', texto: 'El diseño pareado reduce mucho la cifra' },
        { tipo: 'p', html: `Si los dos agentes se evalúan en las mismas tareas, lo que importa es la proporción de tareas <strong>discordantes</strong> <em>ψ</em> (las que uno resuelve y el otro no) y la diferencia <em>δ</em>. Para McNemar: <code>n ≈ (z_(1−α/2)·√ψ + z_(1−β)·√(ψ − δ²))² / δ²</code>. Con δ = 5 puntos y un 15 % de tareas discordantes salen ≈ <strong>469 tareas</strong> en total (cada una ejecutada por ambos), frente a ≈ 1471 por grupo sin parear. Con δ = 10 puntos y un 20 % de discordantes, ≈ 155. Cuanto más parecidos son los agentes (pocas discordancias), más rinde el pareo. Conocer <em>ψ</em> de antemano es difícil: estímalo con una evaluación piloto.` },
        { tipo: 'codigo', lenguaje: 'python', titulo: 'Análisis de potencia: no pareado y pareado', codigo: `from math import sqrt, ceil
from statistics import NormalDist

def n_por_grupo(p1, p2, alfa=0.05, potencia=0.80):
    """Tareas por agente para detectar p1 frente a p2 (muestras independientes)."""
    z_a = NormalDist().inv_cdf(1 - alfa / 2)
    z_b = NormalDist().inv_cdf(potencia)
    p_med = (p1 + p2) / 2
    num = z_a * sqrt(2 * p_med * (1 - p_med)) + z_b * sqrt(p1 * (1 - p1) + p2 * (1 - p2))
    return ceil(num**2 / (p1 - p2) ** 2)

def n_pareado(psi, delta, alfa=0.05, potencia=0.80):
    """Tareas (ejecutadas por ambos agentes) para McNemar.
    psi = proporción de tareas discordantes; delta = diferencia esperada."""
    z_a = NormalDist().inv_cdf(1 - alfa / 2)
    z_b = NormalDist().inv_cdf(potencia)
    return ceil((z_a * sqrt(psi) + z_b * sqrt(psi - delta**2)) ** 2 / delta**2)

print(n_por_grupo(0.60, 0.70))  # 356
print(n_por_grupo(0.60, 0.65))  # 1471
print(n_pareado(0.15, 0.05))    # 469
print(n_pareado(0.20, 0.10))    # 155` },
        { tipo: 'h', texto: 'Entonces, ¿20-50 tareas no sirven?' },
        { tipo: 'p', html: `Sirven, y mucho, para <strong>empezar</strong>. Al principio del desarrollo de un agente los cambios que importan son grandes: arreglar una herramienta rota, añadir verificación, cambiar de patrón. Pasar de 30 % a 60 % es una diferencia que 40 tareas detectan con holgura (la tabla lo muestra). Además, en esa fase la información más valiosa no es la cifra sino los <strong>transcripts</strong>: 30 tareas bien elegidas y leídas a fondo te enseñan más que 1000 sin leer. Lo que <em>no</em> puedes hacer con 30-50 tareas es distinguir un 62 % de un 66 %. Cuando el agente madura y las mejoras se vuelven finas, la suite tiene que crecer (y usar diseños pareados y más ensayos) o tendrás que aceptar que no puedes ver esas diferencias. El M09 desarrolla esta progresión.` },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: análisis de potencia a posteriori', html: `Ejecutar la evaluación, no encontrar diferencia y entonces calcular «la potencia» con la diferencia observada. Esa cifra es una función del p-valor y no aporta información nueva. El análisis de potencia se hace <strong>antes</strong>, con la diferencia mínima que te importaría detectar, para decidir cuántas tareas y ensayos necesitas.` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s8
    {
      id: 's8',
      titulo: 'Coste y eficiencia',
      bloques: [
        { tipo: 'p', html: `Un agente que acierta un 3 % más pero cuesta cinco veces más y tarda el triple puede ser peor producto. Las técnicas que suben la tasa de éxito (modelos mayores, más pasos de razonamiento, reflexión, muestreo de varios candidatos, multiagente) suelen tener un precio. Por eso una evaluación seria reporta, junto al éxito, <strong>cuánto cuesta conseguirlo</strong>.` },
        { tipo: 'terminos', items: [
          { termino: 'Tokens', html: `De entrada y de salida, por ensayo (y la fracción servida desde caché si aplica). En agentes, los tokens de entrada crecen con cada turno porque el contexto se acumula.` },
          { termino: 'Coste por tarea', html: `Tokens × precios, más el coste de las herramientas (búsquedas, APIs, cómputo del entorno). Reporta media y percentiles: unas pocas tareas que entran en bucle pueden dominar la media.` },
          { termino: 'Coste por tarea resuelta', html: `<code>coste medio por intento / tasa de éxito</code>. Si cuesta 0,30 $ por intento y acierta el 60 %, cada éxito cuesta 0,50 $. Es la métrica que mejor compara agentes con distinta fiabilidad.` },
          { termino: 'Latencia', html: `Tiempo de reloj de principio a fin; mediana y percentil 90-95. Importa mucho en agentes interactivos.` },
          { termino: 'Pasos o turnos', html: `Número de llamadas al modelo y a herramientas. Indica eficiencia del proceso y riesgo de bucles; un agente que acierta en 40 pasos lo que otro hace en 8 también es más frágil.` },
        ] },
        { tipo: 'h', texto: 'La frontera de Pareto' },
        { tipo: 'p', html: `Cuando comparas varias configuraciones (modelo, patrón, número de intentos...), dibújalas en un plano con el <strong>coste</strong> en el eje horizontal y el <strong>éxito</strong> en el vertical. Una configuración está <em>dominada</em> si otra consigue igual o más éxito con igual o menos coste. Las no dominadas forman la <strong>frontera de Pareto</strong>: ninguna es «la mejor» en abstracto; la elección depende de tu presupuesto. Todo lo que queda por debajo de la frontera debería descartarse. Los puntos del widget son <strong>hipotéticos</strong>, con fines ilustrativos: activa y desactiva configuraciones y mira cómo cambia la frontera.` },
        { tipo: 'widget', nombre: 'pareto', puntos: [
          { nombre: 'Modelo pequeño, un intento', coste: 0.04, exito: 0.38 },
          { nombre: 'Modelo pequeño + ReAct', coste: 0.09, exito: 0.52 },
          { nombre: 'Modelo pequeño, 5 intentos + verificador', coste: 0.45, exito: 0.63 },
          { nombre: 'Modelo grande + ReAct', coste: 0.35, exito: 0.68 },
          { nombre: 'Modelo grande + reflexión', coste: 0.80, exito: 0.71 },
          { nombre: 'Modelo grande, multiagente', coste: 1.60, exito: 0.70 },
        ] },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Leyendo el gráfico (datos hipotéticos)', html: `«Modelo pequeño, 5 intentos + verificador» (0,45 $, 63 %) está dominado por «Modelo grande + ReAct» (0,35 $, 68 %): cuesta más y acierta menos. «Multiagente» (1,60 $, 70 %) está dominado por «reflexión» (0,80 $, 71 %). Coste por tarea resuelta en la frontera: 0,04/0,38 ≈ 0,11 $; 0,09/0,52 ≈ 0,17 $; 0,35/0,68 ≈ 0,51 $; 0,80/0,71 ≈ 1,13 $. Los últimos 3 puntos de éxito cuestan más del doble por tarea resuelta.` },
        { tipo: 'callout', variante: 'clave', titulo: 'Compara a igual presupuesto', html: `Una técnica que gasta más cómputo (más intentos, más pasos, un modelo mayor) debería compararse con alternativas que gasten <strong>lo mismo</strong>. «La reflexión mejora 6 puntos» no dice mucho si con el mismo coste extra, simplemente reintentando con un verificador, se mejoran 8. Y recuerda la sección 2: pass@k de k intentos cuesta del orden de <em>k</em> veces pass@1; ponerlo en la misma tabla sin el coste es una comparación injusta.` },
        { tipo: 'callout', variante: 'aviso', titulo: 'Error típico: medir el coste con la lista de precios de hoy', html: `Los precios por token cambian a menudo. Guarda siempre los <strong>tokens</strong> (de entrada, de salida y de caché) y calcula el coste a partir de ellos con la tabla de precios fechada que uses. Así podrás recalcular comparaciones cuando cambien los precios sin volver a ejecutar nada.` },
      ],
    },

    // ───────────────────────────────────────────────────────────── s9
    {
      id: 's9',
      titulo: 'Métricas de los propios graders',
      bloques: [
        { tipo: 'p', html: `Toda la estadística anterior supone que el grader acierta. Si usas un juez LLM (M06), el grader es otro sistema con errores que hay que medir. La forma estándar: tomar una muestra de transcripts, hacer que personas expertas los etiqueten (aprobado/suspenso) y comparar con lo que dice el juez en una tabla 2×2.` },
        { tipo: 'tabla', titulo: 'Juez LLM frente a etiqueta humana (100 transcripts)', columnas: ['', 'Humano: aprobado', 'Humano: suspenso'], filas: [
          ['<strong>Juez: aprobado</strong>', 'a = 40', 'b = 5'],
          ['<strong>Juez: suspenso</strong>', 'c = 10', 'd = 45'],
        ] },
        { tipo: 'lista', items: [
          `<strong>Acuerdo bruto:</strong> (a + d)/N = 85/100 = 0,85.`,
          `<strong>Tasa de verdaderos positivos (TPR, sensibilidad)</strong> del juez: de los que el humano aprueba, ¿cuántos aprueba el juez? a/(a + c) = 40/50 = 0,80.`,
          `<strong>Tasa de verdaderos negativos (TNR, especificidad):</strong> de los que el humano suspende, ¿cuántos suspende el juez? d/(b + d) = 45/50 = 0,90.`,
          `<strong>Precisión</strong> de los aprobados del juez: a/(a + b) = 40/45 ≈ 0,89.`,
        ] },
        { tipo: 'h', texto: 'Kappa de Cohen: acuerdo más allá del azar' },
        { tipo: 'p', html: `El acuerdo bruto engaña cuando una clase domina: si el 90 % de los transcripts son aprobados, un juez que aprueba todo coincide con el humano el 90 % de las veces sin mirar nada. La <strong>kappa de Cohen</strong> corrige por el acuerdo esperado por azar: <code>κ = (p_o − p_e) / (1 − p_e)</code>, donde <em>p<sub>o</sub></em> es el acuerdo observado y <em>p<sub>e</sub></em> el que se esperaría si juez y humano etiquetaran al azar con sus propias tasas de aprobado. En la tabla: el juez aprueba el 45 %, el humano el 50 %; <em>p<sub>e</sub></em> = 0,45·0,50 + 0,55·0,50 = 0,50; κ = (0,85 − 0,50)/(1 − 0,50) = <strong>0,70</strong>.` },
        { tipo: 'callout', variante: 'ejemplo', titulo: 'Mucho acuerdo, poca kappa', html: `Tabla a = 85, b = 5, c = 5, d = 5. Acuerdo bruto = 0,90. Pero ambos aprueban el 90 %, así que <em>p<sub>e</sub></em> = 0,9·0,9 + 0,1·0,1 = 0,82 y κ = (0,90 − 0,82)/(1 − 0,82) ≈ <strong>0,44</strong>. El juez apenas distingue los suspensos: de 10 que el humano suspende, solo detecta 5. Si lo que buscas son fallos, este juez es medio ciego.` },
        { tipo: 'widget', nombre: 'kappa', a: 40, b: 5, c: 10, d: 45 },
        { tipo: 'p', html: `Las escalas verbales de kappa (por ejemplo, la de Landis y Koch, 1977, que llama «sustancial» a 0,61-0,80) son convenciones, no leyes; lo útil es comparar el acuerdo juez-humano con el acuerdo <strong>entre dos humanos</strong> en las mismas etiquetas, que marca el techo realista. Y mira TPR y TNR por separado: un juez para detectar regresiones de seguridad necesita sobre todo TNR alta (que no se le escapen los fallos).` },
        { tipo: 'callout', variante: 'info', titulo: 'Corregir la tasa medida por un juez imperfecto', html: `Si conoces la TPR y la TNR del juez, la tasa que observa (<em>p<sub>obs</sub></em>) se relaciona con la real (<em>p</em>) así: <em>p<sub>obs</sub> = TPR·p + (1 − TNR)·(1 − p)</em>. Despejando: <code>p = (p_obs + TNR − 1) / (TPR + TNR − 1)</code>. Con el juez de la tabla (TPR 0,80, TNR 0,90), una tasa observada de 0,70 corresponde a una real de (0,70 + 0,90 − 1)/(0,80 + 0,90 − 1) = 0,60/0,70 ≈ <strong>0,857</strong>. Úsalo con prudencia: TPR y TNR también son estimaciones con su incertidumbre, y pueden variar entre tipos de tareas. En el M06 se trata en detalle cómo calibrar jueces.` },
        { tipo: 'pregunta', id: 'm08-c4', pregunta: {
          tipo: 'vf',
          afirmacion: 'Un juez LLM que coincide con los humanos en el 95 % de los transcripts es necesariamente un buen juez.',
          correcta: false,
          explicacion: `Depende de la prevalencia. Si el 95 % de los transcripts son aprobados, un juez que aprueba siempre alcanza un 95 % de acuerdo y una kappa de 0, y no detecta ni un solo fallo (TNR = 0). Mira kappa, TPR y TNR, no solo el acuerdo bruto.`,
          seccion: 's9',
        } },
      ],
    },

    // ───────────────────────────────────────────────────────────── s10
    {
      id: 's10',
      titulo: 'Cómo reportar resultados',
      bloques: [
        { tipo: 'p', html: `Todo lo anterior se resume en una pregunta: <strong>¿podría alguien reproducir tu cifra e interpretarla correctamente sin hablar contigo?</strong> Un informe de evaluación que solo dice «nuestro agente resuelve el 71 %» no lo permite. Usa esta lista de comprobación cada vez que publiques un resultado, aunque sea en un canal interno.` },
        { tipo: 'checklist', id: 'm08-check-reporte', titulo: 'Checklist de reporte de una evaluación', items: [
          '<strong>Número de tareas</strong> y <strong>ensayos por tarea</strong>, y cómo se seleccionaron las tareas.',
          '<strong>Métrica exacta</strong>: pass@1, pass@k (con k y n), pass^k (con k y n); media micro, macro o ponderada.',
          '<strong>Incertidumbre</strong>: error estándar o intervalo del 95 %, indicando el método (Wilson, agrupado por tarea, bootstrap por tareas).',
          'Para comparaciones: <strong>diferencia pareada con su intervalo</strong> y el test usado (p. ej. McNemar); qué comparaciones se decidieron de antemano.',
          '<strong>Versiones</strong>: modelo, harness del agente, harness de evaluación, suite y tareas, imagen del entorno, graders y juez.',
          '<strong>Configuración</strong>: parámetros de muestreo, límites de turnos, tokens y tiempo, herramientas disponibles.',
          '<strong>Coste y eficiencia</strong>: tokens, coste por tarea y por tarea resuelta (con fecha de precios), latencia y pasos.',
          '<strong>Segmentos</strong> relevantes, con su tamaño, y cuántos se miraron.',
          '<strong>Errores de infraestructura</strong>: cuántos ensayos fallaron por causas ajenas al agente y cómo se trataron.',
          '<strong>Fiabilidad del grader</strong>: acuerdo con humanos (kappa, TPR, TNR) si hay juez LLM.',
          '<strong>Fecha</strong> de la ejecución y ejemplos de transcripts (éxitos y fallos) enlazados.',
        ] },
        { tipo: 'codigo', lenguaje: 'text', titulo: 'Ejemplo de línea de resultados bien reportada', codigo: `Agente soporte v2.3 (modelo-x-2026-08, harness 1.4.2) · suite soporte-v5 (150 tareas, 3 ensayos)
pass@1 = 0,66 (IC 95 % 0,59-0,73, agrupado por tarea) · pass^3 = 0,45
vs v2.2 (pareado): +0,04 (IC 95 % -0,04 a +0,12), McNemar exacto p = 0,41
coste/tarea 0,41 $ · coste/tarea resuelta 0,62 $ (precios 2026-10-01) · latencia mediana 85 s
juez de tono: kappa 0,70 frente a humanos (n = 100) · 4 ensayos excluidos por timeout de infraestructura
ejecutado 2026-10-09 · transcripts: enlace interno` },
        { tipo: 'enlaces', items: [
          { titulo: 'Miller (2024): Adding Error Bars to Evals', url: 'https://arxiv.org/abs/2411.00640', html: 'Errores estándar, clustering, análisis pareado y potencia aplicados a evaluaciones de modelos de lenguaje.' },
          { titulo: 'Chen et al. (2021): Evaluating Large Language Models Trained on Code', url: 'https://arxiv.org/abs/2107.03374', html: 'HumanEval y el estimador insesgado de pass@k.' },
          { titulo: 'Yao et al. (2024): τ-bench', url: 'https://arxiv.org/abs/2406.12045', html: 'Benchmark de agentes con herramientas y usuario simulado; introduce pass^k.' },
          { titulo: 'Anthropic: Demystifying evals for AI agents (2026)', url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents', html: 'Visión práctica de pass@k frente a pass^k y del diseño de suites de agentes.' },
        ] },
      ],
    },
  ],

  resumen: [
    'pass@1 es la media por tarea de la tasa de éxito; decide y declara si agregas en micro, macro o ponderado por uso, y usa segmentos para diagnosticar.',
    'pass@k (alguno de k acierta) mide capacidad cuando algo puede elegir el intento bueno; estímalo con 1 − C(n−c,k)/C(n,k), no con 1 − (1 − p̂)^k.',
    'pass^k (los k aciertan) mide fiabilidad para agentes que actúan de cara al cliente; se estima con C(c,k)/C(n,k) por tarea. Coinciden en k = 1 y divergen al crecer k.',
    'La varianza viene del modelo, el entorno, la infraestructura, el grader, el simulador de usuario y la selección de tareas; con 50 tareas, ±13 puntos pueden ser puro azar.',
    'Reporta intervalos: Wilson para proporciones, agrupados por tarea si hay varios ensayos, bootstrap remuestreando tareas para métricas complejas.',
    'Compara agentes en las mismas tareas con análisis pareado (McNemar); el solapamiento de intervalos individuales no decide nada.',
    'Haz el análisis de potencia antes: 20-50 tareas detectan diferencias grandes, pero distinguir 5 puntos exige cientos o miles.',
    'Reporta coste por tarea resuelta, latencia y pasos, compara a igual presupuesto y mide la fiabilidad de tus graders (kappa, TPR, TNR).',
  ],

  quiz: [
    {
      tipo: 'unica',
      pregunta: '¿Qué mide exactamente pass@k?',
      opciones: [
        'La probabilidad de que al menos uno de k intentos independientes de una tarea tenga éxito, promediada sobre tareas',
        'La probabilidad de que los k intentos de una tarea tengan éxito',
        'La tasa de éxito media de los k mejores agentes de una comparación',
        'La fracción de tareas resueltas en como mucho k turnos',
      ],
      correcta: 0,
      explicacion: `pass@k es «alguno de k acierta». «Los k aciertan» es pass^k. Las otras dos opciones confunden k con un ranking de agentes o con un límite de turnos, que son cosas distintas.`,
      seccion: 's2',
    },
    {
      tipo: 'numerica',
      pregunta: 'Una tarea se ejecuta n = 10 veces y acierta c = 8. Con el estimador insesgado, ¿cuánto vale pass^3? (Responde con 3 decimales.)',
      respuesta: 0.467,
      tolerancia: 0.005,
      explicacion: `pass^3 = C(8,3)/C(10,3) = 56/120 ≈ <strong>0,467</strong>. El atajo 0,8<sup>3</sup> = 0,512 lo sobrestimaría.`,
      seccion: 's3',
    },
    {
      tipo: 'numerica',
      pregunta: 'Una tarea se ejecuta n = 5 veces y acierta c = 2. Con el estimador insesgado, ¿cuánto vale pass@2? (Responde con 2 decimales.)',
      respuesta: 0.7,
      tolerancia: 0.005,
      explicacion: `pass@2 = 1 − C(3,2)/C(5,2) = 1 − 3/10 = <strong>0,70</strong>. El atajo 1 − (1 − 0,4)<sup>2</sup> = 0,64 lo subestimaría.`,
      seccion: 's2',
    },
    {
      tipo: 'vf',
      afirmacion: 'Calcular pass@k como 1 − (1 − p̂)^k, con p̂ = c/n, da una estimación insesgada siempre que n sea al menos k.',
      correcta: false,
      explicacion: `Está sesgado a la baja para cualquier n finito: la función 1 − (1 − p)<sup>k</sup> es cóncava y, por la desigualdad de Jensen, aplicar la fórmula a un p̂ ruidoso subestima en promedio. El estimador insesgado es 1 − C(n − c, k)/C(n, k) (Chen et al., 2021).`,
      seccion: 's2',
    },
    {
      tipo: 'unica',
      pregunta: 'Un agente de soporte tiene pass@1 = 0,80 por ensayo en una suite y quieres saber si es apto para operar sin supervisión. ¿Qué observación sería la más preocupante?',
      opciones: [
        'Que pass^5 sea mucho menor que 0,80, porque indica que en muchas tareas falla alguna de cada pocas veces',
        'Que pass@5 sea cercano a 1, porque indica que el agente es inconsistente',
        'Que pass^1 sea igual a pass@1',
        'Que pass@5 sea mayor que pass^5',
      ],
      correcta: 0,
      explicacion: `Para un agente sin supervisión importa la consistencia: un pass^5 muy bajo significa que muchas tareas fallan con frecuencia apreciable. pass@5 cercano a 1 es normal y no dice nada malo por sí solo. pass^1 = pass@1 y pass@k ≥ pass^k son siempre ciertos, no son señales de nada.`,
      seccion: 's3',
    },
    {
      tipo: 'unica',
      pregunta: 'Tu agente acierta 30 de 30 tareas de regresión. ¿Qué afirmación es correcta?',
      opciones: [
        'Un intervalo de Wilson del 95 % no llega a 1 por abajo: la tasa real podría estar en torno al 89 % o más, así que no puedes afirmar que nunca falla',
        'El intervalo de Wald [1, 1] demuestra que la tasa de fallo es cero',
        'Con 30 de 30 no tiene sentido calcular un intervalo, porque no hay varianza',
        'La tasa de fallo es, con un 95 % de confianza, menor que 1/30',
      ],
      correcta: 0,
      explicacion: `Con 30/30, el intervalo de Wilson del 95 % es aproximadamente [0,886, 1]; por la regla del tres, la tasa de fallo podría llegar a ≈ 3/30 = 10 %. El intervalo de Wald colapsa a [1, 1] porque su SE es 0 en los extremos, que es justo su defecto. Decir «menor que 1/30» subestima la incertidumbre: la regla del tres da 3/n, no 1/n.`,
      seccion: 's5',
    },
    {
      tipo: 'multiple',
      pregunta: '¿Cuáles de estas son recomendaciones de Miller (2024), «Adding Error Bars to Evals»? (Marca todas las correctas.)',
      opciones: [
        'Reportar el error estándar de la media o un intervalo de confianza junto a cada resultado',
        'Usar errores estándar agrupados cuando las preguntas vienen en grupos relacionados',
        'Analizar diferencias pareadas cuando dos modelos se evalúan sobre las mismas preguntas',
        'Hacer un análisis de potencia para saber qué diferencias puede detectar la evaluación',
        'Ejecutar una sola respuesta por pregunta para evitar correlaciones entre respuestas',
        'Declarar ganador al modelo con mayor media si sus intervalos no se solapan con los de la competencia en al menos un 50 %',
      ],
      correctas: [0, 1, 2, 3],
      explicacion: `Las cuatro primeras son recomendaciones del artículo. Miller recomienda lo contrario de la quinta: <strong>remuestrear respuestas</strong> (varias por pregunta) para reducir la varianza dentro de cada pregunta, y tratar la correlación con SE agrupados. La sexta es una regla inventada; las comparaciones deben hacerse sobre la diferencia, idealmente pareada.`,
      seccion: 's5',
    },
    {
      tipo: 'vf',
      afirmacion: 'Si los intervalos de confianza del 95 % de dos agentes se solapan, la diferencia entre ellos no es estadísticamente significativa.',
      correcta: false,
      explicacion: `Falso. El SE de la diferencia, √(SE<sub>A</sub>² + SE<sub>B</sub>²), es menor que la suma de los SE, y además los intervalos individuales ignoran la correlación entre agentes evaluados en las mismas tareas. En el ejemplo de la sección 6, los intervalos se solapan pero McNemar da p ≈ 0,02.`,
      seccion: 's6',
    },
    {
      tipo: 'unica',
      pregunta: 'En el test de McNemar para comparar dos agentes en las mismas tareas, ¿qué celdas de la tabla 2×2 contienen la información sobre cuál es mejor?',
      opciones: [
        'Las discordantes: tareas que resuelve uno y no el otro',
        'Las concordantes: tareas que ambos resuelven o ambos fallan',
        'La diagonal de tareas resueltas por ambos, comparada con el total',
        'Todas por igual, como en un test chi-cuadrado de independencia',
      ],
      correcta: 0,
      explicacion: `Las tareas concordantes no distinguen a los agentes. Bajo la hipótesis de igualdad, cada discordancia es igual de probable en un sentido que en otro: b ~ Binomial(b + c, 0,5). El chi-cuadrado de independencia responde otra pregunta (si los resultados de A y B están asociados), no si uno es mejor.`,
      seccion: 's6',
    },
    {
      tipo: 'unica',
      pregunta: 'Estás en las primeras semanas de desarrollo de un agente y tienes 40 tareas. ¿Para qué es adecuada esa suite?',
      opciones: [
        'Para detectar cambios grandes (por ejemplo, de 35 % a 65 %) y, sobre todo, para leer transcripts y descubrir fallos',
        'Para distinguir con fiabilidad una mejora de 3 puntos entre dos prompts',
        'Para nada: por debajo de 1000 tareas una evaluación no tiene valor estadístico',
        'Para publicar una comparación con agentes de otros equipos',
      ],
      correcta: 0,
      explicacion: `Unas 40 tareas por grupo bastan para detectar diferencias de unos 30 puntos con potencia del 80 %, que es el tamaño de los cambios al principio del desarrollo; y su mayor valor está en los transcripts. Distinguir 3 puntos exige miles de tareas (o un diseño pareado grande). Decir que no sirven para nada ignora que los efectos grandes son detectables con pocas tareas.`,
      seccion: 's7',
    },
    {
      tipo: 'emparejar',
      pregunta: 'Empareja cada fuente de varianza con su mitigación principal.',
      pares: [
        ['Muestreo del modelo', 'Varios ensayos por tarea'],
        ['Entorno con servicios externos que cambian', 'Entornos sellados y versionados, con servicios simulados'],
        ['Timeouts y límites de recursos', 'Registrar los errores de infraestructura aparte y reintentarlos'],
        ['Juez LLM inconsistente', 'Rúbrica concreta, varias evaluaciones y medir su acuerdo con humanos'],
        ['Selección de las tareas de la suite', 'Más tareas e intervalos de confianza'],
      ],
      explicacion: `Cada fuente se ataca donde nace: el muestreo con repeticiones; el entorno con aislamiento y versionado; la infraestructura separando sus fallos de los del agente; el juez con rúbricas, promedios y calibración; y la variación entre tareas solo con más tareas (y reportando su incertidumbre).`,
      seccion: 's4',
    },
    {
      tipo: 'numerica',
      pregunta: 'Un agente cuesta 0,30 $ por intento y acierta el 60 % de las tareas. ¿Cuál es su coste por tarea resuelta, en dólares?',
      respuesta: 0.5,
      tolerancia: 0.01,
      unidad: '$',
      explicacion: `Coste por tarea resuelta = coste por intento / tasa de éxito = 0,30/0,60 = <strong>0,50 $</strong>. Es la cifra adecuada para comparar con un agente más caro pero más fiable.`,
      seccion: 's8',
    },
    {
      tipo: 'multiple',
      pregunta: 'Un juez LLM y un humano etiquetan 100 transcripts: a = 85 (ambos aprueban), b = 5 (solo el juez aprueba), c = 5 (solo el humano aprueba), d = 5 (ambos suspenden). ¿Qué afirmaciones son correctas? (Marca todas las correctas.)',
      opciones: [
        'El acuerdo bruto es 0,90',
        'La kappa de Cohen es aproximadamente 0,44, bastante menor que el acuerdo bruto',
        'De los 10 transcripts que el humano suspende, el juez solo detecta 5',
        'Como el acuerdo es del 90 %, el juez es fiable para detectar fallos',
      ],
      correctas: [0, 1, 2],
      explicacion: `Acuerdo = (85 + 5)/100 = 0,90. p<sub>e</sub> = 0,9·0,9 + 0,1·0,1 = 0,82, así que κ = 0,08/0,18 ≈ 0,44. El humano suspende b + d = 10 y el juez coincide en d = 5 (TNR = 0,5). Precisamente por eso el juez <strong>no</strong> es fiable para detectar fallos, pese al 90 % de acuerdo.`,
      seccion: 's9',
    },
    {
      tipo: 'unica',
      pregunta: 'Comparas la técnica «reflexión» (gasta unas 2,5 veces más tokens) con el agente base y mejora 6 puntos. ¿Qué comparación adicional es más importante antes de adoptarla?',
      opciones: [
        'Compararla con alternativas que gasten un presupuesto similar, como varios intentos con un verificador o un modelo mayor',
        'Repetir la comparación con el mismo presupuesto del agente base, desactivando la reflexión a mitad de tarea',
        'Calcular pass@k de la reflexión con k = 10 para ver su máximo potencial',
        'Comprobar que la mejora es mayor que la diferencia entre sus intervalos',
      ],
      correcta: 0,
      explicacion: `Una técnica que gasta más cómputo debe compararse <strong>a igual presupuesto</strong> y situarse en la frontera de Pareto: quizá el mismo gasto extra rinde más de otra forma. Desactivarla a mitad de tarea no responde la pregunta; pass@10 multiplica aún más el coste y mide otra cosa; y «la diferencia entre sus intervalos» no es un criterio estadístico válido.`,
      seccion: 's8',
    },
  ],
});
