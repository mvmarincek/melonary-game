import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { t } from '../i18n/translations';

export default function Home() {
  const { user, language, logout } = useStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-melonary-darker to-melonary-dark">
      <div className="text-center mb-8">
        <div className="w-40 h-40 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-melonary-gold/20 rounded-full animate-pulse-gold"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-melonary-caramel to-melonary-bronze rounded-full flex items-center justify-center shadow-2xl">
            <svg viewBox="0 0 100 100" className="w-28 h-28">
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
        <h1 className="text-3xl sm:text-4xl font-bold text-melonary-gold drop-shadow-lg">
          MELONARY
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Flying Kick!</p>
      </div>

      {user && (
        <div className="mb-6 text-center">
          <p className="text-melonary-gold">
            {user.username}
          </p>
          <p className="text-gray-400 text-xs">
            {t('game.score', language)}: {user.total_score.toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link to="/game" className="btn-gold text-center text-lg">
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
          <button onClick={logout} className="text-gray-400 text-sm hover:text-melonary-gold">
            {t('auth.logout', language)}
          </button>
        ) : (
          <Link to="/auth" className="text-gray-400 text-sm text-center hover:text-melonary-gold">
            {t('auth.login', language)}
          </Link>
        )}
      </div>

      <div className="mt-8 text-center text-gray-500 text-xs">
        <p>Tap to kick the bikers!</p>
      </div>
    </div>
  );
}
