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
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
        copied ? 'bg-green-500' : 'bg-gradient-to-br from-purple-500 to-green-400'
      }`}
      style={{ color: '#fff' }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        {copied ? (
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        ) : (
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        )}
      </svg>
      {copied ? 'Copiado!' : (label || 'Copiar')}
    </button>
  );
}

export function SolanaLogo({ size = 40 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div 
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{ 
          background: 'radial-gradient(circle, rgba(153, 69, 255, 0.4) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }} 
      />
      <svg width={size} height={size} viewBox="0 0 128 128" className="relative z-10">
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
    </div>
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
      className={`flex items-center gap-3 rounded-2xl ${isLarge ? 'p-4' : isSmall ? 'p-2.5' : 'p-3'}`}
      style={{ 
        background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.1) 0%, rgba(20, 241, 149, 0.05) 100%)',
        border: '1px solid rgba(153, 69, 255, 0.2)'
      }}
    >
      <SolanaLogo size={isLarge ? 44 : isSmall ? 28 : 36} />
      <div className="flex-1 min-w-0">
        <p className={`text-gray-400 ${isLarge ? 'text-xs' : 'text-[10px]'} font-medium`}>Contrato Solana</p>
        <p 
          className="font-mono text-white/80 truncate"
          style={{ fontSize: isSmall ? '9px' : isLarge ? '11px' : '10px' }}
        >
          {CONTRACT}
        </p>
      </div>
      <button
        onClick={copy}
        className={`flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 ${
          isLarge ? 'px-4 py-2.5 text-sm' : isSmall ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-xs'
        }`}
        style={{ 
          background: copied ? '#22c55e' : 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
          color: '#fff'
        }}
      >
        <svg viewBox="0 0 24 24" className={isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} fill="currentColor">
          {copied ? (
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          ) : (
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          )}
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-95 ${
        isLarge ? 'px-6 py-3 text-base' : isSmall ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm'
      }`}
      style={{ 
        background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
        color: '#0D0D14',
        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
      }}
    >
      <svg viewBox="0 0 24 24" className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} fill="currentColor">
        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/>
      </svg>
      Caramelo Store
    </a>
  );
}

export default function TokenFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 safe-bottom" style={{ background: 'linear-gradient(0deg, rgba(13, 13, 20, 0.98) 0%, rgba(13, 13, 20, 0.9) 70%, transparent 100%)' }}>
      <div className="max-w-md mx-auto space-y-2">
        <ContractBanner size="small" />
        <div className="flex justify-center">
          <StoreButton size="small" />
        </div>
      </div>
    </div>
  );
}
