(function () {
  let isMapDrawn = false;
  let isPositionMarked = false;

  document.addEventListener("DOMContentLoaded", initLevelTwo);

  function initLevelTwo() {
    const drawMapBtn = document.getElementById("draw-map-btn");
    const completeBtn = document.querySelector('button[data-complete-level="2"]');

    if (drawMapBtn) {
      drawMapBtn.addEventListener("click", drawMapAndMarkPosition);
    }

    if (completeBtn) {
      completeBtn.addEventListener("click", function (event) {
        if (!isMapDrawn || !isPositionMarked) {
          event.preventDefault();
          event.stopImmediatePropagation(); 
          showLevelTwoMessage("Debes dibujar el mapa y marcar la posición antes de avanzar.", "warning");
        }
      });
    }
  }

  function showLevelTwoMessage(message, type) {
    let alertDiv = document.getElementById("level2-alert");
    
    if (!alertDiv) {
      alertDiv = document.createElement("div");
      alertDiv.id = "level2-alert";
      const canvas = document.getElementById("map-canvas");
      if (canvas && canvas.parentNode) {
        canvas.parentNode.insertBefore(alertDiv, canvas);
      }
    }

    alertDiv.className = `alert alert-${type} mb-3`;
    alertDiv.textContent = message;
  }

  function drawMapAndMarkPosition() {
    if (!window.EscapeRoomState || !window.EscapeRoomState.isLevelCompleted(1)) {
      showLevelTwoMessage("Aún no tienes la ubicación. Completa el Nivel 1 primero.", "danger");
      return;
    }

    const location = window.EscapeRoomState.getLevelData("location");
    if (!location) {
      showLevelTwoMessage("Error: No se encontraron las coordenadas del Nivel 1.", "danger");
      return;
    }

    const canvas = document.getElementById("map-canvas");
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    //---Dibujar un mapa simplificado usando figuras ---
    
    // 1. RECTÁNGULO (Fondo del mapa / terreno)
    ctx.fillStyle = "#e8e5dc"; 
    ctx.fillRect(0, 0, width, height);

    // Líneas superiores
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(300, 0);
    ctx.moveTo(450, 0);
    ctx.lineTo(650, 0);
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#3b4358";
    ctx.stroke();

    // Pared izquierda y abajo formando la esquina
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

    // Línea pequeña a la derecha
    ctx.beginPath();
    ctx.moveTo(800, 150);
    ctx.lineTo(800, 250);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#11151c";
    ctx.stroke();

    // Rectángulo café
    ctx.fillStyle = "#6b3e1b";
    ctx.fillRect(380, 290, 30, 50);

    // Rectángulo gris
    ctx.fillStyle = "#a8a8a8";
    ctx.fillRect(500, 310, 150, 30);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#666666";
    ctx.strokeRect(500, 310, 150, 30);

    isMapDrawn = true; 

    // --- 2. MARCAR LA POSICIÓN CON VÉRTICES Y COORDENADAS ---
    
    const safeX = 420; 
    const safeY = 100; 
    const safeW = 350; 
    const safeH = 180; 

    const xPos = Math.abs((location.longitude * 10000) % safeW) + safeX;
    const yPos = Math.abs((location.latitude * 10000) % safeH) + safeY;

    // Círculo rojo
    ctx.beginPath();
    ctx.arc(xPos, yPos, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#ff0000"; 
    ctx.fill();

    // Vertices indicando el punto central exacto
    ctx.beginPath();
    ctx.moveTo(xPos - 35, yPos);
    ctx.lineTo(xPos + 35, yPos);
    ctx.moveTo(xPos, yPos - 35);
    ctx.lineTo(xPos, yPos + 35);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Textos con las coordenadas de latitud y longitud
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px Arial";
    ctx.fillText(`📍 (${lat}, ${lng})`, xMarker + 12, yMarker + 5);

    // ---Pasar al siguiente nivel ---
    // Completamos el nivel en el estado global
    window.EscapeRoomState.completeLevel(2, { 
      mapDrawn: true, 
      markedX: xMarker, 
      markedY: yMarker 
    });

    // Actualizamos la interfaz del botón para dar feedback
    const drawMapBtn = document.getElementById("draw-map-btn");
    if (drawMapBtn) {
      drawMapBtn.textContent = "Mapa y posición listos";
      drawMapBtn.classList.replace("btn-primary", "btn-success");
    }

    const completeBtn = document.querySelector('button[data-complete-level="2"]');
    if (completeBtn) {
      completeBtn.textContent = "Nivel 2 Superado";
      completeBtn.classList.replace("btn-success", "btn-secondary");
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