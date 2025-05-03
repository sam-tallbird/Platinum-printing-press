import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const CmsLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true);

    try {
      // Attempt login - assuming login from context returns user or throws error
      const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        throw loginError; // Throw error to be caught below
      }

      if (user) {
        // User authenticated, now check if they are admin
        try {
          const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { user_id: user.id });

          if (rpcError) {
            console.error('Error checking admin status:', rpcError);
            // Sign out user if role check fails severely
            await supabase.auth.signOut();
            setError('Could not verify user role. Please try again.');
          } else if (isAdmin) {
            // Role check successful and user is admin, redirect
            router.push('/cms-plpp25');
          } else {
            // Role check successful but user is NOT admin
            await supabase.auth.signOut(); // Sign out the non-admin user
            setError('Access Denied: Administrator privileges required.');
          }
        } catch (rpcCatchError) {
          console.error('RPC call failed unexpectedly:', rpcCatchError);
          await supabase.auth.signOut();
          setError('An unexpected error occurred verifying your role.');
        }
      } else {
        // Should not happen if signInWithPassword doesn't error and returns no user, but handle defensively
        setError('Login failed. Please try again.');
      }

    } catch (error) {
      console.error("Login page error:", error.message);
      // Set a user-friendly error message
      setError(error.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">CMS Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}
          <button
            type="submit"
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CmsLoginPage; 