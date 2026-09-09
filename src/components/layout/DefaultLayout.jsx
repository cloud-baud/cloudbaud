import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const DefaultLayout = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col">
      <Header />
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;