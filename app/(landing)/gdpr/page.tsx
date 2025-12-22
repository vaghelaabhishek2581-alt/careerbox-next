import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo-head';
import Footer from '@/components/footer';

export const metadata: Metadata = generateSEOMetadata({
  title: 'GDPR Compliance',
  description: 'CareerBox GDPR Compliance - Information about your rights under the General Data Protection Regulation.',
  keywords: ['GDPR', 'data protection', 'EU rights', 'privacy'],
  canonicalUrl: '/gdpr'
});

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto prose prose-lg prose-slate prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">GDPR Compliance</h1>
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
              Last updated: January 15, 2024
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                Overview
              </h2>
              <p className="leading-relaxed">
                The General Data Protection Regulation (GDPR) is a comprehensive data protection law that regulates the use of personal data of EU residents. CareerBox is committed to full compliance with the GDPR and ensuring the protection of our users' rights.
              </p>
              <p className="leading-relaxed">
                We act as both a Data Controller (for our direct users) and a Data Processor (for our business and institutional partners) depending on the context of data usage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                Your Rights Under GDPR
              </h2>
              <p>If you are a resident of the European Economic Area (EEA), you have the following rights:</p>
              
              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Right to Access</h3>
                  <p className="text-sm">You have the right to request copies of your personal data.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Right to Rectification</h3>
                  <p className="text-sm">You have the right to request that we correct any information you believe is inaccurate.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Right to Erasure</h3>
                  <p className="text-sm">You have the right to request that we erase your personal data, under certain conditions ("Right to be Forgotten").</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Right to Restrict Processing</h3>
                  <p className="text-sm">You have the right to request that we restrict the processing of your personal data.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Right to Object</h3>
                  <p className="text-sm">You have the right to object to our processing of your personal data.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Right to Data Portability</h3>
                  <p className="text-sm">You have the right to request that we transfer your data to another organization or directly to you.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                Legal Basis for Processing
              </h2>
              <p>We process your personal data under the following legal bases:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Consent:</strong> You have given clear consent for us to process your personal data for a specific purpose.</li>
                <li><strong>Contract:</strong> Processing is necessary for a contract we have with you (e.g., providing our services).</li>
                <li><strong>Legal Obligation:</strong> Processing is necessary for us to comply with the law.</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests or the legitimate interests of a third party.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
                Data Transfers
              </h2>
              <p>
                CareerBox operates globally. If we transfer your personal data outside the EEA, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">5</span>
                Contact Our DPO
              </h2>
              <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                <p className="mb-4 text-blue-900">
                  If you have any questions about this GDPR policy or wish to exercise your rights, please contact our Data Protection Officer (DPO):
                </p>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Email:</strong> dpo@careerbox.in</p>
                  <p><strong>Address:</strong> CareerBox Data Protection Office,<br/>53, World Business House, Nr. Parimal Garden,<br/>Ahmedabad, Gujarat, India</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
