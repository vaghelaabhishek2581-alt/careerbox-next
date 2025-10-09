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
      `engineering institutes ${institute.location.city}`,
      institute.location.city,
      institute.location.state,
      "institute reviews",
      "engineering admission",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections/${resolvedParams.slug}`,
      images: [
        {
          url: institute.coverImage || `${process.env.NEXT_PUBLIC_APP_URL}/og-institute.jpg`,
          width: 1200,
          height: 630,
          alt: `${institute.name} Campus`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [institute.coverImage || `${process.env.NEXT_PUBLIC_APP_URL}/og-institute.jpg`],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections/${resolvedParams.slug}`,
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
    name: institute.name,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections/${resolvedParams.slug}`,
    logo: institute.logo,
    image: institute.coverImage,
    description: institute.overview.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: institute.location.city,
      addressRegion: institute.location.state,
      addressCountry: "India",
    },
    foundingDate: institute.establishedYear.toString(),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.5, // You can add this to institute data
      reviewCount: 100, // You can add this to institute data
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      "@type": "Offer",
      category: "Educational Programs",
      description: "Various engineering and technology programs",
    },
    department: institute.courses.map((course: any) => ({
      "@type": "Organization",
      name: `${course.degree} in ${course.name}`,
    })),
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

      <InstituteDetailPage institute={institute} />
    </>
  );
}
