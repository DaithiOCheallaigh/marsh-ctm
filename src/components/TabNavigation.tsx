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
    <div 
      className={`inline-flex items-center rounded-lg overflow-hidden border border-[hsl(200,100%,56%)] ${className}`}
      role="tablist"
      aria-label="Filter work items"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center justify-center
            px-4 py-2
            text-xs font-semibold tracking-wide
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[hsl(197,100%,44%)] focus:ring-inset
            ${activeTab === tab.id
              ? 'bg-[hsl(220,100%,24%)] text-white'
              : 'bg-white text-[hsl(220,100%,24%)] hover:bg-[hsl(210,20%,98%)]'
            }
            ${index > 0 ? 'border-l border-[hsl(200,100%,56%)]' : ''}
          `}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
};
