import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from 'next-themes';
//import DynamicMsalProvider from "synolic.core";
import { AppearanceProvider } from 'synolic.core';
//import MarketingLayout from './portal/layout/MarketingLayout';
import WorkspaceLayout from './workspace/WorkspaceLayout';
import PortalDashboard from './workspace/PortalDashboard';
import FabricDemo from './workspace/sales/FabricDemo';
import SettingsPage from './workspace/settings/UniversalSettingsPage'; // New Universal Standard
import PlaceholderPage from './workspace/PlaceholderPage';
import PitchDeckPage from './workspace/PitchDeckPage';
import ContextLayout from './workspace/ContextLayout';


import HomePage from './portal/pages/HomePage';
import ServicesPage from './portal/pages/ServicesPage';
import AboutPage from './portal/pages/AboutPage';
import ContactPage from './portal/pages/ContactPage';
import PortfolioPage from './portal/pages/PortfolioPage';
import ResourcePlaceholderPage from './portal/pages/ResourcePlaceholderPage';

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
import ConfirmPage from './pages/auth/ConfirmPage';
import RedirectHandler from './components/auth/RedirectHandler';
import AuthRedirector from './components/auth/AuthRedirector';
import AiEngineeringPage from './portal/pages/engineering/AiEngineeringPage';
import CompetencyLandingPage from './portal/pages/competencies/CompetencyLandingPage';

import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import ContentControl from './workspace/ContentControl';
import ConsultingDashboard from './workspace/consulting/ConsultingDashboard';

import ProtectedRoute from './components/auth/ProtectedRoute';
import FinanceGuard, { isFinanceAuthorized } from './components/auth/FinanceGuard'; // NEW: Finance Guard
import DevPersonaSwitcher from './components/auth/DevPersonaSwitcher';


