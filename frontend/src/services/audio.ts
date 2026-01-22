class AudioManager {
  private bgMusic: HTMLAudioElement | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private musicVolume = 0.7;
  private sfxVolume = 0.8;
  private enabled = true;

  constructor() {
    this.preloadSounds();
  }

  private preloadSounds() {
    const soundEffects = ['kick', 'hit', 'perfect', 'miss', 'combo', 'phase_up', 'game_over'];
    soundEffects.forEach((name) => {
      const audio = new Audio();
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  setMusicVolume(volume: number) {
    this.musicVolume = volume;
    if (this.bgMusic) {
      this.bgMusic.volume = volume;
    }
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = volume;
  }

  playMusic(_track: 'menu' | 'game') {
    if (!this.enabled) return;
    
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
    
    this.bgMusic = new Audio();
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.musicVolume;
  }

  stopMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  playSound(name: 'kick' | 'hit' | 'perfect' | 'miss' | 'combo' | 'phase_up' | 'game_over') {
    if (!this.enabled) return;

    const frequencies: Record<string, number> = {
      kick: 200,
      hit: 400,
      perfect: 600,
      miss: 150,
      combo: 500,
      phase_up: 800,
      game_over: 100,
    };

    const durations: Record<string, number> = {
      kick: 0.1,
      hit: 0.15,
      perfect: 0.2,
      miss: 0.2,
      combo: 0.25,
      phase_up: 0.5,
      game_over: 0.8,
    };

    this.playTone(frequencies[name] || 440, durations[name] || 0.1);
  }

  private playTone(frequency: number, duration: number) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }
}

export const audioManager = new AudioManager();
