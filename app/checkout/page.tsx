"use client";

import { Header } from "@/components/header";
import { MobileHeader } from "@/components/mobile-header";
import MobileNav from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { 
  ChevronRight, 
  Shield, 
  Lock, 
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Home,
  Truck,
  AlertCircle,
  Plus,
  Ship,
  Zap,
  Check,
  ArrowLeft,
  Menu
} from "lucide-react";
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
import { useTheme } from "@/components/theme-provider";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Couleurs dynamiques
const brandColor = "#D4372B";
const brandGradient = "#D4372B";
const softBg = "#FAFAFA";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? "#0A0A0A" : "#FAFAFA" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#D4372B' }} />
      </div>
    );
  }

  // ==================== RENDU ====================
  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA" }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="py-4 lg:py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="hidden lg:flex items-center gap-2 text-xs mb-6">
            <Link href="/" className={isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}>Accueil</Link>
            <ChevronRight className={isDark ? "w-3 h-3 text-gray-600" : "w-3 h-3 text-gray-300"} />
            <Link href="/cart" className={isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}>Panier</Link>
            <ChevronRight className={isDark ? "w-3 h-3 text-gray-600" : "w-3 h-3 text-gray-300"} />
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Checkout</span>
          </div>

          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <button
              onClick={() => router.back()}
              className={`p-2 -ml-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-white"}`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
            </button>
            <h1 className={`text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Finaliser la commande</h1>
          </div>

          <h1 className={`hidden lg:block text-2xl font-medium mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Finaliser la commande</h1>

          <div className="flex items-center justify-between mb-6 lg:mb-8 max-w-2xl">
            {[
              { step: 1, label: "Livraison" },
              { step: 2, label: "Expédition" },
              { step: 3, label: "Confirmation" }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      step >= item.step ? 'text-white' : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                    style={{ background: step >= item.step ? '#D4372B' : isDark ? '#1A1A1A' : '#F4F4F4' }}
                  >
                    {step > item.step ? <Check className="w-3 h-3 lg:w-4 lg:h-4" /> : item.step}
                  </div>
                  <span className={`text-[10px] lg:text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>{item.label}</span>
                </div>
                {index < 2 && (
                  <div className={`w-8 lg:w-12 h-0.5 mx-1 lg:mx-2 ${
                    step > item.step ? 'bg-[#D4372B]' : isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
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
                  <div className={`rounded-xl border-0 p-4 lg:p-6 ${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
                    <h2 className={`text-sm lg:text-base font-medium mb-3 lg:mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      <MapPin className="w-4 h-4" style={{ color: '#D4372B' }} />
                      Adresse de livraison
                    </h2>

                    <div className="mb-3 lg:mb-4">
                      <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Pays</label>
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className={`w-full px-3 py-2.5 flex items-center justify-between text-sm transition-all rounded-lg ${isDark ? "bg-[#0A0A0A] text-white" : "bg-[#F4F4F4] text-gray-900"}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{selectedCountry.flag}</span>
                            <span className="truncate">{selectedCountry.name}</span>
                            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"} hidden sm:inline`}>{selectedCountry.prefix}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"} transition-transform flex-shrink-0 ${isCountryDropdownOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {isCountryDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 overflow-y-auto rounded-lg border-0" style={{ background: isDark ? '#1A1A1A' : '#fff', boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.08)', maxHeight: '240px' }}>
                            {AFRICAN_COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                onClick={() => handleCountryChange(country)}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm border-b last:border-0 ${isDark ? "hover:bg-white/5 text-gray-300 border-gray-800" : "hover:bg-gray-50 text-gray-900 border-gray-100"}`}
                              >
                                <span>{country.flag}</span>
                                <span className="flex-1 truncate">{country.name}</span>
                                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{country.prefix}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {addresses.length > 0 && !showNewAddressForm && (
                      <div className="mb-3 lg:mb-4">
                        <label className={`block text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Adresse existante</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {addresses
                            .filter(a => a.country === selectedCountry.code)
                            .map((addr) => (
                            <button
                              key={addr.id}
                              onClick={() => selectAddress(addr)}
                              className={`w-full p-3 border rounded-lg text-left transition-all ${
                                selectedAddressId === addr.id
                                  ? 'border-[#D4372B] bg-[#D4372B]/5'
                                  : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-100 hover:border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                  selectedAddressId === addr.id
                                    ? 'border-[#D4372B]'
                                    : isDark ? 'border-gray-600' : 'border-gray-300'
                                }`}>
                                  {selectedAddressId === addr.id && (
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                                  )}
                                </div>
                                <div className="text-xs min-w-0 flex-1">
                                  <p className={`font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{addr.firstName} {addr.lastName}</p>
                                  <p className={`mt-0.5 truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{addr.address}</p>
                                  {addr.quartier && <p className={`truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{addr.quartier}</p>}
                                  <p className={`truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{addr.city}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        <div className="relative my-3 lg:my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className={`px-2 ${isDark ? "bg-[#1A1A1A] text-gray-500" : "bg-white text-gray-400"}`}>ou</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowNewAddressForm(true)}
                          className={`w-full py-2 border border-dashed rounded-lg text-xs transition flex items-center justify-center gap-1 ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
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
                            <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Prénom</label>
                            <input
                              type="text"
                              name="firstName"
                              value={showNewAddressForm ? newAddress.firstName : shippingInfo.firstName}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-0" : "bg-[#F4F4F4] text-gray-900 border-0"}`}
                              placeholder="Jean"
                            />
                          </div>
                          <div>
                            <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Nom</label>
                            <input
                              type="text"
                              name="lastName"
                              value={showNewAddressForm ? newAddress.lastName : shippingInfo.lastName}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-0" : "bg-[#F4F4F4] text-gray-900 border-0"}`}
                              placeholder="Dupont"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={shippingInfo.email}
                            onChange={handleInputChange}
                            disabled={!showNewAddressForm}
                            className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4372B]/20 ${isDark ? "bg-[#0A0A0A] text-white border-0" : "bg-gray-50 text-gray-900 border-0"}`}
                            placeholder="jean@exemple.com"
                          />
                        </div>

                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Téléphone</label>
                          <div className="flex">
                            <span className={`inline-flex items-center px-3 rounded-l-lg text-xs ${isDark ? "bg-[#0A0A0A] text-gray-400" : "bg-gray-50 text-gray-600"}`}>
                              {selectedCountry.prefix}
                            </span>
                            <input
                              type="tel"
                              name="phone"
                              value={showNewAddressForm ? newAddress.phone : shippingInfo.phone}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`flex-1 px-3 py-2.5 text-sm focus:outline-none rounded-r-lg ${isDark ? "bg-[#0A0A0A] text-white border-0" : "bg-[#F4F4F4] text-gray-900 border-0"}`}
                              placeholder="01 23 45 67"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Adresse</label>
                          <input
                            type="text"
                            name="address"
                            value={showNewAddressForm ? newAddress.address : shippingInfo.address}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-0" : "bg-[#F4F4F4] text-gray-900 border-0"}`}
                            placeholder="Rue, numéro"
                          />
                        </div>

                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Quartier</label>
                          <input
                            type="text"
                            name="quartier"
                            value={showNewAddressForm ? newAddress.quartier : shippingInfo.quartier}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-0" : "bg-[#F4F4F4] text-gray-900 border-0"}`}
                            placeholder="Quartier / Zone"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 lg:gap-3">
                          <div>
                            <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ville</label>
                            <input
                              type="text"
                              name="city"
                              value={showNewAddressForm ? newAddress.city : shippingInfo.city}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-0" : "bg-[#F4F4F4] text-gray-900 border-0"}`}
                              placeholder="Ville"
                            />
                          </div>
                          <div>
                            <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Code postal</label>
                            <input
                              type="text"
                              name="postalCode"
                              value={showNewAddressForm ? newAddress.postalCode : shippingInfo.postalCode}
                              onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                              className={`w-full px-3 py-2.5 text-sm focus:outline-none transition-all rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-0" : "bg-[#F4F4F4] text-gray-900 border-0"}`}
                              placeholder="BP"
                            />
                          </div>
                        </div>

                        {showNewAddressForm && (
                          <>
                            <label className={`flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
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
                                style={{ background: '#D4372B' }}
                              >
                                Enregistrer
                              </button>
                              <button
                                onClick={() => setShowNewAddressForm(false)}
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-white/5" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
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
                        style={{ background: '#D4372B' }}
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
                  <div className={`rounded-xl border-0 p-4 lg:p-6 ${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
                    <h2 className={`text-sm lg:text-base font-medium mb-3 lg:mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      <Truck className="w-4 h-4" style={{ color: '#D4372B' }} />
                      Mode d'expédition par produit
                    </h2>
                    
                    <p className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
                            className={`rounded-lg p-3 border-0 transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'} ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}
                            style={isBelowMOQ ? { border: '1px solid #D4372B' } : {}}
                          >
                            <div className="flex gap-3">
                              <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border ${isDark ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-200"}`}>
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name || "Produit"}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium break-words leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                                  {item.name || "Produit"}
                                </p>
                                {(item.color || item.eurSize) && (
                                  <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {item.color} {item.eurSize && `• Pointure ${item.eurSize}`}
                                  </p>
                                )}
                                <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Quantité: {item.quantity}</p>
                                {isBelowMOQ && (
                                  <span className="text-xs text-red-500 font-medium">⚠️ MOQ: {minQty} min</span>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#D4372B' }}>
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t" style={{ borderColor: isDark ? '#2A2A2A' : '#E5E5E5' }}>
                              <span className={`text-xs mr-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Expédition:</span>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {SHIPPING_METHODS.map((method) => (
                                  <button
                                    key={method.id}
                                    onClick={() => handleIndividualShippingChange(item.variantKey!, method.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                      currentMode === method.id
                                        ? 'text-white'
                                        : isDark ? 'bg-[#0A0A0A] border border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                    style={currentMode === method.id ? { background: '#D4372B' } : {}}
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

                    <div className="mt-4 pt-3 border-t" style={{ borderColor: isDark ? '#2A2A2A' : '#E5E5E5' }}>
                      <p className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Appliquer le même mode à tous les articles:</p>
                      <div className="flex gap-2 flex-wrap">
                        {SHIPPING_METHODS.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => handleGlobalShippingChange(method.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDark ? "bg-[#0A0A0A] text-gray-300 hover:bg-white/5" : "bg-[#F4F4F4] text-gray-700 hover:bg-gray-200"}`}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setStep(1)}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? "border border-gray-700 text-gray-300 hover:bg-white/5" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                      >
                        Retour
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ background: '#D4372B' }}
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
                  <div className={`rounded-xl border-0 p-4 lg:p-6 ${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
                    <h2 className={`text-sm lg:text-base font-medium mb-3 lg:mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Confirmation</h2>

                    {error && (
                      <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-xs" style={{ background: isDark ? '#3A0A0A' : '#FFF0F0', border: isDark ? '0.5px solid #5A1A1A' : '0.5px solid #FECACA', color: '#D4372B' }}>
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
                        <div className="flex items-center gap-1 mb-2">
                          <Home className="w-3 h-3" style={{ color: '#D4372B' }} />
                          <span className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Livraison</span>
                        </div>
                        <p className={`text-xs leading-relaxed break-words ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {shippingInfo.firstName} {shippingInfo.lastName}<br />
                          {shippingInfo.address}<br />
                          {shippingInfo.quartier && <>{shippingInfo.quartier}<br /></>}
                          {shippingInfo.city}<br />
                          {shippingInfo.phone}
                        </p>
                      </div>

                      <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Sous-total</span>
                            <span className={isDark ? "text-white" : "text-gray-900"}>{formatPrice(totalUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Expédition</span>
                            <span className={isDark ? "text-white" : "text-gray-900"}>{formatPrice(totalShippingUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Porte-à-porte</span>
                            <span className={isDark ? "text-white" : "text-gray-900"}>{formatPrice(totalPortePorteUSD)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Réduction</span>
                              <span>- {formatPrice(discountAmount)}</span>
                            </div>
                          )}
                          <div className={`border-t pt-1.5 mt-1.5 flex justify-between font-medium ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                            <span className={isDark ? "text-white" : "text-gray-900"}>Total</span>
                            <span style={{ color: '#D4372B' }}>{formatPrice(finalTotal)}</span>
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
                          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? "border border-gray-700 text-gray-300 hover:bg-white/5" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
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
              <div className={`rounded-xl border-0 p-4 lg:p-5 sticky lg:top-24 ${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
                <h2 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  <Truck className="w-4 h-4" style={{ color: '#D4372B' }} />
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
                      <div key={item.variantKey} className={`flex gap-2 pb-2 border-b ${isDark ? "border-gray-800" : "border-gray-100"} last:border-0`}>
                        <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-0 ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name || "Produit"}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium break-words leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                            {truncatedTitle}
                            {isBelowMOQ && (
                              <span className="ml-1 text-xs text-red-500">⚠️ MOQ</span>
                            )}
                          </p>
                          {(item.color || item.eurSize) && (
                            <p className={`text-[10px] mt-0.5 break-words ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                              {item.color} {item.eurSize && `• ${item.eurSize}`}
                            </p>
                          )}
                          <div className="mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? "bg-[#0A0A0A] text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                              {getShippingLabel(shippingMode)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>x{item.quantity}</span>
                            <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#D4372B' }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`border-t mt-3 pt-3 space-y-1.5 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>Sous-total</span>
                    <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{formatPrice(totalUSD)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>Expédition</span>
                    <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{formatPrice(totalShippingUSD)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>Porte-à-porte</span>
                    <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{formatPrice(totalPortePorteUSD)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Réduction</span>
                      <span>- {formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between text-xs font-medium pt-1.5 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                    <span className={isDark ? "text-white" : "text-gray-900"}>Total</span>
                    <span style={{ color: '#D4372B' }}>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t" style={{ borderColor: isDark ? '#2A2A2A' : '#E5E5E5' }}>
                  <div className={`flex items-center gap-1.5 text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
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
                  <div className={`rounded-xl border-0 p-4 ${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
                    <h2 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      <MapPin className="w-4 h-4" style={{ color: '#D4372B' }} />
                      Adresse de livraison
                    </h2>

                    <div className="mb-3">
                      <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Pays</label>
                      <div className="relative" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between text-sm ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{selectedCountry.flag}</span>
                            <span>{selectedCountry.name}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"} transition-transform ${isCountryDropdownOpen ? 'rotate-90' : ''}`} />
                        </button>
                        {isCountryDropdownOpen && (
                          <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${isDark ? "bg-[#1A1A1A] border-gray-700" : "bg-white border-gray-200"}`}>
                            {AFRICAN_COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                onClick={() => handleCountryChange(country)}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm border-b ${isDark ? "hover:bg-white/5 text-gray-300 border-gray-800" : "hover:bg-gray-50 text-gray-900 border-gray-100"}`}
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
                        <label className={`block text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Adresse existante</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {addresses
                            .filter(a => a.country === selectedCountry.code)
                            .map((addr) => (
                              <button
                                key={addr.id}
                                onClick={() => selectAddress(addr)}
                                className={`w-full p-3 border rounded-lg text-left transition-all ${
                                  selectedAddressId === addr.id
                                    ? 'border-[#D4372B] bg-[#D4372B]/5'
                                    : isDark ? 'border-gray-800' : 'border-gray-100'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${
                                    selectedAddressId === addr.id ? 'border-[#D4372B]' : isDark ? 'border-gray-600' : 'border-gray-300'
                                  }`}>
                                    {selectedAddressId === addr.id && (
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                                    )}
                                  </div>
                                  <div className={`text-xs flex-1 ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                                    <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>{addr.address}</p>
                                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>{addr.city}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                        <button
                          onClick={() => setShowNewAddressForm(true)}
                          className={`w-full mt-3 py-2 border border-dashed rounded-lg text-xs flex items-center justify-center gap-1 ${isDark ? "border-gray-700 text-gray-400 hover:border-gray-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                        >
                          <Plus className="w-3 h-3" /> Nouvelle adresse
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} placeholder="Prénom" className={`px-3 py-2 text-sm border rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`} />
                          <input type="text" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} placeholder="Nom" className={`px-3 py-2 text-sm border rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`} />
                        </div>
                        <input type="email" name="email" value={shippingInfo.email} onChange={handleInputChange} placeholder="Email" className={`w-full px-3 py-2 text-sm border rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`} />
                        <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} placeholder="Téléphone" className={`w-full px-3 py-2 text-sm border rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`} />
                        <input type="text" name="address" value={shippingInfo.address} onChange={handleInputChange} placeholder="Adresse" className={`w-full px-3 py-2 text-sm border rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`} />
                        <input type="text" name="quartier" value={shippingInfo.quartier} onChange={handleInputChange} placeholder="Quartier" className={`w-full px-3 py-2 text-sm border rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`} />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} placeholder="Ville" className={`px-3 py-2 text-sm border rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`} />
                          <input type="text" name="postalCode" value={shippingInfo.postalCode} onChange={handleInputChange} placeholder="Code postal" className={`px-3 py-2 text-sm border rounded-lg ${isDark ? "bg-[#0A0A0A] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`} />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => validateStep1() && setStep(2)}
                      disabled={!validateStep1()}
                      className="w-full mt-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                      style={{ background: '#D4372B' }}
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
                  <div className={`rounded-xl border-0 p-4 ${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
                    <h2 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      <Truck className="w-4 h-4" style={{ color: '#D4372B' }} />
                      Mode d'expédition par produit
                    </h2>
                    
                    <p className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Choisissez le mode d'expédition pour chaque article.
                    </p>

                    <div className="space-y-4">
                      {cart.map((item) => {
                        const isUpdating = updatingId === item.variantKey;
                        const currentMode = item.shippingMode || defaultShippingMode;
                        const minQty = item.minQuantity || getMinQuantity(item.price);
                        const isBelowMOQ = isProductBelowMOQ(item);
                        
                        return (
                          <div key={item.variantKey} className={`rounded-lg p-3 transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'} ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}
                          style={isBelowMOQ ? { border: '1px solid #D4372B' } : {}}>
                            <div className="flex gap-3">
                              <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border ${isDark ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-200"}`}>
                                <Image src={item.image || "/placeholder.svg"} alt={item.name || "Produit"} width={48} height={48} className="w-full h-full object-contain p-1" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium break-words leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                                  {item.name || "Produit"}
                                </p>
                                {(item.color || item.eurSize) && (
                                  <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {item.color} {item.eurSize && `• ${item.eurSize}`}
                                  </p>
                                )}
                                <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Qté: {item.quantity}</p>
                                {isBelowMOQ && (
                                  <span className="text-xs text-red-500 font-medium">⚠️ MOQ: {minQty} min</span>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#D4372B' }}>
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t" style={{ borderColor: isDark ? '#2A2A2A' : '#E5E5E5' }}>
                              <span className={`text-xs mr-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Expédition:</span>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {SHIPPING_METHODS.map((method) => (
                                  <button
                                    key={method.id}
                                    onClick={() => handleIndividualShippingChange(item.variantKey!, method.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                      currentMode === method.id
                                        ? 'text-white'
                                        : isDark ? 'bg-[#0A0A0A] border border-gray-700 text-gray-400' : 'bg-white border border-gray-200 text-gray-600'
                                    }`}
                                    style={currentMode === method.id ? { background: '#D4372B' } : {}}
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

                    <div className="mt-4 pt-3 border-t" style={{ borderColor: isDark ? '#2A2A2A' : '#E5E5E5' }}>
                      <p className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Appliquer à tous:</p>
                      <div className="flex gap-2 flex-wrap">
                        {SHIPPING_METHODS.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => handleGlobalShippingChange(method.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? "bg-[#0A0A0A] text-gray-300" : "bg-gray-100 text-gray-600"}`}
                          >
                            {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setStep(1)}
                        className={`flex-1 py-2.5 text-sm rounded-lg transition-colors ${isDark ? "border border-gray-700 text-gray-300 hover:bg-white/5" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                      >
                        Retour
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ background: '#D4372B' }}
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
                  <div className={`rounded-xl border-0 p-4 ${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
                    <h2 className={`text-sm font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Confirmation</h2>
                    
                    {error && <div className={`mb-3 p-2 rounded-lg text-xs ${isDark ? "bg-[#3A0A0A] text-[#D4372B]" : "bg-red-50 text-red-600"}`}>{error}</div>}
                    
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
                        <p className={`text-xs break-words ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          {shippingInfo.firstName} {shippingInfo.lastName}<br />
                          {shippingInfo.address}<br />
                          {shippingInfo.quartier && <>{shippingInfo.quartier}<br /></>}
                          {shippingInfo.city}<br />
                          {shippingInfo.phone}
                        </p>
                      </div>

                      <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Sous-total</span>
                            <span className={isDark ? "text-white" : "text-gray-900"}>{formatPrice(totalUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Expédition</span>
                            <span className={isDark ? "text-white" : "text-gray-900"}>{formatPrice(totalShippingUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={isDark ? "text-gray-400" : "text-gray-500"}>Porte-à-porte</span>
                            <span className={isDark ? "text-white" : "text-gray-900"}>{formatPrice(totalPortePorteUSD)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-xs text-green-600">
                              <span>Réduction</span>
                              <span>- {formatPrice(discountAmount)}</span>
                            </div>
                          )}
                          <div className={`flex justify-between font-bold pt-1 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                            <span className={isDark ? "text-white" : "text-gray-900"}>Total</span>
                            <span style={{ color: '#D4372B' }}>{formatPrice(finalTotal)}</span>
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
                        <button onClick={() => setStep(2)} className={`flex-1 py-2 text-sm rounded-lg ${isDark ? "border border-gray-700 text-gray-300 hover:bg-white/5" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>Retour</button>
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