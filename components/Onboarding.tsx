
import React, { useState } from 'react';
import { ChevronRight, LayoutGrid, Radio, Activity, PenTool, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { AnimatedIcon } from './ui/AnimatedIcon';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-[#000000] to-gray-900 flex items-center justify-center z-50">
      {/* Premium Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-xl px-6">
        <GlassCard className="min-h-[500px] flex flex-col p-0 overflow-hidden shadow-2xl border border-white/10 backdrop-blur-3xl">
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
            
            {/* Step 1: Welcome */}
            {step === 0 && (
              <div className="flex flex-col items-center gap-8 w-full animate-fade-in">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 mb-4 ring-1 ring-white/20">
                    <LayoutGrid className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-display">
                    Alara AI
                  </h1>
                  <p className="text-lg text-gray-400 font-light max-w-sm mx-auto leading-relaxed">
                    Strategic intelligence for the modern executive.
                  </p>
                </div>
                
                <div className="mt-4">
                  <button 
                    onClick={nextStep}
                    className="group relative px-8 py-3 bg-white text-black rounded-full font-medium transition-all hover:bg-gray-100 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    Initialize Suite
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Features */}
            {step === 1 && (
              <div className="flex flex-col items-center gap-8 w-full animate-fade-in max-w-lg">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">System Capabilities</h2>
                  <p className="text-gray-400 text-sm">Three engines powering your competitive edge.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 w-full text-left">
                  {[
                    { icon: Radio, title: "Executive Daily", desc: "AI-curated briefings & podcasts tailored to your focus." },
                    { icon: Activity, title: "Market Intelligence", desc: "Real-time signals, heatmaps, & predictive analytics." },
                    { icon: PenTool, title: "Content Studio", desc: "Strategic ghostwriting & meeting prep generation." }
                  ].map((item, idx) => (
                    <div key={idx} className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-default">
                      <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <AnimatedIcon icon={item.icon} className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={nextStep} className="mt-2 text-gray-400 hover:text-white flex items-center gap-2 px-6 py-2 rounded-full hover:bg-white/5 transition-all text-sm">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 3: Ready */}
            {step === 2 && (
              <div className="flex flex-col items-center gap-8 w-full animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl ring-1 ring-white/20">
                    <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white">All Systems Operational</h2>
                  <p className="text-gray-400 text-base max-w-xs mx-auto leading-relaxed">
                    Your personal intelligence dashboard has been configured.
                  </p>
                </div>

                <button 
                  onClick={nextStep}
                  className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-full font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95"
                >
                  Enter Dashboard
                </button>
              </div>
            )}
          </div>
          
          {/* Progress Indicator */}
          <div className="h-1 w-full bg-white/5 mt-auto">
             <div 
               className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
               style={{ width: `${((step + 1) / 3) * 100}%` }}
             />
          </div>

        </GlassCard>
      </div>
    </div>
  );
};

export default Onboarding;
