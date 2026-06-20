(function () {
  const levels = [
    {
      id: 1,
      title: "Ubicacion",
      description: "Geolocalizacion"
    },
    {
      id: 2,
      title: "Mapa",
      description: "Canvas"
    },
    {
      id: 3,
      title: "Evidencia",
      description: "Camara"
    },
    {
      id: 4,
      title: "Procesamiento",
      description: "20,000 datos"
    },
    {
      id: 5,
      title: "Portal",
      description: "250,000 registros"
    }
  ];

  document.addEventListener("DOMContentLoaded", initApp);
  window.addEventListener("escapeRoom:statechange", renderApp);

  function initApp() {
    renderLevelNav();
    bindGlobalActions();
    renderApp();
  }

  function renderLevelNav() {
    const nav = document.getElementById("level-nav");

    if (!nav) {
      return;
    }

    nav.innerHTML = levels.map((level) => `
      <div class="col-6 col-lg">
        <button class="level-nav-btn btn w-100 text-start" type="button" data-go-level="${level.id}">
          <span class="d-block fw-semibold">Nivel ${level.id}: ${level.title}</span>
          <span class="small">${level.description}</span>
        </button>
      </div>
    `).join("");
  }

  function bindGlobalActions() {
    document.querySelectorAll("[data-go-level]").forEach((button) => {
      button.addEventListener("click", () => {
        const level = Number(button.dataset.goLevel);

        if (!window.EscapeRoomState.isLevelUnlocked(level)) {
          showMessage(`Completa el nivel ${level - 1} para desbloquear este desafio.`, "warning");
          return;
        }

        window.EscapeRoomState.setCurrentLevel(level);
        scrollToLevel(level);
      });
    });

    document.querySelectorAll("[data-complete-level]").forEach((button) => {
      button.addEventListener("click", () => {
        const level = Number(button.dataset.completeLevel);

        // Validación: Solo permitir completar si está desbloqueado
        if (!window.EscapeRoomState.isLevelUnlocked(level)) {
          showMessage(`Debes completar el nivel ${level - 1} primero.`, "warning");
          return;
        }

        // Validación: Solo permitir si el botón está habilitado (tarea completada)
        if (button.disabled) {
          showMessage(`Completa todas las tareas del nivel ${level} antes de continuar.`, "warning");
          return;
        }

        window.EscapeRoomState.completeLevel(level);
        showMessage(`Nivel ${level} completado.`, "success");
        renderApp();
      });
    });

    const resetButton = document.getElementById("reset-progress-btn");

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        const shouldReset = confirm("¿Deseas reiniciar completamente el progreso del escape room?\n\nSe limpiarán TODOS los datos y la página se recargará.");

        if (shouldReset) {
          // Limpiar estado del escape room
          window.EscapeRoomState.reset();

          // Limpiar localStorage completamente
          localStorage.clear();

          // Limpiar sessionStorage
          sessionStorage.clear();

          // Mostrar mensaje
          showMessage("Progreso reiniciado completamente. Recargando página...", "info");

          // Recargar página después de 1 segundo
          setTimeout(() => {
            location.reload();
          }, 1000);
        }
      });
    }
  }

  function renderApp() {
    const state = window.EscapeRoomState.getState();
    updateProgress(state);
    updateNavigation(state);
    updateLevelSections(state);
  }

  function updateProgress(state) {
    const completed = Object.values(state.completedLevels).filter(Boolean).length;
    const percentage = Math.round((completed / window.EscapeRoomState.LEVEL_COUNT) * 100);
    const progressBar = document.getElementById("main-progress-bar");

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
      progressBar.textContent = `${percentage}%`;
      progressBar.setAttribute("aria-valuenow", String(percentage));
    }
  }

  function updateNavigation(state) {
    document.querySelectorAll("[data-go-level]").forEach((button) => {
      const level = Number(button.dataset.goLevel);
      const isUnlocked = window.EscapeRoomState.isLevelUnlocked(level);
      const isCompleted = Boolean(state.completedLevels[level]);
      const isCurrent = state.currentLevel === level;

      button.disabled = !isUnlocked;
      button.classList.toggle("btn-primary", isCurrent && isUnlocked);
      button.classList.toggle("btn-success", isCompleted && !isCurrent);
      button.classList.toggle("btn-outline-secondary", !isCurrent && !isCompleted);
    });
  }

  function updateLevelSections(state) {
    document.querySelectorAll("[data-level]").forEach((section) => {
      const level = Number(section.dataset.level);
      const isUnlocked = window.EscapeRoomState.isLevelUnlocked(level);
      const isCompleted = Boolean(state.completedLevels[level]);
      const badge = section.querySelector(".level-badge");

      // Desopacify si está bloqueado
      section.classList.toggle("opacity-50", !isUnlocked);

      // Deshabilitar TODOS los elementos interactivos si está bloqueado
      section.querySelectorAll("button, input, video, canvas").forEach((element) => {
        // Excepto los botones de navegación (data-go-level) que tienen su propia lógica
        if (!element.matches("[data-go-level]")) {
          // Si está bloqueado, deshabilitar todo
          if (!isUnlocked) {
            element.disabled = true;
          }
          // Si está desbloqueado pero el botón es "complete-level-*", mantener su estado actual
          // (será controlado por nivel.js cuando la tarea se complete)
          // De lo contrario, habilitar
          else if (!element.id.includes("complete-level")) {
            element.disabled = false;
          }
        }
      });

      if (badge) {
        badge.className = "level-badge badge";

        if (isCompleted) {
          badge.classList.add("text-bg-success");
          badge.textContent = "Completado";
        } else if (isUnlocked) {
          badge.classList.add("text-bg-primary");
          badge.textContent = "Disponible";
        } else {
          badge.classList.add("text-bg-secondary");
          badge.textContent = "Bloqueado";
        }
      }
    });
  }

  function scrollToLevel(level) {
    const section = document.getElementById(`level-${level}`);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function showMessage(message, type) {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3 shadow`;
    alert.style.zIndex = "1080";
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
      alert.remove();
    }, 2500);
  }
})();
