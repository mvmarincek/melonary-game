import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '../hooks/useStore';

const playBark = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
};

const playScream = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

interface Motorcycle {
  id: number;
  lane: 0 | 1;
  y: number;
  speed: number;
  isFat: boolean;
  hit: boolean;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  frame: number;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;
const LANE_LEFT_X = 130;
const LANE_RIGHT_X = 270;
const MOTO_SIZE = 65;
const DOG_SIZE = 70;

const CITIES = [
  { name: 'Rio de Janeiro', bg: '/assets/road-rio.png' },
  { name: 'New York', bg: '/assets/road-newyork.png' },
  { name: 'Tokyo', bg: '/assets/road-tokyo.png' },
  { name: 'Paris', bg: '/assets/road-paris.png' },
  { name: 'Dubai', bg: '/assets/road-dubai.png' },
  { name: 'Los Angeles', bg: '/assets/road-losangeles.png' },
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { game, setGameState } = useStore();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [texts, setTexts] = useState<FloatingText[]>([]);
  const [playerX, setPlayerX] = useState(CANVAS_WIDTH / 2);
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT - 120);
  const [facingRight, setFacingRight] = useState(true);
  const [isKicking, setIsKicking] = useState(false);
  const [kickCooldown, setKickCooldown] = useState(false);
  
  const lastSpawnRef = useRef(0);
  const motoIdRef = useRef(0);
  const textIdRef = useRef(0);
  const transitionRef = useRef(0);
  const prevCityRef = useRef(0);
  
  const dogImg = useRef<HTMLImageElement | null>(null);
  const motoThinImg = useRef<HTMLImageElement | null>(null);
  const motoFatImg = useRef<HTMLImageElement | null>(null);
  const bgImgs = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const dog = new Image();
    dog.src = '/assets/dog-final.png';
    dogImg.current = dog;

    const thin = new Image();
    thin.src = '/assets/moto-thin-final.png';
    motoThinImg.current = thin;

    const fat = new Image();
    fat.src = '/assets/moto-fat-final.png';
    motoFatImg.current = fat;

