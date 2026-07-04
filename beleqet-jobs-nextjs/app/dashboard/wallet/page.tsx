'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const walletResponse = await api.getWalletBalance();
      // getWalletBalance returns Wallet directly, not { data: Wallet }
      setWallet({
        availableBalance: walletResponse.availableBalance || 0,
        pendingBalance: walletResponse.pendingBalance || 0,
        totalEarned: walletResponse.totalEarned || 0,
        currency: walletResponse.currency || 'ETB',
      });
      
      const transactionResponse = await api.getTransactionHistory();
      setTransactions(transactionResponse.data || []);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || parseInt(withdrawAmount) > wallet.availableBalance) {
      alert('Insufficient balance');
      return;
    }

    setSubmitting(true);
    try {
      await api.requestWithdrawal({
        amount: parseInt(withdrawAmount),
        bankAccount,
      });
      alert('Withdrawal request submitted');
      setWithdrawAmount('');
      setBankAccount('');
      setShowWithdrawForm(false);
      fetchWalletData();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal request failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet</h1>

        {wallet && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Available Balance</p>
                <p className="text-3xl font-bold text-blue-600">
                  {wallet.availableBalance.toLocaleString()} {wallet.currency}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Pending Balance</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {wallet.pendingBalance.toLocaleString()} {wallet.currency}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Earned</p>
                <p className="text-3xl font-bold text-green-600">
                  {wallet.totalEarned.toLocaleString()} {wallet.currency}
                </p>
              </div>
            </div>

            {!showWithdrawForm ? (
              <button
                onClick={() => setShowWithdrawForm(true)}
                disabled={wallet.availableBalance === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 mb-8"
              >
                Withdraw Funds
              </button>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Withdrawal Request</h2>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (ETB)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={wallet.availableBalance}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available: {wallet.availableBalance.toLocaleString()} ETB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your bank account details"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      {submitting ? 'Processing...' : 'Request Withdrawal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWithdrawForm(false);
                        setWithdrawAmount('');
                        setBankAccount('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-600">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type.includes('CREDIT') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tx.description}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        <span className={tx.type.includes('CREDIT') ? 'text-green-600' : 'text-red-600'}>
                          {tx.type.includes('CREDIT') ? '+' : '-'}{tx.amount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
