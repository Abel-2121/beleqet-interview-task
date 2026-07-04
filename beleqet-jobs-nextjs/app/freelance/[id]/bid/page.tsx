'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

/**
 * Bid submission page for a specific freelance gig.
 * Collects bid amount, delivery timeline, and proposal text.
 */
export default function BidPage() {
  const params = useParams();
  const router = useRouter();
  const gigId = params.id as string;
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);

  /** Posts the bid to the API and redirects to the dashboard on success. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.submitBid({
        freelanceJobId: gigId,
        amount: parseInt(bidAmount),
        deliveryDays: parseInt(deliveryDays),
        proposal: proposal,
      });
      router.push('/dashboard/freelance?tab=bids');
    } catch (error) {
      console.error('Failed to submit bid:', error);
      alert('Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit Your Bid</h1>

        {/* Bid form with amount, timeline, and proposal fields */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Bid Amount (ETB)</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your bid amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Timeline (Days)</label>
            <input
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="How many days to deliver"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Proposal</label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain why you're the right fit for this project..."
            />
          </div>

          {/* Live summary preview of the bid before submission */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Your Bid Summary</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Bid Amount:</span>
                <span className="font-semibold">{bidAmount ? `${parseInt(bidAmount).toLocaleString()} ETB` : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Time:</span>
                <span className="font-semibold">{deliveryDays ? `${deliveryDays} days` : '-'}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Submitting Bid...' : 'Submit Bid'}
          </button>
        </form>
      </div>
    </div>
  );
}
