import { useLocale } from "@/context/LocaleProvider"

// ============================================
// 💰 TAUX DE CHANGE USD → DEVISES AFRICAINES
// ============================================
const EXCHANGE_RATES: Record<string, number> = {
  // UEMOA (Union Économique et Monétaire Ouest-Africaine)
  XOF: 615.50, XAF: 615.50,  // Franc CFA (même parité que l'euro)
  
  // Afrique Centrale
  CDF: 2850,    // Franc congolais
  
  // Afrique du Nord
  MAD: 10.02,   // Dirham marocain
  TND: 3.12,    // Dinar tunisien
  DZD: 134.50,  // Dinar algérien
  LYD: 4.80,    // Dinar libyen
  EGP: 30.90,   // Livre égyptienne
  
  // Afrique de l'Ouest hors UEMOA
  GNF: 8600,    // Franc guinéen
  RWF: 1310,    // Franc rwandais
  BIF: 2870,    // Franc burundais
  MGA: 4550,    // Ariary malgache
  NGN: 1550,    // Naira nigérian
  GHS: 15.20,   // Cedi ghanéen
  ZAR: 18.40,   // Rand sud-africain
  
  // Autres devises africaines
  KES: 130.50,  // Shilling kenyan
  UGX: 3750,    // Shilling ougandais
  TZS: 2550,    // Shilling tanzanien
  ZMW: 26.80,   // Kwacha zambien
  MWK: 1700,    // Kwacha malawite
  MZN: 64.50,   // Metical mozambicain
  AOA: 830,     // Kwanza angolais
  BWP: 13.60,   // Pula botswanais
  NAD: 18.40,   // Dollar namibien (lié au rand)
  SZL: 18.40,   // Lilangeni swazi (lié au rand)
  LSL: 18.40,   // Loti lesothan (lié au rand)
  MRU: 36.50,   // Ouguiya mauritanien
  CVE: 100.50,  // Escudo cap-verdien
  STN: 22.80,   // Dobra santoméen
  SCR: 13.80,   // Roupie seychelloise
  MUR: 46.20,   // Roupie mauricienne
  KMF: 460,     // Franc comorien
  
  // ✅ AJOUT : Dollar US pour les USA
  USD: 1.00,
}

// ============================================
// 💰 SYMBOLES DES DEVISES
// ============================================
const CURRENCY_SYMBOLS: Record<string, string> = {
  // ✅ CORRECTION : CFA → FCFA
  XOF: "FCFA", XAF: "FCFA",
  
  // Afrique Centrale
  CDF: "FC",
  
  // Afrique du Nord
  MAD: "DH", TND: "DT", DZD: "DA", LYD: "LD", EGP: "E£",
  
  // Afrique de l'Ouest
  GNF: "FG", RWF: "RF", BIF: "FBu", MGA: "Ar",
  NGN: "₦", GHS: "₵", ZAR: "R",
  
  // Afrique de l'Est
  KES: "KSh", UGX: "USh", TZS: "TSh",
  ZMW: "ZK", MWK: "MK", MZN: "MT", AOA: "Kz",
  BWP: "P", NAD: "$", SZL: "E", LSL: "L",
  MRU: "UM", CVE: "$", STN: "Db", SCR: "₨",
  MUR: "₨", KMF: "CF",
  
  // ✅ AJOUT : Symbole Dollar
  USD: "$",
}

// ============================================
// 🎯 DEVISES SANS DÉCIMALES
// ============================================
const NO_DECIMAL_CURRENCIES = [
  "XOF", "XAF", "CDF", "GNF", "RWF", "BIF", 
  "MGA", "NGN", "UGX", "TZS", "KMF", "MRU"
]

// ============================================
// 🎯 HOOK UNIQUE POUR TOUT LE SITE
// ============================================
export const useCurrencyFormatter = () => {
  const { currency, locale } = useLocale()

  // ✅ Sécuriser les valeurs
  const safeCurrency = currency || "XOF"
  const safeLocale = locale || "fr-FR"

  // Convertir USD → devise locale
  const convertFromUSD = (usdAmount: number): number => {
    const rate = EXCHANGE_RATES[safeCurrency] || EXCHANGE_RATES.XOF
    return usdAmount * rate
  }

  // Convertir devise locale → USD (utile pour les calculs)
  const convertToUSD = (localAmount: number): number => {
    const rate = EXCHANGE_RATES[safeCurrency] || EXCHANGE_RATES.XOF
    return localAmount / rate
  }

  // Formater le prix
  const formatPrice = (usdAmount: any) => {
    // ✅ Gestion des valeurs null/undefined
    if (usdAmount === null || usdAmount === undefined) return "—"
    
    const value = Number(usdAmount)
    if (isNaN(value)) return "—"
    
    const convertedValue = convertFromUSD(value)
    const fractionDigits = NO_DECIMAL_CURRENCIES.includes(safeCurrency) ? 0 : 2

    try {
      return new Intl.NumberFormat(safeLocale, {
        style: "currency",
        currency: safeCurrency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }).format(convertedValue)
    } catch (e) {
      // ✅ CORRECTION : Utiliser FCFA au lieu de CFA
      const symbol = safeCurrency === 'XOF' || safeCurrency === 'XAF' ? 'FCFA' : (CURRENCY_SYMBOLS[safeCurrency] || safeCurrency)
      return `${symbol} ${convertedValue.toFixed(fractionDigits)}`
    }
  }

  // Obtenir le symbole de la devise
  const getCurrencySymbol = () => {
    // ✅ CORRECTION : Retourner FCFA au lieu de CFA
    if (safeCurrency === 'XOF' || safeCurrency === 'XAF') {
      return 'FCFA'
    }
    return CURRENCY_SYMBOLS[safeCurrency] || safeCurrency
  }

  // Obtenir le taux de change actuel
  const getCurrentRate = () => {
    return EXCHANGE_RATES[safeCurrency] || EXCHANGE_RATES.XOF
  }

  // Formater sans symbole (pour tableaux, graphiques)
  const formatPriceWithoutSymbol = (usdAmount: any) => {
    if (usdAmount === null || usdAmount === undefined) return "—"
    
    const value = Number(usdAmount)
    if (isNaN(value)) return "—"
    
    const convertedValue = convertFromUSD(value)
    const fractionDigits = NO_DECIMAL_CURRENCIES.includes(safeCurrency) ? 0 : 2
    
    try {
      return new Intl.NumberFormat(safeLocale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }).format(convertedValue)
    } catch (e) {
      return convertedValue.toFixed(fractionDigits)
    }
  }

  // Formater avec le symbole après (ex: "5000 FCFA")
  const formatPriceWithSymbolAfter = (usdAmount: any) => {
    const formatted = formatPriceWithoutSymbol(usdAmount)
    const symbol = getCurrencySymbol()
    return `${formatted} ${symbol}`
  }

  return {
    formatPrice,
    getCurrencySymbol,
    getCurrentRate,
    formatPriceWithoutSymbol,
    formatPriceWithSymbolAfter,
    convertFromUSD,
    convertToUSD,
    currency: safeCurrency,
    locale: safeLocale
  }
}