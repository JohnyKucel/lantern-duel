export function createAudio() {
  let context = null;
  let muted = false;
  function ensure() {
    if (context === null) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        context = new Ctor();
      } catch (e) {
        context = false;
      }
    }
    if (context && context.state === 'suspended') context.resume();
    return context || null;
  }
  function tone(freq, dur, type, vol, when) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + (when || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  return {
    click() { tone(660, 0.08, 'triangle', 0.12); },
    play() { tone(392, 0.12, 'triangle', 0.14); tone(523, 0.14, 'triangle', 0.12, 0.07); },
    hit() { tone(180, 0.16, 'sawtooth', 0.14); tone(120, 0.2, 'square', 0.08, 0.02); },
    heal() { tone(523, 0.16, 'sine', 0.1); tone(784, 0.22, 'sine', 0.08, 0.09); },
    win() { tone(523, 0.18, 'triangle', 0.14); tone(659, 0.18, 'triangle', 0.14, 0.14); tone(784, 0.32, 'triangle', 0.16, 0.28); },
    lose() { tone(392, 0.22, 'triangle', 0.12); tone(311, 0.24, 'triangle', 0.12, 0.18); tone(233, 0.4, 'triangle', 0.12, 0.36); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
  };
}
