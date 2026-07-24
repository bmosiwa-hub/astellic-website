/**
 * Shows a prominent banner on any non-production deployment (Vercel preview or
 * local development), so a staging/preview instance can never be mistaken for the
 * live system — the human side of keeping test changes off production data.
 * Renders nothing in production.
 */
export default function EnvBanner() {
  const env = process.env.VERCEL_ENV; // "production" | "preview" | "development" | undefined
  if (!env || env === "production") return null;

  const label = env === "preview" ? "PREVIEW / STAGING" : "DEVELOPMENT";
  return (
    <div className="sticky top-0 z-[9998] bg-fuchsia-600 text-white text-center text-xs font-bold py-1 tracking-wide">
      ⚠ {label} ENVIRONMENT — not the live production system. Data here is for testing only.
    </div>
  );
}
