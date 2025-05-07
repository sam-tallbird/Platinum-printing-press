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

// Updated services data for homepage carousel (9 services)
const servicesData = [
  {
    id: '01',
    titleKey: "services.01.title",
    defaultTitle: "Digital Printing",
    homeDescriptionKey: "services.01.homeDescription",
    defaultHomeDescription: "Fast turnaround with high precision",
    image: "/images/digital-printing.png",
  },
  {
    id: '02',
    titleKey: "services.02.title",
    defaultTitle: "Offset Printing",
    homeDescriptionKey: "services.02.homeDescription",
    defaultHomeDescription: "The smart choice for large volumes",
    image: "/images/offset-printing.png",
  },
  {
    id: '03',
    titleKey: "services.03.title",
    defaultTitle: "Advertising & Commercial Printing",
    homeDescriptionKey: "services.03.homeDescription",
    defaultHomeDescription: "Strong visual presence that reflects your brand",
    image: "/images/larg-format-printing.png",
  },
  {
    id: '04',
    titleKey: "services.04.title",
    defaultTitle: "Promotional & Gift Printing",
    homeDescriptionKey: "services.04.homeDescription",
    defaultHomeDescription: "Custom gifts that strengthen client loyalty",
    image: "/images/graphic-desgin.jpg", // Assuming this image fits
  },
  {
    id: '05',
    titleKey: "services.05.title",
    defaultTitle: "Packaging & Finishing",
    homeDescriptionKey: "services.05.homeDescription",
    defaultHomeDescription: "Innovative packaging that adds value",
    image: "/images/finishing-packinging.png",
  },
  {
    id: '06',
    titleKey: "services.06.title",
    defaultTitle: "Creative Design",
    homeDescriptionKey: "services.06.homeDescription",
    defaultHomeDescription: "Visual identity that speaks your brand",
    image: "/images/custom-packaging-solutions.png", // Assuming this image fits
  },
  {
    id: '07',
    titleKey: "services.07.title",
    defaultTitle: "Office Stationery",
    homeDescriptionKey: "services.07.homeDescription",
    defaultHomeDescription: "Professional print solutions for everyday use",
    image: "/images/offset-printing.png", // Updated image
  },
  {
    id: '08',
    titleKey: "services.08.title",
    defaultTitle: "Exhibition & Event Branding",
    homeDescriptionKey: "services.08.homeDescription",
    defaultHomeDescription: "Complete solutions for booths & displays",
    image: "/images/our-vision.jpg", // Updated image
  },
  {
    id: '09',
    titleKey: "services.09.title",
    defaultTitle: "Custom Solutions",
    homeDescriptionKey: "services.09.homeDescription",
    defaultHomeDescription: "Tailored execution that matches your vision",
    image: "/images/larg-format-printing.png", // Updated image
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
  const lenis = useLenis(); // Get Lenis instance

  // Define the wheel handler separately
  const handleManualWheelScroll = (event) => {
    const scrollContainer = scrollContainerRef.current;
    // Keep lenis check needed for stop/start
    if (!scrollContainer || !lenis) return; 

    // --- Viewport Visibility Check ---
    const rect = scrollContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    const visibilityThreshold = 0.98; // Require 98% visibility (Adjust if needed)
    const isSufficientlyVisible = (visibleHeight / rect.height) >= visibilityThreshold;

    if (!isSufficientlyVisible) {
      if (lenis.isStopped) lenis.start(); // Ensure lenis running if not visible
      return;
    }
    // --- End Visibility Check ---

    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const currentScroll = scrollContainer.scrollLeft;
    const tolerance = 10; // Small tolerance

    // --- Boundary Check with Computed Direction ---
    let preventDefault = false;
    const direction = getComputedStyle(scrollContainer).direction;
    const isRTL = direction === 'rtl';
    const scrollAmount = event.deltaY;

    // Explicitly separate LTR and RTL logic
    if (isRTL) {
      // RTL: Assuming scrollLeft is 0 at the right (start) and negative towards the left (end)
      // maxScroll is still positive (scrollWidth - clientWidth)
      if (scrollAmount > 0) { // User intends scroll down -> horizontal LEFT (more negative scrollLeft)
          // Prevent default if NOT at the very End (left edge, scrollLeft approx -maxScroll)
          if (currentScroll > -(maxScroll - tolerance)) { 
              preventDefault = true;
          }
      } else if (scrollAmount < 0) { // User intends scroll up -> horizontal RIGHT (towards scrollLeft 0)
          // Prevent default if NOT at the very Start (right edge, scrollLeft approx 0)
          if (currentScroll < -tolerance) { // Check if we are past the starting tolerance (negative)
              preventDefault = true;
          }
      }
    } else {
      // LTR: scrollLeft increases from 0 to max when scrolling visually right
      if (scrollAmount > 0) { // User intends scroll down -> horizontal RIGHT (increasing scrollLeft)
        // Prevent default if NOT at the very End (right edge, maxScroll)
        if (currentScroll < maxScroll - tolerance) {
            preventDefault = true;
        }
      } else if (scrollAmount < 0) { // User intends scroll up -> horizontal LEFT (decreasing scrollLeft)
        // Prevent default if NOT at the very Start (left edge, scrollLeft 0)
        if (currentScroll > tolerance) {
            preventDefault = true;
        }
      }
    }
    // --- End Boundary Check ---

    // --- Animation & Lenis Control ---
    const scrollDirectionMultiplier = isRTL ? -1 : 1;
    const finalScrollAmount = event.deltaY * 5 * scrollDirectionMultiplier;

    if (preventDefault) {
      event.preventDefault();
      if (!lenis.isStopped) {
        lenis.stop();
      }

      gsap.to(scrollContainer, {
        scrollLeft: currentScroll + finalScrollAmount,
        duration: 0.3,
        ease: 'power1.out',
        overwrite: 'auto',
        onComplete: () => {
          if (lenis.isStopped) {
            lenis.start();
          }
        },
        onInterrupt: () => {
          // Ensure Lenis restarts if animation is interrupted while visible
          if (isSufficientlyVisible && lenis.isStopped) { 
            lenis.start();
          }
        }
      });
    } else {
      // Hit boundary or visibility issue, ensure Lenis is running
      if (lenis.isStopped) {
        lenis.start();
      }
      // Allow default vertical scroll
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
        // Only add the wheel listener on enter
        scrollContainer?.addEventListener('wheel', handleManualWheelScroll, { passive: false });
    };

    const handleMouseLeave = () => {
        // Remove manual wheel listener when mouse leaves
        scrollContainer?.removeEventListener('wheel', handleManualWheelScroll);
    };

    // Attach listeners for manual scroll only
    if (scrollContainer) { 
      scrollContainer.addEventListener('mouseenter', handleMouseEnter);
      // Remove mousemove listener
      scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    // --- Cleanup Function --- 
    return () => {
      if (textScrollTrigger) {
        textScrollTrigger.kill();
      }
      if (imageScaleTween && imageScaleTween.scrollTrigger) { 
        imageScaleTween.scrollTrigger.kill(); 
      }
      if (serviceCardTween && serviceCardTween.scrollTrigger) {
        serviceCardTween.scrollTrigger.kill();
      }
      // Remove scrollContainer from killTweensOf if no tweens target it anymore
      gsap.killTweensOf(['.belief-line', '.scale-image-item', '.service-image-mask']);
      
      // Remove listeners
      if (scrollContainer) { 
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        // Remove mousemove listener removal
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
        scrollContainer.removeEventListener('wheel', handleManualWheelScroll); 
      }
      
      // Remove stopAutoScroll call
      
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
      {/* === Full Screen Video Hero Section - Use aspect ratio on mobile === */}
      <section className="relative w-full aspect-video md:aspect-auto md:h-screen overflow-hidden bg-black"> {/* Added aspect-video md:aspect-auto */} 
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute top-0 left-0 w-full h-full object-cover z-0" // Stays the same
          src="/videos/home-hero-video.mp4" 
        >
          Your browser does not support the video tag.
        </video>
      </section>
      {/* === End Full Screen Video Hero Section === */}

      {/* === Belief Statement & Logo Section === */}
      {/* Keep reduced padding for now, can be re-evaluated */}
      <section className="py-8 md:py-16 lg:py-20"> 
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 md:gap-12 rtl:md:space-x-reverse"> 
          {/* Text content */}
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div ref={beliefTextRef} className="overflow-hidden ltr:text-left rtl:text-right">
              {/* Increased size on parent p */}
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white leading-normal md:leading-relaxed">
                {beliefLines.map((line, index) => (
                  <span 
                    key={index} 
                    className={`belief-line block ${ // Add top margin to lines after the first one
                      index > 0 ? 'mt-2' : '' 
                    } ${ // Keep existing size/weight logic
                      index === 1 ? 'text-lg md:text-xl lg:text-2xl' : 
                      index === 2 ? 'text-base md:text-lg lg:text-xl font-medium' : '' 
                    }`}
                  >
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
          {/* Logo */}
          <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center md:justify-end">
             <Image 
               src="/images/metalic-logo.svg"
               alt={t('alt.metallicLogo', "Platinum Printing Press Metallic Logo")}
               width={500} 
               height={63} 
               className={`h-auto max-w-full ${locale === 'ar' ? 'md:mr-auto' : 'md:ml-auto'}`}
             />
          </div>
        </div>
      </section>
      {/* === End Belief Statement & Logo Section === */}

      {/* === Three Image Section === */}
      <section ref={threeImageSectionRef} className="pt-6 md:pt-8 lg:pt-10 pb-6 md:pb-8 lg:pb-10 overflow-hidden">
        <div className="mx-auto px-9"> {/* Side padding 36px */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3"> {/* 3 columns on md+, 12px gap */}
            {/* Image 1 (Left) */}
            <div className="relative w-full aspect-[4/3] scale-image-item"> {/* Added scale-image-item class */}
              <Image 
                src="/images/home-about-left.jpg"
                alt="Digital printing process"
                fill
                className="object-cover " // Fill container, cover aspect ratio
              />
            </div>
            {/* Image 2 (Center) */}
            <div className="relative w-full aspect-[4/3] scale-image-item"> {/* Added scale-image-item class */}
              <Image 
                src="/images/home-about-center.jpg"
                alt="Custom packaging solutions examples"
                fill
                className="object-cover "
              />
            </div>
            {/* Image 3 (Right) */}
            <div className="relative w-full aspect-[4/3] scale-image-item"> {/* Added scale-image-item class */}
              <Image 
                src="/images/home-about-right.jpg"
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
      <section ref={serviceCarouselSectionRef} className="pt-12 md:pt-16 lg:pt-20 pb-12 md:pb-16 lg:pb-20">
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
                     {/* Service Name & Subheading - Absolutely positioned bottom-left */}
                     <div className="absolute bottom-0 start-0 m-4 text-white">
                       <h3 className="text-2xl md:text-3xl font-bold mb-1">
                         {t(service.titleKey, service.defaultTitle)} 
                       </h3>
                       <p className="text-sm md:text-base font-medium">
                         {t(service.homeDescriptionKey, service.defaultHomeDescription)} 
                       </p>
                     </div>
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