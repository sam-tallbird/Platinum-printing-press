import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function Products() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;

  return (
    <div className="py-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          {t('nav.products')}
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {t('content.placeholder')}
        </p>
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