import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Cloud, Server, Smartphone, Database, Award, Users, CheckCircle, TrendingUp, Brain, Building } from 'lucide-react';
import { Button } from './ui/button';
import SEO from './SEO';
import TechnologyStack from './TechnologyStack';
import ProcessTimeline from './ProcessTimeline';
import TrustedBy from './TrustedBy';

const HomePage = () => {
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
    <div className="relative min-h-screen bg-white text-gray-900">
      <SEO
        title="Engineering Intelligent Systems"
        description="CloudBaud delivers enterprise solutions architecture, AI engineering, cloud migration, and DevOps automation. Experts in TOGAF, AWS Well-Architected, Microsoft Dynamics 365, Salesforce, and Terraform."
        keywords="enterprise solutions architecture, AI engineering services, cloud migration consulting, DevOps automation, TOGAF architecture, AWS Well-Architected, Azure cloud, Google Cloud Platform, GCP, Microsoft Dynamics 365, Microsoft Teams development, Salesforce integration, Terraform infrastructure, SharePoint development, vector databases, graph databases, Neo4j, MongoDB"
        canonical="/"
      />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto w-full py-20">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs uppercase font-bold tracking-wider">
              Engineering Innovation Studio
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900">
              We build AI that{' '}
              <span className="text-blue-600">works for you</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
              Precision models. Predictable outcomes. Human‑safe by design.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg shadow-blue-200 transition-all"
              >
                <Link to="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg rounded-lg transition-all"
              >
                <Link to="/capabilities">View Our Capabilities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-500 font-medium uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <TrustedBy />
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
              Our Core Expertise
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              We specialize in the engineering of robust, intelligent systems that drive real business value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-8 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <service.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <TechnologyStack />
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <ProcessTimeline />
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            Ready to build the future of <br /><span className="text-blue-600 underline decoration-blue-100 underline-offset-8">your business?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Contact us today to discuss your vision and learn how our engineering prowess can turn it into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-xl rounded-lg shadow-xl shadow-blue-100 font-bold"
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
              className="border-gray-200 text-gray-700 hover:bg-gray-50 px-10 py-7 text-xl rounded-lg"
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
