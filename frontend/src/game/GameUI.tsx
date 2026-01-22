import { useStore } from '../hooks/useStore';

interface GameUIProps {
  onPause: () => void;
  onQuit?: () => void;
}

export default function GameUI({ onPause }: GameUIProps) {
  const { game } = useStore();

  const getComboColor = () => {
    if (game.combo >= 20) return 'text-red-400';
    if (game.combo >= 10) return 'text-orange-400';
    if (game.combo >= 5) return 'text-yellow-400';
    return 'text-white';
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <button
        onClick={onPause}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 glass rounded-xl p-2 sm:p-3 active:scale-95 transition-transform pointer-events-auto z-10"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </button>

      {game.combo > 1 && (
        <div className="absolute top-24 sm:top-28 left-1/2 -translate-x-1/2 animate-combo pointer-events-none">
          <div className={`font-game text-xl sm:text-2xl ${getComboColor()} drop-shadow-lg text-glow-sm`}>
            {game.combo}x COMBO!
          </div>
        </div>
      )}
    </div>
  );
}
