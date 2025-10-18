import { Metadata } from "next";
import { getUnifiedRecommendations } from "@/lib/actions/unified-recommendations";
import RecommendationCollectionsClient from "./client";

// SEO Metadata
export const metadata: Metadata = {
  title: "Explore Opportunities - Find Best Institutes, Programs & Courses in India - CareerBox",
  description: "Discover top institutes, programs, courses, jobs, and exams in India with detailed information about fees, placements, and rankings. Find the perfect educational path for your career.",
  keywords: [
    "institutes",
    "programs",
    "courses",
    "jobs",
    "exams",
    "best institutes india",
    "engineering courses",
    "placement statistics",
    "career opportunities",
    "educational programs"
  ],
  openGraph: {
    title: "Explore Opportunities - CareerBox",
    description: "Discover top institutes, programs, courses, jobs, and exams in India",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Opportunities - CareerBox",
    description: "Discover top institutes, programs, courses, jobs, and exams in India",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections`,
  },
};

export default async function RecommendationCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Extract search parameters
  const type = (params.type as 'institutes' | 'programs' | 'courses') || 'institutes';
  const location = params.location as string | undefined;
  const category = params.category as string | undefined;
  const instituteType = params.instituteType as string | undefined;
  const degree = params.degree as string | undefined;
  const query = params.q as string | undefined;
  const sortBy = (params.sortBy as string) || 'popularity';
  const accreditation = params.accreditation as string | undefined;
  const page = parseInt((params.page as string) || '1', 10);

  // Fetch initial data server-side
  const initialData = await getUnifiedRecommendations({
    type,
    location,
    category,
    instituteType,
    degree,
    query,
    page,
    sortBy,
    accreditation,
  });

  return (
    <RecommendationCollectionsClient
      initialData={initialData}
      initialType={type}
      initialParams={{
        location,
        category,
        instituteType,
        degree,
        query,
        sortBy,
        accreditation,
      }}
    />
  );
}
