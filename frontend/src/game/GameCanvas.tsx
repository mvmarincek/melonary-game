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
  exploding: boolean;
  explosionFrame: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  createdAt: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

const LANE_COUNT = 5;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

const CITY_BACKGROUNDS = [
  { name: 'Rio de Janeiro', colors: ['#1a0a2e', '#2d1b4e', '#4a2c6e'], landmarks: 'cristo' },
  { name: 'New York', colors: ['#0a1628', '#1a2a4a', '#2a3a5a'], landmarks: 'empire' },
  { name: 'Tokyo', colors: ['#1a0a1a', '#2e1a3e', '#4a2a5e'], landmarks: 'tower' },
  { name: 'Paris', colors: ['#1a1a2e', '#2a2a4e', '#3a3a5e'], landmarks: 'eiffel' },
  { name: 'Dubai', colors: ['#2a1a0a', '#4a3a1a', '#6a5a2a'], landmarks: 'burj' },
  { name: 'Los Angeles', colors: ['#1a1a1a', '#2a2a3a', '#3a3a4a'], landmarks: 'hollywood' },
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { language, game, setGameState } = useStore();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [playerLane, setPlayerLane] = useState(2);
  const [isKicking, setIsKicking] = useState(false);
  const [kickCooldown, setKickCooldown] = useState(false);
  const lastSpawnRef = useRef(0);
  const motoIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const textIdRef = useRef(0);
  const animationRef = useRef<number>();
  const scrollOffset = useRef(0);

  const currentCity = CITY_BACKGROUNDS[(game.phase - 1) % CITY_BACKGROUNDS.length];

  const getLaneX = (lane: number) => {
    const laneWidth = CANVAS_WIDTH / LANE_COUNT;
    return laneWidth * lane + laneWidth / 2;
  };

  const createExplosion = useCallback((x: number, y: number) => {
    const newExplosion: Explosion = {
      id: explosionIdRef.current++,
      x,
      y,
      frame: 0,
      maxFrames: 15,
    };
    setExplosions((prev) => [...prev, newExplosion]);

    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 3 + Math.random() * 5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: ['#FF4500', '#FFD700', '#FF6347', '#FFA500', '#FF0000'][Math.floor(Math.random() * 5)],
        life: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

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
        exploding: false,
        explosionFrame: 0,
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
      (m) => !m.hit && !m.exploding && m.lane === playerLane && m.y > playerY - kickRange && m.y < playerY + 50
    );

    let timing: 'miss' | 'hit' | 'perfect' = 'miss';

    if (targetMoto) {
      const distFromPerfect = Math.abs(targetMoto.y - (playerY - 30));
      timing = distFromPerfect < 20 ? 'perfect' : 'hit';

      const motoX = getLaneX(targetMoto.lane);
      createExplosion(motoX, targetMoto.y);

      setMotorcycles((prev) =>
        prev.map((m) =>
          m.id === targetMoto.id ? { ...m, hit: true, exploding: true } : m
        )
      );

      audioManager.playSound('hit');
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
  }, [game, motorcycles, playerLane, kickCooldown, language, setGameState, addFloatingText, createExplosion]);

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    setPlayerLane((prev) => {
      if (direction === 'left' && prev > 0) return prev - 1;
      if (direction === 'right' && prev < LANE_COUNT - 1) return prev + 1;
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      scrollOffset.current = (scrollOffset.current + 2) % 100;

      const spawnInterval = Math.max(1500 - game.phase * 100, 600);
      if (now - lastSpawnRef.current > spawnInterval) {
        spawnMotorcycle();
        lastSpawnRef.current = now;
      }

      setMotorcycles((prev) =>
        prev
          .map((m) => {
            if (m.exploding) {
              return { ...m, explosionFrame: m.explosionFrame + 1 };
            }
            return { ...m, y: m.y + m.speed };
          })
          .filter((m) => m.y < CANVAS_HEIGHT + 100 && (!m.exploding || m.explosionFrame < 15))
      );

      setExplosions((prev) =>
        prev
          .map((e) => ({ ...e, frame: e.frame + 1 }))
          .filter((e) => e.frame < e.maxFrames)
      );

      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2,
            life: p.life - 0.03,
          }))
          .filter((p) => p.life > 0)
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

      drawCityBackground(ctx, currentCity, scrollOffset.current);
      drawRoad(ctx, scrollOffset.current);
      motorcycles.filter(m => !m.exploding).forEach((moto) => drawMotorcycle(ctx, moto));
      drawPlayer(ctx, playerLane, isKicking);
      explosions.forEach((exp) => drawExplosion(ctx, exp));
      particles.forEach((p) => drawParticle(ctx, p));
      floatingTexts.forEach((ft) => drawFloatingText(ctx, ft, Date.now()));
      drawCityName(ctx, currentCity.name);

      requestAnimationFrame(render);
    };

    render();
  }, [motorcycles, explosions, particles, playerLane, isKicking, floatingTexts, currentCity]);

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
        <span className="hidden md:block">← → mover | ESPACO voadora</span>
        <span className="md:hidden">Deslize = mover | Toque = voadora</span>
      </div>
    </div>
  );
}

