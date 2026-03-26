
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';

interface LoginProps {
  onAuthenticated: () => void;
}

const Login: React.FC<LoginProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'AUTHENTICATING' | 'DENIED'>('IDLE');
  const [bootSequence, setBootSequence] = useState(0);

  const BOOT_MESSAGES = [
    "Initializing Kernel...",
    "Establishing Secure Tunnel...",
    "Mounting Revenue Modules...",
    "Ready for Protocol Key."
  ];

  useEffect(() => {
    if (bootSequence < BOOT_MESSAGES.length - 1) {
      const timer = setTimeout(() => setBootSequence(s => s + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [bootSequence]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('AUTHENTICATING');
    
    // Simulate auth lag
    setTimeout(() => {
      if (pin.toUpperCase() === 'REVENUE2026') {
        localStorage.setItem('ra_auth', 'true');
        onAuthenticated();
      } else {
        setStatus('DENIED');
        setPin('');
        setTimeout(() => setStatus('IDLE'), 2000);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-[100]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] opacity-50" />
      
      <div className="max-w-md w-full relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 mb-6 animate-pulse">
            <ICONS.Zap className="w-10 h-10 text-yellow-500 fill-yellow-500" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">RevenueArchitect<span className="text-yellow-500">AI</span></h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-1 h-1 rounded-full bg-yellow-500 animate-ping" />
            <p className="text-[10px] mono text-yellow-500 font-bold tracking-[0.4em] uppercase">{BOOT_MESSAGES[bootSequence]}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input 
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="ENTER PROTOCOL KEY"
              className={`w-full bg-black border ${status === 'DENIED' ? 'border-red-500' : 'border-[#222]'} rounded-2xl px-6 py-5 text-center text-white font-black tracking-[1em] outline-none transition-all focus:border-yellow-500 placeholder:tracking-normal placeholder:text-[10px] placeholder:text-gray-700`}
              disabled={status === 'AUTHENTICATING'}
            />
            {status === 'AUTHENTICATING' && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl">
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          {status === 'DENIED' && (
            <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce">Access Denied. Key Mismatch.</p>
          )}

          <button 
            type="submit"
            className="w-full bg-white text-black font-black uppercase py-4 rounded-2xl text-[11px] tracking-[0.2em] hover:bg-yellow-500 transition-all active:scale-95"
          >
            Authenticate Session
          </button>
        </form>

        <p className="mt-12 text-center text-gray-600 text-[9px] font-bold uppercase tracking-[0.5em] leading-loose">
          Secure Terminal // Unauthorized access is prohibited.<br/>
          Hint: REVENUE2026
        </p>
      </div>
    </div>
  );
};

export default Login;
