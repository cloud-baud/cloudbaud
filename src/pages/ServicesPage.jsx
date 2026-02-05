import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Database, Smartphone, Code, Building, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const ServicesPage = () => {
  const services = [
    {
      icon: Building,
      title: 'Enterprise Architecture',
      description: 'We design scalable, resilient system architectures that grow with your business. Our architects combine deep technical expertise with strategic business understanding to create solutions that deliver both immediate value and long-term competitive advantage.',
      features: [
        'Microservices Architecture',
        'Cloud-Native Design',
        'Scalability Planning',
        'Security Integration',
        'Performance Optimization'
      ],
      technologies: ['AWS', 'Azure', 'Kubernetes', 'Docker', 'Terraform']
    },
    {
      icon: Brain,
      title: 'AI Solutions',
      description: 'Transform your business with intelligent systems powered by machine learning, natural language processing, and computer vision. We develop AI solutions that automate processes, enhance decision-making, and unlock new opportunities for growth.',
      features: [
        'Machine Learning Models',
        'Natural Language Processing',
        'Computer Vision',
        'Predictive Analytics',
        'Process Automation'
      ],
      technologies: ['TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 'MLflow'],
      link: '/ai-engineering'
    },
    {
      icon: Database,
      title: 'Data & Platforms Engineering',
      description: 'Build robust data platforms that turn information into insights. Our engineering team creates scalable data pipelines, analytics platforms, and cloud infrastructure that enable data-driven decision making at enterprise scale.',
      features: [
        'Data Pipeline Engineering',
        'Real-time Analytics',
        'Data Warehousing',
        'Cloud Data Platforms',
        'Data Governance'
      ],
      technologies: ['Apache Spark', 'Kafka', 'Snowflake', 'dbt', 'Airflow']
    },
    {
      icon: Code,
      title: 'Full Stack Development',
      description: 'From concept to deployment, we deliver complete web applications using modern technologies. Our full stack developers create responsive, performant, and user-friendly applications that provide exceptional experiences across all devices.',
      features: [
        'Frontend Development',
        'Backend APIs',
        'Database Design',
        'DevOps Integration',
        'Performance Optimization'
      ],
      technologies: ['React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB']
    },
    {
      icon: Smartphone,
      title: 'Mobile Development',
      description: 'Reach your customers wherever they are with native and cross-platform mobile applications. We develop iOS and Android apps that combine beautiful design with powerful functionality to engage users and drive business results.',
      features: [
        'Native iOS & Android',
        'Cross-platform Development',
        'UI/UX Design',
        'App Store Optimization',
        'Analytics Integration'
      ],
      technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Our{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Services
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We provide comprehensive technology solutions that drive innovation and business transformation
            across architecture, AI, data platforms, full stack, and mobile development.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          {services.map((service, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="h-8 w-8 text-white" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  {service.title}
                </h2>

                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-white">Key Capabilities</h3>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technologies */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-white">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                >
                  <Link to={service.link || "/contact"}>
                    {service.link ? 'Explore Service' : 'Get Started'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Visual */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''} relative`}>
                <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-3xl border border-slate-700 flex items-center justify-center">
                  <service.icon className="h-32 w-32 text-blue-400 opacity-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              get started
            </span>
            ?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Let's discuss your project requirements and how our expertise can help you achieve your goals.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-3 rounded-full"
          >
            <Link to="/contact">
              Schedule a Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;

