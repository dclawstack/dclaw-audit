/** @type {import('next').NextConfig} */
// API calls proxied through Next.js rewrites so the browser never needs to
// know the backend URL — only the server does. On Vercel, set BACKEND_URL in
// project env; the default below targets the in-cluster/compose backend.
const BACKEND_URL = process.env.BACKEND_URL || "http://dclaw-audit-backend:8037";

const nextConfig = {
  // 'standalone' output is required for the Docker/Helm container build.
  output: "standalone",
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/health/:path*", destination: `${BACKEND_URL}/health/:path*` },
    ];
  },
};

module.exports = nextConfig;
