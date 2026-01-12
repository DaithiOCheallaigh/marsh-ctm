import React from 'react';

interface Tab {
  id: string;
  label: string;
  count: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  return (
    <div className={`inline-flex h-8 items-start border bg-white rounded-lg border-solid border-[#26A8F6] ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex h-8 justify-center items-center gap-3 cursor-pointer transition-all duration-200 px-5 py-3 rounded-lg ${
            activeTab === tab.id
              ? 'bg-[#002C77] text-white'
              : 'text-[#002C77] hover:bg-gray-50'
          }`}
        >
          <span className="shrink-0 text-center text-xs font-bold tracking-[-0.24px]">
            {tab.label} ({tab.count})
          </span>
        </button>
      ))}
    </div>
  );
};
