"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Package } from "lucide-react"
import { useState } from "react"

interface ShippingFormProps {
  onNext: () => void
}

export function ShippingForm({ onNext }: ShippingFormProps) {
  const [selectedAddress, setSelectedAddress] = useState<string>("home")
  const [shippingMethod, setShippingMethod] = useState<string>("standard")

  return (
    <div className="space-y-6">
      {/* Saved Addresses */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Adresse de livraison
        </h2>

        <div className="space-y-3">
          {/* Address Option 1 */}
          <label
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedAddress === "home" ? "border-brand bg-red-50" : "border-border hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="address"
              value="home"
              checked={selectedAddress === "home"}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">Domicile</span>
                <span className="px-2 py-0.5 bg-brand text-white text-xs rounded">Par défaut</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Kouassi Konan
                <br />
                Cocody, Rue des Jardins, Villa 45
                <br />
                Abidjan, Côte d'Ivoire
                <br />
                Tél: +225 07 08 09 10 11
              </p>
            </div>
          </label>

          {/* Address Option 2 */}
          <label
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedAddress === "office" ? "border-brand bg-red-50" : "border-border hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="address"
              value="office"
              checked={selectedAddress === "office"}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="mt-1"
            />
            <div className="flex-1">
              <span className="font-semibold block mb-1">Bureau</span>
              <p className="text-sm text-muted-foreground">
                Kouassi Konan
                <br />
                Plateau, Avenue Houdaille, Immeuble Alpha 2000
                <br />
                Abidjan, Côte d'Ivoire
                <br />
                Tél: +225 07 08 09 10 11
              </p>
            </div>
          </label>
        </div>

        <Button variant="outline" className="mt-4 w-full bg-transparent">
          + Ajouter une nouvelle adresse
        </Button>
      </div>

      {/* Shipping Method */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Mode de livraison
        </h2>

        <div className="space-y-3">
          <label
            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              shippingMethod === "standard" ? "border-brand bg-red-50" : "border-border hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <input
                type="radio"
                name="shipping"
                value="standard"
                checked={shippingMethod === "standard"}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-semibold mb-1">Livraison standard</div>
                <p className="text-sm text-muted-foreground">Livraison sous 3-5 jours ouvrés</p>
              </div>
            </div>
            <span className="font-bold text-lg">2,000 XOF</span>
          </label>

          <label
            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              shippingMethod === "express" ? "border-brand bg-red-50" : "border-border hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={shippingMethod === "express"}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-semibold mb-1">Livraison express</div>
                <p className="text-sm text-muted-foreground">Livraison sous 24-48h</p>
              </div>
            </div>
            <span className="font-bold text-lg">4,500 XOF</span>
          </label>
        </div>
      </div>

      {/* Continue Button */}
      <Button onClick={onNext} className="w-full bg-brand hover:bg-brand-hover text-white h-12 text-base font-semibold">
        Continuer vers le paiement
      </Button>
    </div>
  )
}
