import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInstituteDetails } from "@/lib/actions/institute-recommendations";
import { InstituteDetailPage } from "@/components/publicCollections/InstituteDetailPage";
import { getInstituteBySlug } from "@/lib/actions/institute-actions";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const institute = await getInstituteDetails(resolvedParams.slug);

  const programmeSlug = resolvedSearchParams.programme as string | undefined;
  const courseSlug = resolvedSearchParams.course as string | undefined;

  if (!institute) {
    return {
      title: "Institute Not Found - CareerBox",
      description: "The requested institute information could not be found.",
    };
  }

  let programmeName = "";
  let courseName = "";

  if (programmeSlug && institute.programmes) {
    const programme = institute.programmes.find(
      (p: any) =>
        p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") === programmeSlug,
    );
    if (programme) {
      programmeName = programme.name;

      if (courseSlug) {
        const course = programme.course?.find((c: any) => {
          const fullCourseName = `${c.degree}${c.name ? `-${c.name}` : ""}`;
          return (
            fullCourseName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") === courseSlug
          );
        });
        if (course) {
          courseName = `${course.degree}${course.name ? ` in ${course.name}` : ""}`;
        }
      }
    }
  }

  let title: string;
  let description: string;

  if (courseName) {
    title = `${courseName} at ${institute.name} - Fees, Duration, Admission | CareerBox`;
    description = `Complete details about ${courseName} program at ${institute.name}, ${institute.location.city}. Check course fees, duration, eligibility, admission process, and placement statistics.`;
  } else if (programmeName) {
    title = `${programmeName} at ${institute.name} - Courses, Fees & Placements | CareerBox`;
    description = `Explore ${programmeName} courses at ${institute.name}, ${institute.location.city}. View course list, fees structure, admission requirements, and placement records.`;
  } else {
    title = `${institute.name} - Fees, Placements, Reviews & Rankings | CareerBox`;
    description = `Get complete information about ${institute.name} in ${institute.location.city}, ${institute.location.state}. Check courses, placements, reviews, rankings, and admission details.`;
  }

  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections/${resolvedParams.slug}`;
  const imageUrl =
    institute.coverImage ||
    institute.logo ||
    `${process.env.NEXT_PUBLIC_APP_URL}/cboxLogo.png`;

  return {
    title,
    description,
    keywords: [
      institute.name,
      ...(programmeName
        ? [
            programmeName,
            `${programmeName} at ${institute.name}`,
            `${programmeName} fees`,
            `${programmeName} admission`,
          ]
        : []),
      ...(courseName
        ? [
            courseName,
            `${courseName} fees`,
            `${courseName} duration`,
            `${courseName} eligibility`,
          ]
        : []),
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
    ].filter(Boolean),
    authors: [{ name: "CareerBox" }],
    creator: "CareerBox",
    publisher: "CareerBox",
    icons: institute.logo
      ? {
          icon: [{ url: institute.logo, sizes: "any" }],
          apple: [{ url: institute.logo }],
        }
      : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_IN",
      url: canonicalUrl,
      siteName: "CareerBox",
      images: [
        {
          url: imageUrl,
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
      images: [imageUrl],
    },
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

function MaintenancePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Page Under Maintenance
        </h1>
        <p className="text-gray-600 mb-8">
          This institute page is currently being updated. Please check back
          later or explore other institutes in our collection.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/recommendation-collections"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Explore Institutes
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function buildStructuredData(institute: any, slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const pageUrl = `${baseUrl}/recommendation-collections/${slug}`;
  const logoUrl = institute.logo || `${baseUrl}/cboxLogo.png`;
  const imageUrl = institute.coverImage || logoUrl;

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": pageUrl,
    name: institute.name,
    alternateName: institute.name,
    url: pageUrl,
    logo: { "@type": "ImageObject", url: logoUrl, width: 200, height: 200 },
    image: { "@type": "ImageObject", url: imageUrl, width: 1200, height: 630 },
    description: institute.overview.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: institute.location.address || "",
      addressLocality: institute.location.city,
      addressRegion: institute.location.state,
      postalCode: institute.location.pincode || "",
      addressCountry: "IN",
    },
    geo: institute.location.coordinates
      ? {
          "@type": "GeoCoordinates",
          latitude: institute.location.coordinates.lat,
          longitude: institute.location.coordinates.lng,
        }
      : undefined,
    telephone: institute.contact?.phone || "",
    email: institute.contact?.email || "",
    foundingDate: institute.establishedYear.toString(),
    aggregateRating: institute.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: institute.rating,
          reviewCount: institute.reviewCount || 100,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
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
        description:
          course.description || `${course.degree} program in ${course.name}`,
      })),
    },
    sameAs: [
      institute.website,
      institute.socialMedia?.facebook,
      institute.socialMedia?.twitter,
      institute.socialMedia?.linkedin,
      institute.socialMedia?.instagram,
    ].filter(Boolean),
  };
}

export default async function InstituteDetailPageRoute({ params }: PageProps) {
  const resolvedParams = await params;
  const institute = await getInstituteDetails(resolvedParams.slug);

  if (!institute) {
    notFound();
  }

  const combined = await getInstituteBySlug(resolvedParams.slug);
  const isPublished = (combined as any)?.admin?.published ?? true;

  if (!isPublished) {
    return <MaintenancePage />;
  }

  const structuredData = buildStructuredData(institute, resolvedParams.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <InstituteDetailPage institute={institute as any} />
    </>
  );
}
