
import React from 'react';
import { LayoutGrid, TrendingUp, PenTool, Settings, ChevronDown, ChevronRight, PieChart, Radio, FileText, Share2, Activity, Globe, MessageSquare, Users, Database, UserCheck, Target, List } from 'lucide-react';
import { DashboardTab } from '../../types';
import { AnimatedIcon } from '../ui/AnimatedIcon';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string; icon?: React.ElementType }[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems: NavItem[] = [
    { 
      id: 'daily', 
      label: 'Executive Daily', 
      icon: LayoutGrid,
      children: [
        { id: 'daily_briefing', label: 'Daily Briefings', icon: FileText },
        { id: 'daily_export', label: 'Export & Integration', icon: Share2 },
        { id: 'daily_podcast', label: 'AI Podcast Mode', icon: Radio },
      ]
    },
    { 
      id: 'market', 
      label: 'Market Intelligence', 
      icon: TrendingUp,
      children: [
        { id: 'market_heatmap', label: 'Sector Heatmap', icon: Activity },
        { id: 'market_niche', label: 'Emerging-Niche', icon: Globe },
        { id: 'market_radar', label: 'Competitor Radar', icon: PieChart },
        { id: 'market_chat', label: 'Predictive Engine', icon: MessageSquare },
      ]
    },
    { 
      id: 'content', 
      label: 'Content Studio', 
      icon: PenTool,
      children: [
        { id: 'content_linkedin', label: 'LinkedIn Generator', icon: Share2 },
        { id: 'content_talking', label: 'Talking Points', icon: FileText },
      ]
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      children: [
        { id: 'settings_market', label: 'Market Prioritization', icon: Target },
        { id: 'settings_competitors', label: 'Competitor List', icon: List },
        { id: 'settings_source', label: 'Source Management', icon: Database },
        { id: 'settings_persona', label: 'Persona & Voice', icon: UserCheck },
        { id: 'settings_team', label: 'Team Members', icon: Users },
      ]
    },
  ];

  // Helper to check if a group is active (parent or any child selected)
  const isGroupActive = (item: NavItem) => {
    return activeTab === item.id || item.children?.some(child => child.id === activeTab);
  };

  return (
    <div className="w-20 lg:w-72 border-r border-gray-200 dark:border-white/10 flex flex-col h-full bg-white/50 dark:bg-[#0f0f10]/50 backdrop-blur-xl transition-colors duration-300 z-50">
      {/* Logo */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-200 dark:border-white/5 shrink-0 group cursor-pointer">
        <img 
          src="https://media.licdn.com/dms/image/v2/D4D0BAQEmph9wW1PzWg/company-logo_200_200/company-logo_200_200/0/1738097380814/scrolli_logo?e=2147483647&v=beta&t=eYQLsmTf_cJKZ69DnG41JY7cSzGcra50-7bFKGLmiD8" 
          alt="Scrolli Logo" 
          className="w-8 h-8 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-600/20"
        />
        <span className="hidden lg:block ml-3 font-bold text-xl text-gray-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Scrolli</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 px-2 lg:px-4 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = isGroupActive(item);
          const isDirectlyActive = activeTab === item.id;

          return (
            <div key={item.id} className="mb-2">
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group ${
                  isDirectlyActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/50' 
                    : isActive 
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <AnimatedIcon 
                    icon={item.icon} 
                    className={`w-5 h-5 flex-shrink-0 ${isDirectlyActive ? 'text-white' : isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white'}`}
                    isActive={isActive} 
                  />
                  <span className="hidden lg:block font-medium text-sm text-left truncate">{item.label}</span>
                </div>
                {item.children && (
                  <div className="hidden lg:block transition-transform duration-300">
                     {isActive ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                  </div>
                )}
              </button>

              {/* Sub-menu (Desktop) */}
              <div className={`hidden lg:block ml-4 overflow-hidden transition-all duration-300 ease-in-out ${isActive && item.children ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <div className="pl-4 border-l border-gray-200 dark:border-white/10 space-y-1">
                  {item.children?.map((child) => (
                    <button
                      key={child.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabChange(child.id);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group/sub ${
                        activeTab === child.id
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 font-medium translate-x-1'
                          : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:translate-x-1'
                      }`}
                    >
                      <span className="truncate">{child.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
      
      {/* Footer / Version */}
      <div className="p-6 border-t border-gray-200 dark:border-white/5 shrink-0 hidden lg:block text-xs text-gray-500 dark:text-gray-600 text-center">
         Alara AI v1.1 Pro
      </div>
    </div>
  );
};

export default Sidebar;
