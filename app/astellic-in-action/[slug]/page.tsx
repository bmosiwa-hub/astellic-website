import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal, FadeUp } from "@/components/Reveal";
import { STORIES, getStory, ACCENT_CLASSES } from "@/lib/stories";

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return { title: "Story not found | Astellic" };
  return {
    title: `${story.title} | Astellic in Action`,
    description: story.subtitle,
  };
}

function Section({
  label,
  children,
  accentText,
}: {
  label: string;
  children: React.ReactNode;
  accentText: string;
}) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-10 border-t border-gray-100">
      <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 ${accentText}`}>{label}</p>
      {children}
    </section>
  );
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const a = ACCENT_CLASSES[story.accent];
  const related = STORIES.filter(
    (s) => s.portfolio === story.portfolio && s.slug !== story.slug,
  ).slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <Link
              href="/astellic-in-action"
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
            >
              ← Astellic in Action
            </Link>
            <div className="flex items-center gap-2 mb-5">
              <span className={`w-2 h-2 rounded-full ${a.dot}`} />
              <span className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em]">
                {story.portfolio}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] mb-6">{story.title}</h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">{story.subtitle}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {story.geography.map((g) => (
                <span
                  key={g}
                  className="text-xs text-gray-200 bg-white/10 border border-white/10 px-3 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-400 border-t border-white/10 pt-5">
              <span className="text-gray-300 font-semibold">{story.angle}</span>
              <br />
              {story.attribution}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Body */}
      <div className="bg-white">
        <Section label="The problem" accentText={a.text}>
          <p className="text-brand-navy text-xl leading-relaxed font-medium">{story.problem}</p>
        </Section>

        <Section label="Why it was hard" accentText={a.text}>
          <p className="text-brand-muted text-lg leading-relaxed">{story.complexity}</p>
        </Section>

        <Section label="The approach" accentText={a.text}>
          <ul className="space-y-4">
            {story.approach.map((step, i) => (
              <Reveal key={i} variant="up" delay={i * 60}>
                <li className="flex gap-4">
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full ${a.bg} text-white text-sm font-bold flex items-center justify-center`}
                  >
                    {i + 1}
                  </span>
                  <p className="text-brand-navy/90 text-base leading-relaxed pt-0.5">{step}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </Section>

        <Section label="What was created" accentText={a.text}>
          <div className="grid sm:grid-cols-2 gap-3">
            {story.created.map((c) => (
              <div
                key={c}
                className="flex items-start gap-3 bg-brand-light rounded-xl px-4 py-3 border border-gray-100"
              >
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${a.dot} shrink-0`} />
                <p className="text-brand-navy text-sm leading-snug font-medium">{c}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section label="What changed" accentText={a.text}>
          <p className="text-brand-muted text-lg leading-relaxed">{story.changed}</p>
        </Section>

        <Section label="Frameworks & methods" accentText={a.text}>
          <div className="flex flex-wrap gap-2">
            {story.frameworks.map((f) => (
              <span
                key={f}
                className={`text-sm text-brand-navy bg-white border ${a.border}/30 border-opacity-30 px-3 py-1.5 rounded-lg`}
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                {f}
              </span>
            ))}
          </div>
        </Section>

        <Section label="What this demonstrates" accentText={a.text}>
          <div className="flex flex-wrap gap-2">
            {story.capabilities.map((c) => (
              <span
                key={c}
                className={`text-sm font-semibold text-white ${a.bg} px-3 py-1.5 rounded-lg`}
              >
                {c}
              </span>
            ))}
          </div>
        </Section>
      </div>

      {/* CTA */}
      <section className="bg-brand-light py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy leading-tight mb-6">
              {story.cta}
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-4 rounded text-base transition-all duration-200 hover:scale-[1.02]"
            >
              Discuss a challenge
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-white py-16 px-6 border-t border-gray-100">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted mb-6">
              More in {story.portfolio}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((s) => {
                const ra = ACCENT_CLASSES[s.accent];
                return (
                  <Link
                    key={s.slug}
                    href={`/astellic-in-action/${s.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lift"
                  >
                    <div className={`h-1.5 ${ra.bg}`} />
                    <div className="p-6">
                      <h3 className="font-bold text-brand-navy text-lg leading-snug group-hover:text-brand-teal transition-colors mb-2">
                        {s.title}
                      </h3>
                      <p className="text-brand-muted text-sm leading-relaxed">{s.subtitle}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
