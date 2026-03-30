// components/cart/CartDrawer.tsx

import { X, Minus, Plus, Ship, Sparkles, Zap, Truck } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter'
import { useLocale } from '@/context/LocaleProvider'
import { useState } from 'react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    updateShippingMode,
    totalUSD, 
    totalItems,
    totalShippingUSD,
    totalPortePorteUSD,
    grandTotalUSD,
    shippingMode: defaultShippingMode,
    setShippingMode: setDefaultShippingMode
  } = useCart()
  
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter()
  const { currency } = useLocale()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  if (!isOpen) return null

  const shippingIcons = {
    bateau: Ship,
    avion: Sparkles,
    express: Zap
  }

  const shippingLabels = {
    bateau: 'Maritime',
    avion: 'Aérien',
    express: 'Express'
  }

  const handleShippingModeChange = async (variantKey: string, mode: 'bateau' | 'avion' | 'express') => {
    setUpdatingId(variantKey)
    updateShippingMode(variantKey, mode)
    setTimeout(() => setUpdatingId(null), 300)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium">
              Panier <span className="text-sm text-gray-500">({totalItems} article{totalItems > 1 ? 's' : ''})</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Votre panier est vide</p>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-[#2B4F3C] hover:underline"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const isUpdating = updatingId === item.variantKey
              
              // ✅ Tous les calculs en USD, conversion à l'affichage
              const productSubtotalUSD = item.price * item.quantity
              const itemTotalUSD = productSubtotalUSD + (item.shippingCostUSD || 0) + (item.portePorteCostUSD || 0)
              
              return (
                <div 
                  key={item.variantKey} 
                  className={`
                    flex gap-3 border-b border-gray-100 pb-4 transition-opacity
                    ${isUpdating ? 'opacity-50' : 'opacity-100'}
                  `}
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name || "Produit"}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.name || "Produit"}</h3>
                    
                    {(item.color || item.eurSize) && (
                      <div className="mt-1 space-y-0.5">
                        {item.color && (
                          <p className="text-xs text-gray-500">
                            Couleur: <span className="font-medium text-gray-700">{item.color}</span>
                          </p>
                        )}
                        {item.eurSize && (
                          <p className="text-xs text-gray-500">
                            Pointure: <span className="font-medium text-gray-700">{item.eurSize}</span>
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-1">
                      <button
                        onClick={() => handleShippingModeChange(item.variantKey!, 'bateau')}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                          item.shippingMode === 'bateau' 
                            ? 'bg-[#2B4F3C] text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Ship className="w-3 h-3" />
                        <span>Mer</span>
                      </button>
                      <button
                        onClick={() => handleShippingModeChange(item.variantKey!, 'avion')}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                          item.shippingMode === 'avion' 
                            ? 'bg-[#2B4F3C] text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Air</span>
                      </button>
                      <button
                        onClick={() => handleShippingModeChange(item.variantKey!, 'express')}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                          item.shippingMode === 'express' 
                            ? 'bg-[#2B4F3C] text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        <span>Express</span>
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#2B4F3C]">
                          {formatPrice(item.price)} <span className="text-xs font-normal text-gray-500">× {item.quantity}</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.variantKey!, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantKey!, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sous-total:</span>
                        <span className="font-medium text-gray-700">{formatPrice(productSubtotalUSD)}</span>
                      </div>
                      
                      {item.shippingCostUSD ? (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Frais livraison:</span>
                          <div className="text-right">
                            <span className="font-medium text-gray-700">{formatPrice(item.shippingCostUSD)}</span>
                            <span className="text-[10px] text-gray-400 block">(pour {item.quantity} art.)</span>
                          </div>
                        </div>
                      ) : null}
                      
                      {item.portePorteCostUSD ? (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Frais porte-à-porte:</span>
                          <div className="text-right">
                            <span className="font-medium text-gray-700">{formatPrice(item.portePorteCostUSD)}</span>
                            <span className="text-[10px] text-gray-400 block">(pour {item.quantity} art.)</span>
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between font-medium text-[#2B4F3C]">
                        <span>Total:</span>
                        <span>{formatPrice(itemTotalUSD)}</span>
                      </div>
                    </div>

                    {item.totalWeight && (
                      <p className="text-[10px] text-gray-400 mt-1 text-right">
                        Poids: {item.totalWeight.toFixed(2)} kg
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.variantKey!)}
                    className="text-gray-400 hover:text-red-500 transition-colors self-start p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer - Section "Mode par défaut" supprimée */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatPrice(totalUSD)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium">{formatPrice(totalShippingUSD)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Porte-à-porte</span>
                <span className="font-medium">{formatPrice(totalPortePorteUSD)}</span>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>Poids total</span>
                <span>{cart.reduce((sum, item) => sum + (item.totalWeight || 0), 0).toFixed(2)} kg</span>
              </div>

              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-[#2B4F3C]">{formatPrice(grandTotalUSD)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose()
                window.location.href = '/checkout'
              }}
              className="w-full mt-3 py-3 rounded-lg text-sm font-medium text-white bg-[#2B4F3C] hover:bg-[#1a3a2a] transition-colors"
            >
              Commander ({formatPrice(grandTotalUSD)})
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-2">
              Tous les prix sont en {getCurrencySymbol()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}