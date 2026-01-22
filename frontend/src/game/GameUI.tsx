import { useStore } from '../hooks/useStore';
import { t } from '../i18n/translations';

interface GameUIProps {
  onPause: () => void;
  onQuit?: () => void;
}

export default function GameUI({ onPause }: GameUIProps) {
  const { game, language } = useStore();

  const getComboColor = () => {
    if (game.combo >= 15) return 'text-red-400';
    if (game.combo >= 10) return 'text-orange-400';
    if (game.combo >= 5) return 'text-yellow-400';
    return 'text-white';
  };

  return (
    <div className="absolute inset-0 pointer-events-none safe-top">
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start pointer-events-auto">
        <div className="glass rounded-xl p-3 min-w-[100px]">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Score</div>
          <div className="font-game text-xl sm:text-2xl text-yellow-400 text-glow-sm">
            {game.score.toLocaleString()}
          </div>
        </div>

        <div className="glass rounded-xl px-4 py-2 text-center">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">{t('game.phase', language)}</div>
          <div className="font-bold text-white text-sm">
            {t(`phase.${game.phase}`, language)}
          </div>
        </div>

        <button
          onClick={onPause}
          className="glass rounded-xl p-3 active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>
      </div>

      {game.combo > 1 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 animate-combo">
          <div className={`font-game text-2xl sm:text-3xl ${getComboColor()} drop-shadow-lg text-glow-sm`}>
            {game.combo}x COMBO!
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <div className="text-gray-500 text-xs animate-pulse">
          Toque para chutar
        </div>
      </div>
    </div>
  );
}
