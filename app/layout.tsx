import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import ReduxProvider from "@/components/providers/redux-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerBox | Your Pathway to Professional Excellence",
  description:
    "Empowering Careers, Transforming Lives. CareerBox is revolutionizing the way professionals, businesses, and educational institutions connect and grow together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
