import { useStore } from '../hooks/useStore';

interface GameUIProps {
  onPause: () => void;
  onQuit?: () => void;
}

export default function GameUI({ onPause }: GameUIProps) {
  const { game } = useStore();

  const getComboStyle = () => {
    if (game.combo >= 30) return { color: '#FF2222', scale: 1.3 };
    if (game.combo >= 20) return { color: '#FF4444', scale: 1.2 };
    if (game.combo >= 10) return { color: '#FF8844', scale: 1.1 };
    if (game.combo >= 5) return { color: '#FFAA00', scale: 1.05 };
    return { color: '#FFD700', scale: 1 };
  };

  const comboStyle = getComboStyle();

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <button
        onClick={onPause}
        className="absolute top-[110px] right-3 glass rounded-full p-3 active:scale-90 transition-transform pointer-events-auto"
        style={{ boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}
      >
        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </button>

      {game.combo >= 3 && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ top: '140px' }}
        >
          <div 
            className="font-game text-center animate-combo"
            style={{ 
              color: comboStyle.color,
              fontSize: `${20 * comboStyle.scale}px`,
              textShadow: `0 0 20px ${comboStyle.color}, 0 2px 4px rgba(0,0,0,0.8)`,
              transform: `scale(${comboStyle.scale})`
            }}
          >
            {game.combo}x
            <span className="block text-xs mt-1 opacity-80">COMBO</span>
          </div>
        </div>
      )}

      {game.combo >= 10 && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none animate-pulse"
          style={{ top: '200px' }}
        >
          <span 
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ 
              background: 'rgba(255, 68, 68, 0.2)',
              color: '#FF6666',
              border: '1px solid rgba(255, 68, 68, 0.3)'
            }}
          >
            {game.combo >= 30 ? 'LENDARIO!' : game.combo >= 20 ? 'INSANO!' : 'EM CHAMAS!'}
          </span>
        </div>
      )}
    </div>
  );
}
