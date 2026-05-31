// Synthesized premium sound effects using Web Audio API — no external dependencies
const AudioCtx = typeof window !== "undefined" ? (window.AudioContext || (window as any).webkitAudioContext) : null;
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!AudioCtx) return null;
  if (!ctx || ctx.state === "closed") ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Soft activation chime — plays when Co-Pilot panel opens */
export function playActivationChime() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const gain = c.createGain();
  gain.connect(c.destination);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  // Two-note chime (C5 → E5)
  [523.25, 659.25].forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    osc.connect(gain);
    osc.start(now + i * 0.1);
    osc.stop(now + 0.5);
  });
}

/** Soft notification ping — plays when AI finishes responding */
export function playResponsePing() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const gain = c.createGain();
  gain.connect(c.destination);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.3);
}

/** Subtle hover tick */
export function playHoverTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const gain = c.createGain();
  gain.connect(c.destination);
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, now);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.08);
}
