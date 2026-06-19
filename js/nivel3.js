// ============================================================================
// NIVEL 3: LA EVIDENCIA DEL EXPLORADOR (20%)
// ============================================================================
// Requisitos: Acceder a cámara, mostrar video en tiempo real, capturar foto,
// guardar en LocalStorage, manejo de errores, y verificar Nivel 2 completado.
// ============================================================================

// Variables globales para el manejo de cámara y canvas
let streamActivo = null;
let videElement = null;
let canvasElement = null;
let imgElement = null;

// ============================================================================
// FUNCIÓN: Validar que Nivel 2 esté completado
// ============================================================================
function validarNivel2() {
  try {
    const nivel2Completado = localStorage.getItem('nivel2_completado');

    if (!nivel2Completado || nivel2Completado !== 'true') {
      mostrarError('❌ Debes completar el Nivel 2 primero antes de acceder al Nivel 3');
      document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h2>Acceso denegado</h2><p>Completa el Nivel 2 primero</p></div>';
      return false;
    }

    console.log('✅ Nivel 2 validado correctamente');
    return true;
  } catch (error) {
    console.error('Error en validación de Nivel 2:', error);
    return false;
  }
}

// ============================================================================
// FUNCIÓN: Iniciar acceso a la cámara
// ============================================================================
function iniciarCamara() {
  try {
    // Obtener elementos del DOM
    videElement = document.getElementById('videoCamara');
    canvasElement = document.getElementById('canvasCaptura');
    imgElement = document.getElementById('fotoCapturada');

    if (!videElement) {
      mostrarError('❌ Elemento <video id="videoCamara"> no encontrado en el HTML');
      return;
    }

    // Verificar compatibilidad del navegador
    const navegador = navigator.mediaDevices || navigator.webkitGetUserMedia;
    if (!navegador) {
      mostrarError('❌ Tu navegador no soporta acceso a cámara. Usa Chrome, Firefox o Edge.');
      return;
    }

    // Solicitar acceso a cámara con audio deshabilitado
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
        videElement.srcObject = stream;
        videElement.play();

        // Cuando el video esté listo
        videElement.onloadedmetadata = function() {
          console.log('✅ Cámara iniciada correctamente');
          document.getElementById('estadoCamara').textContent = '✅ Cámara activa';
          document.getElementById('estadoCamara').style.color = 'green';
          document.getElementById('btnCapturar').disabled = false;
        };
      })
      .catch(error => manejarErrores(error));

  } catch (error) {
    console.error('Error al iniciar cámara:', error);
    manejarErrores(error);
  }
}

// ============================================================================
// FUNCIÓN: Manejar errores de cámara
// ============================================================================
function manejarErrores(error) {
  let mensajeError = '❌ Error desconocido';

  // Identificar tipo de error
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

  mostrarError(mensajeError);
  document.getElementById('estadoCamara').textContent = mensajeError;
  document.getElementById('estadoCamara').style.color = 'red';
  document.getElementById('btnCapturar').disabled = true;
}

// ============================================================================
// FUNCIÓN: Capturar foto desde el video
// ============================================================================
function capturarFoto() {
  try {
    if (!videElement || !canvasElement) {
      mostrarError('❌ Elementos de video o canvas no inicializados');
      return;
    }

    if (!streamActivo) {
      mostrarError('❌ La cámara no está activa. Recarga la página.');
      return;
    }

    // Configurar canvas con dimensiones del video
    const ancho = videElement.videoWidth;
    const alto = videElement.videoHeight;

    if (ancho === 0 || alto === 0) {
      mostrarError('❌ El video aún no está listo. Espera un momento.');
      return;
    }

    canvasElement.width = ancho;
    canvasElement.height = alto;

    // Obtener contexto 2D y dibujar frame del video
    const contexto = canvasElement.getContext('2d');
    contexto.drawImage(videElement, 0, 0, ancho, alto);

    // Convertir canvas a imagen en formato base64
    const datosImagen = canvasElement.toDataURL('image/jpeg', 0.95);

    // Guardar en localStorage
    guardarFotoEnLocalStorage(datosImagen);

    // Mostrar foto capturada
    if (imgElement) {
      imgElement.src = datosImagen;
      imgElement.style.display = 'block';
      imgElement.alt = 'Foto capturada - Nivel 3';
    }

    // Marcar nivel como completado
    completarNivel(3);

    // Feedback visual
    mostrarExito('✅ ¡Foto capturada correctamente!');
    console.log('✅ Foto guardada en localStorage');

  } catch (error) {
    console.error('Error al capturar foto:', error);
    mostrarError('❌ Error al capturar foto: ' + error.message);
  }
}

