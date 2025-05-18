import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

export default function RecentWork({ recentWorkItems }) {
  const { t, i18n } = useTranslation('common');
  const { locale } = i18n;

  if (!recentWorkItems || recentWorkItems.length === 0) {
    return (
      <section className="py-12 md:py-20 mx-auto px-4 sm:px-9 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase ltr:text-left rtl:text-right">
            {t('home.recentWorkTitle', 'Our Recent Work')}
          </h2>
          <Link href="/our-work" passHref legacyBehavior>
            <a className="inline-block text-sm uppercase font-medium border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300 rounded-full px-4 py-1 transition-colors hover:bg-gray-700 hover:text-white dark:hover:bg-gray-300 dark:hover:text-gray-900 whitespace-nowrap">
              {t('home.viewAllWork', 'View All Work')}
            </a>
          </Link>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400 py-8">
          {t('home.noRecentWork', 'No recent work to display at the moment.')}
        </p>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 mx-auto px-4 sm:px-9 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase ltr:text-left rtl:text-right">
          {t('home.recentWorkTitle', 'Our Recent Work')}
        </h2>
        <Link href="/our-work" passHref legacyBehavior>
          <a className="inline-block text-sm uppercase font-medium border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300 rounded-full px-4 py-1 transition-colors hover:bg-gray-700 hover:text-white dark:hover:bg-gray-300 dark:hover:text-gray-900 whitespace-nowrap">
            {t('home.viewAllWork', 'View All Work')}
          </a>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {recentWorkItems.map((item) => (
          <Link key={item.id} href="/our-work" passHref legacyBehavior>
            <a className="group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1 block">
              <div className="relative w-full h-60 md:h-72">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 md:p-5">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-2 truncate" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  {item.name}
                </h3>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
} 