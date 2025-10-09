import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstituteDetails } from "@/lib/actions/institute-recommendations";
import { InstituteDetailPage } from "@/components/publicCollections/InstituteDetailPage";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const institute = await getInstituteDetails(params.slug);
  
  if (!institute) {
    return {
      title: "Institute Not Found",
      description: "The requested institute could not be found.",
    };
  }

  const placementData = Object.keys(institute.placements).find(key => key !== 'sectors');
  const latestPlacement = placementData ? institute.placements[placementData] : null;

  return {
    title: `${institute.name} - ${institute.location.city} | CareerBox`,
    description: `${institute.overview.description.substring(0, 160)}...`,
    keywords: [
      institute.name,
      institute.shortName,
      institute.location.city,
      institute.location.state,
      institute.type,
      'engineering college',
      'university',
      'admission',
      'courses',
      'placement'
    ].join(', '),
    openGraph: {
      title: `${institute.name} - Complete Details`,
      description: institute.overview.description,
      type: 'website',
      locale: 'en_IN',
      siteName: 'CareerBox',
      images: [
        {
          url: '/images/institutes/default-cover.jpg',
          width: 1200,
          height: 630,
          alt: `${institute.name} Campus`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${institute.name} - Complete Details`,
      description: institute.overview.description,
      images: ['/images/institutes/default-cover.jpg'],
    },
    alternates: {
      canonical: `/institutes/${institute.slug}`,
    },
  };
}

export default async function InstitutePage({ params }: PageProps) {
  const institute = await getInstituteDetails(params.slug);

  if (!institute) {
    notFound();
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": institute.name,
    "alternateName": institute.shortName,
    "description": institute.overview.description,
    "url": institute.contact.website,
    "logo": "/images/institutes/default-logo.jpg",
    "image": "/images/institutes/default-cover.jpg",
    "foundingDate": institute.establishedYear.toString(),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": institute.location.address,
      "addressLocality": institute.location.city,
      "addressRegion": institute.location.state,
      "postalCode": institute.location.pincode,
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": institute.contact.phone[0],
      "email": institute.contact.email,
      "contactType": "admissions"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": institute.location.coordinates.latitude,
      "longitude": institute.location.coordinates.longitude
    },
    "numberOfStudents": institute.academics.totalStudents,
    "faculty": institute.academics.totalFaculty,
    "accreditingBody": [
      ...(institute.accreditation.naac ? ["NAAC"] : []),
      ...(institute.accreditation.aicte?.approved ? ["AICTE"] : []),
      ...(institute.accreditation.ugc ? ["UGC"] : [])
    ],
    "hasCredential": institute.courses.map(course => ({
      "@type": "EducationalOccupationalCredential",
      "name": `${course.degree} in ${course.name}`,
      "educationalLevel": course.level,
      "timeToComplete": course.duration
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <InstituteDetailPage institute={institute} />
    </>
  );
}
