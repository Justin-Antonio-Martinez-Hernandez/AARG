window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  const TARGET_PHRASE = 'HAY ALGO EN LA GRABACION';
  const ENCODE_SHIFT = 11;

  function caesarShift(text, shift) {
    return text.replace(/[A-Z]/g, (char) => {
      const base = 65; // 'A'.charCodeAt(0)
      const shifted = ((char.charCodeAt(0) - base + shift) % 26 + 26) % 26;
      return String.fromCharCode(base + shifted);
    });
  }

  ARG.initCipherPuzzle = function initCipherPuzzle(eventBus, stateManager) {
    const zone = document.getElementById('zone-cipher');
    if (!zone) return;

    const encodedEl = zone.querySelector('[data-role="cipher-encoded"]');
    const decodedEl = zone.querySelector('[data-role="cipher-decoded"]');
    const slider = zone.querySelector('[data-role="cipher-slider"]');
    const shiftValueEl = zone.querySelector('[data-role="cipher-shift-value"]');
    const feedbackEl = zone.querySelector('[data-role="cipher-feedback"]');

    const encodedText = caesarShift(TARGET_PHRASE, ENCODE_SHIFT);
    encodedEl.textContent = encodedText;

    function updateDecoded() {
      const shift = Number(slider.value);
      const attempt = caesarShift(encodedText, shift);
      decodedEl.textContent = attempt;
      shiftValueEl.textContent = String(shift);
      if (attempt === TARGET_PHRASE) {
        feedbackEl.textContent = 'Registro descifrado.';
        feedbackEl.classList.add('is-success');
        slider.disabled = true;
        ARG.audio.beep({ frequency: 880, durationMs: 250 });
        stateManager.unlock('cipher');
      } else {
        feedbackEl.textContent = '';
        feedbackEl.classList.remove('is-success');
      }
    }

    function resetUI() {
      slider.disabled = false;
      slider.value = '0';
      updateDecoded();
    }

    slider.addEventListener('input', updateDecoded);
    eventBus.on('state:reset', resetUI);

    if (stateManager.isUnlocked('cipher')) {
      slider.value = String((26 - ENCODE_SHIFT) % 26);
      slider.disabled = true;
    }
    updateDecoded();
  };
})(window.ARG);
