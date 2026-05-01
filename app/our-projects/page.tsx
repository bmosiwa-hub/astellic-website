import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Projects",
  description:
    "Explore Astellic's current and past projects across health, governance, education, and climate.",
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

function EmptyState() {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl py-16 text-center">
      <p className="text-brand-muted text-lg">
        Project profiles are being compiled. Check back soon.
      </p>
    </div>
  );
}

const statusColors: Record<Project["status"], string> = {
  Ongoing: "bg-brand-teal/10 text-brand-teal",
  Completed: "bg-gray-100 text-gray-500",
};

export default function OurProjectsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-24 px-6 overflow-hidden">
        <Image
          src="/images/hero-approach.jpg"
          alt="Astellic projects in the field"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Our Projects
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Astellic delivers research, advisory, and implementation projects
            across Africa. Below is a selection of our current and completed
            engagements.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div
                key={project.title}
                className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <span
                      className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wide ${statusColors[project.status]}`}
                    >
                      {project.status}
                    </span>
                    <h2 className="text-xl font-bold text-brand-navy">
                      {project.title}
                    </h2>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-semibold text-brand-gold">
                      {project.area}
                    </p>
                    <p className="text-base text-brand-muted">{project.location}</p>
                  </div>
                </div>
                <p className="text-brand-muted text-base leading-relaxed mb-3">
                  {project.description}
                </p>
                <p className="text-base text-brand-muted">
                  <span className="font-semibold text-brand-navy">Client:</span>{" "}
                  {project.client}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