    CITIES.forEach((city, i) => {
      const img = new Image();
      img.src = city.bg;
      bgImgs.current[i] = img;
    });
  }, []);

  const currentCityIndex = (game.phase - 1) % CITIES.length;
  const currentCity = CITIES[currentCityIndex];

  const getLaneX = (lane: 0 | 1) => lane === 0 ? LANE_LEFT_X : LANE_RIGHT_X;

  const spawnMotorcycle = useCallback(() => {
    const lane: 0 | 1 = Math.random() > 0.5 ? 0 : 1;
    const isFat = Math.random() > 0.5;
    const baseSpeed = 2.5 + game.phase * 0.2;
    const speed = isFat ? baseSpeed * 0.85 : baseSpeed;
    
    const startY = lane === 0 ? -60 : CANVAS_HEIGHT + 60;
    
    setMotorcycles(prev => [...prev, {
      id: motoIdRef.current++,
      lane,
      y: startY,
      speed: lane === 0 ? speed : -speed,
      isFat,
      hit: false,
    }]);
  }, [game.phase]);

  const handleKick = useCallback(() => {
    if (kickCooldown || !game.isPlaying || game.isPaused) return;

    setIsKicking(true);
    setKickCooldown(true);

    setMotorcycles(prev => {
      let newScore = game.score;
      let newCombo = game.combo;
      let hitAny = false;

      const updated = prev.map(m => {
        if (m.hit) return m;
        const motoX = getLaneX(m.lane);
        const dist = Math.sqrt((motoX - playerX) ** 2 + (m.y - playerY) ** 2);

        if (dist < 60) {
          hitAny = true;
          newCombo++;
          const points = 100 * newCombo;
          newScore += points;
          playScream();
          
          setTexts(t => [...t, { id: textIdRef.current++, x: motoX, y: m.y, text: `+${points}`, frame: 0 }]);
          return { ...m, hit: true };
        }
        return m;
      });

      if (hitAny) setGameState({ score: newScore, combo: newCombo });
      return updated;
    });

    setTimeout(() => setIsKicking(false), 150);
    setTimeout(() => setKickCooldown(false), 300);
  }, [kickCooldown, game.isPlaying, game.isPaused, game.score, game.combo, playerX, playerY, setGameState]);

  const movePlayer = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (!game.isPlaying || game.isPaused) return;
    playBark();

    const step = 30;
    if (dir === 'left') {
      setPlayerX(p => Math.max(40, p - step));
      setFacingRight(false);
    } else if (dir === 'right') {
      setPlayerX(p => Math.min(CANVAS_WIDTH - 40, p + step));
      setFacingRight(true);
    } else if (dir === 'up') {
      setPlayerY(p => Math.max(60, p - step));
    } else if (dir === 'down') {
      setPlayerY(p => Math.min(CANVAS_HEIGHT - 60, p + step));
    }
  }, [game.isPlaying, game.isPaused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!game.isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') movePlayer('left');
      else if (e.key === 'ArrowRight' || e.key === 'd') movePlayer('right');
      else if (e.key === 'ArrowUp' || e.key === 'w') movePlayer('up');
      else if (e.key === 'ArrowDown' || e.key === 's') movePlayer('down');
      else if (e.key === ' ') { e.preventDefault(); handleKick(); }
      else if (e.key === 'Escape') setGameState({ isPaused: !game.isPaused });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game.isPlaying, game.isPaused, movePlayer, handleKick, setGameState]);

  useEffect(() => {
    let startX = 0, startY = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 25 && Math.abs(dy) < 25) handleKick();
      else if (Math.abs(dx) > Math.abs(dy)) movePlayer(dx > 0 ? 'right' : 'left');
      else movePlayer(dy > 0 ? 'down' : 'up');
    };
    window.addEventListener('touchstart', onStart);
    window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd); };
  }, [movePlayer, handleKick]);

  useEffect(() => {
    if (!game.isPlaying || game.isPaused) return;

    let animId: number;
    const loop = () => {
      const now = Date.now();

      if (prevCityRef.current !== currentCityIndex) {
        transitionRef.current = 1;
        prevCityRef.current = currentCityIndex;
      }
      if (transitionRef.current > 0) transitionRef.current -= 0.02;

      const interval = Math.max(1000 - game.phase * 60, 400);
      if (now - lastSpawnRef.current > interval) {
        spawnMotorcycle();
        lastSpawnRef.current = now;
      }

      setMotorcycles(prev => {
        const updated = prev
          .map(m => ({ ...m, y: m.y + m.speed }))
          .filter(m => {
            if (m.hit) return false;
            if (m.lane === 0) return m.y < CANVAS_HEIGHT + 80;
            return m.y > -80;
          });
        
        const missed = prev.filter(m => {
          if (m.hit) return false;
          if (m.lane === 0) return m.y >= CANVAS_HEIGHT + 80;
          return m.y <= -80;
        });
        if (missed.length > 0) setGameState({ combo: 0 });
        
        return updated;
      });

      setTexts(prev => prev.map(t => ({ ...t, frame: t.frame + 1 })).filter(t => t.frame < 30));

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [game.isPlaying, game.isPaused, game.phase, currentCityIndex, spawnMotorcycle, setGameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const bgImg = bgImgs.current[currentCityIndex];
      if (bgImg?.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      ctx.fillStyle = 'rgba(40, 40, 50, 0.85)';
      ctx.fillRect(LANE_LEFT_X - 45, 0, 90, CANVAS_HEIGHT);
      ctx.fillRect(LANE_RIGHT_X - 45, 0, 90, CANVAS_HEIGHT);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(LANE_LEFT_X, 0);
      ctx.lineTo(LANE_LEFT_X, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(LANE_RIGHT_X, 0);
      ctx.lineTo(LANE_RIGHT_X, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 200, 0, 0.15)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('↓', LANE_LEFT_X, 25);
      ctx.fillText('↑', LANE_RIGHT_X, CANVAS_HEIGHT - 15);

      if (transitionRef.current > 0) {
        ctx.fillStyle = `rgba(0,0,0,${transitionRef.current * 0.6})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      motorcycles.forEach(m => {
        const x = getLaneX(m.lane);
        let scale: number;
        if (m.lane === 0) {
          scale = 0.6 + (m.y / CANVAS_HEIGHT) * 0.5;
        } else {
          scale = 1.1 - (m.y / CANVAS_HEIGHT) * 0.5;
        }
        const size = MOTO_SIZE * scale;
        const img = m.isFat ? motoFatImg.current : motoThinImg.current;
        
        ctx.save();
        ctx.translate(x, m.y);
        if (m.lane === 1) {
          ctx.rotate(Math.PI);
        }
        if (img?.complete) {
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.ellipse(0, 0, size / 3, size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      ctx.save();
      ctx.translate(playerX, playerY);
      if (!facingRight) ctx.scale(-1, 1);
      if (isKicking) ctx.rotate(0.3);
      if (dogImg.current?.complete) {
        ctx.drawImage(dogImg.current, -DOG_SIZE / 2, -DOG_SIZE / 2, DOG_SIZE, DOG_SIZE);
      } else {
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      texts.forEach(t => {
        const alpha = 1 - t.frame / 30;
        const yOff = t.frame * 1.5;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y - yOff);
        ctx.globalAlpha = 1;
      });

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 45);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(currentCity.name, 10, 18);
      ctx.fillStyle = '#FFF';
      ctx.fillText(`FASE ${game.phase}`, 10, 35);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${game.score}`, CANVAS_WIDTH - 10, 20);
      if (game.combo > 1) {
        ctx.fillStyle = '#FF6347';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`x${game.combo}`, CANVAS_WIDTH - 10, 36);
      }

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [motorcycles, texts, playerX, playerY, isKicking, facingRight, currentCityIndex, currentCity.name, game.score, game.combo, game.phase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-melonary-dark p-2">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-melonary-gold rounded-lg" style={{ maxWidth: '100%' }} />
      <div className="flex gap-2 mt-3 md:hidden">
        <div className="flex flex-col gap-1">
          <button onTouchStart={() => movePlayer('up')} className="w-12 h-12 bg-melonary-gold/20 border border-melonary-gold rounded text-lg text-melonary-gold">↑</button>
          <button onTouchStart={() => movePlayer('down')} className="w-12 h-12 bg-melonary-gold/20 border border-melonary-gold rounded text-lg text-melonary-gold">↓</button>
        </div>
        <button onTouchStart={() => movePlayer('left')} className="w-12 h-12 bg-melonary-gold/20 border border-melonary-gold rounded text-lg text-melonary-gold self-center">←</button>
        <button onTouchStart={() => handleKick()} className="w-14 h-14 bg-melonary-gold border border-melonary-amber rounded-full text-xs font-bold text-melonary-dark self-center">KICK</button>
        <button onTouchStart={() => movePlayer('right')} className="w-12 h-12 bg-melonary-gold/20 border border-melonary-gold rounded text-lg text-melonary-gold self-center">→</button>
      </div>
      <p className="mt-2 text-gray-500 text-xs">WASD/Setas = mover | Espaco = voadora</p>
    </div>
  );
}
