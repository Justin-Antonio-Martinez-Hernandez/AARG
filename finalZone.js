window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  ARG.initFinalZone = function initFinalZone(eventBus, stateManager) {
    const zone = document.getElementById('zone-final');
    if (!zone) return;
    const resetButton = zone.querySelector('[data-role="reset-arg"]');
    if (!resetButton) return;
    resetButton.addEventListener('click', () => {
      stateManager.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };
})(window.ARG);
