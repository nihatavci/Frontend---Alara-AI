
import React, { useState, useEffect } from 'react';
import { Database, UserCheck, Users, Shield, Target, Zap, DollarSign, Sparkles, Briefcase, Cpu, Globe, List, Plus, X, Building } from 'lucide-react';
import Onboarding from './components/Onboarding';
import Sidebar from './components/dashboard/Sidebar';
import { Header } from './components/dashboard/Header';
import ExecutiveDaily from './components/dashboard/ExecutiveDaily';
import MarketIntelligence from './components/dashboard/MarketIntelligence';
import ContentStudio from './components/dashboard/ContentStudio';
import { ViewState, DashboardTab, MarketPriority } from './types';
import { GlassCard } from './components/ui/GlassCard';

// --- Settings Sub-Components ---

const MarketPrioritization = ({ selected, onSelect }: { selected: MarketPriority, onSelect: (p: MarketPriority) => void }) => {
  const priorities: { id: MarketPriority, label: string, icon: React.ElementType, color: string }[] = [
    { id: 'General', label: 'General Market', icon: Globe, color: 'blue' },
    { id: 'Energy', label: 'Energy Sector', icon: Zap, color: 'yellow' },
    { id: 'Finance', label: 'Global Finance', icon: DollarSign, color: 'green' },
    { id: 'Innovation', label: 'Innovation & R&D', icon: Sparkles, color: 'purple' },
    { id: 'Business', label: 'Business Strategy', icon: Briefcase, color: 'orange' },
    { id: 'Tech', label: 'Technology', icon: Cpu, color: 'cyan' },
  ];

  return (
    <GlassCard className="space-y-6">
       <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Prioritization</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Select a primary focus area to tailor your daily intelligence feed.</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
             <Target className="w-6 h-6" />
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {priorities.map((p) => {
            const isSelected = selected === p.id;
            return (
               <button
                 key={p.id}
                 onClick={() => onSelect(p.id)}
                 className={`relative p-6 rounded-2xl border transition-all duration-300 text-left group overflow-hidden ${
                   isSelected 
                     ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/30 transform scale-[1.02]' 
                     : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-white/10'
                 }`}
               >
                  <div className={`absolute top-0 right-0 p-4 transition-opacity ${isSelected ? 'opacity-20' : 'opacity-5'}`}>
                      <p.icon className="w-16 h-16" />
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      isSelected ? 'bg-white/20 text-white' : `bg-${p.color}-500/10 text-${p.color}-500 dark:text-${p.color}-400`
                  }`}>
                      <p.icon className="w-6 h-6" />
                  </div>
                  <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{p.label}</h3>
                  <p className={`text-xs mt-1 font-medium ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                     {isSelected ? 'Active Priority' : 'Click to Activate'}
                  </p>
               </button>
            )
          })}
       </div>
    </GlassCard>
  );
};

const CompetitorListSettings = ({ 
  competitors, 
  onAdd, 
  onRemove,
  userCompany,
  onUpdateUserCompany
}: { 
  competitors: string[], 
  onAdd: (name: string) => void, 
  onRemove: (name: string) => void,
  userCompany: string,
  onUpdateUserCompany: (name: string) => void
}) => {
  const [input, setInput] = useState('');
  const [companyInput, setCompanyInput] = useState(userCompany);

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  const handleUpdateCompany = () => {
     if (companyInput.trim()) {
        onUpdateUserCompany(companyInput.trim());
     }
  }

  return (
    <GlassCard className="space-y-8">
       <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Competitor Watchlist</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage the entities tracked in your Competitor Radar.</p>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-full text-red-600 dark:text-red-400">
             <List className="w-6 h-6" />
          </div>
       </div>

       {/* My Entity Section */}
       <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/20">
           <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" /> Your Organization
           </h3>
           <div className="flex gap-3">
              <input 
                 type="text"
                 value={companyInput}
                 onChange={(e) => setCompanyInput(e.target.value)}
                 onBlur={handleUpdateCompany}
                 onKeyDown={(e) => e.key === 'Enter' && handleUpdateCompany()}
                 className="flex-1 bg-white dark:bg-black/20 border border-blue-200 dark:border-blue-500/30 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button 
                onClick={handleUpdateCompany}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Update
              </button>
           </div>
           <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-2">
              This entity will be used as the primary subject for comparative analysis.
           </p>
       </div>

       <div className="space-y-4">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tracked Competitors</h3>
           <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Enter competitor name (e.g., Acme Corp)"
                className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <button 
                 onClick={handleAdd}
                 disabled={!input.trim()}
                 className="px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                 <Plus className="w-4 h-4" /> Add
              </button>
           </div>

           <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {competitors.length === 0 ? (
                 <div className="text-center py-8 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                     No competitors added yet.
                 </div>
              ) : (
                 competitors.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl group hover:border-gray-300 dark:hover:border-white/20 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300">
                                {comp.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{comp}</span>
                        </div>
                        <button 
                           onClick={() => onRemove(comp)}
                           className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                           <X className="w-4 h-4" />
                        </button>
                    </div>
                 ))
              )}
           </div>
       </div>
    </GlassCard>
  );
};

const SourceManagement = () => (
  <GlassCard className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Source Management</h2>
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">Global Equities</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live API Connection</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Connected
        </div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
             <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
           </div>
           <div>
             <p className="text-gray-900 dark:text-white font-medium">Regulatory News Feed</p>
             <p className="text-xs text-gray-500 dark:text-gray-400">SEC & Global Compliance</p>
           </div>
         </div>
         <button className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Configure</button>
      </div>
    </div>
  </GlassCard>
);

