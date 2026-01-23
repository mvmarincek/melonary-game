import { useState, useEffect } from 'react';

export const CONTRACT = '4CQuDuiNrbKun9ot5BJnZAnjzpsv94NY5z4mb5uhpump';
export const STORE_URL = 'https://cachorrocaramelo.store';
export const TELEGRAM_URL = 'https://t.me/melonarycoin';
export const X_URL = 'https://x.com/melonary_coin';

export function MelonaryLogo({ size = 80 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div 
        className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{ 
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
          filter: 'blur(12px)',
          transform: 'scale(1.3)'
        }} 
      />
      <div 
        className="relative z-10 w-full h-full rounded-full overflow-hidden"
        style={{ 
          border: '3px solid #FFD700',
          boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
        }}
      >
        <img 
          src="/melonary-hero.png" 
          alt="Melonary"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </div>
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

export function SocialButtons() {
  return (
    <div className="flex items-center justify-center gap-3">
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-95"
        style={{ 
          background: 'linear-gradient(135deg, #0088cc 0%, #00aaff 100%)',
          boxShadow: '0 4px 15px rgba(0, 136, 204, 0.4)'
        }}
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.154.232.17.325.015.094.034.31.019.476z"/>
        </svg>
      </a>
      <a
        href={X_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-95"
        style={{ 
          background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
          border: '1px solid #444'
        }}
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a
        href={STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-95"
        style={{ 
          background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
        }}
      >
        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/>
        </svg>
      </a>
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

  return (
    <div className="w-full">
      <div 
        className={`rounded-2xl ${isLarge ? 'p-5' : 'p-4'}`}
        style={{ 
          background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.15) 0%, rgba(20, 241, 149, 0.08) 100%)',
          border: '2px solid rgba(153, 69, 255, 0.3)'
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <SolanaLogo size={isLarge ? 36 : 28} />
          <span className="text-gray-400 text-sm font-medium">Contrato Solana</span>
        </div>
        
        <div 
          className={`font-mono text-white bg-black/40 rounded-xl p-3 mb-3 break-all ${isLarge ? 'text-sm' : 'text-xs'}`}
          style={{ wordBreak: 'break-all' }}
        >
          {CONTRACT}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={copy}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-95 ${isLarge ? 'py-3 text-base' : 'py-2.5 text-sm'}`}
            style={{ 
              background: copied ? '#22c55e' : 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
              color: '#fff'
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              {copied ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              ) : (
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              )}
            </svg>
            {copied ? 'Copiado!' : 'Copiar Contrato'}
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <SocialButtons />
      </div>
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

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-bold text-white transition-all active:scale-95"
        style={{ 
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
        }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Instalar App
      </button>
      
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowIOSModal(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4 text-center">Instalar no iPhone/iPad</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <p className="flex items-center gap-3">
                <span className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-xs">1</span>
                Toque no botao de compartilhar
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </p>
              <p className="flex items-center gap-3">
                <span className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-xs">2</span>
                Role e toque em "Adicionar a Tela Inicio"
              </p>
              <p className="flex items-center gap-3">
                <span className="w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-xs">3</span>
                Toque em "Adicionar" no canto superior
              </p>
            </div>
            <button 
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 py-3 rounded-xl font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)' }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function GameFooter() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full space-y-3 mt-4">
      <InstallButton />
      
      <div 
        className="rounded-2xl p-4"
        style={{ 
          background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.15) 0%, rgba(20, 241, 149, 0.08) 100%)',
          border: '2px solid rgba(153, 69, 255, 0.3)'
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <SolanaLogo size={24} />
          <span className="text-gray-400 text-xs font-medium">Contrato Solana</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono text-white bg-black/40 rounded-lg px-3 py-2 text-xs truncate">
            {CONTRACT}
          </div>
          <button
            onClick={copy}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all active:scale-95"
            style={{ 
              background: copied ? '#22c55e' : 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)'
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              {copied ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              ) : (
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      <SocialButtons />
    </div>
  );
}

export default function TokenFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 safe-bottom" style={{ background: 'linear-gradient(0deg, rgba(13, 13, 20, 0.98) 0%, rgba(13, 13, 20, 0.9) 70%, transparent 100%)' }}>
      <div className="max-w-md mx-auto">
        <SocialButtons />
      </div>
    </div>
  );
}
