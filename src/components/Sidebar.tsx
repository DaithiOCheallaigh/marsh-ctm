import React from 'react';
import { Building2, FileCheck, AlertOctagon, Settings, ArrowUp } from 'lucide-react';
import marshLogo from '@/assets/marsh-logo-white.png';
import homeIcon from '@/assets/home-icon.png';

interface SidebarProps {
  activeItem?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'work-queue', className = "" }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'team-assignment', label: 'My Team Assignment', icon: FileCheck },
    { id: 'work-queue', label: 'Work Queue', icon: AlertOctagon },
    { id: 'team-setup', label: 'Team Setup', icon: Settings }
  ];

  return (
    <aside 
      className={`
        fixed left-6 top-[100px]
        w-[264px] 
        bg-[hsl(220,100%,24%)] 
        rounded-xl 
        py-4 px-3
        flex flex-col
        min-h-[420px]
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Main Navigation */}
      <nav className="flex flex-col gap-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              className={`
                flex items-center gap-3
                w-full h-12 
                px-5
                rounded-lg 
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-white/30
                ${isActive 
                  ? 'bg-[hsl(197,100%,44%)] shadow-[0_2px_15px_rgba(0,0,0,0.25)]' 
                  : 'hover:bg-white/10'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[hsl(214,100%,85%)]'}`} 
                strokeWidth={1.5}
              />
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1 min-h-8" />

      {/* Divider */}
      <div className="w-full h-px bg-[hsl(200,100%,70%)] opacity-40 my-4" />

      {/* Secondary Navigation */}
      <div className="flex flex-col gap-0.5">
        <button className="
          flex items-center gap-3
          w-full h-11 
          px-5 
          rounded-lg 
          hover:bg-white/10
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-white/30
        ">
          <img src={homeIcon} alt="Home" className="w-4 h-4 flex-shrink-0" />
          <span className="text-[hsl(200,100%,70%)] text-sm font-medium">Back to Home</span>
        </button>
        
        <button className="
          flex items-center gap-3
          w-full h-11 
          px-5 
          rounded-lg 
          hover:bg-white/10
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-white/30
        ">
          <ArrowUp className="w-4 h-4 text-[hsl(200,100%,70%)] flex-shrink-0" strokeWidth={1.5} />
          <span className="text-[hsl(200,100%,70%)] text-sm font-medium">Back to Top</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[hsl(200,100%,70%)] opacity-40 my-4" />

      {/* Marsh Logo */}
      <div className="flex justify-center py-2">
        <img src={marshLogo} alt="Marsh logo" className="h-6 w-auto" />
      </div>
    </aside>
  );
};
