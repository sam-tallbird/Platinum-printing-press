import React from 'react';
import { useTranslation } from 'next-i18next';
import { CheckCircle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, title, message }) => {
  const { t } = useTranslation('common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" aria-labelledby="confirmation-title" role="dialog" aria-modal="true">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>

        {/* Title */}
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2" id="confirmation-title">
          {title || t('confirmation.defaultTitle', 'Success!')} 
        </h3>
        
        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {message || t('confirmation.defaultMessage', 'Your request has been processed successfully.')}
          </p>
        </div>

        {/* OK Button */}
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-button-primary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary sm:text-sm transition-colors"
          onClick={onClose}
        >
          {t('common.ok', 'OK')}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal; 