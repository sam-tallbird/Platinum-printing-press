import React, { useContext } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Image from 'next/image';
import ThemeToggle from '../ThemeToggle';

const AdminHeader = ({ onToggleMobileSidebar }) => {
    const { logout } = useAuth();
    const { darkMode } = useContext(ThemeContext);

    // Determine logo source based on theme
    const logoSrc = darkMode ? '/images/white-logo.svg' : '/images/black-logo.svg';

    // Logout Icon
    const logoutIconPath = () => <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />;
    // Hamburger Icon
    const hamburgerIconPath = () => <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />;

    return (
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
            {/* Left side: Hamburger (Mobile) & Logo */}
            <div className="flex items-center">
                {/* Hamburger button - visible only on mobile */}
                <button
                    type="button"
                    className="-ml-2 mr-2 p-2 text-gray-500 dark:text-gray-400 md:hidden"
                    onClick={onToggleMobileSidebar}
                    aria-label="Toggle sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                        {hamburgerIconPath()}
                    </svg>
                </button>

                {/* Logo - Link to CMS Dashboard */}
                <Link href="/cms-plpp25" className="flex-shrink-0">
                    {/* Use conditional logo source */}
                    <Image
                        src={logoSrc} // Use the dynamic logo source
                        alt="Platinum Printing Press Logo"
                        width={120} // Base width, height will adjust based on class
                        height={40} // Base height, actual height controlled by class
                        className="h-7 md:h-8 w-auto" // Responsive height
                        priority // Add priority if logo is critical for LCP
                    />
                </Link>
            </div>

            {/* Right side: Theme Toggle & Logout Button */}
            <div className="flex items-center space-x-2 md:space-x-3 rtl:space-x-reverse"> {/* Adjusted spacing */}
                <ThemeToggle />
                <button
                    onClick={logout}
                    className="flex items-center rounded-md p-2 sm:px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white" /* Adjusted padding */
                    aria-label="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 sm:mr-2"> {/* Adjusted margin */}
                        {logoutIconPath()}
                    </svg>
                    <span className="hidden sm:inline">Logout</span> {/* Hide text on mobile */}
                </button>
            </div>
        </header>
    );
};

export default AdminHeader; 