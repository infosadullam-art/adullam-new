import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import { withSentryConfig } from "@sentry/nextjs"

/** 🔹 Pour ES Modules (Next.js) */
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  turbopack: { root: resolve(__dirname) },

  experimental: {
    // appDir: true,
  },

  // ✅ PROXY ACTIVÉ AVEC LA BONNE URL
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://outstanding-enchantment-production-109f.up.railway.app/api/:path*",
      },
    ]
  },

  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false }
    return config
  },

  trailingSlash: false,
}

// ✅ Configuration Sentry
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
});