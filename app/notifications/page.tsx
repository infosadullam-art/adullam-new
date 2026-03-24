"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Bell } from "lucide-react"
import { useState } from "react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Votre commande #1234 a été expédiée", date: "28 Déc 2025", read: false },
    { id: 2, title: "Nouvelle promotion sur Électronique", date: "27 Déc 2025", read: true },
    { id: 3, title: "Votre retour a été accepté", date: "26 Déc 2025", read: false },
    // ajoute d'autres notifications
  ])

  const toggleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#C72C1C]" />
          Notifications
        </h1>

        {notifications.length === 0 ? (
          <p className="text-gray-500">Vous n’avez aucune notification.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => toggleRead(n.id)}
                className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                  n.read ? "opacity-60" : "opacity-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{n.title}</span>
                  <span className="text-xs text-gray-400">{n.date}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
