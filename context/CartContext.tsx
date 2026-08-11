"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useLocale } from "./LocaleProvider";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { toast } from "react-hot-toast";

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
  minQuantity?: number;
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

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================================
// CALCUL MOQ
// ============================================================
function getMinQuantity(price: number): number {
  if (price <= 3.26) return 10;
  if (price <= 8.16) return 6;
  if (price <= 16.32) return 4;
  if (price <= 48.98) return 3;
  return 2;
}

// ============================================================
// SYNCHRONISATION SERVEUR
// ============================================================
function serverCartItemToCartItem(item: any): CartItem {
  const attrs = item.attributes || {};
  return {
    id: item.productId,
    name: item.productName,
    price: item.price,
    quantity: item.quantity,
    image: item.image || "/placeholder.svg",
    weight: item.weight,
    color: attrs.color,
    eurSize: attrs.eurSize,
    variantKey: item.variantKey,
    attributes: attrs,
    shippingMode: item.shippingMode,
    shippingCostUSD: item.shippingCostUSD,
    portePorteCostUSD: item.portePorteCostUSD,
    minQuantity: item.minQuantity || getMinQuantity(item.price),
  };
}

async function fetchServerCart(): Promise<CartItem[] | null> {
  try {
    const res = await apiFetch("/api/cart");
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.data?.items || [];
    return items.map(serverCartItemToCartItem);
  } catch {
    return null;
  }
}

async function syncCartToServer(items: CartItem[]): Promise<void> {
  try {
    await apiFetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  } catch {
    // Non-bloquant
  }
}

// ============================================================
// PROVIDER
// ============================================================
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { country } = useLocale();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingMode, setShippingMode] = useState<ShippingMode>("bateau");
  const [ready, setReady] = useState(false);
  const [cache, setCache] = useState<Map<string, { shippingCost: number; portePorte: number; totalWeight: number }>>(new Map());
  const hasHydratedFromServer = useRef(false);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedCart = localStorage.getItem("cart");
    const storedShipping = localStorage.getItem("shippingMode");

    let localCart: CartItem[] = [];
    if (storedCart) {
      try {
        localCart = JSON.parse(storedCart);
        setCart(localCart);
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

    const token = getAccessToken();
    if (token && !hasHydratedFromServer.current) {
      hasHydratedFromServer.current = true;
      fetchServerCart().then((serverItems) => {
        if (serverItems === null) return;
        if (serverItems.length > 0) {
          setCart(serverItems);
        } else if (localCart.length > 0) {
          syncCartToServer(localCart);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("shippingMode", shippingMode);
  }, [shippingMode, ready]);

  useEffect(() => {
    if (!ready) return;
    if (!getAccessToken()) return;

    if (syncDebounceRef.current) {
      clearTimeout(syncDebounceRef.current);
    }
    syncDebounceRef.current = setTimeout(() => {
      syncCartToServer(cart);
    }, 800);

    return () => {
      if (syncDebounceRef.current) {
        clearTimeout(syncDebounceRef.current);
      }
    };
  }, [cart, ready]);

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

      const response = await apiFetch(`/api/logistics/estimate?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        const shipping = data.data.shipping;
        const weight = data.data.weight;

        const selectedShipping = shipping[mode as keyof typeof shipping];

        return {
          shippingCost: selectedShipping?.transportCost || selectedShipping?.cost || 0,
          portePorte: selectedShipping?.portePorteCost || 0,
          totalWeight: weight.roundedWeight || weight.totalWeight || 0
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur API logistique:", error);
      return null;
    }
  };

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

    const itemWeight = (item.weight || 0.5) * item.quantity;
    const roundedWeight = Math.ceil(itemWeight);
    return {
      shippingCost: 0,
      portePorte: 0,
      totalWeight: roundedWeight
    };
  };

  const updateItemWithCosts = async (item: CartItem, mode: ShippingMode): Promise<CartItem> => {
    const costs = await calculateItemCosts(item, mode);
    return {
      ...item,
      shippingCostUSD: costs.shippingCost,
      portePorteCostUSD: costs.portePorte,
      totalWeight: costs.totalWeight
    };
  };

  // ✅ VÉRIFICATION MOQ GLOBAL (par produit, toutes variantes confondues) - SANS TOAST
  const checkGlobalMOQ = (productId: string, totalQuantity: number): boolean => {
    const items = cart.filter(i => i.id === productId);
    if (items.length === 0) return true;
    
    const minQty = items[0].minQuantity || getMinQuantity(items[0].price);
    if (totalQuantity < minQty) {
      // ❌ PAS DE TOAST ici - la page produit gère l'affichage
      return false;
    }
    return true;
  };

  const addToCart = async (item: CartItem) => {
    const variantKey = item.variantKey || `${item.id}_${item.color || ''}_${item.eurSize || ''}`;
    const existingIndex = cart.findIndex((p) => p.variantKey === variantKey);

    // Calculer la nouvelle quantité totale pour ce produit (toutes variantes)
    let newTotalQuantity = item.quantity;
    cart.forEach(i => {
      if (i.id === item.id) {
        newTotalQuantity += i.quantity;
      }
    });

    // ✅ Vérifier MOQ global (sans toast)
    if (!checkGlobalMOQ(item.id, newTotalQuantity)) {
      return;
    }

    if (existingIndex >= 0) {
      const existingItem = cart[existingIndex];
      const updatedItem = await updateItemWithCosts(
        { ...existingItem, quantity: existingItem.quantity + item.quantity },
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
        minQuantity: item.minQuantity || getMinQuantity(item.price),
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

    // ✅ Vérifier MOQ global pour la nouvelle quantité (sans toast)
    if (!checkGlobalMOQ(item.id, quantity)) {
      return;
    }

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
    if (getAccessToken()) {
      apiFetch("/api/cart", { method: "DELETE" }).catch(() => {});
    }
  };

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

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};