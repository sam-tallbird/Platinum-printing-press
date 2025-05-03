import React from 'react';
import { X, AlertTriangle } from 'lucide-react'; // Icons for close and warning

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  locale = 'en', // Add locale prop with default
  confirmButtonClass = 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
  cancelButtonClass = 'px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
}) => {
  if (!isOpen) {
    return null;
  }
  
  const isRTL = locale === 'ar';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        {/* Modal Header */}
        <div className={`flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'justify-end' : 'justify-between'}`}> {/* Adjust justify for RTL close button positioning */}
          {/* Content container with conditional flex direction */}
          <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}> 
             <AlertTriangle className="text-red-500 dark:text-red-400 flex-shrink-0" size={20} /> 
             <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{title}</h3>
          </div>
           {/* Close button positioned based on header justify */}
           <button 
            type="button" 
            className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${isRTL ? 'mr-auto' : 'ml-auto'}`} // Push button to the side
            onClick={onClose}
            disabled={isLoading}
           >
            <X size={24} />
           </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className={`text-sm text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>{message}</p>
        </div>

        {/* Modal Footer */}
        {/* Apply flex-row-reverse for RTL button order, keep space-x-3 */}
        <div className={`bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 rounded-b-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button 
            type="button" 
            className={cancelButtonClass} 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`${confirmButtonClass} disabled:opacity-70 disabled:cursor-not-allowed`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 