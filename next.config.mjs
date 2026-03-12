/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.scdn.co" }, // Spotify artwork
    ],
    // Allow unoptimized local images for PWA icons
    unoptimized: false,
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000", "cruise-connect-hub.netlify.app", "cruise-connect-hub.vercel.app", "*.vercel.app"] },
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type",              value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control",             value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed",    value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
