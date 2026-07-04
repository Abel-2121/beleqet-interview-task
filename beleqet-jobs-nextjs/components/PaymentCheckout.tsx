'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AlertCircle, Loader, CreditCard } from 'lucide-react';

interface PaymentCheckoutProps {
  gigId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/** Escrow payment checkout card with amount display, processing states, and Chapa redirect. */
export default function PaymentCheckout({
  gigId,
  amount,
  onSuccess,
  onError,
}: PaymentCheckoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [processingMessage, setProcessingMessage] = useState('');

  // Initiate escrow payment via API and redirect to Chapa checkout
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      setProcessingMessage('Initiating escrow payment...');

      const response = await api.initiateEscrow(gigId);

      if (response.checkoutUrl) {
        setProcessingMessage('Redirecting to Chapa checkout...');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('beleqet_pending_escrow', response.escrowId);
          sessionStorage.setItem('beleqet_pending_tx_ref', response.txRef || '');
        }
        window.location.href = response.checkoutUrl;
        return;
      }

      router.push(`/freelance/payment-success?escrowId=${response.escrowId}&gigId=${gigId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      setProcessingMessage('');
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-brandGreen" />
        <h3 className="text-lg font-semibold text-ink">Payment Checkout</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted">Contract Amount</span>
            <span className="font-semibold text-ink">ETB {amount.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted">
            Funds will be held in escrow until project completion
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Payment Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {processingMessage && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Loader className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin mt-0.5" />
          <p className="text-sm font-medium text-blue-800">{processingMessage}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-brandGreen text-white py-3 px-4 rounded-lg font-semibold hover:bg-darkGreen disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
        <button
          disabled={loading}
          onClick={() => router.back()}
          className="w-full border border-border text-ink py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
