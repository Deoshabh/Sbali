import { setupHoneybadger } from '@honeybadger-io/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "backend",
        port: "5000",
        pathname: "/api/media/**",
      },
      {
        protocol: "https",
        hostname: "minio.radeo.in",
        pathname: "/product-media/**",
      },
      {
        protocol: "https",
        hostname: "cdn.radeo.in",
        pathname: "/product-media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    // Image optimization settings
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
  },

  async redirects() {
    return [
      {
        source: "/admin/storefront-builder",
        destination: "/admin/cms",
        permanent: true,
      },
      {
        source: "/admin/visual-editor",
        destination: "/admin/cms",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:5000"}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        // Static security headers applied to every response.
        // NOTE: Content-Security-Policy is intentionally omitted here.
        //       A nonce-based CSP (required for Lighthouse XSS + Trusted Types audits)
        //       is injected per-request by src/middleware.ts.
        source: "/(.*)",
        headers: [
          {
            // X-Frame-Options: legacy clickjacking protection (keep alongside CSP frame-ancestors)
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            // Cross-Origin-Opener-Policy: prevents cross-origin windows from retaining
            // a reference to this page. "same-origin-allow-popups" is used instead of
            // "same-origin" so Razorpay and Firebase popup flows continue to work.
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            // Cross-Origin-Resource-Policy: prevents other origins from no-cors fetching
            // our resources (images, scripts, etc.).
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },
        ],
      },
      {
        // Next.js content-hashed static bundles: safe to cache for 1 year.
        // This resolves Lighthouse "Use efficient cache lifetimes" for JS/CSS assets.
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Public folder static assets: images, fonts, icons.
        // Content-addressed via filename hash in production builds.
        source: "/(.*)\\.(ico|png|jpg|jpeg|svg|webp|avif|woff|woff2|ttf|eot|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // robots.txt and sitemap.xml: cache for 1 day — frequently read by crawlers.
        source: "/(robots\\.txt|sitemap\\.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default setupHoneybadger(nextConfig, {
  reportData: true,
  silent: false,
  apiKey: process.env.HONEYBADGER_API_KEY,
  assetsUrl: process.env.NEXT_PUBLIC_ASSETS_URL || 'https://radeo.in',
  revision: process.env.GIT_COMMIT_SHA,
});
