"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/admin/auth-context"
import { MapPin, Plus, Edit2, Trash2, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Address {
  id: string
  type: string
  firstName: string
  lastName: string
  company?: string
  address: string
  complement?: string
  city: string
  postalCode?: string
  country: string
  phone: string
  isDefault: boolean
}

export default function AddressesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: "livraison",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    complement: "",
    city: "",
    postalCode: "",
    country: "CI",
    phone: "",
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses")
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingId 
      ? `/api/user/addresses/${editingId}`
      : "/api/user/addresses"
    
    const method = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        await fetchAddresses()
        resetForm()
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cette adresse ?")) return

    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        await fetchAddresses()
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingId(address.id)
    setFormData(address)
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      type: "livraison",
      firstName: "",
      lastName: "",
      company: "",
      address: "",
      complement: "",
      city: "",
      postalCode: "",
      country: "CI",
      phone: "",
      isDefault: false
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes adresses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover"
        >
          <Plus className="w-4 h-4" />
          Ajouter une adresse
        </button>
      </div>

      {/* Formulaire */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Modifier l'adresse" : "Nouvelle adresse"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Entreprise (optionnel)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Complément (optionnel)</label>
                <input
                  type="text"
                  value={formData.complement}
                  onChange={(e) => setFormData({...formData, complement: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code postal</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand"
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
                  className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover"
                >
                  {editingId ? "Mettre à jour" : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des adresses */}
      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucune adresse enregistrée</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-brand font-medium hover:underline"
          >
            Ajouter une adresse
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-sm p-6 relative"
            >
              {address.isDefault && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Par défaut
                </span>
              )}
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand mt-1" />
                <div className="flex-1">
                  <p className="font-medium">
                    {address.firstName} {address.lastName}
                    {address.company && ` - ${address.company}`}
                  </p>
                  <p className="text-sm text-gray-600">{address.address}</p>
                  {address.complement && (
                    <p className="text-sm text-gray-600">{address.complement}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.country}
                  </p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-1 text-sm text-brand hover:underline"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}