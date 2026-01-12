import React from 'react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', active: false },
    { id: 'team-assignment', label: 'My Team Assignment', active: false },
    { id: 'work-queue', label: 'Work Queue', active: true },
    { id: 'team-setup', label: 'Team Setup', active: false }
  ];

  return (
    <aside className={`fixed left-9 top-[97px] w-[295px] h-[408px] bg-[#002C77] rounded-lg p-4 flex flex-col ${className}`}>
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`flex w-full h-12 items-center gap-3 px-5 py-4 rounded-lg transition-all ${
              item.active 
                ? 'bg-[#009DE0] shadow-[0_2px_15px_0_rgba(0,0,0,0.25)]' 
                : 'hover:bg-white/10'
            }`}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-3.5">
              <path d="M9.3 3.5H10.7V8.4H9.3V3.5ZM9.3 9.1H10.7V10.5H9.3V9.1Z" fill="#C1D8FF"/>
              <path d="M16.7949 3.7051L13.2949 0.205101C13.23 0.139971 13.1529 0.0883194 13.0679 0.0531198C12.983 0.0179201 12.8919 -0.000132614 12.8 7.33373e-07H7.2C7.10806 -0.000132614 7.017 0.0179201 6.93206 0.0531198C6.84713 0.0883194 6.76999 0.139971 6.7051 0.205101L3.2051 3.7051C3.13997 3.76999 3.08832 3.84713 3.05312 3.93206C3.01792 4.017 2.99987 4.10806 3 4.2V9.8C3 9.9862 3.0735 10.164 3.2051 10.2949L6.7051 13.7949C6.76999 13.86 6.84713 13.9117 6.93206 13.9469C7.017 13.9821 7.10806 14.0001 7.2 14H12.8C12.9862 14 13.164 13.9265 13.2949 13.7949L16.7949 10.2949C16.86 10.23 16.9117 10.1529 16.9469 10.0679C16.9821 9.983 17.0001 9.89194 17 9.8V4.2C17.0001 4.10806 16.9821 4.017 16.9469 3.93206C16.9117 3.84713 16.86 3.76999 16.7949 3.7051ZM15.6 9.5102L12.5102 12.6H7.4898L4.4 9.5102V4.4898L7.4898 1.4H12.5102L15.6 4.4898V9.5102Z" fill="#C1D8FF"/>
            </svg>
            <span className="text-white text-xs font-medium tracking-[-0.24px]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="w-full h-px bg-[#76D3FF] opacity-50 mb-4" />
        <button className="flex w-full h-12 items-center gap-3 p-4 rounded-lg hover:bg-white/10">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
            <path d="M12 11.2381V4.7619C12 4.64362 11.9729 4.52697 11.9208 4.42117C11.8687 4.31538 11.7931 4.22335 11.7 4.15238L6.45 0.152381C6.32018 0.0534687 6.16228 0 6 0C5.83772 0 5.67982 0.0534687 5.55 0.152381L0.3 4.15238C0.206853 4.22335 0.13125 4.31538 0.0791795 4.42117C0.0271087 4.52697 0 4.64362 0 4.7619V11.2381C0 11.4402 0.0790178 11.634 0.21967 11.7768C0.360322 11.9197 0.551088 12 0.75 12H3.75C3.94891 12 4.13968 11.9197 4.28033 11.7768C4.42098 11.634 4.5 11.4402 4.5 11.2381V8.95238C4.5 8.75031 4.57902 8.55652 4.71967 8.41363C4.86032 8.27075 5.05109 8.19048 5.25 8.19048H6.75C6.94891 8.19048 7.13968 8.27075 7.28033 8.41363C7.42098 8.55652 7.5 8.75031 7.5 8.95238V11.2381C7.5 11.4402 7.57902 11.634 7.71967 11.7768C7.86032 11.9197 8.05109 12 8.25 12H11.25C11.4489 12 11.6397 11.9197 11.7803 11.7768C11.921 11.634 12 11.4402 12 11.2381Z" stroke="#76D3FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#76D3FF] text-xs font-medium">Back to Home</span>
        </button>
        <button className="flex w-full h-12 items-center gap-3 p-4 rounded-lg hover:bg-white/10">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
            <path d="M6.003 2.7V12M1.5 6.66667L6 2.66667L10.5 6.66667M1.5 0H10.5" stroke="#76D3FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#76D3FF] text-xs font-medium">Back to Top</span>
        </button>
        <div className="w-full h-px bg-[#76D3FF] opacity-50 mt-4" />
      </div>

      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/fb345bb903b4cbfaf6ca9995a8da64e0a0952181?width=169"
        alt="Company Logo"
        className="w-[85px] h-[19px] mt-4 mx-auto"
      />
    </aside>
  );
};
