import React from 'react';
import { useModal } from '../../context/ModalContext';
import LoginForm from './LoginForm'; // Uncommented import
import { useTranslation } from 'next-i18next'; // Import useTranslation
import { useRouter } from 'next/router';

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal } = useModal();
  const { locale } = useRouter(); // Get locale
  const { t } = useTranslation('common'); // Initialize translation hook

  if (!isLoginModalOpen) {
    return null; // Don't render anything if the modal is closed
  }

  // Basic modal structure (we'll enhance this with Headless UI later if desired)
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={closeLoginModal} // Close modal on overlay click
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full relative" // Added relative positioning
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="flex justify-between items-center mb-8">
          {/* Apply text-right for RTL title */}
          <h2 className={`text-xl font-semibold text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.login.title')}</h2>
          {/* Close button positioned absolutely relative to the modal content div */}
          <button 
            onClick={closeLoginModal} 
            className={`absolute top-4 ${locale === 'ar' ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
            aria-label={t('auth.login.closeAriaLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <LoginForm /> {/* Render the login form */}
        {/* <p className="text-gray-600 dark:text-gray-400">Login form will go here.</p> */}
      </div>
    </div>
  );
};

export default LoginModal; 