'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, CreditCard, Loader, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export type PlanId = 'basic' | 'featured' | 'enterprise';

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: string;
  amount: number;
  desc: string;
  features: string[];
  highlight?: boolean;
  contactOnly?: boolean;
}

interface PricingPlansProps {
  plans: PricingPlan[];
}

/** Pricing plans grid with feature lists, checkout modal, and Chapa payment integration. */
export default function PricingPlans({ plans }: PricingPlansProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const closeModal = () => {
    if (loading) return;
    setSelectedPlan(null);
    setError('');
  };

  // Route user to login, register, contact, or open checkout modal based on plan
  const handleGetStarted = (plan: PricingPlan) => {
    setError('');

    if (plan.contactOnly) {
      router.push('/contact');
      return;
    }

    if (plan.amount <= 0) {
      if (!user && !authLoading) {
        router.push('/register?role=EMPLOYER&redirect=/post-job');
        return;
      }
      router.push('/post-job');
      return;
    }

    if (!user && !authLoading) {
      router.push(`/login?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    setSelectedPlan(plan);
  };

  // Process payment via API and redirect to Chapa for selected plan
  const handleCheckout = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      setError('');

      const response = await api.initiatePlanCheckout(selectedPlan.id);

      if (response.checkoutUrl) {
        sessionStorage.setItem('beleqet_pending_plan', selectedPlan.id);
        sessionStorage.setItem('beleqet_pending_plan_tx', response.txRef || '');
        window.location.href = response.checkoutUrl;
        return;
      }

      if (selectedPlan.amount <= 0) {
        router.push('/post-job');
        return;
      }

      setError(response.message || 'Could not start checkout. Please try again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border p-7 flex flex-col ${
              plan.highlight
                ? 'border-brandGreen bg-brandGreen text-white shadow-cardHover scale-[1.02]'
                : 'border-border bg-white'
            }`}
          >
            {plan.highlight && (
              <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                <Sparkles className="h-3 w-3" />
                Most popular
              </span>
            )}

            <h3 className={`text-sm font-semibold ${plan.highlight ? 'text-white/80' : 'text-muted'}`}>
              {plan.name}
            </h3>
            <p className="text-3xl font-extrabold mt-2">{plan.price}</p>
            <p className={`text-sm mt-2 ${plan.highlight ? 'text-white/70' : 'text-muted'}`}>{plan.desc}</p>

            <ul className="mt-6 space-y-2.5 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-white' : 'text-brandGreen'}`} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleGetStarted(plan)}
              className={`mt-7 w-full rounded-full py-3 text-sm font-semibold transition-colors ${
                plan.highlight
                  ? 'bg-white text-brandGreen hover:bg-white/90'
                  : 'bg-brandGreen text-white hover:bg-darkGreen'
              }`}
            >
              {plan.contactOnly ? 'Contact Sales' : plan.amount <= 0 ? 'Post a Job Free' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close checkout"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-border">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-pageBg hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandGreen/10">
                <CreditCard className="h-5 w-5 text-brandGreen" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">Complete your purchase</h2>
                <p className="text-sm text-muted">Secure payment via Chapa</p>
              </div>
            </div>

            <div className="rounded-xl bg-pageBg p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted">Plan</span>
                <span className="font-semibold text-ink">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Amount</span>
                <span className="font-semibold text-brandGreen">
                  ETB {selectedPlan.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted">Billing</span>
                <span className="text-ink">One-time payment</span>
              </div>
            </div>

            <ul className="mb-5 space-y-2">
              {selectedPlan.features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                  <Check className="h-4 w-4 text-brandGreen shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brandGreen py-3 text-sm font-semibold text-white hover:bg-darkGreen disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {loading ? 'Redirecting to Chapa...' : `Pay ETB ${selectedPlan.amount.toLocaleString()}`}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-ink hover:bg-pageBg disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
