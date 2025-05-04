import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { switchToSignUpModal, closeLoginModal } = useModal();
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const { login, sendPasswordResetEmail } = useAuth();

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
       await login(email, password);
       console.log("Login successful from form");
       closeLoginModal();
    } catch (err) {
        console.error("Login form error:", err);
        setError(err.message || t('auth.login.genericError', 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setMessage(t('auth.reset.successMessage', 'If an account exists for this email, a password reset link has been sent.'));
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(err.message || t('auth.reset.genericError', 'Failed to send reset link.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In logic
    console.log('Attempting Google Sign-In');
  };

  return (
    <form onSubmit={isResetMode ? handlePasswordResetRequest : handleLoginSubmit}>
      {!isResetMode ? (
        <>
          {/* Removed Google Sign In Button and Separator */}

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.login.emailLabel')}</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          {/* Password Input */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.login.passwordLabel')}</label>
              <button 
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                disabled={loading}
              >
                {t('auth.login.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password" 
                name="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full px-3 py-2 ${locale === 'ar' ? 'pl-10' : 'pr-10'} border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                placeholder="********"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
                aria-label={t(showPassword ? 'auth.login.hidePasswordAriaLabel' : 'auth.login.showPasswordAriaLabel')}
                disabled={loading}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className=" h-5 text-sm text-center">
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
          </div>

          <button 
            type="submit" 
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-button-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
             disabled={loading} 
          >
            {loading ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : t('auth.login.submitButton')}
          </button>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('auth.login.noAccount')}{' '}</span>
            <button 
              type="button"
              onClick={switchToSignUpModal} 
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
              disabled={loading}
            >
              {t('auth.login.signUpLink')}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={`mb-4 text-sm text-gray-600 dark:text-gray-400 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
            {t('auth.reset.instruction', 'Enter your email address and we will send you a link to reset your password.')}
          </p>
          <div className="mb-4">
            <label htmlFor="reset-email" className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.login.emailLabel')}</label>
            <input 
              type="email" 
              id="reset-email" 
              name="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
              placeholder="you@example.com"
              disabled={loading || !!message}
            />
          </div>

          <div className="h-5 text-sm text-center">
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            {message && <p className="text-green-600 dark:text-green-400">{message}</p>}
          </div>

          <button 
            type="submit" 
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-button-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading || !!message ? 'opacity-50 cursor-not-allowed' : ''}`}
             disabled={loading || !!message}
          >
             {loading ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : t('auth.reset.submitButton', 'Send Reset Link')}
          </button>

          <div className="mt-4 text-center text-sm">
            <button 
              type="button"
              onClick={() => {
                setIsResetMode(false); 
                setError(''); 
                setMessage('');
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
              disabled={loading}
            >
              {t('auth.reset.backToLogin', 'Back to Login')}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default LoginForm; 