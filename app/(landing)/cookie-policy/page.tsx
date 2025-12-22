import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo-head';
import Footer from '@/components/footer';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Cookie Policy',
  description: 'CareerBox Cookie Policy - Information about how we use cookies and tracking technologies.',
  keywords: ['cookie policy', 'cookies', 'tracking', 'privacy'],
  canonicalUrl: '/cookie-policy'
});

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto prose prose-lg prose-slate prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              Last updated: January 15, 2024
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                What Are Cookies?
              </h2>
              <p className="leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
              </p>
              <p className="leading-relaxed">
                Cookies enable us to recognize your device and remember your preferences and settings, enhancing your experience on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                How We Use Cookies
              </h2>
              <p>We use cookies for several purposes, including:</p>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Authentication</h3>
                  <p className="text-sm">To identify you when you sign in to our Service and keep you logged in.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Security</h3>
                  <p className="text-sm">To protect your account and our platform from unauthorized access and fraud.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Preferences</h3>
                  <p className="text-sm">To remember your settings, such as language and display preferences.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Analytics</h3>
                  <p className="text-sm">To understand how you use our Service and improve its performance.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                Types of Cookies We Use
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Essential Cookies</h3>
                  <p>These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Cookies</h3>
                  <p>These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Functional Cookies</h3>
                  <p>These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Targeting Cookies</h3>
                  <p>These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
                Managing Cookies
              </h2>
              <p className="mb-4">
                You can manage or disable cookies through your browser settings. However, please note that disabling certain cookies may affect the functionality of our website.
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-sm font-medium text-gray-900 mb-2">Browser Instructions:</p>
                <ul className="grid sm:grid-cols-2 gap-2 list-disc pl-5 text-sm">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
                  <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
                  <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apple Safari</a></li>
                  <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">5</span>
                Contact Us
              </h2>
              <p>
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <div className="mt-4">
                <a href="mailto:privacy@careerbox.in" className="text-blue-600 font-medium hover:underline">privacy@careerbox.in</a>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
