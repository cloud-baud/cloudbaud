import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import GLOBE from 'vanta/dist/vanta.globe.min';
import { ArrowRight, Code, Cloud, Server, Smartphone, Database, Award, Users, CheckCircle, TrendingUp, Brain, Building, Shield, Activity, BarChart3, Terminal } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import SEO from './SEO';
import TechnologyStack from './TechnologyStack';
import ProcessTimeline from './ProcessTimeline';
import TrustedBy from './TrustedBy';
import PlatformDashboard from './PlatformDashboard';

const HomePage = () => {
  const vantaRef = useRef(null);
  const { theme } = useTheme();

  // We need to store the effect instance in a ref to persist across renders 
  // but we also want to mark when it's active so we don't double-init
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    // cleanup previous effect if it exists (e.g. strict mode double-mount)
    if (vantaEffect.current) {
      vantaEffect.current.destroy();
    }

    try {
      vantaEffect.current = GLOBE({
        el: vantaRef.current,
        THREE: THREE, // Pass THREE directly to Vanta
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x00d2ff,
        color2: 0x29ff7e,
        size: 1.1,
        backgroundColor: theme === 'dark' ? 0x010816 : 0xffffff,
        points: 12.00,
        maxDistance: 20.00,
        spacing: 16.00
      });
    } catch (error) {
      console.error('[VANTA] Initialization error:', error);
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, [theme]); // Re-run when theme changes to update background color

  const services = [
    {
      icon: Activity,
      title: 'Platform Operations',
      description: 'Ensuring 99.9% availability for mission-critical Databricks environments through proactive monitoring and RCA.'
    },
    {
      icon: TrendingUp,
      title: 'Cost & Performance',
      description: 'Optimizing cluster configurations and Spark jobs to reduce TCO while maximizing throughput.'
    },
    {
      icon: Shield,
      title: 'Security & Governance',
      description: 'Implementing Unity Catalog for robust access control, lineage, and compliance in healthcare data.'
    },
    {
      icon: Terminal,
      title: 'Developer Enablement',
      description: 'Building CI/CD pipelines (Terraform) and tooling to empower data engineering teams.'
    },
    {
      icon: Database,
      title: 'Healthcare Intelligence',
      description: 'Expert handling of healthcare insurance feeds, claims data, and regulatory compliance requirements.'
    }
  ];

  const stats = [
    { number: '5+ Years', label: 'Platform Engineering' },
    { number: '1000+', label: 'Pipelines Optimized' },
    { number: '30%', label: 'Avg Cost Reduction' },
    { number: '100%', label: 'Unity Catalog Adoption' }
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <SEO
        title="CloudBaud - Intelligent Systems Engineering"
        description="We architect mission-critical data platforms, optimizing cost, governance, and performance on Azure Databricks."
        keywords="CloudBaud, Data Engineering, Azure Databricks, AI Engineering, Intelligent Systems, Cloud Solutions"
        canonical="/"
      />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 pt-16">
        {/* Vanta Background Container */}
        <div ref={vantaRef} className="absolute inset-0 z-0 opacity-40"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-3xl">
            {/* Badge */}
            {/* Badge - Removed */}

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Architecting <span className="text-brand-blue drop-shadow-[0_0_8px_rgba(0,210,255,0.5)]">Mission-Critical</span> Data Platforms
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Balancing operational excellence, governance, and developer enablement on Azure Databricks.
              <br />
              <span className="text-base text-slate-400 mt-2 block">Specializing in Healthcare Data & Insurance Feeds.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Button
                asChild
                size="lg"
                className="bg-brand-blue hover:bg-brand-blue/80 text-black px-8 py-6 text-lg rounded-lg shadow-lg shadow-brand-blue/20 transition-all font-bold"
              >
                <Link to="/contact">
                  Start Your Transformation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 px-8 py-6 text-lg rounded-lg transition-all"
              >
                <Link to="/capabilities">Platform Expertise</Link>
              </Button>
            </div>
          </div>

          {/* Hero Dashboard Preview - Mobile/Tablet Only hidden on desktop if too crowded, but we want it visible */}
          <div className="hidden lg:block w-full animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-brand-aqua rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-slate-900 ring-1 ring-slate-800 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs text-slate-500 font-mono">databricks-platform-monitor.bash</div>
                </div>
                <div className="space-y-2 font-mono text-sm text-slate-300">
                  <div className="flex justify-between"><span>{'>'} checking_cluster_health...</span><span className="text-emerald-500">OK</span></div>
                  <div className="flex justify-between"><span>{'>'} optimizing_delta_tables...</span><span className="text-brand-blue">COMPLETED (2.4TB)</span></div>
                  <div className="flex justify-between"><span>{'>'} enforcing_unity_catalog...</span><span className="text-emerald-500">SECURE</span></div>
                  <div className="flex justify-between"><span>{'>'} analyzing_cost_metrics...</span><span className="text-amber-500">SAVINGS DETECTED</span></div>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-end">
                    <div>
                      <div className="text-xs text-slate-500">Current Throughput</div>
                      <div className="text-xl font-bold text-white">4.2 GB/s</div>
                    </div>
                    <div className="h-8 w-24 bg-gradient-to-t from-blue-500/20 to-transparent relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-brand-blue/40 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Insights Section - THE NANO BANANA INFOGRAPHIC */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/40 transition-colors border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Operational Visibility & Insights</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Advanced reporting providing stakeholders with real-time transparency into platform stability, cost utilization, and governance posture.
            </p>
          </div>
          <PlatformDashboard />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800">
                <div className="text-4xl md:text-5xl font-bold text-brand-blue mb-2 drop-shadow-[0_0_10px_rgba(0,210,255,0.3)]">
                  {stat.number}
                </div>
                <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-serif">
              Core Responsibilities
            </h2>
            <div className="w-20 h-1 bg-brand-aqua mx-auto mb-8 shadow-[0_0_10px_rgba(41,255,126,0.5)]"></div>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto">
              Delivering stability and innovation across the entire data platform lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:shadow-2xl dark:hover:border-brand-blue/30 transition-all duration-300 shadow-sm dark:shadow-none group"
              >
                <div className="w-14 h-14 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-blue/20 transition-colors">
                  <service.icon className="h-7 w-7 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {service.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/30 transition-colors">
        <div className="max-w-7xl mx-auto">
          <TechnologyStack />
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background transition-colors">
        <div className="max-w-7xl mx-auto">
          <ProcessTimeline />
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 overflow-hidden relative border-t border-slate-100 dark:border-slate-900 transition-colors">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-aqua"></div>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            Ready to build the future of <br /><span className="text-brand-aqua underline decoration-brand-blue/50 underline-offset-8">your business?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Contact us today to discuss your vision and learn how our engineering prowess can turn it into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-blue hover:bg-brand-blue/80 text-black px-10 py-7 text-xl rounded-lg shadow-xl shadow-brand-blue/20 font-bold"
            >
              <Link to="/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 px-10 py-7 text-xl rounded-lg font-bold transition-all"
            >
              <Link to="/about">Our Company</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
