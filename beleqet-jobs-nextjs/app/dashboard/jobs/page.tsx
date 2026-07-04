'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface JobPosting {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  applicationCount: number;
  createdAt: string;
  salaryMin?: number;
  salaryMax?: number;
}

/** Employer dashboard page listing their job postings with status, applications count, and actions */
export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch employer's job postings on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  /** Load the current employer's job listings */
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.getMyJobs();
      setJobs(response.data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">My Job Postings</h1>
          <p className="text-muted mt-2">Manage your job listings</p>
        </div>
        <Link 
          href="/post-job" 
          className="flex items-center gap-2 bg-brandGreen text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkGreen transition-colors"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink mb-2">No Job Postings Yet</h2>
            <p className="text-muted mb-6">Create your first job posting to start receiving applications</p>
            <Link href="/post-job" className="inline-flex items-center gap-2 bg-brandGreen text-white px-6 py-3 rounded-xl font-semibold hover:bg-darkGreen transition-colors">
              <Plus className="w-5 h-5" />
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl p-6 border border-border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-ink">{job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        job.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : job.status === 'CLOSED'
                          ? 'bg-gray-100 text-gray-800 border-gray-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="capitalize">{job.type.toLowerCase()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {job.salaryMin && job.salaryMax && (
                      <div className="flex items-center gap-2 text-ink font-semibold">
                        <DollarSign className="w-5 h-5" />
                        <span>{job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} ETB</span>
                      </div>
                    )}
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-muted" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-brandGreen" />
                    <span className="text-sm font-semibold text-ink">{job.applicationCount} applications</span>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      href={`/dashboard/applications?jobId=${job.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-brandGreen text-white rounded-lg text-sm font-medium hover:bg-darkGreen transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Applications
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
