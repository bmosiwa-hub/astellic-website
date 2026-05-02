import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Astellic's privacy policy and cookie usage information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold text-brand-navy mb-2">Privacy Policy</h1>
      <p className="text-brand-muted text-base mb-12">Last updated: May 2026</p>

      <div className="space-y-10 text-brand-muted text-lg leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-3">1. Who We Are</h2>
          <p>
            Astellic is a research, advisory, and implementation firm operating
            across Africa. Our website is <strong>www.astellic.com</strong>. For
            privacy-related enquiries, contact us at{" "}
            <a href="mailto:admin@astellic.com" className="text-brand-gold hover:underline">
              admin@astellic.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-3">2. Information We Collect</h2>
          <p className="mb-3">
            We collect information in the following ways:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Contact forms:</strong> name, email address, and message
              content when you get in touch with us.
            </li>
            <li>
              <strong>Roster applications:</strong> name, email address, position
              applied for, and uploaded documents (CV, statement of interest,
              work samples or references).
            </li>
            <li>
              <strong>Partnership proposals:</strong> name, email address,
              organisation, proposal description, and any supporting documents.
            </li>
            <li>
              <strong>Analytics (with consent):</strong> anonymised usage data
              via Google Analytics, including pages visited, time on site, and
              approximate location (country/city level).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-3">3. Cookies</h2>
          <p className="mb-3">
            We use cookies only if you give your consent. The cookies we use are:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Google Analytics cookies</strong> (_ga, _gid, _gat): used
              to count and analyse visitors to our site. These are analytics
              cookies and are only set after you accept cookies.
            </li>
            <li>
              <strong>cookie-consent</strong>: a first-party cookie that stores
              your cookie preference so we do not ask again on return visits.
            </li>
          </ul>
          <p className="mt-3">
            You can withdraw your consent at any time by clearing your browser
            cookies and refreshing the page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-3">4. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To respond to enquiries submitted through our contact form.</li>
            <li>To process and assess roster applications and partnership proposals.</li>
            <li>To understand how visitors use our website and improve its content.</li>
          </ul>
          <p className="mt-3">
            We do not sell, rent, or share your personal data with third parties
            for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-3">5. Data Retention</h2>
          <p>
            Application documents and contact form submissions are retained for
            as long as necessary to assess and respond to them. Analytics data
            is retained in accordance with Google Analytics default settings
            (26 months).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-3">6. Your Rights</h2>
          <p>
            You have the right to access, correct, or request deletion of your
            personal data. To exercise these rights, contact us at{" "}
            <a href="mailto:admin@astellic.com" className="text-brand-gold hover:underline">
              admin@astellic.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-brand-navy mb-3">7. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The date at the top of
            this page will reflect the most recent revision.
          </p>
        </section>

      </div>
    </div>
  );
}
