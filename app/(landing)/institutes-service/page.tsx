import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo-head';
import InstitutesPageContent from './InstitutesPageContent';

export const metadata: Metadata = generateSEOMetadata({
  title: 'For Educational Institutes',
  description: 'Grow enrollments and streamline admissions with CareerBox\'s comprehensive educational solutions. Verified student leads, admissions CRM, and placement support.',
  keywords: ['educational partnerships', 'student enrollment', 'admissions CRM', 'lead generation', 'placement support'],
  canonicalUrl: '/institutes-service'
});

export default function InstitutesPage() {
  return <InstitutesPageContent />;
}
