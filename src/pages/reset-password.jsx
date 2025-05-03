import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false); // Track if token seems present
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;

  useEffect(() => {
    // Password reset token is usually in the URL hash fragment (#access_token=...)
    // This can only be accessed client-side.
    if (window.location.hash.includes('access_token')) {
        setTokenVerified(true); // Assume token is present if hash contains it
        setMessage(t('auth.resetPassword.enterNewPassword', 'Please enter your new password.'));
    } else {
        setError(t('auth.resetPassword.invalidLink', 'Invalid or expired password reset link.'));
        // Optionally redirect after a delay if no token found
        // setTimeout(() => router.push('/'), 5000);
    }
  }, []); // Run only once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!tokenVerified) {
        setError(t('auth.resetPassword.invalidLink', 'Invalid or expired password reset link.'));
        return;
    }

    if (password.length < 6) { // Basic password length check (Supabase default)
        setError(t('auth.resetPassword.passwordTooShort', 'Password must be at least 6 characters long.'));
        return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch', 'Passwords do not match.'));
      return;
    }

    setLoading(true);
    try {
        // Supabase client automatically picks up the token from the URL hash
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            throw updateError;
        }

        setMessage(t('auth.resetPassword.success', 'Password updated successfully! Redirecting to login...'));
        // Redirect to login page after a delay
        setTimeout(() => {
            router.push('/'); // Redirect to homepage, which might show login modal
        }, 3000);

    } catch (err) {
      console.error("Password update error:", err);
      // More specific error handling based on err.message might be needed
      setError(err.message || t('auth.resetPassword.genericError', 'Failed to update password. The link may have expired.'));
    } finally {
      // Keep loading true if success message shown, as we are redirecting
      if (!message) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">{t('auth.resetPassword.title', 'Reset Your Password')}</h1>
        
        {!tokenVerified && error ? (
            <p className="text-red-500 text-center">{error}</p>
        ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="new-password" className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.resetPassword.newPasswordLabel', 'New Password')}</label>
                <input
                  type="password"
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                  disabled={loading || !!message} // Disable if loading or success message
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirm-password" className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.resetPassword.confirmPasswordLabel', 'Confirm New Password')}</label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                  disabled={loading || !!message} // Disable if loading or success message
                />
              </div>

              {/* Error/Message Display */} 
              <div className="mb-4 h-5 text-sm text-center">
                  {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
                  {message && <p className="text-green-600 dark:text-green-400">{message}</p>}
              </div>

              <button
                type="submit"
                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${loading || !!message ? 'opacity-50 cursor-not-allowed' : ''}`}
                 disabled={loading || !!message} // Disable if loading or success message
              >
                {loading ? (
                     <svg className="animate-spin mx-auto h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : t('auth.resetPassword.submitButton', 'Update Password')}
              </button>
            </form>
        )}
      </div>
    </div>
  );
};

// Add getStaticProps for i18n
export async function getStaticProps({ locale }) {
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'en', ['common'])),
      },
    };
  }
  

export default ResetPasswordPage; 