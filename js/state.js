(function () {
  const STORAGE_KEY = "escapeRoomProgress";
  const LEVEL_COUNT = 5;

  const defaultState = {
    currentLevel: 1,
    completedLevels: {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false
    },
    data: {
      location: null,
      photo: null,
      level4Stats: null,
      level5Stats: null
    },
    updatedAt: null
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeState(state) {
    const normalized = clone(defaultState);

    if (!state || typeof state !== "object") {
      return normalized;
    }

    normalized.currentLevel = Number(state.currentLevel) || 1;
    normalized.currentLevel = Math.min(Math.max(normalized.currentLevel, 1), LEVEL_COUNT);
    normalized.completedLevels = {
      ...normalized.completedLevels,
      ...(state.completedLevels || {})
    };
    normalized.data = {
      ...normalized.data,
      ...(state.data || {})
    };
    normalized.updatedAt = state.updatedAt || null;

    return normalized;
  }

  function load() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch (error) {
      console.warn("No se pudo leer el progreso guardado.", error);
      return clone(defaultState);
    }
  }

  function save(state) {
    const normalized = normalizeState(state);
    normalized.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    notify(normalized);
    return normalized;
  }

  function notify(state) {
    window.dispatchEvent(new CustomEvent("escapeRoom:statechange", {
      detail: clone(state)
    }));
  }

  function getState() {
    return load();
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    const state = clone(defaultState);
    notify(state);
    return state;
  }

  function isLevelCompleted(level) {
    const state = load();
    return Boolean(state.completedLevels[level]);
  }

  function isLevelUnlocked(level) {
    const levelNumber = Number(level);

    if (levelNumber === 1) {
      return true;
    }

    return isLevelCompleted(levelNumber - 1);
  }

  function getCurrentLevel() {
    return load().currentLevel;
  }

  function setCurrentLevel(level) {
    const levelNumber = Math.min(Math.max(Number(level) || 1, 1), LEVEL_COUNT);
    const state = load();
    state.currentLevel = levelNumber;
    return save(state);
  }

  function completeLevel(level, payload) {
    const levelNumber = Math.min(Math.max(Number(level) || 1, 1), LEVEL_COUNT);
    const state = load();
    state.completedLevels[levelNumber] = true;

    if (payload && typeof payload === "object") {
      state.data = {
        ...state.data,
        ...payload
      };
    }

    state.currentLevel = Math.min(levelNumber + 1, LEVEL_COUNT);
    return save(state);
  }

  function setLevelData(key, value) {
    const state = load();
    state.data[key] = value;
    return save(state);
  }

  function getLevelData(key) {
    return load().data[key] || null;
  }

  function getCompletedCount() {
    const state = load();
    return Object.values(state.completedLevels).filter(Boolean).length;
  }

  window.EscapeRoomState = {
    LEVEL_COUNT,
    STORAGE_KEY,
    completeLevel,
    getCompletedCount,
    getCurrentLevel,
    getLevelData,
    getState,
    isLevelCompleted,
    isLevelUnlocked,
    reset,
    setCurrentLevel,
    setLevelData
  };
})();
