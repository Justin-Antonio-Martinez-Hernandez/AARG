window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  function initWaveform() {
    const container = document.getElementById('hero-waveform');
    if (!container || container.childElementCount > 0) return;
    const BAR_COUNT = 28;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < BAR_COUNT; index += 1) {
      const bar = document.createElement('span');
      bar.className = 'waveform__bar';
      // altura pseudo-aleatoria pero determinista: misma forma en cada carga
      const baseHeight = 20 + Math.round(60 * Math.abs(Math.sin(index * 1.3)));
      bar.style.setProperty('--bar-height', `${baseHeight}%`);
      bar.style.setProperty('--bar-delay', `${(index % 7) * 0.12}s`);
      fragment.appendChild(bar);
    }
    container.appendChild(fragment);
  }

  function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const confirmation = document.getElementById('contact-confirmation');
    if (!contactForm || !confirmation) return;
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault(); // no hay backend real: es una fachada estática
      confirmation.hidden = false;
      contactForm.reset();
    });
  }

  function initDemoButton() {
    const demoButton = document.getElementById('demo-request-button');
    if (!demoButton) return;
    demoButton.addEventListener('click', () => {
      demoButton.textContent = 'Gracias, te contactaremos pronto';
      demoButton.disabled = true;
    });
  }

  ARG.initDecorativeUI = function initDecorativeUI() {
    initWaveform();
    initContactForm();
    initDemoButton();
  };
})(window.ARG);
