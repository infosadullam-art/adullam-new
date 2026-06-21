import type { Metadata } from "next"
import { Poppins, Fraunces } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import ClientWrapper from "@/components/ClientWrapper"
import { LocaleProvider } from "@/context/LocaleProvider"
import { CartProvider } from "@/context/CartContext"
import { AuthProvider } from "@/lib/admin/auth-context"
import { Toaster } from "react-hot-toast"
import * as Sentry from "@sentry/nextjs"
import SplashScreen from "@/components/SplashScreen"
import { ChatbotProvider } from "@/components/chatbot-provider"
// AJOUT REFONTE — thème clair/sombre/système (présentation uniquement)
import { ThemeProvider, themeNoFlashScript } from "@/components/theme-provider"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

// AJOUT REFONTE — police serif éditoriale pour les titres (font-display / h1-h3)
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Adullam Marketplace - Achetez direct des usines du monde entier",
  description: "Connectez-vous aux meilleurs fournisseurs du monde entier. Mode, électronique, maison — livraison vers l'Afrique.",
  generator: "v0.app",
  keywords: "marketplace international, e-commerce, Afrique, shopping en ligne, fournisseurs internationaux",
  authors: [{ name: "Adullam" }],
  openGraph: {
    title: "Adullam Marketplace - Achetez direct des usines du monde entier",
    description: "Achetez direct des usines du monde entier",
    url: "https://www.adullamarket.com",
    siteName: "Adullam Marketplace",
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
    title: "Adullam Marketplace - Achetez direct des usines du monde entier",
    description: "Achetez direct des usines du monde entier",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-custom.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" }
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

function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack }) => (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Une erreur est survenue</h1>
            <p className="text-muted-foreground">L'équipe technique a été notifiée.</p>
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
    // suppressHydrationWarning : le thème mute la classe de <html> avant l'hydratation
    <html lang="fr" className={`scroll-smooth ${poppins.variable} ${fraunces.variable}`} translate="no" suppressHydrationWarning>
      <head>
        {/* AJOUT REFONTE — script anti-flash : applique .dark avant le paint */}
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
        <link rel="icon" type="image/x-icon" href="/favicon-custom.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Adullam" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      {/* bg-white text-gray-900 -> tokens, indispensable pour le mode sombre */}
      <body className="antialiased bg-background text-foreground font-sans">
        <ThemeProvider>
          <SplashScreen />
          <div id="main-content">
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
                          background: '#0A0A0A',
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
                            background: '#0A0A0A',
                          },
                        },
                        error: {
                          duration: 4000,
                          style: {
                            background: '#D4372B',
                          },
                        },
                      }}
                    />
                    {/* ✅ Chatbot Adu - disponible sur toutes les pages */}
                    <ChatbotProvider />
                  </CartProvider>
                </LocaleProvider>
              </AuthProvider>
            </GlobalErrorBoundary>
            <Analytics />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
