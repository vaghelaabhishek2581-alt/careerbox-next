import { Metadata } from "next";
import { generateSEOMetadata } from "@/components/seo-head";
import CareersClient from "./client";

export const metadata: Metadata = generateSEOMetadata({
  title: "Careers",
  description: "Join CareerBox to build the future of education and career growth. Explore open positions and life at CareerBox.",
  keywords: ["careers", "jobs", "openings", "hiring", "culture", "benefits"],
  canonicalUrl: "/careers",
});

export default function CareersPageRoute() {
  return <CareersClient />;
}
