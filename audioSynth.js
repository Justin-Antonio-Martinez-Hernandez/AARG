window.ARG = window.ARG || {};
(function (ARG) {
  'use strict';

  let audioCtx = null;

  function getContext() {
    if (audioCtx) return audioCtx;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null; // navegador sin soporte de Web Audio: se degrada en silencio
    audioCtx = new AudioContextClass();
    return audioCtx;
  }

  function beep(options) {
    const settings = Object.assign(
      { frequency: 600, durationMs: 120, type: 'sine', gain: 0.05 },
      options
    );
    const ctx = getContext();
    if (!ctx) return;
    // las políticas de autoplay del navegador exigen reanudar el contexto
    // tras un gesto del usuario (click, tecla); sin esto el primer beep no suena
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = settings.type;
    oscillator.frequency.value = settings.frequency;
    oscillator.connect(gainNode).connect(ctx.destination);

    const now = ctx.currentTime;
    const durationSeconds = settings.durationMs / 1000;
    gainNode.gain.setValueAtTime(settings.gain, now);
    // rampa exponencial hacia (casi) cero en vez de detener en seco:
    // evita el "clic" audible al cortar el oscilador
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    oscillator.start(now);
    oscillator.stop(now + durationSeconds + 0.02);
  }

  ARG.audio = { beep };
})(window.ARG);
