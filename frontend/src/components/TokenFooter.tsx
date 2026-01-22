import { useState } from 'react';

export const CONTRACT = '4CQuDuiNrbKun9ot5BJnZAnjzpsv94NY5z4mb5uhpump';
export const STORE_URL = 'https://cachorrocaramelo.store';

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
      style={{ 
        background: copied ? '#4CAF50' : 'linear-gradient(180deg, #9945FF 0%, #14F195 100%)',
        color: '#fff'
      }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
      {copied ? 'Copiado!' : (label || 'Copiar')}
    </button>
  );
}

export function SolanaLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" style={{ filter: 'drop-shadow(0 0 10px rgba(153, 69, 255, 0.5))' }}>
      <defs>
        <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9945FF"/>
          <stop offset="50%" stopColor="#8752F3"/>
          <stop offset="100%" stopColor="#14F195"/>
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r="60" fill="url(#solGrad)"/>
      <path d="M94 78H38l8-10h48l-8 10zm0-24H38l8-10h48l-8 10zm-48 12h48l8 10H38l8-10z" fill="white"/>
    </svg>
  );
}

export function ContractBanner({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <div 
      className={`flex items-center gap-3 rounded-xl border-2 ${isLarge ? 'p-4' : isSmall ? 'p-2' : 'p-3'}`}
      style={{ 
        background: 'rgba(0,0,0,0.7)',
        borderColor: 'rgba(153, 69, 255, 0.5)',
        boxShadow: '0 0 20px rgba(153, 69, 255, 0.2)'
      }}
    >
      <SolanaLogo size={isLarge ? 50 : isSmall ? 28 : 36} />
      <div className="flex-1 min-w-0">
        <p className={`text-gray-400 ${isLarge ? 'text-sm' : 'text-xs'}`}>Contrato Solana</p>
        <p 
          className={`font-mono text-white truncate ${isLarge ? 'text-sm' : 'text-xs'}`}
          style={{ fontSize: isSmall ? '9px' : isLarge ? '12px' : '10px' }}
        >
          {CONTRACT}
        </p>
      </div>
      <button
        onClick={copy}
        className={`flex items-center gap-1 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 ${isLarge ? 'px-4 py-2 text-sm' : isSmall ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-xs'}`}
        style={{ 
          background: copied ? '#4CAF50' : 'linear-gradient(180deg, #9945FF 0%, #14F195 100%)',
          color: '#fff'
        }}
      >
        <svg viewBox="0 0 24 24" className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        {copied ? 'Copiado!' : 'Copiar'}
      </button>
    </div>
  );
}

export function StoreButton({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <a
      href={STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 ${isLarge ? 'px-6 py-3 text-lg' : isSmall ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'}`}
      style={{ 
        background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
        color: '#1a1a2e',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
      }}
    >
      <svg viewBox="0 0 24 24" className={isLarge ? 'w-6 h-6' : 'w-4 h-4'} fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      Caramelo Store
    </a>
  );
}

export default function TokenFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)' }}>
      <div className="max-w-xl mx-auto">
        <ContractBanner size="small" />
        <div className="flex justify-center mt-2">
          <StoreButton size="small" />
        </div>
      </div>
    </div>
  );
}
