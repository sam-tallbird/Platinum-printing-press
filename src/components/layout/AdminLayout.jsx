import React, { useState } from 'react';
import Sidebar from '../cms/Sidebar';
import AdminNavLinks from '../cms/AdminNavLinks';
import { useRouter } from 'next/router';
import AdminHeader from '../cms/AdminHeader';
import { Toaster } from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { locale } = useRouter();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleLinkClick = () => {
    closeMobileSidebar();
  }

  const sidebarWidthClass = "w-72";
  const mainContentMargin = locale === 'ar' ? 'md:mr-72' : 'md:ml-72';

  return (
    <div className={`flex min-h-screen ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Desktop Sidebar - Static */}
      <div className={`hidden md:block ${sidebarWidthClass} fixed inset-y-0 ${locale === 'ar' ? 'right-0' : 'left-0'} bg-white dark:bg-gray-900 border-${locale === 'ar' ? 'l' : 'r'} border-gray-200 dark:border-gray-700 z-20`}>
        <div className="p-4 h-full flex flex-col">
          <h2 className="font-bold text-lg mb-6 flex-shrink-0">CMS Menu</h2>
          <AdminNavLinks onLinkClick={() => {}} />
        </div>
      </div>

      {/* Mobile Sidebar - Managed by state */}
      <Sidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${mainContentMargin}`}>
        <AdminHeader onToggleMobileSidebar={toggleMobileSidebar} />

        {/* Page Content */}
        <main className="flex-grow p-4 md:p-8">
          {children}
        </main>

      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default AdminLayout; 