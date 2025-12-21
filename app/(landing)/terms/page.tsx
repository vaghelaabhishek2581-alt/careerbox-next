import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo-head';
import Footer from '@/components/footer';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Terms of Service',
  description: 'CareerBox Terms of Service - Legal terms and conditions for using our career development platform.',
  keywords: ['terms of service', 'legal', 'user agreement', 'platform terms'],
  canonicalUrl: '/terms'
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto prose prose-lg prose-slate prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              Last updated: January 15, 2024
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                Welcome to CareerBox ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our career development platform, website, and services (collectively, the "Service") operated by CareerBox.
              </p>
              <p className="leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                Description of Service
              </h2>
              <p>CareerBox is a comprehensive career development platform that provides:</p>
              
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Career guidance & counselling</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Skills assessment programs</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Professional networking</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Educational partnerships</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                User Account
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">3.1 Account Creation</h3>
                  <p>To access certain features of our Service, you must create an account. You agree to provide accurate, current, and complete information during registration.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">3.2 Age Requirements</h3>
                  <p>You must be at least 13 years old to use our Service. Users between 13 and 18 require parental consent.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">3.3 Security</h3>
                  <p>You are responsible for safeguarding your account credentials and for all activities that occur under your account.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
                Acceptable Use
              </h2>
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <h3 className="font-bold text-red-900 mb-4">You agree NOT to:</h3>
                <ul className="grid sm:grid-cols-2 gap-3 list-none pl-0">
                  <li className="flex items-center gap-2 text-red-800 text-sm"><span className="text-red-500">✕</span> Violate any laws or regulations</li>
                  <li className="flex items-center gap-2 text-red-800 text-sm"><span className="text-red-500">✕</span> Infringe intellectual property</li>
                  <li className="flex items-center gap-2 text-red-800 text-sm"><span className="text-red-500">✕</span> Transmit harmful content</li>
                  <li className="flex items-center gap-2 text-red-800 text-sm"><span className="text-red-500">✕</span> Engage in fraudulent activity</li>
                  <li className="flex items-center gap-2 text-red-800 text-sm"><span className="text-red-500">✕</span> Harass or abuse other users</li>
                  <li className="flex items-center gap-2 text-red-800 text-sm"><span className="text-red-500">✕</span> Interfere with Service security</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">5</span>
                Content & Rights
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Your Content</h3>
                  <p className="text-sm">You retain ownership of content you submit ("User Content"). You grant us a license to use, display, and distribute your content in connection with the Service.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Our Content</h3>
                  <p className="text-sm">The Service and its original content, features, and functionality are owned by CareerBox and protected by intellectual property laws.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">6</span>
                Disclaimers & Liability
              </h2>
              <p className="mb-4">
                <strong>Service Disclaimer:</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
              </p>
              <p className="mb-4">
                <strong>Limitation of Liability:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, CAREERBOX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
              </p>
              <p>
                While we provide career guidance, we cannot guarantee specific career outcomes or job placements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">7</span>
                Contact Information
              </h2>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <p className="mb-4">If you have any questions about these Terms of Service, please contact us at:</p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Email:</strong> info@careerbox.in</p>
                  <p><strong>Phone:</strong> +91 99 0967 5185</p>
                  <p><strong>Address:</strong> 53, World Business House, Nr. Parimal Garden, Ahmedabad, Gujarat</p>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-8 mt-12 text-center text-gray-500 text-sm italic">
              These Terms of Service are effective as of January 15, 2024.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
