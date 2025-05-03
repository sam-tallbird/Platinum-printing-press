import React from 'react';
import { useRouter } from 'next/router';
import AdminNavLinks from './AdminNavLinks'; // Import the new component
// Remove unnecessary imports if AdminNavLinks handles them
// import Link from 'next/link';
// import { useTranslation } from 'next-i18next'; 

const Sidebar = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { locale } = router;
  // const { t } = useTranslation('common'); // Translation handled in AdminNavLinks if needed

  return (
    // Mobile sidebar overlay
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      {/* Mobile Sidebar Content */}
      <div 
         className={`fixed inset-y-0 ${locale === 'ar' ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : (locale === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}
         onClick={(e) => e.stopPropagation()} 
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-lg">CMS Menu</h2>
             <button onClick={onClose} className="md:hidden p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          {/* Use the extracted component for links */}
          <AdminNavLinks onLinkClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 