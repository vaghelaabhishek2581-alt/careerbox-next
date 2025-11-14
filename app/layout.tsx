import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import ReduxProvider from "@/components/providers/redux-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "CareerBox | Your Pathway to Professional Excellence",
    template: "%s | CareerBox"
  },
  description:
    "Empowering Careers, Transforming Lives. CareerBox is revolutionizing the way professionals, businesses, and educational institutions connect and grow together. Find best colleges, courses, and career guidance in India.",
  keywords: [
    "career guidance",
    "college admissions",
    "engineering colleges",
    "career counselling",
    "professional development",
    "education platform",
    "institute search",
    "course finder",
    "placement assistance",
    "career planning"
  ],
  authors: [{ name: "CareerBox", url: "https://careerbox.in" }],
  creator: "CareerBox",
  publisher: "CareerBox",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/web/favicon.ico', sizes: 'any' },
      { url: '/web/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/web/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/Logo.svg', color: '#3b82f6' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'CareerBox',
    title: 'CareerBox | Your Pathway to Professional Excellence',
    description: 'Empowering Careers, Transforming Lives. Find best colleges, courses, and career guidance in India.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cboxLogo.png`,
        width: 1200,
        height: 630,
        alt: 'CareerBox - Your Career Partner',
        type: 'image/png',
      },
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/web/icon-512.png`,
        width: 512,
        height: 512,
        alt: 'CareerBox Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@careerbox',
    creator: '@careerbox',
    title: 'CareerBox | Your Pathway to Professional Excellence',
    description: 'Empowering Careers, Transforming Lives. Find best colleges, courses, and career guidance in India.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cboxLogo.png`],
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
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional Open Graph tags for better social media support */}
        <meta property="og:image:secure_url" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cboxLogo.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CareerBox - Your Career Partner" />

        {/* WhatsApp specific - uses Open Graph tags above */}
        <meta property="og:site_name" content="CareerBox" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card tags */}
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cboxLogo.png`} />
        <meta name="twitter:image:alt" content="CareerBox - Your Career Partner" />

        {/* Theme color */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />

        {/* Additional meta for better mobile experience */}
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ReduxProvider>
            <main className="min-h-screen">{children}</main>
          </ReduxProvider>
        </Providers>
      </body>
    </html>
  );
}
