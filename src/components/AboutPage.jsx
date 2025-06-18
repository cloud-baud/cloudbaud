import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Target, Award, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';

const AboutPage = () => {
  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'We are committed to delivering solutions that exceed expectations and set new standards for quality and performance.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We embrace emerging technologies and methodologies to create solutions that give our clients a competitive edge.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe the best results come from working closely with our clients as true partners in their success.'
    },
    {
      icon: Target,
      title: 'Integrity',
      description: 'We conduct business with honesty, transparency, and respect for all stakeholders.'
    }
  ];

  const team = [
    {
      name: 'Deepika Nath',
      role: 'President & CEO',
      bio: 'Former lead architect at major tech companies with 15+ years in enterprise systems.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Jishnu Nath',
      role: 'Chief Technology Officer',
      bio: 'Former lead architect at major tech companies with 15+ years in enterprise systems.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Data Platform Lead',
      bio: 'Expert in building data infrastructure that processes billions of events daily.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Emily Zhang',
      role: 'Full Stack Architect',
      bio: 'Specialist in modern web technologies and scalable application development.',
      image: '/api/placeholder/300/300'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Building the{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Future
                </span>{' '}
                of Technology
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Cloudbaud was founded with a vision to bridge the gap between cutting-edge technology 
                and real-world business challenges. Our team of experienced engineers, architects, 
                and data scientists brings together decades of collective expertise.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border border-slate-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    50+
                  </div>
                  <div className="text-gray-400">Projects Delivered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Our{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Mission
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            To empower organizations with intelligent systems that drive innovation, efficiency, 
            and growth while maintaining the highest standards of quality, security, and reliability. 
            We believe that technology should be an enabler, not a barrier.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Values
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              These core principles guide everything we do and shape how we work with our clients and each other.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center hover:border-blue-500 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {value.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Meet Our{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Team
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our diverse team of experts brings together deep technical knowledge and real-world experience 
              to deliver exceptional results for our clients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="group text-center"
              >
                <div className="relative mb-6">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-all duration-300">
                    <Users className="h-16 w-16 text-blue-400 opacity-50" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {member.name}
                </h3>
                <p className="text-blue-400 mb-3 font-medium">
                  {member.role}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Why Choose{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Cloudbaud
                </span>
                ?
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Innovation-Driven</h3>
                  <p className="text-gray-400">
                    We stay at the forefront of technology trends, ensuring your solutions leverage 
                    the latest advancements in AI, cloud computing, and software development.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">End-to-End Expertise</h3>
                  <p className="text-gray-400">
                    From initial architecture design to final deployment and ongoing support, 
                    we provide comprehensive services that cover every aspect of your technology needs.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Proven Results</h3>
                  <p className="text-gray-400">
                    Our track record speaks for itself. We've helped organizations across industries 
                    achieve their digital transformation goals and realize measurable business value.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border border-slate-700 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                      100%
                    </div>
                    <div className="text-gray-400 text-sm">Client Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                      24/7
                    </div>
                    <div className="text-gray-400 text-sm">Support</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                      5+
                    </div>
                    <div className="text-gray-400 text-sm">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                      50+
                    </div>
                    <div className="text-gray-400 text-sm">Projects</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              work together
            </span>
            ?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Let's discuss how our team can help you achieve your technology goals and drive your business forward.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full"
          >
            <Link to="/contact">
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

