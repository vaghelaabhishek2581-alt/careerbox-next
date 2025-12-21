import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StructuredData, { generateSEOMetadata } from '@/components/seo-head';
import { teamMembers, companyStats } from '@/lib/mock-data';
import { Users, Target, Globe, Award, Heart, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import Footer from '@/components/footer';

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
      "name": "Mahesh Patel"
    }
  ],
  "numberOfEmployees": "50-100",
  "industry": "Career Development",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  }
};

export default function AboutPage() {
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
                 🚀 Founded in 2020
               </Badge>
               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                 Empowering Careers, <span className="text-blue-600">Transforming Lives Worldwide</span>
               </h1>
               <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-prose md:max-w-xl leading-relaxed">
                 We believe everyone deserves access to meaningful career opportunities. Our mission is to bridge the gap between talent and opportunity through technology, community, and personalized guidance.
               </p>
               
               <div className="flex flex-wrap gap-3 pt-4">
                 <Link href="/auth/signup">
                   <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all">
                     Join Our Mission
                   </Button>
                 </Link>
                 <Link href="#team">
                   <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 hover:bg-gray-50 rounded-xl">
                     Meet Our Team
                   </Button>
                 </Link>
               </div>

               <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100 mt-8">
                  {companyStats.map((stat, idx) => (
                    <div key={idx}>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-500 mt-1">{stat.description}</div>
                    </div>
                  ))}
               </div>
             </div>

             {/* Right visual */} 
             <div className="relative flex justify-center md:justify-end h-full min-h-[400px]">
               <div className="w-full max-w-lg h-auto relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
                 <img
                   src="/hero1.jpg"
                   alt="CareerBox Team"
                   className="relative rounded-3xl shadow-2xl w-full h-full object-cover border-4 border-white"
                 />
                 
                 {/* Floating Badge */}
                 <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-bounce duration-[3000ms]">
                   <div className="bg-yellow-100 p-3 rounded-full">
                     <Award className="h-6 w-6 text-yellow-600" />
                   </div>
                   <div>
                     <div className="text-sm text-gray-500">Industry Leader</div>
                     <div className="text-xl font-bold text-gray-900">Top Rated</div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                CareerBox was born from a simple observation: talented people everywhere were struggling to navigate their career paths, while businesses couldn't find the right talent. We set out to solve this fundamental disconnect.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-lg">⚠️</span>
                    The Challenge
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Traditional career development was broken. Job seekers lacked personalized guidance, businesses struggled with talent acquisition, and educational institutions couldn't keep pace with industry needs.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">💡</span>
                    Our Solution
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    We created an integrated ecosystem that connects all stakeholders - professionals, businesses, and educational institutions - through intelligent matching, personalized development paths, and data-driven insights.
                  </p>
                </div>
              </div>
              <div className="relative h-full min-h-[400px] flex items-center justify-center">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl opacity-10 transform -rotate-3"></div>
                 <div className="relative bg-white p-12 rounded-3xl shadow-xl border border-gray-100 text-center w-full">
                    <div className="text-8xl mb-6">🚀</div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">50K+</h3>
                    <p className="text-xl text-gray-600">Lives Transformed</p>
                    <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <CheckCircle className="h-4 w-4 text-green-500" /> Global Reach
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <CheckCircle className="h-4 w-4 text-green-500" /> Verified Mentors
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <CheckCircle className="h-4 w-4 text-green-500" /> AI-Powered
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <CheckCircle className="h-4 w-4 text-green-500" /> 24/7 Support
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These core values guide every decision we make and every solution we build.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-gray-100 group hover:-translate-y-2">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-600 transition-colors rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
              <p className="text-xl text-gray-600">
                Key milestones in our mission to transform career development
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200 h-full"></div>
                
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex flex-col md:flex-row items-center mb-12 relative ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right pl-12' : 'md:pl-12 pl-12'}`}>
                      <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200">{milestone.year}</Badge>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                    <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-blue-600 rounded-full z-10 top-0 md:top-1/2 md:-mt-2"></div>
                    <div className="hidden md:block w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Passionate professionals dedicated to revolutionizing career development
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member) => (
                <Card key={member.id} className="text-center hover:shadow-xl transition-all duration-300 border-gray-100 overflow-hidden group">
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <CardContent className="p-8 -mt-16 relative">
                    <div className="w-32 h-32 bg-white p-1 rounded-full mx-auto mb-6 shadow-lg">
                       <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden relative">
                         {/* Placeholder avatar if image not available */}
                         <Users className="h-full w-full p-6 text-gray-400" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.bio}</p>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group-hover:underline"
                      >
                        Connect on LinkedIn <ArrowRight className="ml-1 h-4 w-4" />
                      </a>
                    )}
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Join Our Mission?</h2>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                Be part of the career transformation revolution. Start your journey with CareerBox today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto px-8 py-6 text-lg rounded-xl shadow-lg">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20 w-full sm:w-auto px-8 py-6 text-lg rounded-xl">
                    Contact Our Team
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
