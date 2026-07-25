/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // No page on this site should ever be iframed (clickjacking protection)
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // The Astelfin company room was removed — send old bookmarks/history
      // to the Astellic overview instead of a 404.
      {
        source: "/astelfin_26/astelfin",
        destination: "/astelfin_26/overview",
        permanent: false,
      },
      {
        source: "/astelfin_26/astelfin/:path*",
        destination: "/astelfin_26/overview",
        permanent: false,
      },
      // The Governance & Public Sector Reform thematic area was retired — send any
      // old links to the thematic areas overview instead of a 404.
      {
        source: "/thematic-areas/governance",
        destination: "/thematic-areas",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
