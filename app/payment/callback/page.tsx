'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const brandColor = "#2B4F3C";
const brandGradient = "linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)";

// Composant séparé qui utilise useSearchParams
function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    if (!reference && !trxref) {
      setStatus('error');
      setMessage('Aucune référence de transaction trouvée');
      return;
    }

    const verifyPayment = async () => {
      try {
        const ref = reference || trxref;
        const response = await fetch(`/api/payment/verify?reference=${ref}`);
        const data = await response.json();

        if (data.success && data.status === 'success') {
          setStatus('success');
          setMessage('Votre paiement a été confirmé avec succès !');
          
          // Récupérer l'ID de commande depuis la réponse
          if (data.orderId) {
            setOrderId(data.orderId);
          }
          
          setTimeout(() => {
            if (orderId) {
              router.push(`/checkout/success?orderId=${orderId}`);
            } else {
              router.push('/account/orders');
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Le paiement n\'a pas pu être confirmé');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur lors de la vérification du paiement');
      }
    };

    verifyPayment();
  }, [searchParams, router, orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md mx-4 w-full">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${brandColor}10` }}>
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandColor }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Vérification en cours...</h2>
            <p className="text-gray-500">Veuillez patienter pendant que nous vérifions votre paiement</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${brandColor}10` }}>
              <CheckCircle className="h-10 w-10" style={{ color: brandColor }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Paiement confirmé !</h2>
            <p className="text-gray-500 mb-6">{message}</p>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de paiement</h2>
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