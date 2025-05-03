import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
// Remove useAuth import if logout is only handled in header
// import { useAuth } from '../../context/AuthContext'; 

// Define links outside the component if they are static
export const adminNavLinks = [
  { name: 'Dashboard', href: '/cms-plpp25', icon: () => <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /> },
  { name: 'Products', href: '/cms-plpp25/products', icon: () => <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { name: 'Our Work', href: '/cms-plpp25/our-work', icon: () => <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> },
  { name: 'Users', href: '/cms-plpp25/users', icon: () => <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm-2.25 0a.75.75 0 100-1.5.75.75 0 000 1.5z" /> },
];

// Remove logoutIconPath if not used here
// const logoutIconPath = () => <path ... />;

const AdminNavLinks = ({ onLinkClick }) => {
  const router = useRouter();
  const { locale } = router;
  // Remove logout hook usage if not needed here
  // const { logout } = useAuth();

  const baseItemClasses = "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors w-full"; 
  const activeItemClasses = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white";
  const inactiveItemClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

  const iconBaseClasses = "h-6 w-6 shrink-0";
  const iconMargin = locale === 'ar' ? "ml-3" : "mr-3";

  // Remove handleLogout function if not used here
  // const handleLogout = () => { ... };

  return (
    // Removed outer div and flex layout as logout button is gone
    <nav className="space-y-1">
      {adminNavLinks.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${baseItemClasses} ${router.pathname === item.href ? activeItemClasses : inactiveItemClasses}`}
          onClick={onLinkClick} // Call the passed function (e.g., close mobile sidebar)
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${iconBaseClasses} ${iconMargin}`}>
            {item.icon()}
          </svg>
          {item.name}
        </Link>
      ))}
      {/* Removed Logout Button Area */}
    </nav>
  );
};

export default AdminNavLinks; 