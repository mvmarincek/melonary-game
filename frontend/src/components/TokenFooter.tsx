import { useState } from 'react';

const CONTRACT = '4CQuDuiNrbKun9ot5BJnZAnjzpsv94NY5z4mb5uhpump';
const STORE_URL = 'https://cachorrocaramelo.store';

export default function TokenFooter() {
  const [copied, setCopied] = useState(false);

  const copyContract = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)' }}>
      <div className="max-w-lg mx-auto flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={copyContract}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
          style={{ 
            background: copied ? 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)' : 'linear-gradient(180deg, #9945FF 0%, #14F195 100%)',
            color: '#fff',
            boxShadow: '0 0 15px rgba(153, 69, 255, 0.4)'
          }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M17.5 12.5c0 4.14-3.36 7.5-7.5 7.5S2.5 16.64 2.5 12.5 5.86 5 10 5h1.5v3.08L17.5 12.5z"/>
            <path d="M21.5 11.5c0-4.14-3.36-7.5-7.5-7.5S6.5 7.36 6.5 11.5c0 .17.01.34.02.5h3.98c2.49 0 4.5 2.01 4.5 4.5v.52c2.84-.48 5-2.94 5-5.52z"/>
          </svg>
          {copied ? 'Copiado!' : 'Contrato SOL'}
        </button>

        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
          style={{ 
            background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
            color: '#1a1a2e',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)'
          }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          Caramelo Store
        </a>

        <div className="w-full text-center mt-1">
          <span className="text-gray-500 text-xs font-mono" style={{ fontSize: '9px' }}>{CONTRACT}</span>
        </div>
      </div>
    </div>
  );
}
