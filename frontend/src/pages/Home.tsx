import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { t } from '../i18n/translations';
import { ContractBanner, MelonaryLogo, SocialButtons } from '../components/TokenFooter';

export default function Home() {
  const { user, language, logout } = useStore();

  return (
    <div className="bg-page flex flex-col items-center justify-between p-4 safe-top safe-bottom relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <header className="relative z-10 w-full flex justify-end items-start pt-2">
        <SocialButtons />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-sm py-4">
        <div className="relative mb-4 w-full flex justify-center">
          <MelonaryLogo size={280} />
        </div>
        
        <p className="text-xl font-bold text-orange-400 mb-1">Flying Kick!</p>
        <p className="text-gray-500 text-sm text-center mb-6">Derrube os motoqueiros com voadoras!</p>

        {user && (
          <div className="card-highlight w-full mb-5 text-center animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-white font-bold">{user.username}</p>
                <p className="text-xs text-gray-400">Fase {user.current_phase}</p>
              </div>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">Score</span>
                <p className="text-yellow-400 font-bold text-glow-sm">{user.total_score.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Tokens</span>
                <p className="text-purple-400 font-bold">0</p>
              </div>
            </div>
          </div>
        )}

        <div className="w-full space-y-3">
          <Link to="/game" className="btn-primary w-full block text-center text-lg glow-gold">
            {t('menu.play', language)}
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link to="/ranking" className="btn-secondary text-center text-sm">
              {t('menu.ranking', language)}
            </Link>
            <Link to="/settings" className="btn-secondary text-center text-sm">
              {t('menu.settings', language)}
            </Link>
          </div>

          {user?.is_admin && (
            <Link to="/admin" className="btn-ghost w-full block text-center text-red-400 text-sm">
              Admin Panel
            </Link>
          )}

          {user ? (
            <button onClick={logout} className="btn-ghost w-full text-center text-sm">
              {t('auth.logout', language)}
            </button>
          ) : (
            <Link to="/auth" className="btn-ghost w-full block text-center text-yellow-500 text-sm">
              {t('auth.login', language)} / {t('auth.register', language)}
            </Link>
          )}
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-sm pb-2">
        <ContractBanner size="large" />
      </footer>
    </div>
  );
}
