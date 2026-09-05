window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  // Pista: la bio de Elena Voss, en la sección "Quiénes somos", menciona
  // el nombre en clave del programa cancelado.
  const TARGET_WORD = 'nereida';

  ARG.initKeywordTrigger = function initKeywordTrigger(eventBus, stateManager) {
    let buffer = '';
    let handleKeydown = null;

    function arm() {
      buffer = '';
      handleKeydown = (event) => {
        if (event.key.length !== 1) return; // ignora teclas de control/modificadoras
        // buffer acotado al largo del target: crece y se recorta, nunca sin límite
        buffer = (buffer + event.key.toLowerCase()).slice(-TARGET_WORD.length);
        if (buffer === TARGET_WORD) {
          disarm();
          ARG.audio.beep({ frequency: 880, durationMs: 200 });
          stateManager.unlock('keyword');
        }
      };
      document.addEventListener('keydown', handleKeydown);
    }

    function disarm() {
      if (handleKeydown) {
        document.removeEventListener('keydown', handleKeydown);
        handleKeydown = null;
      }
    }

    if (!stateManager.isUnlocked('keyword')) arm();

    // si el ARG se reinicia, hay que volver a armar el listener
    eventBus.on('state:reset', () => {
      disarm();
      arm();
    });
  };
})(window.ARG);
