import { useRouter } from 'next/router';
import Link from 'next/link';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  const otherLocale = locale === 'en' ? 'ar' : 'en';
  
  return (
    <Link 
      href={{ pathname, query }} 
      as={asPath} 
      locale={otherLocale}
      className={`px-3 py-1 rounded-md font-medium focus:outline-none
                  ${locale === 'en' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      {otherLocale === 'en' ? 'EN' : 'عربي'}
    </Link>
  );
};

export default LanguageSwitcher; 