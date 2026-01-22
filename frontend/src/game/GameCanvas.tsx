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
  lane: number;
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

const LANE_COUNT = 5;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

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
  const [playerLane, setPlayerLane] = useState(2);
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT - 150);
  const [facingRight, setFacingRight] = useState(true);
  const [isKicking, setIsKicking] = useState(false);
  const [kickCooldown, setKickCooldown] = useState(false);
  
  const lastSpawnRef = useRef(0);
  const motoIdRef = useRef(0);
  const textIdRef = useRef(0);
  const scrollRef = useRef(0);
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

  const getLaneX = (lane: number) => (CANVAS_WIDTH / LANE_COUNT) * lane + (CANVAS_WIDTH / LANE_COUNT) / 2;

  const spawnMotorcycle = useCallback(() => {
    const maxMotos = Math.min(1 + Math.floor(game.phase / 2), 3);
    const count = Math.floor(Math.random() * maxMotos) + 1;
    const usedLanes: number[] = [];

    for (let i = 0; i < count; i++) {
      let lane: number;
      do { lane = Math.floor(Math.random() * LANE_COUNT); } while (usedLanes.includes(lane));
      usedLanes.push(lane);

      const isFat = Math.random() > 0.5;
      const baseSpeed = 2 + game.phase * 0.25;
      
      setMotorcycles(prev => [...prev, {
        id: motoIdRef.current++,
        lane,
        y: -80,
        speed: isFat ? baseSpeed * 0.85 : baseSpeed,
        isFat,
        hit: false,
      }]);
    }
  }, [game.phase]);

  const handleKick = useCallback(() => {
    if (kickCooldown || !game.isPlaying || game.isPaused) return;

    setIsKicking(true);
    setKickCooldown(true);

    const playerX = getLaneX(playerLane);

    setMotorcycles(prev => {
      let newScore = game.score;
      let newCombo = game.combo;
      let hitAny = false;

      const updated = prev.map(m => {
        if (m.hit) return m;
        const motoX = getLaneX(m.lane);
        const dist = Math.sqrt((motoX - playerX) ** 2 + (m.y - playerY) ** 2);

        if (dist < 70) {
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
  }, [kickCooldown, game.isPlaying, game.isPaused, game.score, game.combo, playerLane, playerY, setGameState]);

  const movePlayer = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (!game.isPlaying || game.isPaused) return;
    playBark();

    if (dir === 'left') { setPlayerLane(p => Math.max(0, p - 1)); setFacingRight(false); }
    else if (dir === 'right') { setPlayerLane(p => Math.min(LANE_COUNT - 1, p + 1)); setFacingRight(true); }
    else if (dir === 'up') setPlayerY(p => Math.max(80, p - 40));
    else if (dir === 'down') setPlayerY(p => Math.min(CANVAS_HEIGHT - 60, p + 40));
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
      scrollRef.current = (scrollRef.current + 2) % 1000;

      if (prevCityRef.current !== currentCityIndex) {
        transitionRef.current = 1;
        prevCityRef.current = currentCityIndex;
      }
      if (transitionRef.current > 0) transitionRef.current -= 0.02;

      const interval = Math.max(1200 - game.phase * 80, 500);
      if (now - lastSpawnRef.current > interval) {
        spawnMotorcycle();
        lastSpawnRef.current = now;
      }

      setMotorcycles(prev => {
        const updated = prev.map(m => ({ ...m, y: m.y + m.speed })).filter(m => m.y < CANVAS_HEIGHT + 50 && !m.hit);
        const missed = prev.filter(m => m.y >= CANVAS_HEIGHT && !m.hit);
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
        const h = (CANVAS_WIDTH / bgImg.naturalWidth) * bgImg.naturalHeight;
        const y1 = (scrollRef.current % h) - h;
        ctx.drawImage(bgImg, 0, y1, CANVAS_WIDTH, h);
        ctx.drawImage(bgImg, 0, y1 + h, CANVAS_WIDTH, h);
        if (y1 + h * 2 < CANVAS_HEIGHT) ctx.drawImage(bgImg, 0, y1 + h * 2, CANVAS_WIDTH, h);
      } else {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      if (transitionRef.current > 0) {
        ctx.fillStyle = `rgba(0,0,0,${transitionRef.current * 0.5})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      const laneW = CANVAS_WIDTH / LANE_COUNT;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([15, 10]);
      for (let i = 1; i < LANE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneW, 0);
        ctx.lineTo(i * laneW, CANVAS_HEIGHT);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      motorcycles.forEach(m => {
        const x = getLaneX(m.lane);
        const scale = 0.35 + (m.y / CANVAS_HEIGHT) * 0.45;
        const w = 60 * scale, h = 75 * scale;
        const img = m.isFat ? motoFatImg.current : motoThinImg.current;
        if (img?.complete) ctx.drawImage(img, x - w / 2, m.y - h / 2, w, h);
        else {
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.ellipse(x, m.y, w / 2.5, h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const px = getLaneX(playerLane);
      ctx.save();
      ctx.translate(px, playerY);
      if (!facingRight) ctx.scale(-1, 1);
      if (isKicking) ctx.rotate(0.25);
      const pw = 70, ph = 85;
      if (dogImg.current?.complete) ctx.drawImage(dogImg.current, -pw / 2, -ph / 2, pw, ph);
      else {
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 35, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      texts.forEach(t => {
        const alpha = 1 - t.frame / 30;
        const yOff = t.frame * 1.5;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y - yOff);
        ctx.globalAlpha = 1;
      });

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 40);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(currentCity.name, 8, 16);
      ctx.fillStyle = '#FFF';
      ctx.fillText(`FASE ${game.phase}`, 8, 32);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`${game.score}`, CANVAS_WIDTH - 8, 18);
      if (game.combo > 1) {
        ctx.fillStyle = '#FF6347';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`x${game.combo}`, CANVAS_WIDTH - 8, 32);
      }

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [motorcycles, texts, playerLane, playerY, isKicking, facingRight, currentCityIndex, currentCity.name, game.score, game.combo, game.phase]);

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