function drawCityBackground(ctx: CanvasRenderingContext2D, city: typeof CITY_BACKGROUNDS[0], scroll: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, city.colors[0]);
  gradient.addColorStop(0.5, city.colors[1]);
  gradient.addColorStop(1, city.colors[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
  for (let i = 0; i < 50; i++) {
    const x = (i * 47 + scroll) % CANVAS_WIDTH;
    const y = (i * 31) % 200;
    ctx.fillRect(x, y, 2, 2);
  }

  drawLandmarks(ctx, city.landmarks);
  drawBuildings(ctx);
}

function drawLandmarks(ctx: CanvasRenderingContext2D, type: string) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;

  switch (type) {
    case 'cristo':
      ctx.beginPath();
      ctx.moveTo(350, 80);
      ctx.lineTo(350, 40);
      ctx.lineTo(320, 55);
      ctx.moveTo(350, 40);
      ctx.lineTo(380, 55);
      ctx.stroke();
      break;
    case 'empire':
      ctx.fillRect(340, 30, 30, 100);
      ctx.fillRect(348, 10, 14, 20);
      break;
    case 'tower':
      ctx.beginPath();
      ctx.moveTo(360, 120);
      ctx.lineTo(340, 120);
      ctx.lineTo(350, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(345, 25, 10, 15);
      break;
    case 'eiffel':
      ctx.beginPath();
      ctx.moveTo(350, 120);
      ctx.lineTo(330, 120);
      ctx.lineTo(340, 20);
      ctx.lineTo(350, 20);
      ctx.lineTo(360, 120);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'burj':
      ctx.fillRect(355, 10, 10, 130);
      ctx.beginPath();
      ctx.moveTo(360, 10);
      ctx.lineTo(355, 25);
      ctx.lineTo(365, 25);
      ctx.closePath();
      ctx.fill();
      break;
    case 'hollywood':
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '12px Arial';
      ctx.fillText('HOLLYWOOD', 300, 60);
      break;
  }
}

function drawBuildings(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  
  for (let i = 0; i < 8; i++) {
    const x = i * 55 - 10;
    const height = 80 + Math.sin(i * 1.5) * 40;
    const width = 40 + Math.cos(i) * 10;
    ctx.fillRect(x, 150 - height, width, height);
    
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    for (let w = 0; w < 3; w++) {
      for (let h = 0; h < 5; h++) {
        if (Math.random() > 0.3) {
          ctx.fillRect(x + 5 + w * 12, 155 - height + h * 15, 6, 8);
        }
      }
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  }
}

function drawRoad(ctx: CanvasRenderingContext2D, scroll: number) {
  ctx.fillStyle = 'rgba(30, 30, 40, 0.9)';
  ctx.fillRect(0, 150, CANVAS_WIDTH, CANVAS_HEIGHT - 150);

  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(15, 150);
  ctx.lineTo(15, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - 15, 150);
  ctx.lineTo(CANVAS_WIDTH - 15, CANVAS_HEIGHT);
  ctx.stroke();

  const laneWidth = CANVAS_WIDTH / LANE_COUNT;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([30, 20]);
  for (let i = 1; i < LANE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 150);
    ctx.lineTo(i * laneWidth, CANVAS_HEIGHT);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (let i = 0; i < 15; i++) {
    const y = ((scroll * 3 + i * 50) % (CANVAS_HEIGHT - 150)) + 150;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + (y / CANVAS_HEIGHT) * 0.1})`;
    ctx.fillRect(20, y, CANVAS_WIDTH - 40, 2);
  }
}

function drawMotorcycle(ctx: CanvasRenderingContext2D, moto: Motorcycle) {
  const x = (CANVAS_WIDTH / LANE_COUNT) * moto.lane + (CANVAS_WIDTH / LANE_COUNT) / 2;
  const y = moto.y;

  const scale = 0.4 + (y / CANVAS_HEIGHT) * 0.6;
  const width = 50 * scale;
  const height = 70 * scale;

  const colors = {
    normal: { body: '#333', accent: '#666', light: '#888' },
    fast: { body: '#8B0000', accent: '#FF4500', light: '#FF6347' },
    armored: { body: '#2F4F4F', accent: '#708090', light: '#778899' },
  };
  const color = colors[moto.type];

  ctx.fillStyle = color.body;
  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, height / 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(x - width / 4, y + height / 4, width / 5, width / 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width / 4, y + height / 4, width / 5, width / 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color.accent;
  ctx.beginPath();
  ctx.arc(x, y - height / 3, width / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(x, y - height / 2.3, width / 3, width / 5, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FF0000';
  ctx.shadowColor = '#FF0000';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(x - width / 5, y + height / 2.2, width / 8, width / 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width / 5, y + height / 2.2, width / 8, width / 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
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
    ctx.ellipse(x + 45, y - 35, 12, 25, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x + 47, y - 33, 10, 20, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawExplosion(ctx: CanvasRenderingContext2D, exp: Explosion) {
  const progress = exp.frame / exp.maxFrames;
  const size = 30 + progress * 50;
  const alpha = 1 - progress;

  ctx.save();
  ctx.globalAlpha = alpha;

  const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, size);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.2, '#FFFF00');
  gradient.addColorStop(0.4, '#FFA500');
  gradient.addColorStop(0.6, '#FF4500');
  gradient.addColorStop(0.8, '#FF0000');
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 24px Impact';
  ctx.textAlign = 'center';
  if (exp.frame < 8) {
    const texts = ['POW!', 'BOOM!', 'BAM!', 'CRASH!'];
    ctx.fillText(texts[exp.id % texts.length], exp.x, exp.y - size - 10);
  }

  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = p.life;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
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

function drawCityName(ctx: CanvasRenderingContext2D, name: string) {
  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(name, 25, 170);
}
