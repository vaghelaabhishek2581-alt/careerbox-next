import { Metadata } from 'next';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/page-layout';
import HeroSection from '@/components/hero-section';
import CTASection from '@/components/cta-section';
import StructuredData, { generateSEOMetadata } from '@/components/seo-head';
import { teamMembers, companyStats } from '@/lib/mock-data';
import { Users, Target, Globe, Award, Heart, Lightbulb } from 'lucide-react';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About Us',
  description: 'Learn about CareerBox\'s mission to empower careers and transform lives. Meet our team and discover our journey in revolutionizing professional development.',
  keywords: ['about careerbox', 'company story', 'career development team', 'professional growth mission'],
  canonicalUrl: '/about'
});

const companyValues = [
  {
    icon: Heart,
    title: 'People First',
    description: 'Every decision we make starts with how it impacts the people we serve.'
  },
  {
    icon: Target,
    title: 'Results Driven',
    description: 'We measure success by the career growth and achievements of our users.'
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Continuously evolving our platform with cutting-edge technology and insights.'
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'Building bridges between talent and opportunity across all industries worldwide.'
  }
];

const milestones = [
  {
    year: '2020',
    title: 'Founded',
    description: 'CareerBox was founded with a vision to democratize career growth.'
  },
  {
    year: '2021',
    title: 'First 1K Users',
    description: 'Reached our first thousand users and launched business solutions.'
  },
  {
    year: '2022',
    title: 'Educational Partnerships',
    description: 'Partnered with 100+ educational institutions globally.'
  },
  {
    year: '2023',
    title: 'AI Integration',
    description: 'Launched AI-powered career matching and personalization features.'
  },
  {
    year: '2024',
    title: '50K+ Users',
    description: 'Expanded to serve over 50,000 professionals worldwide.'
  }
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CareerBox",
  "description": "Professional career development platform empowering careers and transforming lives.",
  "url": "https://careerbox.com",
  "logo": "https://careerbox.com/images/logo.png",
  "foundingDate": "2020",
  "founders": [
    {
      "@type": "Person",
      "name": "Alex Thompson"
    }
  ],
  "numberOfEmployees": "50-100",
  "industry": "Career Development",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  }
};

export default function AboutPage() {
  return (
    <PageLayout>
      <StructuredData structuredData={structuredData} />
      
      <HeroSection
        title="Empowering Careers"
        subtitle="Transforming Lives Worldwide"
        description="We believe everyone deserves access to meaningful career opportunities. Our mission is to bridge the gap between talent and opportunity through technology, community, and personalized guidance."
        primaryCTA={{
          text: "Join Our Mission",
          href: "/auth/signup"
        }}
        secondaryCTA={{
          text: "Meet Our Team",
          href: "#team"
        }}
        badge="🚀 Founded in 2020"
        stats={companyStats.map(stat => ({ label: stat.description, value: stat.value }))}
      />

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                CareerBox was born from a simple observation: talented people everywhere were struggling to navigate their career paths, while businesses couldn't find the right talent. We set out to solve this fundamental disconnect.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">The Challenge</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Traditional career development was broken. Job seekers lacked personalized guidance, businesses struggled with talent acquisition, and educational institutions couldn't keep pace with industry needs.
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Solution</h3>
                <p className="text-gray-600 leading-relaxed">
                  We created an integrated ecosystem that connects all stakeholders - professionals, businesses, and educational institutions - through intelligent matching, personalized development paths, and data-driven insights.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <div className="text-6xl">🚀</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide every decision we make and every solution we build.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600">
              Key milestones in our mission to transform career development
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-200 to-purple-200 h-full"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Badge className="mb-2 bg-blue-100 text-blue-800">{milestone.year}</Badge>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                  <div className="relative z-10 w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate professionals dedicated to revolutionizing career development
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member) => (
              <Card key={member.id} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.bio}</p>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Connect on LinkedIn →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Join Our Mission?"
        description="Be part of the career transformation revolution. Start your journey with CareerBox today."
        primaryCTA={{
          text: "Get Started Now",
          href: "/auth/signup"
        }}
        secondaryCTA={{
          text: "Contact Our Team",
          href: "/contact"
        }}
      />
    </PageLayout>
  );
}