'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  User, 
  Briefcase, 
  FileText, 
  Heart, 
  Settings, 
  Building2,
  Wallet,
  MessageSquare,
  BarChart3,
  Users,
  Zap,
  LogOut,
  Bell,
  ChevronRight
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandGreen"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getNavigationItems = () => {
    const baseItems = [
      { label: 'Overview', href: '/dashboard', icon: BarChart3 },
      { label: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    if (user.role === 'JOB_SEEKER') {
      return [
        ...baseItems,
        { label: 'Applications', href: '/dashboard/applications', icon: FileText },
        { label: 'Saved Jobs', href: '/dashboard/saved', icon: Heart },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'EMPLOYER') {
      return [
        ...baseItems,
        { label: 'My Jobs', href: '/dashboard/jobs', icon: Briefcase },
        { label: 'Company', href: '/dashboard/company', icon: Building2 },
        { label: 'Applications', href: '/dashboard/applications', icon: FileText },
        { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'FREELANCER') {
      return [
        ...baseItems,
        { label: 'Gigs', href: '/freelance', icon: Zap },
        { label: 'My Bids', href: '/dashboard/freelance', icon: FileText },
        { label: 'Contracts', href: '/dashboard/freelance?tab=contracts', icon: Briefcase },
        { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
        { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        ...baseItems,
        { label: 'Users', href: '/dashboard/users', icon: Users },
        { label: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
        { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-pageBg">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-sm border-r border-border min-h-screen flex flex-col">
          {/* User Profile */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brandGreen to-darkGreen text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-md">
                {user.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-muted capitalize">
                  {user.role.toLowerCase().replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive 
                      ? 'bg-brandGreen text-white shadow-md' 
                      : 'text-muted hover:text-ink hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-muted hover:text-ink hover:bg-gray-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </button>
            <button 
              onClick={() => {
                // Handle logout
                router.push('/login');
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}