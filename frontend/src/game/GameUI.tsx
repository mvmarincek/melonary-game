import { useStore } from '../hooks/useStore';
import { t } from '../i18n/translations';

interface GameUIProps {
  onPause: () => void;
  onQuit: () => void;
}

export default function GameUI({ onPause, onQuit }: GameUIProps) {
  const { game, language } = useStore();

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-auto">
        <div className="card bg-opacity-90 p-3">
          <div className="text-xs text-melonary-gold mb-1">{t('game.score', language)}</div>
          <div className="score-display text-2xl sm:text-3xl font-bold text-white">
            {game.score.toLocaleString()}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPause}
            className="card bg-opacity-90 p-3 hover:bg-melonary-gold/20 transition"
          >
            <svg className="w-6 h-6 text-melonary-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="card bg-opacity-90 p-2 px-4 text-center">
          <div className="text-xs text-melonary-gold">{t('game.phase', language)}</div>
          <div className="text-lg font-bold text-white">
            {t(`phase.${game.phase}`, language)}
          </div>
        </div>
      </div>

      {game.combo > 1 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 combo-text">
          <div className="text-2xl sm:text-4xl font-bold text-melonary-gold drop-shadow-lg">
            {game.combo}x {t('game.combo', language)}!
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <div className="text-melonary-gold/60 text-sm animate-pulse">
          {t('game.tap_to_kick', language)}
        </div>
      </div>
    </div>
  );
}
