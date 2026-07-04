'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Users, ShieldOff, Loader } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

/** Admin-only page for managing platform users: view list and suspend accounts */
export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-admin users and fetch user list
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    loadUsers();
  }, [user, router]);

  /** Fetch the full list of platform users */
  const loadUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /** Suspend a user account after confirmation */
  const handleSuspend = async (userId: string) => {
    if (!confirm('Suspend this user?')) return;
    await api.suspendUser(userId);
    loadUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-brandGreen" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">User Management</h1>
        <p className="text-muted mt-2">Admin panel — manage platform users</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-ink">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-ink">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-ink">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-ink">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.isActive && u.role !== 'ADMIN' && (
                    <button
                      onClick={() => handleSuspend(u.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      <ShieldOff className="w-3.5 h-3.5" /> Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-muted">No users found or insufficient permissions.</p>
        )}
      </div>
    </div>
  );
}
