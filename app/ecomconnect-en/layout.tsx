import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "ecomConnect x Adullam webinar | Order directly from the factories",
  description:
    "Order directly from manufacturers in China, Turkey, Dubai and the USA. Secure payment via Genius Pay, door-to-door delivery, delivered or refunded.",
  openGraph: {
    title: "ecomConnect x Adullam webinar",
    description:
      "Order directly from the factories. We handle everything. Delivered or refunded.",
    type: "website",
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