// ============================================================================
// FUNCIÓN: Guardar foto en LocalStorage
// ============================================================================
function guardarFotoEnLocalStorage(datosImagen) {
  try {
    // Verificar espacio disponible en localStorage (límite ~5-10MB)
    const tamañoAproximado = datosImagen.length;

    // Guardar foto con timestamp
    const timestamp = new Date().toISOString();
    const clave = 'nivel3_foto_' + timestamp;

    localStorage.setItem(clave, datosImagen);

    // Guardar también la clave de la última foto para acceso rápido
    localStorage.setItem('nivel3_ultima_foto', clave);
    localStorage.setItem('nivel3_foto_timestamp', timestamp);

    console.log(`✅ Foto guardada en localStorage (${(tamañoAproximado / 1024).toFixed(2)} KB)`);

  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      mostrarError('❌ LocalStorage lleno. Limpia datos de otras aplicaciones.');
      console.error('Cuota de localStorage excedida');
    } else {
      console.error('Error al guardar en localStorage:', error);
      mostrarError('❌ No se pudo guardar la foto: ' + error.message);
    }
  }
}

// ============================================================================
// FUNCIÓN: Marcar nivel como completado
// ============================================================================
function completarNivel(numeroNivel) {
  try {
    // Validar que sea el nivel correcto
    if (numeroNivel !== 3) {
      console.warn('Advertencia: Intentando completar nivel diferente a 3');
      return;
    }

    // Marcar como completado en localStorage
    localStorage.setItem('nivel3_completado', 'true');
    localStorage.setItem('nivel3_fecha_completado', new Date().toISOString());

    // Actualizar progreso general
    actualizarProgresoGeneral();

    // Mostrar feedback
    mostrarExito('🎉 ¡NIVEL 3 COMPLETADO! Puedes avanzar al Nivel 4.');
    document.getElementById('estadoNivel').textContent = '✅ NIVEL 3 COMPLETADO';
    document.getElementById('estadoNivel').style.color = 'green';
    document.getElementById('estadoNivel').style.fontWeight = 'bold';

    // Habilitar botón para siguiente nivel
    const btnSiguiente = document.getElementById('btnSiguiente');
    if (btnSiguiente) {
      btnSiguiente.disabled = false;
    }

    console.log('✅ Nivel 3 marcado como completado');

  } catch (error) {
    console.error('Error al completar nivel:', error);
  }
}

// ============================================================================
// FUNCIÓN: Actualizar progreso general
// ============================================================================
function actualizarProgresoGeneral() {
  try {
    let nivelesCompletados = 0;

    for (let i = 1; i <= 5; i++) {
      if (localStorage.getItem(`nivel${i}_completado`) === 'true') {
        nivelesCompletados++;
      }
    }

    const porcentaje = Math.round((nivelesCompletados / 5) * 100);
    localStorage.setItem('progreso_general', porcentaje);

    const barraProgreso = document.getElementById('barraProgreso');
    if (barraProgreso) {
      barraProgreso.style.width = porcentaje + '%';
      barraProgreso.textContent = porcentaje + '%';
    }

  } catch (error) {
    console.error('Error al actualizar progreso:', error);
  }
}

// ============================================================================
// FUNCIÓN: Mostrar mensaje de error
// ============================================================================
function mostrarError(mensaje) {
  console.error(mensaje);
  const contenedor = document.getElementById('mensajeError');
  if (contenedor) {
    contenedor.textContent = mensaje;
    contenedor.style.display = 'block';
    contenedor.style.color = '#dc3545';
    contenedor.style.padding = '10px';
    contenedor.style.marginBottom = '15px';
    contenedor.style.borderRadius = '5px';
    contenedor.style.backgroundColor = '#f8d7da';
    contenedor.style.border = '1px solid #f5c6cb';
  }
}

