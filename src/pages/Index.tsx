import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { WorkQueueTable } from '@/components/WorkQueueTable';

const Index = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[hsl(0,0%,97%)]">
      {/* Google Font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap"
      />
      
      {/* Header - Full Width */}
      <div className="w-full px-6 pt-6">
        <Header userName="[First Name]" />
      </div>
      
      {/* Content Area with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-[300px] px-8 pt-6 pb-10">
          <WorkQueueTable />
        </main>
      </div>
    </div>
  );
};

export default Index;
