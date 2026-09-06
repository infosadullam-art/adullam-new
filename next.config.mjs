import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import { withSentryConfig } from "@sentry/nextjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },

  images: {
    unoptimized: true,
  },

  turbopack: { root: resolve(__dirname) },

  // ✅ Retire tous les console.log en production (garde error/warn pour le debug)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // ✅ REWRITES PROXY - Maintenant vers ton VPS
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.adullamarket.com/api/:path*",
      },
    ]
  },

  // ✅ SECURITY HEADERS
  async headers() {
    return [
      {
        // Applique ces headers à toutes les routes du frontend
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://*.vercel-insights.com https://vercel.live",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.cdnfonts.com",
              "connect-src 'self' https://api.adullamarket.com https://*.facebook.com https://vitals.vercel-insights.com https://ipapi.co",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
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
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      // CORS pour /api/* est géré par le middleware du backend (adullam-backend),
      // pas ici — un bloc statique ici referait la même erreur qu'on vient de corriger côté VPS.
    ]
  },

  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false }
    return config
  },

  trailingSlash: false,
  staticPageGenerationTimeout: 120,
  httpAgentOptions: {
    keepAlive: true,
  },
}

export default withSentryConfig(nextConfig, {
  org: "adullam-market",
  project: "adullam-frontend",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
})