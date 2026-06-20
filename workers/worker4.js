// ============================================================================
// WORKER 4: Procesamiento de datos de sensores
// ============================================================================
// Recibe 20,000 datos de sensores (temperatura, humedad)
// Calcula: promedio, máximo, mínimo por sensor
// Reporta progreso en chunks de 2,000 registros
// ============================================================================

self.onmessage = function (event) {
    const { datos } = event.data;

    if (!datos || datos.length === 0) {
        self.postMessage({
            tipo: 'error',
            mensaje: 'No hay datos para procesar'
        });
        return;
    }

    try {
        const resultado = procesarDatos(datos);
        self.postMessage({
            tipo: 'resultado',
            resultado: resultado
        });
    } catch (error) {
        self.postMessage({
            tipo: 'error',
            mensaje: error.message
        });
    }
};

function procesarDatos(datos) {
    const chunkSize = 2000;
    const totalChunks = Math.ceil(datos.length / chunkSize);

    let temperatura = {
        valores: [],
        promedio: 0,
        maximo: -Infinity,
        minimo: Infinity
    };

    let humedad = {
        valores: [],
        promedio: 0,
        maximo: -Infinity,
        minimo: Infinity
    };

    // Procesar en chunks y reportar progreso
    for (let i = 0; i < datos.length; i++) {
        const dato = datos[i];

        // Procesar temperatura
        temperatura.valores.push(dato.temperatura);
        temperatura.maximo = Math.max(temperatura.maximo, dato.temperatura);
        temperatura.minimo = Math.min(temperatura.minimo, dato.temperatura);

        // Procesar humedad
        humedad.valores.push(dato.humedad);
        humedad.maximo = Math.max(humedad.maximo, dato.humedad);
        humedad.minimo = Math.min(humedad.minimo, dato.humedad);

        // Reportar progreso cada chunk
        if ((i + 1) % chunkSize === 0 || i === datos.length - 1) {
            const porcentaje = Math.round(((i + 1) / datos.length) * 100);
            self.postMessage({
                tipo: 'progreso',
                porcentaje: porcentaje
            });
        }
    }

    // Calcular promedios
    temperatura.promedio = temperatura.valores.reduce((a, b) => a + b, 0) / temperatura.valores.length;
    humedad.promedio = humedad.valores.reduce((a, b) => a + b, 0) / humedad.valores.length;

    // Redondear a 2 decimales
    temperatura.promedio = Math.round(temperatura.promedio * 100) / 100;
    temperatura.maximo = Math.round(temperatura.maximo * 100) / 100;
    temperatura.minimo = Math.round(temperatura.minimo * 100) / 100;

    humedad.promedio = Math.round(humedad.promedio * 100) / 100;
    humedad.maximo = Math.round(humedad.maximo * 100) / 100;
    humedad.minimo = Math.round(humedad.minimo * 100) / 100;

    return {
        temperatura: {
            promedio: temperatura.promedio,
            maximo: temperatura.maximo,
            minimo: temperatura.minimo
        },
        humedad: {
            promedio: humedad.promedio,
            maximo: humedad.maximo,
            minimo: humedad.minimo
        },
        totalRegistros: datos.length,
        timestamp: new Date().toISOString()
    };
}