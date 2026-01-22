import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { audioManager } from '../services/audio';
import { t } from '../i18n/translations';

interface Enemy {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: string;
  hit: boolean;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, language, game, setGameState, soundEnabled, sfxVolume } = useStore();
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [melonaryY, setMelonaryY] = useState(0);
  const [isKicking, setIsKicking] = useState(false);
  const lastSpawnRef = useRef(0);
  const enemyIdRef = useRef(0);
  const textIdRef = useRef(0);
  const animationRef = useRef<number>();

  const spawnEnemy = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const types = ['biker', 'fast_biker', 'armored_biker'];
    const type = types[Math.floor(Math.random() * Math.min(game.phase, types.length))];
    
    const baseSpeed = 3 + game.phase * 0.5;
    const speed = type === 'fast_biker' ? baseSpeed * 1.5 : baseSpeed;

    const newEnemy: Enemy = {
      id: enemyIdRef.current++,
      x: canvas.width + 100,
      y: canvas.height * 0.6 + Math.random() * 50 - 25,
      speed,
      type,
      hit: false,
    };

    setEnemies((prev) => [...prev, newEnemy]);
  }, [game.phase]);

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    const newText: FloatingText = {
      id: textIdRef.current++,
      x,
      y,
      text,
      color,
      createdAt: Date.now(),
    };
    setFloatingTexts((prev) => [...prev, newText]);
  }, []);

  const handleKick = useCallback(async () => {
    if (!game.isPlaying || game.isPaused || isKicking || !game.sessionId) return;

    setIsKicking(true);
    audioManager.playSound('kick');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const kickZoneStart = canvas.width * 0.2;
    const kickZoneEnd = canvas.width * 0.4;

    const targetEnemy = enemies.find(
      (e) => !e.hit && e.x >= kickZoneStart && e.x <= kickZoneEnd
    );

    let timing: 'miss' | 'hit' | 'perfect' = 'miss';
    
    if (targetEnemy) {
      const perfectZone = (kickZoneStart + kickZoneEnd) / 2;
      const distFromPerfect = Math.abs(targetEnemy.x - perfectZone);
      
      if (distFromPerfect < 30) {
        timing = 'perfect';
      } else {
        timing = 'hit';
      }

      setEnemies((prev) =>
        prev.map((e) => (e.id === targetEnemy.id ? { ...e, hit: true } : e))
      );
    }

    try {
      const result = await api.game.kick({
        sessionId: game.sessionId,
        timing,
        enemyType: targetEnemy?.type,
      }) as any;

      setGameState({
        score: result.totalScore,
        combo: result.combo,
        phase: result.currentPhase,
      });

      if (timing === 'perfect') {
        audioManager.playSound('perfect');
        addFloatingText(
          targetEnemy!.x,
          targetEnemy!.y - 30,
          `${t('game.perfect', language)} +${result.pointsEarned}`,
          '#FFD700'
        );
      } else if (timing === 'hit') {
        audioManager.playSound('hit');
        addFloatingText(
          targetEnemy!.x,
          targetEnemy!.y - 30,
          `${t('game.hit', language)} +${result.pointsEarned}`,
          '#00FF00'
        );
      } else {
        audioManager.playSound('miss');
        addFloatingText(
          canvas.width * 0.3,
          canvas.height * 0.5,
          t('game.miss', language),
          '#FF4444'
        );
      }

      if (result.comboBreak) {
        audioManager.playSound('miss');
      }

      if (result.phaseUp) {
        audioManager.playSound('phase_up');
        addFloatingText(
          canvas.width / 2,
          canvas.height / 3,
          `${t('game.phase', language)} ${result.currentPhase}!`,
          '#FFD700'
        );
      }
    } catch (error) {
      console.error('Kick error:', error);
    }

    setTimeout(() => setIsKicking(false), 200);
  }, [game, enemies, isKicking, language, setGameState, addFloatingText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setMelonaryY(canvas.height * 0.55);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (!game.isPlaying || game.isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const now = Date.now();

      const spawnInterval = Math.max(800 - game.phase * 50, 400);
      if (now - lastSpawnRef.current > spawnInterval) {
        spawnEnemy();
        lastSpawnRef.current = now;
      }

      setEnemies((prev) =>
        prev
          .map((e) => ({ ...e, x: e.x - e.speed }))
          .filter((e) => e.x > -100 && (!e.hit || e.x > -50))
      );

      setFloatingTexts((prev) =>
        prev.filter((ft) => now - ft.createdAt < 1000)
      );

      ctx.fillStyle = getPhaseBackground(game.phase);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGround(ctx, canvas);
      drawKickZone(ctx, canvas);
      drawMelonary(ctx, canvas, isKicking);
      enemies.forEach((enemy) => drawEnemy(ctx, enemy));
      floatingTexts.forEach((ft) => drawFloatingText(ctx, ft, now));

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [game.isPlaying, game.isPaused, game.phase, enemies, floatingTexts, isKicking, spawnEnemy]);

  useEffect(() => {
    const handleInput = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      handleKick();
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleKick();
      }
    };

    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', handleInput);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('mousedown', handleInput);
      window.removeEventListener('touchstart', handleInput);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKick]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      style={{ touchAction: 'none' }}
    />
  );
}

