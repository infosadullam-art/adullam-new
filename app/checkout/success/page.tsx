"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { MobileHeader } from "@/components/mobile-header";
import MobileNav from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { CheckCircle2, Package, MapPin, Calendar, Truck, Clock, Loader2, ArrowLeft, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

const brandColor = "#2B4F3C";
const softBg = "#F8FAF9";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCurrencyFormatter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderId = searchParams.get('orderId');
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!orderId && !reference) {
      router.push('/account/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('adullam_token');
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError("Commande non trouvée");
        }
      } catch (err) {
        setError("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId, reference, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: softBg }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: brandColor }} />
          <p className="text-sm text-gray-500">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: softBg }}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 mb-6">{error || "Commande non trouvée"}</p>
          <Link href="/account/orders">
            <Button className="w-full" style={{ background: `linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)` }}>
              Voir mes commandes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calcul de la date de livraison estimée
  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + 15);
  const estimatedDelivery = estimatedDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const shippingInfo = order.shippingInfo || {};
  const address = `${shippingInfo.address || ''}${shippingInfo.quartier ? `, ${shippingInfo.quartier}` : ''}, ${shippingInfo.city || ''}`;
  const itemCount = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'CONFIRMED': 'Confirmée',
      'PROCESSING': 'En préparation',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: softBg }}>
      {/* Header */}
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="py-6 lg:py-10">
        <div className="max-w-2xl mx-auto px-4">
          
          {/* Bouton retour */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {/* Carte de succès */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${brandColor}10` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: brandColor }} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Merci pour votre commande !</h1>
            <p className="text-gray-500 mb-6">
              Votre commande a été confirmée et sera traitée dans les plus brefs délais.
            </p>
            <div className="inline-flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Numéro de commande</span>
              <span className="text-lg lg:text-xl font-bold mt-1" style={{ color: brandColor }}>{order.orderNumber}</span>
            </div>
          </div>

          {/* Détails de la commande */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Package className="w-5 h-5" style={{ color: brandColor }} />
              Détails de la commande
            </h2>
            
            <div className="space-y-4">
              {/* Statut */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                  <Clock className="w-4 h-4" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Statut</p>
                  <p className="text-sm text-gray-500">{getStatusText(order.status)}</p>
                </div>
              </div>

              {/* Date de commande */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                  <Calendar className="w-4 h-4" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Date de commande</p>
                  <p className="text-sm text-gray-500">{orderDate}</p>
                </div>
              </div>

              {/* Livraison estimée */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                  <Truck className="w-4 h-4" style={{ color: brandColor }} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Livraison estimée</p>
                  <p className="text-sm text-gray-500">{estimatedDelivery}</p>
                </div>
              </div>

              {/* Adresse de livraison */}
              {address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}10` }}>
                    <MapPin className="w-4 h-4" style={{ color: brandColor }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Adresse de livraison</p>
                    <p className="text-sm text-gray-500">{address}</p>
                    <p className="text-sm text-gray-500">{shippingInfo.country || "Côte d'Ivoire"}</p>
                    {shippingInfo.phone && (
                      <p className="text-sm text-gray-500 mt-1">📞 {shippingInfo.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" style={{ color: brandColor }} />
              Récapitulatif
            </h2>

            {/* Articles */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                    {item.variantSummary && (
                      <p className="text-xs text-gray-400">{item.variantSummary}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Quantité: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                <span className="text-gray-700">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Livraison</span>
                <span className="text-gray-700">{formatPrice(order.shippingCost)}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">🎫 Réduction ({order.couponCode})</span>
                  <span className="text-green-600">- {formatPrice(order.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl" style={{ color: brandColor }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </Link>
            <Link href="/account/orders" className="flex-1">
              <Button className="w-full h-12 text-white font-medium" style={{ background: `linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)` }}>
                <Package className="w-4 h-4 mr-2" />
                Voir mes commandes
              </Button>
            </Link>
          </div>

          {/* Message de confirmation email */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Un email de confirmation vous a été envoyé à {order.user?.email || shippingInfo.email}
          </p>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  );
}