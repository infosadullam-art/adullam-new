'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Composant séparé qui utilise useSearchParams
function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

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
          setTimeout(() => {
            router.push('/orders');
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
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Vérification en cours...</h2>
            <p className="text-gray-600">Veuillez patienter</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Paiement confirmé !</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirection vers vos commandes...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur de paiement</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/cart')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}