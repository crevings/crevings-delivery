// Web Audio API helper for robust sound notifications across browsers and mobile webviews

let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  return sharedAudioCtx;
}

/**
 * Unlock AudioContext on first user interaction to satisfy browser autoplay policies.
 */
export function initAudioUnlocker(): void {
  if (typeof window === "undefined" || isAudioUnlocked) return;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().then(() => {
          isAudioUnlocked = true;
        }).catch(() => {});
      } else {
        isAudioUnlocked = true;
      }
    }
    document.removeEventListener("click", unlock);
    document.removeEventListener("touchstart", unlock);
    document.removeEventListener("keydown", unlock);
  };

  document.addEventListener("click", unlock, { passive: true });
  document.addEventListener("touchstart", unlock, { passive: true });
  document.addEventListener("keydown", unlock, { passive: true });
}

// Auto-initialize unlocker on import
initAudioUnlocker();

export const playOrderAlertSound = (): void => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const playBeep = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + startTime);
      osc.stop(audioCtx.currentTime + startTime + duration);
    };

    // Chime sequence: High note (880Hz), pause, Higher note (1760Hz) repeat twice
    playBeep(880, 0, 0.18);
    playBeep(1760, 0.20, 0.30);
    playBeep(880, 0.55, 0.18);
    playBeep(1760, 0.75, 0.40);
  } catch (err) {
    console.error("Audio playback error:", err);
  }
};
