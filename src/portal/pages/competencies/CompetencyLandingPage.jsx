import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, Calculator, Target, Eye } from 'lucide-react';
import { Button } from '@/shared/components/button';
import SEO from '@/components/common/SEO';
import InteractiveArchitecture from '@/components/competencies/InteractiveArchitecture';
import BeforeAfterComparison from '@/components/competencies/BeforeAfterComparison';
import FearFactorAlert from '@/components/competencies/FearFactorAlert';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const CompetencyLandingPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [competency, setCompetency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('with'); // 'with' | 'without'
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    fetchCompetency();
  }, [slug]);

  const fetchCompetency = async () => {
    try {
      setLoading(true);
      
      // Query from marketing schema
      const { data, error } = await supabase
        .from('competency_demos')
        .select(`
          *,
          competency:competencies(id, slug, title, category, icon, tagline, overview),
          industry:industries(id, slug, name, icon)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setCompetency(data);
      
      // Track view analytics
      trackView(data.id);
    } catch (err) {
      console.error('Error fetching competency:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (demoId) => {
    try {
      await supabase.from('demo_analytics').insert({
        demo_id: demoId,
        user_id: user?.id || null,
        session_id: getSessionId(),
        interaction_type: 'view',
        demo_opened: false,
      });
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  const trackInteraction = async (interactionType) => {
    if (!competency) return;
    try {
      await supabase.from('demo_analytics').insert({
        demo_id: competency.id,
        user_id: user?.id || null,
        session_id: getSessionId(),
        interaction_type: interactionType,
        demo_opened: interactionType.includes('demo'),
      });
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('cbdc_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('cbdc_session_id', sessionId);
    }
    return sessionId;
  };

  const handlePrimaryCTA = () => {
    setShowDemo(true);
    trackInteraction('demo_opened');
    // Scroll to demo section
    document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSecondaryCTA = () => {
    trackInteraction('contact_clicked');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-slate-400">Loading interactive demo...</p>
        </div>
      </div>
    );
  }

  if (!competency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Competency Not Found</h2>
          <p className="text-slate-400 mb-8">The competency you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/capabilities">← Back to Capabilities</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${competency.competency.title} | CloudBaud`}
        description={competency.tagline}
        canonical={`/competencies/${competency.slug}`}
      />

      {/* HERO - 20% */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link to="/capabilities" className="text-sm text-slate-400 hover:text-brand-blue transition-colors">
              ← Back to Capabilities
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-4">
                <span>{competency.competency.category}</span>
                {competency.industry && <span>• {competency.industry.name}</span>}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                {competency.competency.title}
              </h1>
              <p className="text-2xl text-slate-300 mb-4 leading-relaxed">
                {competency.tagline}
              </p>
              <p className="text-lg text-brand-aqua font-semibold mb-8">
                {competency.key_benefit}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handlePrimaryCTA}
                  className="bg-brand-blue hover:bg-brand-blue/80 text-black px-8 py-6 text-lg rounded-lg shadow-lg shadow-brand-blue/20 transition-all font-bold"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {competency.primary_cta_text}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  onClick={handleSecondaryCTA}
                  className="border-slate-700 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-lg transition-all"
                >
                  <Link to={competency.secondary_cta_url || '/contact'}>
                    {competency.secondary_cta_text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-6">At a Glance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Demo Type</span>
                  <span className="text-white font-semibold capitalize">{competency.demo_type?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400">Time to Explore</span>
                  <span className="text-white font-semibold">{competency.challenge_time_estimate || '5 min'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-400">Authentication</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    competency.requires_auth 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'bg-green-500/10 text-green-500 border border-green-500/20'
                  }`}>
                    {competency.requires_auth ? 'Required' : 'Public'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEAR FACTOR - Alert Section */}
      {competency.fear_factor && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <FearFactorAlert fearFactor={competency.fear_factor} />
          </div>
        </section>
      )}

      {/* VISUAL ANCHOR - 50% (Interactive Demo) */}
      <section id="interactive-demo" className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Interactive Demo</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Explore the architecture and see how it works in real-time
            </p>
          </div>

          {/* Mode Toggle */}
          {competency.demo_type === 'react_flow' && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => {
                  setMode('without');
                  trackInteraction('toggle_without');
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  mode === 'without'
                    ? 'bg-red-500/20 text-red-400 border-2 border-red-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-red-500/40'
                }`}
              >
                ❌ Without CloudBaud
              </button>
              <button
                onClick={() => {
                  setMode('with');
                  trackInteraction('toggle_with');
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  mode === 'with'
                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-green-500/40'
                }`}
              >
                ✅ With CloudBaud
              </button>
            </div>
          )}

          {/* Demo Component */}
          {competency.demo_type === 'react_flow' && competency.demo_config && (
            <InteractiveArchitecture
              config={competency.demo_config}
              mode={mode}
              height="600px"
              onNodeClick={(node) => {
                console.log('Node clicked:', node);
                trackInteraction('node_clicked');
              }}
            />
          )}

          {competency.demo_embed_url && (
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
              <iframe
                src={competency.demo_embed_url}
                className="w-full h-[600px]"
                title={`${competency.competency.title} Demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </section>

      {/* BEFORE/AFTER COMPARISON - 20% */}
      {competency.metrics && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <BeforeAfterComparison metrics={competency.metrics} />
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Platform?</h2>
          <p className="text-xl text-slate-300 mb-10">
            Let's discuss how we can implement this for your environment
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-blue hover:bg-brand-blue/80 text-black px-10 py-7 text-xl rounded-lg shadow-xl shadow-brand-blue/20 font-bold"
            >
              <Link to="/contact" onClick={() => trackInteraction('final_cta_contact')}>
                Schedule Consultation
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-700 text-white hover:bg-white/5 px-10 py-7 text-xl rounded-lg font-bold transition-all"
            >
              <Link to="/capabilities">
                Explore More Capabilities
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompetencyLandingPage;
