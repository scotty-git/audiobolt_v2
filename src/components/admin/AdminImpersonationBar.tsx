import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types/auth';
import { supabase } from '../../lib/supabase';
import { UserCircle, ArrowLeftRight } from 'lucide-react';

const AdminImpersonationBar: React.FC = () => {
  const { user, isImpersonating, impersonateUser, stopImpersonating, originalAdminUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, created_at, updated_at')
          .order('email');

        if (error) throw error;

        if (data) {
          // Filter out the current admin from the list
          setUsers(data.filter(u => u.id !== originalAdminUser?.id));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(message);
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch users if we're either an admin or currently impersonating
    if (originalAdminUser || user?.role === 'admin') {
      console.log('Fetching users for admin bar, current state:', {
        isAdmin: user?.role === 'admin',
        isImpersonating,
        originalAdmin: originalAdminUser?.email
      });
      fetchUsers();
    }
  }, [user, originalAdminUser, isImpersonating]);

  const handleUserChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    
    if (userId) {
      try {
        await impersonateUser(userId);
        console.log('Successfully switched to user:', userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to impersonate user';
        setError(message);
        console.error('Error impersonating user:', err);
        setSelectedUserId('');
      }
    }
  };

  // Show the bar if we're either an admin or currently impersonating
  if (!originalAdminUser && user?.role !== 'admin') {
    console.log('Not showing admin bar:', { 
      userRole: user?.role, 
      isImpersonating, 
      hasOriginalAdmin: !!originalAdminUser 
    });
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-indigo-900 text-white px-4 flex items-center justify-between z-[60]">
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          <span className="font-medium">
            {isImpersonating ? 'Viewing as:' : 'Admin Tools:'}
          </span>
          <span className="font-bold">
            {user?.email} ({user?.role})
          </span>
        </div>

        {error && (
          <span className="text-red-300 text-sm">{error}</span>
        )}

        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          <select
            value={selectedUserId}
            onChange={handleUserChange}
            disabled={loading}
            className="bg-indigo-800 text-white px-3 py-1 rounded border border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">
              {loading ? 'Loading users...' : 'Switch to different user'}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isImpersonating && originalAdminUser && (
        <div className="flex items-center space-x-4">
          <span className="text-indigo-200">
            Admin account: {originalAdminUser.email}
          </span>
          <button
            onClick={async () => {
              try {
                await stopImpersonating();
                setSelectedUserId('');
                setError(null);
                console.log('Successfully returned to admin');
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to stop impersonation';
                setError(message);
                console.error('Error stopping impersonation:', err);
              }
            }}
            className="bg-indigo-700 hover:bg-indigo-600 px-4 py-1 rounded flex items-center gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Return to Admin
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminImpersonationBar; 