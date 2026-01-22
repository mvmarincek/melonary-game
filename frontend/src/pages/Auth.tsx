import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t, Language } from '../i18n/translations';
import TokenFooter from '../components/TokenFooter';

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

  const inputStyle = "w-full px-4 py-3 rounded-xl border-2 border-yellow-500/30 bg-black/50 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <Link to="/" className="absolute -top-10 left-0 text-yellow-500 hover:text-yellow-300 text-sm font-bold transition-colors">
          &larr; Voltar
        </Link>

        <div className="rounded-2xl border-2 border-yellow-500/20 p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-3 border-yellow-500/50" style={{ boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)' }}>
              <img 
                src="/melonary-hero.png" 
                alt="Melonary"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full bg-gradient-to-br from-orange-400 to-yellow-600"></div>
            </div>
            <h1 className="text-3xl font-black mb-1" style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255, 215, 0, 0.4)' }}>
              MELONARY
            </h1>
            <p className="text-gray-400 text-sm">
              {mode === 'login' ? t('auth.login', language) : t('auth.register', language)}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
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
                    className={inputStyle}
                    placeholder="Seu nome completo"
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
                    className={inputStyle}
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
                className={inputStyle}
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
                className={inputStyle}
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
                    className={inputStyle}
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
                      className={inputStyle + " text-sm"}
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
                      className={inputStyle + " text-sm"}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 mt-6"
              style={{ 
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)', 
                color: '#1a1a2e',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
              }}
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
              className="text-yellow-500 text-sm hover:text-yellow-300 transition-colors"
            >
              {mode === 'login'
                ? t('auth.no_account', language)
                : t('auth.have_account', language)}
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {(['en', 'pt', 'es'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-2 text-xs rounded-lg font-bold transition-all ${
                  language === lang
                    ? 'text-black'
                    : 'text-yellow-400 border border-yellow-500/30 hover:border-yellow-500'
                }`}
                style={language === lang ? { background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)' } : { background: 'rgba(0,0,0,0.4)' }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <TokenFooter />
    </div>
  );
}
