import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { audioManager } from '../services/audio';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import GameOver from './GameOver';
import { t } from '../i18n/translations';
import { SolanaLogo, ContractBanner, StoreButton } from '../components/TokenFooter';

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
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)' }}>
        <div className="absolute top-4 right-4 z-20">
          <SolanaLogo size={50} />
        </div>

        <div className="max-w-md w-full mx-4 text-center">
          <div className="rounded-2xl border-2 border-yellow-500/20 p-8" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <h1 className="text-3xl font-black mb-8" style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255, 215, 0, 0.4)' }}>
              {t('game.title', language)}
            </h1>

            <div className="mb-8">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-yellow-500/50 mb-4" style={{ boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)' }}>
                <img 
                  src="/assets/dog-final.png" 
                  alt="Melonary"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-gray-400 text-sm">
                {t('game.tap_to_kick', language)}
              </p>
            </div>

            <button
              onClick={startGame}
              disabled={isLoading}
              className="w-full py-5 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 active:scale-95 mb-4"
              style={{ 
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)', 
                color: '#1a1a2e',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)'
              }}
            >
              {isLoading ? t('game.loading', language) : t('game.start', language)}
            </button>

            <button 
              onClick={() => navigate('/')} 
              className="w-full py-3 rounded-xl font-bold border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              {t('game.quit', language)}
            </button>

            <div className="mt-4">
              <ContractBanner size="small" />
            </div>
            <div className="flex justify-center mt-2">
              <StoreButton size="small" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container" style={{ background: '#0a0a0a' }}>
      <GameCanvas />
      
      {game.isPlaying && !game.isPaused && (
        <GameUI onPause={pauseGame} onQuit={endGame} />
      )}

      {game.isPaused && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="max-w-sm w-full mx-4 text-center">
            <div className="rounded-2xl border-2 border-yellow-500/20 p-8" style={{ background: 'rgba(0,0,0,0.8)' }}>
              <h2 className="text-3xl font-black mb-8" style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255, 215, 0, 0.4)' }}>
                {t('game.pause', language)}
              </h2>
              <div className="space-y-4">
                <button 
                  onClick={resumeGame} 
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ 
                    background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)', 
                    color: '#1a1a2e',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                  }}
                >
                  {t('game.resume', language)}
                </button>
                <button 
                  onClick={endGame} 
                  className="w-full py-3 rounded-xl font-bold border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
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
