'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  email: string;
  amount: number;
  orderId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

export function PaymentButton({ email, amount, orderId, onSuccess, onError, children }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount,
          metadata: { order_id: orderId },
        }),
      });

      const data = await response.json();

      if (data.success && data.authorization_url) {
        window.location.href = data.authorization_url;
        onSuccess?.();
      } else {
        onError?.(data.error || 'Erreur d\'initialisation');
      }
    } catch (error) {
      onError?.('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement...
        </>
      ) : (
        children || 'Payer avec Paystack'
      )}
    </button>
  );
}