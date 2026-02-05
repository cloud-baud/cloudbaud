import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from 'next-themes';
import DynamicMsalProvider from './components/auth/DynamicMsalProvider';
import MarketingLayout from './components/layout/MarketingLayout';
import WorkspaceLayout from './components/portal/WorkspaceLayout';
import PortalDashboard from './components/portal/PortalDashboard';
import FabricDemo from './components/portal/FabricDemo';
import FinOpsDashboard from './components/portal/FinOpsDashboard';
import SettingsPage from './components/portal/SettingsPage';
import PlaceholderPage from './components/portal/PlaceholderPage';
import ContextLayout from './components/portal/ContextLayout';
import TaxDashboard from './components/portal/finance/TaxDashboard';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PortfolioPage from './pages/PortfolioPage';

import BlogPage from './pages/BlogPage';
import BlogPost from './pages/BlogPost';
import CareersPage from './pages/CareersPage';
import AgentsPage from './pages/AgentsPage';
import AgentDetail from './pages/AgentDetail';
import CapabilitiesPage from './pages/CapabilitiesPage';
import CapabilityDetailPage from './pages/CapabilityDetailPage';
import TechnologyDetailPage from './pages/TechnologyDetailPage';
import IndustriesPage from './pages/IndustriesPage';
import IndustryDetail from './pages/IndustryDetail';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import SalesPage from './pages/SalesPage';
import LegalPage from './pages/LegalPage';
import SiteMapPage from './pages/SiteMapPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import RedirectHandler from './components/auth/RedirectHandler';
import AuthRedirector from './components/auth/AuthRedirector';
import AiEngineeringPage from './pages/AiEngineeringPage';

import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import ContentControl from './components/portal/ContentControl';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <DynamicMsalProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <ContentProvider>
            <Router>
              <AuthRedirector />
              <Routes>
                {/* Protected Portal Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/portal" element={<WorkspaceLayout />}>
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
                    <Route path="finance-board" element={<ContextLayout />}>
                      <Route index element={<PlaceholderPage />} />
                      <Route path="taxes" element={<TaxDashboard />} />
                      <Route path="bookkeeping" element={<PlaceholderPage />} />
                      <Route path="accounting" element={<PlaceholderPage />} />
                      <Route path="investments" element={<PlaceholderPage />} />
                    </Route>
                    <Route path="support" element={<PlaceholderPage />} />
                    <Route path="crm" element={<PlaceholderPage />} />
                    <Route path="sales" element={<PlaceholderPage />} />

                    {/* Catch-all for sub-sites like /sites/consulting to use portal layout */}
                    <Route path="sites/*" element={<PortalDashboard />} />
                    <Route path="*" element={<PortalDashboard />} />
                  </Route>

                  {/* Root-level App Modules (Authenticated) */}
                  <Route path="/finances" element={<WorkspaceLayout />}>
                    <Route index element={<FinOpsDashboard />} />
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
