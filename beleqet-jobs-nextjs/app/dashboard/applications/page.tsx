'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Star,
  Filter,
  Search,
  ChevronDown,
  Eye,
  MessageSquare,
  Calendar as CalendarIcon,
  Send,
  Download,
  MoreVertical
} from 'lucide-react';

interface Application {
  id: string;
  jobId: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  score?: number;
  job?: { title: string; location: string };
  user?: { firstName: string; lastName: string; email: string };
  jobTitle?: string;
  companyName?: string;
}

interface JobPosting {
  id: string;
  title: string;
}

/** Applications list page: job seekers see their own apps, employers see apps for their jobs */
export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const isEmployer = user?.role === 'EMPLOYER' || user?.role === 'ADMIN';

  // Load data based on user role (seeker vs employer)
  useEffect(() => {
    if (isEmployer) {
      loadEmployerData();
    } else {
      loadSeekerApplications();
    }
  }, [isEmployer, selectedJobId]);

  /** Fetch applications submitted by the current job seeker */
  const loadSeekerApplications = async () => {
    try {
      setLoading(true);
      const response = await api.getApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch employer's jobs and applications for the selected job */
  const loadEmployerData = async () => {
    try {
      setLoading(true);
      const jobsResponse = await api.getMyJobs();
      const jobsList = jobsResponse.data || [];
      setJobs(jobsList);

      if (jobsList.length > 0) {
        const jobId = selectedJobId || jobsList[0].id;
        setSelectedJobId(jobId);
        const apps = await api.getJobApplications(jobId);
        setApplications(Array.isArray(apps) ? apps : []);
      }
    } catch (error) {
      console.error('Failed to load employer applications:', error);
    } finally {
      setLoading(false);
    }
  };

  /** Update an application's status (employer action) */
  const updateStatus = async (appId: string, status: string) => {
    try {
      await api.updateApplicationStatus(appId, status);
      loadEmployerData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApplications = applications.filter((app) =>
    filter === 'ALL' ? true : app.status === filter
  );

  const statusColors: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-200',
    SCREENING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    SHORTLISTED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-800 border-purple-200',
    INTERVIEW_COMPLETED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    OFFERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    OFFER_ACCEPTED: 'bg-teal-100 text-teal-800 border-teal-200',
    OFFER_DECLINED: 'bg-orange-100 text-orange-800 border-orange-200',
    WITHDRAWN: 'bg-gray-100 text-gray-800 border-gray-200',
    HIRED: 'bg-brandGreen text-white border-brandGreen',
  };

  const statusIcons: Record<string, any> = {
    SUBMITTED: Clock,
    SCREENING: Search,
    SHORTLISTED: Star,
    REJECTED: XCircle,
    INTERVIEW_SCHEDULED: CalendarIcon,
    INTERVIEW_COMPLETED: CheckCircle,
    OFFERED: Send,
    OFFER_ACCEPTED: CheckCircle,
    OFFER_DECLINED: XCircle,
    WITHDRAWN: XCircle,
    HIRED: CheckCircle,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">
            {isEmployer ? 'Review Applications' : 'My Applications'}
          </h1>
          <p className="text-muted mt-2">
            {isEmployer ? 'Review candidates for your job postings' : 'Track your job applications'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {isEmployer && jobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <label className="text-sm font-medium text-ink mr-3">Select Job:</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandGreen"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'SUBMITTED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFERED', 'REJECTED', 'WITHDRAWN'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status 
                  ? 'bg-brandGreen text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-ink font-semibold">No applications found</p>
          {!isEmployer && (
            <Link href="/jobs" className="inline-block mt-4 text-brandGreen font-semibold hover:underline">
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const StatusIcon = statusIcons[app.status] || FileText;
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-ink text-lg">
                        {isEmployer
                          ? `${app.user?.firstName ?? ''} ${app.user?.lastName ?? ''}`.trim() || 'Candidate'
                          : app.job?.title || app.jobTitle || 'Job Application'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[app.status] || 'bg-gray-100 text-gray-800 border-gray-200'} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted">
                      {isEmployer ? app.user?.email : app.companyName || app.job?.location}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-muted" />
                  </button>
                </div>

                {app.coverLetter && (
                  <p className="text-sm text-muted line-clamp-3 mb-4 bg-gray-50 p-3 rounded-lg">{app.coverLetter}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    {app.score != null && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-brandGreen" />
                        <span className="font-semibold text-brandGreen">AI Score: {app.score}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEmployer && (
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => updateStatus(app.id, 'SHORTLISTED')} 
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Shortlist
                    </button>
                    <button 
                      onClick={() => updateStatus(app.id, 'REJECTED')} 
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                )}

                {!isEmployer && app.status === 'OFFERED' && (
                  <div className="flex gap-2 mt-4">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-brandGreen text-white rounded-lg hover:bg-darkGreen transition-colors">
                      <CheckCircle className="w-4 h-4" />
                      Accept Offer
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors">
                      <XCircle className="w-4 h-4" />
                      Decline Offer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
