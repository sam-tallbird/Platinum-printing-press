import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useTranslation } from 'next-i18next';
import { User, History, LogOut } from 'lucide-react';

const AccountLayout = ({ children }) => {
  const { logout } = useAuth();
  const { openLogoutConfirmModal } = useModal();
  const router = useRouter();
  const { pathname, locale } = router;
  const { t } = useTranslation('common');

  const sidebarLinks = [
    {
      href: '/account',
      labelKey: 'navbar.myAccount',
      labelDefault: 'My Account',
      icon: User,
    },
    {
      href: '/orders',
      labelKey: 'navbar.orderHistory',
      labelDefault: 'Order History',
      icon: History,
    },
  ];

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky top-24"> {/* Added sticky top */} 
          <nav className="space-y-2">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${locale === 'ar' ? 'flex-row-reverse text-right' : 'text-left'} ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${locale === 'ar' ? 'ml-3' : 'mr-3'}`} />
                  <span>{t(link.labelKey, link.labelDefault)}</span>
                </Link>
              );
            })}
            {/* Logout Button */}
            <button
              onClick={openLogoutConfirmModal}
              className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white ${locale === 'ar' ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
              <LogOut className={`h-5 w-5 ${locale === 'ar' ? 'ml-3' : 'mr-3'}`} />
              <span>{t('navbar.logout', 'Logout')}</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {children}
      </main>
    </div>
  );
};

export default AccountLayout; 