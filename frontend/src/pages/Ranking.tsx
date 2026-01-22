import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t } from '../i18n/translations';
import { ContractBanner, SolanaLogo } from '../components/TokenFooter';

interface RankingEntry {
  position: number;
  user_id: string;
  username: string;
  score: number;
  phase: number;
}

export default function Ranking() {
  const { language, user } = useStore();
  const [tab, setTab] = useState<'global' | 'weekly'>('global');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      try {
        const data = await (tab === 'global'
          ? api.game.getRankingGlobal(100)
          : api.game.getRankingWeekly(100)) as RankingEntry[];
        setRanking(data);
      } catch (error) {
        console.error('Failed to fetch ranking:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRanking();
  }, [tab]);

  const getRankBadge = (position: number) => {
    if (position === 1) return 'rank-1';
    if (position === 2) return 'rank-2';
    if (position === 3) return 'rank-3';
    return 'bg-gray-800 text-gray-400';
  };

  return (
    <div className="bg-page flex flex-col p-4 safe-top safe-bottom">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-6">
          <Link to="/" className="btn-ghost text-yellow-500 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <h1 className="font-game text-lg text-glow-gold" style={{ color: '#FFD700' }}>
            {t('menu.ranking', language)}
          </h1>
          <SolanaLogo size={36} />
        </header>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setTab('global')}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${tab === 'global' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('ranking.global', language)}
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${tab === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('ranking.weekly', language)}
          </button>
        </div>

        <div className="card flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Nenhum jogador ainda</div>
          ) : (
            <div className="space-y-2">
              <div className="flex text-xs text-gray-500 px-2 pb-3 border-b border-gray-800">
                <div className="w-12 text-center">#</div>
                <div className="flex-1">Jogador</div>
                <div className="w-24 text-right">Pontos</div>
              </div>
              
              <div className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-1">
                {ranking.map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center px-2 py-3 rounded-xl transition-all ${
                      entry.user_id === user?.id 
                        ? 'card-highlight' 
                        : 'hover:bg-gray-800/50'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-12 flex justify-center">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${getRankBadge(entry.position)}`}>
                        {entry.position}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black text-xs font-bold">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-white font-medium text-sm">{entry.username}</span>
                        {entry.user_id === user?.id && (
                          <span className="badge badge-gold text-[10px] ml-2 py-0.5 px-1.5">voce</span>
                        )}
                        <p className="text-xs text-gray-500">Fase {entry.phase}</p>
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <span className="font-bold text-yellow-400 text-glow-sm">
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <ContractBanner size="small" />
        </div>
      </div>
    </div>
  );
}
