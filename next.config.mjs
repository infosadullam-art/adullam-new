import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import { withSentryConfig } from "@sentry/nextjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  
  images: { 
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
  },

  turbopack: { root: resolve(__dirname) },

  experimental: {},

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