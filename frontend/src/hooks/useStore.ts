import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '../i18n/translations';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  language: Language;
  total_score: number;
  current_phase: number;
  highest_combo: number;
  games_played: number;
  sound_enabled: boolean;
  music_volume: number;
  sfx_volume: number;
  is_admin: boolean;
}

interface GameState {
  sessionId: string | null;
  score: number;
  combo: number;
  phase: number;
  isPlaying: boolean;
  isPaused: boolean;
}

interface AppStore {
  user: User | null;
  token: string | null;
  language: Language;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  game: GameState;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLanguage: (lang: Language) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setGameState: (state: Partial<GameState>) => void;
  resetGame: () => void;
  logout: () => void;
}

const initialGameState: GameState = {
  sessionId: null,
  score: 0,
  combo: 0,
  phase: 1,
  isPlaying: false,
  isPaused: false,
};

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      language: 'en',
      soundEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      game: initialGameState,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLanguage: (language) => set({ language }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      setGameState: (state) =>
        set((prev) => ({ game: { ...prev.game, ...state } })),
      resetGame: () => set({ game: initialGameState }),
      logout: () => set({ user: null, token: null, game: initialGameState }),
    }),
    {
      name: 'melonary-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        language: state.language,
        soundEnabled: state.soundEnabled,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
      }),
    }
  )
);
