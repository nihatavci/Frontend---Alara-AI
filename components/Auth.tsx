import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, Fingerprint } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'kronos') {
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-[#000000] to-gray-900 flex items-center justify-center z-50">
      {/* Ambient Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-md px-6">
        <GlassCard className="p-10 shadow-2xl border border-white/10 backdrop-blur-3xl flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-lg shadow-black/20 group">
                <Lock className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 font-display text-center tracking-tight">Identity Verification</h1>
            <p className="text-gray-400 text-sm mb-8 text-center max-w-xs leading-relaxed">
                Secure executive environment. Enter authorization key to proceed.
            </p>

            <form onSubmit={handleSubmit} className={`w-full space-y-4 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                <div className="relative group">
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                        }}
                        placeholder="Access Key"
                        className={`w-full bg-black/40 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'} rounded-xl px-4 py-4 pl-12 text-white placeholder-gray-600 outline-none transition-all focus:ring-2 ${error ? 'focus:ring-red-500/10' : 'focus:ring-blue-500/10'} text-center tracking-widest`}
                        autoFocus
                    />
                    <Fingerprint className={`absolute left-4 top-4 w-5 h-5 transition-colors ${error ? 'text-red-500' : 'text-gray-500 group-focus-within:text-blue-500'}`} />
                    {error && <AlertCircle className="absolute right-4 top-4 w-5 h-5 text-red-500 animate-pulse" />}
                </div>
                
                <button 
                    type="submit"
                    className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] mt-2"
                >
                    Authenticate
                    <ArrowRight className="w-4 h-4" />
                </button>
            </form>
            
            <div className="mt-8 flex items-center gap-2 opacity-50">
               <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">System Armed</span>
            </div>
        </GlassCard>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Auth;