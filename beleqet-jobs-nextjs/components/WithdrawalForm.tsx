'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface WithdrawalFormProps {
  availableBalance: number;
  onSuccess?: () => void;
}

/** Withdrawal request form with amount, bank details, validation, and success/error states. */
export default function WithdrawalForm({ availableBalance, onSuccess }: WithdrawalFormProps) {
  const [formData, setFormData] = useState({
    withdrawalAmount: '',
    bankAccount: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setStatus('loading');

    try {
      // Validation
      const amount = parseFloat(formData.withdrawalAmount);
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid withdrawal amount');
      }

      if (amount > availableBalance) {
        throw new Error(`Withdrawal amount cannot exceed available balance of ETB ${availableBalance.toFixed(2)}`);
      }

      if (!formData.bankAccount.trim()) {
        throw new Error('Please provide your bank account information');
      }

      // Submit withdrawal request
      const response = await api.requestWithdrawal({
        amount,
        bankAccount: formData.bankAccount,
      });

      setSuccessMessage(`Withdrawal requested successfully! You will receive ETB ${amount.toFixed(2)} in 1-2 business days.`);
      setFormData({ withdrawalAmount: '', bankAccount: '' });
      setStatus('success');

      if (onSuccess) {
        onSuccess();
      }

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process withdrawal. Please try again.';
      setError(errorMessage);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold text-ink mb-6">Request Withdrawal</h3>

      {/* Error Alert */}
      {status === 'error' && error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {status === 'success' && successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Success</p>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Available Balance Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Available Balance:</span> ETB {availableBalance.toFixed(2)}
          </p>
        </div>

        {/* Withdrawal Amount */}
        <div>
          <label htmlFor="withdrawalAmount" className="block text-sm font-medium text-ink mb-2">
            Withdrawal Amount (ETB)
          </label>
          <input
            type="number"
            id="withdrawalAmount"
            name="withdrawalAmount"
            min="0"
            step="0.01"
            max={availableBalance}
            value={formData.withdrawalAmount}
            onChange={handleChange}
            placeholder="Enter amount to withdraw"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent"
            disabled={status === 'loading'}
          />
          <p className="text-xs text-muted mt-1">Maximum: ETB {availableBalance.toFixed(2)}</p>
        </div>

        {/* Bank Account */}
        <div>
          <label htmlFor="bankAccount" className="block text-sm font-medium text-ink mb-2">
            Bank Account Information
          </label>
          <textarea
            id="bankAccount"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleChange}
            placeholder="Enter your bank account details (account number, bank name, account holder name, etc.)"
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen focus:border-transparent resize-none"
            disabled={status === 'loading'}
          />
        </div>

        {/* Note */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <span className="font-medium">Note:</span> Withdrawals are processed within 1-2 business days. Fees may apply based on your bank.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading' || availableBalance <= 0}
          className="w-full bg-brandGreen text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' && <Loader className="w-4 h-4 animate-spin" />}
          {status === 'loading' ? 'Processing...' : 'Request Withdrawal'}
        </button>
      </form>
    </div>
  );
}
