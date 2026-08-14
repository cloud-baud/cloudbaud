import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Cpu, Shield, Database, LayoutGrid, Zap, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useTheme } from 'next-themes';
import SEO from '@/components/common/SEO';

const AiEngineeringPage = () => {
    const vantaRef = useRef(null);
    const { theme } = useTheme();

    // Re-use Vanta effect from HomePage for consistency if desired, or keep it cleaner. 
    // For this specific service page, a cleaner tech background might be better to focus on content.
    // I'll use a subtle grid or gradient instead to differentiate, unless requested otherwise.
    // Actually, let's keep it consistent with the "Premium" feel.

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <SEO
                title="AI Engineering Services: Custom ML & LLM Solutions for Enterprise"
                description="Hire an expert AI Engineer for custom ML/LLM solutions. We build production-grade RAG systems, AI agents, and scalable machine learning architectures for enterprise data platforms."
                keywords="hire AI engineer, custom LLM integration developer, AI system architecture consultant, RAG system development, Azure Databricks AI, Enterprise AI solutions"
                canonical="/ai-engineering"
            />

            {/* Hero Section */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 opacity-90"></div>
                    {/* Abstract grid/tech pattern could go here */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0, 210, 255, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm font-semibold mb-8 backdrop-blur-sm">
                        <Brain className="w-4 h-4" />
                        <span>Specialized AI Engineering</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-white tracking-tight">
                        Turn GenAI Hype into <br />
                        <span className="text-brand-blue drop-shadow-[0_0_15px_rgba(0,210,255,0.5)]">Production Reality</span>
                    </h1>

                    <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                        We don't just write prompts. We engineer robust, scalable <span className="text-brand-aqua font-semibold">AI Systems</span>.
                        From RAG optimization to private LLM deployment, we bridge the gap between "it works in a notebook" and "it works for users."
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/80 text-black font-bold px-8 py-6 text-lg rounded-lg shadow-lg shadow-brand-blue/20">
                            <Link to="/contact">
                                Discuss Your AI Strategy
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-slate-700 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-lg">
                            <Link to="#case-studies">View Case Examples</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* The "Real Problems" Section - Addressing Pain Points */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why AI Projects Fail (And How We Fix It)</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Most AI implementations stall at the prototype phase. We focus on the engineering challenges that actually matter.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-brand-blue/50 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-6 group-hover:bg-red-500/20">
                                <Shield className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">The Accuracy Trap</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 h-20">"It hallucinates 10% of the time." Generic RAG implementations fail on complex documents.</p>
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-sm font-semibold text-brand-blue flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Our Fix: Evaluation-Driven RAG
                                </span>
                            </div>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-brand-blue/50 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20">
                                <Cpu className="w-6 h-6 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Production Latency</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 h-20">Users won't wait 15 seconds for a chatbot. Chained API calls kill performance.</p>
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-sm font-semibold text-brand-blue flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Our Fix: Async Agent Orchestration
                                </span>
                            </div>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-brand-blue/50 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20">
                                <Database className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Data Silos</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 h-20">AI is useless if it can't access your real operational data securely.</p>
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-sm font-semibold text-brand-blue flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Our Fix: Vector-Native Data Platforms
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Capabilities */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Built on Modern AI Architecture</h2>
                        <p className="text-slate-400 text-lg mb-8">
                            We don't rely on black boxes. We build transparent, controllable, and observable AI systems using industry-standard engineering patterns.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center">
                                    <LayoutGrid className="w-4 h-4 text-brand-blue" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Agentic Workflows (LangGraph)</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Moving beyond simple chatbots to autonomous agents that can plan, execute tools, and verify their own work.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center">
                                    <Database className="w-4 h-4 text-brand-blue" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Hybrid Search (Qdrant/Pinecone)</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Combining semantic vector search with keyword precision (`BM25`) to ensure retrieval accuracy for technical domains.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-brand-blue" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">LLM Evaluation (MLflow)</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Rigorous testing pipelines to measure answer quality, faithfulness, and latency before every deployment.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual or Code Snippet */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-brand-aqua rounded-2xl blur opacity-30"></div>
                        <div className="relative bg-[#0d1117] rounded-xl border border-slate-800 p-6 font-mono text-sm overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                                <span className="text-slate-500">agent_orchestrator.py</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-brand-aqua">class <span className="text-brand-aqua">IntelligentAgent</span>:</div>
                                <div className="pl-4 text-slate-300">def <span className="text-blue-400">__init__</span>(self, tools):</div>
                                <div className="pl-8 text-slate-400">self.memory = <span className="text-emerald-400">VectorStoreMemory()</span></div>
                                <div className="pl-8 text-slate-400">self.planner = <span className="text-emerald-400">CoTPlanner(model="gpt-4-turbo")</span></div>
                                <div className="pl-4 text-slate-300">async def <span className="text-blue-400">execute</span>(self, query):</div>
                                <div className="pl-8 text-slate-400">plan = <span className="text-brand-aqua">await</span> self.planner.analyze(query)</div>
                                <div className="pl-8 text-slate-400">context = <span className="text-brand-aqua">await</span> self.memory.retrieve(query)</div>
                                <div className="pl-8 text-slate-400"><span className="text-brand-aqua">return</span> self.synthesize(plan, context)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Case Studies */}
            <section id="case-studies" className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Proven Engineering Results</h2>

                    <div className="space-y-8">
                        {/* Case Study 1 */}
                        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row gap-8 hover:border-brand-blue/30 transition-colors">
                            <div className="lg:w-1/3">
                                <div className="inline-block px-3 py-1 bg-brand-blue/10 text-brand-aqua rounded-full text-xs font-bold mb-4">MULTI-AGENT RAG</div>
                                <h3 className="text-2xl font-bold mb-4">Personal Life Intelligence Platform</h3>
                                <p className="text-slate-400 mb-6">An enterprise-grade retrieval system aggregating data across 6 domains (Finances, Health, Business, etc.).</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Qdrant</span>
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">LangChain</span>
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">FastAPI</span>
                                </div>
                            </div>
                            <div className="lg:w-2/3 border-l border-slate-200 dark:border-slate-800 lg:pl-8">
                                <h4 className="font-semibold text-lg mb-4 text-brand-blue">Engineering Highlights:</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300">Implemented <strong>semantic routing</strong> to direct queries to specific domain agents (e.g., "Health Agent" vs "Finance Agent").</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300">Reduced hallucination rate by 40% using <strong>citation-backed generation</strong> protocols.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Case Study 2 */}
                        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row gap-8 hover:border-brand-blue/30 transition-colors">
                            <div className="lg:w-1/3">
                                <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold mb-4">INTELLIGENT MATCHING</div>
                                <h3 className="text-2xl font-bold mb-4">USJobs.tech Hiring Platform</h3>
                                <p className="text-slate-400 mb-6">Automated candidate scoring and visa-sponsorship matching engine using generative AI analysis of resumes.</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Supabase</span>
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">OpenAI</span>
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Edge Functions</span>
                                </div>
                            </div>
                            <div className="lg:w-2/3 border-l border-slate-200 dark:border-slate-800 lg:pl-8">
                                <h4 className="font-semibold text-lg mb-4 text-brand-blue">Engineering Highlights:</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300">Built a <strong>structured extraction pipeline</strong> to convert unstructured resume PDFs into searchable JSON profiles.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300">Optimized matching latency to &lt;200ms using <strong>database-native vector search</strong> (pgvector).</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-50"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Stop Experimenting. Start Engineering.</h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        Your AI initiative needs more than a prompt engineer. It needs a systems architect. Let's build something production-ready.
                    </p>
                    <div className="flex justify-center">
                        <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/80 text-black px-12 py-8 text-xl rounded-xl font-bold shadow-[0_0_20px_rgba(0,210,255,0.3)] hover:shadow-[0_0_30px_rgba(0,210,255,0.5)] transition-all transform hover:-translate-y-1">
                            <Link to="/contact">
                                Schedule Strategy Call
                                <ArrowRight className="ml-2 h-6 w-6" />
                            </Link>
                        </Button>
                    </div>
                    <p className="mt-6 text-sm text-slate-500">Limited availability for Q1 2026. Prioritizing enterprise RAG & Platform projects.</p>
                </div>
            </section>
        </div>
    );
};

export default AiEngineeringPage;

