"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle, Send } from "lucide-react";

interface BidFormProps {
  gigId: string;
  onBidSubmitted?: () => void;
}

/** Form for freelancers to submit a bid with amount, delivery days, and proposal. */
export default function BidForm({ gigId, onBidSubmitted }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!bidAmount || !deliveryDays || !proposal.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) {
      setError("Bid amount must be a positive number");
      return;
    }

    if (isNaN(Number(deliveryDays)) || Number(deliveryDays) <= 0) {
      setError("Delivery days must be a positive number");
      return;
    }

    if (proposal.trim().length < 10) {
      setError("Proposal must be at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      await api.submitBid({
        freelanceJobId: gigId,
        amount: Number(bidAmount),
        deliveryDays: Number(deliveryDays),
        proposal: proposal.trim(),
      });

      setSuccess(true);
      setBidAmount("");
      setDeliveryDays("");
      setProposal("");

      // Call callback
      if (onBidSubmitted) {
        setTimeout(() => {
          onBidSubmitted();
        }, 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit bid";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show success message after bid submission
  if (success) {
    return (
      <div className="rounded-xl border border-brandGreen/30 bg-brandGreen/5 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-brandGreen shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-brandGreen">Bid submitted successfully!</h3>
            <p className="text-sm text-muted mt-1">The client will review your proposal. You'll be notified if they accept your bid.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-6 space-y-5">
      <h3 className="text-lg font-semibold text-ink">Submit Your Bid</h3>

      {error && (
        <div className="rounded-lg border border-redAccent/30 bg-redAccent/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-redAccent shrink-0 mt-0.5" />
          <p className="text-sm text-redAccent">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-ink mb-2">
            Bid Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted">$</span>
            <input
              id="bidAmount"
              type="number"
              step="0.01"
              min="0"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen/20 transition-colors"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="deliveryDays" className="block text-sm font-medium text-ink mb-2">
            Delivery Days
          </label>
          <input
            id="deliveryDays"
            type="number"
            min="1"
            value={deliveryDays}
            onChange={(e) => setDeliveryDays(e.target.value)}
            placeholder="e.g., 5"
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen/20 transition-colors"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="proposal" className="block text-sm font-medium text-ink mb-2">
          Your Proposal
        </label>
        <textarea
          id="proposal"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          placeholder="Describe how you'll approach this project, your relevant experience, and why you're a great fit for this gig..."
          rows={5}
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen/20 transition-colors resize-none"
          disabled={loading}
        />
        <p className="text-xs text-muted mt-1">{proposal.length} characters</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brandGreen text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brandGreen/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Bid
          </>
        )}
      </button>
    </form>
  );
}
