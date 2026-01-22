import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '../hooks/useStore';

const playBark = () => {
  if (typeof window !== 'undefined' && window.AudioContext) {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }
};

interface Motorcycle {
  id: number;
  lane: number;
  y: number;
  speed: number;
  isFat: boolean;
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
  { name: 'Rio de Janeiro', bg: '/assets/road-rio.png' },
  { name: 'New York', bg: '/assets/road-newyork.png' },
  { name: 'Tokyo', bg: '/assets/road-tokyo.png' },
  { name: 'Paris', bg: '/assets/road-paris.png' },
  { name: 'Dubai', bg: '/assets/road-dubai.png' },
  { name: 'Los Angeles', bg: '/assets/road-losangeles.png' },
];

const MOTO_THIN_SPRITE = '/assets/moto-thin.png';
const MOTO_FAT_SPRITE = '/assets/moto-fat.png';
const DOG_SPRITE = '/assets/dog-topdown.png';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { game, setGameState } = useStore();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [playerLane, setPlayerLane] = useState(2);
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT - 150);
  const [facingRight, setFacingRight] = useState(true);
  const [isKicking, setIsKicking] = useState(false);
  const [kickCooldown, setKickCooldown] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const lastSpawnRef = useRef(0);
  const motoIdRef = useRef(0);
  const explosionIdRef = useRef(0);
  const textIdRef = useRef(0);
  const animationRef = useRef<number>();
  const scrollOffset = useRef(0);

  const dogImageRef = useRef<HTMLImageElement | null>(null);
  const motoThinImageRef = useRef<HTMLImageElement | null>(null);
  const motoFatImageRef = useRef<HTMLImageElement | null>(null);
  const bgImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = 3 + CITY_BACKGROUNDS.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        setImagesLoaded(true);
      }
    };

    const dogImg = new Image();
    dogImg.onload = checkAllLoaded;
    dogImg.onerror = checkAllLoaded;
    dogImg.src = DOG_SPRITE;
    dogImageRef.current = dogImg;

    const motoThinImg = new Image();
    motoThinImg.onload = checkAllLoaded;
    motoThinImg.onerror = checkAllLoaded;
    motoThinImg.src = MOTO_THIN_SPRITE;
    motoThinImageRef.current = motoThinImg;

    const motoFatImg = new Image();
    motoFatImg.onload = checkAllLoaded;
    motoFatImg.onerror = checkAllLoaded;
    motoFatImg.src = MOTO_FAT_SPRITE;
    motoFatImageRef.current = motoFatImg;

    CITY_BACKGROUNDS.forEach((city) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      img.src = city.bg;
      bgImagesRef.current.set(city.name, img);
    });
  }, []);

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
      maxFrames: 10,
    };
    setExplosions((prev) => [...prev, newExplosion]);

    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: ['#FF4500', '#FFD700', '#FFA500'][Math.floor(Math.random() * 3)],
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

      const baseSpeed = 2 + game.phase * 0.3;
      const isFat = Math.random() > 0.5;
      const speed = isFat ? baseSpeed * 0.8 : baseSpeed * 1.1;

      const newMoto: Motorcycle = {
        id: motoIdRef.current++,
        lane,
        y: -100,
        speed,
        isFat,
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

  const handleKick = useCallback(() => {
    if (kickCooldown || !game.isPlaying || game.isPaused) return;

    setIsKicking(true);
    setKickCooldown(true);

    const playerX = getLaneX(playerLane);

    setMotorcycles((prev) => {
      let newScore = game.score;
      let newCombo = game.combo;
      let hitAny = false;

      const updated = prev.map((m) => {
        if (m.hit || m.exploding) return m;

        const motoX = getLaneX(m.lane);
        const distance = Math.sqrt(
          Math.pow(motoX - playerX, 2) + Math.pow(m.y - playerY, 2)
        );

        if (distance < 80) {
          hitAny = true;
          newCombo++;
          const points = 100 * newCombo;
          newScore += points;

          createExplosion(motoX, m.y);
          addFloatingText(motoX, m.y, `+${points}`, '#FFD700');

          return { ...m, hit: true, exploding: true };
        }
        return m;
      });

      if (hitAny) {
        setGameState({ score: newScore, combo: newCombo });
      }

      return updated;
    });

    setTimeout(() => setIsKicking(false), 200);
    setTimeout(() => setKickCooldown(false), 400);
  }, [kickCooldown, game.isPlaying, game.isPaused, game.score, game.combo, playerLane, playerY, createExplosion, addFloatingText, setGameState]);

  const movePlayer = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (!game.isPlaying || game.isPaused) return;

    playBark();

    if (direction === 'left') {
      setPlayerLane((prev) => Math.max(0, prev - 1));
      setFacingRight(false);
    } else if (direction === 'right') {
      setPlayerLane((prev) => Math.min(LANE_COUNT - 1, prev + 1));
      setFacingRight(true);
    } else if (direction === 'up') {
      setPlayerY((prev) => Math.max(100, prev - 50));
    } else if (direction === 'down') {
      setPlayerY((prev) => Math.min(CANVAS_HEIGHT - 80, prev + 50));
    }
  }, [game.isPlaying, game.isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!game.isPlaying) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer('down');
          break;
        case ' ':
          e.preventDefault();
          handleKick();
          break;
        case 'Escape':
          setGameState({ isPaused: !game.isPaused });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.isPlaying, game.isPaused, movePlayer, handleKick, setGameState]);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) {
        handleKick();
      } else if (Math.abs(diffX) > Math.abs(diffY)) {
        movePlayer(diffX > 0 ? 'right' : 'left');
      } else {
        movePlayer(diffY > 0 ? 'down' : 'up');
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
      scrollOffset.current = (scrollOffset.current + 3) % CANVAS_HEIGHT;

      const spawnInterval = Math.max(1500 - game.phase * 100, 600);
      if (now - lastSpawnRef.current > spawnInterval) {
        spawnMotorcycle();
        lastSpawnRef.current = now;
      }

      setMotorcycles((prev) => {
        const updated = prev
          .map((m) => {
            if (m.exploding) {
              return { ...m, explosionFrame: m.explosionFrame + 1 };
            }
            return { ...m, y: m.y + m.speed };
          })
          .filter((m) => m.y < CANVAS_HEIGHT + 100 && (!m.exploding || m.explosionFrame < 15));

        const missed = prev.filter((m) => m.y >= CANVAS_HEIGHT && !m.hit && !m.exploding);
        if (missed.length > 0) {
          setGameState({ combo: 0 });
        }

        return updated;
      });

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
  }, [game.isPlaying, game.isPaused, game.phase, spawnMotorcycle, setGameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const bgImage = bgImagesRef.current.get(currentCity.name);
      drawBackground(ctx, bgImage, scrollOffset.current);
      drawLaneMarkers(ctx);
      
      motorcycles.filter(m => !m.exploding).forEach((moto) => {
        const motoImg = moto.isFat ? motoFatImageRef.current : motoThinImageRef.current;
        drawMotorcycle(ctx, moto, motoImg);
      });
      
      drawPlayer(ctx, playerLane, playerY, isKicking, facingRight, dogImageRef.current);
      explosions.forEach((exp) => drawExplosion(ctx, exp));
      particles.forEach((p) => drawParticle(ctx, p));
      floatingTexts.forEach((ft) => drawFloatingText(ctx, ft, Date.now()));
      drawHUD(ctx, currentCity.name, game.score, game.combo, game.phase);

      requestAnimationFrame(render);
    };

    render();
  }, [motorcycles, explosions, particles, playerLane, playerY, isKicking, facingRight, floatingTexts, currentCity, imagesLoaded, game.score, game.combo, game.phase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-melonary-darker to-melonary-dark p-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-melonary-gold rounded-lg shadow-2xl"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      <div className="flex gap-2 mt-4 md:hidden">
        <div className="flex flex-col gap-2">
          <button
            onTouchStart={() => movePlayer('up')}
            className="w-14 h-14 bg-melonary-gold/20 border-2 border-melonary-gold rounded-lg flex items-center justify-center text-xl text-melonary-gold active:bg-melonary-gold/40"
          >
            ↑
          </button>
          <button
            onTouchStart={() => movePlayer('down')}
            className="w-14 h-14 bg-melonary-gold/20 border-2 border-melonary-gold rounded-lg flex items-center justify-center text-xl text-melonary-gold active:bg-melonary-gold/40"
          >
            ↓
          </button>
        </div>
        <button
          onTouchStart={() => movePlayer('left')}
          className="w-14 h-14 bg-melonary-gold/20 border-2 border-melonary-gold rounded-lg flex items-center justify-center text-xl text-melonary-gold active:bg-melonary-gold/40 self-center"
        >
          ←
        </button>
        <button
          onTouchStart={() => handleKick()}
          className="w-16 h-16 bg-melonary-gold border-2 border-melonary-amber rounded-full flex items-center justify-center text-xs font-bold text-melonary-dark active:bg-melonary-amber self-center"
        >
          KICK!
        </button>
        <button
          onTouchStart={() => movePlayer('right')}
          className="w-14 h-14 bg-melonary-gold/20 border-2 border-melonary-gold rounded-lg flex items-center justify-center text-xl text-melonary-gold active:bg-melonary-gold/40 self-center"
        >
          →
        </button>
      </div>

      <div className="mt-4 text-center text-gray-400 text-xs">
        <span className="hidden md:block">WASD/Setas = mover | ESPACO = voadora</span>
        <span className="md:hidden">Deslize = mover | Toque = voadora</span>
      </div>
    </div>
  );
}

