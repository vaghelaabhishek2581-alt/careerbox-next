import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo-head';
import Footer from '@/components/footer';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy Policy',
  description: 'CareerBox Privacy Policy - How we collect, use, and protect your personal information.',
  keywords: ['privacy policy', 'data protection', 'personal information', 'GDPR'],
  canonicalUrl: '/privacy'
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto prose prose-lg prose-slate prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              Last updated: January 15, 2024
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                Introduction
              </h2>
              <p className="leading-relaxed">
                At CareerBox ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our career development platform and services (collectively, the "Service").
              </p>
              <p className="leading-relaxed">
                By using our Service, you consent to the data practices described in this policy. Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                Information We Collect
              </h2>
              
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">2.1 Personal Information You Provide</h3>
                <p className="mb-4">We collect information you provide directly to us, including:</p>
                <ul className="grid sm:grid-cols-2 gap-4 list-none pl-0">
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span><strong>Account:</strong> Name, email, phone, password</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span><strong>Profile:</strong> Education, skills, career goals</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span><strong>Preferences:</strong> Course interests, career paths</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span><strong>Payment:</strong> Billing address, transaction details</span></li>
                </ul>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">2.2 Information Automatically Collected</h3>
              <p>When you use our Service, we automatically collect certain information:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, clicks, navigation patterns</li>
                <li><strong>Location Data:</strong> General location information based on IP address</li>
                <li><strong>Log Data:</strong> Server logs, error reports, performance data</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3">2.3 Information from Third Parties</h3>
              <p>We may receive information about you from:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Educational institutions and partner organizations</li>
                <li>Employers and business partners (with appropriate consents)</li>
                <li>Social media platforms (when you choose to connect your accounts)</li>
                <li>Analytics and marketing service providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                How We Use Your Information
              </h2>
              <p>We use the information we collect for the following purposes:</p>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Service Provision</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Provide personalized career guidance</li>
                    <li>Manage user accounts and profiles</li>
                    <li>Facilitate skills assessments</li>
                    <li>Process payments</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Communication</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Send service notifications</li>
                    <li>Respond to support inquiries</li>
                    <li>Send newsletters (with consent)</li>
                    <li>Conduct surveys</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Improvement</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Analyze usage patterns</li>
                    <li>Research and development</li>
                    <li>Personalize content</li>
                    <li>Prevent fraud</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Legal</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Comply with obligations</li>
                    <li>Enforce Terms of Service</li>
                    <li>Protect user safety</li>
                    <li>Support business operations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
                Information Sharing
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">With Your Consent</h3>
                  <p>We may share your information with third parties when you provide explicit consent, such as when connecting with potential employers or educational institutions through our platform.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Service Providers</h3>
                  <p>We share information with trusted service providers who assist us with cloud hosting, payment processing, email marketing, analytics, and customer support.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Requirements</h3>
                  <p>We may disclose information when required by law, to enforce our policies, or to protect the rights, property, or safety of CareerBox, our users, or others.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">5</span>
                Your Rights
              </h2>
              
              <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Access & Update</h3>
                    <p className="text-sm text-blue-800">You have the right to access your personal information and update it through your account settings or by contacting us.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Deletion</h3>
                    <p className="text-sm text-blue-800">You may request deletion of your personal information, subject to legal retention requirements.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Opt-Out</h3>
                    <p className="text-sm text-blue-800">You can opt out of marketing communications at any time through the unsubscribe link in our emails.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Data Portability</h3>
                    <p className="text-sm text-blue-800">You have the right to receive a copy of your data in a structured, commonly used format.</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-blue-200 text-center">
                  <p className="text-blue-900 font-medium">
                    To exercise these rights, contact us at <a href="mailto:privacy@careerbox.in" className="underline hover:text-blue-700">privacy@careerbox.in</a>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">6</span>
                Contact Us
              </h2>
              <p className="mb-6">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
              </p>
              
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">General Inquiries</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Email:</strong> info@careerbox.in</p>
                    <p><strong>Phone:</strong> +91 99 0967 5185</p>
                    <p><strong>Address:</strong> 53, World Business House,<br/>Nr. Parimal Garden, Ahmedabad, Gujarat</p>
                  </div>
                </div>
                <div className="md:border-l md:border-gray-200 md:pl-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy Officer</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Email:</strong> privacy@careerbox.in</p>
                    <p className="text-sm mt-4 max-w-xs">For specific privacy-related concerns or data subject requests.</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-8 mt-12 text-center text-gray-500 text-sm italic">
              This Privacy Policy is effective as of January 15, 2024. We are committed to protecting your privacy and will continue to review and update our practices.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
