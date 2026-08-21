"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/admin/auth-context"
import { useTheme } from "@/components/theme-provider"
import { useLocale } from "@/context/LocaleProvider"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import MobileNav from "@/components/mobile-nav"
import { toast } from "sonner"
import { Loader2, Send, Mail, Clock, CheckCircle, Phone } from "lucide-react"

export default function ContactPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  const { country } = useLocale()
  const isDark = theme === "dark"
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    orderNumber: "",
  })

  // Mapping pays -> indicatif téléphonique
  const getCountryCode = (countryCode: string): string => {
    const codes: Record<string, string> = {
      'CI': '+225', // Côte d'Ivoire
      'SN': '+221', // Sénégal
      'CM': '+237', // Cameroun
      'BF': '+226', // Burkina Faso
      'ML': '+223', // Mali
      'GN': '+224', // Guinée
      'TG': '+228', // Togo
      'BJ': '+229', // Bénin
      'NE': '+227', // Niger
      'GH': '+233', // Ghana
      'NG': '+234', // Nigeria
      'CD': '+243', // RDC
      'CG': '+242', // Congo
      'GA': '+241', // Gabon
      'CF': '+236', // Centrafrique
      'TD': '+235', // Tchad
      'BJ': '+229', // Bénin
      'MA': '+212', // Maroc
      'DZ': '+213', // Algérie
      'TN': '+216', // Tunisie
      'LY': '+218', // Libye
      'EG': '+20',  // Égypte
      'ZA': '+27',  // Afrique du Sud
      'KE': '+254', // Kenya
      'TZ': '+255', // Tanzanie
      'UG': '+256', // Ouganda
      'RW': '+250', // Rwanda
      'ET': '+251', // Éthiopie
      'US': '+1',   // USA
      'FR': '+33',  // France
      'GB': '+44',  // Royaume-Uni
      'DE': '+49',  // Allemagne
      'IT': '+39',  // Italie
      'ES': '+34',  // Espagne
      'PT': '+351', // Portugal
      'BE': '+32',  // Belgique
      'CH': '+41',  // Suisse
      'CA': '+1',   // Canada
    }
    return codes[countryCode] || '+225' // Par défaut Côte d'Ivoire
  }

  const countryCode = getCountryCode(country)

  // Remplir automatiquement les champs si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch("https://api.adullamarket.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user?.id || null,
          userEmail: user?.email || formData.email,
          country: country,
          countryCode: countryCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success("Votre message a été envoyé avec succès !")
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          subject: "",
          message: "",
          orderNumber: "",
        })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        toast.error(data.error || "Erreur lors de l'envoi du message")
      }
    } catch (error) {
      console.error("Erreur envoi message:", error)
      toast.error("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="max-w-4xl mx-auto px-4 py-8 lg:py-12 pb-20 lg:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Nous contacter</h1>
          <p className="text-muted-foreground">
            Une question ? Une suggestion ? N'hésitez pas à nous écrire, nous vous répondrons sous 24h.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message envoyé !</h3>
                  <p className="text-muted-foreground">
                    Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4372B]/20 transition-all"
                        placeholder="Jean Dupont"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4372B]/20 transition-all"
                        placeholder="vous@exemple.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>
                      Téléphone (optionnel)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 text-sm" style={{ background: isDark ? "#0A0A0A" : "#F4F4F4", color: isDark ? "#AAAAAA" : "#666666", borderColor: isDark ? "#2A2A2A" : "#ECECEC" }}>
                        {countryCode}
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2.5 rounded-r-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4372B]/20 transition-all"
                        placeholder="01 23 45 67 89"
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Indicatif automatique selon votre pays ({country})
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>
                      Sujet
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4372B]/20 transition-all"
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="commande">Question sur une commande</option>
                      <option value="livraison">Problème de livraison</option>
                      <option value="produit">Question sur un produit</option>
                      <option value="compte">Problème de compte</option>
                      <option value="retour">Retour / Remboursement</option>
                      <option value="partenariat">Partenariat</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>
                      Numéro de commande (optionnel)
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4372B]/20 transition-all"
                      placeholder="ex: #20260820-xxxxx"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#DDDDDD" : "#0A0A0A" }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4372B]/20 transition-all resize-none"
                      placeholder="Décrivez votre demande en détail..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#D4372B" }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Infos contact */}
          <div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
              <h2 className="text-lg font-semibold">Informations</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-0.5" style={{ color: "#D4372B" }} />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">contact@adullamarket.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-0.5" style={{ color: "#D4372B" }} />
                  <div>
                    <p className="text-sm font-medium">Délai de réponse</p>
                    <p className="text-sm text-muted-foreground">Sous 24h ouvrées</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="rounded-xl p-4" style={{ background: isDark ? "#1A1A1A" : "#F4F4F4" }}>
                  <p className="text-sm font-medium mb-1">💡 Astuce</p>
                  <p className="text-sm text-muted-foreground">
                    Pour une réponse plus rapide, indiquez votre numéro de commande et le produit concerné.
                  </p>
                </div>
              </div>

              {user && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Connecté en tant que {user.name || user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  )
}