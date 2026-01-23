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
    <div className="min-h-screen bg-[#0D0D14] overflow-y-auto">
      <div className="min-h-screen flex flex-col p-4 pb-8">
        <header className="flex justify-between items-center mb-4">
          <Link to="/" className="text-yellow-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <MelonaryLogo size={40} />
        </header>

        <main className="flex-1 w-full max-w-sm mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-yellow-400 mb-1">MELONARY</h1>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? t('auth.login', language) : t('auth.register', language)}
            </p>
          </div>

          {error && (
            <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field text-sm"
                  placeholder="Seu nome"
                />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  pattern="[a-zA-Z0-9_]+"
                  className="input-field text-sm"
                  placeholder="Nome no jogo"
                />
              </>
            )}

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field text-sm"
              placeholder="seu@email.com"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input-field text-sm"
              placeholder="Senha (min 6 caracteres)"
            />

            {mode === 'register' && (
              <>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="input-field text-sm"
                >
                  <option value="en">English</option>
                  <option value="pt">Portugues</option>
                  <option value="es">Espanol</option>
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="x_username"
                    value={formData.x_username}
                    onChange={handleChange}
                    placeholder="@twitter"
                    className="input-field text-sm"
                  />
                  <input
                    type="text"
                    name="tiktok_username"
                    value={formData.tiktok_username}
                    onChange={handleChange}
                    placeholder="@tiktok"
                    className="input-field text-sm"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-black transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)' }}
            >
              {isLoading
                ? 'Carregando...'
                : mode === 'login'
                ? t('auth.login', language)
                : t('auth.register', language)}
            </button>
          </form>

          <div className="mt-4 text-center">
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
                className={`px-3 py-1.5 text-xs rounded-lg font-bold ${
                  language === lang
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
