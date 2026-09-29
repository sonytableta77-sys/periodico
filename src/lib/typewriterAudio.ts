/**
 * Sintetizador Web Audio API para simular sonidos mecánicos auténticos de máquina de escribir:
 * - Golpe de martillo / tecla (keystroke clack)
 * - Barra espaciadora (thud sordo)
 * - Timbre de retorno de carro al presionar Enter (vintage typewriter bell "ding")
 * - Retroceso / Backspace (trinquete mecánico)
 */

class TypewriterAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Sonido de tecla ordinaria (martillo golpeando cinta sobre papel)
  playKeystroke() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Generar ráfaga corta de ruido blanco para el impacto
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Filtro paso banda para tono metálico vintage
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 300, now);
      filter.Q.setValueAtTime(3.5, now);

      // Envolvente de ganancia rápida
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.04);

      // Golpe sordo de baja frecuencia (rebote mecánico)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.03);

      oscGain.gain.setValueAtTime(0.22, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Audio no bloqueante en caso de restricción del navegador
    }
  }

  // Sonido de barra espaciadora (más hueco y sordo)
  playSpace() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.05);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }

  // Timbre de campana de máquina de escribir al hacer retorno de carro (Enter)
  playCarriageReturnBell() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Tono de campana de bronce metálico con armónicos
      const fundamental = 2480; // Tono agudo cristalino
      [fundamental, fundamental * 1.5, fundamental * 2.2].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const initGain = idx === 0 ? 0.22 : 0.08 / idx;
        gain.gain.setValueAtTime(initGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.9);
      });

      // Mecanismo de palanca de retorno
      const oscThud = this.ctx.createOscillator();
      const gainThud = this.ctx.createGain();
      oscThud.frequency.setValueAtTime(95, now);
      oscThud.frequency.exponentialRampToValueAtTime(30, now + 0.09);
      gainThud.gain.setValueAtTime(0.25, now);
      gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      oscThud.connect(gainThud);
      gainThud.connect(this.ctx.destination);

      oscThud.start(now);
      oscThud.stop(now + 0.1);
    } catch {
      // ignore
    }
  }
}

export const typewriterAudio = new TypewriterAudio();
