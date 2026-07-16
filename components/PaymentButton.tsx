'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useLocale } from '@/context/LocaleProvider';

type PaymentMethod = 'paystack' | 'geniuspay';

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
  // 🔥 FORCER GeniusPay uniquement
  const method = 'geniuspay';
  const { currency } = useLocale();

  // 🔥 Désactiver Paystack temporairement
  // const isGeniusEnabled = process.env.NEXT_PUBLIC_GENIUS_ENABLED === 'true';
  const isGeniusEnabled = true; // Forcé à true

  const handlePayment = async () => {
    console.log("💳 PaymentButton - Devise:", currency);
    console.log("💳 PaymentButton - Montant USD:", amount);
    console.log("💳 PaymentButton - Méthode:", method);
    
    setLoading(true);
    try {
      // 🔥 Utiliser UNIQUEMENT GeniusPay
      const endpoint = '/api/payment/genius';

      const payload: any = {
        email,
        amount: Math.round(amount * 600), // Conversion USD → XOF
        currency: 'XOF',
        orderId,
        name: email.split('@')[0] || 'Client',
      };

      console.log("💳 Payload GeniusPay:", payload);

      const response = await apiFetch(endpoint, {
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
    <div className="space-y-4">
      {/* Sélection du moyen de paiement - UNIQUEMENT GeniusPay affiché */}
      <div className="grid grid-cols-2 gap-3">
        {/* GeniusPay (visible seulement si activé) */}
        {isGeniusEnabled && (
          <button
            type="button"
            className="px-4 py-3 rounded-xl border-2 border-green-500 bg-green-50 ring-2 ring-green-200 text-left cursor-default col-span-2"
          >
            <div className="font-medium text-gray-800 text-sm">📱 Mobile Money</div>
            <div className="text-xs text-gray-500">GeniusPay</div>
          </button>
        )}
      </div>

      {/* Bouton de paiement */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Traitement...
          </>
        ) : (
          children || `Payer ${amount} ${currency}`
        )}
      </button>

      {/* Indicateur de méthode sélectionnée */}
      <p className="text-xs text-gray-400 text-center">
        📱 Paiement sécurisé par GeniusPay (Mobile Money)
      </p>
    </div>
  );
}