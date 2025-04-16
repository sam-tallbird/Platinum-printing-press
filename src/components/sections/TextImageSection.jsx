import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

/**
 * A reusable section component with text and image side by side
 * @param {Object} props
 * @param {string} props.imageUrl - URL of the image
 * @param {string} props.imageAlt - Alt text for the image
 * @param {string} props.title - Section title
 * @param {Array<string>} props.paragraphs - Array of paragraphs
 * @param {string} props.imagePosition - Position of image ("left" or "right")
 * @param {number} props.imageWidth - Width of image
 * @param {number} props.imageHeight - Height of image
 * @param {Object} props.translations - Translations for title and paragraphs for RTL support
 * @param {string} props.translations.title - Translated title
 * @param {Array<string>} props.translations.paragraphs - Translated paragraphs
 * @param {string} props.className - Additional CSS classes
 */
const TextImageSection = ({
  imageUrl,
  imageAlt,
  title,
  paragraphs,
  imagePosition = 'right',
  imageWidth = 750,
  imageHeight = 1000,
  translations = null,
  className = '',
}) => {
  const router = useRouter();
  const { locale } = router;
  const isRTL = locale === 'ar';
  
  // Content based on locale
  const displayTitle = isRTL && translations ? translations.title : title;
  const displayParagraphs = isRTL && translations ? translations.paragraphs : paragraphs;

  return (
    <section className={`w-full ${className}`}>
      <div className="ps-24 pe-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <div 
            className={`${
              imagePosition === 'left' 
                ? 'md:order-1' 
                : 'md:order-2'
            } order-2`}
          >
            <div className="overflow-hidden rounded-lg shadow-lg">
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={imageWidth}
                height={imageHeight}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          {/* Content */}
          <div 
            className={`${
              imagePosition === 'left' 
                ? 'md:order-2' 
                : 'md:order-1'
            } order-1`}
          >
            <div className="md:max-w-xl">
              <h3 className="text-3xl font-bold mb-6">{displayTitle}</h3>
              {displayParagraphs.map((paragraph, index) => (
                <p key={index} className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextImageSection; 