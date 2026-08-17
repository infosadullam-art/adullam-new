"use client";

import { useState } from "react";
import { Gift, X, Check, Loader2, Tag, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const brandColor = "#D4372B";

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Veuillez entrer un code promo");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
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
        const coupon = data.coupon;
        let computedDiscount = coupon.discountAmount || 0;
        
        if (coupon.type === 'PERCENTAGE') {
          computedDiscount = Math.round((cartTotal * coupon.value) / 100);
        } else if (coupon.type === 'FIXED_AMOUNT') {
          computedDiscount = coupon.value;
        }
        
        const finalCoupon = { ...coupon, discountAmount: computedDiscount };
        
        if (coupon.type === 'PERCENTAGE') {
          setSuccess(`✅ ${coupon.value}% de réduction appliqué !`);
        } else {
          setSuccess(`✅ Réduction appliquée !`);
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

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Coupon appliqué
  if (appliedCoupon) {
    return (
      <div 
        className="flex items-center justify-between p-4 rounded-xl border transition-all duration-300"
        style={{
          background: isDark ? '#1A3A2A' : '#F0FDF4',
          borderColor: isDark ? '#2A5A3A' : '#BBF7D0',
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isDark ? '#2A5A3A' : '#DCFCE7',
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: isDark ? '#86EFAC' : '#16A34A' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-bold"
                style={{ color: isDark ? '#86EFAC' : '#16A34A' }}
              >
                {appliedCoupon.code}
              </span>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: isDark ? '#2A5A3A' : '#DCFCE7',
                  color: isDark ? '#86EFAC' : '#16A34A',
                }}
              >
                {appliedCoupon.type === 'PERCENTAGE' ? `${appliedCoupon.value}%` : 'FIXE'}
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-green-300/70' : 'text-green-600'}`}>
              {appliedCoupon.discountDescription || (appliedCoupon.type === 'PERCENTAGE' 
                ? `${appliedCoupon.value}% de réduction` 
                : `${formatPrice(appliedCoupon.value)} de réduction`)}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            color: isDark ? '#86EFAC' : '#16A34A',
          }}
          aria-label="Retirer le code"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Formulaire de saisie
  return (
    <div className="space-y-2">
      <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Code promo
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Gift 
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`} 
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="EX: PROMO50"
            className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
              isDark 
                ? 'bg-[#1A1A1A] text-white border border-gray-700 focus:border-[#D4372B] focus:ring-[#D4372B]/20 placeholder:text-gray-600' 
                : 'bg-white text-gray-900 border border-gray-200 focus:border-[#D4372B] focus:ring-[#D4372B]/20 placeholder:text-gray-400'
            }`}
            style={{
              borderColor: error ? '#EF4444' : undefined,
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
          {code && !isLoading && (
            <button
              onClick={() => setCode("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
          style={{
            background: brandColor,
          }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              Appliquer
            </>
          )}
        </button>
      </div>
      
      {/* Messages d'erreur / succès */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-green-600 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200">
          <Check className="w-3 h-3" />
          {success}
        </p>
      )}
    </div>
  );
}