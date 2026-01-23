import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t, Language } from '../i18n/translations';
import { MelonaryLogo } from '../components/TokenFooter';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const navigate = useNavigate();
  const { setUser, setToken, setLanguage, language } = useStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    language: 'en' as Language,
    x_username: '',
    tiktok_username: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result: any;

      if (mode === 'login') {
        result = await api.auth.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await api.auth.register({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          language: formData.language,
          x_username: formData.x_username || undefined,
          tiktok_username: formData.tiktok_username || undefined,
        });
      }

      setUser(result.user);
      setToken(result.token);
      setLanguage(result.user.language);
      navigate('/');
    } catch (err: any) {
      setError(t(err.message, language) || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="bg-page flex flex-col items-center p-4 safe-top safe-bottom relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 w-full flex justify-between items-center mb-6">
        <Link to="/" className="btn-ghost text-yellow-500 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <MelonaryLogo size={48} />
      </header>

      <main className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="card">
          <div className="text-center mb-6">
            <div className="avatar-ring w-16 h-16 mx-auto mb-4">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                <img 
                  src="/melonary-hero.png" 
                  alt="Melonary"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
            <h1 className="font-game text-xl text-glow-gold mb-1" style={{ color: '#FFD700' }}>
              MELONARY
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? t('auth.login', language) : t('auth.register', language)}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('auth.name', language)}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('auth.username', language)}</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    pattern="[a-zA-Z0-9_]+"
                    className="input-field"
                    placeholder="nome_no_jogo"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('auth.email', language)}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t('auth.password', language)}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-field"
                placeholder="******"
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('settings.language', language)}</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="en">English</option>
                    <option value="pt">Portugues</option>
                    <option value="es">Espanol</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">X (Twitter)</label>
                    <input
                      type="text"
                      name="x_username"
                      value={formData.x_username}
                      onChange={handleChange}
                      placeholder="@usuario"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">TikTok</label>
                    <input
                      type="text"
                      name="tiktok_username"
                      value={formData.tiktok_username}
                      onChange={handleChange}
                      placeholder="@usuario"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-center mt-6 disabled:opacity-50"
            >
              {isLoading
                ? t('game.loading', language)
                : mode === 'login'
                ? t('auth.login', language)
                : t('auth.register', language)}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-yellow-500 text-sm"
            >
              {mode === 'login'
                ? t('auth.no_account', language)
                : t('auth.have_account', language)}
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {(['en', 'pt', 'es'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-2 text-xs rounded-lg font-bold transition-all ${
                  language === lang
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
