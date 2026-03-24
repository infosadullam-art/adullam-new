"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocale } from "./LocaleProvider";

// ============================================================
// TYPES POUR LES ARTICLES DU PANIER
// ============================================================
export type ShippingMode = "bateau" | "avion" | "express";

export type CartItem = {
  id: string;
  name: string;
  price: number; // USD
  quantity: number;
  image: string;
  weight?: number;
  color?: string;
  eurSize?: string;
  variantKey?: string;
  attributes?: Record<string, string>;
  shippingMode?: ShippingMode;
  shippingCostUSD?: number; // ✅ Changé : stocké en USD
  portePorteCostUSD?: number; // ✅ Changé : stocké en USD
  totalWeight?: number;
};

// ============================================================
// TAUX DE LIVRAISON PAR MODE ET PAYS (en USD)
// ============================================================
type ShippingRates = {
  [key in ShippingMode]: {
    [country: string]: number;
  };
};

const SHIPPING_RATES: ShippingRates = {
  bateau: {
    CI: 4.57, BF: 4.57, SN: 4.57, ML: 4.57, BJ: 4.57, TG: 4.57, NE: 4.57,
    CM: 5.20, CF: 5.20, GA: 5.20, CG: 5.20, CD: 6.50,
    MA: 6.80, TN: 6.80, DZ: 6.80, LY: 7.20, EG: 7.50,
    ZA: 7.35, NA: 7.35, BW: 7.35, ZM: 7.35, ZW: 7.35, MZ: 7.35, AO: 7.80,
    KE: 6.90, UG: 6.90, TZ: 6.90, RW: 6.90, ET: 7.10,
    DEFAULT: 7.35
  },
  avion: {
    CI: 14.69, BF: 14.69, SN: 14.69, ML: 14.69, BJ: 14.69, TG: 14.69, NE: 14.69,
    CM: 15.20, CF: 15.20, GA: 15.20, CG: 15.20, CD: 16.50,
    MA: 16.80, TN: 16.80, DZ: 16.80, LY: 17.20, EG: 17.50,
    ZA: 16.33, NA: 16.33, BW: 16.33, ZM: 16.33, ZW: 16.33, MZ: 16.33, AO: 17.80,
    KE: 16.90, UG: 16.90, TZ: 16.90, RW: 16.90, ET: 17.10,
    DEFAULT: 16.33
  },
  express: {
    CI: 24.49, BF: 24.49, SN: 24.49, ML: 24.49, BJ: 24.49, TG: 24.49, NE: 24.49,
    CM: 25.20, CF: 25.20, GA: 25.20, CG: 25.20, CD: 26.50,
    MA: 26.80, TN: 26.80, DZ: 26.80, LY: 27.20, EG: 27.50,
    ZA: 29.39, NA: 29.39, BW: 29.39, ZM: 29.39, ZW: 29.39, MZ: 29.39, AO: 30.80,
    KE: 28.90, UG: 28.90, TZ: 28.90, RW: 28.90, ET: 29.10,
    DEFAULT: 29.39
  }
};

// ============================================================
// FRAIS PORTE-À-PORTE PAR PAYS (en USD)
// ============================================================
const PORTE_PORTE_RATES_USD = {
  under5kg: 1.63,
  over5kg: 3.26
};

// ============================================================
// TAUX DE CHANGE (pour l'affichage seulement)
// ============================================================
const EXCHANGE_RATES: Record<string, number> = {
  XOF: 612.75, XAF: 612.75, CDF: 2850, MAD: 10.02, TND: 3.12, DZD: 134.50,
  GNF: 8600, RWF: 1310, BIF: 2870, MGA: 4550, NGN: 1550, GHS: 15.20, ZAR: 18.40,
  LYD: 4.8, EGP: 48, MZN: 64, AOA: 830, KES: 130, UGX: 3700, TZS: 2600, ETB: 57,
};

// ============================================================
// TYPE DU CONTEXT
// ============================================================
type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantKey: string) => void;
  updateQuantity: (variantKey: string, quantity: number) => void;
  updateShippingMode: (variantKey: string, mode: ShippingMode) => void;
  clearCart: () => void;
  totalUSD: number;
  totalItems: number;
  totalShippingUSD: number;
  totalPortePorteUSD: number;
  grandTotalUSD: number;
  ready: boolean;
  shippingMode: ShippingMode;
  setShippingMode: (mode: ShippingMode) => void;
};

