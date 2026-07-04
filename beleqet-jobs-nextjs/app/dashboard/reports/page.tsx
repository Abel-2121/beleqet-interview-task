'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { BarChart3, Briefcase, Users, FileText, Loader } from 'lucide-react';

export default function AdminReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ jobs: 0, companies: 0, candidates: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    api.getJobStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-brandGreen" />
      </div>
    );
  }

  const cards = [
    { label: 'Published Jobs', value: stats.jobs, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
    { label: 'Companies', value: stats.companies, icon: BarChart3, color: 'text-green-600 bg-green-50' },
    { label: 'Job Seekers', value: stats.candidates, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Applications', value: stats.applications, icon: FileText, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Platform Reports</h1>
        <p className="text-muted mt-2">Overview of Beleqet platform activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-border p-6">
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-ink">{card.value.toLocaleString()}</p>
              <p className="text-sm text-muted mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
