import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import Image from 'next/image'; // Assuming you might want an image later

export default function Contact() {
  const router = useRouter();
  const { t } = useTranslation('common'); // Assuming 'common' namespace for translations
  const { locale } = router;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send data to an API)
    console.log('Form Data Submitted:', formData);
    // You might want to add a success message or redirect the user
  };

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-start">

        {/* Contact Info Section (Placeholder) - MOVED HERE */}
        <div className="space-y-8">
           <h2 className="text-3xl font-bold mb-6">{t('contact.contactInfoTitle', 'Contact Information')}</h2>
           <div>
             <h3 className="text-lg font-semibold mb-2">{t('contact.emailTitle', 'Email')}</h3>
             <a href="mailto:info@dummyplatinum.com" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
               info@dummyplatinum.com
             </a>
           </div>
           <div>
             <h3 className="text-lg font-semibold mb-2">{t('contact.phoneTitle', 'Phone')}</h3>
             <a href="tel:+971000000000" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
               +971 00 000 0000
             </a>
           </div>
           <div>
             <h3 className="text-lg font-semibold mb-2">{t('contact.addressTitle', 'Address')}</h3>
             <p className="text-gray-600 dark:text-gray-400">
               {t('contact.addressLine1', 'Dummy Street 123')} <br />
               {t('contact.addressLine2', 'Industrial Area')} <br />
               {t('contact.addressLine3', 'Dubai, UAE')}
             </p>
             {/* Social Media Icons */}
             <div className="flex space-x-4 mt-4">
               <span aria-label="Facebook" className="text-gray-500 dark:text-gray-400">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                   <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                 </svg>
               </span>
               <span aria-label="Instagram" className="text-gray-500 dark:text-gray-400">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                   <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.001 1.802c-2.391 0-2.72.01-3.667.053-1.002.046-1.586.207-1.991.368a3.077 3.077 0 00-1.158.79 3.077 3.077 0 00-.79 1.158c-.16.405-.321.989-.368 1.991-.043.947-.053 1.276-.053 3.667s.01 2.72.053 3.667c.046 1.002.207 1.586.368 1.991a3.077 3.077 0 00.79 1.158 3.077 3.077 0 001.158.79c.405.16.989.321 1.991.368.947.043 1.276.053 3.667.053s2.72-.01 3.667-.053c1.002-.046 1.586-.207 1.991-.368a3.077 3.077 0 001.158-.79 3.077 3.077 0 00.79-1.158c.16-.405.321-.989.368-1.991.043-.947.053-1.276.053-3.667s-.01-2.72-.053-3.667c-.046-1.002-.207-1.586-.368-1.991a3.077 3.077 0 00-.79-1.158 3.077 3.077 0 00-1.158-.79c-.405-.16-.989-.321-1.991-.368-.947-.043-1.276-.053-3.667-.053zM12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 1.802a3.333 3.333 0 110 6.666 3.333 3.333 0 010-6.666zm5.338-3.205a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" clipRule="evenodd" />
                 </svg>
               </span>
             </div>
           </div>
           {/* You could add a map here later */}
        </div>

        {/* Form Section - NOW SECOND */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('contact.firstName', 'First Name')}*
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('contact.lastName', 'Last Name')}*
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1"
            />
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('contact.email', 'Email Address')}*
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1"
            />
          </div>

           {/* Message Content */}
           <div className="md:col-span-2"> {/* Spanning across for layout consistency with image */}
             <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
               {t('contact.message', 'Message content')}*
             </label>
             <textarea
               name="message"
               id="message"
               rows="4" // Adjust rows as needed
               required
               value={formData.message}
               onChange={handleChange}
               className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1 resize-none" // Added resize-none
             ></textarea>
           </div>

          {/* Submit Button */}
           <div className="flex justify-end items-center pt-4">
             <button
               type="submit"
               className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus:ring-gray-500" // Style similar to image
             >
               {t('contact.submitInquiry', 'SUBMIT INQUIRY')}
               {/* You might want an arrow icon here later */}
               <svg className="ms-3 h-5 w-5 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
               </svg>
             </button>
           </div>
        </form>

      </div>
    </div>
  );
}

// Add getStaticProps for translations
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])), // Load 'common' namespace
    },
  };
} 