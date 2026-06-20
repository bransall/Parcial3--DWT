# Parcial3--DWT
Escape Room Javascript: “La cámara de los cinco desafíos”

## Tema
Escape Room Javascript: “La cámara de los cinco desafíos”.

## Contexto
La humanidad ha perdido acceso a una base de datos que contiene información crítica para el funcionamiento de una ciudad inteligente. Los estudiantes desarrollan una aplicación web que permite al usuario superar cinco niveles consecutivos para recuperar el acceso al sistema. No se permite avanzar a un nivel superior sin completar correctamente el anterior.

## Restricciones generales
- Permitido: HTML5, CSS3, Bootstrap y Javascript.
- Prohibido: Frameworks, Backend, BD, librerías externas de Canvas y Mapas.

## Integrantes
- Sergio Norberto Ramírez Juárez RJ23001
- Diego Alexander Cruz Cabrera CC23090
- Brayan Fernando Ramírez Salinas RS13036
- Gerson Levi Martinez Avalos MA20093

## Requerimientos por nivel
### NIVEL 1: EL GUARDIÁN DE LA UBICACIÓN (15%)
- Obtener la ubicación actual.
- Mostrar latitud y longitud.
- Validar permisos.
- Manejo de errores: permiso denegado y ubicación no disponible.
- La ubicación debe obtenerse para pasar al siguiente nivel.

### NIVEL 2: EL CARTÓGRAFO PERDIDO (15%)
- Dibujar un mapa simplificado usando Canvas. (5%)
- Marcar la posición obtenida en el nivel 1. (5%)
- Dibujar un círculo, línea y rectángulo. (5%)
- Para pasar al siguiente nivel debe dibujarse el mapa y marcar la posición.

### NIVEL 3: LA EVIDENCIA DEL EXPLORADOR (20%)
- Acceder a la cámara.
- Mostrar video en tiempo real. (5%)
- Capturar fotografía. (5%)
- Guardarla en LocalStorage. (5%)
- Manejo de errores: cámara no encontrada y permiso denegado. (5%)
- Para avanzar al siguiente nivel debe al menos capturarse una foto y mostrarse.

### NIVEL 4: EL NÚCLEO DE PROCESAMIENTO (25%)
- Simular 20,000 datos de 2 sensores virtuales (temperatura, humedad). (5%)
- Enviar los datos a un Worker. (5%)
- El Worker debe calcular promedios, máximos y mínimos. (10%)
- Mientras el Worker trabaja, la interfaz debe seguir funcionando y debe mostrarse una barra de progreso. (5%)
- Para avanzar al siguiente nivel debe mostrar estadísticas completas en un card de Bootstrap.

### NIVEL 5: EL PORTAL CUÁNTICO (25%)
- Generar 250,000 registros simulados con valores negativos aleatorios (temperatura, humedad y presión). (5%)
- Transferir los datos al Worker para su procesamiento. (5%)
- El Worker debe filtrar los valores negativos, luego calcular promedio general, top 10 temperaturas, top 10 medidas de presión y cantidad de registros válidos procesados. Agregar barra de carga mientras trabaja el Worker. (10%)
- Exportar los resultados a un JSON descargable con un botón y mostrar las estadísticas en un card de Bootstrap. (5%)
- Si cumple todas las condiciones y la interfaz no se congela mientras el Worker trabaja, el nivel habrá finalizado con éxito.

## Notas de entrega
- Trabajo grupal en repositorio GitHub.
- Se debe subir la URL del repositorio en Campus en la fecha indicada por el tutor.
- El tutor verificará manualmente que la interfaz continúe siendo interactiva durante la ejecución de los Web Workers y que todos los niveles permanezcan accesibles para revisión.
