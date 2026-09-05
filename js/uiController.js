window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  const STAGE_TO_ZONE_ID = {
    keyword: 'zone-terminal',
    morse: 'zone-simon',
    simon: 'zone-cipher',
    cipher: 'zone-final',
  };
  const TOTAL_STAGES = Object.keys(STAGE_TO_ZONE_ID).length;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ARG.createUIController = function createUIController(eventBus) {
    const toastContainer = document.getElementById('toast-container');
    const progressTracker = document.getElementById('progress-tracker');

    function revealZone(zoneId, animate) {
      const zoneEl = document.getElementById(zoneId);
      if (!zoneEl) return;
      zoneEl.hidden = false;
      // se fuerza un reflow para que la transición de opacidad/transform se
      // dispare al quitar [hidden] en vez de saltar directo al estado final
      void zoneEl.offsetWidth;
      zoneEl.classList.add('zone--revealed');
      if (animate) {
        zoneEl.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }

    function hideAllZones() {
      Object.keys(STAGE_TO_ZONE_ID).forEach((stageId) => {
        const zoneEl = document.getElementById(STAGE_TO_ZONE_ID[stageId]);
        if (!zoneEl) return;
        zoneEl.hidden = true;
        zoneEl.classList.remove('zone--revealed');
      });
    }

    function showToast(message) {
      if (!toastContainer) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      toastContainer.appendChild(toast);
      // se retira el nodo tras la animación para no acumular elementos en el DOM
      setTimeout(() => toast.remove(), 4000);
    }

    function updateProgress(index) {
      if (!progressTracker) return;
      progressTracker.hidden = false;
      const dots = progressTracker.querySelectorAll('[data-progress-dot]');
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-filled', dotIndex < index);
      });
      progressTracker.setAttribute('aria-label', `Progreso: ${index} de ${TOTAL_STAGES} señales encontradas`);
    }

    eventBus.on('stage:unlocked', function handleUnlock(payload) {
      revealZone(STAGE_TO_ZONE_ID[payload.stageId], true);
      showToast('Nueva sección desbloqueada');
      updateProgress(payload.index);
    });

    eventBus.on('stage:restore', function handleRestore(payload) {
      revealZone(STAGE_TO_ZONE_ID[payload.stageId], false);
      updateProgress(payload.index);
    });

    eventBus.on('state:reset', function handleReset() {
      hideAllZones();
      if (progressTracker) progressTracker.hidden = true;
    });

    return {};
  };
})(window.ARG);
