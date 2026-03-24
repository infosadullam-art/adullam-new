import React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Adullam Pipeline v2",
  description:
    "Import pipeline with dual Alibaba endpoints: Search + Product Details enrichment",
}

export default function PipelineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section
      className={`${geist.className} antialiased min-h-screen bg-background`}
    >
      {children}
    </section>
  )
}
