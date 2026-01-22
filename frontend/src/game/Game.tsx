import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { audioManager } from '../services/audio';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import GameOver from './GameOver';
import { t } from '../i18n/translations';

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
        score: 0,
        combo: 0,
        phase: 1,
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

  const pauseGame = () => {
    setGameState({ isPaused: true });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-melonary-darker to-melonary-dark">
        <div className="card max-w-md w-full mx-4 text-center">
          <h1 className="text-2xl font-bold text-melonary-gold mb-8">
            {t('game.title', language)}
          </h1>

          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-melonary-caramel rounded-full flex items-center justify-center mb-4 animate-float">
              <span className="text-6xl">MELONARY</span>
            </div>
            <p className="text-gray-400 text-sm">
              {t('game.tap_to_kick', language)}
            </p>
          </div>

          <button
            onClick={startGame}
            disabled={isLoading}
            className="btn-gold text-xl w-full mb-4"
          >
            {isLoading ? t('game.loading', language) : t('game.start', language)}
          </button>

          <button onClick={() => navigate('/')} className="btn-outline w-full">
            {t('game.quit', language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <GameCanvas />
      
      {game.isPlaying && !game.isPaused && (
        <GameUI onPause={pauseGame} onQuit={endGame} />
      )}

      {game.isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card max-w-sm w-full mx-4 text-center">
            <h2 className="text-2xl font-bold text-melonary-gold mb-6">
              {t('game.pause', language)}
            </h2>
            <div className="space-y-3">
              <button onClick={resumeGame} className="btn-gold w-full">
                {t('game.resume', language)}
              </button>
              <button onClick={endGame} className="btn-outline w-full">
                {t('game.quit', language)}
              </button>
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