function drawBackground(ctx: CanvasRenderingContext2D, bgImage: HTMLImageElement | undefined, scroll: number) {
  if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    const imgHeight = (CANVAS_WIDTH / bgImage.naturalWidth) * bgImage.naturalHeight;
    const y1 = (scroll % imgHeight) - imgHeight;
    const y2 = y1 + imgHeight;
    const y3 = y2 + imgHeight;
    
    ctx.drawImage(bgImage, 0, y1, CANVAS_WIDTH, imgHeight);
    ctx.drawImage(bgImage, 0, y2, CANVAS_WIDTH, imgHeight);
    if (y3 < CANVAS_HEIGHT) {
      ctx.drawImage(bgImage, 0, y3, CANVAS_WIDTH, imgHeight);
    }
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.5, '#2d1b4e');
    gradient.addColorStop(1, '#4a2c6e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.fillStyle = 'rgba(40, 40, 50, 0.9)';
    ctx.fillRect(20, 0, CANVAS_WIDTH - 40, CANVAS_HEIGHT);
  }
}

function drawLaneMarkers(ctx: CanvasRenderingContext2D) {
  const laneWidth = CANVAS_WIDTH / LANE_COUNT;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  
  for (let i = 1; i < LANE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneWidth, 0);
    ctx.lineTo(i * laneWidth, CANVAS_HEIGHT);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawMotorcycle(ctx: CanvasRenderingContext2D, moto: Motorcycle, motoImage: HTMLImageElement | null) {
  const x = (CANVAS_WIDTH / LANE_COUNT) * moto.lane + (CANVAS_WIDTH / LANE_COUNT) / 2;
  const y = moto.y;

  const scale = 0.4 + (y / CANVAS_HEIGHT) * 0.5;
  const width = 70 * scale;
  const height = 90 * scale;

  if (motoImage && motoImage.complete && motoImage.naturalWidth > 0) {
    ctx.save();
    ctx.drawImage(
      motoImage,
      x - width / 2,
      y - height / 2,
      width,
      height
    );
    ctx.restore();
  } else {
    ctx.fillStyle = moto.isFat ? '#444' : '#333';
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2.5, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#CC0000';
    ctx.fillRect(x - width / 4, y - height / 3, width / 2, height / 4);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, lane: number, y: number, isKicking: boolean, facingRight: boolean, dogImage: HTMLImageElement | null) {
  const x = (CANVAS_WIDTH / LANE_COUNT) * lane + (CANVAS_WIDTH / LANE_COUNT) / 2;
  const width = 80;
  const height = 100;

  ctx.save();
  
  ctx.translate(x, y);
  
  if (!facingRight) {
    ctx.scale(-1, 1);
  }
  
  if (isKicking) {
    ctx.rotate(0.3);
  }

  if (dogImage && dogImage.complete && dogImage.naturalWidth > 0) {
    ctx.drawImage(
      dogImage,
      -width / 2,
      -height / 2,
      width,
      height
    );
  } else {
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 5, 25, 32, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawExplosion(ctx: CanvasRenderingContext2D, exp: Explosion) {
  const progress = exp.frame / exp.maxFrames;
  const size = 40 + progress * 60;
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
  ctx.font = 'bold 28px Impact';
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

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ft.color;
  ctx.font = 'bold 20px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.strokeText(ft.text, ft.x, ft.y - yOffset);
  ctx.fillText(ft.text, ft.x, ft.y - yOffset);
  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, cityName: string, score: number, combo: number, phase: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 50);
  
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(cityName, 10, 20);
  
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 14px Arial';
  ctx.fillText(`FASE ${phase}`, 10, 38);
  
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(`${score}`, CANVAS_WIDTH - 10, 20);
  
  if (combo > 1) {
    ctx.fillStyle = '#FF6347';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`x${combo} COMBO!`, CANVAS_WIDTH - 10, 38);
  }
}
