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