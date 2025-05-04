import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const Footer = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const { darkMode } = useContext(ThemeContext);
  const isRTL = locale === 'ar';

  // Company description in English
  const companyDescription = "Platinum Printing Press delivers high-quality digital, offset, and large-format printing with expert design, finishing, and custom packaging services.";

  // Arabic translation of the company description
  const companyDescriptionAr = "توفر بلاتينيوم برنت برس خدمات طباعة رقمية وأوفست وكبيرة الحجم عالية الجودة مع خدمات تصميم وتشطيب وتغليف مخصصة متميزة.";

  // Footer link sections data with translations
  const socialLinks = [
    { 
      en: { name: 'Instagram', href: 'https://instagram.com' },
      ar: { name: 'انستغرام', href: 'https://instagram.com' }
    },
    { 
      en: { name: 'Twitter', href: 'https://twitter.com' },
      ar: { name: 'تويتر', href: 'https://twitter.com' }
    },
    { 
      en: { name: 'LinkedIn', href: 'https://linkedin.com' },
      ar: { name: 'لينكد إن', href: 'https://linkedin.com' }
    },
    { 
      en: { name: 'Facebook', href: 'https://facebook.com' },
      ar: { name: 'فيسبوك', href: 'https://facebook.com' }
    }
  ];

  const resourceLinks = [
    { 
      en: { name: 'Printing Guide', href: '/resources/printing-guide' },
      ar: { name: 'دليل الطباعة', href: '/resources/printing-guide' }
    },
    { 
      en: { name: 'Design Tips', href: '/resources/design-tips' },
      ar: { name: 'نصائح التصميم', href: '/resources/design-tips' }
    },
    { 
      en: { name: 'FAQ', href: '/resources/faq' },
      ar: { name: 'الأسئلة الشائعة', href: '/resources/faq' }
    }
  ];

  const pageLinks = [
    { 
      en: { name: 'Home', href: '/' },
      ar: { name: 'الرئيسية', href: '/' }
    },
    { 
      en: { name: 'About', href: '/about' },
      ar: { name: 'من نحن', href: '/about' }
    },
    { 
      en: { name: 'Services', href: '/services' },
      ar: { name: 'خدماتنا', href: '/services' }
    },
    { 
      en: { name: 'Products', href: '/products' },
      ar: { name: 'منتجاتنا', href: '/products' }
    },
    { 
      en: { name: 'Our Work', href: '/our-work' },
      ar: { name: 'أعمالنا', href: '/our-work' }
    },
    { 
      en: { name: 'Contact', href: '/contact' },
      ar: { name: 'اتصل بنا', href: '/contact' }
    }
  ];

  // Arabic translations for section headings
  const sectionTitles = {
    social: { en: 'SOCIAL', ar: 'التواصل الاجتماعي' },
    resources: { en: 'RESOURCES', ar: 'الموارد' },
    pages: { en: 'PAGES', ar: 'الصفحات' }
  };

  return (
    <footer className="bg-surface dark:bg-surface-dark w-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main footer section with company info and links */}
      <div className="border-b border-gray-200/50 dark:border-gray-700/50 py-8">
        <div className="w-full px-0 sm:px-3">
          <div className="flex flex-col md:flex-row">
            {/* Company info */}
            <div className="flex-shrink-0 flex flex-col ps-6 mb-8 md:mb-0 md:w-1/3">
              {/* Logo */}
              <div className="mb-4">
                <Image 
                  src={darkMode ? "/images/white-logo.svg" : "/images/black-logo.svg"} 
                  alt="Platinum Printing Press" 
                  width={180}
                  height={40}
                  priority
                />
              </div>
              
              {/* Company description */}
              <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm leading-snug max-w-xs">
                {isRTL ? companyDescriptionAr : companyDescription}
              </p>
            </div>
            
            {/* Push content to right edge */}
            <div className="md:flex-1"></div>
            
            {/* Links sections - right aligned to edge */}
            <div className="hidden md:flex md:space-x-32 md:rtl:space-x-reverse pe-6">
              {/* Social Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                  {isRTL ? sectionTitles.social.ar : sectionTitles.social.en}
                </h3>
                <ul className="space-y-1">
                  {socialLinks.map((link, index) => (
                    <li key={index}>
                      <span 
                        className="text-gray-600 dark:text-gray-300 text-sm transition-colors"
                      >
                        {isRTL ? link.ar.name : link.en.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Resources Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                  {isRTL ? sectionTitles.resources.ar : sectionTitles.resources.en}
                </h3>
                <ul className="space-y-1">
                  {resourceLinks.map((link, index) => (
                    <li key={index}>
                      <span 
                        className="text-gray-600 dark:text-gray-300 text-sm transition-colors"
                      >
                        {isRTL ? link.ar.name : link.en.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Pages Links */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                  {isRTL ? sectionTitles.pages.ar : sectionTitles.pages.en}
                </h3>
                <ul className="space-y-1">
                  {pageLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={isRTL ? link.ar.href : link.en.href} 
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                      >
                        {isRTL ? link.ar.name : link.en.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Mobile footer menu */}
            <div className="md:hidden flex flex-col w-full mt-8 px-6">
              <div className="grid grid-cols-3 gap-2">
                {/* Social Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                    {isRTL ? sectionTitles.social.ar : sectionTitles.social.en}
                  </h3>
                  <ul className="space-y-1">
                    {socialLinks.map((link, index) => (
                      <li key={index}>
                        <span 
                          className="text-gray-600 dark:text-gray-300 text-sm transition-colors"
                        >
                          {isRTL ? link.ar.name : link.en.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Resources Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                    {isRTL ? sectionTitles.resources.ar : sectionTitles.resources.en}
                  </h3>
                  <ul className="space-y-1">
                    {resourceLinks.map((link, index) => (
                      <li key={index}>
                        <span 
                          className="text-gray-600 dark:text-gray-300 text-sm transition-colors"
                        >
                          {isRTL ? link.ar.name : link.en.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Pages Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                    {isRTL ? sectionTitles.pages.ar : sectionTitles.pages.en}
                  </h3>
                  <ul className="space-y-1">
                    {pageLinks.map((link, index) => (
                      <li key={index}>
                        <Link 
                          href={isRTL ? link.ar.href : link.en.href} 
                          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                        >
                          {isRTL ? link.ar.name : link.en.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright section */}
      <div className="py-4">
        <div className="w-full px-0 sm:px-3">
          <p className="text-center text-sm text-gray-700 dark:text-gray-300 ps-6 pe-6">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 