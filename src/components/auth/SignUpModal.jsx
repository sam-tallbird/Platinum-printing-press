import React from 'react';
import { useModal } from '../../context/ModalContext';
import SignUpForm from './SignUpForm';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const SignUpModal = () => {
  const { isSignUpModalOpen, closeSignUpModal, switchToLoginModal } = useModal();
  const { locale } = useRouter();
  const { t } = useTranslation('common');

  if (!isSignUpModalOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={closeSignUpModal} 
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('auth.signup.title')}</h2>
        </div>
        <button 
          onClick={closeSignUpModal} 
          className={`absolute top-4 ${locale === 'ar' ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
          aria-label={t('auth.signup.closeAriaLabel')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SignUpForm />
        
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('auth.signup.haveAccount')}{' '}</span>
          <button 
            type="button"
            onClick={switchToLoginModal} 
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none"
          >
            {t('auth.signup.loginLink')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SignUpModal; 