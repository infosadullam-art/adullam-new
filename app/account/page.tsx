"use client"

import { useState, useEffect, useRef } from "react"

// ════════════════════════════════════════════════════════════
// ICÔNES — dessinées maison, même trait (1.6, jonctions arrondies)
// que le reste du site. Noms identiques aux imports lucide
// d'origine : aucune des utilisations plus bas n'est à modifier.
// ════════════════════════════════════════════════════════════
type IconProps = { className?: string; style?: React.CSSProperties }

function Home({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M4.5 11.2 12 4.6l7.5 6.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.8V19a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function Star({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} style={style}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function ShoppingCart({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M7.2 8.2h9.6l.9 11.3a1.6 1.6 0 0 1-1.6 1.7H7.9a1.6 1.6 0 0 1-1.6-1.7l.9-11.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8.2V6.6a3 3 0 0 1 6 0v1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ShoppingBag({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M7 8h10l1 12.5a1.5 1.5 0 0 1-1.5 1.5H7.5A1.5 1.5 0 0 1 6 20.5L7 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function HelpCircle({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.6 9.4a2.4 2.4 0 0 1 4.65.8c0 1.6-2.05 1.8-2.05 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.15" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function User({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="8.2" r="3.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.2 19.8c0-3.6 3-6.1 6.8-6.1s6.8 2.5 6.8 6.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function LogOut({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M11.5 4.5h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.2 8.3l3.7 3.7-3.7 3.7M17.7 12H7.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Mail({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Phone({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path
        d="M6.6 3.5 9 5.9c.4.4.5 1 .2 1.5L7.9 9.7a12.5 12.5 0 0 0 6.4 6.4l2.3-1.3c.5-.3 1.1-.2 1.5.2l2.4 2.4c.5.5.5 1.4-.1 1.8-1.1.9-2.7 1.6-4.4 1.2C10.7 19.3 4.7 13.3 3.8 8c-.4-1.7.3-3.3 1.2-4.4.4-.6 1.3-.6 1.8-.1Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  )
}

function MapPin({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 21.5s-7-6.3-7-11.7a7 7 0 1 1 14 0c0 5.4-7 11.7-7 11.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="9.8" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function Package({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M3.6 8.4L12 4l8.4 4.4v7.2L12 20l-8.4-4.4V8.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.6 8.4L12 12.6l8.4-4.2M12 12.6V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function Heart({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 20s-7.3-4.5-9.4-9.2C1.2 7 3.1 4 6.4 4c2 0 3.4 1.1 5.6 4 2.2-2.9 3.6-4 5.6-4 3.3 0 5.2 3 3.9 6.6C19.3 15.5 12 20 12 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AlertCircle({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.6v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.1" r="0.15" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function Eye({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EyeOff({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M3.5 3.5l17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.6 5.6c.45-.07.92-.1 1.4-.1 6 0 9.5 6.5 9.5 6.5a15 15 0 0 1-3.3 4M6.6 6.9C4 8.7 2.5 12 2.5 12S6 18.5 12 18.5c1.15 0 2.2-.2 3.15-.55" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.7 13.9a2.6 2.6 0 0 0 3.6-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ArrowLeft({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Shield({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 3.6 19 6.4v5.3c0 4.4-3 7.4-7 8.7-4-1.3-7-4.3-7-8.7V6.4L12 3.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function CheckCircle({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.7 12.3l2.1 2.1 4.3-4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Clock({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.6V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Lock({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Key({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="7.5" cy="15.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.2 12.8 19 4l1.5 1.5-2 2 1.5 1.5-2 2-1.5-1.5-2.4 2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Smartphone({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 18.3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MailCheck({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 16l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Info({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="8.1" r="0.15" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  )
}

function Plus({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

import Image from "next/image"
import { useAuth } from "@/lib/admin/auth-context"
import { FcGoogle } from "react-icons/fc"
import { FaFacebook, FaApple } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { ordersApi, addressesApi, wishlistApi } from "@/lib/admin/api-client"
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter"
import Link from "next/link"

// Logo
const Logo = () => {
  
  return (
    <div className="flex items-center">
      <span style={{ fontWeight: 900, fontSize: "24px", letterSpacing: "-0.04em", color: 'var(--foreground)' }}>
        adul<span style={{ color: "var(--accent)" }}>.</span>lam
      </span>
    </div>
  )
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function AccountPage() {
  const router = useRouter()
  const { user, login, register, logout, isLoading: authLoading } = useAuth()
  const { formatPrice } = useCurrencyFormatter()

  // États principaux
  const [isLogged, setIsLogged] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // États pour les données utilisateur
  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState({
    orders: false,
    wishlist: false,
    addresses: false
  })

  // Couleurs de la marque
  const brandColor = "var(--accent)"
  const brandLight = "var(--accent-light)"

  // ============================================================
  // ÉTATS POUR L'AUTHENTIFICATION
  // ============================================================
  const [step, setStep] = useState<"login" | "register" | "verify">("login")
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationCode: ""
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const [attempts, setAttempts] = useState(0)
  const [blockedUntil, setBlockedUntil] = useState<Date | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const csrfToken = useRef(generateCSRFToken())

  // ============================================================
  // CHARGEMENT DES DONNÉES UTILISATEUR
  // ============================================================
  useEffect(() => {
    if (user) {
      setIsLogged(true)
      fetchUserData()
    } else {
      setIsLogged(false)
    }
  }, [user])

  const fetchUserData = async () => {
    setLoading(prev => ({ ...prev, orders: true }))
    try {
      const response = await ordersApi.list()
      if (response.success) {
        setOrders(response.data || [])
      }
    } catch (error) {
      console.error("Erreur chargement commandes:", error)
    } finally {
      setLoading(prev => ({ ...prev, orders: false }))
    }

    setLoading(prev => ({ ...prev, wishlist: true }))
    try {
      const response = await wishlistApi.list()
      if (response.success) {
        setWishlist(response.data || [])
      }
    } catch (error) {
      console.error("Erreur chargement wishlist:", error)
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }))
    }

    setLoading(prev => ({ ...prev, addresses: true }))
    try {
      const response = await addressesApi.list()
      if (response.success) {
        setAddresses(response.addresses || [])
      }
    } catch (error) {
      console.error("Erreur chargement adresses:", error)
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }))
    }
  }

  // ============================================================
  // FONCTIONS DE SÉCURITÉ
  // ============================================================
  const checkRateLimit = (): boolean => {
    if (blockedUntil && new Date() < blockedUntil) {
      const minutes = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000)
      setError(`Trop de tentatives. Réessayez dans ${minutes} minute(s)`)
      return false
    }
    
    if (attempts >= 3) {
      const blockTime = new Date(Date.now() + 15 * 60000)
      setBlockedUntil(blockTime)
      setError("Trop de tentatives. Compte bloqué 15 minutes.")
      return false
    }
    
    return true
  }

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: "Minimum 8 caractères" }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: "Au moins une majuscule" }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: "Au moins un chiffre" }
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { valid: false, message: "Au moins un caractère spécial" }
    }
    return { valid: true, message: "Mot de passe valide" }
  }

  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>]/g, '')
  }

  // ============================================================
  // GESTION DU FORMULAIRE
  // ============================================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: sanitizeInput(value) }))
    setError("")
  }

  const handleSendCode = async () => {
    if (!checkRateLimit()) return

    setIsSubmitting(true)
    setError("")
    
    try {
      let identifier = loginMethod === "email" ? formData.email : formData.phone
      
      if (!identifier) {
        setError(`${loginMethod === "email" ? "Email" : "Téléphone"} requis`)
        setIsSubmitting(false)
        return
      }

      if (loginMethod === "email") {
        identifier = identifier.toLowerCase().trim()
      } else {
        identifier = identifier.replace(/\s/g, '')
      }

      const res = await fetch("https://api.adullamarket.com/api/auth/send-code", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, method: loginMethod })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(`Code envoyé à ${identifier}`)
        setStep("verify")
        setAttempts(0)
        
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || "Erreur lors de l'envoi")
        setAttempts(prev => prev + 1)
      }
    } catch (err) {
      setError("Erreur de connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkRateLimit()) return
    
    const formCsrf = (e.target as any).csrf?.value
    if (formCsrf !== csrfToken.current) {
      setError("Erreur de sécurité. Rafraîchissez la page.")
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (step === "login") {
        let identifier = loginMethod === "email" ? formData.email : formData.phone
        
        if (!identifier || !formData.password) {
          setError("Tous les champs sont requis")
          setIsSubmitting(false)
          return
        }

        if (loginMethod === "email") {
          identifier = identifier.toLowerCase().trim()
        } else {
          identifier = identifier.replace(/\s/g, '')
        }

        await login(identifier, formData.password)
        setAttempts(0)
        
      } else if (step === "register") {
        if (!formData.name || !formData.password || !formData.confirmPassword) {
          setError("Tous les champs sont requis")
          setIsSubmitting(false)
          return
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Les mots de passe ne correspondent pas")
          setIsSubmitting(false)
          return
        }

        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.valid) {
          setError(passwordValidation.message)
          setIsSubmitting(false)
          return
        }

        await handleSendCode()
        
      } else if (step === "verify") {
        if (!formData.verificationCode || formData.verificationCode.length !== 6) {
          setError("Code à 6 chiffres requis")
          setIsSubmitting(false)
          return
        }

        let identifier = loginMethod === "email" ? formData.email : formData.phone
        
        if (loginMethod === "email") {
          identifier = identifier.toLowerCase().trim()
        } else {
          identifier = identifier.replace(/\s/g, '')
        }

        const res = await fetch("https://api.adullamarket.com/api/auth/verify-code", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, code: formData.verificationCode })
        })

        const data = await res.json()

        if (data.success) {
          await register(formData.name, identifier, formData.password)
          setSuccess("Compte créé avec succès !")
          setTimeout(() => router.push("/account"), 2000)
        } else {
          setError(data.error || "Code invalide")
          setAttempts(prev => prev + 1)
        }
      }
    } catch (error: any) {
      console.error("❌ Erreur:", error)
      setError(error.message || "Une erreur est survenue")
      setAttempts(prev => prev + 1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsLogged(false)
    router.push("/")
  }

  // ============================================================
  // GESTION DES ADRESSES
  // ============================================================
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return
    
    try {
      const response = await addressesApi.delete(id)
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Adresse supprimée avec succès")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur suppression adresse:", error)
      setError("Erreur lors de la suppression")
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const response = await addressesApi.update(id, { isDefault: true })
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Adresse par défaut mise à jour")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error("Erreur mise à jour adresse:", error)
    }
  }

  // ============================================================
  // GESTION DE LA WISHLIST
  // ============================================================
  const handleRemoveFromWishlist = async (id: string) => {
    if (!confirm("Voulez-vous retirer ce produit de votre liste de souhaits ?")) return
    
    try {
      const response = await wishlistApi.remove(id)
      
      if (response.success) {
        await fetchUserData()
        setSuccess("Produit retiré de la wishlist")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error("Erreur suppression wishlist:", error)
      setError("Erreur lors de la suppression")
    }
  }

  // ============================================================
  // UTILS
  // ============================================================
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      "PENDING": "Paiement en attente",
      "CONFIRMED": "Confirmée",
      "PROCESSING": "En cours",
      "SHIPPED": "Expédiée",
      "DELIVERED": "Livrée",
      "CANCELLED": "Annulée"
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      "PENDING": "bg-yellow-50 text-yellow-700",
      "CONFIRMED": "bg-blue-50 text-blue-700",
      "PROCESSING": "bg-purple-50 text-purple-700",
      "SHIPPED": "bg-indigo-50 text-indigo-700",
      "DELIVERED": "bg-green-50 text-green-700",
      "CANCELLED": "bg-red-50 text-red-700"
    }
    return colorMap[status] || "bg-gray-50 text-gray-700"
  }

  // ============================================================
  // PAGE DE CONNEXION/INSCRIPTION
  // ============================================================
  if (!isLogged) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface)' }}>
        <div className="max-w-md w-full">
          
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            
            <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                  {step === "login" && "Connexion"}
                  {step === "register" && "Inscription"}
                  {step === "verify" && "Vérification"}
                </h2>
                {step !== "login" && (
                  <button
                    onClick={() => {
                      setStep("login")
                      setError("")
                      setSuccess("")
                    }}
                    className="text-xs hover:text-gray-700"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Retour
                  </button>
                )}
              </div>
            </div>

            <div className="p-5">
              
              {step !== "verify" && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setLoginMethod("email")}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                      loginMethod === "email"
                        ? "text-white"
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    style={loginMethod === "email" ? { background: "var(--accent)" } : { background: 'var(--surface)' }}
                  >
                    <Mail className="w-3 h-3 inline mr-1.5" />
                    Email
                  </button>
                  <button
                    onClick={() => setLoginMethod("phone")}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                      loginMethod === "phone"
                        ? "text-white"
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    style={loginMethod === "phone" ? { background: "var(--accent)" } : { background: 'var(--surface)' }}
                  >
                    <Phone className="w-3 h-3 inline mr-1.5" />
                    Téléphone
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-md flex items-start gap-2" style={{ background: 'var(--accent-light)', border: 'none' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                  <p className="text-xs" style={{ color: 'var(--accent)' }}>{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-md flex items-start gap-2" style={{ background: '#22C55E1A', border: 'none' }}>
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                  <p className="text-xs" style={{ color: '#22C55E' }}>{success}</p>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                
                <input type="hidden" name="csrf" value={csrfToken.current} />

                {step !== "verify" && (
                  <>
                    {step === "register" && (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                          Nom complet
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          placeholder="Jean Dupont"
                          required
                        />
                      </div>
                    )}

                    {loginMethod === "email" ? (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                          Adresse email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          placeholder="vous@exemple.com"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                          Numéro de téléphone
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 text-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                            +225
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 text-sm rounded-r-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', borderLeft: "none", color: 'var(--foreground)' }}
                            placeholder="01 23 45 67 89"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20 pr-9"
                          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {step === "register" && (
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                          Confirmer le mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20 pr-9"
                            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full text-white font-medium py-2 px-4 rounded-md text-sm transition-all disabled:opacity-50"
                      style={{ background: "var(--accent)" }}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Chargement...
                        </span>
                      ) : (
                        step === "login" ? "Se connecter" : "Créer mon compte"
                      )}
                    </button>
                  </>
                )}

                {step === "verify" && (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: '#22C55E1A' }}>
                        <MailCheck className="w-4 h-4" style={{ color: '#22C55E' }} />
                      </div>
                      <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>
                        Vérification
                      </h3>
                      <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                        Code envoyé à {loginMethod === "email" ? formData.email : formData.phone}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        Code de vérification
                      </label>
                      <input
                        type="text"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                          setFormData(prev => ({ ...prev, verificationCode: value }))
                        }}
                        className="w-full px-3 py-2 text-center text-base tracking-[0.3em] font-mono rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20"
                        style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>

                    {countdown > 0 ? (
                      <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                        Renvoyer dans {countdown}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendCode}
                        className="w-full text-xs hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Renvoyer le code
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || formData.verificationCode.length !== 6}
                      className="w-full text-white font-medium py-2 px-4 rounded-md text-sm transition-all disabled:opacity-50 mt-2"
                      style={{ background: "var(--accent)" }}
                    >
                      {isSubmitting ? "Vérification..." : "Vérifier et créer mon compte"}
                    </button>
                  </>
                )}
              </form>

              {step !== "verify" && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3" style={{ background: 'var(--card)', color: 'var(--muted-foreground)' }}>Ou</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: FcGoogle, label: "Google", color: "" },
                      { icon: FaFacebook, label: "Facebook", color: '#3B82F6' },
                      { icon: FaApple, label: "Apple", color: "" }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => alert("Connexion bientôt disponible")}
                        className="flex items-center justify-center py-2 px-3 border rounded-md opacity-50 cursor-not-allowed"
                        style={{ borderColor: 'var(--border)' }}
                        disabled
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step !== "verify" && (
                <p className="text-xs text-center mt-4" style={{ color: 'var(--muted-foreground)' }}>
                  {step === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
                  <button
                    onClick={() => {
                      setStep(step === "login" ? "register" : "login")
                      setError("")
                      setSuccess("")
                    }}
                    className="font-medium hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    {step === "login" ? "Inscrivez-vous" : "Connectez-vous"}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // DASHBOARD UTILISATEUR (après connexion)
  // ============================================================
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <header className="sticky top-0 z-10 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-block">
                <Logo />
              </Link>
              <div className="h-5 w-px" style={{ background: 'var(--border)' }}></div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{user?.name || user?.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                  <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border-strong)' }}></span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">Vérifié</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex gap-1 overflow-x-auto py-2">
              {[
                { id: "dashboard", label: "Dashboard", icon: Home },
                { id: "orders", label: "Commandes", icon: ShoppingCart, count: orders.length },
                { id: "wishlist", label: "Favoris", icon: Heart, count: wishlist.length },
                { id: "addresses", label: "Adresses", icon: MapPin, count: addresses.length },
                { id: "security", label: "Sécurité", icon: Shield },
                { id: "help", label: "Aide", icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${
                      isActive
                        ? "text-white"
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    style={isActive ? { background: "var(--accent)" } : {  }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: isActive ? "rgba(255,255,255,0.2)" : 'var(--border)', color: isActive ? "#fff" : 'var(--muted-foreground)' }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Bonjour, {user?.name?.split(' ')[0] || user?.email} !
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Bienvenue dans votre espace personnel</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Commandes", value: orders.length, icon: ShoppingCart, color: "blue" },
                { label: "Favoris", value: wishlist.length, icon: Heart, color: "red" },
                { label: "Adresses", value: addresses.length, icon: MapPin, color: "green" },
                { label: "Livrées", value: orders.filter(o => o.status === "DELIVERED").length, icon: Package, color: "purple" }
              ].map((stat, index) => (
                <div key={index} className="p-4 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 bg-${stat.color}-50 rounded-md flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {orders.length > 0 && (
              <div className="rounded-lg border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Dernières commandes</h2>
                <div className="space-y-2">
                  {orders.slice(0, 3).map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors"
                      style={{ background: 'var(--surface)' }}
                      onClick={() => router.push(`/account/orders/${order.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Commande #{order.orderNumber}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--border-strong)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Mes commandes</h2>
            {loading.orders ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--accent)" }}></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-4 rounded-lg border cursor-pointer transition-shadow hover:shadow-sm"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Commande #{order.orderNumber}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{formatPrice(order.total)}</span>
                      <button className="px-3 py-1.5 text-white text-xs rounded-md transition-colors" style={{ background: "var(--accent)" }}>
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>Aucune commande pour le moment</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-4 py-1.5 text-white text-sm rounded-md transition-colors mt-2"
                  style={{ background: "var(--accent)" }}
                >
                  Découvrir nos produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Ma liste de souhaits</h2>
            {loading.wishlist ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--accent)" }}></div>
              </div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {wishlist.map((item) => {
                  const productId = item.product?.id || item.productId
                  const productName = item.product?.name || item.productName || "Produit"
                  const productImage = item.product?.images?.[0]
                  const productPrice = item.product?.price || item.price || 0
                  
                  return (
                    <div key={item.id} className="p-3 rounded-lg border group relative" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        style={{ background: 'var(--card)' }}
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      </button>
                      <div 
                        className="aspect-square rounded-md mb-2 flex items-center justify-center overflow-hidden cursor-pointer"
                        style={{ background: 'var(--surface)' }}
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        {productImage ? (
                          <Image 
                            src={productImage} 
                            alt={productName} 
                            width={120} 
                            height={120} 
                            className="object-cover group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <Package className="w-8 h-8" style={{ color: 'var(--border-strong)' }} />
                        )}
                      </div>
                      <h3 
                        className="text-xs font-medium mb-1 line-clamp-2 cursor-pointer"
                        style={{ color: 'var(--foreground)' }}
                        onClick={() => router.push(`/products/${productId}`)}
                      >
                        {productName}
                      </h3>
                      <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                        {formatPrice(productPrice)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>Votre wishlist est vide</p>
                <button 
                  onClick={() => router.push("/products")}
                  className="px-4 py-1.5 text-white text-sm rounded-md transition-colors mt-2"
                  style={{ background: "var(--accent)" }}
                >
                  Explorer les produits
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Mes adresses</h2>
              <button 
                onClick={() => router.push("/account/addresses")}
                className="px-3 py-1.5 text-white text-xs rounded-md transition-colors flex items-center gap-1"
                style={{ background: "var(--accent)" }}
              >
                <Plus className="w-3 h-3" />
                Ajouter
              </button>
            </div>
            {loading.addresses ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: "var(--accent)" }}></div>
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {addresses.map((address) => (
                  <div key={address.id} className="p-4 rounded-lg border relative" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    {address.isDefault && (
                      <span className="absolute top-3 right-3 px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'var(--surface)', color: 'var(--muted-foreground)' }}>
                        Par défaut
                      </span>
                    )}
                    <div className="flex items-start gap-2 mb-3">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                        <MapPin className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{address.firstName} {address.lastName}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{address.address}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{address.city}, {address.country}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{address.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <button onClick={() => router.push(`/account/addresses?edit=${address.id}`)} className="text-xs hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                        Modifier
                      </button>
                      {!address.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(address.id)} className="text-xs hover:underline" style={{ color: 'var(--muted-foreground)' }}>
                          Définir par défaut
                        </button>
                      )}
                      <button onClick={() => handleDeleteAddress(address.id)} className="text-xs hover:underline" style={{ color: "var(--accent)" }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <MapPin className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>Aucune adresse enregistrée</p>
                <button 
                  onClick={() => router.push("/account/addresses")}
                  className="px-4 py-1.5 text-white text-sm rounded-md transition-colors mt-2"
                  style={{ background: "var(--accent)" }}
                >
                  Ajouter une adresse
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-xl">
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Paramètres de sécurité</h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#3B82F61A' }}>
                      <Lock className="w-4 h-4" style={{ color: '#3B82F6' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Mot de passe</h3>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Dernière modification il y a 30 jours</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 border rounded-md text-xs transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                    Modifier
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mot de passe fort</span>
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: '#22C55E1A' }}>
                      <Smartphone className="w-4 h-4" style={{ color: '#22C55E' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Authentification à 2 facteurs</h3>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Protection supplémentaire</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-white text-xs rounded-md transition-colors" style={{ background: "var(--accent)" }}>
                    Activer
                  </button>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Protégez votre compte avec une vérification en deux étapes</p>
              </div>

              <div className="p-4 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>Sessions actives</h3>
                <div className="p-3 rounded-md" style={{ background: 'var(--surface)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--border)' }}>
                        <Smartphone className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>Appareil actuel</p>
                        <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Dernière activité: il y a quelques minutes</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-green-600">Session actuelle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="max-w-xl">
            <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Centre d'aide</h2>
            
            <div className="rounded-lg border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <form className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                    Sujet
                  </label>
                  <select className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20" style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <option>Problème de commande</option>
                    <option>Problème de livraison</option>
                    <option>Question sur un produit</option>
                    <option>Problème de compte</option>
                    <option>Autre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    placeholder="Décrivez votre problème..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white text-sm rounded-md transition-colors font-medium"
                  style={{ background: "var(--accent)" }}
                >
                  Envoyer
                </button>
              </form>

              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Questions fréquentes</h3>
                <div className="space-y-1.5">
                  <button className="text-xs hover:underline block" style={{ color: 'var(--muted-foreground)' }}>
                    • Comment suivre ma commande ?
                  </button>
                  <button className="text-xs hover:underline block" style={{ color: 'var(--muted-foreground)' }}>
                    • Délais de livraison moyens
                  </button>
                  <button className="text-xs hover:underline block" style={{ color: 'var(--muted-foreground)' }}>
                    • Politique de retour
                  </button>
                  <button className="text-xs hover:underline block" style={{ color: 'var(--muted-foreground)' }}>
                    • Comment modifier mon adresse ?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}