// ============================================================================
// FUNCIÓN: Mostrar mensaje de éxito
// ============================================================================
function mostrarExito(mensaje) {
  console.log(mensaje);
  const contenedor = document.getElementById('mensajeExito');
  if (contenedor) {
    contenedor.textContent = mensaje;
    contenedor.style.display = 'block';
    contenedor.style.color = '#155724';
    contenedor.style.padding = '10px';
    contenedor.style.marginBottom = '15px';
    contenedor.style.borderRadius = '5px';
    contenedor.style.backgroundColor = '#d4edda';
    contenedor.style.border = '1px solid #c3e6cb';

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      contenedor.style.display = 'none';
    }, 5000);
  }
}

// ============================================================================
// FUNCIÓN: Detener stream de cámara
// ============================================================================
function detenerCamara() {
  try {
    if (streamActivo) {
      const pistas = streamActivo.getTracks();
      pistas.forEach(pista => pista.stop());
      streamActivo = null;

      if (videElement) {
        videElement.srcObject = null;
      }

      console.log('✅ Cámara detenida');
    }
  } catch (error) {
    console.error('Error al detener cámara:', error);
  }
}

// ============================================================================
// FUNCIÓN: Cargar foto guardada desde localStorage
// ============================================================================
function cargarFotoGuardada() {
  try {
    const claveFoto = localStorage.getItem('nivel3_ultima_foto');

    if (claveFoto) {
      const datosImagen = localStorage.getItem(claveFoto);
      if (datosImagen && imgElement) {
        imgElement.src = datosImagen;
        imgElement.style.display = 'block';
        console.log('✅ Foto guardada cargada desde localStorage');
      }
    }
  } catch (error) {
    console.error('Error al cargar foto guardada:', error);
  }
}

// ============================================================================
// EVENTO: Cuando el DOM está listo
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('📌 Iniciando Nivel 3: La Evidencia del Explorador');

  // Verificar que Nivel 2 esté completado
  if (!validarNivel2()) {
    return; // Si Nivel 2 no está completado, no continuar
  }

  // Obtener referencias a elementos DOM
  const btnCapturar = document.getElementById('btnCapturar');
  const btnDetener = document.getElementById('btnDetener');
  const btnLimpiar = document.getElementById('btnLimpiar');

  // Asignar eventos a botones
  if (btnCapturar) {
    btnCapturar.addEventListener('click', capturarFoto);
    btnCapturar.disabled = true; // Deshabilitado hasta que cámara esté lista
  }

  if (btnDetener) {
    btnDetener.addEventListener('click', detenerCamara);
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function() {
      if (imgElement) {
        imgElement.src = '';
        imgElement.style.display = 'none';
      }
      if (canvasElement) {
        canvasElement.getContext('2d').clearRect(0, 0, canvasElement.width, canvasElement.height);
      }
      console.log('✅ Canvas e imagen limpios');
    });
  }

  // Cargar foto guardada si existe
  cargarFotoGuardada();

  // Iniciar cámara
  setTimeout(() => {
    iniciarCamara();
  }, 500);

  // Verificar si nivel ya fue completado
  if (localStorage.getItem('nivel3_completado') === 'true') {
    document.getElementById('estadoNivel').textContent = '✅ NIVEL 3 COMPLETADO';
    document.getElementById('estadoNivel').style.color = 'green';
    document.getElementById('estadoNivel').style.fontWeight = 'bold';

    const btnSiguiente = document.getElementById('btnSiguiente');
    if (btnSiguiente) {
      btnSiguiente.disabled = false;
    }
  }

  console.log('✅ Nivel 3 inicializado correctamente');
});

// ============================================================================
// EVENTO: Limpiar recursos al cerrar página
// ============================================================================
window.addEventListener('beforeunload', function() {
  detenerCamara();
});

// ============================================================================
// EXPORTAR FUNCIONES (si se usa en módulos)
// ============================================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validarNivel2,
    iniciarCamara,
    manejarErrores,
    capturarFoto,
    completarNivel,
    detenerCamara,
    cargarFotoGuardada
  };
}
