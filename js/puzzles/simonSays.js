window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  const PAD_IDS = ['pad-1', 'pad-2', 'pad-3', 'pad-4'];
  const PAD_FREQUENCIES = { 'pad-1': 392, 'pad-2': 523, 'pad-3': 659, 'pad-4': 784 };
  const ROUNDS_TO_WIN = 5;
  const STEP_DURATION_MS = 500;

  const STATES = Object.freeze({
    IDLE: 'idle',
    PLAYING_SEQUENCE: 'playing_sequence',
    AWAITING_INPUT: 'awaiting_input',
  });

  ARG.initSimonSays = function initSimonSays(eventBus, stateManager) {
    const zone = document.getElementById('zone-simon');
    if (!zone) return;

    const startButton = zone.querySelector('[data-role="simon-start"]');
    const statusEl = zone.querySelector('[data-role="simon-status"]');
    const padEls = PAD_IDS.map((id) => zone.querySelector(`[data-pad="${id}"]`));

    let state = STATES.IDLE;
    let sequence = [];
    let playerStep = 0;
    const timeouts = [];

    function schedule(fn, delay) {
      timeouts.push(setTimeout(fn, delay));
    }
    function clearScheduled() {
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
    }

    function litPad(padId, duration) {
      const padEl = zone.querySelector(`[data-pad="${padId}"]`);
      padEl.classList.add('is-active');
      ARG.audio.beep({ frequency: PAD_FREQUENCIES[padId], durationMs: duration, gain: 0.05 });
      schedule(() => padEl.classList.remove('is-active'), duration);
    }

    function playSequence() {
      state = STATES.PLAYING_SEQUENCE;
      statusEl.textContent = `Ronda ${sequence.length} de ${ROUNDS_TO_WIN}`;
      sequence.forEach((padId, index) => {
        schedule(() => litPad(padId, STEP_DURATION_MS * 0.6), index * STEP_DURATION_MS);
      });
      schedule(() => {
        playerStep = 0;
        state = STATES.AWAITING_INPUT;
      }, sequence.length * STEP_DURATION_MS);
    }

    function nextRound() {
      sequence.push(PAD_IDS[Math.floor(Math.random() * PAD_IDS.length)]);
      playSequence();
    }

    function handleWin() {
      state = STATES.IDLE;
      statusEl.textContent = '¡Arreglo sincronizado!';
      startButton.disabled = true;
      stateManager.unlock('simon');
    }

    function handleFail() {
      state = STATES.IDLE;
      statusEl.textContent = 'Secuencia incorrecta. Probá de nuevo.';
      sequence = [];
      startButton.disabled = false;
      startButton.textContent = 'Reintentar';
    }

    function handlePadClick(padId) {
      if (state !== STATES.AWAITING_INPUT) return; // ignora clicks fuera de la ventana de entrada
      litPad(padId, 200);
      if (padId !== sequence[playerStep]) {
        handleFail();
        return;
      }
      playerStep += 1;
      if (playerStep === sequence.length) {
        if (sequence.length >= ROUNDS_TO_WIN) {
          handleWin();
          return;
        }
        state = STATES.IDLE;
        schedule(nextRound, STEP_DURATION_MS);
      }
    }

    function resetUI() {
      clearScheduled();
      state = STATES.IDLE;
      sequence = [];
      playerStep = 0;
      statusEl.textContent = '';
      startButton.disabled = false;
      startButton.textContent = 'Iniciar calibración';
      padEls.forEach((padEl) => padEl.classList.remove('is-active'));
    }

    padEls.forEach((padEl, index) => {
      padEl.addEventListener('click', () => handlePadClick(PAD_IDS[index]));
    });

    startButton.addEventListener('click', () => {
      sequence = [];
      startButton.disabled = true;
      startButton.textContent = 'En curso...';
      nextRound();
    });

    eventBus.on('state:reset', resetUI);

    if (stateManager.isUnlocked('simon')) {
      statusEl.textContent = 'Arreglo sincronizado.';
      startButton.disabled = true;
    }
  };
})(window.ARG);
