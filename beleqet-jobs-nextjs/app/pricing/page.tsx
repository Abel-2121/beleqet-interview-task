import PricingPlans, { type PricingPlan } from '@/components/PricingPlans';

const plans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    amount: 0,
    desc: 'Post a single job listing',
    features: ['1 job listing', '30 days visibility', 'Standard placement'],
  },
  {
    id: 'featured',
    name: 'Featured',
    price: 'ETB 1,500',
    amount: 1500,
    desc: 'Get priority placement and more reach',
    features: ['5 job listings', '60 days visibility', 'Featured badge', 'Telegram channel boost'],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    amount: 0,
    desc: 'For high-volume hiring teams',
    features: ['Unlimited listings', 'Dedicated account manager', 'Employer branding page', 'API access'],
    contactOnly: true,
  },
];

export const metadata = { title: 'Pricing | Beleqet Jobs' };

export default function PricingPage() {
  return (
    <div className="container-page py-16">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-pageH1">Simple pricing for employers</h1>
        <p className="text-muted mt-3">
          Choose a plan that fits your hiring needs and start reaching qualified candidates today.
        </p>
      </div>

      <PricingPlans plans={plans} />
    </div>
  );
}
