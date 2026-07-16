'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useLocale } from '@/context/LocaleProvider';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter'; // ✅ IMPORT

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
  const { currency } = useLocale();
  const { convertFromUSD, getCurrentRate } = useCurrencyFormatter(); // ✅ Récupérer le taux

  const handlePayment = async () => {
    console.log("💳 PaymentButton - Devise:", currency);
    console.log("💳 PaymentButton - Montant USD:", amount);
    
    setLoading(true);
    try {
      // ✅ Convertir USD → XOF avec le taux exact du checkout
      const amountInXOF = Math.round(convertFromUSD(amount));
      console.log("💳 Montant en XOF:", amountInXOF);

      const payload = {
        email,
        amount: amountInXOF, // ✅ Envoie en XOF
        currency: 'XOF', // ✅ Forcer XOF
        orderId,
        couponCode,
        couponDiscount,
      };
      console.log("💳 Payload GeniusPay:", payload);

      const response = await apiFetch('/api/payment/genius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("💳 Réponse GeniusPay:", data);

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        onError?.(data.error || 'Erreur d\'initialisation du paiement');
      }
    } catch (error) {
      console.error("💳 Erreur:", error);
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