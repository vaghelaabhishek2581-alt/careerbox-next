import { Metadata } from 'next';
import PageLayout from '@/components/page-layout';
import { generateSEOMetadata } from '@/components/seo-head';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy Policy',
  description: 'CareerBox Privacy Policy - How we collect, use, and protect your personal information.',
  keywords: ['privacy policy', 'data protection', 'personal information', 'GDPR'],
  canonicalUrl: '/privacy'
});

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: January 15, 2024</p>
          </div>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                At CareerBox ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our career development platform and services (collectively, the "Service").
              </p>
              <p>
                By using our Service, you consent to the data practices described in this policy. Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1 Personal Information You Provide</h3>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                <li><strong>Profile Information:</strong> Professional background, education, skills, career goals, resume/CV data</li>
                <li><strong>Career Counselling Data:</strong> Course interests, educational level, career preferences</li>
                <li><strong>Communication Data:</strong> Messages, feedback, and other communications with us</li>
                <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely by third-party providers)</li>
                <li><strong>Survey and Form Data:</strong> Responses to questionnaires, assessments, and feedback forms</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">2.2 Information Automatically Collected</h3>
              <p>When you use our Service, we automatically collect certain information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, clicks, navigation patterns</li>
                <li><strong>Location Data:</strong> General location information based on IP address</li>
                <li><strong>Log Data:</strong> Server logs, error reports, performance data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">2.3 Information from Third Parties</h3>
              <p>We may receive information about you from:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Educational institutions and partner organizations</li>
                <li>Employers and business partners (with appropriate consents)</li>
                <li>Social media platforms (when you choose to connect your accounts)</li>
                <li>Analytics and marketing service providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Service Provision</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide personalized career guidance and counselling services</li>
                <li>Create and maintain your user account and profile</li>
                <li>Facilitate skills assessments and career matching</li>
                <li>Connect you with relevant opportunities and resources</li>
                <li>Process payments and manage subscriptions</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Communication</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send service-related notifications and updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send newsletters and promotional content (with your consent)</li>
                <li>Conduct surveys and collect feedback</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.3 Platform Improvement</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Analyze usage patterns to improve our services</li>
                <li>Conduct research and development</li>
                <li>Personalize your experience and content recommendations</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.4 Legal and Business Purposes</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with legal obligations and enforce our Terms of Service</li>
                <li>Protect our rights and the safety of our users</li>
                <li>Support business operations and strategic planning</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 With Your Consent</h3>
              <p>
                We may share your information with third parties when you provide explicit consent, such as when connecting with potential employers or educational institutions through our platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2 Service Providers</h3>
              <p>We share information with trusted service providers who assist us with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloud hosting and data storage</li>
                <li>Payment processing and billing</li>
                <li>Email marketing and communication services</li>
                <li>Analytics and performance monitoring</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.3 Business Partners</h3>
              <p>
                With appropriate consents, we may share relevant information with educational institutions, employers, and other business partners to facilitate career opportunities and services.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.4 Legal Requirements</h3>
              <p>We may disclose information when required by law or to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with legal process, court orders, or government requests</li>
                <li>Enforce our Terms of Service or other agreements</li>
                <li>Protect the rights, property, or safety of CareerBox, our users, or others</li>
                <li>Investigate and prevent fraud, security issues, or illegal activities</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">4.5 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity as part of the transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. Specific retention periods include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Until account deletion or as required for legal compliance</li>
                <li><strong>Career Counselling Records:</strong> 7 years or as required by professional standards</li>
                <li><strong>Usage and Analytics Data:</strong> Up to 3 years for service improvement purposes</li>
                <li><strong>Communication Records:</strong> 3-5 years or as required for legal compliance</li>
                <li><strong>Financial Records:</strong> As required by applicable tax and financial regulations</li>
              </ul>
              <p>
                When we no longer need your information, we will securely delete or anonymize it in accordance with our data retention policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our security measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Access controls and authentication protocols</li>
                <li>Employee training on data protection and security practices</li>
                <li>Secure hosting infrastructure with redundant backups</li>
                <li>Incident response procedures for security breaches</li>
              </ul>
              <p>
                While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but continuously work to improve our protective measures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.1 Access and Portability</h3>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information we hold about you</li>
                <li>Receive a copy of your data in a portable format</li>
                <li>Request information about how we process your data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.2 Correction and Updates</h3>
              <p>You can:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Update your profile information through your account settings</li>
                <li>Request correction of inaccurate or incomplete information</li>
                <li>Contact us to update information you cannot modify yourself</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.3 Deletion</h3>
              <p>You may request deletion of your personal information, subject to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Legal obligations that require us to retain certain data</li>
                <li>Legitimate business interests in maintaining records</li>
                <li>Ongoing service provision requirements</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.4 Objection and Restriction</h3>
              <p>You can:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Opt out of marketing communications at any time</li>
                <li>Object to processing based on legitimate interests</li>
                <li>Request restriction of processing in certain circumstances</li>
              </ul>

              <p className="mt-4">
                To exercise these rights, please contact us at privacy@careerbox.com or through your account settings where available.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">8.1 Types of Cookies We Use</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand how you use our service</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising and personalization</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">8.2 Third-Party Tracking</h3>
              <p>We may use third-party analytics and advertising services, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google Analytics for website performance analysis</li>
                <li>Social media pixels for advertising optimization</li>
                <li>Customer support tools with tracking capabilities</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">8.3 Cookie Control</h3>
              <p>
                You can control cookies through your browser settings or our cookie preferences center. Please note that disabling certain cookies may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Adequacy decisions by relevant data protection authorities</li>
                <li>Standard contractual clauses approved by data protection authorities</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Binding corporate rules for intracompany transfers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p>
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
              </p>
              <p>
                For users between 13 and 18 years of age, we encourage parental guidance and may require parental consent for certain activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Links and Services</h2>
              <p>
                Our Service may contain links to third-party websites, applications, or services that are not operated by us. This Privacy Policy does not apply to third-party services, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal requirements. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting the updated policy on our website with a new effective date</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p>
                Your continued use of the Service after the effective date of the updated policy constitutes acceptance of the changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Regulatory Compliance</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">13.1 GDPR Compliance</h3>
              <p>
                For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR) and provide additional rights as required by EU law.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">13.2 CCPA Compliance</h3>
              <p>
                For users in California, we comply with the California Consumer Privacy Act (CCPA) and provide specific rights regarding the collection and use of personal information.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">13.3 Indian Data Protection</h3>
              <p>
                We comply with applicable Indian data protection laws and regulations, including the Information Technology Act, 2000 and associated rules.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Privacy Officer</h3>
                <p><strong>Email:</strong> privacy@careerbox.com</p>
                <p><strong>General Contact:</strong> info@careerbox.com</p>
                <p><strong>Phone:</strong> +91 79 1234 5678</p>
                <p><strong>Address:</strong> Corporate House, Off SG Road, Ahmedabad, Gujarat 380015, India</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Data Protection Officer</h3>
                <p className="text-blue-700">
                  For GDPR-related inquiries and requests from EEA residents, please contact our Data Protection Officer at dpo@careerbox.com
                </p>
              </div>
            </section>

            <section className="border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500 italic">
                This Privacy Policy is effective as of January 15, 2024. We are committed to protecting your privacy and will continue to review and update our practices to ensure the highest standards of data protection.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}