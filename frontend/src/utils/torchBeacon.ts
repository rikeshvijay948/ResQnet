// ResQNet Optical & Acoustic Distress Beacon (SOS Morse Code & Full-Screen Strobe)

export class EmergencyBeaconController {
  private mediaStream: MediaStream | null = null;
  private track: MediaStreamTrack | null = null;
  private isStrobeRunning = false;
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playTone(durationMs: number): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(850, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + durationMs / 1000 - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn("Beacon tone error:", e);
    }
  }

  /**
   * Tries to acquire camera track with torch capability
   */
  public async enableTorch(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      if (!this.track) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        this.mediaStream = stream;
        const tracks = stream.getVideoTracks();
        if (tracks.length > 0) {
          this.track = tracks[0];
        }
      }

      if (this.track) {
        const capabilities = (this.track as any).getCapabilities?.() || {};
        if (capabilities.torch) {
          await (this.track as any).applyConstraints({
            advanced: [{ torch: true }],
          });
          return true;
        }
      }
    } catch (err) {
      console.warn("Torch not supported on this device/browser:", err);
    }
    return false;
  }

  public async disableTorch(): Promise<void> {
    try {
      if (this.track) {
        await (this.track as any).applyConstraints?.({
          advanced: [{ torch: false }],
        });
        this.track.stop();
        this.track = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
      }
    } catch (err) {
      console.warn("Error stopping torch:", err);
    }
  }

  /**
   * Starts an SOS Morse Code cycle (Dot: 150ms, Dash: 450ms)
   * Calls onStateChange(true/false) so full-screen UI flash stays synchronized
   */
  public async startSOSLoop(
    onFlashState: (active: boolean) => void,
    soundEnabled: boolean = true
  ): Promise<() => void> {
    this.isStrobeRunning = true;

    // Pattern for S-O-S: 3 dots, 3 dashes, 3 dots
    // dot: 150, dash: 450, symbol gap: 150, letter gap: 400, loop gap: 1200
    const sequence: { on: number; off: number }[] = [
      // S: ...
      { on: 150, off: 150 },
      { on: 150, off: 150 },
      { on: 150, off: 400 },
      // O: ---
      { on: 450, off: 150 },
      { on: 450, off: 150 },
      { on: 450, off: 400 },
      // S: ...
      { on: 150, off: 150 },
      { on: 150, off: 150 },
      { on: 150, off: 1200 },
    ];

    const sleep = (ms: number) =>
      new Promise((res) => setTimeout(res, ms));

    const loop = async () => {
      while (this.isStrobeRunning) {
        for (const item of sequence) {
          if (!this.isStrobeRunning) break;

          onFlashState(true);
          if (soundEnabled) this.playTone(item.on);
          await sleep(item.on);

          if (!this.isStrobeRunning) break;
          onFlashState(false);
          await sleep(item.off);
        }
      }
      onFlashState(false);
    };

    loop();

    return () => {
      this.isStrobeRunning = false;
      this.disableTorch();
      onFlashState(false);
    };
  }

  public stop(): void {
    this.isStrobeRunning = false;
    this.disableTorch();
  }
}

export const beaconController = new EmergencyBeaconController();
