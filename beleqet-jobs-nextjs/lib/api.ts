// API Client for Beleqet Backend
interface ApiError extends Error {
  status?: number;
  data?: any;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  }

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

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

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

  // Auth endpoints
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

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Continue with client-side cleanup even if server request fails
    }
    this.removeToken();
  }

  async getProfile() {
    return this.request<User>('/auth/me');
  }

  // Job endpoints
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

  async getJob(id: string) {
    return this.request<JobDetail>(`/jobs/${id}`);
  }

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

  async getJobStats() {
    return this.request<{ jobs: number; companies: number; candidates: number; applications: number }>('/jobs/stats');
  }

  async getMyJobs() {
    const response = await this.request<any>('/jobs/my');
    return {
      data: response.data || response || [],
      total: Array.isArray(response) ? response.length : response.total || 0,
    };
  }

  async getJobCategories() {
    const raw = await this.request<any>('/jobs/categories');
    return (Array.isArray(raw) ? raw : raw?.data || raw?.items || []) as JobCategory[];
  }

  // Application endpoints
  async submitApplication(data: ApplicationData) {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplication(id: string, data: UpdateApplicationData) {
    return this.request<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getMyApplications() {
    const response = await this.request<any>('/applications/my');
    return {
      data: response.data || response || [],
      total: Array.isArray(response) ? response.length : response.total || 0,
    };
  }

  async getApplications() {
    return this.getMyApplications();
  }

  async getJobApplications(jobId: string) {
    return this.request<Application[]>(`/applications/job/${jobId}`);
  }

  async updateApplicationStatus(id: string, status: string) {
    return this.request<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Saved Jobs endpoints
  async getSavedJobs() {
    const raw = await this.request<any>('/saved-jobs');
    return (Array.isArray(raw) ? raw : raw?.data || []) as SavedJob[];
  }

  async saveJob(jobId: string) {
    return this.request<SavedJob>('/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  }

  async isJobSaved(jobId: string): Promise<boolean> {
    try {
      const saved = await this.getSavedJobs();
      return saved.some((item) => item.jobId === jobId);
    } catch {
      return false;
    }
  }

  async removeSavedJob(jobId: string) {
    return this.request<void>(`/saved-jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

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

  // Freelance endpoints
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

  async getFreelanceGigs(params: any = {}) {
    return this.getFreelanceJobs(params);
  }

  async getFreelanceGig(gigId: string) {
    return this.request<any>(`/freelance/jobs/${gigId}`);
  }

  async createFreelanceJob(data: CreateFreelanceJobData) {
    return this.request<FreelanceJob>('/freelance/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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

  async getMyBids() {
    const response = await this.request<any>('/freelance/my-bids');
    return {
      data: response.data || response || [],
      total: Array.isArray(response) ? response.length : response.total || 0,
    };
  }

  async getMyContracts() {
    const response = await this.request<any>('/freelance/contracts/my');
    const list = Array.isArray(response) ? response : response.data || [];
    return {
      data: list,
      total: list.length,
    };
  }

  async acceptBid(bidId: string) {
    return this.request<Contract>(`/freelance/bids/${bidId}/accept`, {
      method: 'PATCH',
    });
  }

  // User endpoints
  async updateProfile(data: Partial<User>) {
    return this.request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createCompany(data: CompanyData) {
    return this.request<Company>('/users/company', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompany(data: CompanyData) {
    return this.request<Company>('/users/company', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getCompany() {
    return this.request<Company>('/users/company');
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async getAdminUsers() {
    return this.request<any[]>('/admin/users');
  }

  async suspendUser(userId: string) {
    return this.request<any>(`/admin/users/${userId}/suspend`, { method: 'PATCH' });
  }

  async getChatRooms() {
    return this.request<any[]>('/chat/rooms');
  }

  async getChatMessages(roomId: string) {
    return this.request<any[]>(`/chat/rooms/${roomId}/messages`);
  }

  async getNotifications() {
    return this.request<Notification[]>('/users/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<void>(`/users/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  // CV endpoints
  async generateCvSummary(data: { title?: string; skills: string[]; experience: { role: string; company: string; description: string }[] }) {
    return this.request<{ summary: string }>('/cv/generate-summary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async improveDescription(data: { role: string; company: string; description: string }) {
    return this.request<{ improved: string }>('/cv/improve-description', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async suggestSkills(data: { title?: string; experience: { role: string; company: string; description: string }[] }) {
    return this.request<{ skills: string[] }>('/cv/suggest-skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Wallet endpoints
  async getWallet() {
    return this.request<Wallet>('/wallet');
  }

  async getWalletBalance() {
    return this.getWallet();
  }

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

  async getTransactionHistory() {
    return this.getTransactions();
  }

  async requestWithdrawal(data: WithdrawalRequest) {
    return this.request<WithdrawalResponse>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payment endpoints
  async initiateEscrow(gigId: string) {
    return this.request<EscrowResponse>(`/escrow/initiate/${gigId}`, {
      method: 'POST',
    });
  }

  async getEscrowDetails(escrowId: string) {
    return this.request<EscrowDetails>(`/escrow/${escrowId}`);
  }

  async initiatePlanCheckout(planId: 'basic' | 'featured' | 'enterprise') {
    return this.request<PlanCheckoutResponse>('/payments/plans/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }
}

// Types
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

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'JOB_SEEKER' | 'EMPLOYER' | 'FREELANCER';
}

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

// Helper: whether a job accepts applications
export const isJobOpen = (job: Pick<Job, 'status' | 'filled' | 'isActive'>): boolean => {
  if (typeof job.isActive === 'boolean') return job.isActive;
  return job.status === 'PUBLISHED' && !job.filled;
};

// Helper: safely read job type (supports both "type" and legacy "jobType")
export const jobType = (job: Job): string => (job as any).jobType || job.type;

// Helper: get application count from either field
export const getApplicationCount = (job: Job): number => {
  return job.applicationCount ?? job._count?.applications ?? 0;
};

export interface JobDetail extends Job {
  applications?: Application[];
}

export interface JobSearchParams {
  q?: string;
  category?: string;
  location?: string;
  type?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedJobs {
  data: Job[];
  total: number;
  page: number;
  totalPages: number;
}

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

export interface JobCategory {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  jobCount: number;
}

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

export interface ApplicationData {
  jobId: string;
  coverLetter: string;
  resumeUrl?: string;
}

export interface UpdateApplicationData {
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: number;
}

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

export interface CompanyData {
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  industry?: string;
  size?: string;
  location?: string;
}

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

export interface PaginatedFreelanceJobs {
  data: FreelanceJob[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateFreelanceJobData {
  title: string;
  description: string;
  categoryId: string;
  budgetMin: number;
  budgetMax: number;
  deadlineDays: number;
  skills: string[];
}

export interface Bid {
  id: string;
  amount: number;
  deliveryDays: number;
  proposal: string;
  freelancer: User;
  status: string;
  createdAt: string;
}

export interface BidData {
  amount: number;
  deliveryDays: number;
  proposal: string;
}

export interface Contract {
  id: string;
  freelanceJobId: string;
  clientId: string;
  freelancerId: string;
  agreedAmount: number;
  status: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  deliverables: Deliverable[];
}

export interface Deliverable {
  id: string;
  fileUrl: string;
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface SavedJob {
  id: string;
  jobId: string;
  job: Job;
  savedAt: string;
}

// Wallet types
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

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TransactionParams {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface WithdrawalRequest {
  amount: number;
  bankAccount: string;
}

export interface WithdrawalResponse {
  id: string;
  walletId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  bankAccount: string;
  requestedAt: string;
  completedAt?: string;
}

export interface EscrowResponse {
  escrowId: string;
  checkoutUrl: string;
  txRef?: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
}

export interface EscrowDetails extends EscrowResponse {
  transaction?: Transaction;
}

export interface PlanCheckoutResponse {
  planId: string;
  amount: number;
  txRef?: string;
  checkoutUrl?: string | null;
  message?: string;
}

// Export singleton instance
export const api = new ApiClient();
