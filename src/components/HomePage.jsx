import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Database, Smartphone, Code, Building } from 'lucide-react';
import { Button } from './ui/button';
import TestimonialCarousel from './TestimonialCarousel';
import TechnologyStack from './TechnologyStack';
import ProcessTimeline from './ProcessTimeline';

const HomePage = () => {
  const vantaRef = useRef(null);

  useEffect(() => {
    // Initialize Vanta.js globe effect
    let vantaEffect = null;

    const initVanta = () => {
      if (window.VANTA && window.THREE) {
        vantaEffect = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x3b82f6,
          backgroundColor: 0x0f172a
        });
      }
    };

    // Load Three.js and Vanta.js
    const loadScripts = async () => {
      // Load Three.js
      if (!window.THREE) {
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
        threeScript.onload = () => {
          // Load Vanta.js Globe
          const vantaScript = document.createElement('script');
          vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
          vantaScript.onload = initVanta;
          document.head.appendChild(vantaScript);
        };
        document.head.appendChild(threeScript);
      } else {
        initVanta();
      }
    };

    loadScripts();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  const services = [
    {
      icon: Building,
      title: 'Architecture',
      description: 'Enterprise-grade system architecture that scales with your business needs.'
    },
    {
      icon: Brain,
      title: 'AI Solutions',
      description: 'Intelligent systems powered by machine learning and advanced analytics.'
    },
    {
      icon: Database,
      title: 'Data & Platforms',
      description: 'Robust data infrastructure and platforms for modern enterprises.'
    },
    {
      icon: Code,
      title: 'Full Stack Development',
      description: 'Complete web applications from frontend to backend deployment.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Development',
      description: 'Native and cross-platform mobile apps that engage users.'
    }
  ];

  const stats = [
    { number: '50+', label: 'Projects Delivered' },
    { number: '100+', label: 'Systems Built' },
    { number: '25+', label: 'Happy Clients' },
    { number: '5+', label: 'Years Experience' }
  ];

  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Vanta.js Background */}
      <div
        ref={vantaRef}
        className="absolute inset-0 z-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-1 rounded-full border border-indigo-500 text-xs uppercase tracking-wider">
              Engineering Innovation Studio
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              We build{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                intelligent systems
              </span>{' '}
              that inspire
            </h1>

            {/* Subheading */}
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              Pioneering digital experiences that fuse cutting-edge technology with business strategy
              to transform organizations and create meaningful connections.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
              >
                <Link to="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 rounded-full"
              >
                <Link to="/services">View Our Work</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Agents Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-6 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500 text-purple-300 text-sm font-semibold">
                Featured AI Agents
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Our{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  AI Agent
                </span>{' '}
                Suite
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Pre-built, enterprise-ready AI agents that integrate seamlessly with your existing tools and workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <Link to="/agents/copywriter" className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">✍️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  Copywriter Agent
                </h3>
                <p className="text-gray-400 mb-6">
                  AI-powered content creation with stunning infographics
                </p>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  10x
                </div>
                <div className="text-sm text-gray-400">Faster Content Creation</div>
              </Link>

              <Link to="/agents/crm" className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  CRM Agent
                </h3>
                <p className="text-gray-400 mb-6">
                  Intelligent customer engagement, 24/7
                </p>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  95%
                </div>
                <div className="text-sm text-gray-400">Customer Satisfaction</div>
              </Link>

              <Link to="/agents/sales" className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  Sales Agent
                </h3>
                <p className="text-gray-400 mb-6">
                  Qualify leads and accelerate your pipeline
                </p>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  3x
                </div>
                <div className="text-sm text-gray-400">More Qualified Leads</div>
              </Link>
            </div>

            <div className="text-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
              >
                <Link to="/agents">
                  Explore All Agents
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Our Core{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Expertise
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                We specialize in cutting-edge technologies that drive innovation and business transformation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
          <div className="max-w-7xl mx-auto">
            <TechnologyStack />
          </div>
        </section>

        {/* Process Timeline Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <ProcessTimeline />
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What Our{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Clients Say
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Don't just take our word for it. Here's what our clients have to say about working with us.
              </p>
            </div>
            <TestimonialCarousel />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                transform
              </span>{' '}
              your business?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Let's discuss how our expertise in AI, data platforms, and modern development
              can accelerate your digital transformation journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
              >
                <Link to="/contact">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 rounded-full"
              >
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

