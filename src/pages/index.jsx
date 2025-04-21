import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Define services data (extracted from services.jsx, simplified for carousel)
const servicesData = [
  {
    id: '01',
    titleKey: "services.01.title", // Use translation key
    defaultTitle: "Digital Printing", // Fallback English title
    image: "/images/digital-printing.png",
  },
  {
    id: '02',
    titleKey: "services.02.title",
    defaultTitle: "Offset Printing",
    image: "/images/offset-printing.png",
  },
  {
    id: '03',
    titleKey: "services.03.title",
    defaultTitle: "Large-Format Printing",
    image: "/images/larg-format-printing.png", // Corrected potential typo from services.jsx
  },
  {
    id: '04',
    titleKey: "services.04.title",
    defaultTitle: "Finishing & Packaging",
    image: "/images/finishing-packinging.png", // Setting back to the confirmed filename with 'i'
  },
  {
    id: '05',
    titleKey: "services.05.title",
    defaultTitle: "Graphic Design",
    image: "/images/graphic-desgin.jpg", // Corrected path and extension
  },
  {
    id: '06',
    titleKey: "services.06.title",
    defaultTitle: "Custom Packaging Solutions",
    image: "/images/custom-packaging-solutions.png", // Assuming this path based on pattern
  },
];

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const beliefTextRef = useRef(null);
  const threeImageSectionRef = useRef(null); // Ref for the three image section
  const serviceCarouselSectionRef = useRef(null); // Ref for the service carousel section
  const scrollContainerRef = useRef(null); // Ref for the horizontal scroll container
  const autoScrollTween = useRef(null); // Ref to store the auto-scroll tween

  useEffect(() => {
    // --- Belief Text Animation --- 
    let textScrollTrigger;
    if (beliefTextRef.current) {
      const lines = beliefTextRef.current.querySelectorAll('.belief-line');
      if (lines.length > 0) {
        textScrollTrigger = ScrollTrigger.create({
          trigger: beliefTextRef.current,
          start: "top 80%",
          onEnter: () => gsap.from(lines, { 
            y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.2 
          }),
        });
      }
    }

    // --- Three Image Scale Animation --- 
    let imageScaleTween;
    if (threeImageSectionRef.current) {
      const images = threeImageSectionRef.current.querySelectorAll('.scale-image-item');
      if (images.length > 0) {
        imageScaleTween = gsap.fromTo(images, 
          { scale: 1.15, transformOrigin: 'center center' }, // FROM state: slightly scaled up
          { 
            scale: 1, // TO state: original size
            ease: 'none', // Linear easing for scrub
            stagger: 0.1, // Slight stagger between images
            scrollTrigger: {
              trigger: threeImageSectionRef.current,
              start: "top 80%", // Start when section top hits 80% from viewport top
              end: "top center", // End when section top hits viewport center (Shortened duration)
              scrub: 1, // Smooth scrubbing effect (sync animation with scroll)
              // markers: true, // Uncomment for debugging
            }
          }
        );
      }
    }

    // --- Service Card Mask Animation --- 
    let serviceCardTween;
    if (serviceCarouselSectionRef.current) {
      // Target the image containers specifically
      const imageMasks = serviceCarouselSectionRef.current.querySelectorAll('.service-image-mask'); 
      if (imageMasks.length > 0) {
        serviceCardTween = gsap.fromTo(imageMasks, 
          { // FROM state:
            clipPath: 'inset(0 100% 0 0)', // Start fully masked from the right
          }, 
          { // TO state:
            clipPath: 'inset(0 0% 0 0)', // Animate to fully visible (left-to-right reveal)
            stagger: 0.15, // Offset between each card's image animation
            ease: 'none', // Linear easing for scrub
            scrollTrigger: {
              trigger: serviceCarouselSectionRef.current,
              start: "top 75%", 
              end: "bottom 80%", // End position is less relevant now, but can keep for trigger area
              // scrub: 1, // REMOVED scrub to make it a trigger-once animation
              // markers: true, 
            }
          }
        );
      }
    }

    // --- Horizontal Scroll on Wheel --- 
    const carouselSection = serviceCarouselSectionRef.current; // Keep ref for triggers if needed, but not for listeners
    const scrollContainer = scrollContainerRef.current;

    const handleWheelScroll = (event) => {
      if (scrollContainer) {
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const currentScrollLeft = scrollContainer.scrollLeft;
        const scrollAmount = event.deltaY * 1.5; // Adjust sensitivity
        const threshold = 1; // Pixel threshold - vertical scroll starts 1px before the end

        // Check if we should prevent default vertical scroll
        let preventDefault = false;
        // Check if there's more than 'threshold' pixels left to scroll right
        if (scrollAmount > 0 && currentScrollLeft < maxScrollLeft - threshold) { 
          preventDefault = true;
        // Check if there's more than 'threshold' pixels left to scroll left
        } else if (scrollAmount < 0 && currentScrollLeft > threshold) { 
          preventDefault = true;
        }

        if (preventDefault) {
          event.preventDefault();
          // Kill auto-scroll if wheel is used
          if (autoScrollTween.current) {
              autoScrollTween.current.kill();
              autoScrollTween.current = null;
          }
          gsap.to(scrollContainer, {
            scrollLeft: currentScrollLeft + scrollAmount,
            duration: 0.3,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        } 
        // If preventDefault is false, the browser's default vertical scroll will happen
      }
    };

    // --- Auto Scroll on Hover --- 
    const scrollSpeed = 50; // Pixels per second

    const handleMouseEnter = () => {
        if (!scrollContainer) return;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const currentScroll = scrollContainer.scrollLeft;
        const remainingScroll = maxScroll - currentScroll;

        if (remainingScroll > 0) {
            // Kill any existing tween first
            if (autoScrollTween.current) {
                autoScrollTween.current.kill();
            }
            const duration = remainingScroll / scrollSpeed;
            autoScrollTween.current = gsap.to(scrollContainer, {
                scrollLeft: maxScroll,
                duration: duration,
                ease: 'none', // Constant speed
                overwrite: 'auto' // Allow other tweens to overwrite
            });
        }
    };

    const handleMouseLeave = () => {
        if (autoScrollTween.current) {
            autoScrollTween.current.kill();
            autoScrollTween.current = null;
        }
    };

    // Attach listeners to the scroll container instead of the section
    if (scrollContainer) { 
      scrollContainer.addEventListener('wheel', handleWheelScroll, { passive: false });
      scrollContainer.addEventListener('mouseenter', handleMouseEnter);
      scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    // --- Cleanup Function --- 
    return () => {
      if (textScrollTrigger) {
        textScrollTrigger.kill();
      }
      // Kill the ScrollTrigger associated with the image tween
      if (imageScaleTween && imageScaleTween.scrollTrigger) { 
        imageScaleTween.scrollTrigger.kill(); 
      }
      // Kill the ScrollTrigger associated with the service card tween
      if (serviceCardTween && serviceCardTween.scrollTrigger) {
        serviceCardTween.scrollTrigger.kill();
      }
      // Kill any remaining tweens on the elements
      gsap.killTweensOf('.belief-line');
      gsap.killTweensOf('.scale-image-item');
      gsap.killTweensOf('.service-image-mask'); // Target the new class
      
      // Remove event listeners from the scroll container
      if (scrollContainer) { 
        scrollContainer.removeEventListener('wheel', handleWheelScroll);
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
      // Kill auto-scroll tween if active
      if (autoScrollTween.current) {
          autoScrollTween.current.kill();
      }
    };
  }, [t]); // Re-run effect if translation changes

  const beliefStatement = t('home.beliefStatement', "At Platinum We believe that printing is an essential part of any project's identity, and our goal is to reflect your message and vision in the best possible way.");
  const beliefLines = [
    "At Platinum We believe that printing is an essential",
    "part of any project's identity, and our goal is to reflect",
    "your message and vision in the best possible way."
  ];

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* === Full Screen Video Hero Section - Responsive Height === */}
      <section className="relative w-full h-[60vh] md:h-screen overflow-hidden"> {/* Responsive height */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline // Important for mobile playback
          className="absolute top-0 left-0 w-full h-auto z-0" // Fit width, maintain aspect ratio, align top
          src="/videos/videoplayback_1hOBwVvh.mp4" // Video source
        >
          {/* Fallback text for browsers that don't support the video tag */}
          Your browser does not support the video tag.
        </video>
        {/* Overlay Removed */}
      </section>
      {/* === End Full Screen Video Hero Section === */}

      {/* === New Text Section === */}
      <section className="py-12 md:py-16 lg:py-20">
        {/* Flex container for 50/50 split, using space-x-reverse for direction */}
        <div className="mx-auto px-9 flex flex-col md:flex-row items-center gap-8 md:gap-12 rtl:md:space-x-reverse"> {/* Use Flexbox + space-x-reverse */}
          {/* Text: Takes 50% width */}
          <div className="w-full md:w-1/2"> {/* Removed conditional order */}
            <p ref={beliefTextRef} className="text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white leading-relaxed ltr:text-left rtl:text-right overflow-hidden"> {/* Added overflow-hidden */}
              {beliefLines.map((line, index) => (
                <span key={index} className="belief-line block"> {/* Wrap each line in a span, display block */}
                  {line}
                </span>
              ))}
            </p>
          </div>
          {/* Logo: Takes 50% width, alignment via margin auto */}
          <div className="w-full md:w-1/2"> {/* Removed flex and justify-* */}
            <Image 
              src="/images/metalic-logo.svg"
              alt="Platinum Printing Press Logo"
              width={700}
              height={88}
              className={`h-auto max-w-full ${locale === 'ar' ? 'md:mr-auto' : 'md:ml-auto'}`}
            />
          </div>
        </div>
      </section>
      {/* === End New Text Section === */}

      {/* === Three Image Section === */}
      <section ref={threeImageSectionRef} className="py-12 md:py-16 lg:py-20 overflow-hidden"> {/* Add ref and overflow-hidden */}
        <div className="mx-auto px-9"> {/* Side padding 36px */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3"> {/* 3 columns on md+, 12px gap */}
            {/* Image 1 */}
            <div className="relative w-full aspect-[4/3] scale-image-item"> {/* Added scale-image-item class */}
              <Image 
                src="/images/digital-printing.png"
                alt="Digital printing process"
                fill
                className="object-cover " // Fill container, cover aspect ratio
              />
            </div>
            {/* Image 2 */}
            <div className="relative w-full aspect-[4/3] scale-image-item"> {/* Added scale-image-item class */}
              <Image 
                src="/images/custom-packaging-solutions.png"
                alt="Custom packaging solutions examples"
                fill
                className="object-cover "
              />
            </div>
            {/* Image 3 */}
            <div className="relative w-full aspect-[4/3] scale-image-item"> {/* Added scale-image-item class */}
              <Image 
                src="/images/finishing-packinging.png" // Check filename typo? 'packaging'?
                alt="Print finishing and packaging services"
                fill
                className="object-cover "
              />
            </div>
          </div>
        </div>
      </section>
      {/* === End Three Image Section === */}

      {/* === Service Carousel Section === */}
      <section ref={serviceCarouselSectionRef} className="py-12 md:py-16 lg:py-20">
        {/* Container with side padding */}
        <div className="mx-auto px-9">
           {/* Flex container for Title and View All button */}
           <div className="flex justify-between items-center mb-8">
             {/* Title for Carousel */}
             <h2 className="text-5xl font-bold uppercase ltr:text-left rtl:text-right"> {/* Removed mb-8 */}
               {t('home.servicesTitle', 'SERVICES')}
             </h2>
             {/* View All Button/Badge */}
             <Link 
               href="/services" // Assuming link destination is /services
               className="inline-block text-sm uppercase font-medium border border-gray-700 dark:border-gray-300 text-gray-700 dark:text-gray-300 rounded-full px-4 py-1 transition-colors hover:bg-gray-700 hover:text-white dark:hover:bg-gray-300 dark:hover:text-gray-900"
             >
               {t('home.viewAll', 'VIEW ALL')} 
             </Link>
           </div>
           
           {/* Horizontal Scroll Container - Scrollbar hidden */}
           <div ref={scrollContainerRef} className="flex overflow-x-auto gap-x-3 pb-4 scrollbar-hide">
             {servicesData.map((service) => (
               <Link key={service.id} href="/services">
                 <div className="flex-shrink-0 w-96 md:w-[30rem]">
                   <div className="relative w-full aspect-[3/4] overflow-hidden service-image-mask">
                     <Image 
                       src={service.image}
                       alt={t(service.titleKey, service.defaultTitle)}
                       fill
                       className="object-cover" 
                     />
                     {/* Service Name - Absolutely positioned bottom-left */}
                     <p className="absolute bottom-0 start-0 m-2 px-3 py-1 text-white text-3xl font-medium">
                       {t(service.titleKey, service.defaultTitle)} 
                     </p>
                   </div>
                 </div>
               </Link>
             ))}
           </div>
        </div>
      </section>
      {/* === End Service Carousel Section === */}

      {/* === Existing Content (Placeholder/Original) === */}
      <div className="py-12 bg-gray-50 dark:bg-gray-900"> {/* Added bg color for contrast */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            {locale === 'ar' ? 'بلاتينيوم للطباعة' : 'Platinum Printing Press'}
          </h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('content.placeholder')}
          </p>
        </div>
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