import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

// Register ScrollTrigger if running in the browser
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  
  // Refs for animation
  const sectionRef = useRef(null);
  const textWrapperRef = useRef(null);
  const textMaskRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const imageMaskRef = useRef(null);

  // Content based on locale
  const displayTitle = isRTL && translations ? translations.title : title;
  const displayParagraphs = isRTL && translations ? translations.paragraphs : paragraphs;

  // Animation Effect
  useEffect(() => {
    const sectionElement = sectionRef.current;
    const textMask = textMaskRef.current;
    const imageMask = imageMaskRef.current;

    if (!sectionElement || !textMask || !imageMask) return;

    // Determine visual start edge based on RTL
    const visualStartEdge = isRTL ? 'right' : 'left';
    const visualEndEdge = isRTL ? 'left' : 'right';

    // Determine start positions and origins based on imagePosition AND isRTL
    let textMaskInitialPos = {};
    let imageMaskInitialPos = {};
    let textMaskOrigin = '';
    let imageMaskOrigin = '';

    if (imagePosition === 'left') {
      // Image left, Text right
      textMaskInitialPos = { width: '100%', [visualStartEdge]: 0, [visualEndEdge]: 'auto' }; // Text starts covering from visual start
      imageMaskInitialPos = { width: '100%', [visualEndEdge]: 0, [visualStartEdge]: 'auto' }; // Image starts covering from visual end
      textMaskOrigin = `${visualStartEdge} center`; // Text reveals towards visual end
      imageMaskOrigin = `${visualEndEdge} center`; // Image reveals towards visual start
    } else {
      // Image right, Text left (Default)
      textMaskInitialPos = { width: '100%', [visualEndEdge]: 0, [visualStartEdge]: 'auto' }; // Text starts covering from visual end
      imageMaskInitialPos = { width: '100%', [visualStartEdge]: 0, [visualEndEdge]: 'auto' }; // Image starts covering from visual start
      textMaskOrigin = `${visualEndEdge} center`; // Text reveals towards visual start
      imageMaskOrigin = `${visualStartEdge} center`; // Image reveals towards visual end
    }

    // Set initial mask states
    gsap.set(textMask, textMaskInitialPos);
    gsap.set(imageMask, imageMaskInitialPos);

    // Create ScrollTrigger timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionElement,
        start: "top 80%", // Start animation when 80% of the section is visible
        end: "bottom 20%", // Can adjust end point if needed
        // markers: true, // Uncomment for debugging
        toggleActions: "play none none none" // Play animation once on enter
      }
    });

    // Animate Text Mask
    tl.to(textMask, {
      width: '0%',
      duration: 1.2,
      ease: "circ.inOut",
      transformOrigin: textMaskOrigin // Use calculated origin
    });

    // Animate Image Mask
    tl.to(imageMask, {
      width: '0%',
      duration: 1.2,
      ease: "circ.inOut",
      transformOrigin: imageMaskOrigin // Use calculated origin
    }, "<0.2"); // Start slightly after the text mask animation begins

    // Cleanup function for ScrollTrigger
    return () => {
      if (tl) tl.kill(); // Kill timeline
      ScrollTrigger.getAll().forEach(trigger => trigger.kill()); // Kill associated ScrollTriggers
    };

  }, [isRTL, imagePosition]); // Added isRTL and imagePosition to dependencies

  return (
    <section ref={sectionRef} className={`w-full ${className}`}>
      {/* Responsive Padding */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24"> 
        {/* Responsive Gap */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-center"> 
          {/* Image */}
          <div 
            className={`${
              imagePosition === 'left' 
                ? 'md:order-1' 
                : 'md:order-2'
            } order-2 relative overflow-hidden`}
            ref={imageWrapperRef}
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
            {/* Image Mask */}
            <div 
              ref={imageMaskRef}
              className="absolute inset-0 bg-gray-50 dark:bg-gray-900 z-10"
            ></div>
          </div>
          
          {/* Content */}
          <div 
            className={`${
              imagePosition === 'left' 
                ? 'md:order-2' 
                : 'md:order-1'
            } order-1 relative overflow-hidden`}
            ref={textWrapperRef}
          >
            <div className="md:max-w-xl">
              <h3 className="text-3xl font-bold mb-6">{displayTitle}</h3>
              {displayParagraphs.map((paragraph, index) => (
                <p key={index} className="text-lg mb-4 text-gray-700 dark:text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
            {/* Text Mask */}
            <div 
              ref={textMaskRef}
              className="absolute inset-0 bg-gray-50 dark:bg-gray-900 z-10"
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextImageSection; 