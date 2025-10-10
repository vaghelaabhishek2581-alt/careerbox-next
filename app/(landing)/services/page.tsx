import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/page-layout';
import HeroSection from '@/components/hero-section';
import CTASection from '@/components/cta-section';
import StructuredData, { generateSEOMetadata } from '@/components/seo-head';
import { services, testimonials, faqs } from '@/lib/mock-data';
import { Target, Users, GraduationCap, Check, Star } from 'lucide-react';
import Link from 'next/link';

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
    <PageLayout>
      <StructuredData structuredData={structuredData} />
      
      <HeroSection
        title="Professional Services"
        subtitle="Accelerate Your Career Growth"
        description="Unlock your potential with our comprehensive suite of career development services. From skills assessment to personalized mentorship, we provide everything you need to advance your professional journey."
        primaryCTA={{
          text: "Explore Services",
          href: "#services"
        }}
        secondaryCTA={{
          text: "Start Free Assessment",
          href: "/auth/signup"
        }}
        badge="🎯 Tailored for Your Success"
      />

      {/* Services Overview */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our range of professional development services designed to accelerate your career growth.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap];
              return (
                <Card key={service.id} className={`relative hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${service.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {service.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                    <p className="text-gray-600">{service.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-6">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{service.price}</div>
                      <p className="text-sm text-gray-500">per user</p>
                    </div>
                    <Link href="/auth/signup" className="block">
                      <Button className={`w-full ${service.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}>
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600">
              Our proven 4-step process to accelerate your career growth
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                      {step.step}
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform -translate-x-8"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Why Choose CareerBox?
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Join thousands of professionals who have accelerated their careers with our comprehensive platform.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">96% Success Rate</h3>
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
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Success Stories</h2>
            <p className="text-xl text-gray-600">
              Hear from professionals who transformed their careers with CareerBox
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-600 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mr-4">
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
      </section>

      <CTASection
        title="Ready to Accelerate Your Career?"
        description="Join thousands of professionals who have transformed their careers with CareerBox. Start your personalized development journey today."
        primaryCTA={{
          text: "Start Free Assessment",
          href: "/auth/signup"
        }}
        secondaryCTA={{
          text: "Schedule a Demo",
          href: "/contact"
        }}
      />
    </PageLayout>
  );
}