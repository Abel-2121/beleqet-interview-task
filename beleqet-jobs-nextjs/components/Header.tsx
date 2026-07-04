'use client';

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, User, Briefcase, Heart, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import NotificationBell from "@/components/NotificationBell";

const navItems = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Freelance", href: "/freelance" },
  { label: "About Us", href: "/about" },
  { label: "CV Maker", href: "/cv-maker" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  };

  const getRoleBadge = () => {
    if (!user) return '';
    switch (user.role) {
      case 'EMPLOYER':
        return 'Employer';
      case 'FREELANCER':
        return 'Freelancer';
      case 'JOB_SEEKER':
        return 'Job Seeker';
      case 'ADMIN':
        return 'Admin';
      default:
        return '';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="container-page flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-primary">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen text-white text-sm">
            B
          </span>
          <span>
            Beleqet <span className="text-brandGreen">Jobs</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brandGreen transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              {/* Post Job Button - Show for employers and admins */}
              {(user.role === 'EMPLOYER' || user.role === 'ADMIN') && (
                <Link
                  href="/post-job"
                  className="hidden sm:inline-flex items-center rounded-full bg-brandGreen px-4 py-2 text-sm font-semibold text-white hover:bg-darkGreen transition-colors"
                >
                  Post a Job
                </Link>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-brandGreen text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {user.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-ink">{getUserDisplayName()}</div>
                    <div className="text-xs text-muted">{getRoleBadge()}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-1 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <div className="text-sm font-medium text-ink">{getUserDisplayName()}</div>
                      <div className="text-sm text-muted">{user.email}</div>
                      <div className="text-xs text-brandGreen mt-1">{getRoleBadge()}</div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/applications"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Briefcase className="w-4 h-4" />
                        My Applications
                      </Link>
                      <Link
                        href="/dashboard/saved"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Heart className="w-4 h-4" />
                        Saved Jobs
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-ink hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>
                    
                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Guest User Actions */}
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-medium text-ink hover:text-brandGreen transition-colors"
              >
                Login / Sign Up
              </Link>
              <Link
                href="/post-job"
                className="inline-flex items-center rounded-full bg-brandGreen px-4 py-2 text-sm font-semibold text-white hover:bg-darkGreen transition-colors"
              >
                Post a Job
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-ink hover:text-brandGreen"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-border">
          <nav className="container-page py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-sm font-medium text-ink hover:text-brandGreen transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                className="block py-2 text-sm font-medium text-ink hover:text-brandGreen transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Login / Sign Up
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
