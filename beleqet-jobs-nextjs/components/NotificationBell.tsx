'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/** Bell icon with unread badge and dropdown notification list. */
export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    api.getNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const unread = notifications.filter((n) => !n.read).length;

  // Mark a single notification as read optimistically
  const markRead = async (id: string) => {
    await api.markNotificationRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-ink" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted text-center">No notifications yet</p>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-gray-50 ${!n.read ? 'bg-brandGreen/5' : ''}`}
              >
                <p className="text-sm font-medium text-ink">{n.title}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </button>
            ))
          )}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-brandGreen font-semibold text-center hover:bg-gray-50"
          >
            View dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
