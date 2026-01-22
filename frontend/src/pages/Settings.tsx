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
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)' }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-yellow-500 hover:text-yellow-300 text-sm font-bold transition-colors">
            &larr; Voltar
          </Link>
          <h1 className="text-2xl font-black" style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255, 215, 0, 0.4)' }}>
            {t('menu.settings', language)}
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="rounded-2xl border-2 border-yellow-500/20 p-6 space-y-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div>
            <label className="block text-sm text-gray-400 mb-3">
              {t('settings.language', language)}
            </label>
            <div className="flex gap-2">
              {(['en', 'pt', 'es'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
                    language === lang
                      ? 'text-black'
                      : 'text-yellow-400 border-2 border-yellow-500/30 hover:border-yellow-500/60'
                  }`}
                  style={language === lang ? { background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)' } : { background: 'rgba(0,0,0,0.4)' }}
                >
                  {lang === 'en' ? 'EN' : lang === 'pt' ? 'PT' : 'ES'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-300">{t('settings.sound', language)}</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-16 h-9 rounded-full transition-all duration-300 relative"
              style={{ background: soundEnabled ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)' : '#333' }}
            >
              <div
                className="w-7 h-7 bg-white rounded-full shadow-lg absolute top-1 transition-all duration-300"
                style={{ left: soundEnabled ? '32px' : '4px' }}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">
              {t('settings.music', language)}: <span className="text-yellow-400">{Math.round(musicVolume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              disabled={!soundEnabled}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(90deg, #FFD700 0%, #FFD700 ${musicVolume * 100}%, #333 ${musicVolume * 100}%, #333 100%)` }}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-3">
              {t('settings.sfx', language)}: <span className="text-yellow-400">{Math.round(sfxVolume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              disabled={!soundEnabled}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(90deg, #FFD700 0%, #FFD700 ${sfxVolume * 100}%, #333 ${sfxVolume * 100}%, #333 100%)` }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ 
              background: saved ? 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)' : 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)', 
              color: '#1a1a2e',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
            }}
          >
            {isSaving ? t('game.loading', language) : saved ? 'Salvo!' : t('settings.save', language)}
          </button>
        </div>

        {user && (
          <div className="rounded-2xl border-2 border-yellow-500/20 p-6 mt-6" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <h3 className="text-sm text-gray-400 mb-4 font-bold">{t('menu.profile', language)}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                <span className="text-gray-500">Username</span>
                <span className="text-white font-bold">{user.username}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                <span className="text-gray-500">Email</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                <span className="text-gray-500">{t('game.score', language)}</span>
                <span className="text-yellow-400 font-black">{user.total_score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/30">
                <span className="text-gray-500">Partidas</span>
                <span className="text-white font-bold">{user.games_played}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Melhor Combo</span>
                <span className="text-orange-400 font-bold">{user.highest_combo}x</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