const PersonaVoice = () => (
  <GlassCard className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Content Persona & Voice</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <button className="p-6 rounded-xl border border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-left transition-all">
         <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
         <h3 className="font-bold text-gray-900 dark:text-white text-lg">Visionary Leader</h3>
         <p className="text-sm text-blue-600/70 dark:text-blue-200/60 mt-2">Optimistic, forward-looking, and focused on innovation and macro trends.</p>
       </button>
       <button className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-left hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
         <Shield className="w-8 h-8 text-gray-400 dark:text-gray-400 mb-4" />
         <h3 className="font-bold text-gray-500 dark:text-gray-300 text-lg">Pragmatic Operator</h3>
         <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Data-driven, realistic, and focused on execution and efficiency.</p>
       </button>
    </div>
  </GlassCard>
);

const TeamMembers = () => (
  <GlassCard className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Team Access</h2>
    <div className="space-y-4">
       {[1, 2, 3].map((i) => (
         <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5 last:border-0">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800"></div>
             <div>
               <p className="text-sm text-gray-900 dark:text-white font-medium">{['Aylin Yılmaz', 'Mehmet Demir', 'Zeynep Kaya'][i-1]}</p>
               <p className="text-xs text-gray-500 dark:text-gray-500">Chief Strategy Officer</p>
             </div>
           </div>
           <select className="bg-gray-100 dark:bg-black/20 text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded p-1">
             <option>Editor</option>
             <option>Viewer</option>
           </select>
         </div>
       ))}
       <button className="w-full py-2 border border-dashed border-gray-300 dark:border-white/20 rounded-lg text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/40 mt-4">
         + Add Team Member
       </button>
    </div>
  </GlassCard>
);

const MainSettings = ({ marketPriority, competitors, userCompany }: { marketPriority: string, competitors: string[], userCompany: string }) => (
  <div className="max-w-4xl mx-auto space-y-6">
     <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings Overview</h1>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
           <Target className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-4" />
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">Focus</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">Priority: {marketPriority}</p>
           <div className="w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
             <div className="w-full h-full bg-blue-500"></div>
           </div>
        </div>
        <div className="p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
           <Building className="w-8 h-8 text-red-500 dark:text-red-400 mb-4" />
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">Entity Profile</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-1">{userCompany}</p>
           <p className="text-xs text-gray-400">Tracking against {competitors.length} competitors</p>
        </div>
        <div className="p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
           <Users className="w-8 h-8 text-purple-500 dark:text-purple-400 mb-4" />
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">4 Active Members</p>
        </div>
     </div>
  </div>
);

interface SettingsViewProps {
  view: string;
  marketPriority: MarketPriority;
  setMarketPriority: (p: MarketPriority) => void;
  competitors: string[];
  setCompetitors: React.Dispatch<React.SetStateAction<string[]>>;
  userCompany: string;
  setUserCompany: (n: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ view, marketPriority, setMarketPriority, competitors, setCompetitors, userCompany, setUserCompany }) => {
  if (view === 'settings_market') return <MarketPrioritization selected={marketPriority} onSelect={setMarketPriority} />;
  if (view === 'settings_competitors') return (
     <CompetitorListSettings 
       competitors={competitors} 
       onAdd={(name) => setCompetitors(prev => [...prev, name])} 
       onRemove={(name) => setCompetitors(prev => prev.filter(c => c !== name))}
       userCompany={userCompany}
       onUpdateUserCompany={setUserCompany}
     />
  );
  if (view === 'settings_source') return <SourceManagement />;
  if (view === 'settings_persona') return <PersonaVoice />;
  if (view === 'settings_team') return <TeamMembers />;
  return <MainSettings marketPriority={marketPriority} competitors={competitors} userCompany={userCompany} />;
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('onboarding');
  const [activeTab, setActiveTab] = useState<DashboardTab>('daily');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // App-Wide State
  const [marketPriority, setMarketPriority] = useState<MarketPriority>('General');
  const [competitors, setCompetitors] = useState<string[]>(['Competitor X']);
  const [userCompany, setUserCompany] = useState<string>("Mimas Financial Consulting");

  // Initialize theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderContent = () => {
    // Determine which main module to render based on the activeTab string
    if (activeTab.startsWith('daily')) return <ExecutiveDaily view={activeTab} marketPriority={marketPriority} />;
    if (activeTab.startsWith('market')) return <MarketIntelligence view={activeTab} isDarkMode={theme === 'dark'} marketPriority={marketPriority} competitors={competitors} userCompany={userCompany} />;
    if (activeTab.startsWith('content')) return <ContentStudio view={activeTab} />;
    if (activeTab.startsWith('settings')) return (
       <SettingsView 
         view={activeTab} 
         marketPriority={marketPriority} 
         setMarketPriority={setMarketPriority} 
         competitors={competitors} 
         setCompetitors={setCompetitors}
         userCompany={userCompany}
         setUserCompany={setUserCompany}
       />
    );
    
    // Default fallback
    return <ExecutiveDaily view="daily" marketPriority={marketPriority} />;
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-anthracite text-slate-900 dark:text-white font-sans transition-colors duration-300">
      {/* Main Background Gradient for Dark Mode */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block">
         <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1E] via-[#0d141f] to-black"></div>
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600/50 to-transparent opacity-50"></div>
      </div>

      {viewState === 'onboarding' ? (
        <Onboarding onComplete={() => setViewState('dashboard')} />
      ) : (
        <div className="relative z-10 flex h-screen overflow-hidden">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <Header activeTab={activeTab} theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 pb-32 custom-scrollbar relative">
               {renderContent()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
