window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const eventBus = ARG.eventBus;
    const stateManager = ARG.createStateManager(eventBus);

    ARG.createUIController(eventBus);
    ARG.initDecorativeUI();
    ARG.initKeywordTrigger(eventBus, stateManager);
    ARG.initMorsePuzzle(eventBus, stateManager);
    ARG.initSimonSays(eventBus, stateManager);
    ARG.initCipherPuzzle(eventBus, stateManager);
    ARG.initFinalZone(eventBus, stateManager);

    stateManager.restoreProgress();

    // eslint-disable-next-line no-console
    console.log(
      '%cCuriosidad de desarrollador: esta página no es lo que parece.',
      'color:#5fd9c4; font-family:monospace; font-size:13px;'
    );
  });
})(window.ARG);
