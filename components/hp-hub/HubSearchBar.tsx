/**
 * The repository search box. A plain GET form, so it works without
 * JavaScript and on slow connections.
 */
export default function HubSearchBar({
  defaultValue,
  country,
  size = "lg",
  tone = "dark",
  label = "Search the repository",
}: {
  defaultValue?: string;
  country?: string;
  size?: "lg" | "md";
  tone?: "dark" | "light";
  label?: string;
}) {
  const height = size === "lg" ? "h-14 text-base sm:text-lg" : "h-12 text-base";
  const field =
    tone === "dark"
      ? "bg-white text-brand-navy placeholder:text-gray-400 border-transparent focus:ring-brand-gold"
      : "bg-white text-brand-navy placeholder:text-gray-400 border-gray-300 focus:border-brand-navy focus:ring-brand-navy/20";
  return (
    <form action="/hp-hub/search" method="get" role="search" className="w-full">
      <label htmlFor={`hp-search-${size}`} className="sr-only">
        {label}
      </label>
      {country && <input type="hidden" name="country" value={country} />}
      <div className="flex w-full">
        <input
          id={`hp-search-${size}`}
          type="search"
          name="q"
          defaultValue={defaultValue}
          maxLength={200}
          autoComplete="off"
          placeholder="Search policies, reports, strategies, guidelines and research..."
          className={`${height} ${field} min-w-0 flex-1 rounded-l-md border px-4 sm:px-5 outline-none focus:ring-2`}
        />
        <button
          type="submit"
          className={`${size === "lg" ? "h-14 px-5 sm:px-7" : "h-12 px-5"} shrink-0 rounded-r-md bg-brand-gold hover:bg-[#b8973f] text-white font-semibold transition-colors inline-flex items-center gap-2`}
        >
          <svg aria-hidden className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </form>
  );
}
