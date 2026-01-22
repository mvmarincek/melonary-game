import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t } from '../i18n/translations';
import TokenFooter from '../components/TokenFooter';

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

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-yellow-500 hover:text-yellow-300 text-sm font-bold transition-colors">
            &larr; Voltar
          </Link>
          <h1 className="text-2xl font-black" style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255, 215, 0, 0.4)' }}>
            {t('menu.ranking', language)}
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
              tab === 'global'
                ? 'text-black'
                : 'text-yellow-400 border-2 border-yellow-500/30 hover:border-yellow-500/60'
            }`}
            style={tab === 'global' ? { background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)' } : { background: 'rgba(0,0,0,0.4)' }}
          >
            {t('ranking.global', language)}
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
              tab === 'weekly'
                ? 'text-black'
                : 'text-yellow-400 border-2 border-yellow-500/30 hover:border-yellow-500/60'
            }`}
            style={tab === 'weekly' ? { background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)' } : { background: 'rgba(0,0,0,0.4)' }}
          >
            {t('ranking.weekly', language)}
          </button>
        </div>

        <div className="rounded-2xl border-2 border-yellow-500/20 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          {isLoading ? (
            <div className="text-center py-12 text-yellow-500/60">
              {t('game.loading', language)}
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum jogador ainda
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex text-xs text-gray-500 px-3 pb-3 border-b border-yellow-500/20">
                <div className="w-14">#</div>
                <div className="flex-1">Jogador</div>
                <div className="w-28 text-right">Pontos</div>
              </div>

              {ranking.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                    entry.user_id === user?.id
                      ? 'border-2 border-yellow-500/50'
                      : 'hover:bg-white/5'
                  }`}
                  style={entry.user_id === user?.id ? { background: 'rgba(255, 215, 0, 0.1)' } : {}}
                >
                  <div className="w-14 font-black text-lg">
                    {entry.position === 1 ? (
                      <span className="text-yellow-400" style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.6)' }}>1st</span>
                    ) : entry.position === 2 ? (
                      <span className="text-gray-300">2nd</span>
                    ) : entry.position === 3 ? (
                      <span className="text-orange-400">3rd</span>
                    ) : (
                      <span className="text-gray-500">{entry.position}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-bold">{entry.username}</span>
                    {entry.user_id === user?.id && (
                      <span className="text-xs text-yellow-500 ml-2">(voce)</span>
                    )}
                  </div>
                  <div className="w-28 text-right font-black text-yellow-400">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-24"></div>
      </div>
      <TokenFooter />
    </div>
  );
}
