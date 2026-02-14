import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from 'next-themes';
import DynamicMsalProvider from './components/auth/DynamicMsalProvider';
import MarketingLayout from './portal/layout/MarketingLayout';
import WorkspaceLayout from './collaboration/WorkspaceLayout';
import PortalDashboard from './collaboration/PortalDashboard';
import FabricDemo from './collaboration/sales/FabricDemo';
import FinOpsDashboard from './collaboration/FinOpsDashboard';
// import SettingsPage from './collaboration/settings/SettingsPage'; // OLD: Local version
import { SettingsPage } from 'common-features/frontend/components/features/settings/SettingsPage'; // NEW: CommonFeatures master
import PlaceholderPage from './collaboration/PlaceholderPage';
import ContextLayout from './collaboration/ContextLayout';
import TaxDashboard from './collaboration/finance/TaxDashboard';
import AccountingDashboard from './collaboration/finance/AccountingDashboard';
import BookkeepingDashboard from './collaboration/finance/BookkeepingDashboard';


import HomePage from './portal/pages/HomePage';
import ServicesPage from './portal/pages/ServicesPage';
import AboutPage from './portal/pages/AboutPage';
import ContactPage from './portal/pages/ContactPage';
import PortfolioPage from './portal/pages/PortfolioPage';

import BlogPage from './portal/pages/blog/BlogPage';
import BlogPost from './portal/pages/blog/BlogPost';
import CareersPage from './portal/pages/careers/CareersPage';
import AgentsPage from './portal/pages/agents/AgentsPage';
import AgentDetail from './portal/pages/agents/AgentDetail';
import CapabilitiesPage from './portal/pages/capabilities/CapabilitiesPage';
import CapabilityDetailPage from './portal/pages/capabilities/CapabilityDetailPage';
import TechnologyDetailPage from './portal/pages/capabilities/TechnologyDetailPage';
import IndustriesPage from './portal/pages/industries/IndustriesPage';
import IndustryDetail from './portal/pages/industries/IndustryDetail';

import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';
import SalesPage from './portal/pages/SalesPage';
import LegalPage from './pages/legal/LegalPage';
import SiteMapPage from './pages/legal/SiteMapPage';

import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import RedirectHandler from './components/auth/RedirectHandler';
import AuthRedirector from './components/auth/AuthRedirector';
import AiEngineeringPage from './portal/pages/engineering/AiEngineeringPage';

import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import ContentControl from './collaboration/ContentControl';
import ConsultingDashboard from './collaboration/consulting/ConsultingDashboard';

import ProtectedRoute from './components/auth/ProtectedRoute';
import FinanceGuard from './components/auth/FinanceGuard'; // NEW: Finance Guard
import DevPersonaSwitcher from './components/auth/DevPersonaSwitcher';


import CrmDashboard from './collaboration/crm/CrmDashboard';
import SalesDashboard from './collaboration/sales/SalesDashboard';
import MarketingDashboard from './collaboration/marketing/MarketingDashboard';
import SystemStatus from './pages/SystemStatus';
import AccessManagement from './collaboration/admin/AccessManagement';
import CmdbDashboard from './collaboration/it/CmdbDashboard';
import CalendarPage from './collaboration/productivity/CalendarPage';
import BookingPage from './pages/BookingPage';
import { Toaster } from './shared/ui/sonner';

function App() {
  console.log('App: Rendering...');
  return (
    <DynamicMsalProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <ContentProvider>
            <Router>
              <Toaster />
              <AuthRedirector />
              <Routes>
                <Route path="/book" element={<BookingPage />} />

                {/* Protected Portal Routes */}
                <Route element={<ProtectedRoute />}>
        <Route path="/portal" element={<Navigate to="/collaboration" replace />} />
                  <Route path="/collaboration" element={<WorkspaceLayout />}>
                    <Route index element={<PortalDashboard />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="fabric-demo" element={<FabricDemo />} />

                    {/* Placeholder Routes for Sidebar Items */}
                    <Route path="tasks" element={<PlaceholderPage />} />
                    <Route path="deck" element={<PlaceholderPage />} />
                    <Route path="interview" element={<PlaceholderPage />} />
                    <Route path="fundraising" element={<PlaceholderPage />} />
                    <Route path="engineering" element={<PlaceholderPage />} />
                    <Route path="network" element={<PlaceholderPage />} />

                    {/* Business Apps Routes */}
                    <Route element={<FinanceGuard />}>
                        <Route path="finance" element={<ContextLayout />}>
                            <Route index element={<FinOpsDashboard />} />
                            <Route path="taxes" element={<TaxDashboard />} />
                            <Route path="bookkeeping" element={<BookkeepingDashboard />} />
                            <Route path="accounting" element={<AccountingDashboard />} />
                            <Route path="investments" element={<PlaceholderPage />} />
                        </Route>
                    </Route>
                    <Route path="support" element={<PlaceholderPage />} />
                    <Route path="crm" element={<CrmDashboard />} />
                    <Route path="sales" element={<SalesDashboard />} />
                    <Route path="marketing" element={<MarketingDashboard />} />
                    <Route path="consulting" element={<ConsultingDashboard />} />
                    <Route path="system-status" element={<SystemStatus />} />

                    {/* IT Routes */}
                    <Route path="it/cmdb" element={<CmdbDashboard />} />
                    <Route path="it" element={<Navigate to="it/cmdb" replace />} />

                    {/* Admin Routes */}
                    <Route path="admin/access" element={<AccessManagement />} />

                    {/* Productivity Routes */}
                    <Route path="calendar" element={<CalendarPage />} />

                    {/* Catch-all for sub-sites like /sites/consulting to use portal layout */}
                    <Route path="sites/*" element={<PortalDashboard />} />
                    <Route path="*" element={<PortalDashboard />} />
                  </Route>


                </Route>

                {/* Marketing Website */}
                <Route element={<MarketingLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/agents/:slug" element={<AgentDetail />} />
                  <Route path="/capabilities" element={<CapabilitiesPage />} />
                  <Route path="/capabilities/:slug" element={<CapabilityDetailPage />} />
                  <Route path="/capabilities/:slug/:techSlug" element={<TechnologyDetailPage />} />
                  <Route path="/industries" element={<IndustriesPage />} />
                  <Route path="/industries/:slug" element={<IndustryDetail />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/ai-engineering" element={<AiEngineeringPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />

                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/careers" element={<CareersPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-and-conditions" element={<TermsPage />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/site-map" element={<SiteMapPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/logout" element={<RedirectHandler to="/" />} />
                </Route>
              </Routes>
              {/* Dev Tools (Only visible in Development) */}
              <DevPersonaSwitcher />
            </Router>
          </ContentProvider>
        </AuthProvider>
      </ThemeProvider>
    </DynamicMsalProvider>
  );
}

export default App;
