'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import GigCard from '@/components/GigCard';

interface FreelanceGig {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadlineDays?: number;
  pricingType?: string;
  skills?: string[];
  status: string;
  createdAt?: string;
  bidCount?: number;
  _count?: { bids: number };
  category?: { label?: string; name?: string; slug?: string };
  client?: { firstName?: string; lastName?: string };
}

export default function FreelancePage() {
  const [gigs, setGigs] = useState<FreelanceGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await api.getFreelanceGigs();
      setGigs((response.data || []).map((g: FreelanceGig) => ({
        ...g,
        bidCount: g._count?.bids ?? g.bidCount ?? 0,
      })));
    } catch (error) {
      console.error('Failed to load gigs:', error);
      setGigs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = gigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(search.toLowerCase()) ||
      gig.description.toLowerCase().includes(search.toLowerCase());
    const matchesBudget =
      !budgetFilter ||
      (budgetFilter === 'low' && gig.budgetMax < 50000) ||
      (budgetFilter === 'mid' && gig.budgetMax >= 50000 && gig.budgetMax < 200000) ||
      (budgetFilter === 'high' && gig.budgetMax >= 200000);
    return matchesSearch && matchesBudget;
  });

  return (
    <div className="container-page py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-pageH1">Freelance Gigs</h1>
          <p className="text-muted text-sm mt-2">
            {loading ? 'Loading...' : `${filtered.length} project${filtered.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <Link
          href="/freelance/post"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brandGreen px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-darkGreen"
        >
          <Plus className="h-4 w-4" />
          Post a Gig
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-white p-2 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-2">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brandGreen/20">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="text"
              placeholder="Search gigs by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 md:border-0">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted" />
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-ink outline-none"
            >
              <option value="">All budgets</option>
              <option value="low">Under 50k ETB</option>
              <option value="mid">50k – 200k ETB</option>
              <option value="high">200k+ ETB</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[340px] animate-pulse rounded-2xl border border-border bg-pageBg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <p className="font-semibold text-ink">No gigs found</p>
          <p className="mt-1 text-sm text-muted">Try adjusting your search or budget filter.</p>
          <Link
            href="/freelance/post"
            className="mt-4 inline-block text-sm font-semibold text-brandGreen hover:underline"
          >
            Post the first gig →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((gig, index) => (
            <GigCard key={gig.id} gig={gig as any} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
