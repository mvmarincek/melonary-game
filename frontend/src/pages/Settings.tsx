import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t, Language } from '../i18n/translations';
import { audioManager } from '../services/audio';
import { ContractBanner, SolanaLogo } from '../components/TokenFooter';

export default function Settings() {
  const { language, setLanguage, soundEnabled, setSoundEnabled, musicVolume, setMusicVolume, sfxVolume, setSfxVolume, user } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await api.auth.updateSettings({ language, sound_enabled: soundEnabled, music_volume: musicVolume, sfx_volume: sfxVolume });
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
    <div className="bg-page flex flex-col p-4 safe-top safe-bottom">
      <div className="max-w-md mx-auto w-full">
        <header className="flex items-center justify-between mb-6">
          <Link to="/" className="btn-ghost text-yellow-500 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <h1 className="font-game text-lg text-glow-gold" style={{ color: '#FFD700' }}>
            {t('menu.settings', language)}
          </h1>
          <SolanaLogo size={36} />
        </header>

        <div className="space-y-4">
          <div className="card animate-slide-up">
            <h3 className="text-sm text-gray-400 mb-4 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {t('settings.language', language)}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['en', 'pt', 'es'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    language === lang 
                      ? 'btn-primary' 
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'pt' ? 'Portugues' : 'Espanol'}
                </button>
              ))}
            </div>
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-sm text-gray-400 mb-4 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              {t('settings.sound', language)}
            </h3>

            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-white font-medium">Ativar Som</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-14 h-8 rounded-full transition-all relative ${soundEnabled ? 'glow-gold' : ''}`}
                style={{ background: soundEnabled ? 'linear-gradient(90deg, #FFD700, #FFA500)' : '#2a2a3a' }}
              >
                <div 
                  className="w-6 h-6 bg-white rounded-full shadow-lg absolute top-1 transition-all duration-200" 
                  style={{ left: soundEnabled ? '28px' : '4px' }} 
                />
              </button>
            </div>

            <div className="py-4 border-b border-gray-800">
              <div className="flex justify-between mb-3">
                <span className="text-gray-400 text-sm">{t('settings.music', language)}</span>
                <span className="text-yellow-400 font-bold text-sm">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={musicVolume} 
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))} 
                disabled={!soundEnabled} 
                className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50" 
                style={{ background: `linear-gradient(90deg, #FFD700 0%, #FFD700 ${musicVolume * 100}%, #2a2a3a ${musicVolume * 100}%, #2a2a3a 100%)` }} 
              />
            </div>

            <div className="py-4">
              <div className="flex justify-between mb-3">
                <span className="text-gray-400 text-sm">{t('settings.sfx', language)}</span>
                <span className="text-yellow-400 font-bold text-sm">{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={sfxVolume} 
                onChange={(e) => setSfxVolume(parseFloat(e.target.value))} 
                disabled={!soundEnabled} 
                className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50" 
                style={{ background: `linear-gradient(90deg, #FFD700 0%, #FFD700 ${sfxVolume * 100}%, #2a2a3a ${sfxVolume * 100}%, #2a2a3a 100%)` }} 
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full mt-2 py-3 rounded-xl font-bold transition-all ${saved ? 'bg-green-500 text-white' : 'btn-primary'} disabled:opacity-50`}
            >
              {isSaving ? t('game.loading', language) : saved ? 'Salvo!' : t('settings.save', language)}
            </button>
          </div>

          {user && (
            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-sm text-gray-400 mb-4 font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('menu.profile', language)}
              </h3>
              
              <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
                <div className="avatar-ring">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black text-xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{user.username}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 rounded-xl bg-gray-800/50">
                  <p className="text-yellow-400 font-bold text-lg text-glow-sm">{user.total_score.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">Score</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-800/50">
                  <p className="text-white font-bold text-lg">{user.games_played}</p>
                  <p className="text-gray-500 text-xs">Partidas</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-gray-800/50">
                  <p className="text-orange-400 font-bold text-lg">{user.highest_combo}x</p>
                  <p className="text-gray-500 text-xs">Combo</p>
                </div>
              </div>
            </div>
          )}

          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <ContractBanner size="small" />
          </div>
        </div>
      </div>
    </div>
  );
}
