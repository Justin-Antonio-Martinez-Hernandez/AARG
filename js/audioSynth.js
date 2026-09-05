window.ARG = window.ARG || {};

(function (ARG) {
  'use strict';

  let audioCtx = null;

  function getContext() {
    if (audioCtx && audioCtx.state !== 'closed') {
      return audioCtx;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.warn('Web Audio API no es compatible con este navegador.');
      return null;
    }

    audioCtx = new AudioContextClass();
    return audioCtx;
  }

  async function resumeContext(ctx) {
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (error) {
        console.warn('No se pudo reanudar el AudioContext:', error);
        return false;
      }
    }

    return ctx.state === 'running';
  }

  async function beep(options = {}) {
    const settings = Object.assign(
      {
        frequency: 600,
        durationMs: 120,
        type: 'sine',
        gain: 0.05
      },
      options
    );

    const ctx = getContext();

    if (!ctx) return;

    // El navegador puede bloquear el audio hasta que exista
    // una interacción del usuario.
    const ready = await resumeContext(ctx);

    if (!ready) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = settings.type;
    oscillator.frequency.setValueAtTime(
      settings.frequency,
      ctx.currentTime
    );

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    const duration = Math.max(0.01, settings.durationMs / 1000);
    const gain = Math.max(0.0001, settings.gain);

    // Entrada suave
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(gain, now + 0.01);

    // Salida suave para evitar clicks
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  ARG.audio = {
    beep
  };

})(window.ARG);
