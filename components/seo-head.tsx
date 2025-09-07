// SEO component for meta tags and structured data
import { Metadata } from 'next';
import { SEOData } from '@/lib/types';

interface SEOHeadProps extends SEOData {
  structuredData?: object;
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  ogImage = '/images/og-default.jpg',
  canonicalUrl
}: SEOData): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://careerbox.com';
  
  return {
    title: `${title} | CareerBox - Your Pathway to Professional Excellence`,
    description,
    keywords: [...keywords, 'career development', 'talent acquisition', 'professional growth'].join(', '),
    authors: [{ name: 'CareerBox Team' }],
    creator: 'CareerBox',
    publisher: 'CareerBox',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl || '/',
    },
    openGraph: {
      title: `${title} | CareerBox`,
      description,
      url: canonicalUrl || '/',
      siteName: 'CareerBox',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | CareerBox`,
      description,
      images: [ogImage],
      creator: '@careerbox',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function StructuredData({ structuredData }: { structuredData: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}