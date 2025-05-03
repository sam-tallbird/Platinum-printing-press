import { useState, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { ShoppingBasket, CircleUserRound } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import { navLinks } from '../../constants/navLinks';
import { ThemeContext } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useCart } from '../../context/CartContext'; // Import CartContext

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const { darkMode } = useContext(ThemeContext);
  const { openLoginModal, openCartModal, openLogoutConfirmModal } = useModal();
  const { isAuthenticated, logout } = useAuth();
  const { cartListingCount } = useCart(); // Use cartListingCount for badge

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleProfileClick = () => {
    // This function is now handled by Headless UI Menu, can be removed or repurposed if needed elsewhere
    console.log('Profile icon clicked (should be handled by Menu component)');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 z-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full px-6">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-gray-800 dark:text-white">
              <Image 
                src={darkMode ? "/images/white-logo.svg" : "/images/black-logo.svg"} 
                alt="Platinum Printing Press" 
                width={180}
                height={40}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    router.pathname === link.path
                      ? 'bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:backdrop-blur-sm hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t(link.i18nKey)}
                </Link>
              ))}
              <div className="flex items-center space-x-3 rtl:space-x-reverse ms-3">
                <ThemeToggle />
                <LanguageSwitcher />

                {/* Basket Icon Button with Counter */}
                <div className="relative">
                  <button 
                    type="button"
                    aria-label={t('navbar.basketAriaLabel', 'Shopping Basket')}
                    className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
                    onClick={openCartModal}
                  >
                    <ShoppingBasket className="h-6 w-6" strokeWidth={2} />
                  </button>
                  {/* Counter Badge - Conditionally Rendered */}
                  {cartListingCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {cartListingCount}
                    </span>
                  )}
                </div>
                
                {/* --- Conditional Auth Button --- */}
                {isAuthenticated ? (
                    <Menu as="div" className={`relative ${locale === 'ar' ? 'mr-3' : 'ml-3'}`}> 
                        <div>
                            <Menu.Button className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                                <span className="sr-only">{t('navbar.profileAriaLabel', 'User Profile')}</span>
                                <CircleUserRound className="h-6 w-6" strokeWidth={2} />
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none`}>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            href="/account" // Placeholder link
                                            className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                                        >
                                            {t('navbar.myAccount', 'My Account')}
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            href="/orders" // Placeholder link
                                            className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                                        >
                                            {t('navbar.orderHistory', 'Order History')}
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={openLogoutConfirmModal}
                                            className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                                        >
                                            {t('navbar.logout', 'Logout')}
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                 ) : (
                   <button 
                     type="button"
                     className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-button-primary hover:bg-opacity-90 transition-colors ${locale === 'ar' ? 'mr-3' : 'ml-3'}`}
                     onClick={openLoginModal}
                   >
                     {t('navbar.getStarted', 'Get Started')} 
                   </button>
                 )}
                 {/* --- End Conditional Auth Button --- */}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="ms-3 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none transition-all"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden absolute w-full bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg`}>
        <div className="px-6 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                router.pathname === link.path
                  ? 'bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:backdrop-blur-sm hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t(link.i18nKey)}
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between px-6">
              <div className={`${locale === 'ar' ? 'order-2' : 'order-1'}`}>
                 <LanguageSwitcher />
              </div>
              <div className={`${locale === 'ar' ? 'order-1' : 'order-2'}`}>
                 {/* --- Conditional Mobile Auth Button --- */}
                 {isAuthenticated ? (
                     <Menu as="div" className="relative">
                        {/* Mobile Menu Button - uses same icon, opens dropdown */}
                         <Menu.Button className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                            <span className="sr-only">{t('navbar.profileAriaLabel', 'User Profile')}</span>
                            <CircleUserRound className="h-6 w-6" strokeWidth={2} />
                        </Menu.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                             {/* Position mobile dropdown */}
                            <Menu.Items className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none`}>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            href="/account" // Placeholder link
                                            className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                                            onClick={() => setMobileMenuOpen(false)} // Close mobile menu on click
                                        >
                                            {t('navbar.myAccount', 'My Account')}
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            href="/orders" // Placeholder link
                                            className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                                            onClick={() => setMobileMenuOpen(false)} // Close mobile menu on click
                                        >
                                            {t('navbar.orderHistory', 'Order History')}
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => {
                                                openLogoutConfirmModal();
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                                        >
                                            {t('navbar.logout', 'Logout')}
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                 ) : (
                    <button 
                      type="button"
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-button-primary hover:bg-opacity-90 transition-colors`}
                      onClick={() => {
                        openLoginModal();
                        setMobileMenuOpen(false);
                      }}
                    >
                      {t('navbar.getStarted', 'Get Started')} 
                    </button>
                 )}
                 {/* --- End Conditional Mobile Auth Button --- */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 