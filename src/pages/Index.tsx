import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { WorkQueueTable } from '@/components/WorkQueueTable';

const Index = () => {
  return (
    <div className="flex w-full min-h-screen bg-[#F8F8F8]">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap"
      />
      
      <Sidebar />
      
      <main className="w-[calc(100%-331px)] ml-[331px] pl-0 pr-9 pt-4 pb-9">
        <Header userName="[First Name]" />
        <WorkQueueTable />
      </main>
    </div>
  );
};

export default Index;
