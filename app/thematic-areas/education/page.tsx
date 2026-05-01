import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Education & Social Services",
  description:
    "Astellic's work in education and social services — enhancing delivery systems for education, skills development, and social protection to improve equity and human capital outcomes.",
};

const focusAreas = [
  {
    title: "Education Systems Strengthening",
    desc: "Supporting the design and implementation of education reforms that improve access, quality, and equity — spanning early childhood development, basic education, and secondary and tertiary systems.",
  },
  {
    title: "Skills Development & TVET",
    desc: "Strengthening technical and vocational education and training (TVET) systems to improve relevance, quality, and labour market linkages — with a focus on youth employment and productivity.",
  },
  {
    title: "Social Protection Systems",
    desc: "Advising on the design, targeting, financing, and delivery of social protection programmes — including cash transfers, public works, and social insurance — to reduce poverty and vulnerability.",
  },
  {
    title: "Education Data & Learning Outcomes",
    desc: "Strengthening education management information systems and supporting the use of learning assessment data to drive improvements in teaching quality and student outcomes.",
  },
  {
    title: "Inclusive Education & Gender Equity",
    desc: "Integrating gender-responsive and inclusive approaches into education and social services programmes to reduce disparities and improve outcomes for marginalised groups.",
  },
];

export default function EducationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/thematic-education.jpg"
          alt="African students learning"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <Link href="/thematic-areas" className="inline-flex items-center gap-2 text-brand-gold text-base mb-6 hover:gap-3 transition-all">
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            All Thematic Areas
          </Link>
          <p className="text-brand-gold text-base font-semibold uppercase tracking-widest mb-3">Thematic Area 04</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Education &amp; Social Services
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Enhancing delivery systems for education, skills development, and
            social protection to improve equity and human capital outcomes.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <p className="text-brand-muted text-lg leading-relaxed mb-5">
          Investments in education and social services are among the most
          powerful drivers of human capital development and long-term economic
          growth. Yet across much of Africa, significant gaps remain between
          policy intent and the quality of services that reach children, young
          people, and vulnerable communities.
        </p>
        <p className="text-brand-muted text-lg leading-relaxed">
          Astellic works with governments, development partners, and civil society
          to strengthen the systems, institutions, and delivery mechanisms that
          make education and social services effective, equitable, and
          sustainable. We bring analytical rigour, sector expertise, and a
          commitment to practical implementation to every engagement.
        </p>
      </section>

      {/* Focus Areas */}
      <section className="bg-brand-light py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-10">Our Focus Areas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {focusAreas.map((area) => (
              <div key={area.title} className="bg-white rounded-xl p-7 border border-gray-100 shadow-sm">
                <div className="w-1 h-6 bg-brand-navy rounded mb-4" />
                <h3 className="text-lg font-bold text-brand-navy mb-2">{area.title}</h3>
                <p className="text-brand-muted text-base leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Work with us on Education &amp; Social Services</h2>
          <p className="text-brand-muted text-lg mb-8 leading-relaxed">
            Astellic partners with governments and donors to design and deliver
            education and social protection programmes that achieve lasting
            improvements in human capital and equity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-3 rounded font-medium text-lg transition-colors">
              Get in Touch
            </Link>
            <Link href="/thematic-areas" className="border border-brand-navy text-brand-navy hover:bg-brand-light px-8 py-3 rounded font-medium text-lg transition-colors">
              All Thematic Areas
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
