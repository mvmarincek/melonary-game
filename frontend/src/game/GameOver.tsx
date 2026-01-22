import { useStore } from '../hooks/useStore';
import { t } from '../i18n/translations';

interface GameOverProps {
  finalScore: number;
  phaseReached: number;
  maxCombo: number;
  accuracy: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onQuit: () => void;
}

export default function GameOver({
  finalScore,
  phaseReached,
  maxCombo,
  accuracy,
  isNewRecord,
  onRestart,
  onQuit,
}: GameOverProps) {
  const { language } = useStore();

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.9)' }}>
      <div className="max-w-md w-full mx-4 text-center">
        <div className="rounded-2xl border-2 border-yellow-500/30 p-8" style={{ background: 'rgba(0,0,0,0.8)', boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)' }}>
          <h2 className="text-4xl font-black mb-6" style={{ color: '#FFD700', textShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}>
            {t('game.game_over', language)}
          </h2>

          {isNewRecord && (
            <div className="mb-6 py-3 rounded-xl text-xl font-bold text-green-400 animate-pulse" style={{ background: 'rgba(74, 222, 128, 0.1)', border: '2px solid rgba(74, 222, 128, 0.3)' }}>
              {t('game.new_record', language)}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
              <span className="text-gray-400">{t('game.score', language)}</span>
              <span className="text-3xl font-black text-yellow-400" style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>
                {finalScore.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
              <span className="text-gray-400">{t('game.phase', language)}</span>
              <span className="text-2xl font-bold text-white">{phaseReached}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-yellow-500/20">
              <span className="text-gray-400">Max {t('game.combo', language)}</span>
              <span className="text-2xl font-bold text-orange-400">{maxCombo}x</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">Precisao</span>
              <span className="text-2xl font-bold text-white">{accuracy}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={onRestart} 
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ 
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)', 
                color: '#1a1a2e',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
              }}
            >
              {t('game.restart', language)}
            </button>
            <button 
              onClick={onQuit} 
              className="w-full py-3 rounded-xl font-bold border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              {t('game.quit', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
