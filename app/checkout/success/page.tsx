import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { CheckCircle2, Package, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  const orderNumber = "ADM-2024-0001234"
  const estimatedDelivery = "25-27 Décembre 2024"

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* Mobile/Tablet Header */}
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="pb-20 lg:pb-8">
        <div className="max-w-[800px] mx-auto px-4 lg:px-6 py-8 lg:py-12">
          {/* Success Message */}
          <div className="bg-white rounded-lg p-8 lg:p-12 text-center shadow-sm mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Commande confirmée!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Merci pour votre achat. Votre commande a été enregistrée avec succès.
            </p>
            <div className="inline-block bg-neutral-light px-6 py-3 rounded-lg">
              <span className="text-sm text-muted-foreground">Numéro de commande</span>
              <div className="text-xl font-bold text-brand mt-1">{orderNumber}</div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-6">Détails de la commande</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Package className="w-6 h-6 text-brand flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold mb-1">Statut de la commande</div>
                  <p className="text-sm text-muted-foreground">Votre commande est en cours de préparation</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Calendar className="w-6 h-6 text-brand flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold mb-1">Livraison estimée</div>
                  <p className="text-sm text-muted-foreground">{estimatedDelivery}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-brand flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold mb-1">Adresse de livraison</div>
                  <p className="text-sm text-muted-foreground">
                    Cocody, Rue des Jardins, Villa 45
                    <br />
                    Abidjan, Côte d'Ivoire
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-6 lg:p-8 shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>
            <div className="space-y-3 pb-4 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total (3 articles)</span>
                <span className="font-medium">34,300 XOF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-medium">2,000 XOF</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-bold">Total payé</span>
              <span className="text-2xl font-bold text-brand">36,300 XOF</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-12 bg-transparent">
                Retour à l'accueil
              </Button>
            </Link>
            <Link href="/orders" className="flex-1">
              <Button className="w-full bg-brand hover:bg-brand-hover text-white h-12 text-base font-semibold">
                Voir mes commandes
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile/Tablet Only: Sticky Bottom Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
