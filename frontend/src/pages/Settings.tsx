import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t, Language } from '../i18n/translations';
import { audioManager } from '../services/audio';

export default function Settings() {
  const {
    language,
    setLanguage,
    soundEnabled,
    setSoundEnabled,
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    user,
  } = useStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await api.auth.updateSettings({
          language,
          sound_enabled: soundEnabled,
          music_volume: musicVolume,
          sfx_volume: sfxVolume,
        });
      }
      audioManager.setEnabled(soundEnabled);
      audioManager.setMusicVolume(musicVolume);
      audioManager.setSfxVolume(sfxVolume);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-melonary-darker to-melonary-dark">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-melonary-gold hover:underline text-sm">
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold text-melonary-gold">
            {t('menu.settings', language)}
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="card space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t('settings.language', language)}
            </label>
            <div className="flex gap-2">
              {(['en', 'pt', 'es'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-2 rounded-lg transition ${
                    language === lang
                      ? 'bg-melonary-gold text-melonary-dark'
                      : 'bg-melonary-dark text-gray-400 hover:text-melonary-gold border border-melonary-gold/20'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'pt' ? 'Portugues' : 'Espanol'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t('settings.sound', language)}</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-14 h-8 rounded-full transition ${
                  soundEnabled ? 'bg-melonary-gold' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow transition transform ${
                    soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t('settings.music', language)}: {Math.round(musicVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              disabled={!soundEnabled}
              className="w-full accent-melonary-gold"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t('settings.sfx', language)}: {Math.round(sfxVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              disabled={!soundEnabled}
              className="w-full accent-melonary-gold"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-gold w-full"
          >
            {isSaving ? t('game.loading', language) : saved ? 'Saved!' : t('settings.save', language)}
          </button>
        </div>

        {user && (
          <div className="card mt-6">
            <h3 className="text-sm text-gray-400 mb-4">{t('menu.profile', language)}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Username</span>
                <span className="text-white">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('game.score', language)}</span>
                <span className="text-melonary-gold">{user.total_score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Games</span>
                <span className="text-white">{user.games_played}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Combo</span>
                <span className="text-white">{user.highest_combo}x</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
