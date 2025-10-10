import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/page-layout';
import HeroSection from '@/components/hero-section';
import CTASection from '@/components/cta-section';
import StructuredData, { generateSEOMetadata } from '@/components/seo-head';
import { Users, Target, TrendingUp, Award, CheckCircle, Building2, Search, BarChart3, Clock, Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = generateSEOMetadata({
  title: 'For Businesses',
  description: 'Transform your talent acquisition and employee development with CareerBox\'s comprehensive business solutions. Advanced recruitment, workforce analytics, and training programs.',
  keywords: ['talent acquisition', 'employee development', 'recruitment solutions', 'workforce analytics', 'corporate training'],
  canonicalUrl: '/business'
});

const businessStats = [
  { value: '75%', label: 'Faster Hiring', description: 'Reduce time-to-hire with smart matching' },
  { value: '40%', label: 'Lower Turnover', description: 'Better cultural fit and engagement' },
  { value: '90%', label: 'Accuracy Rate', description: 'Precise skill and culture matching' },
  { value: '60%', label: 'Cost Savings', description: 'Reduce recruitment expenses' }
];

const businessSolutions = [
  {
    id: 'talent-acquisition',
    title: 'Smart Talent Acquisition',
    description: 'AI-powered recruitment platform that finds the perfect candidates faster',
    features: [
      'Intelligent candidate matching',
      'Automated screening and assessment',
      'Interview scheduling and coordination',
      'Skills verification and validation',
      'Cultural fit analysis',
      'Candidate experience optimization'
    ],
    icon: Search,
    pricing: 'From $299/month'
  },
  {
    id: 'workforce-analytics',
    title: 'Workforce Analytics',
    description: 'Data-driven insights to optimize your human capital strategy',
    features: [
      'Employee performance analytics',
      'Skills gap identification',
      'Retention risk analysis',
      'Career path planning',
      'Compensation benchmarking',
      'Diversity and inclusion metrics'
    ],
    icon: BarChart3,
    pricing: 'From $199/month'
  },
  {
    id: 'employee-development',
    title: 'Employee Development',
    description: 'Comprehensive programs to upskill and retain your workforce',
    features: [
      'Personalized learning paths',
      'Skills assessment and tracking',
      'Mentorship program management',
      'Leadership development',
      'Cross-functional training',
      'Performance improvement plans'
    ],
    icon: TrendingUp,
    pricing: 'From $149/month'
  }
];

const integrations = [
  'ATS/HRIS Systems',
  'Slack & Microsoft Teams',
  'LinkedIn Recruiting',
  'Workday',
  'BambooHR',
  'Greenhouse',
  'Lever',
  'Smart Recruiters'
];

const caseStudies = [
  {
    company: 'TechCorp',
    industry: 'Technology',
    challenge: 'High turnover rate and lengthy hiring process',
    solution: 'Implemented smart talent acquisition and employee development programs',
    results: [
      '50% reduction in time-to-hire',
      '30% decrease in employee turnover',
      '85% improvement in candidate quality'
    ]
  },
  {
    company: 'InnovateCo',
    industry: 'Manufacturing',
    challenge: 'Skills gap in emerging technologies',
    solution: 'Deployed workforce analytics and targeted upskilling programs',
    results: [
      '90% of employees completed reskilling',
      '25% increase in productivity',
      '40% improvement in employee satisfaction'
    ]
  }
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "CareerBox Business Solutions",
  "description": "Comprehensive talent acquisition and workforce development solutions for businesses.",
  "provider": {
    "@type": "Organization",
    "name": "CareerBox"
  },
  "serviceType": "Business Services",
  "areaServed": "Worldwide",
  "offers": businessSolutions.map(solution => ({
    "@type": "Offer",
    "name": solution.title,
    "description": solution.description,
    "price": solution.pricing
  }))
};

export default function BusinessPage() {
  return (
    <PageLayout>
      <StructuredData structuredData={structuredData} />
      
      <HeroSection
        title="Transform Your Workforce"
        subtitle="Advanced Business Solutions"
        description="Revolutionize your talent acquisition, employee development, and workforce analytics with our comprehensive business platform. Find better talent faster, develop your existing workforce, and make data-driven HR decisions."
        primaryCTA={{
          text: "Schedule Demo",
          href: "/contact"
        }}
        secondaryCTA={{
          text: "View Pricing",
          href: "#pricing"
        }}
        badge="🏢 Trusted by 1,200+ Companies"
        stats={businessStats.map(stat => ({ label: stat.label, value: stat.value }))}
      />

      {/* Solutions Overview */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Business Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and insights to optimize your human capital strategy and drive business growth.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {businessSolutions.map((solution) => {
              const IconComponent = solution.icon;
              return (
                <Card key={solution.id} className="hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{solution.title}</CardTitle>
                    <p className="text-gray-600">{solution.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-6">
                      {solution.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mb-6">
                      <div className="text-xl font-bold text-gray-900">{solution.pricing}</div>
                    </div>
                    <Link href="/contact" className="block">
                      <Button className="w-full">
                        Learn More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Platform Features</h2>
              <p className="text-xl text-gray-600">
                Everything you need to optimize your talent strategy in one integrated platform
              </p>
            </div>

            <Tabs defaultValue="recruitment" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-12">
                <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="development">Development</TabsTrigger>
              </TabsList>

              <TabsContent value="recruitment" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Smart Recruitment Platform</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Search className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Matching</h4>
                          <p className="text-gray-600">Advanced algorithms match candidates based on skills, experience, and cultural fit.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Automated Workflows</h4>
                          <p className="text-gray-600">Streamline your hiring process with automated screening and scheduling.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Skills Verification</h4>
                          <p className="text-gray-600">Validate candidate skills through practical assessments and portfolio reviews.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 flex items-center justify-center aspect-square">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">75% Faster</h4>
                      <p className="text-gray-600">Average hiring time reduction</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 flex items-center justify-center aspect-square">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">Real-time</h4>
                      <p className="text-gray-600">Workforce insights and analytics</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Workforce Analytics</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Performance Metrics</h4>
                          <p className="text-gray-600">Track employee performance and identify top performers and improvement areas.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Skills Gap Analysis</h4>
                          <p className="text-gray-600">Identify skills gaps across teams and plan targeted development programs.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Predictive Analytics</h4>
                          <p className="text-gray-600">Predict retention risks and career progression paths for strategic planning.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="development" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Employee Development</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Personalized Learning</h4>
                          <p className="text-gray-600">Create custom learning paths based on individual goals and skill gaps.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Mentorship Programs</h4>
                          <p className="text-gray-600">Facilitate meaningful mentor-mentee relationships across your organization.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Skills Certification</h4>
                          <p className="text-gray-600">Validate and certify employee skills with industry-recognized assessments.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 flex items-center justify-center aspect-square">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🚀</div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">40% Better</h4>
                      <p className="text-gray-600">Employee engagement and retention</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Success Stories</h2>
            <p className="text-xl text-gray-600">
              See how companies are transforming their workforce with CareerBox
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {caseStudies.map((study, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">{study.company}</h3>
                      <p className="text-sm text-gray-500">{study.industry}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                    <p className="text-gray-600 text-sm">{study.challenge}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                    <p className="text-gray-600 text-sm">{study.solution}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Results</h4>
                    <ul className="space-y-2">
                      {study.results.map((result, resultIndex) => (
                        <li key={resultIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-600">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Seamless Integrations</h2>
            <p className="text-xl text-gray-600">
              Connect with your existing HR tools and systems
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <p className="font-medium text-gray-700">{integration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Transform Your Workforce?"
        description="Join 1,200+ companies that have revolutionized their talent strategy with CareerBox. Schedule a personalized demo today."
        primaryCTA={{
          text: "Schedule Demo",
          href: "/contact"
        }}
        secondaryCTA={{
          text: "View Pricing",
          href: "#pricing"
        }}
      />
    </PageLayout>
  );
}