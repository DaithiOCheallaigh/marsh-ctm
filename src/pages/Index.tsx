import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { WorkQueueTable } from '@/components/WorkQueueTable';

const Index = () => {
  return (
    <div className="flex w-full min-h-screen bg-[hsl(0,0%,97%)]">
      {/* Google Font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap"
      />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="w-[calc(100%-316px)] ml-[316px] px-8 pt-6 pb-10">
        <Header userName="[First Name]" />
        <WorkQueueTable />
      </main>
    </div>
  );
};

export default Index;
