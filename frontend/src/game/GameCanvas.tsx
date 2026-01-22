import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { api } from '../services/api';
import { audioManager } from '../services/audio';
import { t } from '../i18n/translations';

interface Motorcycle {
  id: number;
  lane: number;
  y: number;
  speed: number;
  type: 'normal' | 'fast' | 'armored';
  hit: boolean;
  falling: boolean;
  fallAngle: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

const LANE_COUNT = 5;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { language, game, setGameState } = useStore();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [playerLane, setPlayerLane] = useState(2);
  const [isKicking, setIsKicking] = useState(false);
  const [kickCooldown, setKickCooldown] = useState(false);
  const lastSpawnRef = useRef(0);
  const motoIdRef = useRef(0);
  const textIdRef = useRef(0);
  const animationRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());

  const getLaneX = (lane: number) => {
    const laneWidth = CANVAS_WIDTH / LANE_COUNT;
    return laneWidth * lane + laneWidth / 2;
  };

  const spawnMotorcycle = useCallback(() => {
    const maxMotos = Math.min(1 + Math.floor(game.phase / 2), 3);
    const motoCount = Math.floor(Math.random() * maxMotos) + 1;
    const usedLanes: number[] = [];

    for (let i = 0; i < motoCount; i++) {
      let lane: number;
      do {
        lane = Math.floor(Math.random() * LANE_COUNT);
      } while (usedLanes.includes(lane));
      usedLanes.push(lane);

      const types: Array<'normal' | 'fast' | 'armored'> = ['normal'];
      if (game.phase >= 2) types.push('fast');
      if (game.phase >= 4) types.push('armored');
      const type = types[Math.floor(Math.random() * types.length)];

      const baseSpeed = 2 + game.phase * 0.3;
      const speed = type === 'fast' ? baseSpeed * 1.3 : type === 'armored' ? baseSpeed * 0.7 : baseSpeed;

      const newMoto: Motorcycle = {
        id: motoIdRef.current++,
        lane,
        y: -100,
        speed,
        type,
        hit: false,
        falling: false,
        fallAngle: 0,
      };

      setMotorcycles((prev) => [...prev, newMoto]);
    }
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
    if (!game.isPlaying || game.isPaused || kickCooldown || !game.sessionId) return;

    setIsKicking(true);
    setKickCooldown(true);
    audioManager.playSound('kick');

    const playerY = CANVAS_HEIGHT - 150;
    const kickRange = 120;

    const targetMoto = motorcycles.find(
      (m) => !m.hit && !m.falling && m.lane === playerLane && m.y > playerY - kickRange && m.y < playerY + 50
    );

    let timing: 'miss' | 'hit' | 'perfect' = 'miss';

    if (targetMoto) {
      const distFromPerfect = Math.abs(targetMoto.y - (playerY - 30));
      timing = distFromPerfect < 20 ? 'perfect' : 'hit';

      setMotorcycles((prev) =>
        prev.map((m) =>
          m.id === targetMoto.id ? { ...m, hit: true, falling: true } : m
        )
      );
    }

    try {
      const result = await api.game.kick({
        sessionId: game.sessionId,
        timing,
        enemyType: targetMoto?.type,
      }) as any;

      setGameState({
        score: result.totalScore,
        combo: result.combo,
        phase: result.currentPhase,
      });

      if (timing === 'perfect') {
        audioManager.playSound('perfect');
        addFloatingText(getLaneX(playerLane), playerY - 50, `${t('game.perfect', language)} +${result.pointsEarned}`, '#FFD700');
      } else if (timing === 'hit') {
        audioManager.playSound('hit');
        addFloatingText(getLaneX(playerLane), playerY - 50, `+${result.pointsEarned}`, '#00FF00');
      } else {
        audioManager.playSound('miss');
        addFloatingText(getLaneX(playerLane), playerY - 50, t('game.miss', language), '#FF4444');
      }

      if (result.phaseUp) {
        audioManager.playSound('phase_up');
        addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3, `${t('game.phase', language)} ${result.currentPhase}!`, '#FFD700');
      }
    } catch (error) {
      console.error('Kick error:', error);
    }

    setTimeout(() => setIsKicking(false), 200);
    setTimeout(() => setKickCooldown(false), 400);
  }, [game, motorcycles, playerLane, kickCooldown, language, setGameState, addFloatingText]);

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    setPlayerLane((prev) => {
      if (direction === 'left' && prev > 0) return prev - 1;
      if (direction === 'right' && prev < LANE_COUNT - 1) return prev + 1;
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code);
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        movePlayer('left');
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        movePlayer('right');
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleKick();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [movePlayer, handleKick]);

  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;

      if (Math.abs(diff) > 50) {
        movePlayer(diff > 0 ? 'right' : 'left');
      } else {
        handleKick();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [movePlayer, handleKick]);

  useEffect(() => {
    if (!game.isPlaying || game.isPaused) return;

    const gameLoop = () => {
      const now = Date.now();

      const spawnInterval = Math.max(1500 - game.phase * 100, 600);
      if (now - lastSpawnRef.current > spawnInterval) {
        spawnMotorcycle();
        lastSpawnRef.current = now;
      }

      setMotorcycles((prev) =>
        prev
          .map((m) => {
            if (m.falling) {
              return { ...m, y: m.y + m.speed, fallAngle: Math.min(m.fallAngle + 5, 90) };
            }
            return { ...m, y: m.y + m.speed };
          })
          .filter((m) => m.y < CANVAS_HEIGHT + 100)
      );

      setFloatingTexts((prev) => prev.filter((ft) => now - ft.createdAt < 1000));

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [game.isPlaying, game.isPaused, game.phase, spawnMotorcycle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawRoad(ctx);
      motorcycles.forEach((moto) => drawMotorcycle(ctx, moto));
      drawPlayer(ctx, playerLane, isKicking);
      floatingTexts.forEach((ft) => drawFloatingText(ctx, ft, Date.now()));

      requestAnimationFrame(render);
    };

    render();
  }, [motorcycles, playerLane, isKicking, floatingTexts]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-melonary-darker to-melonary-dark p-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-melonary-gold rounded-lg shadow-2xl"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      <div className="flex gap-4 mt-4 md:hidden">
        <button
          onTouchStart={() => movePlayer('left')}
          className="w-16 h-16 bg-melonary-gold/20 border-2 border-melonary-gold rounded-full flex items-center justify-center text-2xl text-melonary-gold active:bg-melonary-gold/40"
        >
          ←
        </button>
        <button
          onTouchStart={() => handleKick()}
          className="w-20 h-16 bg-melonary-gold border-2 border-melonary-amber rounded-full flex items-center justify-center text-sm font-bold text-melonary-dark active:bg-melonary-amber"
        >
          KICK!
        </button>
        <button
          onTouchStart={() => movePlayer('right')}
          className="w-16 h-16 bg-melonary-gold/20 border-2 border-melonary-gold rounded-full flex items-center justify-center text-2xl text-melonary-gold active:bg-melonary-gold/40"
        >
          →
        </button>
      </div>

      <div className="mt-4 text-center text-gray-400 text-xs">
        <span className="hidden md:block">← → para mover | ESPAÇO para voadora</span>
        <span className="md:hidden">Deslize para mover | Toque para voadora</span>
      </div>
    </div>
  );
}

