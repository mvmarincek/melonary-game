import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { audioManager } from '../services/audio';
import GameCanvas from './GameCanvas';
import GameOver from './GameOver';
import { t } from '../i18n/translations';
import { ContractBanner } from '../components/TokenFooter';

interface GameResults {
  finalScore: number;
  phaseReached: number;
  maxCombo: number;
  accuracy: number;
  newRecord: boolean;
}

export default function Game() {
  const navigate = useNavigate();
  const { game, setGameState, resetGame, language } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);

  const startGame = async () => {
    setIsLoading(true);
    try {
      const result = await api.game.start() as any;
      setGameState({
        sessionId: result.sessionId,
        score: game.savedScore,
        combo: 0,
        phase: game.savedPhase,
        isPlaying: true,
        isPaused: false,
      });
      audioManager.playMusic('game');
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resumeGame = () => {
    setGameState({ isPaused: false });
  };

  const endGame = async () => {
    if (!game.sessionId) return;

    try {
      const result = await api.game.end(game.sessionId) as any;
      setGameState({ isPlaying: false });
      audioManager.stopMusic();
      audioManager.playSound('game_over');
      setGameResults({
        finalScore: result.finalScore,
        phaseReached: result.phaseReached,
        maxCombo: result.maxCombo,
        accuracy: result.accuracy,
        newRecord: result.newRecord,
      });
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  };

  const restartGame = () => {
    setGameResults(null);
    resetGame();
    startGame();
  };

  const quitGame = () => {
    setGameResults(null);
    resetGame();
    audioManager.stopMusic();
    navigate('/');
  };

  if (!game.isPlaying && !gameResults) {
    return (
      <div className="bg-page flex flex-col items-center justify-center p-4 safe-top safe-bottom relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-br from-yellow-500/15 to-orange-500/10 rounded-full blur-3xl animate-pulse-glow" />
        </div>

        <header className="absolute top-4 left-4 z-20">
          <button onClick={() => navigate('/')} className="text-yellow-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('menu.back', language)}
          </button>
        </header>

        <main className="relative z-10 w-full max-w-sm text-center animate-slide-up">
          <div className="card p-6">
            <div className="mb-6">
              <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900" style={{ border: '3px solid #FFD700', boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)' }}>
                <img 
                  src="/assets/dog-final.png" 
                  alt="Melonary"
                  className="w-full h-full object-contain animate-float"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-gray-500 text-sm">
                {t('game.tap_to_kick', language)}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={startGame}
                disabled={isLoading}
                className="btn-primary w-full text-lg glow-gold disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    {t('game.loading', language)}
                  </span>
                ) : t('game.start', language)}
              </button>

              <button 
                onClick={() => navigate('/')} 
                className="btn-secondary w-full"
              >
                {t('game.quit', language)}
              </button>
            </div>

            <div className="mt-5">
              <ContractBanner size="small" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="game-container">
      <GameCanvas />

      {game.isPaused && (
        <div className="absolute inset-0 flex items-center justify-center z-50 glass-dark">
          <div className="w-full max-w-xs mx-4 text-center animate-slide-up">
            <div className="card p-6">
              <h2 className="font-game text-xl text-glow-gold mb-6" style={{ color: '#FFD700' }}>
                {t('game.pause', language)}
              </h2>
              <div className="space-y-3">
                <button 
                  onClick={resumeGame} 
                  className="btn-primary w-full glow-gold"
                >
                  {t('game.resume', language)}
                </button>
                <button 
                  onClick={endGame} 
                  className="btn-secondary w-full"
                >
                  {t('game.quit', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameResults && (
        <GameOver
          finalScore={gameResults.finalScore}
          phaseReached={gameResults.phaseReached}
          maxCombo={gameResults.maxCombo}
          accuracy={gameResults.accuracy}
          isNewRecord={gameResults.newRecord}
          onRestart={restartGame}
          onQuit={quitGame}
        />
      )}
    </div>
  );
}
