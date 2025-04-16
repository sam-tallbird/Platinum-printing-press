import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function Custom404() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;

  return (
    <div className="py-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-6">
          {locale === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {locale === 'ar' ? 'عذراً، الصفحة التي تبحث عنها غير موجودة.' : 'Sorry, the page you are looking for does not exist.'}
        </p>
        <Link href="/" className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition">
          {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
        </Link>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 