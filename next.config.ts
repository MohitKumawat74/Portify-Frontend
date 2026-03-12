import type { NextConfig } from "next";

const API_BASE = (() => {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!env) return '';
  const cleaned = env.replace(/\/+$|\s+$/g, '');
  // If the env already includes /api at the end, strip it for consistent rewrites
  return cleaned.endsWith('/api') ? cleaned.replace(/\/api$/, '') : cleaned;
})();

const nextConfig: NextConfig = {
  images: {
    // Allow any external image URL (portfolio user avatars / project screenshots
    // come from arbitrary domains, so we allow all and use unoptimized per-image).
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async rewrites() {
    // In development we proxy all /api requests to the external API base
    // configured in NEXT_PUBLIC_API_BASE_URL so the browser never performs
    // cross-origin requests and avoids CORS issues.
    return [
      {
        source: '/api/:path*',
        destination: API_BASE ? `${API_BASE}/api/:path*` : 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
