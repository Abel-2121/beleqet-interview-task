'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PostGigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    budgetMin: '',
    budgetMax: '',
    deadlineDays: '14',
    skills: '',
  });

  useEffect(() => {
    if (user && user.role !== 'EMPLOYER' && user.role !== 'ADMIN') {
      router.push('/freelance');
    }
  }, [user, router]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/freelance/jobs?limit=1`)
      .catch(() => {});
    setCategories([
      { id: '', label: 'Select category' },
    ]);
    import('@/lib/api').then(({ api: client }) => {
      client.getFreelanceGigs({ limit: 1 }).catch(() => {});
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createFreelanceJob({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        budgetMin: parseInt(form.budgetMin),
        budgetMax: parseInt(form.budgetMax),
        deadlineDays: parseInt(form.deadlineDays),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      router.push('/freelance');
    } catch (err) {
      alert('Failed to post gig. Log in as an employer first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pageBg py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/freelance" className="inline-flex items-center gap-2 text-sm text-muted hover:text-brandGreen mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to gigs
        </Link>

        <h1 className="text-3xl font-bold text-ink mb-8">Post a Freelance Gig</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Project Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Category ID</label>
            <input name="categoryId" value={form.categoryId} onChange={handleChange} required placeholder="Freelance category UUID from database" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen" />
            <p className="text-xs text-muted mt-1">Use a category ID from freelance_categories table (e.g. web-development slug category)</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Budget Min (ETB)</label>
              <input type="number" name="budgetMin" value={form.budgetMin} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Budget Max (ETB)</label>
              <input type="number" name="budgetMax" value={form.budgetMax} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Deadline (days)</label>
            <input type="number" name="deadlineDays" value={form.deadlineDays} onChange={handleChange} required className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Skills (comma-separated)</label>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Design" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brandGreen text-white py-3 rounded-xl font-semibold hover:bg-darkGreen disabled:opacity-50">
            {loading ? 'Posting...' : 'Post Gig'}
          </button>
        </form>
      </div>
    </div>
  );
}
