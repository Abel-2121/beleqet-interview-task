'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Heart, MapPin, DollarSign, Briefcase, Calendar, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Job, SavedJob as ApiSavedJob } from '@/lib/api';

interface SavedJob extends ApiSavedJob {}

/** Saved jobs page for job seekers showing bookmarked job listings */
export default function SavedJobsPage() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only job seekers can access saved jobs
  useEffect(() => {
    if (user?.role === 'JOB_SEEKER') {
      loadSavedJobs();
    }
  }, [user]);

  /** Fetch the user's saved/bookmarked jobs */
  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getSavedJobs();
      setSavedJobs(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
      setSavedJobs([]);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  /** Remove a job from the saved list */
  const handleRemoveSave = async (jobId: string) => {
    try {
      await api.removeSavedJob(jobId);
      setSavedJobs(savedJobs.filter(item => item.jobId !== jobId));
    } catch (err) {
      console.error('Failed to remove saved job:', err);
      setError('Failed to remove saved job');
    }
  };

  /** Format salary range as display string or fallback */
  const formatSalary = (job: SavedJob['job']) => {
    if (!job.salaryMin || !job.salaryMax) return 'Not specified';
    return `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ETB`;
  };

  /** Format a date string into a readable locale format */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink">Saved Jobs</h1>
        <p className="text-muted mt-2">
          {savedJobs.length === 0
            ? 'You haven\'t saved any jobs yet'
            : `You have ${savedJobs.length} saved job${savedJobs.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Saved Jobs List */}
      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-border text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-ink mb-2">No Saved Jobs Yet</h2>
          <p className="text-muted mb-6">
            Start exploring jobs and save the ones you're interested in
          </p>
          <Link
            href="/jobs"
            className="inline-block px-6 py-2 bg-brandGreen text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((saved) => (
            <div key={saved.id} className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {saved.job.company.logoUrl && (
                      <img
                        src={saved.job.company.logoUrl}
                        alt={saved.job.company.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-ink">{saved.job.title}</h3>
                      <p className="text-muted">{saved.job.company.name}</p>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted" />
                      <span className="text-muted">{saved.job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted" />
                      <span className="text-muted">{formatSalary(saved.job)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted" />
                      <span className="text-muted capitalize">{saved.job.type.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted" />
                      <span className="text-muted">Saved {formatDate(saved.savedAt)}</span>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-muted line-clamp-2 mb-4">
                    {saved.job.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/jobs/${saved.job.id}`}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-brandGreen"
                    title="View job details"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleRemoveSave(saved.job.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-5 h-5" />
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
