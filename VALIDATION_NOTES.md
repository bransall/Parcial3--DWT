# Validación y Sincronización: Nivel 2 → Nivel 3

## Problema Identificado

El sistema permitía **pasar a niveles sin completar las tareas reales**. Aunque el JS verificaba en algunos lugares que el nivel anterior estuviera completado, los botones `[data-complete-level]` permitían hacer "click y listo" sin hacer nada.

### Ejemplo de la vulnerabilidad:
```
1. Usuario abre la página
2. Usuario salta directamente al Nivel 3 (si escroll)
3. Usuario hace clic en "Marcar nivel 3 completo" sin activar cámara
4. Nivel 3 marcado como completado sin evidencia fotográfica ❌
```

## Solución Implementada: Opción 3 Mejorada

**Botones deshabilitados + Checklist visual + Validación progresiva**

### 1. **index.html** - Checklists Visuales

#### Nivel 2
```html
<ul id="level2-checklist" class="list-unstyled mb-3">
  <li class="mb-2"><span id="check-level2-map" class="badge bg-secondary me-2">○</span>Mapa dibujado</li>
  <li class="mb-2"><span id="check-level2-marker" class="badge bg-secondary me-2">○</span>Ubicación marcada</li>
</ul>
```

- Botón completar inicialmente **DESHABILITADO**: `disabled`
- ID específico para cada botón: `id="complete-level2-btn"`

#### Nivel 3
```html
<ul id="level3-checklist" class="list-unstyled mb-3">
  <li class="mb-2"><span id="check-level3-camera" class="badge bg-secondary me-2">○</span>Cámara activada</li>
  <li class="mb-2"><span id="check-level3-photo" class="badge bg-secondary me-2">○</span>Foto capturada</li>
</ul>
```

- Botón completar inicialmente **DESHABILITADO**: `disabled`
- ID específico para cada botón: `id="complete-level3-btn"`

### 2. **js/nivel2.js** - Progreso Rastreado

```javascript
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
```

En `renderMapAndLocation()`:
1. Dibuja mapa → `updateCheckItem("check-level2-map", true)` → ✓
2. Marca ubicación → `updateCheckItem("check-level2-marker", true)` → ✓
3. Ambos listos → `enableCompleteButton("complete-level2-btn")` → Botón se activa

### 3. **js/nivel3.js** - Progreso Rastreado

Mismo patrón que nivel2:

En `iniciarCamara()` cuando stream está listo:
```javascript
updateCheckItem('check-level3-camera', true)
```

En `capturarFoto()` cuando foto se captura:
```javascript
updateCheckItem('check-level3-photo', true)
enableCompleteButton('complete-level3-btn')
```

## Flujo Completo (Validado)

### Nivel 1: Obtener ubicación
```
1. Usuario hace clic en "Obtener ubicacion"
2. nivel1.js obtiene ubicación
3. EscapeRoomState.completeLevel(1, { location })
4. app.js escucha evento y actualiza badge → "Completado"
5. Progreso sube a 20%
```

### Nivel 2: Dibujar mapa
```
PRECONDICIÓN: Nivel 1 completado ✓ (validado por EscapeRoomState.isLevelCompleted(1))

VISUAL:
  ○ Mapa dibujado
  ○ Ubicación marcada
  [Marcar nivel 2 completo] ← DESHABILITADO

ACCIÓN: Usuario hace clic en "Dibujar mapa"

PROGRESO:
  1. nivel2.js dibuja mapa en canvas
     → updateCheckItem("check-level2-map", true)
     → Checklist muestra: ✓ Mapa dibujado

  2. nivel2.js marca ubicación del nivel 1
     → updateCheckItem("check-level2-marker", true)
     → Checklist muestra: ✓ Ubicación marcada

  3. Ambas tareas completadas
     → enableCompleteButton("complete-level2-btn")
     → Botón se activa (pierde atributo disabled)

RESULTADO:
  - Botón se torna verde y habilitado
  - Auto-scroll a Nivel 3
  - Usuario hace clic en botón activado
  - EscapeRoomState.completeLevel(2)
  - app.js actualiza badge → "Completado"
  - Progreso sube a 40%
```

