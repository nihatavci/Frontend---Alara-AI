
import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Crown, ChevronRight, User, HelpCircle, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const getBreadcrumbs = (tab: string): string[] => {
  const map: Record<string, string[]> = {
    'daily': ['Executive Daily'],
    'daily_briefing': ['Executive Daily', 'Daily Briefings'],
    'daily_export': ['Executive Daily', 'Export & Integration'],
    'daily_podcast': ['Executive Daily', 'AI Podcast Mode'],
    'market': ['Market Intelligence'],
    'market_heatmap': ['Market Intelligence', 'Sector Heatmap'],
    'market_niche': ['Market Intelligence', 'Emerging-Niche'],
    'market_radar': ['Market Intelligence', 'Competitor Radar'],
    'market_chat': ['Market Intelligence', 'Predictive Engine'],
    'content': ['Content Studio'],
    'content_linkedin': ['Content Studio', 'LinkedIn Generator'],
    'content_talking': ['Content Studio', 'Talking Points'],
    'settings': ['Settings'],
    'settings_market': ['Settings', 'Market Prioritization'],
    'settings_competitors': ['Settings', 'Competitor List'],
    'settings_source': ['Settings', 'Source Management'],
    'settings_persona': ['Settings', 'Persona & Voice'],
    'settings_team': ['Settings', 'Team Members'],
  };
  return map[tab] || ['Dashboard'];
};

export const Header: React.FC<HeaderProps> = ({ activeTab, theme, toggleTheme }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const crumbs = getBreadcrumbs(activeTab);
  
  return (
    <header className="h-20 px-6 lg:px-10 flex items-center justify-between border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl sticky top-0 z-40 shrink-0 transition-colors duration-300">
      
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500 font-medium">Alara AI</span>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className={`${idx === crumbs.length - 1 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search news, competitors, or topics..." 
          className="w-full bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm dark:shadow-lg dark:shadow-black/20"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
           <span className="text-xs text-gray-500 border border-gray-300 dark:border-gray-700 rounded px-1.5 py-0.5">⌘K</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        
        {/* Upgrade Button */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-orange-900/20 transition-all hover:scale-105">
           <Crown className="w-4 h-4" />
           <span>Upgrade to Pro</span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-white/10 hidden sm:block"></div>

        {/* Icons */}
        <div className="flex items-center gap-3">
           <button 
             onClick={toggleTheme}
             className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
           >
             {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </button>
           <button className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
             <Bell className="w-5 h-5" />
             <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#1C1C1E]"></span>
           </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
          >
            <div className="text-right hidden xl:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Akın Birgen</p>
              <p className="text-xs text-gray-500 mt-1 leading-none">CEO / Alara Inc.</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white dark:border-[#1C1C1E] shadow-sm flex items-center justify-center text-white font-bold text-xs">
              AB
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl animate-fade-in overflow-hidden z-50">
              <div className="p-2 space-y-1">
                <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Account Settings
                </button>
                <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                  <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Help & Support
                </button>
                <div className="h-px bg-gray-200 dark:bg-white/10 my-1"></div>
                <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
