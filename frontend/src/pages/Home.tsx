import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { t } from '../i18n/translations';
import { ContractBanner, StoreButton, SolanaLogo } from '../components/TokenFooter';

export default function Home() {
  const { user, language, logout } = useStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <SolanaLogo size={60} />
      </div>

      <div className="relative z-10 text-center mb-6">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl scale-150"></div>
          <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-yellow-500/60" style={{ boxShadow: '0 0 40px rgba(255, 215, 0, 0.4)' }}>
            <img 
              src="/melonary-hero.png" 
              alt="Melonary"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full bg-gradient-to-br from-orange-400 to-yellow-600 flex items-center justify-center text-6xl">M</div>
          </div>
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-2" style={{ color: '#FFD700', textShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 4px 0 #b8860b' }}>
          MELONARY
        </h1>
        <p className="text-xl font-bold text-orange-400 mb-1">Flying Kick!</p>
        <p className="text-gray-400 text-sm">Derrube os motoqueiros com voadoras!</p>
      </div>

      {user && (
        <div className="relative z-10 mb-4 px-6 py-3 rounded-xl border-2 border-yellow-500/30" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <p className="text-yellow-400 font-bold">{user.username}</p>
          <p className="text-gray-400 text-xs">
            {t('game.score', language)}: <span className="text-yellow-500">{user.total_score.toLocaleString()}</span> | Fase: <span className="text-orange-400">{user.current_phase}</span>
          </p>
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs mb-6">
        <Link 
          to="/game" 
          className="text-center text-xl py-4 font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ 
            background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)', 
            color: '#1a1a2e',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)'
          }}
        >
          {t('menu.play', language)}
        </Link>

        <div className="flex gap-3">
          <Link 
            to="/ranking" 
            className="flex-1 text-center py-3 font-bold rounded-xl border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-all"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            {t('menu.ranking', language)}
          </Link>
          <Link 
            to="/settings" 
            className="flex-1 text-center py-3 font-bold rounded-xl border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-all"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            {t('menu.settings', language)}
          </Link>
        </div>

        {user?.is_admin && (
          <Link 
            to="/admin" 
            className="text-center py-2 font-bold rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all text-sm"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            Admin
          </Link>
        )}

        {user ? (
          <button onClick={logout} className="text-gray-500 text-sm hover:text-yellow-400 transition-colors">
            {t('auth.logout', language)}
          </button>
        ) : (
          <Link to="/auth" className="text-yellow-500 text-sm text-center hover:text-yellow-300 transition-colors">
            {t('auth.login', language)} / {t('auth.register', language)}
          </Link>
        )}
      </div>

      <div className="relative z-10 w-full max-w-md space-y-3">
        <ContractBanner size="large" />
        <div className="flex justify-center">
          <StoreButton size="normal" />
        </div>
      </div>

      <div className="relative z-10 mt-6 text-center">
        <div className="inline-flex gap-4 text-gray-500 text-xs px-4 py-2 rounded-lg border border-gray-700/50" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <span><span className="text-yellow-500/80">Setas</span> Mover</span>
          <span className="text-gray-600">|</span>
          <span><span className="text-yellow-500/80">ESPACO</span> Voadora</span>
        </div>
      </div>
    </div>
  );
}