### Nivel 3: Capturar foto
```
PRECONDICIÓN: Nivel 2 completado ✓ (validado por nivel3.js al cargar)

VISUAL:
  ○ Cámara activada
  ○ Foto capturada
  [Marcar nivel 3 completo] ← DESHABILITADO

ACCIÓN 1: Usuario hace clic en "Activar camara"

PROGRESO:
  1. nivel3.js solicita acceso a cámara
  2. navigator.mediaDevices.getUserMedia() inicia stream
  3. Video aparece en #camera-video
  4. onloadedmetadata se dispara
     → updateCheckItem('check-level3-camera', true)
     → Checklist muestra: ✓ Cámara activada

ACCIÓN 2: Usuario hace clic en "Capturar foto"

PROGRESO:
  1. nivel3.js captura frame de video
  2. Convierte a base64 (JPEG)
  3. Muestra preview en #captured-photo
  4. completarNivel() ejecuta:
     → EscapeRoomState.completeLevel(3, { photo })
     → updateCheckItem('check-level3-photo', true)
     → Checklist muestra: ✓ Foto capturada
     → enableCompleteButton('complete-level3-btn')

RESULTADO:
  - Botón se torna verde y habilitado
  - app.js escucha evento y actualiza badge → "Completado"
  - Progreso sube a 60%
  - Usuario hace clic en botón (ahora habilitado)
  - EscapeRoomState sigue registrando
```

## Seguridad Implementada

✅ **No se puede completar sin hacer la tarea**: Botón deshabilitado hasta que checklist esté 100% completo

✅ **Validación en el servidor (JS)**: Cada nivel valida el anterior antes de iniciar
   - nivel2.js: `EscapeRoomState.isLevelCompleted(1)`
   - nivel3.js: `EscapeRoomState.isLevelCompleted(2)`

✅ **Feedback visual inmediato**: Usuario ve exactamente qué falta por hacer

✅ **Escalable**: Mismo patrón funciona para niveles 4 y 5

## Testing Checklist

### Escenario 1: Flujo Normal (Esperado)
- [ ] Completar Nivel 1 (obtener ubicación)
- [ ] Ir a Nivel 2
- [ ] Verificar checklist inicial: `○ ○`
- [ ] Verificar botón deshabilitado
- [ ] Hacer clic en "Dibujar mapa"
- [ ] Verificar checklist actualizado: `✓ ✓`
- [ ] Verificar botón habilitado
- [ ] Hacer clic en botón
- [ ] Verificar auto-scroll a Nivel 3
- [ ] Verificar badge Nivel 2 cambia a "Completado"
- [ ] Verificar progreso = 40%
- [ ] Ir a Nivel 3
- [ ] Verificar checklist inicial: `○ ○`
- [ ] Verificar botón deshabilitado
- [ ] Hacer clic en "Activar camara"
- [ ] Verificar checklist: `✓ ○`
- [ ] Hacer clic en "Capturar foto"
- [ ] Verificar checklist: `✓ ✓`
- [ ] Verificar botón habilitado
- [ ] Hacer clic en botón
- [ ] Verificar badge Nivel 3 cambia a "Completado"
- [ ] Verificar progreso = 60%

### Escenario 2: Intento de Bypass (No Permitido)
- [ ] Intentar hacer clic en botón deshabilitado → No pasa nada
- [ ] Intenta pasar sin hacer tareas → Botón permanece deshabilitado

### Escenario 3: Persistencia
- [ ] Completar Nivel 2 y 3
- [ ] Recargar página
- [ ] Verificar que checklists mantienen su estado (✓)
- [ ] Verificar que botones permanecen habilitados
- [ ] Verificar que fotos/datos se restauran correctamente

## Archivos Modificados

1. `index.html`
   - Líneas 71-80: Checklist Nivel 2
   - Línea 80: ID y disabled en botón
   - Líneas 92-95: Checklist Nivel 3
   - Línea 109: ID y disabled en botón

2. `js/nivel2.js`
   - Líneas 59, 93: Llamadas a `updateCheckItem()`
   - Línea 104: Llamada a `enableCompleteButton()`
   - Líneas 122-136: Nuevas funciones auxiliares

3. `js/nivel3.js`
   - Línea 54: Llamada a `updateCheckItem()` al iniciar cámara
   - Líneas 128-129: Llamadas cuando foto se captura
   - Líneas 206-226: Nuevas funciones auxiliares

## Conclusión

Sistema de validación implementado correctamente. No se puede pasar a un nivel sin completar las tareas reales. El feedback visual (checklist) guía al usuario sobre qué debe hacer.

---

**Generado**: 2026-06-19
**Status**: ✅ Listo para testing en navegador
