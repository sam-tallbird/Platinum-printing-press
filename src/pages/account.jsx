import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AccountLayout from '../components/layout/AccountLayout';

// Reusable Input Component (Optional, but helps reduce repetition)
const InputField = ({ id, label, type, value, onChange, disabled, required = true, locale, placeholder }) => (
  <div className="mb-4">
    <label htmlFor={id} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{label}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}
      disabled={disabled}
      placeholder={placeholder}
    />
  </div>
);

// Reusable Submit Button (Optional)
const SubmitButton = ({ label, loading, disabled }) => (
     <button
        type="submit"
        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-button-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled || loading}
      >
        {loading ? (
             <svg className="animate-spin mx-auto h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : label}
      </button>
);

const AccountPage = () => {
  const { user, isLoading, isAuthenticated, updateUsername, updateEmail, updatePassword } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;

  // --- State for Forms ---
  // Username
  const [username, setUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  // Email
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  // Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Pre-fill username when user data is loaded
  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.full_name || '');
      setEmail(user.email || ''); // Keep track of original email too
    }
  }, [user]);

  // --- Route Protection ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/'); 
    }
  }, [isLoading, isAuthenticated, router]);

  // --- Form Handlers ---
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameMessage('');
    if (!username.trim()) {
        setUsernameError(t('account.error.usernameRequired', 'Username cannot be empty.'));
        return;
    }
    setUsernameLoading(true);
    try {
        await updateUsername(username.trim());
        setUsernameMessage(t('account.success.usernameUpdated', 'Username updated successfully!'));
    } catch (error) {
        setUsernameError(error.message || t('account.error.genericUpdate', 'Failed to update.'));
    } finally {
        setUsernameLoading(false);
    }
  };
  
  const handleEmailSubmit = async (e) => {
      e.preventDefault();
      setEmailError('');
      setEmailMessage('');
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { // Basic email format check
          setEmailError(t('account.error.invalidEmail', 'Please enter a valid email address.'));
          return;
      }
      if (email.trim() === user?.email) {
          setEmailError(t('account.error.emailUnchanged', 'Please enter a different email address.'));
          return;
      }
      setEmailLoading(true);
      try {
          await updateEmail(email.trim());
          setEmailMessage(t('account.success.emailChangeRequested', 'Email update requested. Please check your old and new email addresses for confirmation links.'));
      } catch (error) {
          setEmailError(error.message || t('account.error.genericUpdate', 'Failed to update.'));
      } finally {
          setEmailLoading(false);
      }
    };
  
  const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      setPasswordError('');
      setPasswordMessage('');
       if (password.length < 6) {
          setPasswordError(t('account.error.passwordTooShort', 'Password must be at least 6 characters long.'));
          return;
      }
      if (password !== confirmPassword) {
          setPasswordError(t('account.error.passwordMismatch', 'Passwords do not match.'));
          return;
      }
      setPasswordLoading(true);
      try {
          await updatePassword(password);
          setPasswordMessage(t('account.success.passwordUpdated', 'Password updated successfully!'));
          setPassword(''); // Clear fields on success
          setConfirmPassword('');
      } catch (error) {
          setPasswordError(error.message || t('account.error.genericUpdate', 'Failed to update.'));
      } finally {
          setPasswordLoading(false);
      }
    };

  // --- Loading / Auth Check ---
  if (isLoading || !isAuthenticated) {
    return (
        <div className="flex justify-center items-center min-h-screen">
             <div className="text-gray-700 dark:text-gray-300">{t('loading', 'Loading...')}</div>
        </div>
    );
  }

  return (
    <AccountLayout>
      <h1 className={`text-3xl font-bold mb-8 text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
        {t('account.title', 'My Account')}
      </h1>
      <div className="space-y-8">
        {/* Display basic info */}
         <div>
            <p className="text-gray-700 dark:text-gray-300">
              {t('account.welcome', 'Welcome, {{name}}!', { name: user?.user_metadata?.full_name || user?.email })}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {t('account.emailDisplay', 'Email: {{email}}', { email: user?.email })}
            </p>
         </div>
        
        {/* --- Update Username Form --- */}
        <form onSubmit={handleUsernameSubmit} className="space-y-4 border-t dark:border-gray-700 pt-6">
            <h2 className={`text-xl font-semibold mb-3 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('account.updateUsernameTitle', 'Update Username')}</h2>
             <InputField
                id="username"
                label={t('account.usernameLabel', 'Username')}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={usernameLoading}
                locale={locale}
             />
             {/* Feedback Messages */}
             <div className="h-5 text-sm">
               {usernameError && <p className="text-red-500 dark:text-red-400">{usernameError}</p>}
               {usernameMessage && <p className="text-green-600 dark:text-green-400">{usernameMessage}</p>}
             </div>
             <SubmitButton 
                label={t('account.updateButton', 'Update')}
                loading={usernameLoading}
                disabled={usernameLoading || !username.trim() || username.trim() === (user?.user_metadata?.full_name || '')}
             />
        </form>

        {/* --- Update Email Form --- */}
        <form onSubmit={handleEmailSubmit} className="space-y-4 border-t dark:border-gray-700 pt-6">
           <h2 className={`text-xl font-semibold mb-3 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('account.updateEmailTitle', 'Update Email')}</h2>
           <p className={`text-sm text-gray-500 dark:text-gray-400 mb-3 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
               {t('account.emailChangeInfo', 'Changing your email requires confirmation via both your old and new addresses.')}
           </p>
            <InputField
                id="email"
                label={t('account.newEmailLabel', 'New Email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailLoading}
                locale={locale}
             />
              {/* Feedback Messages */}
             <div className="h-5 text-sm">
               {emailError && <p className="text-red-500 dark:text-red-400">{emailError}</p>}
               {emailMessage && <p className="text-green-600 dark:text-green-400">{emailMessage}</p>}
             </div>
             <SubmitButton 
                label={t('account.updateButton', 'Update')}
                loading={emailLoading}
                 disabled={emailLoading || !email.trim() || email.trim() === user?.email}
             />
        </form>
        
        {/* --- Update Password Form --- */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4 border-t dark:border-gray-700 pt-6">
           <h2 className={`text-xl font-semibold mb-3 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('account.updatePasswordTitle', 'Update Password')}</h2>
            <InputField
                id="new-password"
                label={t('account.newPasswordLabel', 'New Password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={passwordLoading}
                locale={locale}
             />
              <InputField
                id="confirm-password"
                label={t('account.confirmPasswordLabel', 'Confirm New Password')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
                locale={locale}
             />
             {/* Feedback Messages */}
             <div className="h-5 text-sm">
               {passwordError && <p className="text-red-500 dark:text-red-400">{passwordError}</p>}
               {passwordMessage && <p className="text-green-600 dark:text-green-400">{passwordMessage}</p>}
             </div>
             <SubmitButton 
                label={t('account.updateButton', 'Update')}
                loading={passwordLoading}
                disabled={passwordLoading || !password || password !== confirmPassword}
             />
        </form>
      </div>
    </AccountLayout>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

export default AccountPage; 