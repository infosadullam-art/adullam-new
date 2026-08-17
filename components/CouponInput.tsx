"use client";

import { useState } from "react";
import { Gift, X, Check, Loader2, Tag } from "lucide-react";

interface CouponInputProps {
  onApply: (coupon: {
    id: string;
    code: string;
    type: string;
    value: number;
    discountAmount: number;
    discountDescription: string;
  }) => void;
  onRemove: () => void;
  appliedCoupon?: {
    id: string;
    code: string;
    type: string;
    value: number;
    discountAmount: number;
    discountDescription: string;
  } | null;
  cartTotal: number;
  userId?: string;
}

export function CouponInput({ 
  onApply, 
  onRemove, 
  appliedCoupon, 
  cartTotal, 
  userId 
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Veuillez entrer un code promo");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // ✅ Utiliser l'URL absolue du serveur
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://www.adullamarket.com";
      
      const res = await fetch(`${API_URL}/api/coupons/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: code.trim(), 
          userId, 
          cartTotal 
        }),
      });

      const data = await res.json();

      if (data.valid) {
        // ✅ Calculer le vrai montant de réduction selon le type
        const coupon = data.coupon
        let computedDiscount = coupon.discountAmount || 0
        if (coupon.type === 'PERCENTAGE') {
          computedDiscount = Math.round((cartTotal * coupon.value) / 100)
        } else if (coupon.type === 'FIXED_AMOUNT') {
          computedDiscount = coupon.value
        }
        const finalCoupon = { ...coupon, discountAmount: computedDiscount }
        
        // Afficher le bon message
        if (coupon.type === 'PERCENTAGE') {
          setSuccess(`✅ -${coupon.value}% appliqué sur votre commande !`);
        } else {
          setSuccess(`✅ -${formatPrice(coupon.value)} appliqué sur votre commande !`);
        }
        onApply(finalCoupon);
        setCode("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Code promo invalide");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Erreur coupon:", err);
      setError("Erreur lors de la vérification");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de formatage simple pour l'affichage
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Tag className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-green-800">
              {appliedCoupon.code}
            </span>
            <p className="text-xs text-green-600">
              {appliedCoupon.discountDescription || (appliedCoupon.type === 'PERCENTAGE' 
                ? `${appliedCoupon.value}% de réduction` 
                : `${formatPrice(appliedCoupon.value)} de réduction`)}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-green-100 rounded-full transition-colors"
          aria-label="Retirer le code"
        >
          <X className="w-4 h-4 text-green-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700">
        Code promo
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="EX: PROMO50"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4372B]/20 focus:border-[#D4372B] transition-all"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="px-4 py-2.5 text-sm font-medium text-white bg-[#D4372B] rounded-lg hover:bg-[#B82E22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Appliquer"
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <Check className="w-3 h-3" />
          {success}
        </p>
      )}
    </div>
  );
}