/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
};
export default nextConfig;
