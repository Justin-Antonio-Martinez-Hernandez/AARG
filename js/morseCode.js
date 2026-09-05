window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  const MORSE_MAP = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
    H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
    O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
    U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  };
  const TARGET_PHRASE = 'ESCUCHA';
  const UNIT_MS = 160;

  function encodeToMorse(phrase) {
    return phrase.toUpperCase().split('').map((char) => MORSE_MAP[char]).filter(Boolean);
  }

  // Genera la tabla de referencia a partir de MORSE_MAP en vez de duplicarla
  // en el HTML (DRY: una sola fuente de verdad para el alfabeto Morse).
  function renderReferenceTable(container) {
    if (!container || container.childElementCount > 0) return;
    const fragment = document.createDocumentFragment();
    Object.keys(MORSE_MAP).sort().forEach((letter) => {
      const item = document.createElement('div');
      item.className = 'morse-reference__item';
      const letterEl = document.createElement('span');
      letterEl.className = 'morse-reference__letter';
      letterEl.textContent = letter;
      const codeEl = document.createElement('span');
      codeEl.className = 'morse-reference__code';
      codeEl.textContent = MORSE_MAP[letter];
      item.appendChild(letterEl);
      item.appendChild(codeEl);
      fragment.appendChild(item);
    });
    container.appendChild(fragment);
  }

  ARG.initMorsePuzzle = function initMorsePuzzle(eventBus, stateManager) {
    const zone = document.getElementById('zone-terminal');
    if (!zone) return;

    const lightEl = zone.querySelector('[data-role="morse-light"]');
    const playButton = zone.querySelector('[data-role="morse-play"]');
    const answerInput = zone.querySelector('[data-role="morse-answer"]');
    const submitButton = zone.querySelector('[data-role="morse-submit"]');
    const feedbackEl = zone.querySelector('[data-role="morse-feedback"]');
    const referenceGrid = zone.querySelector('[data-role="morse-reference-grid"]');

    renderReferenceTable(referenceGrid);

    let isPlaying = false;
    const timeouts = [];

    function schedule(fn, delay) {
      timeouts.push(setTimeout(fn, delay));
    }
    function clearScheduled() {
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
      isPlaying = false;
    }

    function playSequence() {
      if (isPlaying) return; // evita solapar reproducciones por clicks repetidos
      clearScheduled();
      isPlaying = true;
      playButton.disabled = true;
      let cursor = 0;
      encodeToMorse(TARGET_PHRASE).forEach((code) => {
        code.split('').forEach((symbol) => {
          const duration = symbol === '-' ? UNIT_MS * 3 : UNIT_MS;
          schedule(() => {
            lightEl.classList.add('is-lit');
            ARG.audio.beep({ frequency: 700, durationMs: duration, gain: 0.04 });
          }, cursor);
          schedule(() => lightEl.classList.remove('is-lit'), cursor + duration);
          cursor += duration + UNIT_MS; // separación entre símbolos de una letra
        });
        cursor += UNIT_MS * 2; // separación adicional entre letras (total 3 unidades)
      });
      schedule(() => {
        isPlaying = false;
        playButton.disabled = false;
      }, cursor);
    }

    function markSolved() {
      feedbackEl.textContent = 'Señal decodificada correctamente.';
      feedbackEl.classList.add('is-success');
      answerInput.value = TARGET_PHRASE;
      answerInput.disabled = true;
      playButton.disabled = true;
    }

    function checkAnswer() {
      const guess = answerInput.value.trim().toUpperCase();
      if (!guess) return;
      if (guess === TARGET_PHRASE) {
        markSolved();
        ARG.audio.beep({ frequency: 880, durationMs: 250 });
        stateManager.unlock('morse');
      } else {
        feedbackEl.textContent = 'Secuencia incorrecta. Volvé a escuchar la señal.';
        feedbackEl.classList.remove('is-success');
      }
    }

    function resetUI() {
      clearScheduled();
      lightEl.classList.remove('is-lit');
      answerInput.value = '';
      answerInput.disabled = false;
      playButton.disabled = false;
      feedbackEl.textContent = '';
      feedbackEl.classList.remove('is-success');
    }

    playButton.addEventListener('click', playSequence);
    submitButton.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        checkAnswer();
      }
    });

    eventBus.on('state:reset', resetUI);

    if (stateManager.isUnlocked('morse')) markSolved();
  };
})(window.ARG);
