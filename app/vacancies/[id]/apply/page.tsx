import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApplyForm from "./ApplyForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const posting = await prisma.jobPosting.findUnique({ where: { id }, select: { title: true } });
  return { title: posting ? `Apply — ${posting.title} | Astellic` : "Apply | Astellic" };
}

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const posting = await prisma.jobPosting.findUnique({
    where: { id },
    select: {
      id: true, title: true, department: true, contractType: true, location: true,
      description: true, deadline: true, mandatoryConditions: true, requiredDocuments: true,
      status: true, isPublishedToWebsite: true,
    },
  });

  if (!posting || posting.status !== "OPEN" || !posting.isPublishedToWebsite) notFound();

  const isClosed = posting.deadline !== null && posting.deadline < new Date();

  return (
    <>
      <section className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <a href="/vacancies" className="text-gray-400 hover:text-white text-sm mb-4 inline-block">← All Vacancies</a>
          <h1 className="text-3xl font-bold mb-2">{posting.title}</h1>
          <p className="text-gray-300 text-sm">
            {posting.department && `${posting.department} · `}
            {posting.contractType.replace(/_/g, " ")}
            {posting.location && ` · ${posting.location}`}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {isClosed ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-navy mb-3">Applications Closed</h2>
            <p className="text-brand-muted max-w-md mx-auto leading-relaxed mb-8">
              The application window for <strong>{posting.title}</strong> has passed.
              Check our vacancies page for other open positions.
            </p>
            <a href="/vacancies" className="text-brand-navy font-semibold text-sm hover:underline">← All Vacancies</a>
          </div>
        ) : (
          <ApplyForm
            postingId={posting.id}
            postingTitle={posting.title}
            mandatoryConditions={posting.mandatoryConditions}
            requiredDocuments={posting.requiredDocuments}
          />
        )}
      </div>
    </>
  );
}
