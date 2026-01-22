import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { t } from '../i18n/translations';

export default function Home() {
  const { user, language, logout } = useStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-melonary-darker to-melonary-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-melonary-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-melonary-amber rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-melonary-gold/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <img 
              src="/melonary-hero.png" 
              alt="Melonary"
              className="w-full h-full object-contain drop-shadow-2xl animate-float"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full bg-gradient-to-br from-melonary-caramel to-melonary-bronze rounded-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-32 h-32">
                <circle cx="50" cy="50" r="40" fill="#FFD700"/>
                <ellipse cx="35" cy="40" rx="6" ry="8" fill="#1a1a2e"/>
                <ellipse cx="65" cy="40" rx="6" ry="8" fill="#1a1a2e"/>
                <ellipse cx="50" cy="55" rx="10" ry="6" fill="#1a1a2e"/>
                <path d="M30 65 Q50 78 70 65" stroke="#1a1a2e" strokeWidth="3" fill="none"/>
                <rect x="28" y="32" width="16" height="6" rx="2" fill="#1a1a2e" transform="rotate(-10 36 35)"/>
                <rect x="56" y="32" width="16" height="6" rx="2" fill="#1a1a2e" transform="rotate(10 64 35)"/>
              </svg>
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-melonary-gold to-melonary-amber drop-shadow-lg mb-2">
          MELONARY
        </h1>
        <p className="text-melonary-gold/80 text-lg">Flying Kick!</p>
        <p className="text-gray-500 text-sm mt-2">Derrube os motoqueiros com voadoras!</p>
      </div>

      {user && (
        <div className="relative z-10 mb-6 text-center card bg-melonary-dark/50 px-6 py-3">
          <p className="text-melonary-gold font-bold">{user.username}</p>
          <p className="text-gray-400 text-xs">
            {t('game.score', language)}: {user.total_score.toLocaleString()} | Fase: {user.current_phase}
          </p>
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs">
        <Link to="/game" className="btn-gold text-center text-xl py-4 animate-pulse-gold">
          {t('menu.play', language)}
        </Link>

        <Link to="/ranking" className="btn-outline text-center">
          {t('menu.ranking', language)}
        </Link>

        <Link to="/settings" className="btn-outline text-center">
          {t('menu.settings', language)}
        </Link>

        {user?.is_admin && (
          <Link to="/admin" className="btn-outline text-center border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
            {t('menu.admin', language)}
          </Link>
        )}

        {user ? (
          <button onClick={logout} className="text-gray-400 text-sm hover:text-melonary-gold mt-2">
            {t('auth.logout', language)}
          </button>
        ) : (
          <Link to="/auth" className="text-melonary-gold text-sm text-center hover:underline mt-2">
            {t('auth.login', language)} / {t('auth.register', language)}
          </Link>
        )}
      </div>

      <div className="relative z-10 mt-12 text-center">
        <p className="text-gray-600 text-xs mb-2">Como jogar:</p>
        <div className="flex gap-4 text-gray-500 text-xs">
          <span>← → Mover</span>
          <span>|</span>
          <span>ESPACO Voadora</span>
        </div>
      </div>
    </div>
  );
}
