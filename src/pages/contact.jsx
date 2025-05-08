import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import Image from 'next/image'; // Assuming you might want an image later
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

export default function Contact() {
  const router = useRouter();
  const { t } = useTranslation('common'); // Assuming 'common' namespace for translations
  const { locale } = router;

  const initialFormData = {
    fullName: '',      // Changed from firstName & lastName
    companyName: '',   // Added
    phoneNumber: '',   // Added
    email: '',
    message: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  const handleChange = (e) => {
    const { name, value } = e.target; // Simplified, type and checked not needed for these fields
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToastId = toast.loading(t('contact.sendingMessage', 'Sending message...')); // Show loading toast

    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t('contact.messageSentSuccess', 'Message sent successfully!'), { id: loadingToastId });
        setFormData(initialFormData); // Reset form
      } else {
        console.error('Form submission error:', result);
        toast.error(result.message || t('contact.messageSendError', 'Failed to send message. Please try again.'), { id: loadingToastId });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(t('contact.messageSendError', 'Failed to send message. Please try again.'), { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Toaster position="bottom-center" /> {/* Add Toaster component */}
      {/* Hero Section */}
      <div className="relative h-72 md:h-96 w-full">
        <Image
          src="/images/contact-us-hero-img.jpg"
          alt={t('contact.heroAlt', 'Contact Platinum Printing Press')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('contact.heroTitle', 'Get in Touch')}
          </h1>
          <p className="text-white text-lg md:text-xl max-w-2xl">
            {t('contact.heroSubtitle', 'We are here to help with all your printing needs. Reach out to us for inquiries, quotes, or support.')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-start">

          {/* Contact Info Section (Placeholder) */}
          <div className="space-y-8">
             <h2 className="text-3xl font-bold mb-6">{t('contact.contactInfoTitle', 'Contact Information')}</h2>
             <div>
               <h3 className="text-lg font-semibold mb-2">{t('contact.addressTitle', 'Address')}</h3>
               <p className="text-gray-600 dark:text-gray-400">
                 {t('contact.addressValue', '30m st, Erbil, Kurdistan Region of Iraq')}
               </p>
             </div>
             {/* === Map Section === */}
             <div className="mt-8 ">
               <h3 className="text-lg font-semibold mb-2">{t('contact.locationMapTitle', 'Our Location')}</h3>
               { 
                   <iframe 
                   src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d804.940879727038!2d44.0023492!3d36.1966327!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4007239045a83acd%3A0xb84bf11260eed421!2sPlatinum%20Printing%20Press!5e0!3m2!1sen!2siq!4v1746699335264!5m2!1sen!2siq"
                   width="100%" 
                   height="250" 
                   style={{ border:0 }} 
                   allowFullScreen="" 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade">
                 </iframe>
               
                
               }
               
             </div>
             <div>
               <h3 className="text-lg font-semibold mb-2">{t('contact.phoneTitle', 'Mobile')}</h3>
               <a href="tel:+9647510349381" dir="ltr" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                 {t('contact.phone1', '+964 751 034 9381')}
               </a>
               <a href="tel:+9647874404207" dir="ltr" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                 {t('contact.phone2', '+964 787 440 4207')}
               </a>
             </div>
             <div>
               <h3 className="text-lg font-semibold mb-2">{t('contact.emailTitle', 'Email')}</h3>
               <a href="mailto:info@platinum-printing.co" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                 {t('contact.emailAddress', 'info@platinum-printing.co')}
               </a>
             </div>
             <div>
               <h3 className="text-lg font-semibold mb-2">{t('contact.workingHoursTitle', 'Working Hours')}</h3>
               <p className="text-gray-600 dark:text-gray-400">
                 {t('contact.workingHoursDays', 'Saturday – Thursday, 9:00 AM – 6:00 PM')}
               </p>
             </div>
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

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('contact.fullName', 'Full Name')}*
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t('contact.fullNamePlaceholder', 'Enter your full name')}
                className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('contact.companyName', 'Company Name')}
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder={t('contact.companyNamePlaceholder', 'Enter your company name (optional)')}
                className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('contact.phoneNumber', 'Phone Number')}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder={t('contact.phoneNumberPlaceholder', 'Enter your phone number')}
                required
                className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1 rtl:text-right"
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
                placeholder={t('contact.emailPlaceholder', 'Enter your email address')}
                className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1"
              />
            </div>

             {/* Message Content */}
             <div className="md:col-span-2">
               <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 {t('contact.message', 'Message')}*
               </label>
               <textarea
                 name="message"
                 id="message"
                 rows="4"
                 required
                 value={formData.message}
                 onChange={handleChange}
                 placeholder={t('contact.messagePlaceholder', 'Enter your message')}
                 className="block w-full border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-0 outline-none bg-transparent py-2 px-1 resize-none"
               ></textarea>
             </div>

            {/* Submit Button */}
             <div className="flex justify-end items-center pt-4">
               <button
                 type="submit"
                 className={`inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:focus:ring-gray-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                 disabled={isSubmitting} // Disable button while submitting
               >
                 {isSubmitting ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     {t('contact.submitting', 'Submitting...')}
                   </>
                 ) : (
                   <>
                     {t('contact.submitInquiry', 'SUBMIT INQUIRY')}
                     <svg className="ms-3 h-5 w-5 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                     </svg>
                   </>
                 )}
               </button>
             </div>
          </form>

        </div>
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