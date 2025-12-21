import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StructuredData, { generateSEOMetadata } from '@/components/seo-head';
import { Users, Target, TrendingUp, Award, CheckCircle, Building2, Search, BarChart3, Clock, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/footer';

export const metadata: Metadata = generateSEOMetadata({
  title: 'For Businesses',
  description: 'Transform your talent acquisition and employee development with CareerBox\'s comprehensive business solutions. Advanced recruitment, workforce analytics, and training programs.',
  keywords: ['talent acquisition', 'employee development', 'recruitment solutions', 'workforce analytics', 'corporate training'],
  canonicalUrl: '/business'
});

const businessStats = [
  { value: '75%', label: 'Faster Hiring', description: 'Reduce time-to-hire' },
  { value: '40%', label: 'Lower Turnover', description: 'Better cultural fit' },
  { value: '90%', label: 'Accuracy Rate', description: 'Precise skill matching' },
  { value: '60%', label: 'Cost Savings', description: 'Recruitment expenses' }
];

const businessSolutions = [
  {
    id: 'talent-acquisition',
    title: 'Smart Talent Acquisition',
    description: 'AI-powered recruitment platform that finds the perfect candidates faster',
    features: [
      'Intelligent candidate matching',
      'Automated screening',
      'Interview scheduling',
      'Skills verification',
      'Cultural fit analysis',
      'Candidate experience'
    ],
    icon: Search,
    pricing: 'From $299/month'
  },
  {
    id: 'workforce-analytics',
    title: 'Workforce Analytics',
    description: 'Data-driven insights to optimize your human capital strategy',
    features: [
      'Performance analytics',
      'Skills gap identification',
      'Retention risk analysis',
      'Career path planning',
      'Compensation benchmarking',
      'Diversity metrics'
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
      'Skills assessment',
      'Mentorship programs',
      'Leadership development',
      'Cross-functional training',
      'Performance plans'
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
    <div className="min-h-screen bg-white">
      <StructuredData structuredData={structuredData} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 min-h-[calc(90vh)] relative flex items-center">
         <div className="mx-[20px] sm:mx-[70px] mt-8 sm:mt-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
             {/* Left side content */}
             <div className="space-y-4 sm:space-y-5 md:space-y-6 pb-8 sm:pb-12 md:pb-16">
               <Badge className="mb-4 px-4 py-2 bg-purple-50 text-purple-700 border-purple-200 text-sm font-medium rounded-full">
                 🏢 Trusted by 1,200+ Companies
               </Badge>
               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                 Transform Your <span className="text-purple-600">Workforce Strategy</span>
               </h1>
               <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-prose md:max-w-xl leading-relaxed">
                 Revolutionize your talent acquisition, employee development, and workforce analytics with our comprehensive business platform. Find better talent faster.
               </p>
               
               <div className="flex flex-wrap gap-3 pt-4">
                 <Link href="/contact">
                   <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all">
                     Schedule Demo
                   </Button>
                 </Link>
                 <Link href="#pricing">
                   <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 hover:bg-gray-50 rounded-xl">
                     View Pricing
                   </Button>
                 </Link>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-100 mt-8">
                  {businessStats.map((stat, idx) => (
                    <div key={idx} className="text-center sm:text-left">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
               </div>
             </div>

             {/* Right visual */} 
             <div className="relative flex justify-center md:justify-end h-full min-h-[400px]">
               <div className="w-full max-w-lg h-auto relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl transform -rotate-3 scale-105 opacity-50"></div>
                 <img
                   src="/hero3.jpg"
                   alt="Business Solutions"
                   className="relative rounded-3xl shadow-2xl w-full h-full object-cover border-4 border-white"
                 />
                 
                 {/* Floating Badge */}
                 <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-4 animate-bounce duration-[3000ms]">
                   <div className="bg-green-100 p-3 rounded-full">
                     <TrendingUp className="h-6 w-6 text-green-600" />
                   </div>
                   <div>
                     <div className="text-sm text-gray-500">ROI Growth</div>
                     <div className="text-xl font-bold text-gray-900">+125%</div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Solutions Overview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Business Solutions</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive tools and insights to optimize your human capital strategy and drive business growth.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {businessSolutions.map((solution) => {
                const IconComponent = solution.icon;
                return (
                  <Card key={solution.id} className="hover:shadow-xl transition-all duration-300 border-gray-200 group hover:-translate-y-2 bg-white">
                    <CardHeader className="text-center pb-4 pt-8">
                      <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-600 transition-colors rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <CardTitle className="text-2xl mb-2">{solution.title}</CardTitle>
                      <p className="text-gray-600 text-sm leading-relaxed">{solution.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0 p-8">
                      <div className="space-y-3 mb-8">
                        {solution.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mb-6 pt-6 border-t border-gray-100">
                        <div className="text-xl font-bold text-gray-900">{solution.pricing}</div>
                      </div>
                      <Link href="/contact" className="block">
                        <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-6">
                          Learn More
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

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Platform Features</h2>
              <p className="text-xl text-gray-600">
                Everything you need to optimize your talent strategy in one integrated platform
              </p>
            </div>

            <Tabs defaultValue="recruitment" className="w-full max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-12 bg-gray-100 p-1 rounded-2xl h-auto">
                <TabsTrigger value="recruitment" className="rounded-xl py-3 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:shadow-md">Recruitment</TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-xl py-3 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:shadow-md">Analytics</TabsTrigger>
                <TabsTrigger value="development" className="rounded-xl py-3 text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:shadow-md">Development</TabsTrigger>
              </TabsList>

              <TabsContent value="recruitment" className="space-y-8 mt-0 focus-visible:outline-none">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Smart Recruitment Platform</h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Search className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">AI-Powered Matching</h4>
                          <p className="text-gray-600 leading-relaxed">Advanced algorithms match candidates based on skills, experience, and cultural fit.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Automated Workflows</h4>
                          <p className="text-gray-600 leading-relaxed">Streamline your hiring process with automated screening and scheduling.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Skills Verification</h4>
                          <p className="text-gray-600 leading-relaxed">Validate candidate skills through practical assessments and portfolio reviews.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 flex items-center justify-center aspect-square shadow-inner">
                    <div className="text-center bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
                      <div className="text-6xl mb-4">🎯</div>
                      <h4 className="text-3xl font-bold text-gray-900 mb-2">75% Faster</h4>
                      <p className="text-gray-600 font-medium">Average hiring time reduction</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8 mt-0 focus-visible:outline-none">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 flex items-center justify-center aspect-square shadow-inner order-2 lg:order-1">
                    <div className="text-center bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
                      <div className="text-6xl mb-4">📊</div>
                      <h4 className="text-3xl font-bold text-gray-900 mb-2">Real-time</h4>
                      <p className="text-gray-600 font-medium">Workforce insights and analytics</p>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Workforce Analytics</h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Performance Metrics</h4>
                          <p className="text-gray-600 leading-relaxed">Track employee performance and identify top performers and improvement areas.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Skills Gap Analysis</h4>
                          <p className="text-gray-600 leading-relaxed">Identify skills gaps across teams and plan targeted development programs.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Predictive Analytics</h4>
                          <p className="text-gray-600 leading-relaxed">Predict retention risks and career progression paths for strategic planning.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="development" className="space-y-8 mt-0 focus-visible:outline-none">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Employee Development</h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Personalized Learning</h4>
                          <p className="text-gray-600 leading-relaxed">Create custom learning paths based on individual goals and skill gaps.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Mentorship Programs</h4>
                          <p className="text-gray-600 leading-relaxed">Facilitate meaningful mentor-mentee relationships across your organization.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Skills Certification</h4>
                          <p className="text-gray-600 leading-relaxed">Validate and certify employee skills with industry-recognized assessments.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 flex items-center justify-center aspect-square shadow-inner">
                    <div className="text-center bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50">
                      <div className="text-6xl mb-4">🚀</div>
                      <h4 className="text-3xl font-bold text-gray-900 mb-2">40% Better</h4>
                      <p className="text-gray-600 font-medium">Employee engagement and retention</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-[20px] sm:mx-[70px]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Success Stories</h2>
              <p className="text-xl text-gray-600">
                See how companies are transforming their workforce with CareerBox
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {caseStudies.map((study, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border-gray-100">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{study.company}</h3>
                        <p className="text-sm text-gray-500">{study.industry}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
                      <h4 className="font-semibold text-red-900 mb-2 text-sm uppercase tracking-wide">Challenge</h4>
                      <p className="text-red-700 text-sm">{study.challenge}</p>
                    </div>
                    
                    <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-100">
                      <h4 className="font-semibold text-green-900 mb-2 text-sm uppercase tracking-wide">Solution</h4>
                      <p className="text-green-700 text-sm">{study.solution}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Key Results</h4>
                      <ul className="space-y-2">
                        {study.results.map((result, resultIndex) => (
                          <li key={resultIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
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
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Seamless Integrations</h2>
            <p className="text-xl text-gray-600">
              Connect with your existing HR tools and systems
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors border border-gray-100 flex items-center justify-center">
                <p className="font-medium text-gray-700">{integration}</p>
              </div>
            ))}
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Workforce?</h2>
              <p className="text-lg md:text-xl text-blue-100 mb-8">
                Join 1,200+ companies that have revolutionized their talent strategy with CareerBox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto px-8 py-6 text-lg rounded-xl shadow-lg">
                    Schedule Demo
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20 w-full sm:w-auto px-8 py-6 text-lg rounded-xl">
                    View Pricing
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
