import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { GameFooter } from '../components/TokenFooter';

let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

const MASTER_VOLUME = 0.7;

const playBark = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.03);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08 * MASTER_VOLUME, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
};

const playPunch = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 30);
      data[i] = (Math.random() * 2 - 1) * env * 0.5;
      if (t < 0.015) data[i] += Math.sin(t * 120 * Math.PI * 2) * env * 0.3;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    const gain = ctx.createGain();
    gain.gain.value = 0.3 * MASTER_VOLUME;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  } catch {}
};

const playScream = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.04 * MASTER_VOLUME, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
};

const playHowl = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.12 * MASTER_VOLUME, ctx.currentTime);
    gain.gain.setValueAtTime(0.15 * MASTER_VOLUME, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
  } catch {}
};

let bgMusicInterval: number | null = null;
let beatCount = 0;
const startBgMusic = () => {
  if (bgMusicInterval) return;
  beatCount = 0;
  const playActionBeat = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const kick = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kick.connect(kickGain);
      kickGain.connect(ctx.destination);
      kick.type = 'sine';
      kick.frequency.setValueAtTime(150, now);
      kick.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      kickGain.gain.setValueAtTime(0.4 * MASTER_VOLUME, now);
      kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      kick.start(now);
      kick.stop(now + 0.15);
      if (beatCount % 2 === 1) {
        const snare = ctx.createOscillator();
        const snareGain = ctx.createGain();
        const snareFilter = ctx.createBiquadFilter();
        snare.connect(snareFilter);
        snareFilter.connect(snareGain);
        snareGain.connect(ctx.destination);
        snare.type = 'triangle';
        snare.frequency.value = 200;
        snareFilter.type = 'highpass';
        snareFilter.frequency.value = 1000;
        snareGain.gain.setValueAtTime(0.25 * MASTER_VOLUME, now);
        snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        snare.start(now);
        snare.stop(now + 0.1);
      }
      if (beatCount % 4 === 0) {
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.connect(bassGain);
        bassGain.connect(ctx.destination);
        bass.type = 'sawtooth';
        const bassNotes = [55, 65.41, 73.42, 82.41];
        bass.frequency.value = bassNotes[Math.floor(beatCount / 4) % bassNotes.length];
        bassGain.gain.setValueAtTime(0.15 * MASTER_VOLUME, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        bass.start(now);
        bass.stop(now + 0.2);
      }
      beatCount++;
    } catch {}
  };
  playActionBeat();
  bgMusicInterval = window.setInterval(playActionBeat, 250);
};
const stopBgMusic = () => {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
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

const BASE_WIDTH = 400;
const BASE_HEIGHT = 550;
const SCALE = 1.5;
const CANVAS_WIDTH = Math.round(BASE_WIDTH * SCALE);
const CANVAS_HEIGHT = Math.round(BASE_HEIGHT * SCALE);
const LANE_LEFT_X = Math.round(145 * SCALE);
const LANE_RIGHT_X = Math.round(255 * SCALE);
const SPRITE_SIZE = Math.round(130 * SCALE);
const PHASE_DURATION_MS = 2 * 60 * 1000;

const CITIES = [
  'Rio de Janeiro', 'New York', 'Tokyo', 'Paris', 'Dubai', 'Los Angeles',
  'London', 'Sydney', 'Rome', 'Barcelona', 'Berlin', 'Amsterdam',
  'Toronto', 'Vancouver', 'Miami', 'Chicago', 'San Francisco', 'Las Vegas',
  'Moscow', 'Beijing', 'Shanghai', 'Hong Kong', 'Singapore', 'Bangkok',
  'Seoul', 'Mumbai', 'Delhi', 'Cairo', 'Cape Town', 'Johannesburg',
  'Buenos Aires', 'Sao Paulo', 'Mexico City', 'Lima', 'Bogota', 'Santiago',
  'Vienna', 'Prague', 'Budapest', 'Warsaw', 'Stockholm', 'Oslo',
  'Copenhagen', 'Helsinki', 'Dublin', 'Edinburgh', 'Manchester', 'Liverpool',
  'Milan', 'Florence', 'Venice', 'Naples', 'Madrid', 'Valencia',
  'Lisbon', 'Porto', 'Athens', 'Istanbul', 'Marrakech', 'Casablanca',
  'Tel Aviv', 'Jerusalem', 'Doha', 'Abu Dhabi', 'Riyadh', 'Kuwait City',
  'Kuala Lumpur', 'Jakarta', 'Manila', 'Ho Chi Minh', 'Hanoi', 'Taipei',
  'Osaka', 'Kyoto', 'Nagoya', 'Fukuoka', 'Sapporo', 'Busan',
  'Melbourne', 'Brisbane', 'Perth', 'Auckland', 'Wellington', 'Queenstown',
  'Havana', 'San Juan', 'Kingston', 'Nassau', 'Cancun', 'Acapulco',
  'Cartagena', 'Medellin', 'Quito', 'La Paz', 'Montevideo', 'Asuncion',
  'Reykjavik', 'Monaco', 'Luxembourg', 'Zurich', 'Geneva', 'Brussels'
];

const CITY_BACKGROUNDS = [
  '/assets/road-rio.png',
  '/assets/road-newyork.png', 
  '/assets/road-tokyo.png',
  '/assets/road-paris.png',
  '/assets/road-dubai.png',
  '/assets/road-losangeles.png'
];

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { game, setGameState } = useStore();
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [texts, setTexts] = useState<FloatingText[]>([]);
  const [playerLane, setPlayerLane] = useState<0 | 1>(0);
  const [playerY, setPlayerY] = useState(CANVAS_HEIGHT - Math.round(100 * SCALE));
  const [isJumping, setIsJumping] = useState(false);
  const [jumpFrame, setJumpFrame] = useState(0);
  const [kickCooldown, setKickCooldown] = useState(false);
  const [phaseStartTime, setPhaseStartTime] = useState(Date.now());
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(PHASE_DURATION_MS);
  const [comboDisplay, setComboDisplay] = useState({ value: 0, visible: false, frame: 0 });
  
  const lastSpawnRef = useRef(0);
  const motoIdRef = useRef(0);
  const textIdRef = useRef(0);
  const hitCountRef = useRef(0);
  const lastHitTimeRef = useRef(Date.now());
  const COMBO_TIMEOUT_MS = 2500;
  
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
    CITY_BACKGROUNDS.forEach((bg, i) => {
      const img = new Image();
      img.src = bg;
      bgImgs.current[i] = img;
    });
  }, []);

  useEffect(() => {
    setPhaseStartTime(Date.now());
    setPhaseTimeLeft(PHASE_DURATION_MS);
  }, [game.phase]);

  useEffect(() => {
    if (game.isPlaying && !game.isPaused) {
      startBgMusic();
    } else {
      stopBgMusic();
    }
    return () => stopBgMusic();
  }, [game.isPlaying, game.isPaused]);

  useEffect(() => {
    if (!game.isPlaying || game.isPaused) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - phaseStartTime;
      const remaining = Math.max(0, PHASE_DURATION_MS - elapsed);
      setPhaseTimeLeft(remaining);
      if (remaining <= 0) setGameState({ phase: game.phase + 1 });
    }, 1000);
    return () => clearInterval(interval);
  }, [game.isPlaying, game.isPaused, game.phase, phaseStartTime, setGameState]);

  const currentCityIndex = (game.phase - 1) % CITIES.length;
  const currentCity = CITIES[currentCityIndex];
  const currentBgIndex = (game.phase - 1) % CITY_BACKGROUNDS.length;
  const getLaneX = (lane: 0 | 1) => lane === 0 ? LANE_LEFT_X : LANE_RIGHT_X;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const spawnMotorcycle = useCallback(() => {
    const lane: 0 | 1 = Math.random() > 0.5 ? 0 : 1;
    const isFat = Math.random() > 0.5;
    const baseSpeed = (2.5 + game.phase * 0.12) * SCALE;
    const speed = isFat ? baseSpeed * 0.85 : baseSpeed;
    const startY = lane === 0 ? -Math.round(50 * SCALE) : CANVAS_HEIGHT + Math.round(50 * SCALE);
    setMotorcycles(prev => [...prev, { id: motoIdRef.current++, lane, y: startY, speed: lane === 0 ? speed : -speed, isFat, hit: false }]);
  }, [game.phase]);

  const handleKick = useCallback(() => {
    if (kickCooldown || !game.isPlaying || game.isPaused || isJumping) return;
    setIsJumping(true);
    setJumpFrame(0);
    setKickCooldown(true);

    const playerX = getLaneX(playerLane);
    setMotorcycles(prev => {
      let newScore = game.score;
      let newCombo = game.combo;
      let hitAny = false;

      const updated = prev.map(m => {
        if (m.hit || m.lane !== playerLane) return m;
        const dist = Math.abs(m.y - playerY);
        if (dist < Math.round(70 * SCALE)) {
          hitAny = true;
          newCombo++;
          const basePoints = 10;
          const comboBonus = Math.min(newCombo, 10);
          const points = basePoints + (comboBonus * 2);
          newScore += points;
          hitCountRef.current++;
          lastHitTimeRef.current = Date.now();
          playPunch();
          if (hitCountRef.current % 5 === 0) {
            setTimeout(() => playScream(), 80);
          }
          if (newCombo === 10 || newCombo === 25 || newCombo === 50 || newCombo % 50 === 0) {
            setTimeout(() => playHowl(), 200);
          }
          setTexts(t => [...t, { id: textIdRef.current++, x: playerX, y: m.y, text: `+${points}`, frame: 0 }]);
          return { ...m, hit: true };
        }
        return m;
      });

      if (hitAny) {
        setGameState({ score: newScore, combo: newCombo });
        if (newCombo >= 3) {
          setComboDisplay({ value: newCombo, visible: true, frame: 0 });
        }
      }
      return updated;
    });

    setTimeout(() => { setIsJumping(false); setKickCooldown(false); }, 350);
  }, [kickCooldown, game.isPlaying, game.isPaused, game.score, game.combo, playerLane, playerY, isJumping, setGameState]);

  const switchLane = useCallback(() => {
    if (!game.isPlaying || game.isPaused) return;
    playBark();
    setPlayerLane(prev => prev === 0 ? 1 : 0);
  }, [game.isPlaying, game.isPaused]);

  const moveVertical = useCallback((dir: 'up' | 'down') => {
    if (!game.isPlaying || game.isPaused) return;
    playBark();
    const step = Math.round(40 * SCALE);
    if (dir === 'up') setPlayerY(p => Math.max(Math.round(80 * SCALE), p - step));
    else setPlayerY(p => Math.min(CANVAS_HEIGHT - Math.round(60 * SCALE), p + step));
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
    if (isJumping) {
      const interval = setInterval(() => setJumpFrame(f => f + 1), 35);
      return () => clearInterval(interval);
    }
  }, [isJumping]);

  useEffect(() => {
    if (comboDisplay.visible) {
      const interval = setInterval(() => {
        setComboDisplay(prev => {
          if (prev.frame >= 30) return { ...prev, visible: false };
          return { ...prev, frame: prev.frame + 1 };
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [comboDisplay.visible]);

  useEffect(() => {
    if (!game.isPlaying || game.isPaused) return;
    let animId: number;
    const loop = () => {
      const now = Date.now();
      const interval = Math.max(900 - game.phase * 6, 500);
      if (now - lastSpawnRef.current > interval) {
        spawnMotorcycle();
        lastSpawnRef.current = now;
      }
      setMotorcycles(prev => {
        const updated = prev.map(m => ({ ...m, y: m.y + m.speed })).filter(m => {
          if (m.hit) return false;
          return m.lane === 0 ? m.y < CANVAS_HEIGHT + Math.round(60 * SCALE) : m.y > -Math.round(60 * SCALE);
        });
        return updated;
      });
      if (game.combo > 0 && Date.now() - lastHitTimeRef.current > COMBO_TIMEOUT_MS) {
        setGameState({ combo: 0 });
      }
      setTexts(prev => prev.map(t => ({ ...t, frame: t.frame + 1 })).filter(t => t.frame < 20));
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
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const bgImg = bgImgs.current[currentBgIndex];
      if (bgImg?.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      ctx.fillStyle = 'rgba(25, 25, 35, 0.7)';
      ctx.fillRect(LANE_LEFT_X - Math.round(35 * SCALE), Math.round(70 * SCALE), Math.round(70 * SCALE), CANVAS_HEIGHT - Math.round(70 * SCALE));
      ctx.fillRect(LANE_RIGHT_X - Math.round(35 * SCALE), Math.round(70 * SCALE), Math.round(70 * SCALE), CANVAS_HEIGHT - Math.round(70 * SCALE));

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([Math.round(12 * SCALE), Math.round(8 * SCALE)]);
      [LANE_LEFT_X, LANE_RIGHT_X].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, Math.round(70 * SCALE));
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      motorcycles.forEach(m => {
        const x = getLaneX(m.lane);
        const scale = m.lane === 0 ? 0.7 + (m.y / CANVAS_HEIGHT) * 0.4 : 1.1 - (m.y / CANVAS_HEIGHT) * 0.4;
        const size = SPRITE_SIZE * scale;
        const img = m.isFat ? motoFatImg.current : motoThinImg.current;
        ctx.save();
        ctx.translate(x, m.y);
        if (img?.complete) ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      });

      const playerX = getLaneX(playerLane);
      let drawY = playerY;
      let rotation = 0;
      if (isJumping) {
        const jumpProgress = jumpFrame / 10;
        drawY = playerY - Math.sin(jumpProgress * Math.PI) * Math.round(45 * SCALE);
        if (jumpFrame > 2 && jumpFrame < 8) {
          rotation = playerLane === 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
          rotation = Math.sin(jumpProgress * Math.PI) * 0.3 * (playerLane === 0 ? 1 : -1);
        }
      }
      ctx.save();
      ctx.translate(playerX, drawY);
      ctx.rotate(rotation);
      if (dogImg.current?.complete) ctx.drawImage(dogImg.current, -SPRITE_SIZE / 2, -SPRITE_SIZE / 2, SPRITE_SIZE, SPRITE_SIZE);
      ctx.restore();

      texts.forEach(t => {
        const alpha = 1 - t.frame / 20;
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${Math.round(24 * SCALE)}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText(t.text, t.x, t.y - t.frame * 3);
        ctx.fillStyle = '#FFD700';
        ctx.fillText(t.text, t.x, t.y - t.frame * 3);
        ctx.globalAlpha = 1;
      });

      const hudHeight = Math.round(50 * SCALE);
      ctx.fillStyle = 'rgba(0,0,0,0.92)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, hudHeight);
      
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.round(24 * SCALE)}px Orbitron`;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(`${game.score}`, Math.round(12 * SCALE), Math.round(34 * SCALE));
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`${game.score}`, Math.round(12 * SCALE), Math.round(34 * SCALE));
      
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.round(20 * SCALE)}px Orbitron`;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(currentCity, CANVAS_WIDTH / 2, Math.round(24 * SCALE));
      ctx.fillStyle = '#FFD700';
      ctx.fillText(currentCity, CANVAS_WIDTH / 2, Math.round(24 * SCALE));
      ctx.font = `bold ${Math.round(14 * SCALE)}px Orbitron`;
      ctx.strokeText(`Fase ${game.phase} - ${formatTime(phaseTimeLeft)}`, CANVAS_WIDTH / 2, Math.round(46 * SCALE));
      ctx.fillStyle = '#4CAF50';
      ctx.fillText(`Fase ${game.phase} - ${formatTime(phaseTimeLeft)}`, CANVAS_WIDTH / 2, Math.round(46 * SCALE));
      
      ctx.textAlign = 'right';
      ctx.font = `bold ${Math.round(24 * SCALE)}px Orbitron`;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(`${game.score}`, CANVAS_WIDTH - Math.round(12 * SCALE), Math.round(34 * SCALE));
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`${game.score}`, CANVAS_WIDTH - Math.round(12 * SCALE), Math.round(34 * SCALE));
      
      if (comboDisplay.visible && comboDisplay.value >= 3) {
        const comboAlpha = Math.min(1, (30 - comboDisplay.frame) / 10);
        const comboY = Math.round(120 * SCALE) + comboDisplay.frame * 1.5;
        const comboColor = comboDisplay.value >= 20 ? '#FF4444' : comboDisplay.value >= 10 ? '#FF8844' : '#FFD700';
        const comboSize = Math.round(28 * SCALE) + Math.min(comboDisplay.value, 30);
        ctx.globalAlpha = Math.max(0, comboAlpha);
        ctx.font = `bold ${comboSize}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.strokeText(`${comboDisplay.value}x COMBO!`, CANVAS_WIDTH / 2, comboY);
        ctx.fillStyle = comboColor;
        ctx.fillText(`${comboDisplay.value}x COMBO!`, CANVAS_WIDTH / 2, comboY);
        if (comboDisplay.value >= 10) {
          const label = comboDisplay.value >= 30 ? 'LENDARIO!' : comboDisplay.value >= 20 ? 'INSANO!' : 'EM CHAMAS!';
          ctx.font = `bold ${Math.round(16 * SCALE)}px Orbitron`;
          ctx.strokeText(label, CANVAS_WIDTH / 2, comboY + Math.round(25 * SCALE));
          ctx.fillText(label, CANVAS_WIDTH / 2, comboY + Math.round(25 * SCALE));
        }
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [motorcycles, texts, playerLane, playerY, isJumping, jumpFrame, currentBgIndex, currentCity, game.score, game.combo, game.phase, phaseTimeLeft, comboDisplay]);

  return (
    <div 
      className="flex flex-col items-center p-2 sm:p-4 pt-16 pb-8 overflow-y-auto" 
      style={{ 
        backgroundImage: 'url(/assets/mural-bg.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center'
      }}
    >
      <div 
        className="p-2 sm:p-4 rounded-2xl w-full max-w-[500px]" 
        style={{ 
          background: 'rgba(0,0,0,0.95)', 
          boxShadow: '0 0 50px rgba(255, 215, 0, 0.15)' 
        }}
      >
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
          className="border-2 border-yellow-500/50 rounded-lg w-full"
          style={{ 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)' 
          }} 
        />
        <div className="flex gap-2 mt-2 sm:hidden">
          <div className="flex flex-col gap-1 flex-1">
            <button 
              onTouchStart={() => moveVertical('up')} 
              className="h-11 bg-black/80 border-2 border-yellow-500/60 rounded-xl text-xl text-yellow-500 active:bg-yellow-500/30"
            >
              ↑
            </button>
            <button 
              onTouchStart={() => moveVertical('down')} 
              className="h-11 bg-black/80 border-2 border-yellow-500/60 rounded-xl text-xl text-yellow-500 active:bg-yellow-500/30"
            >
              ↓
            </button>
          </div>
          <div className="flex-[2] flex flex-col gap-1">
            <button 
              onTouchStart={switchLane} 
              className="h-11 bg-black/80 border-2 border-yellow-500/60 rounded-xl text-yellow-500 font-bold active:bg-yellow-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </button>
            <button 
              onTouchStart={() => handleKick()} 
              className="h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl font-bold text-black active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 5.28c-1.23-.37-2.22-1.17-2.8-2.18l-1-1.6c-.41-.65-1.11-1-1.84-1-.78 0-1.59.5-1.78 1.44S7 23 7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3c1 1.15 2.41 2.01 4 2.34V23H19V9.28c-.63.52-1.44.72-1.5.5z"/>
              </svg>
            </button>
          </div>
          <button 
            onClick={() => setGameState({ isPaused: true })}
            className="h-[90px] w-10 bg-red-600/80 border-2 border-red-400/60 rounded-xl text-white font-bold active:bg-red-500 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>
        </div>
        <p className="mt-3 text-yellow-500/80 text-lg text-center hidden sm:block font-bold tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>
          ARROWS = MOVE | SPACE = KICK
        </p>
        
        <GameFooter />
      </div>
    </div>
  );
}