function drawRoad(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.3, '#2d2d44');
  gradient.addColorStop(1, '#3d3d5c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(10, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - 10, 0);
  ctx.lineTo(CANVAS_WIDTH - 10, CANVAS_HEIGHT);
  ctx.stroke();

  const laneWidth = CANVAS_WIDTH / LANE_COUNT;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([30, 20]);
  for (let i = 1; i < LANE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, CANVAS_HEIGHT);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (let i = 0; i < 10; i++) {
    const y = (Date.now() / 20 + i * 80) % CANVAS_HEIGHT;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, y, CANVAS_WIDTH, 2);
  }
}

function drawMotorcycle(ctx: CanvasRenderingContext2D, moto: Motorcycle) {
  const x = (CANVAS_WIDTH / LANE_COUNT) * moto.lane + (CANVAS_WIDTH / LANE_COUNT) / 2;
  const y = moto.y;

  ctx.save();
  
  if (moto.falling) {
    ctx.translate(x, y);
    ctx.rotate((moto.fallAngle * Math.PI) / 180);
    ctx.translate(-x, -y);
    ctx.globalAlpha = 1 - moto.fallAngle / 90;
  }

  const scale = 0.5 + (y / CANVAS_HEIGHT) * 0.5;
  const width = 50 * scale;
  const height = 70 * scale;

  const colors = {
    normal: { body: '#333', accent: '#666' },
    fast: { body: '#8B0000', accent: '#FF4500' },
    armored: { body: '#2F4F4F', accent: '#708090' },
  };
  const color = colors[moto.type];

  ctx.fillStyle = color.body;
  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, height / 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(x - width / 4, y + height / 4, width / 5, width / 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width / 4, y + height / 4, width / 5, width / 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFE4B5';
  ctx.beginPath();
  ctx.arc(x, y - height / 3, width / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color.accent;
  ctx.beginPath();
  ctx.ellipse(x, y - height / 2.5, width / 3, width / 5, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.ellipse(x - width / 5, y + height / 2.5, width / 8, width / 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width / 5, y + height / 2.5, width / 8, width / 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, lane: number, isKicking: boolean) {
  const x = (CANVAS_WIDTH / LANE_COUNT) * lane + (CANVAS_WIDTH / LANE_COUNT) / 2;
  const y = CANVAS_HEIGHT - 120;

  ctx.save();

  if (isKicking) {
    ctx.translate(x, y);
    ctx.rotate(-0.3);
    ctx.translate(-x, -y);
  }

  ctx.fillStyle = '#D2691E';
  ctx.beginPath();
  ctx.ellipse(x, y, 35, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(x, y + 5, 30, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D2691E';
  ctx.beginPath();
  ctx.ellipse(x, y - 50, 28, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(x, y - 48, 24, 21, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D2691E';
  ctx.beginPath();
  ctx.ellipse(x - 20, y - 65, 8, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 20, y - 65, 8, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x - 18, y - 55, 12, 6);
  ctx.fillRect(x + 6, y - 55, 12, 6);
  
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.ellipse(x, y - 42, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (isKicking) {
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(x + 40, y - 30, 12, 25, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x + 42, y - 28, 10, 20, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('POW!', x + 50, y - 50);
  }

  ctx.restore();
}

function drawFloatingText(ctx: CanvasRenderingContext2D, ft: FloatingText, now: number) {
  const age = now - ft.createdAt;
  const progress = age / 1000;
  const alpha = 1 - progress;
  const yOffset = progress * 50;

  ctx.globalAlpha = alpha;
  ctx.fillStyle = ft.color;
  ctx.font = 'bold 18px "Press Start 2P", cursive';
  ctx.textAlign = 'center';
  ctx.fillText(ft.text, ft.x, ft.y - yOffset);
  ctx.globalAlpha = 1;
}
