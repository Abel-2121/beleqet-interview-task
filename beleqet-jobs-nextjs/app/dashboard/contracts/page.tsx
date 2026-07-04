'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';
import PaymentCheckout from '@/components/PaymentCheckout';
import { Briefcase, Calendar, AlertCircle, Loader } from 'lucide-react';

interface Contract {
  id: string;
  agreedAmount: number;
  status: string;
  startedAt: string;
  freelanceJob: { id: string; title: string };
  client: { firstName: string; lastName: string };
  freelancer: { firstName: string; lastName: string };
}

/** Contracts page listing freelance contracts with status, amount, and escrow funding option */
export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForPayment, setSelectedForPayment] = useState<Contract | null>(null);

  // Load contracts on mount or user change
  useEffect(() => {
    loadContracts();
  }, [user]);

  /** Fetch all contracts for the current user */
  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await api.getMyContracts();
      setContracts(response.data || []);
    } catch (error) {
      console.error('Failed to load contracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  /** Map contract status to Tailwind badge color classes */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-200';
      case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DISPUTED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  /** Determine the counterparty (client or freelancer) for display */
  const getOtherParty = (contract: Contract) => {
    if (user?.id === contract.client?.firstName) return contract.freelancer;
    return user?.role === 'FREELANCER' ? contract.client : contract.freelancer;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-brandGreen" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Contracts</h1>
        <p className="text-muted mt-2">Manage your freelance contracts and payments</p>
      </div>

      {selectedForPayment && (
        <PaymentCheckout
          gigId={selectedForPayment.freelanceJob.id}
          amount={selectedForPayment.agreedAmount}
          onSuccess={() => setSelectedForPayment(null)}
        />
      )}

      {contracts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
          <Briefcase className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-ink font-semibold">No contracts yet</p>
          <p className="text-sm text-muted mt-1">Browse freelance gigs to get started.</p>
          <Link href="/freelance" className="inline-block mt-4 text-brandGreen font-semibold hover:underline">
            Browse Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const other = getOtherParty(contract);
            return (
              <div key={contract.id} className="bg-white rounded-xl border border-border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{contract.freelanceJob.title}</h3>
                    <p className="text-sm text-muted mt-1">
                      with {other.firstName} {other.lastName}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(contract.startedAt).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-ink">ETB {contract.agreedAmount.toLocaleString()}</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/freelance/contracts/${contract.id}`}
                    className="px-4 py-2 text-sm font-semibold text-brandGreen border border-brandGreen rounded-lg hover:bg-brandGreen/5"
                  >
                    View Details
                  </Link>
                  {user?.role === 'EMPLOYER' && contract.status === 'ACTIVE' && (
                    <button
                      onClick={() => setSelectedForPayment(contract)}
                      className="px-4 py-2 text-sm font-semibold bg-brandGreen text-white rounded-lg hover:bg-darkGreen"
                    >
                      Fund Escrow
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Payments are processed through Chapa escrow. Configure CHAPA_SECRET_KEY in backend .env for live payments.
        </p>
      </div>
    </div>
  );
}
