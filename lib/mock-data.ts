// Mock data for the website
import { ServiceCard, TestimonialData, TeamMember, FAQ, CompanyStats } from './types';

export const companyStats: CompanyStats[] = [
  {
    label: 'Active Users',
    value: '50K+',
    description: 'Professionals using our platform'
  },
  {
    label: 'Partner Companies',
    value: '1,200+',
    description: 'Businesses trust our solutions'
  },
  {
    label: 'Educational Partners',
    value: '300+',
    description: 'Institutes in our network'
  },
  {
    label: 'Success Rate',
    value: '96%',
    description: 'Career advancement rate'
  }
];

export const services: ServiceCard[] = [
  {
    id: 'career-development',
    title: 'Career Development',
    description: 'Personalized career paths with skills assessment and mentorship programs',
    features: [
      'AI-powered career matching',
      'Skills gap analysis',
      'Personal career roadmap',
      '1-on-1 mentorship',
      'Industry insights'
    ],
    icon: 'Target',
    price: 'From $29/month'
  },
  {
    id: 'talent-acquisition',
    title: 'Talent Acquisition',
    description: 'Advanced recruitment solutions for growing businesses',
    features: [
      'Smart candidate matching',
      'Automated screening',
      'Interview scheduling',
      'Skills verification',
      'Candidate analytics'
    ],
    icon: 'Users',
    price: 'From $299/month',
    popular: true
  },
  {
    id: 'educational-programs',
    title: 'Educational Programs',
    description: 'Bridge the skills gap with industry-aligned curriculum',
    features: [
      'Curriculum development',
      'Industry partnerships',
      'Student placement',
      'Faculty training',
      'Career readiness'
    ],
    icon: 'GraduationCap',
    price: 'Custom pricing'
  }
];

export const testimonials: TestimonialData[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Developer',
    company: 'TechCorp',
    content: 'CareerBox transformed my career trajectory. The personalized guidance and skill development programs helped me land my dream job.',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'HR Director',
    company: 'InnovateCo',
    content: 'Our recruitment process improved dramatically. We now hire better candidates faster thanks to CareerBox\'s talent acquisition platform.',
    rating: 5
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    role: 'Dean of Engineering',
    company: 'State University',
    content: 'The partnership with CareerBox has increased our graduate employment rate by 40%. Their industry connections are invaluable.',
    rating: 5
  }
];

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Mahesh Patel',
    role: 'CEO & Founder',
    bio: 'Passionate about democratizing career growth.',
    linkedin: 'https://www.linkedin.com/in/maheshpatel3112/'
  },
  {
    id: '2',
    name: 'Mahesh Patel',
    role: 'Managing Director',
    bio: 'Passionate about democratizing career growth.',
    linkedin: 'https://www.linkedin.com/in/mahesh-patel-290621247/'
  },
  
];

export const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How does CareerBox personalize career recommendations?',
    answer: 'We use advanced AI algorithms that analyze your skills, experience, interests, and market trends to provide personalized career paths and opportunities.',
    category: 'general'
  },
  {
    id: '2',
    question: 'What makes your talent acquisition different?',
    answer: 'Our platform combines AI-powered matching with human insights, providing a more accurate and efficient hiring process that considers both technical skills and cultural fit.',
    category: 'business'
  },
  {
    id: '3',
    question: 'How do you support educational institutions?',
    answer: 'We offer curriculum development, industry partnerships, faculty training, and direct placement programs to bridge the gap between education and employment.',
    category: 'institutes'
  }
];