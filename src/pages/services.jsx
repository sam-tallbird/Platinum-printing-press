import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';
import ProductCard from '../components/products/ProductCard.jsx';

// Register plugins outside of component
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export default function Services() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const isRTL = locale === 'ar';
  
  // Refs for animations
  const heroImageMaskRef = useRef(null);
  const badgeContainerRef = useRef(null);
  const badgeMaskRef = useRef(null);
  const badgeTextRef = useRef(null);
  
  // Heading text refs - one for each word
  const word1ContainerRef = useRef(null);
  const word1MaskRef = useRef(null);
  const word1TextRef = useRef(null);
  
  const word2ContainerRef = useRef(null);
  const word2MaskRef = useRef(null);
  const word2TextRef = useRef(null);
  
  const word3ContainerRef = useRef(null);
  const word3MaskRef = useRef(null);
  const word3TextRef = useRef(null);
  
  // Subtitle paragraph ref
  const subtitleRef = useRef(null);
  
  // Button ref
  const buttonRef = useRef(null);

  // Container refs
  const scrollSectionRef = useRef(null);
  const stickyContainerRef = useRef(null);
  
  // Card refs
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  const card4Ref = useRef(null);
  const card5Ref = useRef(null);
  const card6Ref = useRef(null);
  const card7Ref = useRef(null);
  const card8Ref = useRef(null);
  const card9Ref = useRef(null);
  
  // Store all card refs in an array for easier access
  const cardRefs = [card1Ref, card2Ref, card3Ref, card4Ref, card5Ref, card6Ref, card7Ref, card8Ref, card9Ref];

  // Function to scroll to the first service card
  const scrollToFirstService = () => {
    // Get the scroll section element
    if (!scrollSectionRef.current) return;
    
    // Use GSAP to smoothly scroll to the first service card
    gsap.to(window, {
      duration: 1.2,
      scrollTo: {
        y: scrollSectionRef.current,
        offsetY: 0
      },
      ease: "power2.inOut"
    });
  };

  // Hero animations
  useEffect(() => {
    // Add console logging to debug translations
    console.log('Current locale:', locale);
    console.log('Translations:', {
      word1: t('services.heroTitle.word1'),
      word2: t('services.heroTitle.word2'),
      word3: t('services.heroTitle.word3')
    });
    
    // Force refresh text content when locale changes
    if (word1TextRef.current) word1TextRef.current.textContent = t('services.heroTitle.word1', 'Premium');
    if (word2TextRef.current) word2TextRef.current.textContent = t('services.heroTitle.word2', 'Printing');
    if (word3TextRef.current) word3TextRef.current.textContent = t('services.heroTitle.word3', 'Services');

    // Hero image mask reveal animation
    if (heroImageMaskRef.current) {
      gsap.set(heroImageMaskRef.current, { 
        width: '100%',
        right: isRTL ? 'auto' : 0,
        left: isRTL ? 0 : 'auto',
      });
      
      gsap.to(heroImageMaskRef.current, {
        width: '0%',
        duration: 1.2,
        delay: 0.3,
        ease: "circ.out",
        transformOrigin: isRTL ? 'right center' : 'left center'
      });
    }
    
    // Badge animations
    if (badgeMaskRef.current && badgeTextRef.current) {
      // Set initial states
      gsap.set(badgeMaskRef.current, {
        width: '100%',
        right: isRTL ? 'auto' : 0,
        left: isRTL ? 0 : 'auto',
      });
      
      gsap.set(badgeTextRef.current, {
        opacity: 0
      });
      
      // Create timeline for coordinated animations
      const tl = gsap.timeline({ delay: 0.1 });
      
      // Mask reveal animation
      tl.to(badgeMaskRef.current, {
        width: '0%',
        duration: 1.3,
        ease: "circ.out",
        transformOrigin: isRTL ? 'right center' : 'left center'
      });
      
      // Fade in text simultaneously
      tl.to(badgeTextRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power1.inOut"
      }, "<"); // Start at the same time as the previous animation
    }
    
    // Heading text animations - separate word reveals with blur
    const headingTl = gsap.timeline({ delay: 0.4 });
    
    // Function to set initial states for each word
    const setupWordAnimation = (containerRef, maskRef, textRef) => {
      if (containerRef.current && maskRef.current && textRef.current) {
        gsap.set(maskRef.current, {
          width: '100%',
          right: isRTL ? 'auto' : 0,
          left: isRTL ? 0 : 'auto',
        });
        
        gsap.set(textRef.current, {
          opacity: 0,
          filter: 'blur(12px)'
        });
      }
    };
    
    // Setup initial states
    setupWordAnimation(word1ContainerRef, word1MaskRef, word1TextRef);
    setupWordAnimation(word2ContainerRef, word2MaskRef, word2TextRef);
    setupWordAnimation(word3ContainerRef, word3MaskRef, word3TextRef);
    
    // Function to animate each word
    const animateWord = (maskRef, textRef, delay = 0) => {
      if (!maskRef.current || !textRef.current) return;
      
      // Sequence for each word
      headingTl.to(maskRef.current, {
        width: '0%',
        duration: 1.1,
        ease: "circ.out",
        transformOrigin: isRTL ? 'right center' : 'left center'
      }, delay);
      
      // Blur and fade effect
      headingTl.to(textRef.current, {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: "power2.out"
      }, delay + 0.2); // Slight delay for text animation
    };
    
    // Animate each word with staggered timing
    animateWord(word1MaskRef, word1TextRef, 0);
    animateWord(word2MaskRef, word2TextRef, 0.3); // Start after first word begins
    animateWord(word3MaskRef, word3TextRef, 0.6); // Start after second word begins
    
    // Subtitle paragraph animation - slide from bottom with fade
    if (subtitleRef.current) {
      // Set initial state - below position with 0 opacity
      gsap.set(subtitleRef.current, {
        y: 30, // Start 30px below target position
        opacity: 0
      });
      
      // Animate to final position with fade-in
      gsap.to(subtitleRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        delay: 1.5, // Start after heading animation completes
        ease: "circ.inOut" // Ease in-out circ motion
      });
    }
    
    // Button animation - slide from bottom with fade (similar to paragraph)
    if (buttonRef.current) {
      // Set initial state - below position with 0 opacity
      gsap.set(buttonRef.current, {
        y: 10, // Start 10px below target position
        opacity: 0
      });
      
      // Animate to final position with fade-in
      gsap.to(buttonRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        delay: 1.8, // Slightly longer delay than paragraph
        ease: "circ.inOut" // Same ease-in-out circ motion
      });
    }
    
  }, [isRTL, locale, t]);

  // Updated services data with 9 services
  const services = [
    {
      id: '01',
      title: "Digital Printing",
      description: "Flexible printing for short runs — ideal for business cards, invoices, brochures, catalogs, menus, and quick promotional materials. Available in full-color or black & white, with professional-grade quality.",
      image: "/images/services/service-01.jpg",
    },
    {
      id: '02',
      title: "Offset Printing",
      description: "Cost-effective for high-volume jobs without compromising on quality. Perfect for magazines, books, annual reports, bulk catalogs, and folded prints with consistent color accuracy.",
      image: "/images/services/service-02.jpg",
    },
    {
      id: '03',
      title: "Advertising & Commercial Printing",
      description: "Design and printing of indoor and outdoor banners, roll-ups, display stands, posters, and all types of stickers (transparent, matte, waterproof). Advanced printing on acrylic, glass, UV surfaces, and laser cutting available.",
      image: "/images/services/service-03-ads.jpg",
    },
    {
      id: '04',
      title: "Promotional & Gift Printing",
      description: "High-quality printing on mugs, t-shirts, notebooks, bags, keychains, pens, and more. Multiple techniques available.",
      image: "/images/services/service-04.png",
    },
    {
      id: '05',
      title: "Packaging & Finishing",
      description: "Innovative packaging that adds value. Design and production of custom printed boxes, paper and plastic bags, and product labels in various shapes and sizes to fit every packaging need.",
      image: "/images/services/service-05.png",
    },
    {
      id: '06',
      title: "Creative Design",
      description: "Visual identity that speaks your brand. Logo design and high-quality creative layouts for brochures, catalogs, ads, posters, and menus. Print-ready files are optimized for all types of printing machines.",
      image: "/images/services/service-06-design.jpg",
    },
    {
      id: '07',
      title: "Office Stationery",
      description: "Carbon and non-carbon invoice books, accounting forms, delivery and receipt books, archive folders, employee badges, business cards, and custom stamps.",
      image: "/images/services/service-07-stationery.jpg",
    },
    {
      id: '08',
      title: "Exhibition & Event Branding",
      description: "Complete solutions for booths & displays. Custom design and execution of exhibition booths, roll-ups, promotional tables, branded backgrounds, and full on-site setup with lighting and visual effects.",
      image: "/images/services/service-08.jpg", 
    },
    {
      id: '09',
      title: "Custom Solutions",
      description: "Free consultations to help you choose the best printing options for your budget. We handle special orders for schools, businesses, and government entities, with the flexibility to combine services into one integrated project.",
      image: "/images/larg-format-printing.png", 
    }
  ];

  // --- GSAP Card Scrollytelling useEffect ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!scrollSectionRef.current || !stickyContainerRef.current || cardRefs.some(ref => !ref.current)) {
      console.error("GSAP Animation Error: Missing required refs.");
      return;
    }

    const scrollSection = scrollSectionRef.current;
    const stickyContainer = stickyContainerRef.current;

    // Set initial states for cards
    gsap.set(card1Ref.current, { y: "0%", opacity: 1, scale: 1, zIndex: 10 });
    gsap.set(cardRefs.slice(1).map(ref => ref.current), { y: "100%", opacity: 1, scale: 1, zIndex: 5 });

    const totalCards = cardRefs.length;
    // Adjust scroll segment based on the *intended* transition duration, not total height
    const transitionSegment = 1 / totalCards; // Allocate roughly equal scroll % for each transition

    cardRefs.forEach((currentCardRef, index) => {
      if (index < totalCards - 1) { // Only create transitions for cards 1 to 5
        const nextCardRef = cardRefs[index + 1];
        // Define start/end based on segments of the *total cards*, not the arbitrary height
        const startScroll = index * transitionSegment; 
        const endScroll = startScroll + transitionSegment * 0.85; // Make transition finish slightly before next segment starts

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollSection,
            start: `${startScroll * 100}% top`,
            end: `${endScroll * 100}% top`,
            scrub: 1.2,
            // markers: true, // DEBUG
          }
        });

        tl.set(nextCardRef.current, { zIndex: 20 + index * 10 }, 0);
        tl.to(nextCardRef.current, { y: "0%", duration: 0.6, ease: "power3.inOut" }, 0.1);
        tl.to(currentCardRef.current, { scale: 0.85, y: "-10%", duration: 0.6, ease: "power2.inOut", zIndex: 19 + index * 10 }, 0.15);
      }
    });

    // Pin the sticky container for the entire scroll section duration
    const pin = ScrollTrigger.create({
      trigger: scrollSection,
      start: "top top",
      end: "bottom bottom", 
      pin: stickyContainer,
      pinSpacing: true,
      // markers: true // DEBUG
    });

    // DELETE the lastCardSticky and outroAnimation timelines
    // const lastCardSticky = gsap.timeline({...});
    // lastCardSticky.to(...);
    // const outroAnimation = gsap.timeline({...});
    // outroAnimation.set(...);
    // outroAnimation.to(...);

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.killTweensOf(cardRefs.map(ref => ref.current));
    };
  }, []); // Empty dependency array

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="h-screen">
        <div className="flex flex-col md:flex-row h-full">
          {/* Text Content - Apply max-width and navbar padding here */}
          <div className="w-full order-2 md:order-1 md:w-1/2 flex flex-col justify-center py-8 sm:py-12 md:py-20 lg:py-28 px-6">
            {/* Badge */}
            <div ref={badgeContainerRef} className="relative inline-block self-start mb-4 overflow-hidden">
              <span 
                ref={badgeTextRef}
                className="inline-block text-xs uppercase tracking-wider font-medium border border-gray-400 dark:border-gray-600 rounded-full px-3 py-1 text-gray-600 dark:text-gray-300"
              >
                {t('services.badge', 'Services')}
              </span>
              {/* Mask for badge reveal animation */}
              <div 
                ref={badgeMaskRef}
                className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out"
              ></div>
            </div>
            
            {/* Heading - Adjusted Font Size */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-start mb-4 text-gray-900 dark:text-white leading-tight md:leading-tight">
              {/* Word 1 */}
              <span ref={word1ContainerRef} className="relative inline-block overflow-hidden" style={{ paddingBottom: '0.1em' }}>
                <span ref={word1TextRef} className="inline-block will-change-transform">{t('services.heroTitle.word1', 'Premium')}</span>
                <span ref={word1MaskRef} className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out" style={{ bottom: '-0.1em' }}></span>
              </span> <br className="hidden md:block"/> {/* Keep line break on desktop */}
              {/* Word 2 */}
              <span ref={word2ContainerRef} className="relative inline-block overflow-hidden" style={{ paddingBottom: '0.1em' }}>
                 <span ref={word2TextRef} className="inline-block will-change-transform">{t('services.heroTitle.word2', 'Printing')}</span>
                 <span ref={word2MaskRef} className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out" style={{ bottom: '-0.1em' }}></span>
              </span> <br className="hidden md:block"/>{/* Keep line break on desktop */}
              {/* Word 3 */}
              <span ref={word3ContainerRef} className="relative inline-block overflow-hidden" style={{ paddingBottom: '0.1em' }}>
                 <span ref={word3TextRef} className="inline-block will-change-transform">{t('services.heroTitle.word3', 'Services')}</span>
                 <span ref={word3MaskRef} className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out" style={{ bottom: '-0.1em' }}></span>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p ref={subtitleRef} className="text-xl text-start mb-8 text-gray-600 dark:text-gray-300 max-w-xl will-change-transform">
              {t('services.heroSubtitle', 'Crafting exceptional print materials with precision, quality, and innovation')}
            </p>
            
            {/* Button */}
            <div ref={buttonRef} className="self-start pt-4">
              <button 
                onClick={scrollToFirstService}
                className="inline-block bg-button-primary text-white font-medium py-3 px-8 rounded-lg shadow-md hover:bg-opacity-90 transition-colors duration-300"
              >
                {t('services.exploreButton', 'Explore Our Services')}
              </button>
            </div>
          </div>
          
          {/* Image Content - Ensure it fills its space */}
          <div className="relative w-full order-1 md:order-2 md:w-1/2 overflow-hidden min-h-[300px] md:min-h-0">
            <div ref={heroImageMaskRef} className="absolute inset-0 bg-gray-50 dark:bg-gray-900 z-20"></div>
            <Image
              src="/images/services/service-main-first.jpg"
              alt={t('services.heroImageAlt', 'Showcase of premium printing services')}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover z-10"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* === Re-inserted Services Introduction Section === */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900 px-6"> {/* Added px-6 here */}
        <div className="mx-auto"> {/* Removed container class */} 
          <h2 className="text-3xl md:text-7xl font-bold mb-8 md:mb-12 text-gray-900 dark:text-white leading-tight text-center md:text-start"> {/* Responsive font & alignment */} 
            <span>{t('services.sectionTitle.line1', 'Our Premium')}</span>
            <br />
            <span>{t('services.sectionTitle.line2', 'Printing Solutions')}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"> {/* Responsive grid & gap */} 
            {/* Left Column (Promise) */}
            <div className={`${isRTL ? 'md:pl-6' : 'md:pr-6'} prose prose-lg md:prose-xl dark:prose-invert max-w-none md:max-w-md lg:max-w-lg`}> {/* Responsive prose & max-width */} 
              <p className="text-lg md:text-xl">
                <span>{t('services.sectionDescription1.part1', 'At Platinum Printing Press, every project begins with a simple promise:')}</span>
                <br />
                <span>{t('services.sectionDescription1.part2', ' we treat your brand as meticulously as we treat our own.')}</span>
              </p>
            </div>
            
            {/* Right Column (Details) */}
            <div className={`${isRTL ? 'md:pr-6' : 'md:pl-6'} prose prose-base dark:prose-invert max-w-none`}> {/* Removed md:prose-lg */} 
              <p>
                {t('services.sectionDescription2', 'Yet machinery is only half the story. Our in-house pre-press artists re-touch, proof and colour-match your artwork so what you approve onscreen is exactly what lands in your hands, while our sustainability team sources FSC-certified papers, soy-based inks and recyclable packaging to help you print responsibly without sacrificing vibrancy or durability. Time-critical launch? A dedicated account manager tracks your order in real time, coordinating around-the-clock production shifts and nationwide logistics so tight deadlines stay on schedule. Whether you are rolling out a boutique stationery line, refreshing point-of-sale displays across multiple branches or unveiling a stadium-sized stage backdrop, we scale seamlessly, delivering consistent quality from the very first proof to the final pallet. Put simply, Platinum Printing Press is your single destination for creative ideas, industrial muscle and white-glove service - transforming ink and paper into experiences that endure.')}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* === End Re-inserted Services Introduction Section === */}

      {/* === GSAP Scrollytelling Section === */}
      <section 
        ref={scrollSectionRef} 
        className="relative bg-gray-50 dark:bg-gray-900 pb-[100vh]"
        style={{ height: `${(services.length) * 180}vh` }}
      >
        <div ref={stickyContainerRef} className="sticky top-16 h-screen w-full overflow-hidden">
          {/* Map through services data to render cards */}
          {services.map((service, index) => (
            <div 
              key={service.id}
              ref={cardRefs[index]} 
              className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 overflow-hidden will-change-transform"
            >
              {/* Card Content (Example Structure - adapt as needed) */}
              <div className="flex flex-col md:flex-row h-full w-full">
                 {/* Text side */}
                 <div className={`md:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-center ${index % 2 === 0 ? 'order-1' : 'md:order-2 order-1'}`}> {/* Alternate order */}
                   <div className="text-4xl md:text-6xl font-bold text-gray-200 dark:text-gray-700 mb-4">
                     {service.id}
                   </div>
                   <h3 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                     {t(`services.${service.id}.title`, service.title)}
                   </h3>
                   <div>
                     <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
                       {t(`services.${service.id}.description`, service.description)}
                     </p>
                   </div>
                 </div>
                 {/* Image side */}
                 <div className={`md:w-1/2 relative h-0 pt-[60%] md:h-auto md:pt-0 md:flex-initial ${index % 2 === 0 ? 'order-2' : 'md:order-1 order-2'}`}> {/* Use padding-top hack for 4:3 aspect ratio on mobile */} 
                   <Image 
                     src={service.image}
                     alt={t(`services.${service.id}.title`, service.title)} // Use title for alt text
                     fill
                     sizes="(max-width: 768px) 100vw, 50vw"
                     className="object-cover"
                   />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* === End GSAP Scrollytelling Section === */}

      {/* === Re-added Call to Action Section === */}
      <section className="py-16 md:py-20 bg-button-primary text-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
            {t('services.ctaTitle', 'Ready to Start Your Next Printing Project?')}
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('services.ctaText', 'Contact our team today to discuss your printing needs and get a personalized quote for your project.')}
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-white text-button-primary hover:bg-gray-100 dark:text-button-primary px-8 py-3 rounded-lg shadow-md transition-colors text-lg font-medium"
          >
            {t('services.ctaButton', 'Contact Us')}
          </Link>
        </div>
      </section>
      {/* === End Call to Action Section === */}
      
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