import CrmDashboard from './workspace/crm/CrmDashboard';
import SalesDashboard from './workspace/sales/SalesDashboard';
import MarketingDashboard from './workspace/marketing/MarketingDashboard';
import SystemStatus from './pages/SystemStatus';
import AccessManagement from './workspace/admin/AccessManagement';
import CmdbDashboard from './workspace/it/CmdbDashboard';
import CmdbDashboardPreview from './workspace/it/CmdbDashboardPreview';
import CalendarPage from './workspace/productivity/CalendarPage';
import InboxViewerPage from './workspace/InboxViewerPage';
import BookingPage from './pages/BookingPage';
import { Toaster } from './shared/ui/sonner';
import LegalDashboard from './workspace/legal/LegalDashboard';
import ProvisionalPatentsDashboard from './workspace/legal/ProvisionalPatentsDashboard';
import NdaForm from './workspace/legal/NdaForm';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const AirGappedFinanceRedirect = () => {
    const { user, session, aal } = useAuth();
    const isAuthorized = isFinanceAuthorized(user);

    const handleRedirect = () => {
        const financeOrigin = window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:17118'
            : 'https://finance.cloudbaud.com';

        if (isAuthorized && session?.access_token) {
            // One-time secure session hand-off redirect
            window.location.href = `${financeOrigin}/auth/handoff?access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
        } else {
            window.location.href = `${financeOrigin}/workspace/finance`;
        }
    };

    // Verify if account has set up multi-factor authenticator enrollment (reaches assurance level 2)
    const isMfaConfigured = aal?.nextLevel === 'aal2';

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-5 rounded-full mb-6 relative">
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping duration-1000" />
                <ShieldCheck className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">
                Air-Gapped Finance Console
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg mb-8 leading-relaxed text-sm">
                To guarantee zero database and JavaScript bundle spillover, financial operations have been physically isolated to a dedicated secure subdomain under compliance audit guidelines.
            </p>
            {!isAuthorized ? (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-6 max-w-md w-full mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/30 mb-3">
                        Access Restricted
                    </span>
                    <p className="text-xs text-red-600 dark:text-red-400">
                        Your account <strong>{user?.email}</strong> is not listed on the authorized credentials list for financial access.
                    </p>
                </div>
            ) : !isMfaConfigured ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-6 max-w-md w-full mb-8 space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                        MFA Enrollment Required
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Although your identity is verified, <strong>compliance security guidelines</strong> require that you enable Multi-Factor Authentication (2FA) before entering the sensitive Finance Vault.
                    </p>
                    <a
                        href="/workspace/settings?tab=security"
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
                    >
                        Enable Authenticator App <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 mb-3">
                        Identity Verified
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Account <strong>{user?.email}</strong> is fully authorized for financial access. Click below to transfer session and open the isolated console.
                    </p>
                    <button
                        onClick={handleRedirect}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        Enter Finance Vault <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
            <a href="/workspace" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                Return to standard workspace
            </a>
        </div>
    );
};

function App() {
  console.log('App: Rendering...');
  return (
    //<DynamicMsalProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AppearanceProvider appId="cloudbaud" defaultAccent="#3b82f6" defaultPortalAccent="#3b82f6">
          <AuthProvider>
            <ContentProvider>
              <Router>
                <Toaster />
                <AuthRedirector />
                <Routes>
                <Route path="/book" element={<BookingPage />} />

                {/* Protected Portal Routes */}
                <Route element={<ProtectedRoute />}>
        <Route path="/portal" element={<Navigate to="/workspace" replace />} />
                  <Route path="/workspace/settings" element={<SettingsPage />} />
                  <Route path="/workspace" element={<WorkspaceLayout />}>
                    <Route index element={<PortalDashboard />} />
                    
                    <Route path="fabric-demo" element={<FabricDemo />} />

                    {/* Placeholder Routes for Sidebar Items */}
                    <Route path="tasks" element={<PlaceholderPage />} />
                    <Route path="deck" element={<PitchDeckPage />} />
                    <Route path="interview" element={<PlaceholderPage />} />
                    <Route path="fundraising" element={<PlaceholderPage />} />
                    <Route path="engineering" element={<PlaceholderPage />} />
                    <Route path="network" element={<PlaceholderPage />} />

                    {/* Business Apps Routes */}
                    {/* Secure Isolated Finance Redirection */}
                    <Route path="finance" element={<AirGappedFinanceRedirect />} />
                    <Route path="support" element={<PlaceholderPage />} />
                    <Route path="crm" element={<CrmDashboard />} />
                    <Route path="sales" element={<SalesDashboard />} />
                    <Route path="marketing" element={<MarketingDashboard />} />
                    <Route path="system-status" element={<SystemStatus />} />

                    {/* Legal Routes */}
                    <Route path="legal" element={<LegalDashboard />} />
                    <Route path="legal/patents" element={<ProvisionalPatentsDashboard />} />
                    <Route path="legal/contracts" element={<NdaForm />} />
                    <Route path="legal/compliance" element={<PlaceholderPage />} />

                    {/* IT Routes */}
                    <Route path="it/cmdb" element={<CmdbDashboard />} />
                    {import.meta.env?.DEV && (
                      <Route path="it/cmdb-preview" element={<CmdbDashboardPreview />} />
                    )}
                    <Route path="it" element={<Navigate to="it/cmdb" replace />} />

                    {/* Admin Routes */}
                    <Route path="admin/access" element={<AccessManagement />} />

                    {/* Productivity Routes */}
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="inbox" element={<InboxViewerPage />} />

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
                  <Route path="/competencies/:slug" element={<CompetencyLandingPage />} />
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
                  <Route path="/platforms/cloud" element={<ResourcePlaceholderPage title="Cloud Infrastructure" category="Platform" description="Reference architecture for resilient cloud workloads, landing zones, and deployment guardrails." />} />
                  <Route path="/platforms/edge" element={<ResourcePlaceholderPage title="Edge Computing" category="Platform" description="Edge patterns for low-latency compute, telemetry ingestion, and secure sync back to the core platform." />} />
                  <Route path="/platforms/hybrid" element={<ResourcePlaceholderPage title="Hybrid Mesh" category="Platform" description="Hybrid connectivity model across cloud, private network, and edge with policy-driven routing." />} />
                  <Route path="/platforms/serverless" element={<ResourcePlaceholderPage title="Serverless SDK" category="Platform" description="Serverless integration guide, event templates, and reliability standards for CloudBaud workloads." />} />
                  <Route path="/platforms/data" element={<ResourcePlaceholderPage title="Data Fabric" category="Platform" description="Unified data governance, integration, and analytics fabric template for enterprise implementation." />} />

                  <Route path="/engineering/architecture" element={<ResourcePlaceholderPage title="System Architecture" category="Engineering" description="Architecture blueprint patterns, boundary definitions, and scaling guides for product teams." />} />
                  <Route path="/engineering/devops" element={<ResourcePlaceholderPage title="DevOps and CI/CD" category="Engineering" description="Pipeline standards, release controls, and environment promotion model used by CloudBaud." />} />
                  <Route path="/engineering/security" element={<ResourcePlaceholderPage title="Cybersecurity" category="Engineering" description="Security posture baseline including IAM, zero-trust controls, and incident readiness." />} />
                  <Route path="/engineering/performance" element={<ResourcePlaceholderPage title="Performance" category="Engineering" description="Performance tuning checklist for APIs, data jobs, and front-end delivery with measurable SLIs." />} />
                  <Route path="/engineering/scalability" element={<ResourcePlaceholderPage title="Scalability" category="Engineering" description="Scale-out architecture and capacity planning template for growth-ready systems." />} />
                  <Route path="/engineering/microservices" element={<ResourcePlaceholderPage title="Microservices" category="Engineering" description="Service decomposition, contracts, and observability patterns for distributed architecture." />} />

                  <Route path="/docs" element={<ResourcePlaceholderPage title="Documentation" category="Resource" documentType="Documentation" description="CloudBaud-branded documentation template with standardized sections for technical and business readers." />} />
                  <Route path="/whitepapers" element={<ResourcePlaceholderPage title="Whitepapers" category="Resource" documentType="Whitepaper" description="Thought-leadership whitepaper template with executive framing, architecture detail, and implementation notes." />} />
                  <Route path="/case-studies" element={<ResourcePlaceholderPage title="Case Studies" category="Resource" documentType="Case Study" description="Outcome-focused case study template using the CloudBaud logo system and narrative structure." />} />
                  <Route path="/api" element={<ResourcePlaceholderPage title="API Reference" category="Resource" documentType="API Reference" description="API reference shell with endpoint taxonomy, authentication notes, and error model placeholders." />} />
                  <Route path="/community" element={<ResourcePlaceholderPage title="Community" category="Resource" description="Community program overview template for collaboration, contribution, and events." />} />
                  <Route path="/events" element={<ResourcePlaceholderPage title="Events" category="Resource" description="Events page template for webinars, workshops, and release briefings." />} />

                  <Route path="/support" element={<ResourcePlaceholderPage title="Help Center" category="Support" description="Support center placeholder with triage model, support tiers, and response expectations." />} />
                  <Route path="/status" element={<SystemStatus />} />
                  <Route path="/console" element={<ResourcePlaceholderPage title="CloudBaud Console" category="Account" description="Console landing placeholder for account operations, environment management, and usage visibility." />} />
                  <Route path="/billing" element={<ResourcePlaceholderPage title="Billing" category="Account" description="Billing placeholder for plan visibility, invoices, and consumption tracking." />} />
                  <Route path="/dev-id" element={<ResourcePlaceholderPage title="Developer ID" category="Account" description="Developer identity placeholder covering credentials, tokens, and integration access." />} />
                  <Route path="/news" element={<ResourcePlaceholderPage title="Newsroom" category="Company" description="Newsroom placeholder for announcements, media notes, and release updates." />} />
                  <Route path="/ethics" element={<ResourcePlaceholderPage title="Ethics" category="Company" description="Ethics and AI responsibility placeholder for principles, governance, and accountability." />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-and-conditions" element={<TermsPage />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/site-map" element={<SiteMapPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/confirm" element={<ConfirmPage />} />
                  <Route path="/logout" element={<RedirectHandler to="/" />} />
                </Route>
                </Routes>
                {/* Dev Tools (Only visible in Development) */}
                <DevPersonaSwitcher />
              </Router>
            </ContentProvider>
          </AuthProvider>
        </AppearanceProvider>
      </ThemeProvider>
   // </DynamicMsalProvider>
  );
}

export default App;
