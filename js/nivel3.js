// ============================================================================
// NIVEL 3: LA EVIDENCIA DEL EXPLORADOR (20%)
// ============================================================================
// Requisitos: Acceder a cámara, mostrar video en tiempo real, capturar foto,
// guardar en estado, manejo de errores, y verificar Nivel 2 completado.
// ============================================================================

(function () {
  let streamActivo = null;
  let videoElement = null;
  let canvasElement = null;
  let imgElement = null;

  // ========================================================================
  // FUNCIÓN: Iniciar acceso a la cámara
  // ========================================================================
  function iniciarCamara() {
    try {
      videoElement = document.getElementById('camera-video');
      canvasElement = document.getElementById('photo-canvas');
      imgElement = document.getElementById('captured-photo');

      if (!videoElement) {
        showCameraAlert('❌ Elemento <video id="camera-video"> no encontrado en el HTML', 'danger');
        return;
      }

      const navegador = navigator.mediaDevices || navigator.webkitGetUserMedia;
      if (!navegador) {
        showCameraAlert('❌ Tu navegador no soporta acceso a cámara. Usa Chrome, Firefox o Edge.', 'danger');
        return;
      }

      const restricciones = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };

      navigator.mediaDevices
        .getUserMedia(restricciones)
        .then(stream => {
          streamActivo = stream;
          videoElement.srcObject = stream;
          videoElement.play();

          videoElement.onloadedmetadata = function() {
            console.log('✅ Cámara iniciada correctamente');
            showCameraAlert('✅ Cámara activa', 'success');
            document.getElementById('capture-photo-btn').disabled = false;
          };
        })
        .catch(error => manejarErrores(error));

    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      manejarErrores(error);
    }
  }

  // ========================================================================
  // FUNCIÓN: Manejar errores de cámara
  // ========================================================================
  function manejarErrores(error) {
    let mensajeError = '❌ Error desconocido';

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      mensajeError = '❌ Permiso denegado: Debes permitir acceso a la cámara';
      console.error('Permiso denegado por el usuario');
    } else if (error.name === 'NotFoundError' || error.name === 'DeviceNotFoundError') {
      mensajeError = '❌ Cámara no encontrada: Verifica que tu dispositivo tenga cámara';
      console.error('Cámara no disponible en el dispositivo');
    } else if (error.name === 'NotReadableError' || error.name === 'SecurityError') {
      mensajeError = '❌ La cámara está siendo usada por otra aplicación';
      console.error('Cámara ocupada o error de seguridad');
    } else if (error.name === 'TypeError') {
      mensajeError = '❌ Error de configuración de restricciones';
      console.error('Error en parámetros de getUserMedia');
    }

    showCameraAlert(mensajeError, 'danger');
    document.getElementById('capture-photo-btn').disabled = true;
  }

  // ========================================================================
  // FUNCIÓN: Capturar foto desde el video
  // ========================================================================
  function capturarFoto() {
    try {
      if (!videoElement || !canvasElement) {
        showCameraAlert('❌ Elementos de video o canvas no inicializados', 'danger');
        return;
      }

      if (!streamActivo) {
        showCameraAlert('❌ La cámara no está activa. Recarga la página.', 'danger');
        return;
      }

      const ancho = videoElement.videoWidth;
      const alto = videoElement.videoHeight;

      if (ancho === 0 || alto === 0) {
        showCameraAlert('❌ El video aún no está listo. Espera un momento.', 'danger');
        return;
      }

      canvasElement.width = ancho;
      canvasElement.height = alto;

      const contexto = canvasElement.getContext('2d');
      contexto.drawImage(videoElement, 0, 0, ancho, alto);

      const datosImagen = canvasElement.toDataURL('image/jpeg', 0.95);

      if (imgElement) {
        imgElement.src = datosImagen;
        imgElement.style.display = 'block';
        imgElement.alt = 'Foto capturada - Nivel 3';
      }

      completarNivel(datosImagen);

      showCameraAlert('✅ ¡Foto capturada correctamente!', 'success');
      console.log('✅ Foto guardada en estado');

    } catch (error) {
      console.error('Error al capturar foto:', error);
      showCameraAlert('❌ Error al capturar foto: ' + error.message, 'danger');
    }
  }

  // ========================================================================
  // FUNCIÓN: Marcar nivel como completado
  // ========================================================================
  function completarNivel(datosImagen) {
    try {
      window.EscapeRoomState.completeLevel(3, { photo: datosImagen });
      console.log('✅ Nivel 3 marcado como completado');
    } catch (error) {
      console.error('Error al completar nivel:', error);
    }
  }

  // ========================================================================
  // FUNCIÓN: Detener stream de cámara
  // ========================================================================
  function detenerCamara() {
    try {
      if (streamActivo) {
        const pistas = streamActivo.getTracks();
        pistas.forEach(pista => pista.stop());
        streamActivo = null;

        if (videoElement) {
          videoElement.srcObject = null;
        }

        console.log('✅ Cámara detenida');
      }
    } catch (error) {
      console.error('Error al detener cámara:', error);
    }
  }

  // ========================================================================
  // FUNCIÓN: Cargar foto guardada desde estado
  // ========================================================================
  function cargarFotoGuardada() {
    try {
      const datosImagen = window.EscapeRoomState.getLevelData('photo');

      if (datosImagen && imgElement) {
        imgElement.src = datosImagen;
        imgElement.style.display = 'block';
        console.log('✅ Foto guardada cargada desde estado');
      }
    } catch (error) {
      console.error('Error al cargar foto guardada:', error);
    }
  }

  // ========================================================================
  // FUNCIÓN: Mostrar alerta en camera-alert
  // ========================================================================
  function showCameraAlert(mensaje, tipo) {
    console.log(mensaje);
    const alert = document.getElementById('camera-alert');
    if (alert) {
      alert.textContent = mensaje;
      alert.className = `alert alert-${tipo}`;
      alert.style.display = 'block';
    }
  }

  // ========================================================================
  // EVENTO: Cuando el DOM está listo
  // ========================================================================
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📌 Iniciando Nivel 3: La Evidencia del Explorador');

    if (!window.EscapeRoomState.isLevelCompleted(2)) {
      showCameraAlert('❌ Debes completar el Nivel 2 primero antes de acceder al Nivel 3', 'danger');
      return;
    }

    const startCameraBtn = document.getElementById('start-camera-btn');
    const capturePhotoBtn = document.getElementById('capture-photo-btn');

    if (startCameraBtn) {
      startCameraBtn.addEventListener('click', iniciarCamara);
    }

    if (capturePhotoBtn) {
      capturePhotoBtn.addEventListener('click', capturarFoto);
      capturePhotoBtn.disabled = true;
    }

    cargarFotoGuardada();

    console.log('✅ Nivel 3 inicializado correctamente');
  });

  // ========================================================================
  // EVENTO: Limpiar recursos al cerrar página
  // ========================================================================
  window.addEventListener('beforeunload', function() {
    detenerCamara();
  });

})();
