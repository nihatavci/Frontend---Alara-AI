import React from 'react';

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  noPadding = false,
  style
}) => {
  // Light mode: Clean white card, subtle border, soft shadow.
  // Dark mode: Translucent glass, white text, glow shadow.
  const baseStyles = "rounded-2xl overflow-hidden transition-all duration-300 ease-out group relative";
  
  const themeStyles = `
    bg-white border border-gray-200/60 shadow-sm text-slate-900
    dark:glass-panel dark:shadow-2xl dark:shadow-black/50 dark:text-white dark:border-white/10 dark:bg-transparent
    hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-500/20 dark:hover:border-blue-500/30
  `;
  
  const paddingStyles = noPadding ? "" : "p-6";

  return (
    <div className={`${baseStyles} ${themeStyles} ${paddingStyles} ${className}`} style={style}>
      {/* Subtle animated gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-purple-500/0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};