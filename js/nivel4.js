(function () {
    let workerActivo = null;

    document.addEventListener('DOMContentLoaded', initLevelFour);
    window.addEventListener('escapeRoom:statechange', renderNivel4);

    function initLevelFour() {
        const processBtn = document.getElementById('process-level4-btn');

        if (processBtn) {
            processBtn.addEventListener('click', procesarSensores);
        }

        renderNivel4();
    }

    function renderNivel4() {
        if (!window.EscapeRoomState.isLevelCompleted(3)) {
            return;
        }

        // Si hay estadísticas guardadas, restaurarlas
        const stats = window.EscapeRoomState.getLevelData('level4Stats');
        if (stats) {
            updateCheckItem('check-level4-datos', true);
            updateCheckItem('check-level4-stats', true);
            mostrarEstadisticas(stats);
            enableCompleteButton('complete-level4-btn');
        }
    }

    function procesarSensores() {
        // Validar que Nivel 3 esté completado
        if (!window.EscapeRoomState.isLevelCompleted(3)) {
            alert('Debes completar el Nivel 3 primero para acceder al procesamiento de sensores.');
            return;
        }

        // Deshabilitar botón durante el proceso
        const processBtn = document.getElementById('process-level4-btn');
        if (processBtn) {
            processBtn.disabled = true;
            processBtn.textContent = 'Procesando...';
        }

        // Resetear barra de progreso
        updateProgressBar(0);

        // Generar 20,000 datos de sensores
        const datos = generarDatos(20000);
        updateCheckItem('check-level4-datos', true);

        // Crear y enviar al Worker
        if (workerActivo) {
            workerActivo.terminate();
        }

        workerActivo = new Worker('workers/worker4.js');

        workerActivo.onmessage = function (event) {
            const { tipo, porcentaje, resultado, mensaje } = event.data;

            if (tipo === 'progreso') {
                updateProgressBar(porcentaje);
            } else if (tipo === 'resultado') {
                mostrarEstadisticas(resultado);
                updateCheckItem('check-level4-stats', true);
                updateProgressBar(100);

                // Guardar en estado
                window.EscapeRoomState.completeLevel(4, { level4Stats: resultado });

                // Habilitar botón de completar nivel
                enableCompleteButton('complete-level4-btn');

                // Habilitar botón de proceso nuevamente
                if (processBtn) {
                    processBtn.disabled = false;
                    processBtn.textContent = 'Procesar sensores nuevamente';
                }

                // Terminar worker
                workerActivo.terminate();
                workerActivo = null;
            } else if (tipo === 'error') {
                alert('Error en Worker: ' + mensaje);
                if (processBtn) {
                    processBtn.disabled = false;
                    processBtn.textContent = 'Procesar sensores';
                }
            }
        };

        workerActivo.onerror = function (error) {
            alert('Error en el Worker: ' + error.message);
            console.error('Worker error:', error);
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Procesar sensores';
            }
        };

        // Enviar datos al worker
        workerActivo.postMessage({ datos: datos });
    }

    function generarDatos(cantidad) {
        const datos = [];

        for (let i = 0; i < cantidad; i++) {
            datos.push({
                temperatura: Math.random() * 40 + 10,
                humedad: Math.random() * 60 + 20
            });
        }

        return datos;
    }

    function mostrarEstadisticas(resultado) {
        const resultsDiv = document.getElementById('level4-results');

        if (!resultsDiv) return;

        const html = `
      <div class="card-header bg-light">
        <h6 class="mb-0">Resultados del procesamiento (${resultado.totalRegistros} registros)</h6>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="card border-warning">
              <div class="card-header bg-warning text-dark">
                <strong>🌡️ Temperatura (°C)</strong>
              </div>
              <div class="card-body">
                <p class="mb-1"><small class="text-muted">Promedio:</small><br><strong>${resultado.temperatura.promedio}°C</strong></p>
                <p class="mb-1"><small class="text-muted">Máximo:</small><br><strong>${resultado.temperatura.maximo}°C</strong></p>
                <p class="mb-0"><small class="text-muted">Mínimo:</small><br><strong>${resultado.temperatura.minimo}°C</strong></p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-info">
              <div class="card-header bg-info text-white">
                <strong>💧 Humedad (%)</strong>
              </div>
              <div class="card-body">
                <p class="mb-1"><small class="text-muted">Promedio:</small><br><strong>${resultado.humedad.promedio}%</strong></p>
                <p class="mb-1"><small class="text-muted">Máximo:</small><br><strong>${resultado.humedad.maximo}%</strong></p>
                <p class="mb-0"><small class="text-muted">Mínimo:</small><br><strong>${resultado.humedad.minimo}%</strong></p>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-3 text-muted small">
          <p class="mb-0">Procesado: ${new Date(resultado.timestamp).toLocaleString()}</p>
        </div>
      </div>
    `;

        resultsDiv.innerHTML = html;
        resultsDiv.className = 'card border-success';
    }

    function updateProgressBar(porcentaje) {
        const progressBar = document.getElementById('level4-progress-bar');
        if (progressBar) {
            progressBar.style.width = porcentaje + '%';
            progressBar.textContent = porcentaje + '%';
            progressBar.setAttribute('aria-valuenow', porcentaje);
        }
    }

    function updateCheckItem(checkId, completed) {
        const checkEl = document.getElementById(checkId);
        if (checkEl) {
            checkEl.textContent = completed ? '✓' : '○';
            checkEl.className = completed ? 'badge bg-success me-2' : 'badge bg-secondary me-2';
        }
    }

    function enableCompleteButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = false;
            btn.classList.add('btn-success');
        }
    }
})();