import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t, Language } from '../i18n/translations';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-melonary-darker to-melonary-dark">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-melonary-gold mb-2">MELONARY</h1>
          <p className="text-gray-400 text-xs">
            {mode === 'login' ? t('auth.login', language) : t('auth.register', language)}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('auth.name', language)}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('auth.username', language)}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  pattern="[a-zA-Z0-9_]+"
                  className="input-field"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {t('auth.email', language)}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {t('auth.password', language)}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input-field"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('settings.language', language)}
                </label>
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

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('auth.x_user', language)} {t('auth.optional', language)}
                </label>
                <input
                  type="text"
                  name="x_username"
                  value={formData.x_username}
                  onChange={handleChange}
                  placeholder="@username"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {t('auth.tiktok_user', language)} {t('auth.optional', language)}
                </label>
                <input
                  type="text"
                  name="tiktok_username"
                  value={formData.tiktok_username}
                  onChange={handleChange}
                  placeholder="@username"
                  className="input-field"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gold w-full mt-6"
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
            className="text-melonary-gold text-sm hover:underline"
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
              className={`px-3 py-1 text-xs rounded ${
                language === lang
                  ? 'bg-melonary-gold text-melonary-dark'
                  : 'bg-melonary-dark text-gray-400 hover:text-melonary-gold'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
