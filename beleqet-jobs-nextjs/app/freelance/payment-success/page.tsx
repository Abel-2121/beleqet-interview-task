'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const payment = searchParams.get('payment');
  const txRef = searchParams.get('tx_ref');
  const escrowId = searchParams.get('escrowId');
  const gigId = searchParams.get('gigId');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'pending'>('pending');

  useEffect(() => {
    if (payment === 'success') {
      setStatus('success');
      if (txRef) sessionStorage.setItem('beleqet_last_tx_ref', txRef);
    } else if (payment === 'failed' || payment === 'error') {
      setStatus('failed');
    } else if (escrowId) {
      setStatus('pending');
    }
  }, [payment, txRef, escrowId]);

  const isSuccess = status === 'success';
  const isFailed = status === 'failed';
  const isPending = status === 'pending' && !payment;

  return (
    <div className="min-h-screen bg-pageBg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-border text-center">
          {status === 'verifying' && (
            <>
              <Loader className="w-16 h-16 text-brandGreen mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-ink mb-2">Verifying Payment</h1>
              <p className="text-muted">Please wait while we confirm your payment with Chapa...</p>
            </>
          )}

          {isSuccess && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-2">Payment Successful!</h1>
              <p className="text-muted mb-6">
                Your escrow payment was verified. Funds are held securely until the project is completed.
              </p>
            </>
          )}

          {isFailed && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-2">Payment Failed</h1>
              <p className="text-muted mb-6">
                Your payment could not be verified. You can try again from your contracts page.
              </p>
            </>
          )}

          {isPending && (
            <>
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-2">Payment Initiated</h1>
              <p className="text-muted mb-6">
                Complete payment on the Chapa checkout page. If you already paid, check back shortly.
              </p>
            </>
          )}

          {(txRef || escrowId) && (
            <div className="bg-pageBg rounded-xl p-5 mb-8 text-left space-y-3 text-sm">
              {txRef && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted shrink-0">Transaction</span>
                  <span className="font-mono text-ink text-right truncate">{txRef}</span>
                </div>
              )}
              {escrowId && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted shrink-0">Escrow ID</span>
                  <span className="font-mono text-ink truncate">{escrowId.substring(0, 16)}...</span>
                </div>
              )}
              {gigId && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted shrink-0">Gig ID</span>
                  <span className="font-mono text-ink truncate">{gigId.substring(0, 16)}...</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span
                  className={`font-medium px-3 py-0.5 rounded-full text-xs ${
                    isSuccess
                      ? 'text-green-700 bg-green-50'
                      : isFailed
                        ? 'text-red-700 bg-red-50'
                        : 'text-amber-700 bg-amber-50'
                  }`}
                >
                  {isSuccess ? 'Funded' : isFailed ? 'Failed' : 'Pending'}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Link
              href="/dashboard/contracts"
              className="block w-full bg-brandGreen text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-darkGreen transition-colors"
            >
              View Contracts
            </Link>
            {isFailed && (
              <Link
                href="/dashboard/contracts"
                className="block w-full border border-brandGreen text-brandGreen py-2.5 px-4 rounded-xl font-semibold hover:bg-brandGreen/5 transition-colors"
              >
                Try Again
              </Link>
            )}
            <Link
              href="/dashboard/freelance"
              className="block w-full border border-border text-ink py-2.5 px-4 rounded-xl font-semibold hover:bg-pageBg transition-colors"
            >
              My Freelance Work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
