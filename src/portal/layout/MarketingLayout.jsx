import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const MarketingLayout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MarketingLayout;
