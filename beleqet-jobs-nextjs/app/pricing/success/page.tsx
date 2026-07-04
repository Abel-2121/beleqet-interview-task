/** Pricing success page — shows payment confirmation status after Chapa redirect. */
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

/** Maps plan slugs to display names. */
const PLAN_NAMES: Record<string, string> = {
  basic: 'Basic',
  featured: 'Featured',
  enterprise: 'Enterprise',
};

/** Inner component that reads payment status from query params — wrapped in Suspense. */
function PricingSuccessContent() {
  const searchParams = useSearchParams();
  const payment = searchParams.get('payment');
  const txRef = searchParams.get('tx_ref');
  const plan = searchParams.get('plan');
  const [status, setStatus] = useState<'success' | 'failed' | 'pending' | 'error'>('pending');

  // Derive status from the payment query parameter
  useEffect(() => {
    if (payment === 'success') setStatus('success');
    else if (payment === 'failed') setStatus('failed');
    else if (payment === 'error') setStatus('error');
    else setStatus('pending');
  }, [payment]);

  const planName = plan ? PLAN_NAMES[plan] || plan : 'Employer';

  return (
    <div className="min-h-[70vh] bg-pageBg py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border text-center">
          {status === 'pending' && (
            // Spinner while waiting for payment confirmation
            <>
              <Loader className="w-16 h-16 text-brandGreen mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-ink mb-2">Payment Initiated</h1>
              <p className="text-muted">
                Complete payment on the Chapa checkout page. If you already paid, check back shortly.
              </p>
            </>
          )}

          {status === 'success' && (
            // Success checkmark and message
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-2">Payment Successful!</h1>
              <p className="text-muted mb-6">
                Your {planName} plan is active. You can now post jobs with enhanced visibility.
              </p>
            </>
          )}

          {status === 'failed' && (
            // Failure icon and retry prompt
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-2">Payment Failed</h1>
              <p className="text-muted mb-6">
                Your payment could not be verified. Please try again from the pricing page.
              </p>
            </>
          )}

          {status === 'error' && (
            // Error state for unexpected issues
            <>
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-2">Something went wrong</h1>
              <p className="text-muted mb-6">
                We could not process your payment return. Contact support if you were charged.
              </p>
            </>
          )}

          {/* Transaction details summary */}
          {(txRef || plan) && (
            <div className="bg-pageBg rounded-xl p-5 mb-8 text-left space-y-3 text-sm">
              {plan && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Plan</span>
                  <span className="font-semibold text-ink">{planName}</span>
                </div>
              )}
              {txRef && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted shrink-0">Transaction</span>
                  <span className="font-mono text-ink text-right truncate">{txRef}</span>
                </div>
              )}
            </div>
          )}

          {/* Action links */}
          <div className="space-y-2">
            <Link
              href="/post-job"
              className="block w-full bg-brandGreen text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-darkGreen transition-colors"
            >
              Post a Job
            </Link>
            <Link
              href="/pricing"
              className="block w-full border border-border text-ink py-2.5 px-4 rounded-xl font-semibold hover:bg-pageBg transition-colors"
            >
              Back to Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pricing success page — wraps content in Suspense for useSearchParams compatibility. */
export default function PricingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-muted">Loading...</div>}>
      <PricingSuccessContent />
    </Suspense>
  );
}
