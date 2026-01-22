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
const LANE_LEFT_X = 145;
const LANE_RIGHT_X = 255;
const SPRITE_SIZE = 60;

const PHASE_GOALS = [500, 1200, 2000, 3000, 4500, 6500];

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
  const [playerLane, setPlayerLane] = useState<0 | 1>(0);
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT - 100);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpFrame, setJumpFrame] = useState(0);
  const [kickCooldown, setKickCooldown] = useState(false);
  
  const lastSpawnRef = useRef(0);
  const motoIdRef = useRef(0);
  const textIdRef = useRef(0);
  const phaseScoreRef = useRef(0);
  
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
  const phaseGoal = PHASE_GOALS[Math.min(game.phase - 1, PHASE_GOALS.length - 1)];

  const getLaneX = (lane: 0 | 1) => lane === 0 ? LANE_LEFT_X : LANE_RIGHT_X;

  const spawnMotorcycle = useCallback(() => {
    const lane: 0 | 1 = Math.random() > 0.5 ? 0 : 1;
    const isFat = Math.random() > 0.5;
    const baseSpeed = 3 + game.phase * 0.3;
    const speed = isFat ? baseSpeed * 0.8 : baseSpeed;
    
    const startY = lane === 0 ? -50 : CANVAS_HEIGHT + 50;
    
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
    if (kickCooldown || !game.isPlaying || game.isPaused || isJumping) return;

    setIsJumping(true);
    setJumpFrame(0);
    setKickCooldown(true);
    playBark();

    const playerX = getLaneX(playerLane);

    setMotorcycles(prev => {
      let newScore = game.score;
      let newCombo = game.combo;
      let hitAny = false;

      const updated = prev.map(m => {
        if (m.hit) return m;
        if (m.lane !== playerLane) return m;
        
        const dist = Math.abs(m.y - playerY);

        if (dist < 70) {
          hitAny = true;
          newCombo++;
          const points = 100 * newCombo;
          newScore += points;
          phaseScoreRef.current += points;
          playScream();
          
          setTexts(t => [...t, { id: textIdRef.current++, x: playerX, y: m.y, text: `+${points}`, frame: 0 }]);
          return { ...m, hit: true };
        }
        return m;
      });

      if (hitAny) {
        setGameState({ score: newScore, combo: newCombo });
        
        if (phaseScoreRef.current >= phaseGoal) {
          phaseScoreRef.current = 0;
          setGameState({ phase: game.phase + 1 });
        }
      }
      return updated;
    });

    setTimeout(() => {
      setIsJumping(false);
      setKickCooldown(false);
    }, 400);
  }, [kickCooldown, game.isPlaying, game.isPaused, game.score, game.combo, game.phase, playerLane, playerY, isJumping, phaseGoal, setGameState]);

  const switchLane = useCallback(() => {
    if (!game.isPlaying || game.isPaused) return;
    setPlayerLane(prev => prev === 0 ? 1 : 0);
  }, [game.isPlaying, game.isPaused]);

  const moveVertical = useCallback((dir: 'up' | 'down') => {
    if (!game.isPlaying || game.isPaused) return;
    const step = 40;
    if (dir === 'up') setPlayerY(p => Math.max(80, p - step));
    else setPlayerY(p => Math.min(CANVAS_HEIGHT - 60, p + step));
  }, [game.isPlaying, game.isPaused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!game.isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd') switchLane();
      else if (e.key === 'ArrowUp' || e.key === 'w') moveVertical('up');
      else if (e.key === 'ArrowDown' || e.key === 's') moveVertical('down');
      else if (e.key === ' ') { e.preventDefault(); handleKick(); }
      else if (e.key === 'Escape') setGameState({ isPaused: !game.isPaused });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game.isPlaying, game.isPaused, switchLane, moveVertical, handleKick, setGameState]);

  useEffect(() => {
    let startX = 0, startY = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 25 && Math.abs(dy) < 25) handleKick();
      else if (Math.abs(dx) > Math.abs(dy)) switchLane();
      else moveVertical(dy > 0 ? 'down' : 'up');
    };
    window.addEventListener('touchstart', onStart);
    window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd); };
  }, [switchLane, moveVertical, handleKick]);

  useEffect(() => {
    if (isJumping) {
      const interval = setInterval(() => {
        setJumpFrame(f => f + 1);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isJumping]);

  useEffect(() => {
    if (!game.isPlaying || game.isPaused) return;

    let animId: number;
    const loop = () => {
      const now = Date.now();

      const interval = Math.max(800 - game.phase * 50, 350);
      if (now - lastSpawnRef.current > interval) {
        spawnMotorcycle();
        lastSpawnRef.current = now;
      }

      setMotorcycles(prev => {
        const updated = prev
          .map(m => ({ ...m, y: m.y + m.speed }))
          .filter(m => {
            if (m.hit) return false;
            if (m.lane === 0) return m.y < CANVAS_HEIGHT + 60;
            return m.y > -60;
          });
        
        const missed = prev.filter(m => {
          if (m.hit) return false;
          if (m.lane === 0) return m.y >= CANVAS_HEIGHT + 60;
          return m.y <= -60;
        });
        if (missed.length > 0) setGameState({ combo: 0 });
        
        return updated;
      });

      setTexts(prev => prev.map(t => ({ ...t, frame: t.frame + 1 })).filter(t => t.frame < 25));

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [game.isPlaying, game.isPaused, game.phase, spawnMotorcycle, setGameState]);

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

      ctx.fillStyle = 'rgba(30, 30, 40, 0.7)';
      ctx.fillRect(LANE_LEFT_X - 35, 50, 70, CANVAS_HEIGHT - 50);
      ctx.fillRect(LANE_RIGHT_X - 35, 50, 70, CANVAS_HEIGHT - 50);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 10]);
      [LANE_LEFT_X, LANE_RIGHT_X].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 50);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('↓', LANE_LEFT_X, 70);
      ctx.fillText('↑', LANE_RIGHT_X, CANVAS_HEIGHT - 10);

      motorcycles.forEach(m => {
        const x = getLaneX(m.lane);
        let scale: number;
        if (m.lane === 0) {
          scale = 0.7 + (m.y / CANVAS_HEIGHT) * 0.4;
        } else {
          scale = 1.1 - (m.y / CANVAS_HEIGHT) * 0.4;
        }
        const size = SPRITE_SIZE * scale;
        const img = m.isFat ? motoFatImg.current : motoThinImg.current;
        
        ctx.save();
        ctx.translate(x, m.y);
        if (m.lane === 1) ctx.rotate(Math.PI);
        if (img?.complete) {
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
          ctx.fillStyle = '#444';
          ctx.fillRect(-size / 3, -size / 2, size / 1.5, size);
        }
        ctx.restore();
      });

      const playerX = getLaneX(playerLane);
      let drawY = playerY;
      let rotation = 0;
      
      if (isJumping) {
        const jumpProgress = jumpFrame / 12;
        const jumpHeight = Math.sin(jumpProgress * Math.PI) * 50;
        drawY = playerY - jumpHeight;
        rotation = Math.sin(jumpProgress * Math.PI) * 0.5;
      }

      ctx.save();
      ctx.translate(playerX, drawY);
      ctx.rotate(rotation);
      if (playerLane === 1) ctx.scale(-1, 1);
      
      if (dogImg.current?.complete) {
        ctx.drawImage(dogImg.current, -SPRITE_SIZE / 2, -SPRITE_SIZE / 2, SPRITE_SIZE, SPRITE_SIZE);
      } else {
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      if (isJumping && jumpFrame > 2 && jumpFrame < 10) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(20, -5);
        ctx.lineTo(40, 0);
        ctx.lineTo(20, 5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      texts.forEach(t => {
        const alpha = 1 - t.frame / 25;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(t.text, t.x, t.y - t.frame * 2);
        ctx.fillText(t.text, t.x, t.y - t.frame * 2);
        ctx.globalAlpha = 1;
      });

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 48);
      
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(currentCity.name, 8, 15);
      ctx.fillStyle = '#FFF';
      ctx.fillText(`FASE ${game.phase}`, 8, 30);
      
      ctx.fillStyle = '#888';
      ctx.font = '9px Arial';
      ctx.fillText(`Meta: ${phaseGoal}`, 8, 43);
      
      const progress = Math.min(phaseScoreRef.current / phaseGoal, 1);
      ctx.fillStyle = '#333';
      ctx.fillRect(80, 38, 80, 8);
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(80, 38, 80 * progress, 8);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`${game.score}`, CANVAS_WIDTH - 8, 22);
      if (game.combo > 1) {
        ctx.fillStyle = '#FF6347';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`x${game.combo} COMBO`, CANVAS_WIDTH - 8, 40);
      }

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [motorcycles, texts, playerLane, playerY, isJumping, jumpFrame, currentCityIndex, currentCity.name, game.score, game.combo, game.phase, phaseGoal]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-melonary-dark p-2">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-melonary-gold rounded-lg" style={{ maxWidth: '100%' }} />
      <div className="flex gap-3 mt-3 md:hidden">
        <div className="flex flex-col gap-1">
          <button onTouchStart={() => moveVertical('up')} className="w-12 h-12 bg-melonary-gold/20 border border-melonary-gold rounded text-lg text-melonary-gold">↑</button>
          <button onTouchStart={() => moveVertical('down')} className="w-12 h-12 bg-melonary-gold/20 border border-melonary-gold rounded text-lg text-melonary-gold">↓</button>
        </div>
        <button onTouchStart={switchLane} className="w-14 h-14 bg-melonary-gold/20 border border-melonary-gold rounded text-sm text-melonary-gold self-center">TROCA<br/>PISTA</button>
        <button onTouchStart={() => handleKick()} className="w-16 h-16 bg-melonary-gold border border-melonary-amber rounded-full text-sm font-bold text-melonary-dark self-center">CHUTE!</button>
      </div>
      <p className="mt-2 text-gray-500 text-xs">←→ troca pista | ↑↓ move | ESPACO = chute voador</p>
    </div>
  );
}
