import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstituteDetails } from "@/lib/actions/institute-recommendations";
import { InstituteDetailPage } from "@/components/publicCollections/InstituteDetailPage";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const institute = await getInstituteDetails(resolvedParams.slug);

  if (!institute) {
    return {
      title: "Institute Not Found - CareerBox",
      description: "The requested institute information could not be found.",
    };
  }

  const title = `${institute.name} - Fees, Placements, Reviews & Rankings | CareerBox`;
  const description = `Get complete information about ${institute.name} in ${institute.location.city}, ${institute.location.state}. Check courses, placements, reviews, rankings, and admission details.`;

  return {
    title,
    description,
    keywords: [
      institute.name,
      `${institute.name} fees`,
      `${institute.name} placements`,
      `${institute.name} admission`,
      `${institute.name} courses`,
      `${institute.name} reviews`,
      `${institute.name} ranking`,
      `engineering institutes ${institute.location.city}`,
      `colleges in ${institute.location.city}`,
      institute.location.city,
      institute.location.state,
      "institute reviews",
      "engineering admission",
      "college admission",
      institute.type,
    ],
    authors: [{ name: "CareerBox" }],
    creator: "CareerBox",
    publisher: "CareerBox",
    // Use institute logo as favicon if available, fallback to CareerBox favicon
    icons: institute.logo ? {
      icon: [
        { url: institute.logo, sizes: 'any' },
      ],
      apple: [
        { url: institute.logo },
      ],
    } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections/${resolvedParams.slug}`,
      siteName: "CareerBox",
      images: [
        {
          url: institute.coverImage || institute.logo || `${process.env.NEXT_PUBLIC_APP_URL}/cboxLogo.png`,
          width: 1200,
          height: 630,
          alt: `${institute.name} Campus`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@careerbox",
      creator: "@careerbox",
      title,
      description,
      images: [institute.coverImage || institute.logo || `${process.env.NEXT_PUBLIC_APP_URL}/cboxLogo.png`],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections/${resolvedParams.slug}`,
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

export default async function InstituteDetailPageRoute({
  params,
}: PageProps) {
  const resolvedParams = await params;
  const institute = await getInstituteDetails(resolvedParams.slug);

  if (!institute) {
    notFound();
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections/${resolvedParams.slug}`,
    name: institute.name,
    alternateName: institute.name,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections/${resolvedParams.slug}`,
    logo: {
      "@type": "ImageObject",
      url: institute.logo || `${process.env.NEXT_PUBLIC_APP_URL}/cboxLogo.png`,
      width: 200,
      height: 200,
    },
    image: {
      "@type": "ImageObject",
      url: institute.coverImage || institute.logo || `${process.env.NEXT_PUBLIC_APP_URL}/cboxLogo.png`,
      width: 1200,
      height: 630,
    },
    description: institute.overview.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: institute.location.address || "",
      addressLocality: institute.location.city,
      addressRegion: institute.location.state,
      postalCode: institute.location.pincode || "",
      addressCountry: "IN",
    },
    geo: (institute.location as any).coordinates ? {
      "@type": "GeoCoordinates",
      latitude: (institute.location as any).coordinates.lat,
      longitude: (institute.location as any).coordinates.lng,
    } : undefined,
    telephone: (institute as any).contact?.phone || "",
    email: (institute as any).contact?.email || "",
    foundingDate: institute.establishedYear.toString(),
    aggregateRating: (institute as any).rating ? {
      "@type": "AggregateRating",
      ratingValue: (institute as any).rating,
      reviewCount: (institute as any).reviewCount || 100,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    offers: institute.courses.map((course: any) => ({
      "@type": "Offer",
      name: `${course.degree} in ${course.name}`,
      description: `${course.degree} program in ${course.name}`,
      category: "Educational Programs",
      priceCurrency: "INR",
      price: course.fees?.total || "Contact for fees",
    })),
    department: institute.courses.map((course: any) => ({
      "@type": "Organization",
      name: `Department of ${course.name}`,
      description: `${course.degree} in ${course.name}`,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Courses",
      itemListElement: institute.courses.map((course: any, index: number) => ({
        "@type": "Offer",
        position: index + 1,
        name: `${course.degree} in ${course.name}`,
        description: course.description || `${course.degree} program in ${course.name}`,
      })),
    },
    sameAs: [
      (institute as any).website,
      (institute as any).socialMedia?.facebook,
      (institute as any).socialMedia?.twitter,
      (institute as any).socialMedia?.linkedin,
      (institute as any).socialMedia?.instagram,
    ].filter(Boolean),
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <InstituteDetailPage institute={institute as any} />
    </>
  );
}
