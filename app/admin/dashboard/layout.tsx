import type React from "react"
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google"
import "../admin.css"
import { AdminShell } from "./admin-shell"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-adm-display",
  display: "swap",
})
const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-adm-body",
  display: "swap",
})

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`adm-shell ${display.variable} ${body.variable}`}>
      <AdminShell>{children}</AdminShell>
    </div>
  )
}
