// Web Audio API helper for sound notifications

export const playOrderAlertSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    
    // Play double beep chime pattern
    const playBeep = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + startTime);
      osc.stop(audioCtx.currentTime + startTime + duration);
    };

    // Chime sequence: High note (880Hz), pause, Higher note (1760Hz) repeat twice
    playBeep(880, 0, 0.15);
    playBeep(1760, 0.18, 0.25);
    playBeep(880, 0.5, 0.15);
    playBeep(1760, 0.68, 0.35);

  } catch (err) {
    console.error("Audio playback error:", err);
  }
};
