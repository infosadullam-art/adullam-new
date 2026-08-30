"use client";

import { Header } from "@/components/header";
import { MobileHeader } from "@/components/mobile-header";
import MobileNav from "@/components/mobile-nav";
import { Footer } from "@/components/footer";

// ════════════════════════════════════════════════════════════
// ICÔNES — dessinées maison, même trait (1.6, jonctions arrondies)
// que le reste du site. Noms identiques aux imports lucide
// d'origine : aucune des utilisations plus bas n'est à modifier.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string; style?: React.CSSProperties };

function ChevronRight({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeft({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Shield({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 3.6 19 6.4v5.3c0 4.4-3 7.4-7 8.7-4-1.3-7-4.3-7-8.7V6.4L12 3.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Lock({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CreditCard({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 14.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MapPin({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 21.5s-7-6.3-7-11.7a7 7 0 1 1 14 0c0 5.4-7 11.7-7 11.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="9.8" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Phone({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path
        d="M6.6 3.5 9 5.9c.4.4.5 1 .2 1.5L7.9 9.7a12.5 12.5 0 0 0 6.4 6.4l2.3-1.3c.5-.3 1.1-.2 1.5.2l2.4 2.4c.5.5.5 1.4-.1 1.8-1.1.9-2.7 1.6-4.4 1.2C10.7 19.3 4.7 13.3 3.8 8c-.4-1.7.3-3.3 1.2-4.4.4-.6 1.3-.6 1.8-.1Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function Mail({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Home({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M4.5 11.2 12 4.6l7.5 6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.8V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Truck({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M3.5 7h9.5v9H3.5V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 10h3.6L20 13.2V16h-7v-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function AlertCircle({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.6v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.1" r="0.15" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

function Plus({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function Ship({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M4 14.5l1.4 4.4c.2.7.9 1.1 1.6 1.1h10c.7 0 1.4-.4 1.6-1.1l1.4-4.4H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 14.5V6.8h6.7l3.3 3.4v4.3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 6.8V4.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Zap({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12.8 3.5 6 13.2h4.6L10.6 20.5 18 10.3h-4.7L12.8 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Check({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Menu({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M4 7.5h16M4 12h16M4 16.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleProvider";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useAuth } from "@/lib/admin/auth-context";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaymentButton } from "@/components/PaymentButton";
import { CouponInput } from "@/components/CouponInput";
import { apiFetch } from "@/lib/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Couleurs dynamiques
const brandColor = "var(--accent)";
const brandGradient = "var(--accent)";
const softBg = "var(--surface)";

// ============================================================
// FONCTION MOQ
// ============================================================
function getMinQuantity(price: number): number {
  if (price <= 3.26) return 10;
  if (price <= 8.16) return 6;
  if (price <= 16.32) return 4;
  if (price <= 48.98) return 3;
  return 2;
}

// Liste des pays d'Afrique
const AFRICAN_COUNTRIES = [
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", prefix: "+225" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", prefix: "+221" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", prefix: "+237" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", prefix: "+226" },
  { code: "ML", name: "Mali", flag: "🇲🇱", prefix: "+223" },
  { code: "GN", name: "Guinée", flag: "🇬🇳", prefix: "+224" },
  { code: "TG", name: "Togo", flag: "🇹🇬", prefix: "+228" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", prefix: "+229" },
  { code: "CG", name: "Congo", flag: "🇨🇬", prefix: "+242" },
  { code: "CD", name: "RDC", flag: "🇨🇩", prefix: "+243" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", prefix: "+241" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", prefix: "+233" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", prefix: "+234" },
  { code: "MA", name: "Maroc", flag: "🇲🇦", prefix: "+212" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿", prefix: "+213" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳", prefix: "+216" },
  { code: "EG", name: "Égypte", flag: "🇪🇬", prefix: "+20" },
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦", prefix: "+27" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", prefix: "+254" },
  { code: "UG", name: "Ouganda", flag: "🇺🇬", prefix: "+256" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", prefix: "+250" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿", prefix: "+255" },
  { code: "ET", name: "Éthiopie", flag: "🇪🇹", prefix: "+251" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", prefix: "+261" },
  { code: "MU", name: "Maurice", flag: "🇲🇺", prefix: "+230" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", prefix: "+248" },
  { code: "KM", name: "Comores", flag: "🇰🇲", prefix: "+269" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", prefix: "+253" },
  { code: "SO", name: "Somalie", flag: "🇸🇴", prefix: "+252" },
  { code: "SD", name: "Soudan", flag: "🇸🇩", prefix: "+249" },
  { code: "SS", name: "Soudan du Sud", flag: "🇸🇸", prefix: "+211" },
  { code: "ER", name: "Érythrée", flag: "🇪🇷", prefix: "+291" },
  { code: "MR", name: "Mauritanie", flag: "🇲🇷", prefix: "+222" },
  { code: "NE", name: "Niger", flag: "🇳🇪", prefix: "+227" },
  { code: "TD", name: "Tchad", flag: "🇹🇩", prefix: "+235" },
  { code: "CF", name: "République centrafricaine", flag: "🇨🇫", prefix: "+236" },
  { code: "GQ", name: "Guinée équatoriale", flag: "🇬🇶", prefix: "+240" },
  { code: "ST", name: "Sao Tomé-et-Principe", flag: "🇸🇹", prefix: "+239" },
  { code: "GW", name: "Guinée-Bissau", flag: "🇬🇼", prefix: "+245" },
  { code: "CV", name: "Cap-Vert", flag: "🇨🇻", prefix: "+238" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", prefix: "+232" },
  { code: "LR", name: "Liberia", flag: "🇱🇷", prefix: "+231" },
  { code: "GM", name: "Gambie", flag: "🇬🇲", prefix: "+220" },
  { code: "BW", name: "Botswana", flag: "🇧🇼", prefix: "+267" },
  { code: "NA", name: "Namibie", flag: "🇳🇦", prefix: "+264" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", prefix: "+263" },
  { code: "ZM", name: "Zambie", flag: "🇿🇲", prefix: "+260" },
  { code: "MW", name: "Malawi", flag: "🇲🇼", prefix: "+265" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", prefix: "+258" },
  { code: "AO", name: "Angola", flag: "🇦🇴", prefix: "+244" },
  { code: "BI", name: "Burundi", flag: "🇧🇮", prefix: "+257" }
];

// Modes d'expédition
const SHIPPING_METHODS = [
  { id: "bateau", name: "Maritime", icon: Ship, days: "35-50j", badge: "Économique", label: "Mer" },
  { id: "avion", name: "Aérien", icon: Zap, days: "15-20j", badge: "Rapide", label: "Air" },
  { id: "express", name: "Express", icon: Zap, days: "7-10j", badge: "Prioritaire", label: "Express" }
];

// Fonction pour obtenir le libellé du mode d'expédition
const getShippingLabel = (mode: string): string => {
  const labels: Record<string, string> = {
    'bateau': 'Maritime (35-50j)',
    'avion': 'Aérien (15-20j)',
    'express': 'Express (7-10j)'
  };
  return labels[mode] || mode;
};

// ============================================================
// VÉRIFICATION DU PANIER AVANT PAIEMENT (MOQ GLOBAL)
// ============================================================
function validateCartMOQ(cart: any[]): { valid: boolean; invalidProducts: string[] } {
  // ✅ Vérifier MOQ global par produit (toutes variantes confondues)
  const productTotals = new Map<string, { total: number; name: string; minQty: number }>();
  
  cart.forEach(item => {
    const minQty = item.minQuantity || getMinQuantity(item.price);
    if (!productTotals.has(item.id)) {
      productTotals.set(item.id, { total: 0, name: item.name || "Produit", minQty });
    }
    productTotals.get(item.id)!.total += item.quantity;
  });

  const invalidProducts = Array.from(productTotals.entries())
    .filter(([_, data]) => data.total < data.minQty)
    .map(([id, data]) => data.name);

  return { valid: invalidProducts.length === 0, invalidProducts };
}

// ✅ Totaux MOQ agrégés par produit (id), toutes variantes confondues.
// Utilisé pour le badge visuel "⚠️ MOQ" : une ligne ne doit être signalée en
// dessous du MOQ que si le TOTAL du produit (toutes couleurs/tailles
// cumulées) est insuffisant, jamais sa propre quantité isolée.
function getProductMOQTotals(cart: any[]): Map<string, { total: number; minQty: number }> {
  const productTotals = new Map<string, { total: number; minQty: number }>();
  cart.forEach((item) => {
    const minQty = item.minQuantity || getMinQuantity(item.price);
    if (!productTotals.has(item.id)) {
      productTotals.set(item.id, { total: 0, minQty });
    }
    productTotals.get(item.id)!.total += item.quantity;
  });
  return productTotals;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const { 
    cart, 
    totalUSD, 
    totalShippingUSD,
    totalPortePorteUSD,
    grandTotalUSD,
    totalItems,
    clearCart,
    updateShippingMode,
    shippingMode: defaultShippingMode,
    setShippingMode: setDefaultShippingMode
  } = useCart();
  
  const { country: userCountry, currency } = useLocale();
  const { formatPrice, getCurrencySymbol } = useCurrencyFormatter();

  // ✅ Map des totaux MOQ agrégés par produit, recalculée à chaque rendu du
  // panier — utilisée par le badge visuel aux trois endroits de la page
  // (au lieu d'un calcul par ligne qui ignorait les autres variantes).
  const productMOQTotals = getProductMOQTotals(cart);
  const isProductBelowMOQ = (item: { id: string; price: number; minQuantity?: number }) => {
    const data = productMOQTotals.get(item.id);
    if (!data) return false;
    return data.total < data.minQty;
  };

  // États
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // États pour sauvegarder les données de la commande
  const [lastOrderTotal, setLastOrderTotal] = useState<number>(0);
  const [lastOrderRef, setLastOrderRef] = useState<string>("");

  // États pour les coupons
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const finalTotal = Math.max(0, grandTotalUSD - discountAmount);

  // Adresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Pays
  const [selectedCountry, setSelectedCountry] = useState(
    AFRICAN_COUNTRIES.find(c => c.code === userCountry) || AFRICAN_COUNTRIES[0]
  );
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Infos livraison
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    quartier: "",
    city: "",
    postalCode: "",
    country: "CI",
    notes: ""
  });

  // Nouvelle adresse
  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    quartier: "",
    city: "",
    postalCode: "",
    country: "CI",
    phone: "",
    isDefault: false
  });

  // ============================================================
  // 📊 META TRACKING - InitiateCheckout (Pixel + Conversions API)
  // ============================================================
  const hasTrackedInitiateCheckoutRef = useRef(false);

  const trackInitiateCheckout = () => {
    if (typeof window === "undefined" || hasTrackedInitiateCheckoutRef.current) return;
    hasTrackedInitiateCheckoutRef.current = true;

    try {
      const eventId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const contentIds = cart.map((item) => item.id);

      if ((window as any).fbq) {
        (window as any).fbq(
          "track",
          "InitiateCheckout",
          {
            content_ids: contentIds,
            content_type: "product",
            currency: "USD",
            value: grandTotalUSD,
            num_items: totalItems,
          },
          { eventID: eventId }
        );
      }

      apiFetch("/api/meta/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "InitiateCheckout",
          eventId,
          sourceUrl: window.location.href,
          value: grandTotalUSD,
          currency: "USD",
          contentIds,
        }),
      }).catch(() => {});
    } catch {
      // Non-bloquant
    }
  };

  // ============================================================
  // 🧾 CRÉATION DE LA COMMANDE (avant paiement)
  // Une seule fois par session checkout — évite les doublons si
  // l'utilisateur navigue entre les étapes plusieurs fois.
  // ============================================================
  const hasCreatedOrderRef = useRef(false);

  const createOrderIfNeeded = async (): Promise<string | null> => {
    if (hasCreatedOrderRef.current && lastOrderRef) return lastOrderRef;

    try {
      const token = localStorage.getItem('adullam_token');
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            eurSize: item.eurSize,
            variantKey: item.variantKey,
            image: item.image,
            weight: item.weight,
            shippingMode: item.shippingMode || defaultShippingMode,
            shippingCost: item.shippingCostUSD,
            portePorteCost: item.portePorteCostUSD,
          })),
          shippingInfo: {
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            postalCode: shippingInfo.postalCode,
            notes: shippingInfo.notes,
          },
          country: selectedCountry.code,
          paymentMethod: 'MOBILE_MONEY',
          totals: {
            totalShipping: totalShippingUSD,
            totalPortePorte: totalPortePorteUSD,
            grandTotal: finalTotal,
          },
          defaultShippingMode,
          deviceType: 'web',
          locale: 'fr',
          currency,
        }),
      });

      const data = await response.json();

      // ✅ successResponse() place les champs dans data.data — l'ID de la
      // commande est data.data.orderId (pas data.data.id).
      if (data.success && data.data?.orderId) {
        setLastOrderRef(data.data.orderId);
        hasCreatedOrderRef.current = true;
        return data.data.orderId;
      } else {
        console.error('❌ Échec création commande:', data.error);
        setError(data.error || 'Erreur lors de la création de la commande');
        return null;
      }
    } catch (err) {
      console.error('❌ Erreur création commande:', err);
      setError('Erreur de connexion au serveur');
      return null;
    }
  };

  // ==================== HOOKS ====================

  // Redirection si non connecté
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account?mode=login&redirect=checkout");
    }
  }, [user, authLoading, router]);

  // Redirection si panier vide
  useEffect(() => {
    if (cart.length === 0 && user) {
      router.push("/cart");
    }
  }, [cart, router, user]);

  // Pré-remplissage
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        email: user.email || "",
        firstName: user.name?.split(' ')[0] || "",
        lastName: user.name?.split(' ').slice(1).join(' ') || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  // Chargement adresses
  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  // Fermeture dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==================== FONCTIONS ====================

  const fetchAddresses = async () => {
    if (!user) return;
    
    setLoadingAddresses(true);
    try {
      const token = localStorage.getItem('adullam_token');
      const res = await apiFetch("/api/user/addresses", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
        
        const defaultAddr = data.addresses?.find((a: any) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setShippingInfo({
            firstName: defaultAddr.firstName,
            lastName: defaultAddr.lastName,
            email: user.email || "",
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            quartier: defaultAddr.quartier || "",
            city: defaultAddr.city,
            postalCode: defaultAddr.postalCode || "",
            country: defaultAddr.country || "CI",
            notes: ""
          });
          
          const country = AFRICAN_COUNTRIES.find(c => c.code === defaultAddr.country);
          if (country) setSelectedCountry(country);
        }
      }
    } catch (error) {
      console.error("Erreur chargement adresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const selectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setShippingInfo({
      firstName: addr.firstName,
      lastName: addr.lastName,
      email: user?.email || "",
      phone: addr.phone,
      address: addr.address,
      quartier: addr.quartier || "",
      city: addr.city,
      postalCode: addr.postalCode || "",
      country: addr.country || "CI",
      notes: ""
    });
    
    const country = AFRICAN_COUNTRIES.find(c => c.code === addr.country);
    if (country) setSelectedCountry(country);
  };

  const handleAddAddress = async () => {
    try {
      const token = localStorage.getItem('adullam_token');
      const res = await apiFetch("/api/user/addresses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses([...addresses, data.address]);
        setSelectedAddressId(data.address.id);
        setShippingInfo({
          firstName: data.address.firstName,
          lastName: data.address.lastName,
          email: user?.email || "",
          phone: data.address.phone,
          address: data.address.address,
          quartier: data.address.quartier || "",
          city: data.address.city,
          postalCode: data.address.postalCode || "",
          country: data.address.country || "CI",
          notes: ""
        });
        setShowNewAddressForm(false);
        setNewAddress({
          firstName: "",
          lastName: "",
          address: "",
          quartier: "",
          city: "",
          postalCode: "",
          country: "CI",
          phone: "",
          isDefault: false
        });
      }
    } catch (error) {
      console.error("Erreur ajout adresse:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCountryChange = (country: typeof AFRICAN_COUNTRIES[0]) => {
    setSelectedCountry(country);
    setShippingInfo(prev => ({ ...prev, country: country.code }));
    setNewAddress(prev => ({ ...prev, country: country.code }));
    setIsCountryDropdownOpen(false);
  };

  const handleIndividualShippingChange = async (variantKey: string, mode: "bateau" | "avion" | "express") => {
    setUpdatingId(variantKey);
    updateShippingMode(variantKey, mode);
    setTimeout(() => setUpdatingId(null), 300);
  };

  const handleGlobalShippingChange = (method: "bateau" | "avion" | "express") => {
    setDefaultShippingMode(method);
    cart.forEach(item => {
      if (item.variantKey) {
        updateShippingMode(item.variantKey, method);
      }
    });
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone, address, quartier, city } = shippingInfo;
    return firstName && lastName && email && phone && address && quartier && city;
  };

  // ✅ VÉRIFICATION MOQ GLOBALE AVANT PAIEMENT
  const validateMOQBeforePayment = (): boolean => {
    const { valid, invalidProducts } = validateCartMOQ(cart);
    
    if (!valid) {
      const errorMsg = `Quantité minimum non atteinte pour : ${invalidProducts.join(", ")}`;
      setError(errorMsg);
      toast.error(errorMsg, {
        duration: 5000,
        position: "top-center",
      });
      return false;
    }
    
    setError("");
    return true;
  };

  const handlePaymentError = (paymentError: string) => {
    console.error('❌ Erreur paiement:', paymentError);
    setError(paymentError);
  };

  const handleApplyCoupon = (coupon: any) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(coupon.discountAmount);
    setError("");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // ==================== LOADING ====================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent)' }} />
      </div>
    );
  }

  // ==================== RENDU ====================
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--surface)" }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="py-4 lg:py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="hidden lg:flex items-center gap-2 text-xs mb-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Accueil</Link>
            <ChevronRight className="w-3 h-3 text-border-strong" />
            <Link href="/cart" className="text-muted-foreground hover:text-foreground">Panier</Link>
            <ChevronRight className="w-3 h-3 text-border-strong" />
            <span className="text-muted-foreground">Checkout</span>
          </div>

          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <button
              onClick={() => router.back()}
              className={`p-2 -ml-2 rounded-lg transition-colors hover:bg-muted`}
            >
              <ArrowLeft className={`w-5 h-5 text-muted-foreground`} />
            </button>
            <h1 className={`text-lg font-medium text-foreground`}>Finaliser la commande</h1>
          </div>

          <h1 className={`hidden lg:block text-2xl font-medium mb-6 text-foreground`}>Finaliser la commande</h1>

          <div className="flex items-center justify-between mb-4 max-w-2xl">
            {[
              { step: 1, label: "Livraison" },
              { step: 2, label: "Expédition" },
              { step: 3, label: "Confirmation" }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: step === item.step ? 1.12 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      step >= item.step ? 'text-white' : 'text-muted-foreground'
                    }`}
                    style={{ background: step >= item.step ? 'var(--accent)' : 'var(--surface)' }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {step > item.step ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        >
                          <Check className="w-3 h-3 lg:w-4 lg:h-4" />
                        </motion.span>
                      ) : (
                        <motion.span key="num" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {item.step}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span className={`text-[10px] lg:text-xs mt-1 text-muted-foreground`}>{item.label}</span>
                </div>
                {index < 2 && (
                  <div className={`w-8 lg:w-12 h-0.5 mx-1 lg:mx-2 relative overflow-hidden rounded-full bg-border`}>
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-accent rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: step > item.step ? "100%" : "0%" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bande de confiance — carrousel horizontal, une seule ligne, visible à chaque étape */}
          <div className="mb-4 max-w-2xl overflow-hidden">
            <div className="marquee">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center gap-6 pr-6 shrink-0">
                  {[
                    { icon: Shield, text: "Paiement sécurisé" },
                    { icon: Truck, text: "Livraison suivie" },
                    { icon: Lock, text: "Données protégées" },
                    { icon: Check, text: "Fournisseur vérifié" },
                    { icon: CreditCard, text: "Mobile Money & carte bancaire" },
                  ].map(({ icon: TrustIcon, text }, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-[11px] lg:text-xs text-muted-foreground whitespace-nowrap">
                      <TrustIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                      {text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Protection Adullam — mêmes engagements que sur la fiche produit, aucune surprise au moment de payer */}
          <div className="rounded-lg p-3 bg-muted shadow-xs space-y-2 mb-6 lg:mb-8 max-w-2xl">
            {[
              { icon: Check, text: "Direct depuis l'usine, sans intermédiaire" },
              { icon: Check, text: "Tous les frais inclus — rien à payer en plus à la livraison" },
              { icon: Shield, text: "Remboursé si votre commande n'arrive pas" },
              { icon: Lock, text: "Paiement sécurisé — Mobile Money & carte bancaire" },
            ].map(({ icon: BulletIcon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08, ease: "easeOut" }}
                className="flex items-start gap-2"
              >
                <BulletIcon className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <span className="text-xs text-foreground">{text}</span>
              </motion.div>
            ))}
          </div>

          {/* Layout Desktop: 2 colonnes */}
          <div className="hidden lg:flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
            
            {/* Contenu avec animation - Desktop */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="desktop-step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="lg:col-span-2 space-y-4"
                >
                  {/* ÉTAPE 1 - LIVRAISON Desktop */}
                  <div className={`rounded-xl border-0 p-4 lg:p-6 bg-card`}>
                    <h2 className={`text-sm lg:text-base font-medium mb-3 lg:mb-4 flex items-center gap-2 text-foreground`}>
                      <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      Adresse de livraison
                    </h2>

                    <div className="mb-3 lg:mb-4">
                      <label className={`block text-xs mb-1 text-muted-foreground`}>Pays</label>
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className={`w-full px-3 py-2.5 flex items-center justify-between text-sm transition-all rounded-lg bg-muted text-foreground`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{selectedCountry.flag}</span>
                            <span className="truncate">{selectedCountry.name}</span>
                            <span className={`text-xs text-muted-foreground hidden sm:inline`}>{selectedCountry.prefix}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isCountryDropdownOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {isCountryDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 overflow-y-auto rounded-lg border-0" style={{ background: 'var(--popover)', boxShadow: 'var(--shadow-lg)', maxHeight: '240px' }}>
                            {AFRICAN_COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                onClick={() => handleCountryChange(country)}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm border-b last:border-0 hover:bg-muted text-foreground border-border`}
                              >
                                <span>{country.flag}</span>
                                <span className="flex-1 truncate">{country.name}</span>
                                <span className={`text-xs text-muted-foreground`}>{country.prefix}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {addresses.length > 0 && !showNewAddressForm && (
                      <div className="mb-3 lg:mb-4">
                        <label className={`block text-xs mb-2 text-muted-foreground`}>Adresse existante</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {addresses
                            .filter(a => a.country === selectedCountry.code)
                            .map((addr) => (
                            <button
                              key={addr.id}
                              onClick={() => selectAddress(addr)}
                              className={`w-full p-3 border rounded-lg text-left transition-all ${
                                selectedAddressId === addr.id
                                  ? 'border-accent bg-accent/5'
                                  : 'border-border hover:border-foreground/20'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                  selectedAddressId === addr.id
                                    ? 'border-accent'
                                    : 'border-border-strong'
                                }`}>
                                  {selectedAddressId === addr.id && (
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                                  )}
                                </div>
                                <div className="text-xs min-w-0 flex-1">
                                  <p className={`font-medium truncate text-foreground`}>{addr.firstName} {addr.lastName}</p>
                                  <p className={`mt-0.5 truncate text-muted-foreground`}>{addr.address}</p>
                                  {addr.quartier && <p className={`truncate text-muted-foreground`}>{addr.quartier}</p>}
                                  <p className={`truncate text-muted-foreground`}>{addr.city}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        <div className="relative my-3 lg:my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t border-border`}></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className={`px-2 bg-card text-muted-foreground`}>ou</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowNewAddressForm(true)}
                          className={`w-full py-2 border border-dashed rounded-lg text-xs transition flex items-center justify-center gap-1 border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground`}
                        >
                          <Plus className="w-3 h-3" />
                          Nouvelle adresse
                        </button>
                      </div>
                    )}

                    {(showNewAddressForm || addresses.length === 0) && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 lg:gap-3">
                          <div>
                            <label className={`block text-xs mb-1 text-muted-foreground`}>Prénom</label>
                            <input
                              type="text"
                              name="firstName"
                              value={showNewAddressForm ? newAddress.firstName : shippingInfo.firstName}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg bg-muted text-foreground border-0`}
                              placeholder="Jean"
                            />
                          </div>
                          <div>
                            <label className={`block text-xs mb-1 text-muted-foreground`}>Nom</label>
                            <input
                              type="text"
                              name="lastName"
                              value={showNewAddressForm ? newAddress.lastName : shippingInfo.lastName}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg bg-muted text-foreground border-0`}
                              placeholder="Dupont"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs mb-1 text-muted-foreground`}>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={shippingInfo.email}
                            onChange={handleInputChange}
                            disabled={!showNewAddressForm}
                            className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 bg-muted text-foreground border-0`}
                            placeholder="jean@exemple.com"
                          />
                        </div>

                        <div>
                          <label className={`block text-xs mb-1 text-muted-foreground`}>Téléphone</label>
                          <div className="flex">
                            <span className={`inline-flex items-center px-3 rounded-l-lg text-xs bg-muted text-muted-foreground`}>
                              {selectedCountry.prefix}
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              value={showNewAddressForm ? newAddress.phone : shippingInfo.phone}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`flex-1 px-3 py-2.5 text-sm focus:outline-none rounded-r-lg bg-muted text-foreground border-0`}
                              placeholder="01 23 45 67"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs mb-1 text-muted-foreground`}>Adresse</label>
                          <input
                            type="text"
                            name="address"
                            value={showNewAddressForm ? newAddress.address : shippingInfo.address}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg bg-muted text-foreground border-0`}
                            placeholder="Rue, numéro"
                          />
                        </div>

                        <div>
                          <label className={`block text-xs mb-1 text-muted-foreground`}>Quartier</label>
                          <input
                            type="text"
                            name="quartier"
                            value={showNewAddressForm ? newAddress.quartier : shippingInfo.quartier}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg bg-muted text-foreground border-0`}
                            placeholder="Quartier / Zone"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 lg:gap-3">
                          <div>
                            <label className={`block text-xs mb-1 text-muted-foreground`}>Ville</label>
                            <input
                              type="text"
                              name="city"
                              value={showNewAddressForm ? newAddress.city : shippingInfo.city}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg bg-muted text-foreground border-0`}
                              placeholder="Ville"
                            />
                          </div>
                          <div>
                            <label className={`block text-xs mb-1 text-muted-foreground`}>Code postal</label>
                            <input
                              type="text"
                              name="postalCode"
                              value={showNewAddressForm ? newAddress.postalCode : shippingInfo.postalCode}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg bg-muted text-foreground border-0`}
                              placeholder="BP"
                            />
                          </div>
                        </div>

                        {showNewAddressForm && (
                          <>
                            <label className={`flex items-center gap-2 text-muted-foreground`}>
                              <input
                                type="checkbox"
                                name="isDefault"
                                checked={newAddress.isDefault}
                                onChange={handleNewAddressChange}
                                className="w-3 h-3 rounded border-gray-300"
                              />
                              <span className="text-xs">Par défaut</span>
                            </label>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={handleAddAddress}
                                className="flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors"
                                style={{ background: 'var(--accent)' }}
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={() => setShowNewAddressForm(false)}
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors border border-border text-foreground hover:bg-muted`}
                              >
                                Annuler
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {!showNewAddressForm && (
                      <button
                        onClick={() => validateStep1() && setStep(2)}
                        disabled={!validateStep1()}
                        className="w-full mt-4 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50"
                        style={{ background: 'var(--accent)' }}
                      >
                        Continuer
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
              
              {step === 2 && (
                <motion.div
                  key="desktop-step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="lg:col-span-2 space-y-4"
                >
                  {/* ÉTAPE 2 - EXPÉDITION Desktop */}
                  <div className={`rounded-xl border-0 p-4 lg:p-6 bg-card`}>
                    <h2 className={`text-sm lg:text-base font-medium mb-3 lg:mb-4 flex items-center gap-2 text-foreground`}>
                      <Truck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      Mode d'expédition par produit
                    </h2>
                    
                    <p className={`text-xs mb-4 text-muted-foreground`}>
                      Choisissez le mode d'expédition pour chaque article.
                    </p>

                    <div className="space-y-4">
                      {cart.map((item) => {
                        const isUpdating = updatingId === item.variantKey;
                        const currentMode = item.shippingMode || defaultShippingMode;
                        const minQty = item.minQuantity || getMinQuantity(item.price);
                        const isBelowMOQ = isProductBelowMOQ(item);
                        
                        return (
                          <div 
                            key={item.variantKey} 
                            className={`rounded-lg p-3 border-0 transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'} bg-muted`}
                            style={isBelowMOQ ? { border: '1px solid var(--accent)' } : {}}
                          >
                            <div className="flex gap-3">
                              <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border bg-card border-border`}>
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name || "Produit"}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium break-words leading-tight text-foreground`}>
                                  {item.name || "Produit"}
                                </p>
                                {(item.color || item.eurSize) && (
                                  <p className={`text-xs mt-0.5 text-muted-foreground`}>
                                    {item.color} {item.eurSize && `• Pointure ${item.eurSize}`}
                                  </p>
                                )}
                                <p className={`text-xs mt-1 text-muted-foreground`}>Quantité: {item.quantity}</p>
                                {isBelowMOQ && (
                                  <span className="text-xs text-red-500 font-medium">⚠️ MOQ: {minQty} min</span>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                              <span className={`text-xs mr-2 text-muted-foreground`}>Expédition:</span>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {SHIPPING_METHODS.map((method) => (
                                  <button
                                    key={method.id}
                                    onClick={() => handleIndividualShippingChange(item.variantKey!, method.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                      currentMode === method.id
                                        ? 'text-white'
                                        : 'bg-card border border-border text-muted-foreground hover:border-foreground/30'
                                    }`}
                                    style={currentMode === method.id ? { background: 'var(--accent)' } : {}}
                                  >
                                    {method.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className={`text-xs mb-2 text-muted-foreground`}>Appliquer le même mode à tous les articles:</p>
                      <div className="flex gap-2 flex-wrap">
                        {SHIPPING_METHODS.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => handleGlobalShippingChange(method.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-muted text-foreground hover:bg-surface-sunken`}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setStep(1)}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors border border-border text-foreground hover:bg-muted`}
                      >
                        Retour
                      </button>
                      <button
                        onClick={async () => {
                          setStep(3);
                          trackInitiateCheckout();
                          await createOrderIfNeeded();
                        }}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ background: 'var(--accent)' }}
                      >
                        Continuer
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {step === 3 && (
                <motion.div
                  key="desktop-step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="lg:col-span-2 space-y-4"
                >
                  {/* ÉTAPE 3 - CONFIRMATION Desktop */}
                  <div className={`rounded-xl border-0 p-4 lg:p-6 bg-card`}>
                    <h2 className={`text-sm lg:text-base font-medium mb-3 lg:mb-4 text-foreground`}>Confirmation</h2>

                    {error && (
                      <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg bg-muted`}>
                        <div className="flex items-center gap-1 mb-2">
                          <Home className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                          <span className={`text-xs font-medium text-foreground`}>Livraison</span>
                        </div>
                        <p className={`text-xs leading-relaxed break-words text-muted-foreground`}>
                          {shippingInfo.firstName} {shippingInfo.lastName}<br />
                          {shippingInfo.address}<br />
                          {shippingInfo.quartier && <>{shippingInfo.quartier}<br /></>}
                          {shippingInfo.city}<br />
                          {shippingInfo.phone}
                        </p>
                      </div>

                      <div className={`p-3 rounded-lg bg-muted`}>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sous-total</span>
                            <span className="text-foreground">{formatPrice(totalUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expédition</span>
                            <span className="text-foreground">{formatPrice(totalShippingUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Porte-à-porte</span>
                            <span className="text-foreground">{formatPrice(totalPortePorteUSD)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Réduction</span>
                              <span>- {formatPrice(discountAmount)}</span>
                            </div>
                          )}
                          <div className={`border-t pt-1.5 mt-1.5 flex justify-between font-medium border-border`}>
                            <span className="text-foreground">Total</span>
                            <span style={{ color: 'var(--accent)' }}>{formatPrice(finalTotal)}</span>
                          </div>
                        </div>
                      </div>

                      <CouponInput
                        onApply={handleApplyCoupon}
                        onRemove={handleRemoveCoupon}
                        appliedCoupon={appliedCoupon}
                        cartTotal={grandTotalUSD}
                        userId={user?.id}
                      />

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setStep(2)}
                          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors border border-border text-foreground hover:bg-muted`}
                        >
                          Retour
                        </button>
                        <PaymentButton
                          email={shippingInfo.email || user?.email || ""}
                          amount={finalTotal}
                          orderId={lastOrderRef}
                          couponCode={appliedCoupon?.code}
                          couponDiscount={discountAmount}
                          onError={handlePaymentError}
                          beforePayment={validateMOQBeforePayment}
                        >
                          Payer {formatPrice(finalTotal)}
                        </PaymentButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop: Résumé à droite */}
            <div className="lg:col-span-1">
              <div className={`rounded-xl border-0 p-4 lg:p-5 sticky lg:top-24 bg-card`}>
                <h2 className={`text-sm font-medium mb-3 flex items-center gap-2 text-foreground`}>
                  <Truck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  Commande ({totalItems})
                </h2>

                <div className="space-y-2 max-h-80 lg:max-h-96 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const truncatedTitle = item.name && item.name.length > 40 
                      ? item.name.substring(0, 40) + "..." 
                      : item.name || "Produit";
                    const shippingMode = item.shippingMode || defaultShippingMode;
                    const minQty = item.minQuantity || getMinQuantity(item.price);
                    const isBelowMOQ = isProductBelowMOQ(item);
                    
                    return (
                      <div key={item.variantKey} className={`flex gap-2 pb-2 border-b border-border last:border-0`}>
                        <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-0 bg-muted`}>
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name || "Produit"}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium break-words leading-tight text-foreground`}>
                            {truncatedTitle}
                            {isBelowMOQ && (
                              <span className="ml-1 text-xs text-red-500">⚠️ MOQ</span>
                            )}
                          </p>
                          {(item.color || item.eurSize) && (
                            <p className={`text-[10px] mt-0.5 break-words text-muted-foreground`}>
                              {item.color} {item.eurSize && `• ${item.eurSize}`}
                            </p>
                          )}
                          <div className="mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground`}>
                              {getShippingLabel(shippingMode)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-[10px] text-muted-foreground`}>x{item.quantity}</span>
                            <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`border-t mt-3 pt-3 space-y-1.5 border-border`}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className={`font-medium text-foreground`}>{formatPrice(totalUSD)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Expédition</span>
                    <span className={`font-medium text-foreground`}>{formatPrice(totalShippingUSD)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Porte-à-porte</span>
                    <span className={`font-medium text-foreground`}>{formatPrice(totalPortePorteUSD)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Réduction</span>
                      <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between text-xs font-medium pt-1.5 border-t border-border`}>
                    <span className="text-foreground">Total</span>
                    <span style={{ color: 'var(--accent)' }}>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className={`flex items-center gap-1.5 text-[10px] text-muted-foreground`}>
                    <Lock className="w-3 h-3" />
                    <span>Paiement sécurisé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Mobile avec animation */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="mobile-step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* ÉTAPE 1 - LIVRAISON Mobile */}
                  <div className={`rounded-xl border-0 p-4 bg-card`}>
                    <h2 className={`text-sm font-medium mb-3 flex items-center gap-2 text-foreground`}>
                      <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      Adresse de livraison
                    </h2>

                    <div className="mb-3">
                      <label className={`block text-xs mb-1 text-muted-foreground`}>Pays</label>
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between text-sm bg-card text-foreground border-border`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{selectedCountry.flag}</span>
                            <span>{selectedCountry.name}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isCountryDropdownOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {isCountryDropdownOpen && (
                          <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto bg-card border-border`}>
                            {AFRICAN_COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                onClick={() => handleCountryChange(country)}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm border-b hover:bg-muted text-foreground border-border`}
                              >
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {addresses.length > 0 && !showNewAddressForm ? (
                      <div>
                        <label className={`block text-xs mb-2 text-muted-foreground`}>Adresse existante</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {addresses
                            .filter(a => a.country === selectedCountry.code)
                            .map((addr) => (
                              <button
                                key={addr.id}
                                onClick={() => selectAddress(addr)}
                                className={`w-full p-3 border rounded-lg text-left transition-all ${
                                  selectedAddressId === addr.id
                                    ? 'border-accent bg-accent/5'
                                    : 'border-border'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                                    selectedAddressId === addr.id ? 'border-accent' : 'border-border-strong'
                                  }`}>
                                    {selectedAddressId === addr.id && (
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                                    )}
                                  </div>
                                  <div className={`text-xs flex-1 text-foreground`}>
                                    <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                                    <p className="text-muted-foreground">{addr.address}</p>
                                    <p className="text-muted-foreground">{addr.city}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                        <button
                          onClick={() => setShowNewAddressForm(true)}
                          className={`w-full mt-3 py-2 border border-dashed rounded-lg text-xs flex items-center justify-center gap-1 border-border text-muted-foreground hover:border-foreground/30`}
                        >
                          <Plus className="w-3 h-3" /> Nouvelle adresse
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} placeholder="Prénom" className={`px-3 py-2 text-sm border rounded-lg bg-card text-foreground border-border`} />
                          <input type="text" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} placeholder="Nom" className={`px-3 py-2 text-sm border rounded-lg bg-card text-foreground border-border`} />
                        </div>
                        <input type="email" name="email" value={shippingInfo.email} onChange={handleInputChange} placeholder="Email" className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground border-border`} />
                        <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} placeholder="Téléphone" className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground border-border`} />
                        <input type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} placeholder="Adresse" className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground border-border`} />
                        <input type="text" name="quartier" value={shippingInfo.quartier} onChange={handleInputChange} placeholder="Quartier" className={`w-full px-3 py-2 text-sm border rounded-lg bg-card text-foreground border-border`} />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} placeholder="Ville" className={`px-3 py-2 text-sm border rounded-lg bg-card text-foreground border-border`} />
                          <input type="text" name="postalCode" value={shippingInfo.postalCode} onChange={handleInputChange} placeholder="Code postal" className={`px-3 py-2 text-sm border rounded-lg bg-card text-foreground border-border`} />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => validateStep1() && setStep(2)}
                      disabled={!validateStep1()}
                      className="w-full mt-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                      style={{ background: 'var(--accent)' }}
                    >
                      Continuer
                    </button>
                  </div>
                </motion.div>
              )}
              
              {step === 2 && (
                <motion.div
                  key="mobile-step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* ÉTAPE 2 - EXPÉDITION Mobile */}
                  <div className={`rounded-xl border-0 p-4 bg-card`}>
                    <h2 className={`text-sm font-medium mb-3 flex items-center gap-2 text-foreground`}>
                      <Truck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      Mode d'expédition par produit
                    </h2>
                    
                    <p className={`text-xs mb-4 text-muted-foreground`}>
                      Choisissez le mode d'expédition pour chaque article.
                    </p>

                    <div className="space-y-4">
                      {cart.map((item) => {
                        const isUpdating = updatingId === item.variantKey;
                        const currentMode = item.shippingMode || defaultShippingMode;
                        const minQty = item.minQuantity || getMinQuantity(item.price);
                        const isBelowMOQ = isProductBelowMOQ(item);
                        
                        return (
                          <div key={item.variantKey} className={`rounded-lg p-3 transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'} bg-muted`}
                          style={isBelowMOQ ? { border: '1px solid var(--accent)' } : {}}>
                            <div className="flex gap-3">
                              <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border bg-card border-border`}>
                                <Image src={item.image || "/placeholder.svg"} alt={item.name || "Produit"} width={48} height={48} className="w-full h-full object-contain p-1" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium break-words leading-tight text-foreground`}>
                                  {item.name || "Produit"}
                                </p>
                                {(item.color || item.eurSize) && (
                                  <p className={`text-xs mt-0.5 text-muted-foreground`}>
                                    {item.color} {item.eurSize && `• ${item.eurSize}`}
                                  </p>
                                )}
                                <p className={`text-xs mt-1 text-muted-foreground`}>Qté: {item.quantity}</p>
                                {isBelowMOQ && (
                                  <span className="text-xs text-red-500 font-medium">⚠️ MOQ: {minQty} min</span>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                              <span className={`text-xs mr-2 text-muted-foreground`}>Expédition:</span>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {SHIPPING_METHODS.map((method) => (
                                  <button
                                    key={method.id}
                                    onClick={() => handleIndividualShippingChange(item.variantKey!, method.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                      currentMode === method.id
                                        ? 'text-white'
                                        : 'bg-card border border-border text-muted-foreground'
                                    }`}
                                    style={currentMode === method.id ? { background: 'var(--accent)' } : {}}
                                  >
                                    {method.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className={`text-xs mb-2 text-muted-foreground`}>Appliquer à tous:</p>
                      <div className="flex gap-2 flex-wrap">
                        {SHIPPING_METHODS.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => handleGlobalShippingChange(method.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground`}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setStep(1)}
                        className={`flex-1 py-2.5 text-sm rounded-lg transition-colors border border-border text-foreground hover:bg-muted`}
                      >
                        Retour
                      </button>
                      <button
                        onClick={async () => {
                          setStep(3);
                          trackInitiateCheckout();
                          await createOrderIfNeeded();
                        }}
                        className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ background: 'var(--accent)' }}
                      >
                        Continuer
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {step === 3 && (
                <motion.div
                  key="mobile-step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* ÉTAPE 3 - CONFIRMATION Mobile */}
                  <div className={`rounded-xl border-0 p-4 bg-card`}>
                    <h2 className={`text-sm font-medium mb-3 text-foreground`}>Confirmation</h2>
                    
                    {error && <div className={`mb-3 p-2 rounded-lg text-xs bg-accent-light text-accent`}>{error}</div>}
                    
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg bg-muted`}>
                        <p className={`text-xs break-words text-muted-foreground`}>
                          {shippingInfo.firstName} {shippingInfo.lastName}<br />
                          {shippingInfo.address}<br />
                          {shippingInfo.quartier && <>{shippingInfo.quartier}<br /></>}
                          {shippingInfo.city}<br />
                          {shippingInfo.phone}
                        </p>
                      </div>

                      <div className={`p-3 rounded-lg bg-muted`}>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sous-total</span>
                            <span className="text-foreground">{formatPrice(totalUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expédition</span>
                            <span className="text-foreground">{formatPrice(totalShippingUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Porte-à-porte</span>
                            <span className="text-foreground">{formatPrice(totalPortePorteUSD)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-xs text-green-600">
                              <span>Réduction</span>
                              <span>- {formatPrice(discountAmount)}</span>
                            </div>
                          )}
                          <div className={`flex justify-between font-bold pt-1 border-t border-border`}>
                            <span className="text-foreground">Total</span>
                            <span style={{ color: 'var(--accent)' }}>{formatPrice(finalTotal)}</span>
                          </div>
                        </div>
                      </div>

                      <CouponInput
                        onApply={handleApplyCoupon}
                        onRemove={handleRemoveCoupon}
                        appliedCoupon={appliedCoupon}
                        cartTotal={grandTotalUSD}
                        userId={user?.id}
                      />

                      <div className="flex gap-2 pt-2">
                        <button onClick={() => setStep(2)} className={`flex-1 py-2 text-sm rounded-lg border border-border text-foreground hover:bg-muted`}>Retour</button>
                        <PaymentButton
                          email={shippingInfo.email || user?.email || ""}
                          amount={finalTotal}
                          orderId={lastOrderRef}
                          couponCode={appliedCoupon?.code}
                          couponDiscount={discountAmount}
                          onError={handlePaymentError}
                          beforePayment={validateMOQBeforePayment}
                        >
                          Payer {formatPrice(finalTotal)}
                        </PaymentButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  );
}