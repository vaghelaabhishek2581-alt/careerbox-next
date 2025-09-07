'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Briefcase, Users, TrendingUp, Award, Target, BookOpen, Building2, GraduationCap } from 'lucide-react';

export default function LandingPage() {
  useEffect(() => {
    // Animate hero content
    gsap.fromTo('.hero-content', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power2.out' }
    );

    // Animate feature cards
    gsap.fromTo('.feature-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Add top padding to account for fixed header */}
      <div className="pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <Badge className="hero-content mb-6 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 text-base font-medium">
              🚀 Your Pathway to Professional Excellence
            </Badge>
            
            <h1 className="hero-content text-7xl lg:text-8xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 leading-tight">
              Empowering Careers,
              <br />
              <span className="text-6xl lg:text-7xl">Transforming Lives</span>
            </h1>
            
            <p className="hero-content text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              CareerBox is revolutionizing the way professionals, businesses, and educational institutions 
              <span className="font-medium text-blue-600"> connect and grow together</span>.
            </p>
            
            <div className="hero-content flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6 text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl">
                  Start Your Journey <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/career-counselling">
                <Button size="lg" variant="outline" className="px-10 py-6 text-xl border-2 hover:bg-gray-50 transition-all duration-300 rounded-xl">
                  Free Counselling
                </Button>
              </Link>
            </div>

            {/* Statistics Showcase */}
            <div className="hero-content grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600 font-medium">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Partner Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">100+</div>
                <div className="text-gray-600 font-medium">Educational Institutes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
              To create a comprehensive ecosystem where 
              <span className="font-semibold text-blue-600"> professionals discover their potential</span>, 
              <span className="font-semibold text-purple-600"> businesses find exceptional talent</span>, and 
              <span className="font-semibold text-green-600"> educational institutions bridge the skills gap</span> 
              in today's dynamic marketplace.
            </p>
          </div>
        </section>

        {/* Service Highlights */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Comprehensive Solutions for Every Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides tailored solutions for professionals, businesses, and educational institutions
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Career Development */}
            <Card className="feature-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Target className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Career Development</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Personalized career paths, skills assessment, mentorship programs, and goal tracking to accelerate your professional growth.</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Skills Assessment & Analytics</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Personalized Learning Paths</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Mentorship Matching</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Solutions */}
            <Card className="feature-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Building2 className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Business Solutions</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Talent acquisition, employee development programs, workforce analytics, and corporate training solutions for growing businesses.</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Talent Acquisition Platform</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Employee Development</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Workforce Analytics</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational Programs */}
            <Card className="feature-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <GraduationCap className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Educational Programs</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Industry partnerships, curriculum development, student placement programs, and career readiness initiatives for educational institutions.</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Industry Partnerships</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Student Placement Programs</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Career Readiness Training</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold text-white mb-8">
              Ready to Transform Your Future?
            </h2>
            <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals, businesses, and institutions who are already using CareerBox 
              to unlock their potential and achieve extraordinary results.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-12 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl">
                Begin Your Journey <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-4 gap-8 mb-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"></div>
                  <span className="text-2xl font-bold">CareerBox</span>
                </div>
                <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
                  Empowering careers, transforming lives. Your pathway to professional excellence starts here.
                </p>
                <div className="text-blue-400 font-medium">
                  "Your Pathway to Professional Excellence"
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/services" className="hover:text-white transition-colors">For Professionals</Link></li>
                  <li><Link href="/business" className="hover:text-white transition-colors">For Businesses</Link></li>
                  <li><Link href="/institutes" className="hover:text-white transition-colors">For Institutes</Link></li>
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-gray-400 mb-4 md:mb-0">
                  © 2024 CareerBox. All rights reserved.
                </div>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}