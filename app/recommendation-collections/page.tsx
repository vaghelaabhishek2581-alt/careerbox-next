import { Metadata } from "next";
import engine, { initSearchEngine } from "@/lib/search/engine";
import RecommendationCollectionsClient from "./client";

// SEO Metadata
export const metadata: Metadata = {
  title:
    "Explore Opportunities - Find Best Institutes, Programs & Courses in India - CareerBox",
  description:
    "Discover top institutes, programs, courses, jobs, and exams in India with detailed information about fees, placements, and rankings. Find the perfect educational path for your career.",
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
    "educational programs",
  ],
  openGraph: {
    title: "Explore Opportunities - CareerBox",
    description:
      "Discover top institutes, programs, courses, jobs, and exams in India",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Opportunities - CareerBox",
    description:
      "Discover top institutes, programs, courses, jobs, and exams in India",
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

  const type =
    (params.type as "institutes" | "programs" | "courses") || "institutes";
  const city = (params.city as string) || (params.location as string);
  const state = params.state as string | undefined;
  const level = params.level as string | undefined;
  const programme = (params.programme as string) || (params.category as string);
  const exam = params.exam as string | undefined;
  const course = (params.course as string) || (params.degree as string);
  const instituteType = params.instituteType as string | undefined;
  const query = params.q as string | undefined;
  const sortByParam = params.sortBy as string | undefined;
  const sortBy =
    sortByParam === "courses" ||
    sortByParam === "established" ||
    sortByParam === "name"
      ? sortByParam
      : "name";
  const sortOrderParam = params.sortOrder as string | undefined;
  const sortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "asc";
  const accreditation = params.accreditation as string | undefined;
  const page = parseInt((params.page as string) || "1", 10);
  const limit = parseInt((params.limit as string) || "20", 10);

  const typeMap: Record<string, "institute" | "programme" | "course"> = {
    institutes: "institute",
    programs: "programme",
    courses: "course",
  };
  const searchType = typeMap[type];

  await initSearchEngine();

  let initialData: any;

  if (type === "institutes" && !query) {
    initialData = engine.explore({
      city,
      state,
      type: instituteType,
      level,
      programme,
      exam,
      course,
      accreditation,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  } else {
    initialData = engine.search({
      q: query,
      type: searchType,
      city,
      state,
      level,
      programme,
      exam,
      course,
      page,
      limit,
    });
  }

  return (
    <RecommendationCollectionsClient
      initialData={initialData}
      initialType={type}
      initialParams={{
        city,
        state,
        level,
        programme,
        exam,
        course,
        instituteType,
        query,
        sortBy,
        sortOrder,
        accreditation,
        page,
        limit,
      }}
    />
  );
}
