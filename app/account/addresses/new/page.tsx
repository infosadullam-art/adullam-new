"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/admin/auth-context"

export default function NewAddressPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: "",
    isDefault: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push("/account")
      } else {
        const data = await res.json()
        alert(data.message || "Erreur lors de l'ajout")
      }
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de l'ajout")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-[#C72C1C] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <h1 className="text-2xl font-bold mb-6">Nouvelle adresse</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C72C1C]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C72C1C]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Adresse</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C72C1C]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ville</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C72C1C]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C72C1C]"
            required
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Définir comme adresse par défaut</span>
        </label>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#C72C1C] text-white rounded-lg hover:bg-[#A21F18] disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Ajouter"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}