import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PageLayout from '@/components/page-layout';
import HeroSection from '@/components/hero-section';
import CTASection from '@/components/cta-section';
import StructuredData, { generateSEOMetadata } from '@/components/seo-head';
import { GraduationCap, BookOpen, Users, TrendingUp, Award, Building2, Lightbulb, Target, CheckCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = generateSEOMetadata({
  title: 'For Educational Institutes',
  description: 'Bridge the skills gap with CareerBox\'s comprehensive educational solutions. Industry partnerships, curriculum development, student placement programs, and career readiness initiatives.',
  keywords: ['educational partnerships', 'curriculum development', 'student placement', 'career readiness', 'skills gap', 'industry collaboration'],
  canonicalUrl: '/institutes'
});

const educationStats = [
  { value: '95%', label: 'Placement Rate', description: 'Students placed within 6 months' },
  { value: '300+', label: 'Partner Institutes', description: 'Educational institutions in our network' },
  { value: '89%', label: 'Employer Satisfaction', description: 'With our program graduates' },
  { value: '2.5x', label: 'Faster Placement', description: 'Compared to traditional methods' }
];

const educationSolutions = [
  {
    id: 'curriculum-development',
    title: 'Curriculum Development',
    description: 'Industry-aligned curriculum design that bridges academic learning with real-world skills',
    features: [
      'Industry skill mapping',
      'Real-world project integration',
      'Regular curriculum updates',
      'Expert faculty training',
      'Assessment framework design',
      'Learning outcome measurement'
    ],
    icon: BookOpen,
    benefits: 'Improved graduate employability and industry relevance'
  },
  {
    id: 'industry-partnerships',
    title: 'Industry Partnerships',
    description: 'Connect with leading companies for internships, projects, and direct recruitment',
    features: [
      'Company partnership facilitation',
      'Internship program management',
      'Guest lecture coordination',
      'Industry project assignments',
      'Recruitment event organization',
      'Employer feedback integration'
    ],
    icon: Building2,
    benefits: 'Direct access to job opportunities and industry insights'
  },
  {
    id: 'student-placement',
    title: 'Student Placement Program',
    description: 'Comprehensive placement support from career counseling to job placement',
    features: [
      'Career counseling and guidance',
      'Resume and portfolio development',
      'Interview preparation workshops',
      'Job matching and applications',
      'Placement tracking and analytics',
      'Alumni network building'
    ],
    icon: Target,
    benefits: '95% placement rate within 6 months of graduation'
  }
];

const partnerPrograms = [
  {
    title: 'University Excellence Program',
    description: 'Comprehensive partnership for universities to enhance their career services',
    features: ['Full curriculum integration', 'Faculty development', 'Student placement guarantee', 'Industry advisory board'],
    duration: '3-year partnership',
    investmentLevel: 'Premium'
  },
  {
    title: 'College Career Readiness',
    description: 'Focused program for colleges to improve graduate employability',
    features: ['Career readiness training', 'Industry exposure', 'Skills certification', 'Placement assistance'],
    duration: '2-year program',
    investmentLevel: 'Standard'
  },
  {
    title: 'Institute Skills Bridge',
    description: 'Quick implementation program for immediate skills gap addressing',
    features: ['Skills assessment', 'Targeted training', 'Industry connections', 'Job placement'],
    duration: '1-year program',
    investmentLevel: 'Basic'
  }
];

const successMetrics = [
  { label: 'Graduate Employability', before: 65, after: 95, improvement: 30 },
  { label: 'Industry Satisfaction', before: 70, after: 89, improvement: 19 },
  { label: 'Time to Placement', before: 100, after: 40, improvement: 60, unit: 'days' },
  { label: 'Starting Salaries', before: 100, after: 135, improvement: 35, unit: 'index' }
];

const testimonialHighlights = [
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

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "CareerBox Educational Solutions",
  "description": "Comprehensive educational solutions for institutions to bridge the skills gap and improve student employability.",
  "serviceType": "Educational Services",
  "offers": educationSolutions.map(solution => ({
    "@type": "Offer",
    "name": solution.title,
    "description": solution.description
  }))
};

export default function InstitutesPage() {
  return (
    <PageLayout>
      <StructuredData structuredData={structuredData} />
      
      <HeroSection
        title="Bridge the Skills Gap"
        subtitle="Educational Excellence"
        description="Transform your educational programs with industry-aligned curriculum, meaningful partnerships, and comprehensive placement support. Prepare your students for tomorrow's careers today."
        primaryCTA={{
          text: "Partner With Us",
          href: "/contact"
        }}
        secondaryCTA={{
          text: "View Success Stories",
          href: "#success-stories"
        }}
        badge="🎓 300+ Partner Institutions"
        stats={educationStats.map(stat => ({ label: stat.label, value: stat.value }))}
      />

      {/* Solutions Overview */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Educational Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive programs designed to enhance educational outcomes and improve graduate employability.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {educationSolutions.map((solution) => {
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-green-800 mb-2">Key Benefit</h4>
                      <p className="text-sm text-green-700">{solution.benefits}</p>
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

      {/* Partnership Programs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Partnership Programs</h2>
            <p className="text-xl text-gray-600">
              Choose the partnership level that best fits your institution's needs and goals
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {partnerPrograms.map((program, index) => (
              <Card key={index} className={`relative hover:shadow-xl transition-all duration-500 ${index === 1 ? 'ring-2 ring-blue-500' : ''}`}>
                {index === 1 && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <Badge variant="outline" className="mb-4 mx-auto">
                    {program.investmentLevel}
                  </Badge>
                  <CardTitle className="text-2xl mb-2">{program.title}</CardTitle>
                  <p className="text-gray-600">{program.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {program.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mb-6">
                    <div className="text-lg font-bold text-gray-900">{program.duration}</div>
                  </div>
                  <Link href="/contact" className="block">
                    <Button className={`w-full ${index === 1 ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}>
                      Start Partnership
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Measurable Impact</h2>
            <p className="text-xl text-gray-600">
              Real improvements experienced by our partner institutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {successMetrics.map((metric, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <h3 className="font-bold text-gray-900 mb-6">{metric.label}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Before</span>
                        <span>{metric.before}{metric.unit === 'days' ? ' days' : metric.unit === 'index' ? '' : '%'}</span>
                      </div>
                      <Progress value={metric.before} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>After</span>
                        <span>{metric.after}{metric.unit === 'days' ? ' days' : metric.unit === 'index' ? '' : '%'}</span>
                      </div>
                      <Progress value={metric.after} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {metric.unit === 'days' ? `-${metric.improvement}` : `+${metric.improvement}`}
                      {metric.unit === 'days' ? ' days' : metric.unit === 'index' ? ' points' : '%'}
                    </div>
                    <div className="text-sm text-green-700">Improvement</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Success Stories</h2>
            <p className="text-xl text-gray-600">
              Hear from educational leaders who have transformed their institutions
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonialHighlights.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">{testimonial.institution}</h3>
                      <p className="text-sm text-gray-500">{testimonial.type} Education</p>
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-600 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="text-2xl font-bold text-blue-600">{testimonial.result}</div>
                    <div className="text-sm text-blue-700">Key Achievement</div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{testimonial.dean}</p>
                    <p className="text-sm text-gray-500">Dean</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Partnership Process</h2>
            <p className="text-xl text-gray-600">
              Simple steps to start transforming your educational programs
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Consultation', description: 'Initial assessment of your needs and goals' },
                { step: '02', title: 'Planning', description: 'Develop customized program and implementation timeline' },
                { step: '03', title: 'Implementation', description: 'Deploy solutions with ongoing support and training' },
                { step: '04', title: 'Optimization', description: 'Monitor results and continuously improve outcomes' }
              ].map((process, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                      {process.step}
                    </div>
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform -translate-x-8"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{process.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{process.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Transform Education?"
        description="Join 300+ institutions that have revolutionized their career services and improved graduate outcomes. Start your partnership journey today."
        primaryCTA={{
          text: "Schedule Consultation",
          href: "/contact"
        }}
        secondaryCTA={{
          text: "Download Program Guide",
          href: "/resources/program-guide"
        }}
      />
    </PageLayout>
  );
}