/**
 * Organic & Tactile Web Audio Sound Synthesizer
 * Crafted for NexusStrangers: warm acoustic bells, satisfying marimba pops, tactile typing taps, and soft wooden slides.
 * Zero external MP3/WAV dependencies — 100% native Web Audio API.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Warm Kalimba / Rhodes Major-7th Connection Arpeggio
   * Plays a lush, welcoming 4-note ascending chord with warm exponential resonance.
   */
  playMatchFound() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Chord frequencies: C#5, F5, G#5, C6 (Lush Dreamy Major 7th)
      const notes = [554.37, 698.46, 830.61, 1046.50];

      // Master lowpass filter to produce warm acoustic warmth (removes harsh digital treble)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(1.5, now);
      filter.connect(this.ctx.destination);

      notes.forEach((freq, i) => {
        const noteStart = now + i * 0.07;
        const noteDuration = 0.65;

        // Fundamental tone (Warm Sine)
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        // Harmonic overtone for woody kalimba body
        const overtone = this.ctx.createOscillator();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2.02, noteStart); // Slight chorus detune

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.09 / (i + 1), noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration);

        osc.connect(gain);
        overtone.connect(gain);
        gain.connect(filter);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
        overtone.start(noteStart);
        overtone.stop(noteStart + noteDuration);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Soft Marimba / Water Drop Incoming Message Tone
   * A warm, pleasant acoustic drop that is non-intrusive and delightful during active chats.
   */
  playMessageReceived() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Filter for round, warm tone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch envelope: subtle buoyant pop (620Hz down to 540Hz)
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);

      // Subtle chime overtone
      const chime = this.ctx.createOscillator();
      chime.type = 'triangle';
      chime.frequency.setValueAtTime(1080, now);
      chime.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      chime.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + 0.18);
      chime.start(now);
      chime.stop(now + 0.18);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Tactile Typewriter / Subtle Physical Click (Sent Message)
   * Ultra-subtle, satisfying physical feedback on pressing Send.
   */
  playMessageSent() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Filter for wooden click character
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3.0, now);
      filter.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Soft Wooden Slide / Shutter Click (Skip / Disconnect)
   * Smooth, organic mechanical departure that sounds warm and non-jarring.
   */
  playSkip() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Gentle Sonar Radar Pulse (Search Start)
   */
  playSearchStart() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(442, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  isMuted() {
    return Boolean(this.muted);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const sounds = new SoundController();
