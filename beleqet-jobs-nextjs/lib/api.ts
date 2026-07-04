// API Client for Beleqet Backend

/** Extended error with HTTP status and response payload. */
interface ApiError extends Error {
  status?: number;
  data?: any;
}

/** HTTP client wrapping fetch with token auth, auto-refresh, and typed responses. */
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  }

  /** Generic fetch wrapper — injects auth header, parses JSON, retries on 401. */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = new Error(errorData.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 401) {
        await this.refreshToken();
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${this.getToken()}`,
          },
        };
        const response = await fetch(`${this.baseURL}${endpoint}`, retryConfig);
        if (response.ok) {
          return response.json();
        }
      }
      throw error;
    }
  }

  /** Read the auth token from localStorage (no-op on server). */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  /** Persist the auth token to localStorage. */
  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  }

  /** Clear stored auth and refresh tokens. */
  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  /** Attempt to refresh the access token; redirect to login on failure. */
  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        this.setToken(accessToken);
      } else {
        this.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch {
      this.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // ── Auth endpoints ──────────────────────────────────────────────

  /** Authenticate user and store access + refresh tokens. */
  async login(email: string, password: string) {
    const response = await this.request<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }

  /** Create a new account and automatically log in. */
  async register(data: RegisterData) {
    const response = await this.request<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }

  /** End the session and clear all stored tokens. */
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Continue with client-side cleanup even if server request fails
    }
    this.removeToken();
  }

  /** Fetch the currently authenticated user's profile. */
  async getProfile() {
    return this.request<User>('/auth/me');
  }

  // ── Job endpoints ──────────────────────────────────────────────

  /** List jobs with optional filters; normalises pagination format. */
  async getJobs(params: JobSearchParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value.toString());
    });
    
    const raw = await this.request<any>(`/jobs?${query.toString()}`);
    // Normalize: backend Docker image returns { items, total, page, totalPages }
    return {
      data: raw.data || raw.items || [],
      total: raw.total ?? 0,
      page: raw.page ?? 1,
      totalPages: raw.totalPages ?? 1,
    } as PaginatedJobs;
  }

  /** Fetch a single job by its ID. */
  async getJob(id: string) {
    return this.request<JobDetail>(`/jobs/${id}`);
  }

  /** Create a new job listing (employer only). */
  async createJob(data: CreateJobData) {
    const payload = {
      title: data.title,
      description: data.description,
      location: data.location,
      type: data.jobType,
      categoryId: data.categoryId,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : data.requirements,
    };
    return this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** Get aggregate dashboard counts (jobs, companies, candidates, applications). */
  async getJobStats() {
    return this.request<{ jobs: number; companies: number; candidates: number; applications: number }>('/jobs/stats');
  }

  /** Fetch the current employer's own job listings. */
  async getMyJobs() {
    const response = await this.request<any>('/jobs/my');
    return {
      data: response.data || response || [],
      total: Array.isArray(response) ? response.length : response.total || 0,
    };
  }

  /** Fetch all job categories with counts. */
  async getJobCategories() {
    const raw = await this.request<any>('/jobs/categories');
    return (Array.isArray(raw) ? raw : raw?.data || raw?.items || []) as JobCategory[];
  }

  // ── Application endpoints ──────────────────────────────────────

  /** Submit a job application with cover letter and optional resume. */
  async submitApplication(data: ApplicationData) {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Update an existing application (e.g. change cover letter or resume). */
  async updateApplication(id: string, data: UpdateApplicationData) {
    return this.request<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /** Fetch the current user's own applications. */
  async getMyApplications() {
    const response = await this.request<any>('/applications/my');
    return {
      data: response.data || response || [],
      total: Array.isArray(response) ? response.length : response.total || 0,
    };
  }

  /** Alias for getMyApplications(). */
  async getApplications() {
    return this.getMyApplications();
  }

  /** Fetch all applications for a specific job (employer only). */
  async getJobApplications(jobId: string) {
    return this.request<Application[]>(`/applications/job/${jobId}`);
  }

  /** Update the status of an application (e.g. shortlisted, rejected). */
  async updateApplicationStatus(id: string, status: string) {
    return this.request<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ── Saved Jobs endpoints ───────────────────────────────────────

  /** Fetch all saved/bookmarked jobs. */
  async getSavedJobs() {
    const raw = await this.request<any>('/saved-jobs');
    return (Array.isArray(raw) ? raw : raw?.data || []) as SavedJob[];
  }

  /** Bookmark a job for later. */
  async saveJob(jobId: string) {
    return this.request<SavedJob>('/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  }

  /** Check whether a specific job is already saved. */
  async isJobSaved(jobId: string): Promise<boolean> {
    try {
      const saved = await this.getSavedJobs();
      return saved.some((item) => item.jobId === jobId);
    } catch {
      return false;
    }
  }

  /** Remove a previously saved job. */
  async removeSavedJob(jobId: string) {
    return this.request<void>(`/saved-jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  /** Get a presigned signature for direct Cloudinary file upload. */
  async getUploadSignature(filename: string, contentType: string, folder = 'beleqet') {
    return this.request<{
      uploadUrl: string;
      apiKey: string;
      timestamp: number;
      signature: string;
      folder: string;
    }>('/uploads/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType, folder }),
    });
  }

  // ── Freelance endpoints ────────────────────────────────────────

  /** List freelance jobs/gigs with optional filters. */
  async getFreelanceJobs(params: JobSearchParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value.toString());
    });
    
    const response = await this.request<any>(`/freelance/jobs?${query.toString()}`);
    const list = response.data || response.items || (Array.isArray(response) ? response : []);
    return {
      data: list,
      total: response.total || list.length,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    };
  }

  /** Alias for getFreelanceJobs(). */
  async getFreelanceGigs(params: any = {}) {
    return this.getFreelanceJobs(params);
  }

  /** Fetch a single freelance gig by ID. */
  async getFreelanceGig(gigId: string) {
    return this.request<any>(`/freelance/jobs/${gigId}`);
  }

  /** Create a new freelance gig listing. */
  async createFreelanceJob(data: CreateFreelanceJobData) {
    return this.request<FreelanceJob>('/freelance/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Submit a bid on a freelance gig. */
  async submitBid(data: { freelanceJobId: string; amount: number; deliveryDays: number; proposal: string }) {
    return this.request<Bid>(`/freelance/jobs/${data.freelanceJobId}/bids`, {
      method: 'POST',
      body: JSON.stringify({
        amount: data.amount,
        timelineDays: data.deliveryDays,
        coverLetter: data.proposal,
      }),
    });
  }

  /** Fetch all bids placed by the current freelancer. */
  async getMyBids() {
    const response = await this.request<any>('/freelance/my-bids');
    return {
      data: response.data || response || [],
      total: Array.isArray(response) ? response.length : response.total || 0,
    };
  }

  /** Fetch all contracts for the current user. */
  async getMyContracts() {
    const response = await this.request<any>('/freelance/contracts/my');
    const list = Array.isArray(response) ? response : response.data || [];
    return {
      data: list,
      total: list.length,
    };
  }

  /** Accept a freelancer's bid and create a contract. */
  async acceptBid(bidId: string) {
    return this.request<Contract>(`/freelance/bids/${bidId}/accept`, {
      method: 'PATCH',
    });
  }

  // ── User endpoints ─────────────────────────────────────────────

  /** Update the current user's profile fields. */
  async updateProfile(data: Partial<User>) {
    return this.request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /** Create a company profile for the employer account. */
  async createCompany(data: CompanyData) {
    return this.request<Company>('/users/company', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Update the employer's company profile. */
  async updateCompany(data: CompanyData) {
    return this.request<Company>('/users/company', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /** Fetch the employer's company profile. */
  async getCompany() {
    return this.request<Company>('/users/company');
  }

  /** Request a password-reset email. */
  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /** Reset password using a token received via email. */
  async resetPassword(token: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  /** Admin: fetch all registered users. */
  async getAdminUsers() {
    return this.request<any[]>('/admin/users');
  }

  /** Admin: suspend a user account. */
  async suspendUser(userId: string) {
    return this.request<any>(`/admin/users/${userId}/suspend`, { method: 'PATCH' });
  }

  /** Fetch the current user's chat rooms. */
  async getChatRooms() {
    return this.request<any[]>('/chat/rooms');
  }

  /** Fetch messages for a given chat room. */
  async getChatMessages(roomId: string) {
    return this.request<any[]>(`/chat/rooms/${roomId}/messages`);
  }

  /** Fetch all notifications for the current user. */
  async getNotifications() {
    return this.request<Notification[]>('/users/notifications');
  }

  /** Mark a single notification as read. */
  async markNotificationRead(id: string) {
    return this.request<void>(`/users/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  // ── CV endpoints ───────────────────────────────────────────────

  /** Generate an AI-written professional summary for a CV. */
  async generateCvSummary(data: { title?: string; skills: string[]; experience: { role: string; company: string; description: string }[] }) {
    return this.request<{ summary: string }>('/cv/generate-summary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Improve a work-experience description using AI. */
  async improveDescription(data: { role: string; company: string; description: string }) {
    return this.request<{ improved: string }>('/cv/improve-description', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Suggest relevant skills based on job title and experience. */
  async suggestSkills(data: { title?: string; experience: { role: string; company: string; description: string }[] }) {
    return this.request<{ skills: string[] }>('/cv/suggest-skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ── Wallet endpoints ───────────────────────────────────────────

  /** Fetch the current user's wallet details. */
  async getWallet() {
    return this.request<Wallet>('/wallet');
  }

  /** Alias for getWallet(). */
  async getWalletBalance() {
    return this.getWallet();
  }

  /** Fetch paginated wallet transactions with optional filters. */
  async getTransactions(params: TransactionParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value.toString());
    });
    
    const response = await this.request<any>(`/wallet/transactions?${query.toString()}`);
    return {
      data: response.data || response || [],
      total: response.total || 0,
      page: response.page || 1,
      totalPages: response.totalPages || 1,
    };
  }

  /** Alias for getTransactions(). */
  async getTransactionHistory() {
    return this.getTransactions();
  }

  /** Submit a withdrawal request from the wallet. */
  async requestWithdrawal(data: WithdrawalRequest) {
    return this.request<WithdrawalResponse>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ── Payment endpoints ──────────────────────────────────────────

  /** Start an escrow-based payment for a freelance gig. */
  async initiateEscrow(gigId: string) {
    return this.request<EscrowResponse>(`/escrow/initiate/${gigId}`, {
      method: 'POST',
    });
  }

  /** Get details of an escrow transaction. */
  async getEscrowDetails(escrowId: string) {
    return this.request<EscrowDetails>(`/escrow/${escrowId}`);
  }

  /** Initiate checkout for a paid plan subscription. */
  async initiatePlanCheckout(planId: 'basic' | 'featured' | 'enterprise') {
    return this.request<PlanCheckoutResponse>('/payments/plans/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }
}

// ── Shared Types ──────────────────────────────────────────────────

/** Authenticated user profile returned by the API. */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYER' | 'JOB_SEEKER' | 'FREELANCER';
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  portfolioUrl?: string;
  resumeUrl?: string;
  company?: Company;
}

/** Payload for user registration (role defaults to JOB_SEEKER). */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'JOB_SEEKER' | 'EMPLOYER' | 'FREELANCER';
}

/** A job listing with company, category, and status metadata. */
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  type: string;
  categoryId: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  category?: {
    id: string;
    slug?: string;
    label?: string;
    name?: string;
    icon?: string;
  };
  company: Company;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  featured?: boolean;
  filled?: boolean;
  deadline?: string | null;
  expiryDate?: string | null;
  applicationCount?: number;
  _count?: {
    applications: number;
  };
  isActive?: boolean;
}

/** Check whether a job is still accepting applications. */
export const isJobOpen = (job: Pick<Job, 'status' | 'filled' | 'isActive'>): boolean => {
  // Uses isActive if present; otherwise falls back to status/filled check
  if (typeof job.isActive === 'boolean') return job.isActive;
  return job.status === 'PUBLISHED' && !job.filled;
};

/** Safely read job type — supports both "type" and legacy "jobType" fields. */
export const jobType = (job: Job): string => (job as any).jobType || job.type;

/** Get application count from either top-level or _count field. */
export const getApplicationCount = (job: Job): number => {
  return job.applicationCount ?? job._count?.applications ?? 0;
};

/** A job detail that optionally includes its related applications. */
export interface JobDetail extends Job {
  applications?: Application[];
}

/** Filters and pagination options for job listing queries. */
export interface JobSearchParams {
  q?: string;
  category?: string;
  location?: string;
  type?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

/** Paginated job listing response. */
export interface PaginatedJobs {
  data: Job[];
  total: number;
  page: number;
  totalPages: number;
}

/** Payload for creating a new job listing. */
export interface CreateJobData {
  title: string;
  description: string;
  requirements: string[];
  location: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  categoryId: string;
}

/** A job category with display name and job count. */
export interface JobCategory {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  jobCount: number;
}

/** A job application submitted by a user. */
export interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string;
  resumeUrl?: string;
  status: string;
  score?: number;
  feedback?: string;
  createdAt: string;
  job: Job;
}

/** Payload for submitting a new application. */
export interface ApplicationData {
  jobId: string;
  coverLetter: string;
  resumeUrl?: string;
}

/** Fields that can be patched on an existing application. */
export interface UpdateApplicationData {
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: number;
}

/** A company/employer profile. */
export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  industry?: string;
  size?: string;
  location?: string;
}

/** Payload for creating or updating a company profile. */
export interface CompanyData {
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  industry?: string;
  size?: string;
  location?: string;
}

/** A freelance gig listing with budget, skills, and bids. */
export interface FreelanceJob {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  deadline: string;
  skills: string[];
  category: JobCategory;
  client: User;
  bids: Bid[];
  status: string;
  createdAt: string;
}

/** Paginated freelance job listing response. */
export interface PaginatedFreelanceJobs {
  data: FreelanceJob[];
  total: number;
  page: number;
  totalPages: number;
}

/** Payload for creating a new freelance gig. */
export interface CreateFreelanceJobData {
  title: string;
  description: string;
  categoryId: string;
  budgetMin: number;
  budgetMax: number;
  deadlineDays: number;
  skills: string[];
}

/** A bid placed by a freelancer on a gig. */
export interface Bid {
  id: string;
  amount: number;
  deliveryDays: number;
  proposal: string;
  freelancer: User;
  status: string;
  createdAt: string;
}

/** Payload for submitting a bid on a freelance gig. */
export interface BidData {
  amount: number;
  deliveryDays: number;
  proposal: string;
}

/** A contract between client and freelancer with milestones. */
export interface Contract {
  id: string;
  freelanceJobId: string;
  clientId: string;
  freelancerId: string;
  agreedAmount: number;
  status: string;
  milestones: Milestone[];
}

/** A milestone within a contract with deliverables. */
export interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  deliverables: Deliverable[];
}

/** A completed deliverable attached to a milestone. */
export interface Deliverable {
  id: string;
  fileUrl: string;
  description: string;
  createdAt: string;
}

/** A user notification with read status. */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

/** A saved/bookmarked job with its full job data. */
export interface SavedJob {
  id: string;
  jobId: string;
  job: Job;
  savedAt: string;
}

// ── Wallet / Transaction Types ───────────────────────────────────

/** User wallet with available, pending, and total earned balances. */
export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/** A single wallet transaction (deposit, withdrawal, escrow, etc.). */
export interface Transaction {
  id: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'EARNINGS';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  reference?: string;
  createdAt: string;
}

/** Paginated transaction list response. */
export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

/** Filters for querying wallet transactions. */
export interface TransactionParams {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/** Payload for requesting a wallet withdrawal. */
export interface WithdrawalRequest {
  amount: number;
  bankAccount: string;
}

/** Result of a submitted withdrawal request. */
export interface WithdrawalResponse {
  id: string;
  walletId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  bankAccount: string;
  requestedAt: string;
  completedAt?: string;
}

/** Response from initiating an escrow payment. */
export interface EscrowResponse {
  escrowId: string;
  checkoutUrl: string;
  txRef?: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
}

/** Escrow details including the underlying transaction. */
export interface EscrowDetails extends EscrowResponse {
  transaction?: Transaction;
}

/** Response from initiating a paid-plan checkout. */
export interface PlanCheckoutResponse {
  planId: string;
  amount: number;
  txRef?: string;
  checkoutUrl?: string | null;
  message?: string;
}

// Export singleton instance
export const api = new ApiClient();
