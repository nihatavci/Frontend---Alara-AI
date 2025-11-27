import React from 'react';

interface AnimatedIconProps {
  icon: React.ElementType;
  className?: string;
  isActive?: boolean;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ icon: Icon, className = "", isActive = false }) => {
  return (
    <div className={`relative group-hover:scale-110 transition-transform duration-300 ease-out flex items-center justify-center ${className}`}>
      {/* Glow effect behind the icon on hover/active */}
      <div className={`absolute inset-0 bg-current opacity-0 group-hover:opacity-20 rounded-full blur-md transition-opacity duration-300 ${isActive ? 'opacity-30' : ''}`} />
      
      <Icon 
        className={`relative z-10 transition-all duration-300 
          ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px] group-hover:stroke-[2px]'}
        `} 
      />
    </div>
  );
};