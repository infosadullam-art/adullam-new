'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const brandColor = "#2B4F3C";
const brandGradient = "linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)";

// Composant séparé qui utilise useSearchParams
function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'geniuspay' | null>(null);

  useEffect(() => {
    // 🔍 Récupérer les paramètres selon le moyen de paiement
    const reference = searchParams.get('reference');      // Paystack
    const trxref = searchParams.get('trxref');            // Paystack
    const transactionId = searchParams.get('transaction_id'); // GeniusPay
    const statusParam = searchParams.get('status');       // GeniusPay
    const referenceParam = searchParams.get('reference'); // GeniusPay (peut être aussi)

    // 🔍 Déterminer le moyen de paiement
    let ref = null;
    let method: 'paystack' | 'geniuspay' | null = null;

    if (reference || trxref) {
      ref = reference || trxref;
      method = 'paystack';
    } else if (transactionId || statusParam) {
      ref = transactionId || referenceParam;
      method = 'geniuspay';
    }

    if (!ref) {
      setStatus('error');
      setMessage('Aucune référence de transaction trouvée');
      return;
    }

    setPaymentMethod(method);

    const verifyPayment = async () => {
      try {
        console.log(`🔍 Vérification paiement ${method} - Réf:`, ref);
        
        // 📡 Appel à l'API de vérification
        const response = await apiFetch(`/api/payment/verify?reference=${ref}&method=${method}`);
        const data = await response.json();

        // ✅ Vérifier le statut (format unifié)
        const isSuccess = data.success && (
          data.status === 'success' || 
          data.status === 'completed' ||
          data.data?.status === 'completed'
        );

        if (isSuccess) {
          setStatus('success');
          setMessage(
            method === 'paystack' 
              ? 'Votre paiement par carte a été confirmé avec succès !'
              : 'Votre paiement Mobile Money a été confirmé avec succès !'
          );

          // ✅ Récupérer l'orderId depuis la réponse (format successResponse)
          const confirmedOrderId = data.orderId || data.data?.metadata?.order_id;
          if (confirmedOrderId) {
            setOrderId(confirmedOrderId);
          }

          // 📊 META TRACKING - Purchase (Pixel navigateur)
          // Même eventId que côté serveur (confirm-order.ts) pour déduplication.
          if (confirmedOrderId && typeof window !== "undefined" && (window as any).fbq) {
            try {
              (window as any).fbq(
                "track",
                "Purchase",
                {
                  currency: data.currency || data.data?.currency || "XOF",
                  value: data.amount || data.data?.amount || 0,
                },
                { eventID: `purchase_${confirmedOrderId}` }
              );
              console.log(`📊 Purchase event envoyé pour la commande ${confirmedOrderId}`);
            } catch (error) {
              console.error('❌ Erreur tracking Purchase:', error);
            }
          }

          // ✅ Redirection vers la page de succès avec l'orderId
          // Utilisation de confirmedOrderId (variable locale) au lieu de orderId (state)
          // pour éviter le bug de fermeture (closure) avec le state React.
          setTimeout(() => {
            if (confirmedOrderId) {
              router.push(`/checkout/success?orderId=${confirmedOrderId}`);
            } else {
              router.push('/account/orders');
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || data.message || 'Le paiement n\'a pas pu être confirmé');
        }
      } catch (error) {
        console.error('❌ Erreur vérification:', error);
        setStatus('error');
        setMessage('Erreur lors de la vérification du paiement');
      }
    };

    verifyPayment();
    // ✅ Suppression de orderId des dépendances pour éviter les re-exécutions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md mx-4 w-full">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${brandColor}10` }}>
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandColor }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Vérification en cours...</h2>
            <p className="text-gray-500">
              {paymentMethod === 'geniuspay' 
                ? 'Confirmation de votre paiement Mobile Money...' 
                : 'Confirmation de votre paiement par carte...'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${brandColor}10` }}>
              <CheckCircle className="h-10 w-10" style={{ color: brandColor }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">✅ Paiement confirmé !</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            {orderId && (
              <p className="text-xs text-gray-400 mb-4">Commande #{orderId}</p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirection en cours...</span>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">❌ Erreur de paiement</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => router.push('/cart')}
              className="w-full px-4 py-3 text-white font-medium rounded-xl transition-all hover:opacity-90"
              style={{ background: brandGradient }}
            >
              Retour au panier
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Page principale avec Suspense boundary
export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md mx-4 w-full">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${brandColor}10` }}>
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandColor }} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Chargement...</h2>
          <p className="text-gray-500">Veuillez patienter</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}