'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Award, 
  Target, 
  BookOpen, 
  Building2, 
  GraduationCap, 
  Video, 
  Star,
  Globe,
  LayoutDashboard,
  Calendar,
  Briefcase,
  ShieldCheck,
  FileText
} from 'lucide-react';
import Footer from '@/components/footer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const educationStats = [
  { value: '300+', label: 'Partner Institutes', description: 'Trust CareerBox' },
  { value: '50k+', label: 'Student Connections', description: 'Verified Leads' },
  { value: '95%', label: 'Placement Rate', description: 'For Partner Colleges' },
  { value: '2.5x', label: 'Faster Enrollment', description: 'Admissions Velocity' }
];

const coreServices = [
  {
    title: 'Verified Student Lead Generation',
    description: 'Get matched with students who fit your programmes perfectly. Our intent scoring ensures high conversion rates.',
    icon: Users,
    features: ['Programme-fit matching', 'Intent scoring', 'Geo targeting', 'Lead attribution']
  },
  {
    title: 'Admissions CRM',
    description: 'Streamline your entire admissions process from inquiry to enrollment with our built-in CRM tools.',
    icon: LayoutDashboard,
    features: ['Pipeline tracking', 'Automated comms', 'Interview scheduling', 'Role-based access']
  },
  {
    title: 'Events & Outreach',
    description: 'Host virtual fairs, webinars, and campus tours to engage prospective students and build your brand.',
    icon: Calendar,
    features: ['Virtual fairs', 'Webinars', 'Campus tours', 'Attendance analytics']
  },
  {
    title: 'Placement & Career Services',
    description: 'Enhance your institute\'s reputation with our comprehensive placement support and recruiter network.',
    icon: Briefcase,
    features: ['Internship/job matching', 'Recruiter feedback', 'Placement tracking', 'Alumni network']
  },
  {
    title: 'Scholarships & Financial Aid',
    description: 'Attract meritorious students by showcasing your scholarship programs and financial aid options.',
    icon: Award,
    features: ['Scholarship listings', 'Eligibility matching', 'Application workflows', 'Document verification']
  },
  {
    title: 'Branding & Content',
    description: 'Stand out with premium institute profile pages, programme catalogs, and SEO-optimized content.',
    icon: Globe,
    features: ['Rich media profiles', 'Programme catalogs', 'SEO optimization', 'Rankings display']
  },
  {
    title: 'Integrations & Compliance',
    description: 'Seamlessly connect with your existing SIS/ERP systems while ensuring full data privacy compliance.',
    icon: ShieldCheck,
    features: ['SIS/ERP integration', 'WhatsApp/SMS gateways', 'SSO support', 'Data privacy compliance']
  }
];

const partnershipTiers = [
  {
    title: 'Starter',
    description: 'Essential tools for new partners',
    features: ['Basic Profile', 'Lead Generation (Limit 100)', 'Standard Support'],
    cta: 'Get Started'
  },
  {
    title: 'Growth',
    description: 'Accelerate your enrollments',
    features: ['Premium Profile', 'Unlimited Leads', 'Admissions CRM', 'Priority Support'],
    cta: 'Most Popular',
    popular: true
  },
  {
    title: 'Excellence',
    description: 'Full-suite partnership',
    features: ['All Growth Features', 'Placement Module', 'Dedicated Account Manager', 'API Access'],
    cta: 'Contact Sales'
  }
];

const successStories = [
  {
    institution: 'State Engineering College',
    type: 'Engineering',
    quote: 'Our graduate placement rate improved from 65% to 95% within two years of partnering with CareerBox.',
    result: '95% placement rate',
    dean: 'Dr. Sarah Mitchell'
  },
  {
    institution: 'Business University',
    type: 'Business',
    quote: 'The industry connections and curriculum updates have made our programs incredibly relevant.',
    result: '89% employer satisfaction',
    dean: 'Prof. Michael Chen'
  },
  {
    institution: 'Technology Institute',
    type: 'Technology',
    quote: 'Students now graduate with real-world skills and immediate job opportunities.',
    result: '40% salary increase',
    dean: 'Dr. Emily Rodriguez'
  }
];

const funnelSteps = [
  { step: '01', title: 'Create Profile', description: 'Build your institute presence and list programmes.' },
  { step: '02', title: 'Publish Content', description: 'Share events, webinars, and scholarship details.' },
  { step: '03', title: 'Receive Leads', description: 'Get verified student inquiries matched to your criteria.' },
  { step: '04', title: 'Manage Admissions', description: 'Track applications and enroll students via CRM.' }
];

