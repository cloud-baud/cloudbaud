import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from 'next-themes';
import DynamicMsalProvider from './components/auth/DynamicMsalProvider';
import { AppearanceProvider } from 'synolic.core';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import { Toaster } from './shared/ui/sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FinanceGuard from './components/auth/FinanceGuard';
import WorkspaceLayout from './workspace/WorkspaceLayout';
import ContextLayout from './workspace/ContextLayout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Import Finance Dashboards ONLY
import FinOpsDashboard from './finance/dashboards/FinOpsDashboard';
import TaxMultiYearSummary from './finance/dashboards/TaxMultiYearSummary';
import TaxSingleYear from './finance/dashboards/TaxSingleYear';
import AccountingDashboard from './finance/dashboards/AccountingDashboard';
import BookkeepingDashboard from './finance/dashboards/BookkeepingDashboard';
import AccountLedger from './finance/dashboards/AccountLedger';
import PlaceholderPage from './workspace/PlaceholderPage';
import ConsultingDashboard from './workspace/consulting/ConsultingDashboard';

// Supabase Direct for Handoff
import { supabase } from './lib/supabase';

// Secure Handoff Landing Component with Vault Transition UI
const AuthHandoff = () => {
    const navigate = useNavigate();
    const [status, setStatus] = React.useState('Initializing session hand-off...');

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');

        if (accessToken && refreshToken) {
            setStatus('Synchronizing CloudBaud Vault credentials...');
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            }).then(({ data, error }) => {
                if (error) {
                    console.error('[Handoff] Error setting session:', error);
                    setStatus('Session synchronization failed. Redirecting to manual login...');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setStatus('Identity verified. Unlocking financial console...');
                    setTimeout(() => navigate('/workspace/finance'), 1000);
                }
            }).catch(err => {
                console.error('[Handoff] Unexpected error:', err);
                setStatus('Vault validation error. Redirecting...');
                setTimeout(() => navigate('/login'), 2000);
            });
        } else {
            setStatus('No active credentials. Please log in directly...');
            setTimeout(() => navigate('/login'), 1500);
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#070b15] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mb-8">
                {/* Vault Glow Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-brand-blue/20 animate-ping duration-1000" />
                <div className="absolute inset-2 rounded-full border border-blue-500/40 animate-pulse" />
                <div className="absolute inset-4 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2 font-sans">CloudBaud Vault Security</h2>
            <p className="text-slate-400 text-sm max-w-md">{status}</p>
        </div>
    );
};

function FinanceApp() {
    console.log('FinanceApp: Mounting isolated console...');
    return (
        <DynamicMsalProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                <AppearanceProvider appId="cloudbaud" defaultAccent="#3b82f6" defaultPortalAccent="#3b82f6">
                    <AuthProvider>
                        <ContentProvider>
                            <Router>
                                <Toaster />
                                <Routes>
                                    {/* Handoff Route */}
                                    <Route path="/auth/handoff" element={<AuthHandoff />} />

                                    {/* Standard Auth fallbacks for direct domain visitors */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/signup" element={<SignupPage />} />

                                    {/* Secured Finance Module */}
                                    <Route element={<ProtectedRoute />}>
                                        <Route path="/" element={<Navigate to="/workspace/finance" replace />} />
                                        <Route path="/workspace" element={<WorkspaceLayout />}>
                                            <Route index element={<Navigate to="finance" replace />} />
                                            <Route element={<FinanceGuard />}>
                                                <Route path="finance" element={<ContextLayout />}>
                                                    <Route index element={<FinOpsDashboard />} />
                                                    <Route path="taxes" element={<TaxMultiYearSummary />} />
                                                    <Route path="taxes/year" element={<TaxSingleYear />} />
                                                    <Route path="bookkeeping" element={<BookkeepingDashboard />} />
                                                    <Route path="accounting" element={<AccountingDashboard />} />
                                                    <Route path="accounting/:accountId" element={<AccountLedger />} />
                                                    <Route path="investments" element={<PlaceholderPage />} />
                                                    <Route path="consulting" element={<ConsultingDashboard />} />
                                                </Route>
                                            </Route>
                                            
                                            {/* Catch-all to redirect back to main app if clicking other routes */}
                                            <Route path="*" element={<Navigate to="/workspace/finance" replace />} />
                                        </Route>
                                    </Route>
                                </Routes>
                            </Router>
                        </ContentProvider>
                    </AuthProvider>
                </AppearanceProvider>
            </ThemeProvider>
        </DynamicMsalProvider>
    );
}

export default FinanceApp;
