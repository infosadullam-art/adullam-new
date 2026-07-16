// app/payment/failed/page.tsx
'use client';

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { MobileHeader } from "@/components/mobile-header";
import MobileNav from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { XCircle, AlertCircle, ArrowLeft, RefreshCw, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const brandColor = "#2B4F3C";
const softBg = "#F8FAF9";

// Composant séparé qui utilise useSearchParams
function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const refParam = searchParams.get('reference');
    const orderParam = searchParams.get('orderId');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    } else {
      setError("Le paiement n'a pas pu être complété. Veuillez réessayer.");
    }
    
    if (refParam) setReference(refParam);
    if (orderParam) setOrderId(orderParam);
  }, [searchParams]);

  const handleRetry = () => {
    if (orderId) {
      router.push(`/checkout?orderId=${orderId}`);
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: softBg }}>
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="py-6 lg:py-10">
        <div className="max-w-md mx-auto px-4">
          
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center">
            {/* Icône d'erreur */}
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Paiement échoué
            </h1>
            
            <p className="text-gray-500 mb-6">
              {error}
            </p>

            {/* Référence de la transaction (si disponible) */}
            {reference && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Référence de la transaction</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{reference}</p>
              </div>
            )}

            {/* Causes possibles */}
            <div className="text-left mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm font-medium text-amber-800 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                Causes possibles :
              </p>
              <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                <li>Solde insuffisant</li>
                <li>Code OTP incorrect ou expiré</li>
                <li>Problème de connexion réseau</li>
                <li>Transaction annulée par l'utilisateur</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleRetry}
                className="flex-1 h-12 text-white font-medium"
                style={{ background: `linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)` }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer le paiement
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Button>
              </Link>
              <Link href="/cart" className="flex-1">
                <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Voir le panier
                </Button>
              </Link>
            </div>

            {/* Support */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Un problème ? Contactez notre service client : 
                <a href="mailto:infos.adullam@gmail.com" className="text-[#2B4F3C] hover:underline ml-1">
                  infos.adullam@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  );
}

// Page principale avec Suspense boundary
export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: softBg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: brandColor }} />
          <p className="text-sm text-gray-500 mt-3">Chargement...</p>
        </div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}