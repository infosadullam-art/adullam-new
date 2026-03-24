// components/PriceDisplay.tsx
"use client"

import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import { useLocale } from "@/context/LocaleProvider"
import { Info } from "lucide-react"
import { useState } from "react"

interface PriceDisplayProps {
  priceUSD: number
  className?: string
  showOriginal?: boolean
  originalPriceUSD?: number
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showTooltip?: boolean
  quantity?: number
  variant?: "default" | "symbol-after" | "no-symbol"
}

export function PriceDisplay({ 
  priceUSD, 
  className = "", 
  showOriginal = false,
  originalPriceUSD,
  size = "md",
  showTooltip = true,
  quantity = 1,
  variant = "default"
}: PriceDisplayProps) {
  const { formatPrice, formatPriceWithSymbolAfter, formatPriceWithoutSymbol, convertFromUSD, currency } = useCurrencyFormatter()
  const { country } = useLocale()
  const [showTooltipState, setShowTooltipState] = useState(false)
  
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
    xl: "text-2xl font-bold"
  }
  
  const totalUSD = priceUSD * quantity
  const discount = originalPriceUSD ? Math.round((1 - priceUSD / originalPriceUSD) * 100) : 0
  
  const getFormattedPrice = () => {
    switch(variant) {
      case "symbol-after":
        return formatPriceWithSymbolAfter(totalUSD)
      case "no-symbol":
        return formatPriceWithoutSymbol(totalUSD)
      default:
        return formatPrice(totalUSD)
    }
  }
  
  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex flex-col">
        <span className={`${sizeClasses[size]} text-[#2B4F3C]`}>
          {getFormattedPrice()}
        </span>
        
        {quantity > 1 && (
          <span className="text-xs text-gray-400">
            ({formatPrice(priceUSD)} / unité)
          </span>
        )}
      </div>
      
      {showOriginal && originalPriceUSD && (
        <>
          <span className="text-xs text-gray-400 line-through">
            {variant === "symbol-after" 
              ? formatPriceWithSymbolAfter(originalPriceUSD * quantity)
              : formatPrice(originalPriceUSD * quantity)
            }
          </span>
          <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        </>
      )}
      
      {showTooltip && currency !== 'USD' && (
        <div 
          className="relative"
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
        >
          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          
          {showTooltipState && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-2 z-50">
              <p className="text-center">
                <span className="font-semibold">Base:</span> ${totalUSD.toFixed(2)} USD
                <br />
                <span className="font-semibold">Taux:</span> 1 USD = {convertFromUSD(1).toFixed(2)} {currency}
                <br />
                <span className="font-semibold">Pays:</span> {country}
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}