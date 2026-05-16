import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, FadeUp, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Vision & Mission",
  description:
    "Astellic's vision, mission, and the gap we were established to address.",
};

export default function VisionMissionPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-thematic.jpg"
          alt="Astellic vision and mission"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Vision &amp; Mission
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            The purpose that drives everything Astellic does, and the gap we
            were established to address.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-brand-light py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <ScaleIn>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-10 h-1 bg-brand-gold mb-4 rounded" />
            <h2 className="text-xl font-bold mb-3">Vision</h2>
            <p className="text-brand-muted text-lg leading-relaxed">
              A world where systems consistently translate evidence into
              equitable, sustainable, and measurable outcomes.
            </p>
          </div>
          </ScaleIn>
          <ScaleIn delay={120}>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="w-10 h-1 bg-brand-gold mb-4 rounded" />
            <h2 className="text-xl font-bold mb-3">Mission</h2>
            <p className="text-brand-muted text-lg leading-relaxed">
              To make policy implementable by integrating evidence, institutional
              realities, and delivery systems into practice.
            </p>
          </div>
          </ScaleIn>
        </div>
      </section>

      {/* The Gap We Address */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-6">The Gap We Address</h2>
          </FadeUp>
          <div className="border-l-4 border-brand-teal pl-6 space-y-8">
            <Reveal variant="up" delay={0}>
            <div>
              <h3 className="text-lg font-semibold mb-2">Not a scarcity of strategy</h3>
              <p className="text-brand-muted text-lg leading-relaxed">
                The development sector is not short of evidence, strategies,
                funding, or technical expertise. What is consistently scarce is
                the ability to translate them into results at scale.
              </p>
            </div>
            </Reveal>
            <Reveal variant="up" delay={80}>
            <div>
              <h3 className="text-lg font-semibold mb-2">A failure to convert it into results</h3>
              <p className="text-brand-muted text-lg leading-relaxed">
                This is not a technical failure; it is a systems failure.
                Astellic was created to fill that gap through honest analysis,
                technically sound advice, and delivery aligned with clients&apos;
                genuine interests.
              </p>
            </div>
            </Reveal>
            <Reveal variant="up" delay={160}>
            <div>
              <h3 className="text-lg font-semibold mb-2">The Astellic Premise</h3>
              <p className="text-brand-muted text-lg leading-relaxed">
                The implementation gap is not a technical problem. It is a
                systems problem. We address it as one.
              </p>
            </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
