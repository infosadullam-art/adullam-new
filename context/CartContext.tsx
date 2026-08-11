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
  addItemsToCart: (items: CartItem[]) => { success: boolean; addedCount: number };
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

  // ✅ Miroir synchrone du panier : évite les lectures obsolètes (stale closure)
  // quand plusieurs ajouts/modifs sont déclenchés rapidement à la suite
  // (ex: ajout de plusieurs variantes d'un coup). Toujours lire/écrire via
  // cartRef.current dans la logique métier, jamais via la variable `cart`.
  const cartRef = useRef<CartItem[]>([]);

  const commitCart = (next: CartItem[]) => {
    cartRef.current = next;
    setCart(next);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedCart = localStorage.getItem("cart");
    const storedShipping = localStorage.getItem("shippingMode");

    let localCart: CartItem[] = [];
    if (storedCart) {
      try {
        localCart = JSON.parse(storedCart);
        commitCart(localCart);
      } catch {
        commitCart([]);
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
          commitCart(serverItems);
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

  // ============================================================
  // ✅ ADD ITEMS TO CART (LOT) - MOQ GLOBAL ATOMIQUE
  // Utilisé quand plusieurs variantes du MÊME produit sont ajoutées en une
  // seule action (ex: sélection de plusieurs couleurs/tailles). Le MOQ est
  // vérifié sur la somme du lot + ce qui est déjà dans le panier pour ce
  // produit, PAS variante par variante — sinon un lot valide dans son
  // ensemble (ex: 3+4+5=12 ≥ MOQ 10) serait rejeté à tort si chaque
  // variante est vérifiée isolément avant que les autres ne soient commitées.
  // ============================================================
  const addItemsToCart = (items: CartItem[]): { success: boolean; addedCount: number } => {
    if (items.length === 0) return { success: false, addedCount: 0 };

    const currentCart = cartRef.current;

    // Regrouper les nouveaux items par produit (id)
    const byProduct = new Map<string, CartItem[]>();
    items.forEach((item) => {
      const list = byProduct.get(item.id) || [];
      list.push(item);
      byProduct.set(item.id, list);
    });

    let nextCart = [...currentCart];
    const reservations: { variantKey: string; reservedItem: CartItem }[] = [];
    let anyRejected = false;
    let addedCount = 0;

    byProduct.forEach((productItems, productId) => {
      const minQty = productItems[0].minQuantity || getMinQuantity(productItems[0].price);

      const batchVariantKeys = new Set(
        productItems.map((it) => it.variantKey || `${it.id}_${it.color || ''}_${it.eurSize || ''}`)
      );

      // Quantité déjà présente sur d'AUTRES variantes de ce produit (hors lot en cours)
      const existingOtherTotal = currentCart.reduce((sum, p) => {
        if (p.id === productId && !batchVariantKeys.has(p.variantKey!)) {
          return sum + p.quantity;
        }
        return sum;
      }, 0);

      // Quantité déjà présente sur les variantes DU LOT qui existent déjà dans le panier
      // (cas où on ré-ajoute à une variante déjà présente)
      const existingBatchVariantsTotal = currentCart.reduce((sum, p) => {
        if (p.id === productId && batchVariantKeys.has(p.variantKey!)) {
          return sum + p.quantity;
        }
        return sum;
      }, 0);

      const batchQuantity = productItems.reduce((sum, it) => sum + it.quantity, 0);
      const projectedTotal = existingOtherTotal + existingBatchVariantsTotal + batchQuantity;

      // ✅ MOQ global vérifié sur le LOT COMPLET, pas variante par variante
      if (projectedTotal < minQty) {
        anyRejected = true;
        toast.error(`Quantité minimum de ${minQty} pièces requise pour ce produit (toutes variantes confondues)`, {
          duration: 4000,
          position: "top-center",
        });
        return;
      }

      productItems.forEach((item) => {
        const variantKey = item.variantKey || `${item.id}_${item.color || ''}_${item.eurSize || ''}`;
        const existingIndex = nextCart.findIndex((p) => p.variantKey === variantKey);

        if (existingIndex >= 0) {
          const existingItem = nextCart[existingIndex];
          const reservedItem = { ...existingItem, quantity: existingItem.quantity + item.quantity };
          nextCart[existingIndex] = reservedItem;
          reservations.push({ variantKey, reservedItem });
        } else {
          const reservedItem: CartItem = {
            ...item,
            weight: item.weight || 0.5,
            variantKey,
            shippingMode: item.shippingMode || shippingMode,
            minQuantity: minQty,
          };
          nextCart.push(reservedItem);
          reservations.push({ variantKey, reservedItem });
        }
        addedCount += item.quantity;
      });
    });

    if (reservations.length === 0) {
      return { success: false, addedCount: 0 };
    }

    // ✅ Commit synchrone unique de tout le lot accepté
    commitCart(nextCart);

    // Calcul des frais de livraison en arrière-plan pour chaque item du lot
    reservations.forEach(({ variantKey, reservedItem }) => {
      updateItemWithCosts(reservedItem, reservedItem.shippingMode || shippingMode).then((itemWithCosts) => {
        const latest = cartRef.current;
        const idx = latest.findIndex((p) => p.variantKey === variantKey);
        if (idx === -1) return;
        const updated = [...latest];
        updated[idx] = itemWithCosts;
        commitCart(updated);
      });
    });

    return { success: !anyRejected, addedCount };
  };

  // ============================================================
  // ✅ ADD TO CART - MOQ GLOBAL + réservation synchrone (anti race-condition)
  // ============================================================
  const addToCart = (item: CartItem) => {
    const variantKey = item.variantKey || `${item.id}_${item.color || ''}_${item.eurSize || ''}`;
    const minQty = item.minQuantity || getMinQuantity(item.price);

    // ⚠️ Toujours lire depuis cartRef.current (jamais `cart`) : synchrone et
    // toujours à jour, même si addToCart est appelé plusieurs fois de suite
    // avant que React n'ait eu le temps de re-render (ex: ajout multi-variantes).
    const currentCart = cartRef.current;
    const existingIndex = currentCart.findIndex((p) => p.variantKey === variantKey);

    const otherVariantsTotal = currentCart.reduce((sum, p) => {
      if (p.id === item.id && p.variantKey !== variantKey) {
        return sum + p.quantity;
      }
      return sum;
    }, 0);

    let baseItem: CartItem;
    let newQuantity: number;

    if (existingIndex >= 0) {
      const existingItem = currentCart[existingIndex];
      baseItem = existingItem;
      newQuantity = existingItem.quantity + item.quantity;
    } else {
      baseItem = {
        ...item,
        weight: item.weight || 0.5,
        variantKey,
        shippingMode: item.shippingMode || shippingMode,
        minQuantity: minQty,
      };
      newQuantity = item.quantity;
    }

    const projectedTotal = otherVariantsTotal + newQuantity;

    // ✅ MOQ global : le total du produit (toutes variantes) ne doit jamais descendre sous le MOQ
    if (projectedTotal < minQty) {
      toast.error(`Quantité minimum de ${minQty} pièces requise pour ce produit (toutes variantes confondues)`, {
        duration: 4000,
        position: "top-center",
      });
      return;
    }

    // ✅ Réservation SYNCHRONE de la quantité (aucun await avant ce point) :
    // les appels suivants dans la même rafale voient immédiatement ce nouvel état.
    const reservedItem: CartItem = { ...baseItem, quantity: newQuantity };
    const nextCart = [...currentCart];
    if (existingIndex >= 0) {
      nextCart[existingIndex] = reservedItem;
    } else {
      nextCart.push(reservedItem);
    }
    commitCart(nextCart);

    // Le calcul des frais de livraison (appel réseau) se fait ensuite,
    // sans bloquer ni fausser les vérifications MOQ des appels suivants.
    updateItemWithCosts(reservedItem, reservedItem.shippingMode || shippingMode).then((itemWithCosts) => {
      const latest = cartRef.current;
      const idx = latest.findIndex((p) => p.variantKey === variantKey);
      if (idx === -1) return; // supprimé entre-temps
      const updated = [...latest];
      updated[idx] = itemWithCosts;
      commitCart(updated);
    });
  };

  // ============================================================
  // ✅ UPDATE QUANTITY - MOQ GLOBAL + réservation synchrone
  // ============================================================
  const updateQuantity = (variantKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantKey);
      return;
    }

    const currentCart = cartRef.current;
    const item = currentCart.find(i => i.variantKey === variantKey);
    if (!item) return;

    const minQty = item.minQuantity || getMinQuantity(item.price);

    const otherVariantsTotal = currentCart.reduce((sum, p) => {
      if (p.id === item.id && p.variantKey !== variantKey) {
        return sum + p.quantity;
      }
      return sum;
    }, 0);

    const projectedTotal = otherVariantsTotal + quantity;

    // ✅ Le total du produit (toutes variantes) ne doit jamais descendre sous le MOQ.
    // L'utilisateur peut monter au-dessus du MOQ librement, mais pas descendre en dessous.
    if (projectedTotal < minQty) {
      toast.error(`Quantité minimum de ${minQty} pièces requise pour ce produit (toutes variantes confondues)`, {
        duration: 4000,
        position: "top-center",
      });
      return;
    }

    // Réservation synchrone de la nouvelle quantité
    const reservedItem: CartItem = { ...item, quantity };
    const nextCart = currentCart.map((i) => (i.variantKey === variantKey ? reservedItem : i));
    commitCart(nextCart);

    updateItemWithCosts(reservedItem, reservedItem.shippingMode || shippingMode).then((itemWithCosts) => {
      const latest = cartRef.current;
      const idx = latest.findIndex((p) => p.variantKey === variantKey);
      if (idx === -1) return;
      const updated = [...latest];
      updated[idx] = itemWithCosts;
      commitCart(updated);
    });
  };

  const removeFromCart = (variantKey: string) => {
    const nextCart = cartRef.current.filter((item) => item.variantKey !== variantKey);
    commitCart(nextCart);
  };

  const updateShippingMode = (variantKey: string, mode: ShippingMode) => {
    const currentCart = cartRef.current;
    const item = currentCart.find(i => i.variantKey === variantKey);
    if (!item) return;

    updateItemWithCosts(item, mode).then((updatedItem) => {
      const latest = cartRef.current;
      const idx = latest.findIndex((p) => p.variantKey === variantKey);
      if (idx === -1) return;
      const nextCart = [...latest];
      nextCart[idx] = { ...updatedItem, shippingMode: mode };
      commitCart(nextCart);
    });
  };

  const clearCart = () => {
    commitCart([]);
    localStorage.removeItem("cart");
    setCache(new Map());
    if (getAccessToken()) {
      apiFetch("/api/cart", { method: "DELETE" }).catch(() => {});
    }
  };

  useEffect(() => {
    const recalcAllItems = async () => {
      if (!ready || cartRef.current.length === 0) return;

      const snapshot = cartRef.current;
      const updatedCart = await Promise.all(
        snapshot.map(async (item) => {
          return await updateItemWithCosts(item, item.shippingMode || shippingMode);
        })
      );
      commitCart(updatedCart);
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
        addItemsToCart,
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