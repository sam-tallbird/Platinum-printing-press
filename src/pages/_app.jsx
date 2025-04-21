import { appWithTranslation } from 'next-i18next';
import { ThemeProvider } from '../context/ThemeContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import '../styles/globals.css';
import { ReactLenis } from 'lenis/react';

function MyApp({ Component, pageProps }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
          <Navbar />
          <main className="flex-grow pt-16">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </ReactLenis>
  );
}

export default appWithTranslation(MyApp); 