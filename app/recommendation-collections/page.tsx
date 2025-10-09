import { Metadata } from "next";
import { Suspense } from "react";
import { getInstituteRecommendations } from "@/lib/actions/institute-recommendations";
import { InstituteFilters } from "@/components/publicCollections/InstituteFilters";
import { InstituteGrid } from "@/components/publicCollections/InstituteGrid";
import { InstituteSearchHeader } from "@/components/publicCollections/InstituteSearchHeader";
import { LoadingSkeleton } from "@/components/publicCollections/LoadingSkeleton";

// SEO Metadata
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q as string;
  const location = resolvedSearchParams.location as string;
  const type = resolvedSearchParams.type as string;
  const category = resolvedSearchParams.category as string;
  const accreditation = resolvedSearchParams.accreditation as string;
  const page = parseInt(resolvedSearchParams.page as string) || 1;

  let title = "Best Engineering Institutes in India - CareerBox";
  let description = "Discover top engineering institutes and universities in India with detailed information about courses, fees, placements, and rankings. Find the perfect institute for your career.";

  if (location) {
    title = `Best Engineering Institutes in ${location} - CareerBox`;
    description = `Find top engineering institutes in ${location} with comprehensive details about admissions, fees, placements, and student reviews.`;
  }

  if (category) {
    title = `Best ${category} Institutes in India - CareerBox`;
    description = `Explore top ${category} institutes in India with detailed course information, placement statistics, and admission requirements.`;
  }

  if (query) {
    title = `${query} - Engineering Institutes Search Results - CareerBox`;
    description = `Search results for "${query}" - Find the best engineering institutes matching your criteria with detailed information and reviews.`;
  }

  return {
    title,
    description,
    keywords: [
      "engineering institutes",
      "best institutes india",
      "institute admissions",
      "engineering courses",
      "institute rankings",
      "placement statistics",
      location,
      category,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/og-college-search.jpg`,
          width: 1200,
          height: 630,
          alt: "CareerBox College Search",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_APP_URL}/og-college-search.jpg`],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections`,
    },
  };
}

interface SearchParams {
  location?: string;
  category?: string;
  type?: string;
  q?: string;
  page?: string;
  sortBy?: string;
  accreditation?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function RecommendationCollectionsPage({
  searchParams,
}: PageProps) {
  // Extract search parameters
  const resolvedSearchParams = await searchParams;
  const {
    location,
    category,
    type,
    q: query,
    page = "1",
    sortBy = "popularity",
    accreditation,
  } = resolvedSearchParams;

  // Server-side data fetching with caching
  const instituteData = await getInstituteRecommendations({
    location,
    category,
    type,
    query,
    page: parseInt(page),
    sortBy,
    accreditation,
  });



  return (
    <>
      {/* Structured Data for SEO */}


      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <InstituteSearchHeader
          totalResults={instituteData.total}
          currentQuery={query}
          currentLocation={location}
          currentType={type}
        />

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-6">
                <Suspense fallback={<div className="h-96 bg-white rounded-lg animate-pulse" />}>
                  <InstituteFilters
                    currentLocation={location}
                    currentCategory={category}
                    currentType={type}
                    currentAccreditation={accreditation}
                    availableFilters={instituteData.filters}
                  />
                </Suspense>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              <Suspense fallback={<LoadingSkeleton />}>
                <InstituteGrid
                  initialInstitutes={instituteData.institutes}
                  total={instituteData.total}
                  sortBy={sortBy}
                />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}