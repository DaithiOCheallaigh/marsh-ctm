import React from 'react';
import { LayoutDashboard, Users, AlertOctagon, Settings, Home, ArrowUp } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: false },
    { id: 'team-assignment', label: 'My Team Assignment', icon: Users, active: false },
    { id: 'work-queue', label: 'Work Queue', icon: AlertOctagon, active: true },
    { id: 'team-setup', label: 'Team Setup', icon: Settings, active: false }
  ];

  return (
    <aside 
      className={`
        fixed left-9 top-[97px] 
        w-[280px] 
        bg-[hsl(220,100%,24%)] 
        rounded-xl 
        p-5 
        flex flex-col
        shadow-lg
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Main Navigation */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`
                flex items-center gap-3
                w-full h-12 
                px-4 
                rounded-lg 
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-white/30
                ${item.active 
                  ? 'bg-[hsl(197,100%,44%)] shadow-lg' 
                  : 'hover:bg-white/10'
                }
              `}
              aria-current={item.active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 text-[hsl(214,100%,88%)] flex-shrink-0" />
              <span className="text-white text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="w-full h-px bg-[hsl(200,100%,73%)] opacity-30 my-6" />

      {/* Secondary Navigation */}
      <div className="flex flex-col gap-1">
        <button className="
          flex items-center gap-3
          w-full h-11 
          px-4 
          rounded-lg 
          hover:bg-white/10
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-white/30
        ">
          <Home className="w-4 h-4 text-[hsl(200,100%,73%)] flex-shrink-0" />
          <span className="text-[hsl(200,100%,73%)] text-sm font-medium">Back to Home</span>
        </button>
        
        <button className="
          flex items-center gap-3
          w-full h-11 
          px-4 
          rounded-lg 
          hover:bg-white/10
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-white/30
        ">
          <ArrowUp className="w-4 h-4 text-[hsl(200,100%,73%)] flex-shrink-0" />
          <span className="text-[hsl(200,100%,73%)] text-sm font-medium">Back to Top</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[hsl(200,100%,73%)] opacity-30 my-6" />

      {/* Logo */}
      <div className="mt-auto flex justify-center">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/fb345bb903b4cbfaf6ca9995a8da64e0a0952181?width=169"
          alt="Marsh Company Logo"
          className="w-[90px] h-auto opacity-90"
        />
      </div>
    </aside>
  );
};
