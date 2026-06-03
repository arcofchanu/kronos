// Web Audio API beep generator for KRONOS timer transitions
// No external audio files needed — all sounds are synthesized

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a single beep tone
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in ms
 * @param {number} delay - Delay before playing in ms
 */
function playBeep(frequency = 600, duration = 80, delay = 0) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Smooth envelope to avoid clicks
    const startTime = ctx.currentTime + delay / 1000;
    const endTime = startTime + duration / 1000;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.005);
    gainNode.gain.setValueAtTime(0.3, endTime - 0.01);
    gainNode.gain.linearRampToValueAtTime(0, endTime);

    oscillator.start(startTime);
    oscillator.stop(endTime + 0.01);
  } catch (e) {
    // Silently fail — audio is non-critical
    console.warn('Audio playback failed:', e);
  }
}

/** WORK → REST transition: one short sharp beep (600Hz, 80ms) */
export function playWorkToRest() {
  playBeep(600, 80);
}

/** REST → WORK transition: two short beeps (800Hz, 60ms each, 80ms apart) */
export function playRestToWork() {
  playBeep(800, 60, 0);
  playBeep(800, 60, 140);
}

/** Session complete: three ascending beeps */
export function playSessionComplete() {
  playBeep(600, 100, 0);
  playBeep(800, 100, 180);
  playBeep(1000, 150, 360);
}

/** Initialize audio context on first user interaction */
export function initAudio() {
  getAudioContext();
}
