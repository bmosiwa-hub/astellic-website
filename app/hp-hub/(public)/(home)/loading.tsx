/**
 * Instant feedback while the hub home page loads. Scoped to the (home) group
 * on purpose: a loading boundary makes Next.js stream the response, which
 * would stop pages that can be "not found" from returning a real 404 status.
 * The hub home never is.
 */
export default function HubHomeLoading() {
  return (
    <div role="status" aria-label="Loading the Health Policy Intelligence Hub">
      <section className="bg-brand-navy px-4 sm:px-6 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="max-w-3xl mx-auto flex flex-col items-center animate-pulse">
          <div className="h-10 w-full max-w-xl bg-white/15 rounded mb-4" />
          <div className="h-5 w-full max-w-lg bg-white/10 rounded mb-7" />
          <div className="h-14 w-full bg-white/15 rounded" />
          <div className="h-8 w-80 max-w-full bg-white/10 rounded-full mt-4" />
        </div>
      </section>
      <div className="px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-[4.5rem] rounded-lg bg-brand-light" />
          ))}
        </div>
      </div>
    </div>
  );
}
