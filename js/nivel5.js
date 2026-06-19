(function () {
  const RECORD_COUNT = 250000;
  const GENERATION_CHUNK_SIZE = 10000;
  const WORKER_PROGRESS_START = 20;
  const WORKER_PROGRESS_RANGE = 80;

  let latestResults = null;
  let activeWorker = null;

  document.addEventListener("DOMContentLoaded", initLevelFive);
  window.addEventListener("escapeRoom:statechange", renderSavedResults);

  function initLevelFive() {
    const processButton = document.getElementById("process-level5-btn");
    const downloadButton = document.getElementById("download-json-btn");
    const finishButton = document.getElementById("finish-level5-btn");

    if (processButton) {
      processButton.addEventListener("click", processQuantumPortal);
    }

    if (downloadButton) {
      downloadButton.addEventListener("click", downloadResults);
    }

    if (finishButton) {
      finishButton.addEventListener("click", finishLevelFive);
    }

    renderSavedResults();
  }

  async function processQuantumPortal() {
    if (!window.EscapeRoomState.isLevelUnlocked(5)) {
      renderMessage("Completa el nivel 4 antes de procesar el portal cuantico.", "warning");
      return;
    }

    if (!window.Worker) {
      renderMessage("Tu navegador no soporta Web Workers.", "danger");
      return;
    }

    terminateActiveWorker();
    setProcessingState(true);
    setProgress(0);
    renderMessage("Generando 250,000 registros simulados...", "info");

    try {
      const records = await generateRecords(RECORD_COUNT);
      renderMessage("Datos generados. Enviando registros al Worker...", "info");
      runWorker(records);
    } catch (error) {
      console.error(error);
      renderMessage("No se pudieron generar los registros del nivel 5.", "danger");
      setProcessingState(false);
    }
  }

  async function generateRecords(count) {
    const temperatures = new Float64Array(count);
    const humidities = new Float64Array(count);
    const pressures = new Float64Array(count);
    let negativeValues = 0;

    for (let index = 0; index < count; index += 1) {
      const temperature = randomMeasure(5, 45, -25, 0.08);
      const humidity = randomMeasure(20, 100, -60, 0.07);
      const pressure = randomMeasure(930, 1085, -120, 0.06);

      temperatures[index] = temperature;
      humidities[index] = humidity;
      pressures[index] = pressure;

      if (temperature < 0 || humidity < 0 || pressure < 0) {
        negativeValues += 1;
      }

      if (index > 0 && index % GENERATION_CHUNK_SIZE === 0) {
        setProgress(Math.round((index / count) * WORKER_PROGRESS_START));
        await waitForUi();
      }
    }

    setProgress(WORKER_PROGRESS_START);

    return {
      temperatures,
      humidities,
      pressures,
      generatedCount: count,
      estimatedInvalidRecords: negativeValues
    };
  }

  function randomMeasure(min, max, negativeMin, negativeRate) {
    if (Math.random() < negativeRate) {
      return roundToTwo(negativeMin + Math.random() * Math.abs(negativeMin));
    }

    return roundToTwo(min + Math.random() * (max - min));
  }

  function runWorker(records) {
    activeWorker = new Worker("workers/worker5.js");

    activeWorker.addEventListener("message", (event) => {
      const message = event.data;

      if (message.type === "progress") {
        const progress = WORKER_PROGRESS_START + Math.round((message.percentage / 100) * WORKER_PROGRESS_RANGE);
        setProgress(progress);
      }

      if (message.type === "complete") {
        latestResults = message.results;
        window.EscapeRoomState.setLevelData("level5Stats", latestResults);
        renderResults(latestResults);
        setProgress(100);
        setProcessingState(false);
        enableResultActions();
        terminateActiveWorker();
      }

      if (message.type === "error") {
        renderMessage(message.message || "El Worker no pudo procesar los registros.", "danger");
        setProcessingState(false);
        terminateActiveWorker();
      }
    });

    activeWorker.addEventListener("error", (error) => {
      console.error(error);
      renderMessage("Ocurrio un error al ejecutar el Worker del nivel 5.", "danger");
      setProcessingState(false);
      terminateActiveWorker();
    });

    activeWorker.postMessage({
      type: "process",
      payload: records
    }, [
      records.temperatures.buffer,
      records.humidities.buffer,
      records.pressures.buffer
    ]);
  }

  function renderSavedResults() {
    const savedResults = window.EscapeRoomState.getLevelData("level5Stats");

    if (!savedResults) {
      latestResults = null;
      setProgress(0);
      disableResultActions();
      renderPendingResults();
      return;
    }

    latestResults = savedResults;
    renderResults(savedResults);
    setProgress(100);
    enableResultActions();
  }

  function renderPendingResults() {
    const container = document.getElementById("level5-results");

    if (!container) {
      return;
    }

    container.className = "card border-primary";
    container.innerHTML = '<div class="card-body text-secondary">Resultados pendientes.</div>';
  }

  function renderResults(results) {
    const container = document.getElementById("level5-results");

    if (!container) {
      return;
    }

    container.className = "card border-success";
    container.innerHTML = `
      <div class="card-body">
        <h3 class="h5 text-success">Resultados del portal cuantico</h3>
        <div class="row g-3 mb-3">
          <div class="col-md-3">
            <div class="border rounded p-3 h-100">
              <span class="small text-secondary d-block">Registros generados</span>
              <strong>${formatNumber(results.generatedCount)}</strong>
            </div>
          </div>
          <div class="col-md-3">
            <div class="border rounded p-3 h-100">
              <span class="small text-secondary d-block">Registros validos</span>
              <strong>${formatNumber(results.validRecords)}</strong>
            </div>
          </div>
          <div class="col-md-3">
            <div class="border rounded p-3 h-100">
              <span class="small text-secondary d-block">Registros filtrados</span>
              <strong>${formatNumber(results.invalidRecords)}</strong>
            </div>
          </div>
          <div class="col-md-3">
            <div class="border rounded p-3 h-100">
              <span class="small text-secondary d-block">Promedio general</span>
              <strong>${formatDecimal(results.overallAverage)}</strong>
            </div>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-lg-4">
            <h4 class="h6">Promedios por sensor</h4>
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between">
                <span>Temperatura</span>
                <strong>${formatDecimal(results.averages.temperature)}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Humedad</span>
                <strong>${formatDecimal(results.averages.humidity)}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Presion</span>
                <strong>${formatDecimal(results.averages.pressure)}</strong>
              </li>
            </ul>
          </div>
          <div class="col-lg-4">
            <h4 class="h6">Top 10 temperaturas</h4>
            ${renderTopList(results.topTemperatures, "C")}
          </div>
          <div class="col-lg-4">
            <h4 class="h6">Top 10 presiones</h4>
            ${renderTopList(results.topPressures, "hPa")}
          </div>
        </div>
      </div>
    `;
  }

  function renderTopList(values, unit) {
    return `
      <ol class="list-group list-group-numbered">
        ${values.map((value) => `
          <li class="list-group-item d-flex justify-content-between">
            <span>Medida</span>
            <strong>${formatDecimal(value)} ${unit}</strong>
          </li>
        `).join("")}
      </ol>
    `;
  }

  function renderMessage(message, type) {
    const container = document.getElementById("level5-results");

    if (!container) {
      return;
    }

    container.className = `card border-${type}`;
    container.innerHTML = `
      <div class="card-body text-${type}">
        ${message}
      </div>
    `;
  }

  function downloadResults() {
    if (!latestResults) {
      renderMessage("Primero debes procesar los registros para generar el JSON.", "warning");
      return;
    }

    const fileContent = JSON.stringify({
      exportedAt: new Date().toISOString(),
      level: 5,
      title: "El portal cuantico",
      results: latestResults
    }, null, 2);
    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "nivel-5-resultados.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function finishLevelFive() {
    if (!latestResults) {
      renderMessage("Procesa los registros antes de finalizar el escape room.", "warning");
      return;
    }

    window.EscapeRoomState.completeLevel(5, { level5Stats: latestResults });
    renderMessage("Escape room completado con exito. Resultados listos para revision y descarga.", "success");
    renderResults(latestResults);
  }

  function enableResultActions() {
    const downloadButton = document.getElementById("download-json-btn");
    const finishButton = document.getElementById("finish-level5-btn");

    if (downloadButton) {
      downloadButton.disabled = false;
    }

    if (finishButton) {
      finishButton.disabled = false;
    }
  }

  function disableResultActions() {
    const downloadButton = document.getElementById("download-json-btn");
    const finishButton = document.getElementById("finish-level5-btn");

    if (downloadButton) {
      downloadButton.disabled = true;
    }

    if (finishButton) {
      finishButton.disabled = true;
    }
  }

  function setProcessingState(isProcessing) {
    const processButton = document.getElementById("process-level5-btn");

    if (processButton) {
      processButton.disabled = isProcessing;
      processButton.textContent = isProcessing ? "Procesando..." : "Procesar registros";
    }

    if (isProcessing) {
      disableResultActions();
    }
  }

  function setProgress(value) {
    const progressBar = document.getElementById("level5-progress-bar");
    const percentage = Math.min(Math.max(Number(value) || 0, 0), 100);

    if (!progressBar) {
      return;
    }

    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    progressBar.setAttribute("aria-valuenow", String(percentage));
    progressBar.classList.toggle("progress-bar-animated", percentage > 0 && percentage < 100);
  }

  function terminateActiveWorker() {
    if (activeWorker) {
      activeWorker.terminate();
      activeWorker = null;
    }
  }

  function waitForUi() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("es-SV").format(value || 0);
  }

  function formatDecimal(value) {
    return new Intl.NumberFormat("es-SV", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  function roundToTwo(value) {
    return Math.round(value * 100) / 100;
  }
})();
