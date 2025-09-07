import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/header';
import { Providers } from '@/components/providers';
import ReduxProvider from '@/components/providers/redux-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareerBox | Your Pathway to Professional Excellence',
  description: 'Empowering Careers, Transforming Lives. CareerBox is revolutionizing the way professionals, businesses, and educational institutions connect and grow together.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
        <ReduxProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </ReduxProvider>
        </Providers>
      </body>
    </html>
  );
}