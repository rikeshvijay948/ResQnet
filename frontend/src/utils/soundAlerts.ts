// Web Audio API Acoustic Alert Synthesizer for ResQNet Command Center
// Synthesizes pure oscillator waveforms (zero external MP3 assets, zero network latency)

class SoundAlertManager {
  private ctx: AudioContext | null = null;
  private storageKey = "resqnet_audio_alerts_enabled";

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {
        // User gesture required in some browsers
      });
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(this.storageKey);
    return stored === "true";
  }

  public setEnabled(enabled: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.storageKey, enabled ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("resqnet_audio_alerts_changed", {
        detail: { enabled },
      })
    );
    if (enabled) {
      // Warm up AudioContext on user enable gesture
      this.getAudioContext();
      this.playDispatchChime();
    }
  }

  public toggle(): boolean {
    const next = !this.isEnabled();
    this.setEnabled(next);
    return next;
  }

  /**
   * P1 Critical Emergency Siren: Alternating dual-frequency sweeping tone (880Hz / 440Hz)
   */
  public playCriticalSiren(): void {
    if (!this.isEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";

      const now = ctx.currentTime;
      // Frequency alternation: 880Hz -> 440Hz -> 880Hz -> 440Hz -> fade out
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.75);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.setValueAtTime(0.2, now + 0.75);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    } catch (err) {
      console.warn("Audio synthesis error:", err);
    }
  }

  /**
   * P2 High Severity Alert: Double-pulsed urgent alert chirp
   */
  public playHighAlertChirp(): void {
    if (!this.isEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Pulse 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Pulse 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.18); // E5
      osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.3);
      gain2.gain.setValueAtTime(0.25, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.33);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.33);
    } catch (err) {
      console.warn("High alert chirp error:", err);
    }
  }

  /**
   * Dispatch / Confirmation Chime: Clean 3-note harmonic arpeggio (C5 -> E5 -> G5)
   */
  public playDispatchChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.36);
      });
    } catch (err) {
      console.warn("Chime error:", err);
    }
  }

  /**
   * Tactical Walkie-Talkie Radio Squelch Beep (50ms burst)
   */
  public playRadioBeep(): void {
    if (!this.isEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1050, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (err) {
      console.warn("Radio beep error:", err);
    }
  }

  /**
   * Automatically play corresponding alert based on incident severity / priority rank
   */
  public playAlertForIncident(severity?: string, priorityRank?: string): void {
    if (!this.isEnabled()) return;

    const rank = priorityRank?.toUpperCase();
    const sev = severity?.toLowerCase();

    if (rank === "P1" || sev === "critical") {
      this.playCriticalSiren();
    } else if (rank === "P2" || sev === "high") {
      this.playHighAlertChirp();
    } else {
      this.playRadioBeep();
    }
  }
}

export const soundAlerts = new SoundAlertManager();
