import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useLenis } from 'lenis/react';

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
  const lenis = useLenis(); // Get Lenis instance

  // Define the wheel handler separately
  const handleManualWheelScroll = (event) => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && lenis) { 
      const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const currentScrollLeft = scrollContainer.scrollLeft;
      // Adjust scroll direction based on locale
      const scrollDirectionMultiplier = locale === 'ar' ? -1 : 1; 
      const scrollAmount = event.deltaY * 1.5 * scrollDirectionMultiplier;
      const threshold = 1; 

      let preventDefault = false;
      // Adjust boundary checks based on locale
      if (locale === 'ar') {
        // RTL: Scrolling means decreasing scrollLeft (visually right)
        // or increasing scrollLeft (visually left)
        if (scrollAmount < 0 && currentScrollLeft > threshold) { // Scrolling right (visually), not at the end (left edge)
          preventDefault = true;
        } else if (scrollAmount > 0 && currentScrollLeft < maxScrollLeft - threshold) { // Scrolling left (visually), not at the start (right edge)
          preventDefault = true;
        }
      } else {
        // LTR (existing logic)
        if (scrollAmount > 0 && currentScrollLeft < maxScrollLeft - threshold) { // Scrolling right, not at the end
          preventDefault = true;
        } else if (scrollAmount < 0 && currentScrollLeft > threshold) { // Scrolling left, not at the beginning
          preventDefault = true;
        }
      }

      if (preventDefault) {
        event.preventDefault(); 
        lenis.stop(); 

        if (autoScrollTween.current) {
            autoScrollTween.current.kill();
            autoScrollTween.current = null;
        }
        
        gsap.to(scrollContainer, {
          scrollLeft: currentScrollLeft + scrollAmount,
          duration: 0.3,
          ease: 'power1.out',
          overwrite: 'auto',
          onComplete: () => {
            lenis.start(); 
          }
        });
      } 
    }
  };

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
            y: 50, 
            opacity: 0, 
            duration: 0.8, 
            ease: 'power3.out', 
            stagger: 0.4
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

    // --- Horizontal Scroll Management --- 
    const scrollContainer = scrollContainerRef.current;

    const handleMouseEnter = () => {
        scrollContainer?.addEventListener('wheel', handleManualWheelScroll, { passive: false });
        
        if (!scrollContainer) return;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const currentScroll = scrollContainer.scrollLeft;
        const scrollSpeed = 50;
        let remainingScroll = 0;
        let targetScroll = 0;

        // Determine auto-scroll target and remaining distance based on locale
        if (locale === 'ar') {
          targetScroll = maxScroll; // RTL: Scroll visually LEFT towards the max scrollLeft value
          remainingScroll = maxScroll - currentScroll; // Calculate remaining distance towards maxScrollLeft
        } else {
          targetScroll = maxScroll; // LTR: Scroll visually LEFT towards the max scrollLeft value
          remainingScroll = maxScroll - currentScroll;
        }

        // Ensure remainingScroll is not negative (can happen with rounding)
        remainingScroll = Math.max(0, remainingScroll); 

        if (remainingScroll > 0) {
            if (autoScrollTween.current) autoScrollTween.current.kill();
            const duration = remainingScroll / scrollSpeed;
            autoScrollTween.current = gsap.to(scrollContainer, {
                scrollLeft: targetScroll, // Animate towards the locale-specific target
                duration: duration, 
                ease: 'none', 
                overwrite: 'auto'
            });
        }
    };

    const handleMouseLeave = () => {
        // Remove manual wheel listener when mouse leaves
        scrollContainer?.removeEventListener('wheel', handleManualWheelScroll);

        // Stop auto-scroll (existing logic)
        if (autoScrollTween.current) {
            autoScrollTween.current.kill();
            autoScrollTween.current = null;
        }
    };

    // Attach hover listeners to the scroll container
    if (scrollContainer) { 
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
      gsap.killTweensOf(['.belief-line', '.scale-image-item', '.service-image-mask', scrollContainer]);
      
      // Remove hover listeners and ensure wheel listener is removed
      if (scrollContainer) { 
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
        scrollContainer.removeEventListener('wheel', handleManualWheelScroll); 
      }
      // Kill auto-scroll tween if active
      if (autoScrollTween.current) {
          autoScrollTween.current.kill();
      }
      // Ensure Lenis is running when component unmounts, just in case
      lenis?.start();
    };
  }, [t, lenis, locale]); // Re-run effect if translation changes

  // Get the translated belief statement lines using separate keys
  const beliefLines = [
    t('home.beliefStatement_line1', "At Platinum We believe that printing is an essential"), // Fallback text included
    t('home.beliefStatement_line2', "part of any project's identity, and our goal is to reflect"),
    t('home.beliefStatement_line3', "your message and vision in the best possible way.")
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
        <div className="mx-auto px-9 flex flex-col md:flex-row items-center gap-8 md:gap-12 rtl:md:space-x-reverse">
          <div className="w-full md:w-1/2">
            <p key={locale} ref={beliefTextRef} className="text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white leading-relaxed ltr:text-left rtl:text-right overflow-hidden">
              {/* Map over the array of translated lines */}
              {beliefLines.map((line, index) => (
                <span key={index} className="belief-line block">
                  {line} 
                </span>
              ))}
            </p>
          </div>
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
      <section ref={threeImageSectionRef} className="pt-6 md:pt-8 lg:pt-10 pb-6 md:pb-8 lg:pb-10 overflow-hidden">
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
      <section ref={serviceCarouselSectionRef} className="pt-6 md:pt-8 lg:pt-10 pb-12 md:pb-16 lg:pb-20">
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