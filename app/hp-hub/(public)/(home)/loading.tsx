/**
 * Instant feedback while the hub home page loads its live counts. Scoped to
 * the (home) group on purpose: a loading boundary makes Next.js stream the
 * response, which would stop pages that can be "not found" from returning a
 * real 404 status. The hub home never is.
 */
export default function HubHomeLoading() {
  return (
    <div role="status" aria-label="Loading the Health Policy Intelligence Hub">
      <section className="bg-brand-navy px-6 pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-4 w-64 bg-white/15 rounded mb-6" />
          <div className="h-12 w-full max-w-2xl bg-white/15 rounded mb-4" />
          <div className="h-5 w-full max-w-xl bg-white/10 rounded mb-2" />
          <div className="h-5 w-3/4 max-w-lg bg-white/10 rounded mb-10" />
          <div className="h-14 w-full max-w-3xl bg-white/15 rounded" />
        </div>
      </section>
      <div className="px-6 py-14">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-8 bg-gray-200 rounded" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
