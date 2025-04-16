import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const Footer = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;

  return (
    <footer className="bg-white dark:bg-gray-800 py-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
};

export default Footer; 