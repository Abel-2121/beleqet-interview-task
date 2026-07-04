'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Bid {
  id: string;
  jobTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Contract {
  id: string;
  jobTitle: string;
  amount: number;
  status: string;
  milestones?: Array<{ id: string; title: string; status: string }>;
}

/** Freelance dashboard with tabbed view of bids and contracts for freelancers */
export default function FreelanceDashboard() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tab, setTab] = useState<'bids' | 'contracts'>('bids');
  const [loading, setLoading] = useState(true);

  // Fetch bids or contracts depending on the active tab
  useEffect(() => {
    fetchData();
  }, [tab]);

  /** Load bids or contracts based on the selected tab */
  const fetchData = async () => {
    try {
      setLoading(true);
      if (tab === 'bids') {
        const response = await api.getMyBids();
        setBids(response.data || []);
      } else {
        const response = await api.getMyContracts();
        setContracts(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DISPUTED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Freelance Work</h1>
          <p className="text-gray-600 mt-2">Manage your bids and contracts</p>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setTab('bids')}
              className={`px-6 py-4 font-medium transition ${
                tab === 'bids'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Bids
            </button>
            <button
              onClick={() => setTab('contracts')}
              className={`px-6 py-4 font-medium transition ${
                tab === 'contracts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Contracts
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : tab === 'bids' ? (
              <div>
                {bids.length === 0 ? (
                  <p className="text-gray-600 text-center">No bids yet. <Link href="/freelance" className="text-blue-600 hover:underline">Browse gigs</Link></p>
                ) : (
                  <div className="space-y-4">
                    {bids.map(bid => (
                      <div key={bid.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{bid.jobTitle}</h3>
                            <p className="text-blue-600 font-medium">{bid.amount.toLocaleString()} ETB</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[bid.status] || 'bg-gray-100'}`}>
                            {bid.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Submitted {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {contracts.length === 0 ? (
                  <p className="text-gray-600 text-center">No active contracts</p>
                ) : (
                  <div className="space-y-4">
                    {contracts.map(contract => (
                      <Link key={contract.id} href={`/dashboard/freelance/contracts/${contract.id}`}>
                        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{contract.jobTitle}</h3>
                              <p className="text-blue-600 font-medium">{contract.amount.toLocaleString()} ETB</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[contract.status] || 'bg-gray-100'}`}>
                              {contract.status}
                            </span>
                          </div>
                          {contract.milestones && contract.milestones.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                Milestones: {contract.milestones.filter(m => m.status === 'APPROVED').length}/{contract.milestones.length} completed
                              </p>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
