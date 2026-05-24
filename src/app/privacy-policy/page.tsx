import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

export default function PrivacyPolicyPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="pt-[calc(2.5rem+4rem)] pb-36 md:pb-16">
        <div className="container-content">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-2">
              Privacy Policy
            </h1>
            <p className="text-[#6B7280]">Last updated: May 2026</p>
          </div>

          {/* Content */}
          <div className="max-w-3xl space-y-8 text-[#333333] leading-relaxed">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                1. Introduction
              </h2>
              <p>
                Baleryon ("we," "us," "our," or "Company") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you visit our website and use our mobile application, including any
                other media form, media channel, mobile website, or mobile application relating or
                connected thereto.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#0F0F0F] mb-2">Personal Information</h3>
                  <p>
                    When you visit our website or place an order, we collect personal information
                    such as your name, email address, phone number, shipping address, billing
                    address, and payment information.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F0F0F] mb-2">Browsing Information</h3>
                  <p>
                    We automatically collect certain information about your device and how you
                    interact with our website, including IP address, browser type, operating system,
                    pages visited, and time spent on pages.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F0F0F] mb-2">Cookies and Tracking</h3>
                  <p>
                    We use cookies and similar tracking technologies to enhance your browsing
                    experience, analyze website traffic, and personalize content.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                3. How We Use Your Information
              </h2>
              <p className="mb-3">We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Processing and fulfilling your orders</li>
                <li>Sending you order confirmations and delivery updates</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Improving our website and user experience</li>
                <li>Personalizing content and recommendations</li>
                <li>Sending promotional emails and marketing communications (with your consent)</li>
                <li>Detecting and preventing fraudulent transactions</li>
                <li>Complying with legal and regulatory requirements</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                4. How We Share Your Information
              </h2>
              <p className="mb-3">We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Service Providers:</strong> Shipping companies, payment processors, and
                  customer service platforms that assist us in operating our website and conducting
                  our business
                </li>
                <li>
                  <strong>Legal Requirements:</strong> Law enforcement or government agencies if
                  required by law or in response to legal processes
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger, acquisition, or
                  bankruptcy, your information may be transferred as part of that transaction
                </li>
              </ul>
              <p className="mt-3">
                We do not sell, trade, or rent your personal information to third parties for
                marketing purposes.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                5. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to protect your
                personal information against unauthorized access, alteration, disclosure, or
                destruction. However, no method of transmission over the internet is 100% secure,
                and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                6. Your Rights and Choices
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>Access:</strong> You have the right to access and review your personal
                  information. You can do so by logging into your account or contacting us.
                </p>
                <p>
                  <strong>Correction:</strong> You can update or correct your personal information
                  through your account settings.
                </p>
                <p>
                  <strong>Deletion:</strong> You may request deletion of your personal information,
                  subject to certain legal and operational exceptions.
                </p>
                <p>
                  <strong>Marketing Communications:</strong> You can opt out of promotional emails
                  by clicking the "Unsubscribe" link in any email we send or by contacting us
                  directly.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <p>
                Cookies are small files stored on your device that help us remember your preferences
                and understand how you use our website. You can control cookie settings through your
                browser. However, disabling cookies may limit your ability to use certain features
                of our website.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                8. Third-Party Links
              </h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for
                the privacy practices of external websites. We encourage you to review the privacy
                policies of any third-party sites before providing your personal information.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                9. Children's Privacy
              </h2>
              <p>
                Our website is not directed to children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If we become aware that we have
                collected information from a child under 13, we will delete such information
                immediately.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                10. International Data Transfers
              </h2>
              <p>
                Your information may be transferred to, and maintained in, computers located outside
                of your state, province, country or other governmental jurisdiction where data
                protection laws may differ. Your consent to this Privacy Policy followed by your
                submission of such information represents your agreement to any such transfer.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                11. Retention of Information
              </h2>
              <p>
                We retain your personal information for as long as necessary to provide our services
                and fulfill the purposes outlined in this Privacy Policy. You may request deletion of
                your information at any time, subject to legal retention requirements.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                12. Updates to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our
                practices, technology, legal requirements, or other factors. We will notify you of
                any material changes by posting the updated policy on our website and updating the
                "Last Updated" date.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                13. Contact Us
              </h2>
              <p className="mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us at:
              </p>
              <div className="p-4 bg-[#F5F5F5] rounded-lg">
                <p className="font-semibold">Baleryon</p>
                <p>Email: privacy@baleryon.com</p>
                <p>Phone: +91 XXXX-XXXX-XX</p>
                <p className="mt-2 text-sm text-[#6B7280]">
                  We will respond to your inquiries within 30 days.
                </p>
              </div>
            </section>

            {/* Data Protection Notice */}
            <section className="bg-[#FFF9E6] border border-[#FFE5B4] rounded-lg p-6 mt-8">
              <h2 className="text-lg font-bold text-[#0F0F0F] mb-3">
                Data Protection Notice
              </h2>
              <p className="text-sm">
                In accordance with Indian data protection regulations, Baleryon is committed to
                safeguarding your personal information. If you believe your data has been misused or
                if you have concerns about our data handling practices, you have the right to lodge a
                complaint with the appropriate data protection authority.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
