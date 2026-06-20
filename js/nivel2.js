(function () {
  document.addEventListener("DOMContentLoaded", initLevelTwo);
  window.addEventListener("escapeRoom:statechange", renderNivel2);

  function initLevelTwo() {
    const drawMapBtn = document.getElementById("draw-map-btn");
    const completeBtn = document.querySelector('button[data-complete-level="2"]');

    if (drawMapBtn) {
      drawMapBtn.addEventListener("click", renderMapAndLocation);
    }

    renderNivel2();
  }

  function renderNivel2() {
    if (!window.EscapeRoomState.isLevelCompleted(1)) {
      return;
    }
    const completeBtn = document.querySelector('button[data-complete-level="2"]');
    if (completeBtn && !completeBtn.disabled) {
      completeBtn.disabled = false;
    }
  }

  function renderMapAndLocation() {
    if (!window.EscapeRoomState || !window.EscapeRoomState.isLevelCompleted(1)) {
      alert("Debes completar el Nivel 1 primero para obtener las coordenadas.");
      return;
    }

    const location = window.EscapeRoomState.getLevelData("location");
    if (!location) {
      alert("No hay datos de ubicación disponibles. Vuelve al Nivel 1.");
      return;
    }

    const canvas = document.getElementById("map-canvas");
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 1. RECTÁNGULO (Fondo del mapa / terreno)
    ctx.fillStyle = "#e8e5dc";
    ctx.fillRect(0, 0, width, height);

    // 2. LÍNEA (Representando una carretera o ruta principal)
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    updateCheckItem("check-level2-map", true);

    // 3. CÍRCULO (Representando una zona de interés o radar)
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 100, 255, 0.1)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 100, 255, 0.5)";
    ctx.stroke();

    // 3. CÍRCULO (Representando una zona de interés o radar)
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 100, 255, 0.1)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 100, 255, 0.5)";
    ctx.stroke();

    // Marcar la posición obtenida en el nivel 1
    const lat = location.latitude;
    const lng = location.longitude;

    const xMarker = (Math.abs(lng) * 1000) % width;
    const yMarker = (Math.abs(lat) * 1000) % height;

    // Dibujar el pin de ubicación
    ctx.beginPath();
    ctx.arc(xMarker, yMarker, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#dc3545";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#8b0000";
    ctx.stroke();

    // Etiqueta con las coordenadas exactas
    ctx.fillStyle = "#212529";
    ctx.font = "bold 14px Arial";
    //fondo blanco al texto para que no se pierda con el mapa
    const textLat = `Lat: ${location.latitude}`;
    const textLng = `Lng: ${location.longitude}`;

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(xPos + 25, yPos - 25, 120, 45);

    ctx.fillStyle = "#000000";
    ctx.fillText(textLat, xPos + 30, yPos - 5);
    ctx.fillText(textLng, xPos + 30, yPos + 15);

    // Marcar en checklist: Ubicación marcada
    //fondo blanco al texto para que no se pierda con el mapa
    const textLat = `Lat: ${location.latitude}`;
    const textLng = `Lng: ${location.longitude}`;

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(xPos + 25, yPos - 25, 120, 45);

    ctx.fillStyle = "#000000";
    ctx.fillText(textLat, xPos + 30, yPos - 5);
    ctx.fillText(textLng, xPos + 30, yPos + 15);

    // Marcar en checklist: Ubicación marcada
    updateCheckItem("check-level2-marker", true);
    isPositionMarked = true;
    isPositionMarked = true;

    updateCheckItem("check-level2-marker", true);

    // Completar nivel en estado global
    window.EscapeRoomState.completeLevel(2, {
      mapDrawn: true,
      markedX: xMarker,
      markedY: yMarker
    });

    enableCompleteButton("complete-level2-btn");

    const drawMapBtn = document.getElementById("draw-map-btn");
    if (drawMapBtn) {
      drawMapBtn.textContent = "Mapa actualizado";
      drawMapBtn.classList.replace("btn-primary", "btn-success");
    }

    const levelThree = document.getElementById("level-3");
    if (levelThree) {
      setTimeout(() => {
        levelThree.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 800);
    }
  }

  function updateCheckItem(checkId, completed) {
    const checkEl = document.getElementById(checkId);
    if (checkEl) {
      checkEl.textContent = completed ? "✓" : "○";
      checkEl.className = completed ? "badge bg-success me-2" : "badge bg-secondary me-2";
    }
  }

  function enableCompleteButton(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.disabled = false;
      btn.classList.add("btn-success");
    }
  }
})();