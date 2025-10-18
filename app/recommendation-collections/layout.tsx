import WebLayout from "@/components/layouts/web-layout";
import Header from "@/components/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | CareerBox",
    default: "Best Engineering Colleges, Programs & Courses in India | CareerBox",
  },
  description:
    "Find the best engineering colleges, programs, and courses in India with comprehensive information about fees, placements, rankings, admissions, and reviews. Compare institutes and make informed decisions.",
  keywords: [
    "engineering colleges",
    "best colleges india",
    "college admissions",
    "engineering courses",
    "college rankings",
    "placement statistics",
    "college fees",
    "engineering admission",
    "top universities india",
    "institute search",
    "course finder",
    "college comparison",
    "admission process",
    "entrance exams",
    "scholarship information",
  ],
  authors: [{ name: "CareerBox" }],
  creator: "CareerBox",
  publisher: "CareerBox",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections`,
    siteName: "CareerBox",
    title: "Best Engineering Colleges, Programs & Courses in India - CareerBox",
    description:
      "Discover top engineering colleges, programs, and courses in India with detailed information about fees, placements, rankings, and admissions. Compare and choose the best fit for your career.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/cboxLogo.png`,
        width: 1200,
        height: 630,
        alt: "CareerBox - Find Best Colleges in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@careerbox",
    creator: "@careerbox",
    title: "Best Engineering Colleges, Programs & Courses in India",
    description:
      "Discover top engineering colleges in India with detailed information about courses, fees, placements, and rankings.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/cboxLogo.png`],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/recommendation-collections`,
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RecommendationCollectionsLayout({
  children,
}: LayoutProps) {
  return (
    <>
      {/* Additional SEO meta tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="CareerBox" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="recommendation-collections-layout">{children}</div>
    </>
  );
}
