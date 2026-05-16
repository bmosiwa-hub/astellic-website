import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research Projects",
  description:
    "Astellic's applied research, evaluations, and evidence-generation projects across health, governance, education, and climate.",
};

interface Project {
  title: string;
  area: string;
  client: string;
  location: string;
  status: "Ongoing" | "Completed";
  description: string;
}

const projects: Project[] = [];

const statusColors: Record<Project["status"], string> = {
  Ongoing: "bg-brand-gold/10 text-brand-gold",
  Completed: "bg-gray-100 text-gray-500",
};

export default function ResearchProjectsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Research and evidence generation"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <Link href="/our-projects" className="inline-flex items-center gap-2 text-brand-gold text-base mb-6 hover:gap-3 transition-all">
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            All Projects
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Research Projects
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Evidence generation, applied research, evaluations, and analytical
            work that inform policy and programming across our thematic areas.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {projects.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center">
            <p className="text-brand-muted text-lg">
              Research project profiles are being compiled. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                    <h2 className="text-xl font-bold text-brand-navy">{project.title}</h2>
                  </div>
                  <div className="shrink-0 md:text-right">
                    <p className="text-base font-semibold text-brand-gold">{project.area}</p>
                    <p className="text-base text-brand-muted">{project.location}</p>
                  </div>
                </div>
                <p className="text-brand-muted text-base leading-relaxed mb-3">{project.description}</p>
                <p className="text-base text-brand-muted">
                  <span className="font-semibold text-brand-navy">Client:</span> {project.client}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
