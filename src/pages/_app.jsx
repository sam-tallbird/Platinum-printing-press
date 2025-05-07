import { appWithTranslation } from 'next-i18next';
import { ThemeProvider } from '../context/ThemeContext';
import { ModalProvider, useModal } from '../context/ModalContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LoginModal from '../components/auth/LoginModal';
import SignUpModal from '../components/auth/SignUpModal';
import CartModal from '../components/cart/CartModal';
import ConfirmModal from '../components/common/ConfirmModal';
import '../styles/globals.css';
import { ReactLenis } from 'lenis/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

// Helper component to render modals that need context
const AppModals = () => {
  const { isLogoutConfirmOpen, closeLogoutConfirmModal } = useModal();
  const { logout } = useAuth();
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;

  // Re-enabled logout, but close modal first and await logout
  const handleConfirmLogout = async () => {
    closeLogoutConfirmModal(); // Close modal FIRST
    try {
      await logout(); // Await the logout process
    } catch (error) {
      // Handle potential errors from logout itself if needed, though logout already logs
      console.error("Error during logout confirmation:", error);
      // Maybe show a toast error? 
      // toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <>
      <LoginModal />
      <SignUpModal />
      <CartModal />
       {/* Removed Temporary Direct Logout Button */}
      <ConfirmModal 
        isOpen={isLogoutConfirmOpen}
        onClose={closeLogoutConfirmModal}
        onConfirm={handleConfirmLogout} // Use the updated handler
        title={t('confirmLogout.title', 'Confirm Logout')}
        message={t('confirmLogout.message', 'Are you sure you want to log out?')}
        confirmText={t('confirmLogout.confirmText', 'Logout')}
        cancelText={t('confirmLogout.cancelText', 'Cancel')}
        locale={locale}
      />
    </>
  );
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { locale, pathname } = router;

  const isCmsRoute = pathname.startsWith('/cms-plpp25') || pathname === '/cms-login';

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <ThemeProvider>
        <ModalProvider>
          <AuthProvider>
            <CartProvider>
              <div 
                className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                dir={locale === 'ar' ? 'rtl' : 'ltr'} 
              >
                {!isCmsRoute && <Navbar />}
                <main className={`flex-grow ${!isCmsRoute ? 'pt-16' : ''}`}>
                  <Component {...pageProps} />
                </main>
                {!isCmsRoute && <Footer />}
                <AppModals />
              </div>
            </CartProvider>
          </AuthProvider>
        </ModalProvider>
      </ThemeProvider>
    </ReactLenis>
  );
}

export default appWithTranslation(MyApp); 