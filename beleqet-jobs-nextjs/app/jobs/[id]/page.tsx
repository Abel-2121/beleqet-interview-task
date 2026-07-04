'use client';

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Building2, ArrowLeft, Bookmark, Users } from "lucide-react";
import { api, type JobDetail, type Application, jobType as getJobType, isJobOpen, getApplicationCount } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import ApplicationModal from "@/components/ApplicationModal";

/** Job detail page showing full description, company info, related jobs, and apply/save actions */
export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch job data and related jobs on mount or param change
  useEffect(() => {
    loadJobData();
  }, [params.id]);

  // Check if current user already applied to this job
  useEffect(() => {
    if (!user || user.role !== 'JOB_SEEKER') {
      setExistingApplication(null);
      return;
    }
    api.getMyApplications().then((res) => {
      const apps = Array.isArray(res) ? res : res.data || [];
      const match = apps.find((a: any) => a.jobId === params.id);
      setExistingApplication(match || null);
    }).catch(() => setExistingApplication(null));
  }, [user, params.id]);

  // Check if current user has saved this job
  useEffect(() => {
    if (user && params.id) {
      api.isJobSaved(params.id).then(setSaved).catch(() => setSaved(false));
    } else {
      setSaved(false);
    }
  }, [user, params.id]);

  /** Fetch job details and related jobs from the same category */
  const loadJobData = async () => {
    try {
      setLoading(true);
      const jobData = await api.getJob(params.id);
      setJob(jobData);

      // Load related jobs from same category
      if (jobData.category) {
        const relatedResponse = await api.getJobs({
          category: jobData.category.id,
          limit: 3,
        });
        // api.getJobs() normalizes to { data, ... }
        setRelatedJobs(relatedResponse.data.filter((j: any) => j.id !== jobData.id));
      }
    } catch (error) {
      console.error('Failed to load job:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  /** Redirect to login or open application modal */
  const handleApply = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'JOB_SEEKER') {
      alert('Only job seekers can apply for jobs');
      return;
    }

    setShowApplicationModal(true);
  };

  /** Re-open application modal to edit an existing application */
  const handleEditApplication = () => {
    setShowApplicationModal(true);
  };

  /** Refresh job data and re-check existing application after successful submit */
  const handleApplicationSuccess = () => {
    // Refresh job data and check for existing application
    loadJobData();
    if (user?.role === 'JOB_SEEKER') {
      api.getMyApplications().then((res) => {
        const apps = Array.isArray(res) ? res : res.data || [];
        const match = apps.find((a: any) => a.jobId === params.id);
        setExistingApplication(match || null);
      }).catch(() => {});
    }
  };

  /** Toggle job save/unsave for the current user */
  const toggleSaveJob = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${params.id}`);
      return;
    }

    if (user.role !== 'JOB_SEEKER') {
      alert('Only job seekers can save jobs');
      return;
    }

    try {
      setSaving(true);
      if (saved) {
        await api.removeSavedJob(params.id);
        setSaved(false);
      } else {
        await api.saveJob(params.id);
        setSaved(true);
      }
    } catch (error: any) {
      if (!saved && error?.status === 409) {
        setSaved(true);
        return;
      }
      console.error('Failed to update saved job:', error);
      alert(error?.message || 'Failed to update saved job');
    } finally {
      setSaving(false);
    }
  };

  /** Format a date string into a human-readable relative time */
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return '1d ago';
    return `${diffInDays}d ago`;
  };

  /** Convert internal job type key to display label */
  const formatJobType = (type: string) => {
    const typeMap: Record<string, string> = {
      'FULL_TIME': 'Full Time',
      'PART_TIME': 'Part Time',
      'REMOTE': 'Remote',
      'HYBRID': 'Hybrid',
      'CONTRACT': 'Contract',
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
        </div>
      </div>
    );
  }

  if (!job) notFound();

  const jobIsOpen = isJobOpen(job);
  const applicantCount = getApplicationCount(job);

  return (
    <div className="container-page py-10">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brandGreen mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to all jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          {/* Job header with title, company, location, type, time, applicants, salary */}
          <div className="rounded-2xl border border-border bg-white p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-pageBg text-muted shrink-0 overflow-hidden">
                {job.company.logoUrl ? (
                  <img 
                    src={job.company.logoUrl} 
                    alt={job.company.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-ink leading-snug">{job.title}</h1>
                    <p className="text-muted mt-1">{job.company.name}</p>
                  </div>
                  <button
                    onClick={toggleSaveJob}
                    disabled={saving}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      saved 
                        ? 'text-brandGreen bg-brandGreen/10' 
                        : 'text-muted hover:text-brandGreen hover:bg-brandGreen/10'
                    }`}
                    aria-label={saved ? 'Remove saved job' : 'Save job'}
                  >
                    <Bookmark className={`h-5 w-5 ${saved ? 'fill-brandGreen' : ''}`} />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {formatTimeAgo(job.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {applicantCount} applicants
                  </span>
                  <span className="rounded-full bg-brandGreen/10 text-brandGreen font-semibold px-2.5 py-1">
                    {formatJobType(getJobType(job))}
                  </span>
                </div>

                {/* Salary range */}
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-brandGreen font-semibold">
                    <span>Salary:</span>
                    {job.salaryMin && job.salaryMax 
                      ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ETB`
                      : job.salaryMin 
                      ? `From ${job.salaryMin.toLocaleString()} ETB`
                      : `Up to ${job.salaryMax?.toLocaleString()} ETB`
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Job description section */}
            <div className="mt-7 pt-7 border-t border-border">
              <h2 className="text-sm font-semibold text-ink mb-3">Job Description</h2>
              <div className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements (API returns a single string, split into lines) */}
            {job.requirements && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-ink mb-3">Requirements</h3>
                <ul className="text-sm text-muted leading-relaxed space-y-1">
                  {job.requirements.split(',').map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-brandGreen mt-1">•</span>
                      <span>{req.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Category (API returns { label } not { name }) */}
            {job.category && (
              <div className="mt-6">
                <span className="text-xs font-medium text-muted bg-pageBg border border-border rounded-full px-3 py-1">
                  {(job.category as any).label || (job.category as any).name || job.category.id}
                </span>
              </div>
            )}
          </div>

          {/* Company Information */}
          <div className="rounded-2xl border border-border bg-white p-7 mt-6">
            <h2 className="text-sm font-semibold text-ink mb-4">About {job.company.name}</h2>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pageBg text-muted shrink-0 overflow-hidden">
                {job.company.logoUrl ? (
                  <img 
                    src={job.company.logoUrl} 
                    alt={job.company.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-ink">{job.company.name}</h3>
                {job.company.website && (
                  <a 
                    href={job.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-brandGreen hover:underline mt-1 block"
                  >
                    {job.company.website}
                  </a>
                )}
                {job.company.description && (
                  <p className="text-sm text-muted mt-2 leading-relaxed">
                    {job.company.description}
                  </p>
                )}
                {job.company.industry && (
                  <p className="text-xs text-muted mt-2">Industry: {job.company.industry}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: apply/save actions, similar jobs */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6">
            {existingApplication ? (
              <>
                <div className="w-full rounded-full bg-green-100 text-green-700 text-sm font-semibold py-3 text-center border border-green-200">
                  Already Applied
                </div>
                <button
                  onClick={handleEditApplication}
                  className="w-full rounded-full border border-brandGreen text-brandGreen text-sm font-semibold py-3 mt-2 hover:bg-brandGreen/5 transition-colors"
                >
                  Edit Application
                </button>
              </>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying || !jobIsOpen}
                className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Applying...' : jobIsOpen ? 'Apply Now' : 'Position Closed'}
              </button>
            )}
            <button
              onClick={toggleSaveJob}
              disabled={saving}
              className="w-full rounded-full border border-border text-ink text-sm font-semibold py-3 mt-2 hover:bg-pageBg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save Job'}
            </button>
            {!user && (
              <p className="text-xs text-muted text-center mt-3">
                <Link href="/login" className="text-brandGreen hover:underline">
                  Sign in
                </Link> to apply for this job
              </p>
            )}
          </div>

          {relatedJobs.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="text-sm font-semibold text-ink mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                {relatedJobs.map((relatedJob: any) => (
                  <Link
                    key={relatedJob.id}
                    href={`/jobs/${relatedJob.id}`}
                    className="block rounded-lg hover:bg-pageBg p-2 -mx-2 transition-colors"
                  >
                    <p className="text-sm font-semibold text-ink line-clamp-1">{relatedJob.title}</p>
                    <p className="text-xs text-muted mt-0.5">{relatedJob.company.name} · {relatedJob.location}</p>
                    <p className="text-xs text-brandGreen mt-1">{formatJobType(getJobType(relatedJob))}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Application Modal */}
      {job && showApplicationModal && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          jobId={job.id}
          jobTitle={job.title}
          companyName={job.company.name}
          existingApplication={existingApplication}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}
