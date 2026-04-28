import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Astellic — partnerships@astellic.com",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-gold uppercase tracking-widest text-xs mb-3">
            Connect with Astellic
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Let&apos;s Start a Conversation
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            We work with governments, donors, and institutions across Africa. If
            you have a challenge at the intersection of evidence, policy, and
            delivery — reach out.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Reach Us</h2>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-brand-teal font-bold uppercase tracking-widest mb-1">
                  Email
                </p>
                <a
                  href="mailto:partnerships@astellic.com"
                  className="text-brand-navy font-medium hover:text-brand-teal transition-colors"
                >
                  partnerships@astellic.com
                </a>
              </div>

              <div>
                <p className="text-xs text-brand-teal font-bold uppercase tracking-widest mb-1">
                  Website
                </p>
                <p className="text-brand-muted">www.astellic.com</p>
              </div>

              <div>
                <p className="text-xs text-brand-teal font-bold uppercase tracking-widest mb-1">
                  Base
                </p>
                <p className="text-brand-muted">Malawi / Pan-African</p>
              </div>
            </div>

            <div className="mt-10 bg-brand-light rounded-xl p-6">
              <h3 className="font-semibold mb-2">Who We Work With</h3>
              <ul className="text-brand-muted text-sm space-y-1">
                <li>→ National governments and public institutions</li>
                <li>→ Bilateral and multilateral donors</li>
                <li>→ International development organisations</li>
                <li>→ Civil society and research institutions</li>
              </ul>
            </div>
          </div>

          {/* Simple contact form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <form
              action="mailto:partnerships@astellic.com"
              method="POST"
              encType="text/plain"
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="you@organisation.org"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="organisation"
                >
                  Organisation
                </label>
                <input
                  id="organisation"
                  name="organisation"
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  placeholder="Your organisation"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"
                  placeholder="Tell us about your priorities and how we might support you..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
