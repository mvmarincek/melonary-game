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
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="card max-w-md w-full mx-4 text-center animate-pulse-gold">
        <h2 className="text-3xl font-bold text-melonary-gold mb-6">
          {t('game.game_over', language)}
        </h2>

        {isNewRecord && (
          <div className="mb-4 text-xl text-green-400 animate-pulse">
            {t('game.new_record', language)}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center border-b border-melonary-gold/20 pb-2">
            <span className="text-gray-400">{t('game.score', language)}</span>
            <span className="text-2xl font-bold text-melonary-gold">
              {finalScore.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-melonary-gold/20 pb-2">
            <span className="text-gray-400">{t('game.phase', language)}</span>
            <span className="text-xl font-bold text-white">{phaseReached}</span>
          </div>

          <div className="flex justify-between items-center border-b border-melonary-gold/20 pb-2">
            <span className="text-gray-400">Max {t('game.combo', language)}</span>
            <span className="text-xl font-bold text-white">{maxCombo}x</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Accuracy</span>
            <span className="text-xl font-bold text-white">{accuracy}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={onRestart} className="btn-gold text-lg">
            {t('game.restart', language)}
          </button>
          <button onClick={onQuit} className="btn-outline">
            {t('game.quit', language)}
          </button>
        </div>
      </div>
    </div>
  );
}
