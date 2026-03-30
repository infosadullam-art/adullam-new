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

// Couleurs dynamiques
const brandColor = "#2B4F3C";
const brandGradient = "linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)";
const softBg = "#F8FAF9";

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

  // États
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "orange" | "wave" | "visa" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // États pour sauvegarder les données de la commande
  const [lastOrderTotal, setLastOrderTotal] = useState<number>(0);
  const [lastOrderRef, setLastOrderRef] = useState<string>("");

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
    if (cart.length === 0 && !isSuccess && user) {
      router.push("/cart");
    }
  }, [cart, router, isSuccess, user]);

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
      const res = await fetch("/api/user/addresses", {
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

  const handleAddAddress = async () => {
    try {
      const token = localStorage.getItem('adullam_token');
      const res = await fetch("/api/user/addresses", {
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
    // Mettre à jour tous les articles existants
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

  const handleSubmit = async () => {
    if (!paymentMethod) return;
    
    setIsProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem('adullam_token');
      
      const orderTotal = grandTotalUSD;
      setLastOrderTotal(orderTotal);
      
      const orderItems = cart.map(item => ({
        variantKey: item.variantKey,
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        shippingMode: item.shippingMode || defaultShippingMode,
        shippingCost: item.shippingCostUSD || 0,
        portePorteCost: item.portePorteCostUSD || 0,
        totalWeight: item.totalWeight || 0,
        color: item.color,
        eurSize: item.eurSize,
        image: item.image
      }));
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          shippingInfo: {
            ...shippingInfo,
            country: selectedCountry.name,
            countryCode: selectedCountry.code
          },
          paymentMethod,
          totals: { 
            totalUSD, 
            shippingCost: totalShippingUSD, 
            portePorteTotal: totalPortePorteUSD, 
            grandTotal: orderTotal 
          },
          country: selectedCountry.code,
          currency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la commande");
      }

      if (data.reference) {
        setLastOrderRef(data.reference);
      } else if (data.orderId) {
        setLastOrderRef(data.orderId.slice(-8));
      }

      setIsSuccess(true);
      clearCart();
      
    } catch (error: any) {
      console.error("Erreur:", error);
      setError(error.message || "Une erreur est survenue");
    } finally {
      setIsProcessing(false);
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

  const getShippingLabel = (mode: string) => {
    const method = SHIPPING_METHODS.find(m => m.id === mode);
    return method?.label || mode;
  };

  const getShippingName = (mode: string) => {
    const method = SHIPPING_METHODS.find(m => m.id === mode);
    return method?.name || mode;
  };

  // ==================== LOADING ====================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandColor }} />
      </div>
    );
  }

  // ==================== SUCCÈS ====================
  if (isSuccess) {
    const displayTotal = lastOrderTotal || grandTotalUSD;
    const displayRef = lastOrderRef || Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return (
      <div className="min-h-screen" style={{ backgroundColor: softBg }}>
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        
        <main className="py-8 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${brandColor}10` }}>
                <svg className="w-8 h-8" style={{ color: brandColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-lg font-medium mb-2">Commande confirmée</h2>
              <p className="text-sm text-gray-500 mb-6">
                Merci pour votre commande. Un email de confirmation vous a été envoyé.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-gray-500 mb-2">Récapitulatif</p>
                <p className="text-sm font-medium">#{displayRef}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium" style={{ color: brandColor }}>
                    {formatPrice(displayTotal)}
                  </span>
                </div>
              </div>
              
              <Link
                href="/account/orders"
                className="inline-block w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ background: brandGradient }}
              >
                Voir mes commandes
              </Link>
            </div>
          </div>
        </main>
        
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    );
  }

  // ==================== CHECKOUT ====================
  return (
    <div className="min-h-screen" style={{ backgroundColor: softBg }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="py-4 lg:py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="hidden lg:flex items-center gap-2 text-xs mb-6">
            <Link href="/" className="text-gray-400 hover:text-gray-600">Accueil</Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <Link href="/cart" className="text-gray-400 hover:text-gray-600">Panier</Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-600">Checkout</span>
          </div>

          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-medium">Finaliser la commande</h1>
          </div>

          <h1 className="hidden lg:block text-2xl font-medium mb-6">Finaliser la commande</h1>

          <div className="flex items-center justify-between mb-6 lg:mb-8 max-w-2xl">
            {[
              { step: 1, label: "Livraison" },
              { step: 2, label: "Expédition" },
              { step: 3, label: "Paiement" },
              { step: 4, label: "Confirmation" }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      step >= item.step 
                        ? 'text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    style={step >= item.step ? { background: brandGradient } : {}}
                  >
                    {step > item.step ? <Check className="w-3 h-3 lg:w-4 lg:h-4" /> : item.step}
                  </div>
                  <span className="text-[10px] lg:text-xs mt-1 text-gray-500">{item.label}</span>
                </div>
                {index < 3 && (
                  <div className={`w-8 lg:w-12 h-0.5 mx-1 lg:mx-2 ${
                    step > item.step ? 'bg-[#2B4F3C]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
            
            <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
              
              {/* ÉTAPE 1 - LIVRAISON */}
              {step === 1 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6">
                  <h2 className="text-sm lg:text-base font-medium mb-3 lg:mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: brandColor }} />
                    Adresse de livraison
                  </h2>

                  <div className="mb-3 lg:mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Pays</label>
                    <div className="relative" ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white flex items-center justify-between text-sm hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{selectedCountry.flag}</span>
                          <span className="truncate">{selectedCountry.name}</span>
                          <span className="text-xs text-gray-400 hidden sm:inline">{selectedCountry.prefix}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isCountryDropdownOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {isCountryDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {AFRICAN_COUNTRIES.map((country) => (
                            <button
                              key={country.code}
                              onClick={() => handleCountryChange(country)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm border-b last:border-0"
                            >
                              <span>{country.flag}</span>
                              <span className="flex-1 truncate">{country.name}</span>
                              <span className="text-xs text-gray-400">{country.prefix}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {addresses.length > 0 && !showNewAddressForm && (
                    <div className="mb-3 lg:mb-4">
                      <label className="block text-xs text-gray-500 mb-2">Adresse existante</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {addresses
                          .filter(a => a.country === selectedCountry.code)
                          .map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => selectAddress(addr)}
                            className={`w-full p-3 border rounded-lg text-left transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-[#2B4F3C] bg-[#2B4F3C]/5'
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                selectedAddressId === addr.id
                                  ? 'border-[#2B4F3C]'
                                  : 'border-gray-300'
                              }`}>
                                {selectedAddressId === addr.id && (
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                                )}
                              </div>
                              <div className="text-xs min-w-0 flex-1">
                                <p className="font-medium truncate">{addr.firstName} {addr.lastName}</p>
                                <p className="text-gray-500 mt-0.5 truncate">{addr.address}</p>
                                {addr.quartier && <p className="text-gray-500 truncate">{addr.quartier}</p>}
                                <p className="text-gray-500 truncate">{addr.city}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      <div className="relative my-3 lg:my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white text-gray-400">ou</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:border-gray-300 hover:text-gray-700 transition flex items-center justify-center gap-1"
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
                          <label className="block text-xs text-gray-500 mb-1">Prénom</label>
                          <input
                            type="text"
                            name="firstName"
                            value={showNewAddressForm ? newAddress.firstName : shippingInfo.firstName}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4F3C]/20"
                            placeholder="Jean"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Nom</label>
                          <input
                            type="text"
                            name="lastName"
                            value={showNewAddressForm ? newAddress.lastName : shippingInfo.lastName}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4F3C]/20"
                            placeholder="Dupont"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={shippingInfo.email}
                          onChange={handleInputChange}
                          disabled={!showNewAddressForm}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4F3C]/20 bg-gray-50"
                          placeholder="jean@exemple.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-xs text-gray-600">
                            {selectedCountry.prefix}
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={showNewAddressForm ? newAddress.phone : shippingInfo.phone}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#2B4F3C]/20"
                            placeholder="01 23 45 67"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Adresse</label>
                        <input
                          type="text"
                          name="address"
                          value={showNewAddressForm ? newAddress.address : shippingInfo.address}
                          onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4F3C]/20"
                          placeholder="Rue, numéro"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Quartier</label>
                        <input
                          type="text"
                          name="quartier"
                          value={showNewAddressForm ? newAddress.quartier : shippingInfo.quartier}
                          onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4F3C]/20"
                          placeholder="Quartier / Zone"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Ville</label>
                          <input
                            type="text"
                            name="city"
                            value={showNewAddressForm ? newAddress.city : shippingInfo.city}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4F3C]/20"
                            placeholder="Ville"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Code postal</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={showNewAddressForm ? newAddress.postalCode : shippingInfo.postalCode}
                            onChange={showNewAddressForm ? handleNewAddressChange : handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B4F3C]/20"
                            placeholder="BP"
                          />
                        </div>
                      </div>

                      {showNewAddressForm && (
                        <>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="isDefault"
                              checked={newAddress.isDefault}
                              onChange={handleNewAddressChange}
                              className="w-3 h-3 rounded border-gray-300"
                            />
                            <span className="text-xs text-gray-600">Par défaut</span>
                          </label>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={handleAddAddress}
                              className="flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors"
                              style={{ background: brandGradient }}
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setShowNewAddressForm(false)}
                              className="flex-1 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                      style={{ background: brandGradient }}
                    >
                      Continuer
                    </button>
                  )}
                </div>
              )}

              {/* ÉTAPE 2 - EXPÉDITION AVEC CHOIX INDIVIDUEL PAR PRODUIT */}
              {step === 2 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6">
                  <h2 className="text-sm lg:text-base font-medium mb-3 lg:mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4" style={{ color: brandColor }} />
                    Mode d'expédition par produit
                  </h2>
                  
                  <p className="text-xs text-gray-500 mb-4">
                    Choisissez le mode d'expédition pour chaque article.
                  </p>

                  <div className="space-y-4">
                    {cart.map((item) => {
                      const isUpdating = updatingId === item.variantKey;
                      const truncatedTitle = item.name && item.name.length > 50 
                        ? item.name.substring(0, 50) + "..." 
                        : item.name || "Produit";
                      const currentMode = item.shippingMode || defaultShippingMode;
                      
                      return (
                        <div 
                          key={item.variantKey} 
                          className={`bg-gray-50 rounded-lg p-3 border border-gray-100 transition-opacity ${isUpdating ? 'opacity-50' : 'opacity-100'}`}
                        >
                          {/* Image et titre */}
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name || "Produit"}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{truncatedTitle}</p>
                              {(item.color || item.eurSize) && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.color} {item.eurSize && `• Pointure ${item.eurSize}`}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">Quantité: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold" style={{ color: brandColor }}>
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>

                          {/* Sélecteur de mode d'expédition */}
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500 mr-2">Expédition:</span>
                            <div className="flex gap-2 mt-1">
                              {SHIPPING_METHODS.map((method) => (
                                <button
                                  key={method.id}
                                  onClick={() => handleIndividualShippingChange(item.variantKey!, method.id as any)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    currentMode === method.id
                                      ? 'text-white'
                                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                  }`}
                                  style={currentMode === method.id ? { background: brandGradient } : {}}
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

                  {/* Bouton pour appliquer à tous */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Appliquer le même mode à tous les articles:</p>
                    <div className="flex gap-2">
                      {SHIPPING_METHODS.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => handleGlobalShippingChange(method.id as any)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                      style={{ background: brandGradient }}
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 - PAIEMENT */}
              {step === 3 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6">
                  <h2 className="text-sm lg:text-base font-medium mb-3 lg:mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" style={{ color: brandColor }} />
                    Mode de paiement
                  </h2>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {[
                      { id: 'mtn', name: 'MTN Money', icon: '📱', color: '#F5A623' },
                      { id: 'orange', name: 'Orange Money', icon: '📱', color: '#FF7900' },
                      { id: 'wave', name: 'Wave', icon: '🌊', color: '#2D9CDB' },
                      { id: 'visa', name: 'Carte bancaire', icon: '💳', color: '#5E6AD2' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`w-full p-3 border rounded-lg flex items-center gap-3 transition-all ${
                          paymentMethod === method.id
                            ? 'border-[#2B4F3C] bg-[#2B4F3C]/5' 
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                          style={{ backgroundColor: `${method.color}20`, color: method.color }}
                        >
                          {method.icon}
                        </div>
                        <span className="flex-1 text-sm text-left truncate">{method.name}</span>
                        {paymentMethod === method.id && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: brandColor }}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      Paiement sécurisé
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      onClick={() => paymentMethod && setStep(4)}
                      disabled={!paymentMethod}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                      style={{ background: brandGradient }}
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 - CONFIRMATION */}
              {step === 4 && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-6">
                  <h2 className="text-sm lg:text-base font-medium mb-3 lg:mb-4">Confirmation</h2>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1 mb-2">
                        <Home className="w-3 h-3" style={{ color: brandColor }} />
                        <span className="text-xs font-medium">Livraison</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed break-words">
                        {shippingInfo.firstName} {shippingInfo.lastName}<br />
                        {shippingInfo.address}<br />
                        {shippingInfo.quartier && <>{shippingInfo.quartier}<br /></>}
                        {shippingInfo.city}<br />
                        {shippingInfo.phone}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sous-total</span>
                          <span>{formatPrice(totalUSD)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expédition</span>
                          <span>{formatPrice(totalShippingUSD)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Porte-à-porte</span>
                          <span>{formatPrice(totalPortePorteUSD)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-1.5 mt-1.5 flex justify-between font-medium">
                          <span>Total</span>
                          <span style={{ color: brandColor }}>{formatPrice(grandTotalUSD)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: brandGradient }}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Traitement...</span>
                          </>
                        ) : (
                          'Confirmer'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-xl border border-gray-100 p-4 lg:p-5 sticky lg:top-24">
                <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" style={{ color: brandColor }} />
                  Commande ({totalItems})
                </h2>

                {/* RÉSUMÉ - UNIQUEMENT AFFICHAGE DU MODE CHOISI (PAS DE BOUTONS) */}
                <div className="space-y-2 max-h-60 lg:max-h-80 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const truncatedTitle = item.name && item.name.length > 40 
                      ? item.name.substring(0, 40) + "..." 
                      : item.name || "Produit";
                    
                    const shippingMode = item.shippingMode || defaultShippingMode;
                    
                    return (
                      <div key={item.variantKey} className="flex gap-2 pb-2 border-b border-gray-100 last:border-0">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name || "Produit"}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{truncatedTitle}</p>
                          {(item.color || item.eurSize) && (
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                              {item.color} {item.eurSize && `• ${item.eurSize}`}
                            </p>
                          )}
                          {/* AFFICHAGE DU MODE CHOISI (SANS BOUTONS) */}
                          <div className="mt-1">
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {getShippingLabel(shippingMode)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-gray-400">x{item.quantity}</span>
                            <span className="text-xs font-medium" style={{ color: brandColor }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Sous-total</span>
                    <span className="font-medium">{formatPrice(totalUSD)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Expédition</span>
                    <span className="font-medium">{formatPrice(totalShippingUSD)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Porte-à-porte</span>
                    <span className="font-medium">{formatPrice(totalPortePorteUSD)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium pt-1.5 border-t border-gray-100">
                    <span>Total</span>
                    <span style={{ color: brandColor }}>{formatPrice(grandTotalUSD)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span>Paiement sécurisé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  );
}