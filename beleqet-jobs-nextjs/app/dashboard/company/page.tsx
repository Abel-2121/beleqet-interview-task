'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Building2, Save, Loader } from 'lucide-react';

/** Company profile management page for employers to update business info */
export default function CompanyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    logoUrl: '',
  });

  // Load existing company data on mount
  useEffect(() => {
    loadCompany();
  }, []);

  /** Fetch the employer's company profile from the API */
  const loadCompany = async () => {
    try {
      const company = await api.getCompany();
      if (company) {
        setForm({
          name: company.name || '',
          description: company.description || '',
          website: company.website || '',
          industry: company.industry || '',
          size: company.size || '',
          location: company.location || '',
          logoUrl: company.logoUrl || '',
        });
      }
    } catch {
      // No company yet — user will create one
    } finally {
      setLoading(false);
    }
  };

  /** Generic change handler for all form fields */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** Create or update company profile on form submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      try {
        await api.updateCompany(form);
      } catch {
        await api.createCompany(form);
      }
      setMessage('Company profile saved successfully!');
    } catch {
      setMessage('Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-brandGreen" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Company Profile</h1>
        <p className="text-muted mt-2">Manage your company information for job listings</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-5 h-5 text-brandGreen" />
          <h2 className="font-semibold text-ink">{user?.firstName}&apos;s Company</h2>
        </div>

        {[
          { name: 'name', label: 'Company Name', type: 'text', required: true },
          { name: 'website', label: 'Website', type: 'url' },
          { name: 'industry', label: 'Industry', type: 'text' },
          { name: 'size', label: 'Company Size', type: 'text' },
          { name: 'location', label: 'Location', type: 'text' },
          { name: 'logoUrl', label: 'Logo URL', type: 'url' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={(form as any)[field.name]}
              onChange={handleChange}
              required={field.required}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
          />
        </div>

        {message && (
          <p className={`text-sm font-medium ${message.includes('success') ? 'text-brandGreen' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-brandGreen text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-darkGreen disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Company'}
        </button>
      </form>
    </div>
  );
}
