import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import withAdminAuth from '../../components/auth/withAdminAuth';
import { supabase } from '../../lib/supabaseClient';
import { AlertCircle, Loader } from 'lucide-react';

const CmsUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        // NEW: Call Supabase RPC function to get users
        // Assuming the function is named 'get_all_users' and returns the needed data.
        // This function needs to exist in your Supabase project.
        console.log("Attempting to call RPC function 'get_all_users'...");
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_users');

        if (rpcError) {
          console.error("Error calling RPC function 'get_all_users':", rpcError);
          // Check if the error is specifically because the function doesn't exist
          if (rpcError.message.includes('function public.get_all_users() does not exist')) {
             throw new Error("Failed to fetch users: The required database function 'get_all_users' was not found. Please create it in Supabase.");
          } else {
             // Throw a more generic error for other RPC issues (e.g., permissions)
             throw new Error(`Failed to fetch users via RPC: ${rpcError.message}`);
          }
        }

        console.log("RPC call successful, received data:", rpcData);

        // Assuming rpcData is the array of user objects
        // Ensure user_metadata is handled correctly, even if null/undefined in the response
        const processedUsers = (rpcData || []).map(user => ({
            ...user,
            // Safely access user_metadata, default to empty object if null/undefined
            user_metadata: user.user_metadata || {} 
        }));
        
        setUsers(processedUsers);

      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Manage Users</h1>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin h-8 w-8 text-indigo-600" />
            <p className="ml-3 text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold mr-2">Error:</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Province
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {user.user_metadata?.full_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {user.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {user.user_metadata?.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {user.user_metadata?.companyName || user.user_metadata?.company_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {user.user_metadata?.province || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(CmsUsers); 