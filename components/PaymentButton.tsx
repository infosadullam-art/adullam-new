'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useLocale } from '@/context/LocaleProvider';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

interface PaymentButtonProps {
  email: string;
  amount: number; // USD
  orderId?: string;
  couponCode?: string | null;
  couponDiscount?: number; // USD
  onSuccess?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

export function PaymentButton({ 
  email, 
  amount, 
  orderId, 
  couponCode, 
  couponDiscount = 0,
  onSuccess, 
  onError, 
  children 
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  
  // Récupère la devise et le taux
  const { currency } = useLocale();
  const { getCurrentRate } = useCurrencyFormatter();
  
  const rate = getCurrentRate();
  const amountInLocalCurrency = Math.round(amount * rate);
  const discountInLocalCurrency = Math.round(couponDiscount * rate);

  // Logs pour déboguer
  console.log("💳 PaymentButton - Devise:", currency);
  console.log("💳 PaymentButton - Taux:", rate);
  console.log("💳 PaymentButton - Montant USD:", amount);
  console.log("💳 PaymentButton - Montant en " + currency + ":", amountInLocalCurrency);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount: amountInLocalCurrency, // ✅ Conversion en devise locale
          currency, // ✅ Envoie la devise
          orderId,
          couponCode,
          couponDiscount: discountInLocalCurrency,
        }),
      });

      const data = await response.json();

      if (data.success && data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        onError?.(data.error || 'Erreur d\'initialisation du paiement');
      }
    } catch (error) {
      onError?.('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{ background: 'linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)' }}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Traitement...
        </>
      ) : (
        children || 'Payer'
      )}
    </button>
  );
}