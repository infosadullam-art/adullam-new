import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import ClientWrapper from "@/components/ClientWrapper"
import { LocaleProvider } from "@/context/LocaleProvider"
import { CartProvider } from "@/context/CartContext"
import { AuthProvider } from "@/lib/admin/auth-context"
import { Toaster } from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"

// ✅ Poppins avec tous les poids
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Adullam | Marketplace Internationale",
  description:
    "Connectez-vous aux meilleurs fournisseurs du monde entier. Mode, électronique, maison — livraison vers l'Afrique.",
  generator: "v0.app",
  keywords: "marketplace international, e-commerce, Afrique, shopping en ligne, fournisseurs internationaux",
  authors: [{ name: "Adullam" }],
  openGraph: {
    title: "Adullam - Marketplace Internationale",
    description: "Achetez direct des usines du monde entier",
    url: "https://adullam.com",
    siteName: "Adullam",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Adullam Marketplace",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adullam - Marketplace Internationale",
    description: "Achetez direct des usines du monde entier",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// ✅ Error Boundary global Sentry (optionnel mais recommandé)
function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack }) => (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
            <p className="text-gray-600">L'équipe technique a été notifiée.</p>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${poppins.variable} antialiased bg-white text-gray-900 font-sans`}>
        {/* ✅ Error Boundary Sentry autour de toute l'app */}
        <GlobalErrorBoundary>
          <AuthProvider>
            <LocaleProvider>
              <CartProvider>
                <ClientWrapper>
                  {children}
                </ClientWrapper>
                <Toaster 
                  position="top-center"
                  reverseOrder={false}
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1A1A1A',
                      color: '#fff',
                      fontSize: '14px',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontFamily: 'var(--font-poppins)',
                      fontWeight: 500,
                    },
                    success: {
                      duration: 3000,
                      icon: '✓',
                      style: {
                        background: '#0F2A44',
                      },
                    },
                    error: {
                      duration: 4000,
                      style: {
                        background: '#B91C1C',
                      },
                    },
                  }}
                />
              </CartProvider>
            </LocaleProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
        {/* ✅ Analytics doit être en dehors du ErrorBoundary mais dans body */}
        <Analytics />
      </body>
    </html>
  )
}