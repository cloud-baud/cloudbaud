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
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthRedirector from './components/auth/AuthRedirector';
import { Toaster } from './shared/ui/sonner';

function App() {
  return (
    <DynamicMsalProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <ContentProvider>
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
                  <Route path="/collaboration" element={<WorkspaceLayout />}>
                    <Route index element={<PortalDashboard />} />
                    <Route element={<ContextLayout />}>
                      <Route path="finance/*" element={<FinanceApp />} />
                    </Route>
                  </Route>
                  <Route path="/workspace" element={<WorkspaceLayout />}>
                    <Route index element={<PortalDashboard />} />
                    <Route element={<ContextLayout />}>
                      <Route path="finance/*" element={<FinanceApp />} />
                    </Route>
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/collaboration" replace />} />
              </Routes>
            </Router>
          </ContentProvider>
        </AuthProvider>
      </ThemeProvider>
    </DynamicMsalProvider>
  );
}
export default App;