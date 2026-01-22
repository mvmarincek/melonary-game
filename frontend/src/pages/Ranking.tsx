import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { t } from '../i18n/translations';

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
    <div className="min-h-screen p-4 bg-gradient-to-b from-melonary-darker to-melonary-dark">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-melonary-gold hover:underline text-sm">
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold text-melonary-gold">
            {t('menu.ranking', language)}
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === 'global'
                ? 'bg-melonary-gold text-melonary-dark'
                : 'bg-melonary-dark text-gray-400 hover:text-melonary-gold'
            }`}
          >
            {t('ranking.global', language)}
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`flex-1 py-2 rounded-lg transition ${
              tab === 'weekly'
                ? 'bg-melonary-gold text-melonary-dark'
                : 'bg-melonary-dark text-gray-400 hover:text-melonary-gold'
            }`}
          >
            {t('ranking.weekly', language)}
          </button>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              {t('game.loading', language)}
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No players yet
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex text-xs text-gray-400 px-2 pb-2 border-b border-melonary-gold/20">
                <div className="w-12">{t('ranking.position', language)}</div>
                <div className="flex-1">{t('ranking.player', language)}</div>
                <div className="w-24 text-right">{t('ranking.score', language)}</div>
              </div>

              {ranking.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center px-2 py-2 rounded-lg ${
                    entry.user_id === user?.id
                      ? 'bg-melonary-gold/20 border border-melonary-gold/50'
                      : 'hover:bg-melonary-dark/50'
                  }`}
                >
                  <div className="w-12 font-bold">
                    {entry.position <= 3 ? (
                      <span className={
                        entry.position === 1 ? 'text-yellow-400' :
                        entry.position === 2 ? 'text-gray-300' :
                        'text-amber-600'
                      }>
                        #{entry.position}
                      </span>
                    ) : (
                      <span className="text-gray-400">#{entry.position}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-white">{entry.username}</span>
                    {entry.user_id === user?.id && (
                      <span className="text-xs text-melonary-gold ml-2">(you)</span>
                    )}
                  </div>
                  <div className="w-24 text-right font-bold text-melonary-gold">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
