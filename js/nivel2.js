(function () {
  document.addEventListener("DOMContentLoaded", initLevelTwo);

  function initLevelTwo() {
    const drawMapBtn = document.getElementById("draw-map-btn");
    const completeBtn = document.querySelector('button[data-complete-level="2"]');

    // Deshabilitamos el botón de completar nivel manualmente 
    if (completeBtn) {
      completeBtn.disabled = true;
    }

    if (drawMapBtn) {
      drawMapBtn.addEventListener("click", renderMapAndLocation);
    }
  }

  function renderMapAndLocation() {
    // Validamos que el nivel 1 esté completado antes de dibujar
    if (!window.EscapeRoomState || !window.EscapeRoomState.isLevelCompleted(1)) {
      alert("Debes completar el Nivel 1 primero para obtener las coordenadas.");
      return;
    }

    // Obtenemos la ubicación que se guardó en el nivel 1
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

    // Limpiar canvas por si se redibuja
    ctx.clearRect(0, 0, width, height);

    //---Dibujar un mapa simplificado usando figuras ---

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

    // Marcar en checklist: Mapa dibujado
    updateCheckItem("check-level2-map", true);

    // 3. CÍRCULO (Representando una zona de interés o radar)
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 100, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 100, 255, 0.1)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 100, 255, 0.5)";
    ctx.stroke();

    // ---Marcar la posición obtenida en el nivel 1 ---
    const lat = location.latitude;
    const lng = location.longitude;

    // Mapear cualquier lat/lng dentro del tamaño del canvas, siempre visible sin importar de dónde vengan las coordenadas.
    const xMarker = (Math.abs(lng) * 1000) % width;
    const yMarker = (Math.abs(lat) * 1000) % height;

    // Dibujar el pin de ubicación
    ctx.beginPath();
    ctx.arc(xMarker, yMarker, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#dc3545"; // Rojo para el marcador
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#8b0000";
    ctx.stroke();

    // Etiqueta con las coordenadas exactas
    ctx.fillStyle = "#212529";
    ctx.font = "bold 14px Arial";
    ctx.fillText(`📍 (${lat}, ${lng})`, xMarker + 12, yMarker + 5);

    // Marcar en checklist: Ubicación marcada
    updateCheckItem("check-level2-marker", true);

    // ---Pasar al siguiente nivel ---
    // Completamos el nivel en el estado global
    window.EscapeRoomState.completeLevel(2, {
      mapDrawn: true,
      markedX: xMarker,
      markedY: yMarker
    });

    // Habilitar botón de completar nivel
    enableCompleteButton("complete-level2-btn");

    // Actualizamos la interfaz del botón para dar feedback
    const drawMapBtn = document.getElementById("draw-map-btn");
    if (drawMapBtn) {
      drawMapBtn.textContent = "Mapa actualizado";
      drawMapBtn.classList.replace("btn-primary", "btn-success");
    }

    // Scrollear automáticamente al nivel 3
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