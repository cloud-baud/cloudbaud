import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from 'next-themes';
import DynamicMsalProvider from './components/DynamicMsalProvider';
import MarketingLayout from './components/MarketingLayout';
import WorkspaceLayout from './components/portal/WorkspaceLayout';
import PortalDashboard from './components/portal/PortalDashboard';
import FabricDemo from './components/portal/FabricDemo';
import FinOpsDashboard from './components/portal/FinOpsDashboard';
import SettingsPage from './components/portal/SettingsPage';
import PlaceholderPage from './components/portal/PlaceholderPage';
import ContextLayout from './components/portal/ContextLayout';
import TaxDashboard from './components/portal/finance/TaxDashboard';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PortfolioPage from './components/PortfolioPage';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import CareersPage from './components/CareersPage';
import AgentsPage from './components/AgentsPage';
import AgentDetail from './components/AgentDetail';
import CapabilitiesPage from './components/CapabilitiesPage';
import CapabilityDetailPage from './components/CapabilityDetailPage';
import TechnologyDetailPage from './components/TechnologyDetailPage';
import IndustriesPage from './components/IndustriesPage';
import IndustryDetail from './components/IndustryDetail';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import SalesPage from './components/SalesPage';
import LegalPage from './components/LegalPage';
import SiteMapPage from './components/SiteMapPage';
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import RedirectHandler from './components/RedirectHandler';
import AuthRedirector from './components/AuthRedirector';
import AiEngineeringPage from './components/AiEngineeringPage';

import { AuthProvider } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <DynamicMsalProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
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
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </DynamicMsalProvider>
  );
}

export default App;