// ============================================================
// CRÉATION DU CONTEXT
// ============================================================
const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================================
// PROVIDER PRINCIPAL
// ============================================================
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { country } = useLocale();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingMode, setShippingMode] = useState<ShippingMode>("bateau");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedCart = localStorage.getItem("cart");
    const storedShipping = localStorage.getItem("shippingMode");

    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        setCart([]);
      }
    }

    if (
      storedShipping === "bateau" ||
      storedShipping === "avion" ||
      storedShipping === "express"
    ) {
      setShippingMode(storedShipping);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("shippingMode", shippingMode);
  }, [shippingMode, ready]);

  // ✅ Calcule les frais de livraison en USD
  const calculateItemShippingUSD = (item: CartItem, mode: ShippingMode): number => {
    const itemWeight = (item.weight || 0.5) * item.quantity;
    const roundedWeight = Math.ceil(itemWeight);
    const ratePerKgUSD = SHIPPING_RATES[mode][country] || SHIPPING_RATES[mode].DEFAULT;
    return ratePerKgUSD * roundedWeight;
  };

  // ✅ Calcule les frais de porte-à-porte en USD
  const calculateItemPortePorteUSD = (item: CartItem): number => {
    const itemWeight = (item.weight || 0.5) * item.quantity;
    return itemWeight < 5 ? PORTE_PORTE_RATES_USD.under5kg : PORTE_PORTE_RATES_USD.over5kg;
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const variantKey = item.variantKey || `${item.id}_${item.color || ''}_${item.eurSize || ''}`;
      const existingIndex = prev.findIndex((p) => p.variantKey === variantKey);

      if (existingIndex >= 0) {
        const newCart = [...prev];
        const existingItem = newCart[existingIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        
        const updatedItem = {
          ...existingItem,
          quantity: newQuantity,
          totalWeight: (existingItem.weight || 0.5) * newQuantity,
          shippingCostUSD: calculateItemShippingUSD(
            { ...existingItem, quantity: newQuantity },
            existingItem.shippingMode!
          ),
          portePorteCostUSD: calculateItemPortePorteUSD({ ...existingItem, quantity: newQuantity })
        };
        
        newCart[existingIndex] = updatedItem;
        return newCart;
      }

      const newItem = {
        ...item,
        weight: item.weight || 0.5,
        variantKey,
        shippingMode: item.shippingMode || shippingMode,
      };

      const shippingCostUSD = calculateItemShippingUSD(newItem, newItem.shippingMode!);
      const portePorteCostUSD = calculateItemPortePorteUSD(newItem);
      const totalWeight = (newItem.weight || 0.5) * newItem.quantity;

      const newItemWithCosts = {
        ...newItem,
        shippingCostUSD,
        portePorteCostUSD,
        totalWeight
      };

      return [...prev, newItemWithCosts];
    });
  };

  const removeFromCart = (variantKey: string) => {
    setCart((prev) => prev.filter((item) => item.variantKey !== variantKey));
  };

  const updateQuantity = (variantKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantKey);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.variantKey === variantKey) {
          return {
            ...item,
            quantity,
            totalWeight: (item.weight || 0.5) * quantity,
            shippingCostUSD: calculateItemShippingUSD(
              { ...item, quantity },
              item.shippingMode!
            ),
            portePorteCostUSD: calculateItemPortePorteUSD({ ...item, quantity })
          };
        }
        return item;
      })
    );
  };

  const updateShippingMode = (variantKey: string, mode: ShippingMode) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.variantKey === variantKey) {
          return {
            ...item,
            shippingMode: mode,
            shippingCostUSD: calculateItemShippingUSD(item, mode)
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // ✅ Tous les totaux sont en USD
  const totalUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalShippingUSD = cart.reduce((sum, item) => sum + (item.shippingCostUSD || 0), 0);
  const totalPortePorteUSD = cart.reduce((sum, item) => sum + (item.portePorteCostUSD || 0), 0);
  const grandTotalUSD = totalUSD + totalShippingUSD + totalPortePorteUSD;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateShippingMode,
        clearCart,
        totalUSD,
        totalItems,
        totalShippingUSD,
        totalPortePorteUSD,
        grandTotalUSD,
        ready,
        shippingMode,
        setShippingMode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ============================================================
// HOOK PERSONNALISÉ
// ============================================================
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};