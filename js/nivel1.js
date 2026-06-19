(function () {
  let permissionStatus = null;

  document.addEventListener("DOMContentLoaded", initLevelOne);
  window.addEventListener("escapeRoom:statechange", renderSavedLocation);

  function initLevelOne() {
    const getLocationButton = document.getElementById("get-location-btn");
    const continueButton = document.getElementById("go-level2-btn");

    if (getLocationButton) {
      getLocationButton.addEventListener("click", requestLocation);
    }

    if (continueButton) {
      continueButton.addEventListener("click", goToLevelTwo);
    }

    renderSavedLocation();
    validatePermissionStatus();
  }

  async function validatePermissionStatus() {
    if (!navigator.permissions || !navigator.permissions.query) {
      return;
    }

    try {
      permissionStatus = await navigator.permissions.query({ name: "geolocation" });

      if (permissionStatus.state === "denied") {
        showLocationMessage("Permiso de ubicacion denegado. Habilitalo en el navegador para continuar.", "danger");
      } else if (permissionStatus.state === "prompt") {
        showLocationMessage("El navegador pedira permiso para acceder a tu ubicacion.", "info");
      } else if (!window.EscapeRoomState.isLevelCompleted(1)) {
        showLocationMessage("Permiso de ubicacion disponible. Puedes obtener tus coordenadas.", "info");
      }

      permissionStatus.addEventListener("change", handlePermissionChange);
    } catch (error) {
      console.warn("No se pudo validar el permiso de ubicacion.", error);
    }
  }

  function handlePermissionChange() {
    if (!permissionStatus) {
      return;
    }

    if (permissionStatus.state === "denied") {
      showLocationMessage("Permiso de ubicacion denegado. Habilitalo en el navegador para continuar.", "danger");
    } else if (!window.EscapeRoomState.isLevelCompleted(1)) {
      showLocationMessage("Permiso de ubicacion disponible. Puedes obtener tus coordenadas.", "info");
    }
  }

  function requestLocation() {
    const getLocationButton = document.getElementById("get-location-btn");

    if (!navigator.geolocation) {
      showLocationMessage("Tu navegador no soporta geolocalizacion.", "danger");
      return;
    }

    if (!window.isSecureContext) {
      showLocationMessage("La ubicacion necesita un contexto seguro. Usa http://127.0.0.1:8000 o HTTPS.", "warning");
      return;
    }

    if (getLocationButton) {
      getLocationButton.disabled = true;
      getLocationButton.textContent = "Obteniendo ubicacion...";
    }

    showLocationMessage("Solicitando ubicacion actual...", "info");

    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }

  function handleLocationSuccess(position) {
    const location = {
      latitude: Number(position.coords.latitude.toFixed(6)),
      longitude: Number(position.coords.longitude.toFixed(6)),
      accuracy: Number(position.coords.accuracy.toFixed(2)),
      capturedAt: new Date().toISOString()
    };

    setLocationOutputs(location);
    showLocationMessage(`Ubicacion obtenida correctamente. Precision aproximada: ${location.accuracy} metros.`, "success");
    window.EscapeRoomState.completeLevel(1, { location });
    setButtonLoading(false);
    enableContinueButton();
  }

  function handleLocationError(error) {
    const messages = {
      1: "Permiso denegado. Debes permitir la ubicacion para avanzar al nivel 2.",
      2: "Ubicacion no disponible. Revisa GPS, conexion o permisos del dispositivo.",
      3: "La solicitud de ubicacion tardo demasiado. Intentalo de nuevo."
    };

    showLocationMessage(messages[error.code] || "No se pudo obtener la ubicacion.", "danger");
    setButtonLoading(false);
  }

  function renderSavedLocation() {
    const location = window.EscapeRoomState.getLevelData("location");

    if (!location) {
      clearLocationOutputs();
      disableContinueButton();
      return;
    }

    setLocationOutputs(location);
    enableContinueButton();

    if (window.EscapeRoomState.isLevelCompleted(1)) {
      showLocationMessage("Ubicacion guardada. El nivel 2 ya esta desbloqueado.", "success");
    }
  }

  function clearLocationOutputs() {
    const latitudeOutput = document.getElementById("latitude-output");
    const longitudeOutput = document.getElementById("longitude-output");

    if (latitudeOutput) {
      latitudeOutput.value = "";
    }

    if (longitudeOutput) {
      longitudeOutput.value = "";
    }
  }

  function setLocationOutputs(location) {
    const latitudeOutput = document.getElementById("latitude-output");
    const longitudeOutput = document.getElementById("longitude-output");

    if (latitudeOutput) {
      latitudeOutput.value = location.latitude;
    }

    if (longitudeOutput) {
      longitudeOutput.value = location.longitude;
    }
  }

  function showLocationMessage(message, type) {
    const alert = document.getElementById("location-alert");

    if (!alert) {
      return;
    }

    alert.className = `alert alert-${type}`;
    alert.textContent = message;
  }

  function setButtonLoading(isLoading) {
    const getLocationButton = document.getElementById("get-location-btn");

    if (!getLocationButton) {
      return;
    }

    getLocationButton.disabled = isLoading;
    getLocationButton.textContent = isLoading ? "Obteniendo ubicacion..." : "Obtener ubicacion";
  }

  function enableContinueButton() {
    const continueButton = document.getElementById("go-level2-btn");

    if (continueButton) {
      continueButton.disabled = false;
    }
  }

  function disableContinueButton() {
    const continueButton = document.getElementById("go-level2-btn");

    if (continueButton) {
      continueButton.disabled = true;
    }
  }

  function goToLevelTwo() {
    if (!window.EscapeRoomState.isLevelCompleted(1)) {
      showLocationMessage("Primero debes obtener la ubicacion actual.", "warning");
      return;
    }

    window.EscapeRoomState.setCurrentLevel(2);

    const levelTwo = document.getElementById("level-2");

    if (levelTwo) {
      levelTwo.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
})();
