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
  shippingCostUSD?: number;
  portePorteCostUSD?: number;
  totalWeight?: number;
  productTitle?: string;
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
  const [cache, setCache] = useState<Map<string, { shippingCost: number; portePorte: number; totalWeight: number }>>(new Map());

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

  // ✅ Appel à l'API logistique avec le mode sélectionné
  const fetchShippingEstimate = async (
    productId: string,
    productTitle: string,
    quantity: number,
    productWeight: number,
    destinationCountry: string,
    mode: ShippingMode
  ): Promise<{ shippingCost: number; portePorte: number; totalWeight: number } | null> => {
    try {
      const params = new URLSearchParams({
        productId,
        productTitle,
        productWeight: productWeight?.toString() || '',
        quantity: quantity.toString(),
        country: destinationCountry
      });

      const response = await fetch(`/api/logistics/estimate?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        const shipping = data.data.shipping;
        const weight = data.data.weight;
        
        // ✅ Utilise le mode sélectionné
        const selectedShipping = shipping[mode as keyof typeof shipping];
        
        return {
          shippingCost: selectedShipping?.cost || 0,
          portePorte: 0,
          totalWeight: weight.roundedWeight || weight.totalWeight || 0
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur API logistique:", error);
      return null;
    }
  };

  // ✅ Calcule les frais de livraison via l'API (ou cache) avec le mode
  const calculateItemCosts = async (item: CartItem, mode: ShippingMode): Promise<{ shippingCost: number; portePorte: number; totalWeight: number }> => {
    const cacheKey = `${item.id}_${item.variantKey}_${mode}_${country}_${item.quantity}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const result = await fetchShippingEstimate(
      item.id,
      item.name || item.productTitle || "Produit",
      item.quantity,
      item.weight || 0.5,
      country,
      mode
    );

    if (result) {
      setCache(prev => new Map(prev).set(cacheKey, result));
      return result;
    }

    // Fallback si l'API échoue
    const itemWeight = (item.weight || 0.5) * item.quantity;
    const roundedWeight = Math.ceil(itemWeight);
    return {
      shippingCost: 0,
      portePorte: 0,
      totalWeight: roundedWeight
    };
  };

  // Mettre à jour un item avec ses frais
  const updateItemWithCosts = async (item: CartItem, mode: ShippingMode): Promise<CartItem> => {
    const costs = await calculateItemCosts(item, mode);
    return {
      ...item,
      shippingCostUSD: costs.shippingCost,
      portePorteCostUSD: costs.portePorte,
      totalWeight: costs.totalWeight
    };
  };

  const addToCart = async (item: CartItem) => {
    const variantKey = item.variantKey || `${item.id}_${item.color || ''}_${item.eurSize || ''}`;
    const existingIndex = cart.findIndex((p) => p.variantKey === variantKey);

    if (existingIndex >= 0) {
      const existingItem = cart[existingIndex];
      const newQuantity = existingItem.quantity + item.quantity;
      const updatedItem = await updateItemWithCosts(
        { ...existingItem, quantity: newQuantity },
        existingItem.shippingMode || shippingMode
      );
      
      const newCart = [...cart];
      newCart[existingIndex] = updatedItem;
      setCart(newCart);
    } else {
      const newItem = {
        ...item,
        weight: item.weight || 0.5,
        variantKey,
        shippingMode: item.shippingMode || shippingMode,
      };
      const itemWithCosts = await updateItemWithCosts(newItem, newItem.shippingMode!);
      setCart((prev) => [...prev, itemWithCosts]);
    }
  };

  const removeFromCart = (variantKey: string) => {
    setCart((prev) => prev.filter((item) => item.variantKey !== variantKey));
  };

  const updateQuantity = async (variantKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantKey);
      return;
    }

    const item = cart.find(i => i.variantKey === variantKey);
    if (!item) return;

    const updatedItem = await updateItemWithCosts(
      { ...item, quantity },
      item.shippingMode!
    );

    setCart((prev) =>
      prev.map((i) => (i.variantKey === variantKey ? updatedItem : i))
    );
  };

  const updateShippingMode = async (variantKey: string, mode: ShippingMode) => {
    const item = cart.find(i => i.variantKey === variantKey);
    if (!item) return;

    const updatedItem = await updateItemWithCosts(item, mode);

    setCart((prev) =>
      prev.map((i) => (i.variantKey === variantKey ? { ...updatedItem, shippingMode: mode } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    setCache(new Map());
  };

  // Recalculer tous les items quand le pays change
  useEffect(() => {
    const recalcAllItems = async () => {
      if (!ready || cart.length === 0) return;
      
      const updatedCart = await Promise.all(
        cart.map(async (item) => {
          return await updateItemWithCosts(item, item.shippingMode || shippingMode);
        })
      );
      setCart(updatedCart);
    };
    
    recalcAllItems();
  }, [country, ready]);

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