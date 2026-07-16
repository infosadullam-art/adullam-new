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
  const [method, setMethod] = useState<PaymentMethod>('paystack');
  const { currency } = useLocale();

  // Vérifier si GeniusPay est activé (depuis Vercel)
  const isGeniusEnabled = process.env.NEXT_PUBLIC_GENIUS_ENABLED === 'true';

  const handlePayment = async () => {
    console.log("💳 PaymentButton - Devise:", currency);
    console.log("💳 PaymentButton - Montant USD:", amount);
    console.log("💳 PaymentButton - Méthode:", method);
    
    setLoading(true);
    try {
      // Choisir le bon endpoint selon la méthode
      const endpoint = method === 'paystack' 
        ? '/api/payment/initialize' 
        : '/api/payment/genius';

      const payload: any = {
        email,
        amount, // Envoie en USD (Paystack gère la conversion)
        currency, // XOF, NGN, GHS, etc.
        orderId,
        couponCode,
        couponDiscount,
      };

      // Pour GeniusPay, on ajoute le nom et la devise en XOF
      if (method === 'geniuspay') {
        payload.name = email.split('@')[0] || 'Client';
        payload.currency = 'XOF'; // GeniusPay travaille en XOF
        // On convertit le montant USD en XOF (taux approximatif 1 USD = 600 XOF)
        payload.amount = Math.round(amount * 600);
        delete payload.couponCode;
        delete payload.couponDiscount;
      }

      console.log("💳 Payload complet:", payload);

      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("💳 Réponse API:", data);

      if (data.success && data.checkoutUrl) {
        // Rediriger vers la page de paiement (Paystack ou GeniusPay)
        window.location.href = data.checkoutUrl;
      } else if (data.success && data.authorization_url) {
        // Pour Paystack (ancien format)
        window.location.href = data.authorization_url;
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
      {/* Sélection du moyen de paiement */}
      <div className="grid grid-cols-2 gap-3">
        {/* Paystack */}
        <button
          type="button"
          onClick={() => setMethod('paystack')}
          className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
            method === 'paystack' 
              ? 'border-[#2B4F3C] bg-[#2B4F3C]/5 ring-2 ring-[#2B4F3C]/20' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-medium text-gray-800 text-sm">💳 Carte</div>
          <div className="text-xs text-gray-500">Paystack</div>
        </button>

        {/* GeniusPay (visible seulement si activé) */}
        {isGeniusEnabled && (
          <button
            type="button"
            onClick={() => setMethod('geniuspay')}
            className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
              method === 'geniuspay' 
                ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
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
        style={{ background: method === 'geniuspay' 
          ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' 
          : 'linear-gradient(135deg, #2B4F3C 0%, #3A6B4E 100%)' 
        }}
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
        {method === 'paystack' 
          ? '🔒 Paiement sécurisé par Paystack (Carte)' 
          : '📱 Paiement sécurisé par GeniusPay (Mobile Money)'
        }
      </p>
    </div>
  );
}