export default function InstitutesPageContent() {
  useEffect(() => {
    // Animate hero content
    gsap.fromTo('.hero-content',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power2.out' }
    );

    // Animate cards
    gsap.fromTo('.animate-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.5, ease: 'power2.out', scrollTrigger: '.animate-card' }
    );
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div>
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 min-h-[calc(100vh-110px)] relative flex items-center">
           <div className="mx-[20px] sm:mx-[70px] mt-8 sm:mt-10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
               {/* Left side content */}
               <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-8 sm:pb-12 md:pb-16">
                 <h1 className="hero-content text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                   Grow Enrollments with <span className="text-blue-600">Verified Student Connections</span>
                 </h1>
                 <h2 className="hero-content text-xl sm:text-2xl md:text-3xl text-gray-800 font-semibold leading-snug">
                   Streamline admissions & improve outcomes.
                 </h2>
                 <p className="hero-content text-gray-600 text-base sm:text-lg md:text-xl max-w-prose md:max-w-xl">
                   Connect with interested students, manage applications with our built-in CRM, and boost your placement records with a single platform.
                 </p>
                 
                 <div className="hero-content space-y-2">
                   {['Verified student leads matched to your programmes', 
                     'Admissions CRM with application tracking', 
                     'Placement and alumni modules'].map((item, i) => (
                     <div key={i} className="flex items-center gap-2 text-gray-700">
                       <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                       <span>{item}</span>
                     </div>
                   ))}
                 </div>

                 <div className="hero-content flex flex-wrap gap-3 pt-4">
                   <Link href="/contact">
                     <Button size="lg" className="px-6 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                       Schedule Demo
                     </Button>
                   </Link>
                   <Link href="/resources/program-guide">
                     <Button size="lg" variant="outline" className="px-6 w-full sm:w-auto">
                       Download Brochure
                     </Button>
                   </Link>
                 </div>
               </div>

               {/* Right visual */} 
               <div className="relative flex justify-center md:justify-end h-full min-h-[400px]">
                 <div className="w-full max-w-lg h-auto relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
                   <img
                     src="/hero3.jpg"
                     alt="Institute Dashboard"
                     className="relative rounded-3xl shadow-2xl w-full h-full object-cover border-4 border-white"
                   />
                   
                   {/* Floating Badge */}
                   <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-bounce duration-[3000ms]">
                     <div className="bg-green-100 p-3 rounded-full">
                       <TrendingUp className="h-6 w-6 text-green-600" />
                     </div>
                     <div>
                       <div className="text-sm text-gray-500">Conversion Rate</div>
                       <div className="text-xl font-bold text-gray-900">+45% Growth</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </section>

        {/* Stats Band */}
        <section className="bg-[#1f1f1f] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {educationStats.map((stat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold">{stat.value}</div>
                  <div className="text-lg font-semibold text-gray-200">{stat.label}</div>
                  <div className="text-sm text-gray-400">{stat.description}</div>
                </div>
              ))}
            </div>
            <div className="my-10 md:my-16 border-t border-white/20 mx-auto w-full max-w-4xl" />
            <div className="text-center text-gray-400 text-sm">
              Trusted by leading universities and colleges across the country
            </div>
          </div>
        </section>

        {/* Core Services Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for Enrollment Growth</h2>
            <p className="text-xl text-gray-600">
              A comprehensive suite of tools designed to attract, engage, and enroll the right students for your institution.
            </p>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-blue-600" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coreServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className={`animate-card hover:shadow-xl transition-all duration-300 border-grey-300 shadow-sm ${index === 0 ? 'md:col-span-2 lg:col-span-2 bg-blue-50' : 'bg-white'}`}>
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Partnership Process</h2>
            <p className="mt-4 text-gray-600">Simple steps to transform your admissions funnel</p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {funnelSteps.map((step, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-300 text-center hover:-translate-y-1 transition-transform">
                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 ring-8 ring-white">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories Carousel */}
        <section className="py-20 bg-gray-900 text-white overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Real Results from Partner Institutes</h2>
                <p className="text-gray-400 text-lg mb-8">
                  See how leading institutions are using CareerBox to improve their placement rates and streamline admissions.
                </p>
                <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-400">95%</div>
                    <div className="text-sm text-gray-400 mt-1">Placement Rate</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-400">30%</div>
                    <div className="text-sm text-gray-400 mt-1">Enrollment Lift</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                  <CarouselContent>
                    {successStories.map((story, idx) => (
                      <CarouselItem key={idx} className="md:basis-full">
                        <div className="bg-white text-gray-900 p-8 rounded-3xl mx-2">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <GraduationCap className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-bold text-lg">{story.institution}</div>
                              <div className="text-sm text-gray-500">{story.type}</div>
                            </div>
                          </div>
                          <blockquote className="text-xl font-medium leading-relaxed mb-6">
                            "{story.quote}"
                          </blockquote>
                          <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                            <div>
                              <div className="font-semibold">{story.dean}</div>
                              <div className="text-sm text-gray-500">Dean</div>
                            </div>
                            <div className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm">
                              {story.result}
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex gap-2 mt-4 justify-end">
                    <CarouselPrevious className="static translate-y-0" />
                    <CarouselNext className="static translate-y-0" />
                  </div>
                </Carousel>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Institute?</h2>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                Join 300+ institutions that have revolutionized their career services and improved graduate outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto px-8 py-6 text-lg">
                    Schedule Consultation
                  </Button>
                </Link>
                <Link href="/resources/program-guide">
                  <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white w-full sm:w-auto px-8 py-6 text-lg">
                    Download Program Guide
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
