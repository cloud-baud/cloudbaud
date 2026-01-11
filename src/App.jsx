import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
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
import SignupPage from './components/SignupPage';
import LoginPage from './components/LoginPage';
import RedirectHandler from './components/RedirectHandler';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Router>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/:slug" element={<AgentDetail />} />
              <Route path="/capabilities" element={<CapabilitiesPage />} />
              <Route path="/capabilities/:slug" element={<CapabilityDetailPage />} />
              <Route path="/capabilities/:slug/:techSlug" element={<TechnologyDetailPage />} />
              <Route path="/industries" element={<IndustriesPage />} />
              <Route path="/industries/:slug" element={<IndustryDetail />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-and-conditions" element={<TermsPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/logout" element={<RedirectHandler to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

