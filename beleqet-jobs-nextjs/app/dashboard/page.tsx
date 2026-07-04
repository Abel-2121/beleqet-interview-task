'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, getApplicationCount, isJobOpen } from '@/lib/api';
import { Briefcase, Users, FileText, TrendingUp, Calendar, Bell } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeJobs: 0,
    savedJobs: 0,
    profileViews: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load notifications
      const notificationsData = await api.getNotifications();
      setNotifications(Array.isArray(notificationsData) ? notificationsData.slice(0, 5) : []);

      // Load stats based on user role
      if (user?.role === 'JOB_SEEKER') {
        const applicationsResponse = await api.getMyApplications();
        const applicationsList = applicationsResponse.data || [];
        const savedJobs = await api.getSavedJobs().catch(() => []);
        setStats(prev => ({ 
          ...prev, 
          totalApplications: applicationsList.length,
          activeJobs: applicationsList.filter((app: any) => app.status === 'SUBMITTED' || app.status === 'SCREENING').length,
          savedJobs: Array.isArray(savedJobs) ? savedJobs.length : 0,
        }));
      }

      if (user?.role === 'EMPLOYER') {
        const jobsResponse = await api.getMyJobs();
        const jobsList = jobsResponse.data || [];
        setStats(prev => ({ 
          ...prev, 
          activeJobs: jobsList.filter((job: any) => isJobOpen(job)).length,
          totalApplications: jobsList.reduce((sum: number, job: any) => sum + getApplicationCount(job), 0)
        }));
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.firstName}!`;
  };

  const getStatsCards = () => {
    if (user?.role === 'JOB_SEEKER') {
      return [
        { title: 'Applications Sent', value: stats.totalApplications, icon: FileText, color: 'blue' },
        { title: 'Active Applications', value: stats.activeJobs, icon: TrendingUp, color: 'green' },
        { title: 'Saved Jobs', value: stats.savedJobs, icon: Briefcase, color: 'purple' },
        { title: 'Profile Views', value: stats.profileViews, icon: Users, color: 'orange' },
      ];
    }

    if (user?.role === 'EMPLOYER') {
      return [
        { title: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'blue' },
        { title: 'Total Applications', value: stats.totalApplications, icon: FileText, color: 'green' },
        { title: 'Candidates Hired', value: 0, icon: Users, color: 'purple' },
        { title: 'Job Views', value: 0, icon: TrendingUp, color: 'orange' },
      ];
    }

    return [];
  };

  const statsCards = getStatsCards();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-ink">{getWelcomeMessage()}</h1>
        <p className="text-muted mt-2">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-ink mt-2">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                card.color === 'green' ? 'bg-green-50 text-green-600' :
                card.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-orange-50 text-orange-600'
              }`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-ink mb-4">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted">No recent activity</p>
                <p className="text-sm text-muted mt-1">Your recent actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Activity items would go here */}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-muted">No notifications</p>
                <p className="text-sm text-muted mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification: any) => (
                  <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-ink">{notification.title}</p>
                    <p className="text-xs text-muted mt-1">{notification.message}</p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-ink mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user?.role === 'JOB_SEEKER' && (
            <>
              <a href="/jobs" className="p-4 border border-border rounded-lg hover:border-brandGreen transition-colors group">
                <Briefcase className="w-6 h-6 text-brandGreen mb-2" />
                <h4 className="font-medium text-ink group-hover:text-brandGreen">Find Jobs</h4>
                <p className="text-sm text-muted">Browse available positions</p>
              </a>
              <a href="/dashboard/profile" className="p-4 border border-border rounded-lg hover:border-brandGreen transition-colors group">
                <Users className="w-6 h-6 text-brandGreen mb-2" />
                <h4 className="font-medium text-ink group-hover:text-brandGreen">Update Profile</h4>
                <p className="text-sm text-muted">Keep your profile current</p>
              </a>
            </>
          )}
          {user?.role === 'EMPLOYER' && (
            <>
              <a href="/post-job" className="p-4 border border-border rounded-lg hover:border-brandGreen transition-colors group">
                <Briefcase className="w-6 h-6 text-brandGreen mb-2" />
                <h4 className="font-medium text-ink group-hover:text-brandGreen">Post New Job</h4>
                <p className="text-sm text-muted">Add a job opening</p>
              </a>
              <a href="/dashboard/applications" className="p-4 border border-border rounded-lg hover:border-brandGreen transition-colors group">
                <FileText className="w-6 h-6 text-brandGreen mb-2" />
                <h4 className="font-medium text-ink group-hover:text-brandGreen">Review Applications</h4>
                <p className="text-sm text-muted">Check candidate applications</p>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}