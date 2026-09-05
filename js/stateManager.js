window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  const STORAGE_KEY = 'fathom_arg_progress_v1';
  const STAGES = ['keyword', 'morse', 'simon', 'cipher'];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { unlocked: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.unlocked)) return { unlocked: [] };
      return parsed;
    } catch (error) {
      // localStorage puede fallar (modo privado, cuota excedida); el ARG
      // sigue funcionando en memoria durante la sesión
      return { unlocked: [] };
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // fallo silencioso, ver comentario en loadState
    }
  }

  // Máquina de estados de progresión (patrón State): el ARG solo avanza en
  // orden (keyword -> morse -> simon -> cipher) y persiste cada transición.
  ARG.createStateManager = function createStateManager(eventBus) {
    let state = loadState();
    // se descartan etapas desconocidas por si STAGES cambia entre versiones
    state.unlocked = state.unlocked.filter((stageId) => STAGES.indexOf(stageId) !== -1);

    function isUnlocked(stageId) {
      return state.unlocked.indexOf(stageId) !== -1;
    }

    function currentStageIndex() {
      return state.unlocked.length;
    }

    function unlock(stageId) {
      if (isUnlocked(stageId)) return; // idempotente
      const expectedStage = STAGES[currentStageIndex()];
      if (stageId !== expectedStage) return; // se ignora cualquier intento fuera de orden
      state = { unlocked: state.unlocked.concat(stageId) };
      saveState(state);
      eventBus.emit('stage:unlocked', { stageId, index: currentStageIndex() });
    }

    function reset() {
      state = { unlocked: [] };
      saveState(state);
      eventBus.emit('state:reset', {});
    }

    function restoreProgress() {
      state.unlocked.forEach((stageId, position) => {
        eventBus.emit('stage:restore', { stageId, index: position + 1 });
      });
    }

    return { isUnlocked, unlock, reset, restoreProgress, STAGES };
  };
})(window.ARG);
