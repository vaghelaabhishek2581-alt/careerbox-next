// Global TypeScript interfaces and types

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundGradient?: string;
}

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  price?: string;
  popular?: boolean;
}

export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  linkedin?: string;
  twitter?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  type: 'general' | 'business' | 'institute' | 'support';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface CompanyStats {
  label: string;
  value: string;
  description: string;
}