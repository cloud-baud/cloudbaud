import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from 'next-themes';
import DynamicMsalProvider from './components/auth/DynamicMsalProvider';
import MarketingLayout from './portal/layout/MarketingLayout';
import WorkspaceLayout from './workspace/collaboration/WorkspaceLayout';
import ContextLayout from './workspace/ContextLayout';
import PortalDashboard from './workspace/collaboration/WorkspaceDashboard';
import FinanceApp from './workspace/finance/FinanceApp';
import FabricDemo from './workspace/sales/FabricDemo';
import AuthConfirmPage from "./portal/pages/auth/AuthConfirmPage"
import HomePage from './portal/pages/HomePage';
import LoginPage from "./portal/pages/auth/LoginPage"
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { ContentProvider } from '@/shared/contexts/ContentContext';
import { ViewAsProvider } from './workspace/finance/ViewAsContext';
import { FontSizeProvider } from '@/shared/contexts/FontSizeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthRedirector from './components/auth/AuthRedirector';
import { Toaster } from './shared/ui/sonner';

function App() {
  const isFinanceHost = typeof window !== 'undefined' && window.location.hostname.includes('finance');
  return (
    <DynamicMsalProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <FontSizeProvider>
          <AuthProvider>
            <ContentProvider>
              <ViewAsProvider>
                <Router>
                  <Toaster />
                  <AuthRedirector />
              <Routes>
                <Route element={<MarketingLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} /> 
                  <Route path="/auth/confirm" element={<AuthConfirmPage />} />
                  <Route path="/fabric-demo" element={<FabricDemo />} />
                  <Route path="/sales/fabric-demo" element={<FabricDemo />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  {/* Main HQ: /collaboration/* */}
                  <Route path="/collaboration" element={<WorkspaceLayout />}>
                    <Route index element={<PortalDashboard />} />
                    <Route element={<ContextLayout />}>
                      {/* Finance on main domain still works, but if on finance subdomain, redirect to root */}
                      <Route path="finance/*" element={isFinanceHost ? <Navigate to="/" replace /> : <FinanceApp />} />
                    </Route>
                  </Route>
                  <Route path="/workspace" element={<WorkspaceLayout />}>
                    <Route index element={<PortalDashboard />} />
                    <Route element={<ContextLayout />}>
                      <Route path="finance/*" element={<FinanceApp />} />
                    </Route>
                  </Route>
                  {/* Finance subdomain clean routes - when built as main app accidentally, handle */}
                  <Route path="/finance/*" element={<FinanceApp />} />
                  <Route path="/*" element={<FinanceApp />} />
                </Route>
                <Route path="*" element={<Navigate to="/collaboration" replace />} />
              </Routes>
              </Router>
              </ViewAsProvider>
            </ContentProvider>
          </AuthProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </DynamicMsalProvider>
  );
}
export default App;
