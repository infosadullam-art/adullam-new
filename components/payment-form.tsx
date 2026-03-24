"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, Smartphone, Building2, ChevronLeft } from "lucide-react"
import { useState } from "react"

interface PaymentFormProps {
  onBack: () => void
}

export function PaymentForm({ onBack }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("card")

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Mode de paiement
        </h2>

        <div className="space-y-3">
          {/* Card Payment */}
          <label
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === "card" ? "border-brand bg-red-50" : "border-border hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5" />
                <span className="font-semibold">Carte bancaire</span>
              </div>
              <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
            </div>
          </label>

          {/* Card Form */}
          {paymentMethod === "card" && (
            <div className="pl-11 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de carte</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date d'expiration</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom sur la carte</label>
                <input
                  type="text"
                  placeholder="Kouassi Konan"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          )}

          {/* Mobile Money */}
          <label
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === "mobile" ? "border-brand bg-red-50" : "border-border hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="mobile"
              checked={paymentMethod === "mobile"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-5 h-5" />
                <span className="font-semibold">Mobile Money</span>
              </div>
              <p className="text-sm text-muted-foreground">Orange Money, MTN Money, Moov Money</p>
            </div>
          </label>

          {/* Mobile Money Form */}
          {paymentMethod === "mobile" && (
            <div className="pl-11 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Opérateur</label>
                <select className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand">
                  <option>Orange Money</option>
                  <option>MTN Money</option>
                  <option>Moov Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de téléphone</label>
                <input
                  type="tel"
                  placeholder="+225 07 08 09 10 11"
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          )}

          {/* Cash on Delivery */}
          <label
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === "cash" ? "border-brand bg-red-50" : "border-border hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">Paiement à la livraison</span>
              </div>
              <p className="text-sm text-muted-foreground">Payez en espèces lors de la réception</p>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1 h-12 bg-transparent">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button className="flex-1 bg-brand hover:bg-brand-hover text-white h-12 text-base font-semibold">
          Valider la commande
        </Button>
      </div>
    </div>
  )
}
