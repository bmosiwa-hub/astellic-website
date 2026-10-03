import Link from "next/link";
import Image from "next/image";
import { Reveal, FadeUp } from "@/components/Reveal";
import { STORIES, ACCENT_CLASSES, storyImage, type Portfolio } from "@/lib/stories";

/**
 * Proof section for a "What We Do" pillar page: surfaces the three stories for
 * that pillar as cards linking into Astellic in Action. All stories are the
 * founder's own experience, labelled as such on each card.
 */
export default function PillarStories({
  portfolio,
  heading = "Selected work",
}: {
  portfolio: Portfolio;
  heading?: string;
}) {
  const stories = STORIES.filter((s) => s.portfolio === portfolio);
  if (stories.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-10">
            <div>
              <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">
                {heading}
              </p>
              <h2 className="text-3xl font-bold text-brand-navy mb-3">
                The proof, not the promise.
              </h2>
              <p className="text-brand-muted text-lg max-w-xl leading-relaxed">
                Real {portfolio.toLowerCase()} work from across African development systems — drawn from
                the founder&rsquo;s experience and labelled honestly.
              </p>
            </div>
            <Link
              href="/astellic-in-action"
              className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy font-semibold px-5 py-2.5 rounded hover:bg-brand-navy hover:text-white transition-colors text-sm whitespace-nowrap"
            >
              All stories
            </Link>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((s, i) => {
            const a = ACCENT_CLASSES[s.accent];
            return (
              <Reveal key={s.slug} variant="up" delay={i * 90}>
                <Link
                  href={`/astellic-in-action/${s.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full lift"
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    <Image
                      src={storyImage(s.slug)}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-brand-navy/25" />
                  </div>
                  <div className={`h-1.5 ${a.bg}`} />
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <h3 className="font-bold text-brand-navy text-lg leading-snug group-hover:text-brand-teal transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-brand-muted text-sm leading-relaxed flex-1">{s.subtitle}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.geography.slice(0, 3).map((g) => (
                        <span key={g} className="text-[11px] text-brand-navy/70 bg-brand-light px-2 py-0.5 rounded-full">
                          {g}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-brand-muted/80 border-t border-gray-100 pt-3">
                      {s.attribution}
                    </p>
                    <span className="inline-flex items-center gap-1 text-brand-gold font-semibold text-sm group-hover:gap-2 transition-all">
                      Read the story →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
