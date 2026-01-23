import { useStore } from '../hooks/useStore';

interface GameUIProps {
  onPause: () => void;
  onQuit?: () => void;
}

export default function GameUI({ onPause }: GameUIProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <button
        onClick={onPause}
        className="absolute top-3 right-3 glass rounded-full p-3 active:scale-90 transition-transform pointer-events-auto"
        style={{ boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}
      >
        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </button>
    </div>
  );
}
