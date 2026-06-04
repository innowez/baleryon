import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";

export default function TermsAndConditionsPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="pt-[calc(2.5rem+4rem)] pb-36 md:pb-16">
        <div className="container-content">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0F0F0F] mb-2">
              Terms and Conditions
            </h1>
            <p className="text-[#6B7280]">Last updated: May 2026</p>
          </div>

          {/* Content */}
          <div className="max-w-3xl space-y-8 text-[#333333] leading-relaxed">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing and using the Baleryon website and mobile application, you accept and
                agree to be bound by the terms and provision of this agreement. If you do not agree
                to abide by the above, please do not use this service.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                2. Use License
              </h2>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of the materials (information
                or software) on Baleryon's website for personal, non-commercial transitory viewing
                only. This is the grant of a license, not a transfer of title, and under this license
                you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on the website</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                3. Disclaimer
              </h2>
              <p>
                The materials on Baleryon's website are provided on an 'as is' basis. Baleryon makes
                no warranties, expressed or implied, and hereby disclaims and negates all other
                warranties including, without limitation, implied warranties or conditions of
                merchantability, fitness for a particular purpose, or non-infringement of intellectual
                property or other violation of rights.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                4. Limitations
              </h2>
              <p>
                In no event shall Baleryon or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business
                interruption) arising out of the use or inability to use the materials on
                Baleryon's website, even if Baleryon or an authorized representative has been
                notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                5. Accuracy of Materials
              </h2>
              <p>
                The materials appearing on Baleryon's website could include technical, typographical,
                or photographic errors. Baleryon does not warrant that any of the materials on the
                website are accurate, complete, or current. Baleryon may make changes to the
                materials contained on its website at any time without notice.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                6. Links
              </h2>
              <p>
                Baleryon has not reviewed all of the sites linked to its website and is not
                responsible for the contents of any such linked site. The inclusion of any link
                does not imply endorsement by Baleryon of the site. Use of any such linked website
                is at the user's own risk.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                7. Modifications
              </h2>
              <p>
                Baleryon may revise these terms of service for its website at any time without
                notice. By using this website, you are agreeing to be bound by the then current
                version of these terms of service.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                8. Governing Law
              </h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws
                of India, and you irrevocably submit to the exclusive jurisdiction of the courts
                located in India.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                9. Product Information
              </h2>
              <p className="mb-4">
                We strive to provide accurate descriptions and pricing for all products. However,
                we do not warrant that product descriptions, pricing, or other content is accurate,
                complete, reliable, current, or error-free. If a product offered by Baleryon is
                not as described, your sole remedy is to return it unused.
              </p>
              <p>
                All prices are subject to change without notice. We reserve the right to limit or
                discontinue any product at any time.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                10. User Accounts
              </h2>
              <p>
                If you create an account on our website, you are responsible for maintaining the
                confidentiality of your account information and password. You agree to accept
                responsibility for all activities that occur under your account. You must notify
                Baleryon immediately of any unauthorized use of your account.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                11. Returns and Refunds
              </h2>
              <p>
                Please refer to our Returns & Refunds policy for information regarding product
                returns, refunds, and exchanges. All return requests must be made within 7 days of
                delivery. Products must be in original condition with all tags and packaging intact.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                12. Shipping and Delivery
              </h2>
              <p>
                Baleryon ships to addresses across India. Delivery timeframes are estimates and
                not guaranteed. Baleryon is not liable for delays caused by third-party shipping
                providers, weather conditions, or other circumstances beyond our control.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-4">
                13. Contact Us
              </h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-[#F5F5F5] rounded-lg">
                <p className="font-semibold">Baleryon</p>
                <p>Email: support@baleryon.com</p>
                <p>Phone: +91 XXXX-XXXX-XX</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
