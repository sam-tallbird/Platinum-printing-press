import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

const languages = [
  { code: 'en', name: 'English', flag: '/images/uk-svg.svg' },
  { code: 'ar', name: 'العربية', flag: '/images/iraq-svg.svg' },
];

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="p-2 rounded-md font-medium focus:outline-none flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLanguage.name}, Change language`}
      >
        <Image
          src={currentLanguage.flag}
          alt={currentLanguage.name}
          width={20}
          height={14}
          className="object-contain"
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${locale === 'ar' ? 'mr-1' : 'ml-1'}`}
        >
          <path 
            fillRule="evenodd" 
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`absolute top-full ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={{ pathname, query }}
                as={asPath}
                locale={lang.code}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-2 text-sm ${
                  locale === lang.code
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                } hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white w-full ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                role="menuitem"
              >
                <Image
                  src={lang.flag}
                  alt={lang.name}
                  width={20}
                  height={14}
                  className={`object-contain ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
                />
                {lang.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 