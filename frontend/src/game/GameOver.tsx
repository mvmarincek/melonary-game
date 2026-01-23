import { useStore } from '../hooks/useStore';
import { t } from '../i18n/translations';
import { ContractBanner } from '../components/TokenFooter';

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
    <div className="absolute inset-0 flex items-center justify-center z-50 glass-dark safe-top safe-bottom">
      <div className="w-full max-w-sm mx-4 text-center animate-slide-up">
        <div className="card p-6">
          <h2 className="font-game text-2xl text-glow-gold mb-4" style={{ color: '#FFD700' }}>
            {t('game.game_over', language)}
          </h2>

          {isNewRecord && (
            <div className="badge badge-gold text-sm py-2 px-4 mb-4 animate-pulse">
              {t('game.new_record', language)}
            </div>
          )}

          <div className="space-y-1 mb-6">
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400 text-sm">{t('game.score', language)}</span>
              <span className="font-game text-2xl text-yellow-400 text-glow-sm">
                {finalScore.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="text-center p-3 rounded-xl bg-gray-800/50">
                <p className="text-white font-bold text-lg">{phaseReached}</p>
                <p className="text-gray-500 text-xs">{t('game.phase', language)}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-800/50">
                <p className="text-orange-400 font-bold text-lg">{maxCombo}x</p>
                <p className="text-gray-500 text-xs">{t('game.combo', language)}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-800/50">
                <p className="text-white font-bold text-lg">{accuracy}%</p>
                <p className="text-gray-500 text-xs">{t('game.accuracy', language)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={onRestart} 
              className="btn-primary w-full glow-gold"
            >
              {t('game.restart', language)}
            </button>
            <button 
              onClick={onQuit} 
              className="btn-secondary w-full"
            >
              {t('game.quit', language)}
            </button>
          </div>

          <div className="mt-4">
            <ContractBanner size="small" />
          </div>
        </div>
      </div>
    </div>
  );
}