function getPhaseBackground(phase: number): string {
  const backgrounds: Record<number, string> = {
    1: '#2d1b0e',
    2: '#1a3a1a',
    3: '#1a1a3a',
    4: '#3a2a1a',
    5: '#0a0a1a',
    6: '#1a0a2a',
  };
  return backgrounds[phase] || backgrounds[1];
}

function drawGround(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const groundY = canvas.height * 0.7;
  
  ctx.fillStyle = '#333';
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.setLineDash([30, 20]);
  ctx.beginPath();
  ctx.moveTo(0, groundY + 30);
  ctx.lineTo(canvas.width, groundY + 30);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawKickZone(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const zoneStart = canvas.width * 0.2;
  const zoneEnd = canvas.width * 0.4;
  const groundY = canvas.height * 0.7;

  ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
  ctx.fillRect(zoneStart, 0, zoneEnd - zoneStart, groundY);

  ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(zoneStart, 0, zoneEnd - zoneStart, groundY);
}

function drawMelonary(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  isKicking: boolean
) {
  const x = canvas.width * 0.15;
  const y = canvas.height * 0.55;
  const size = 80;

  ctx.save();
  
  if (isKicking) {
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(Math.PI / 6);
    ctx.translate(-(x + size / 2), -(y + size / 2));
  }

  ctx.fillStyle = '#D2691E';
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size / 2, size / 2, size / 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size / 2.2, size / 2.3, size / 2.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x + size * 0.25, y + size * 0.3, size * 0.15, size * 0.08);
  ctx.fillRect(x + size * 0.55, y + size * 0.3, size * 0.15, size * 0.08);

  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size * 0.55, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isKicking) {
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(x + size * 1.1, y + size * 0.3, size * 0.15, size * 0.3, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('POW!', x + size * 1.2, y);
  }

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  const size = 70;

  if (enemy.hit) {
    ctx.globalAlpha = 0.5;
  }

  ctx.fillStyle = enemy.type === 'fast_biker' ? '#FF6600' : 
                   enemy.type === 'armored_biker' ? '#666666' : '#444444';
  
  ctx.fillRect(enemy.x, enemy.y + size * 0.3, size * 0.8, size * 0.4);

  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(enemy.x + size * 0.2, enemy.y + size * 0.8, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(enemy.x + size * 0.6, enemy.y + size * 0.8, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFE4B5';
  ctx.beginPath();
  ctx.arc(enemy.x + size * 0.4, enemy.y + size * 0.2, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(enemy.x + size * 0.4, enemy.y + size * 0.1, size * 0.25, size * 0.12, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function drawFloatingText(
  ctx: CanvasRenderingContext2D,
  ft: FloatingText,
  now: number
) {
  const age = now - ft.createdAt;
  const progress = age / 1000;
  const alpha = 1 - progress;
  const yOffset = progress * 50;

  ctx.globalAlpha = alpha;
  ctx.fillStyle = ft.color;
  ctx.font = 'bold 24px "Press Start 2P", cursive';
  ctx.textAlign = 'center';
  ctx.fillText(ft.text, ft.x, ft.y - yOffset);
  ctx.globalAlpha = 1;
}
