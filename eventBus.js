window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  // Bus de eventos simple (patrón Observer). Desacopla los módulos de puzzles
  // del control de progreso y de la interfaz: nadie se referencia directamente,
  // solo emiten y escuchan eventos por nombre.
  function createEventBus() {
    const listeners = new Map();

    function on(eventName, handler) {
      if (!listeners.has(eventName)) listeners.set(eventName, new Set());
      listeners.get(eventName).add(handler);
      return function unsubscribe() {
        off(eventName, handler);
      };
    }

    function off(eventName, handler) {
      if (listeners.has(eventName)) listeners.get(eventName).delete(handler);
    }

    function emit(eventName, payload) {
      if (!listeners.has(eventName)) return;
      // se copia el set antes de iterar: si un handler se desuscribe durante
      // el emit, no rompe la iteración en curso
      Array.from(listeners.get(eventName)).forEach((handler) => handler(payload));
    }

    return { on, off, emit };
  }

  ARG.eventBus = createEventBus();
})(window.ARG);
