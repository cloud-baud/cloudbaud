import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MarketingLayout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MarketingLayout;
