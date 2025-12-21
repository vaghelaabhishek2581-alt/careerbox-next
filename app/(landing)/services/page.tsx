import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StructuredData, { generateSEOMetadata } from '@/components/seo-head';
import { services, testimonials } from '@/lib/mock-data';
import { Target, Users, GraduationCap, Check, Star, ArrowRight, Zap, Briefcase, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/footer';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Services',
  description: 'Discover CareerBox\'s comprehensive career development services. From personalized career paths to skills assessment and mentorship programs.',
  keywords: ['career development services', 'professional growth', 'skills assessment', 'career coaching', 'mentorship programs'],
  canonicalUrl: '/services'
});

const iconMap = {
  'Target': Target,
  'Users': Users,
  'GraduationCap': GraduationCap
};

const processSteps = [
  {
    step: '01',
    title: 'Assessment',
    description: 'Complete our comprehensive skills and career assessment to identify your strengths and growth areas.'
  },
  {
    step: '02',
    title: 'Personalization',
    description: 'Receive a customized career roadmap based on your goals, skills, and market opportunities.'
  },
  {
    step: '03',
    title: 'Development',
    description: 'Access curated learning resources, mentorship, and practical experiences to build your skills.'
  },
  {
    step: '04',
    title: 'Growth',
    description: 'Track your progress and advance your career with ongoing support and new opportunities.'
  }
];

const benefits = [
  'AI-powered career matching',
  'Personalized learning paths',
  '1-on-1 expert mentorship',
  'Industry insights and trends',
  'Skills gap analysis',
  'Interview preparation',
  'Resume optimization',
  'Network building opportunities'
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "CareerBox Professional Development Services",
  "description": "Comprehensive career development platform offering personalized career paths, skills assessment, and mentorship programs.",
  "provider": {
    "@type": "Organization",
    "name": "CareerBox"
  },
  "serviceType": "Career Development",
  "offers": services.map(service => ({
    "@type": "Offer",
    "name": service.title,
    "description": service.description,
    "price": service.price
  }))
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <StructuredData structuredData={structuredData} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 min-h-[calc(90vh)] relative flex items-center">
         <div className="mx-[20px] sm:mx-[70px] mt-8 sm:mt-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
             {/* Left side content */}
             <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-8 sm:pb-12 md:pb-16">
               <Badge className="mb-4 px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 text-sm font-medium rounded-full">
                 🎯 Tailored for Your Success
               </Badge>
               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                 Accelerate Your <span className="text-blue-600">Career Growth</span>
               </h1>
               <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-prose md:max-w-xl leading-relaxed">
                 Unlock your potential with our comprehensive suite of career development services. From skills assessment to personalized mentorship, we provide everything you need.
               </p>
               
               <div className="flex flex-wrap gap-3 pt-4">
                 <Link href="#services">
                   <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all">
                     Explore Services
                   </Button>
                 </Link>
                 <Link href="/auth/signup">
                   <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 hover:bg-gray-50 rounded-xl">
                     Start Free Assessment
                   </Button>
                 </Link>
               </div>

               <div className="flex gap-8 pt-8 border-t border-gray-100 mt-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Fast Track</div>
                      <div className="text-sm text-gray-500">Career Progress</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Job Ready</div>
                      <div className="text-sm text-gray-500">Skills Training</div>
                    </div>
                  </div>
               </div>
             </div>

             {/* Right visual */} 
             <div className="relative flex justify-center md:justify-end h-full min-h-[400px]">
               <div className="w-full max-w-lg h-auto relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
                 <img
                   src="/hero2.jpg"
                   alt="Professional Development"
                   className="relative rounded-3xl shadow-2xl w-full h-full object-cover border-4 border-white"
                 />
                 
                 {/* Floating Badge */}
                 <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-bounce duration-[3000ms]">
                   <div className="bg-blue-100 p-3 rounded-full">
                     <BookOpen className="h-6 w-6 text-blue-600" />
                   </div>
                   <div>
                     <div className="text-sm text-gray-500">Courses</div>
                     <div className="text-xl font-bold text-gray-900">500+ Verified</div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose from our range of professional development services designed to accelerate your career growth.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const IconComponent = iconMap[service.icon as keyof typeof iconMap];
                return (
                  <Card key={service.id} className={`relative hover:shadow-xl transition-all duration-300 border-gray-200 group hover:-translate-y-2 bg-white ${service.popular ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                    {service.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full shadow-md z-10">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-4 pt-8">
                      <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-600 transition-colors rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                      <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0 p-8">
                      <div className="space-y-3 mb-8">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mb-6 pt-6 border-t border-gray-100">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{service.price}</div>
                        <p className="text-sm text-gray-500">per user</p>
                      </div>
                      <Link href="/auth/signup" className="block">
                        <Button className={`w-full rounded-xl py-6 ${service.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                          Get Started
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
              <p className="text-xl text-gray-600">
                Our proven 4-step process to accelerate your career growth
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center relative group">
                  <div className="relative mb-8 inline-block">
                    <div className="w-20 h-20 bg-white border-2 border-blue-100 group-hover:border-blue-600 transition-colors rounded-full flex items-center justify-center mx-auto text-xl font-bold text-gray-300 group-hover:text-blue-600 shadow-sm z-10 relative">
                      {step.step}
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-100 -ml-10 -z-0"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm px-4">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why Choose CareerBox?
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Join thousands of professionals who have accelerated their careers with our comprehensive platform.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 flex items-center justify-center shadow-inner">
                  <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">96% Success Rate</h3>
                    <p className="text-gray-600">Career advancement within 12 months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Success Stories</h2>
              <p className="text-xl text-gray-600">
                Hear from professionals who transformed their careers with CareerBox
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-xl transition-all duration-300 border-gray-100 bg-gray-50/50">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-600 mb-8 italic leading-relaxed text-lg">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center border-t border-gray-200 pt-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mr-4 shadow-inner">
                        <span className="text-sm font-bold text-blue-600">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-[20px] sm:mx-[70px]">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Accelerate Your Career?</h2>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                Join thousands of professionals who have transformed their careers with CareerBox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto px-8 py-6 text-lg rounded-xl shadow-lg">
                    Start Free Assessment
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20 w-full sm:w-auto px-8 py-6 text-lg rounded-xl">
                    Schedule a Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
