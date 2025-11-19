import { Metadata } from 'next';
import PageLayout from '@/components/page-layout';
import { generateSEOMetadata } from '@/components/seo-head';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Terms of Service',
  description: 'CareerBox Terms of Service - Legal terms and conditions for using our career development platform.',
  keywords: ['terms of service', 'legal', 'user agreement', 'platform terms'],
  canonicalUrl: '/terms'
});

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: January 15, 2024</p>
          </div>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                Welcome to CareerBox ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our career development platform, website, and services (collectively, the "Service") operated by CareerBox.
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p>
                CareerBox is a comprehensive career development platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personalized career guidance and counselling services</li>
                <li>Skills assessment and development programs</li>
                <li>Professional networking opportunities</li>
                <li>Educational partnerships and placement services</li>
                <li>Business talent acquisition solutions</li>
                <li>Career-related content, resources, and tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Account and Registration</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Account Creation</h3>
              <p>
                To access certain features of our Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Age Requirements</h3>
              <p>
                You must be at least 13 years old to use our Service. If you are between 13 and 18 years old, you may only use the Service with parental or guardian consent.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.3 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Transmit harmful, threatening, or offensive content</li>
                <li>Engage in fraudulent or misleading activities</li>
                <li>Interfere with the security or functionality of the Service</li>
                <li>Create multiple accounts to circumvent restrictions</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User-Generated Content</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">5.1 Content Ownership</h3>
              <p>
                You retain ownership of any content you submit, post, or display through the Service ("User Content"). However, you grant us a worldwide, non-exclusive, royalty-free license to use, modify, publicly display, and distribute your User Content in connection with the Service.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">5.2 Content Standards</h3>
              <p>
                All User Content must comply with our community guidelines and not contain material that is unlawful, defamatory, or violates third-party rights. We reserve the right to remove any User Content that violates these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.1 Platform Content</h3>
              <p>
                The Service and its original content, features, and functionality are owned by CareerBox and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">6.2 Restrictions</h3>
              <p>
                You may not reproduce, distribute, modify, or create derivative works of our content without explicit written permission. Educational and personal use of publicly available content is permitted within fair use guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use the Service. By using the Service, you consent to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Payment Terms</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">8.1 Paid Services</h3>
              <p>
                Some features of our Service may require payment. You agree to pay all fees associated with your use of paid services. All fees are non-refundable except as required by law or as specified in our refund policy.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">8.2 Subscription Services</h3>
              <p>
                Subscription services automatically renew unless cancelled. You may cancel your subscription at any time through your account settings. Cancellation will be effective at the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Availability and Modifications</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">9.1 Service Availability</h3>
              <p>
                We strive to maintain high availability of our Service but cannot guarantee uninterrupted access. We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">9.2 Service Modifications</h3>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice. We may also update these Terms periodically, and continued use constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CAREERBOX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
              <p>
                OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATING TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID TO US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disclaimers</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">11.1 Career Guidance</h3>
              <p>
                While we provide career guidance and counselling services, we cannot guarantee specific career outcomes or job placements. Our advice is for informational purposes and should be considered alongside other professional guidance.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">11.2 Service Disclaimer</h3>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Account Termination</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">12.1 Termination by User</h3>
              <p>
                You may terminate your account at any time by contacting us or using the account deletion feature in your settings. Upon termination, your right to use the Service will cease immediately.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">12.2 Termination by CareerBox</h3>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">13.1 Informal Resolution</h3>
              <p>
                Before initiating formal dispute resolution, you agree to attempt to resolve any disputes informally by contacting us at info@careerbox.in with a detailed description of the dispute.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">13.2 Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts of Gujarat, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. International Users</h2>
              <p>
                Our Service is operated from India. If you are accessing the Service from outside India, you are responsible for compliance with local laws and regulations. We make no representation that the Service is appropriate or available for use outside India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p><strong>Email:</strong> info@careerbox.com</p>
                <p><strong>Phone:</strong> +91 9909675185</p>
                <p><strong>Address:</strong> 53, World Business House, Nr. Parimal Garden, Ahmedabad Gujarat India</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Miscellaneous</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">16.1 Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue to be valid and enforceable.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">16.2 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy and any additional terms applicable to specific services, constitute the entire agreement between you and CareerBox regarding the use of the Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}