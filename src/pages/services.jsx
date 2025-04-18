import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';

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
  
  // Store all card refs in an array for easier access
  const cardRefs = [card1Ref, card2Ref, card3Ref, card4Ref, card5Ref, card6Ref];

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

  // Dummy services data
  const services = [
    {
      id: '01',
      title: "Digital Printing",
      description: "Digital printing delivers flexible, high‑quality output, empowering short‑run production with vibrant color accuracy, seamless variable‑data personalization, and same‑day turnaround, enabling businesses to respond quickly, test campaigns, and elevate brand effortlessly.",
      image: "/images/digital-printing.png",
    },
    {
      id: '02',
      title: "Offset Printing",
      description: "Offset printing delivers high‑volume runs with consistent color and favorable unit costs, leveraging modern plate technology and rigorous quality control to supply materials ideal for catalogs, magazines, books, and brochures.",
      image: "/images/offset-printing.png",
    },
    {
      id: '03',
      title: "Large‑Format Printing",
      description: "Large‑format printing delivers posters, banners, and displays in impressive dimensions, using UV‑resistant inks and durable substrates to ensure vivid imagery, weatherproofing, and lasting presence at events, stores, and trade shows.",
      image: "/images/larg-format-printing.png",
    },
    {
      id: '04',
      title: "Finishing & Packaging",
      description: "Finishing and packaging services refine printed materials through precision cutting, binding, laminating, coatings, and die‑folding, integrating custom boxes or sleeves to protect, enhance, and present products with polished, retail‑ready appeal.",
      image: "/images/finishing-packinging.png",
    },
    {
      id: '05',
      title: "Graphic Design",
      description: "Graphic design specialists craft concepts embodying brand identity, blending typography, color theory, and aesthetics to deliver cohesive logos, marketing collateral, and pieces that engage audiences, strengthen recognition, and enhance clarity.",
      image: "/images/graphic-desgin.jpg",
    },
    {
      id: '06',
      title: "Custom Packaging Solutions",
      description: "Custom packaging solutions merge design and engineering to create boxes, inserts, or sleeves that protect products, enhance impact, amplify branding, and deliver unboxing experiences that delight customers and foster purchases.",
      image: "/images/custom-packaging-solutions.png",
    },
  ];

  // Set up GSAP animations after component mounts
  useEffect(() => {
    // Skip on server render
    if (typeof window === 'undefined') return;
    
    // Ensure section and container exist
    if (!scrollSectionRef.current || !stickyContainerRef.current) {
      console.error("Missing required DOM elements");
      return;
    }
    
    // Make sure all card refs are valid
    if (!card1Ref.current || !card2Ref.current || !card3Ref.current || !card4Ref.current || !card5Ref.current || !card6Ref.current) {
      console.error("One or more card refs are missing");
      return;
    }
    
    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach(st => st.kill());
    
    // For debugging purposes
    console.log("Setting up GSAP animations");
    
    // Store main elements
    const scrollSection = scrollSectionRef.current;
    const stickyContainer = stickyContainerRef.current;
    
    // Add a pre-loading state for the first card for smoother entry
    gsap.set(card1Ref.current, { 
      y: "5%", 
      opacity: 0.9, 
      scale: 0.98, 
      zIndex: 10 
    });
    
    // Setup hidden state for other cards
    gsap.set([card2Ref.current, card3Ref.current, card4Ref.current, card5Ref.current, card6Ref.current], { 
      y: "100%", // Start below viewport
      opacity: 1, // Keep full opacity
      scale: 1,
      zIndex: 5, // All cards start with same z-index
      force3D: true
    });
    
    // Add a smooth entry animation for the first card
    const introAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSection,
        start: "top bottom-=10%", // Start as section approaches viewport
        end: "top top+=5%", // End slightly after the section enters
        scrub: 1.5, // Increased for smoother scrubbing
        markers: false
      }
    });

    // Animate the first card into full view with a subtle scale and fade
    introAnimation.to(card1Ref.current, {
      y: "0%",
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: "power2.out"
    });
    
    // Main ScrollTrigger to pin the container - using a much taller pin space
    const mainPin = ScrollTrigger.create({
      trigger: scrollSection,
      start: "top top",
      end: "bottom bottom", 
      pin: stickyContainer,
      anticipatePin: 1.5, // Increased for smoother anticipation
      pinSpacing: true,
      markers: false,
      endTrigger: scrollSection // Ensure the pin ends with the section
    });
    
    // Each section gets a larger scroll space - using percentages of total scroll space
    // Card 1 -> Card 2 transition (first 16% of scroll)
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSection,
        start: "top top",
        end: "16% top", // Adjusted for 6 cards
        scrub: 1.2, // Increased for smoother scrubbing
        markers: false
      }
    });
    
    // IMPORTANT: Set card 2 to higher z-index BEFORE animation starts
    tl1.set(card2Ref.current, { zIndex: 20 }, 0);
    
    // Then move Card 2 up from below
    tl1.to(card2Ref.current, {
      y: "0%", 
      duration: 0.6,
      ease: "power3.inOut" // Changed to power3 for smoother motion
    }, 0.1); // Slight delay to ensure z-index is applied first
    
    // And scale Card 1 down
    tl1.to(card1Ref.current, {
      scale: 0.75,
      y: "-5%", 
      duration: 0.6,
      ease: "power2.inOut", // Smoother easing
      zIndex: 9 // Lower z-index than the active card but higher than inactive cards
    }, 0.2); // Slightly after Card 2 starts moving
    
    // Card 2 -> Card 3 transition (20-36% of scroll)
    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSection,
        start: "20% top", 
        end: "36% top",
        scrub: 1.2,
        markers: false
      }
    });
    
    // First bring Card 3 in front of Card 2 before animation starts
    tl2.set(card3Ref.current, { zIndex: 30 }, 0);
    
    // Then move Card 3 up from below
    tl2.to(card3Ref.current, {
      y: "0%", 
      duration: 0.6,
      ease: "power3.inOut" // Changed to power3 for smoother motion
    }, 0.1);
    
    // And scale Card 2 down
    tl2.to(card2Ref.current, {
      scale: 0.75,
      y: "-5%", 
      duration: 0.6,
      ease: "power2.inOut", // Smoother easing
      zIndex: 19 // Lower than active card but higher than earlier cards
    }, 0.2);
    
    // Card 3 -> Card 4 transition (40-56% of scroll)
    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSection,
        start: "40% top",
        end: "56% top",
        scrub: 1.2,
        markers: false
      }
    });
    
    // First bring Card 4 in front of Card 3 before animation starts
    tl3.set(card4Ref.current, { zIndex: 40 }, 0);
    
    // Then move Card 4 up from below
    tl3.to(card4Ref.current, {
      y: "0%", 
      duration: 0.6,
      ease: "power3.inOut" // Changed to power3 for smoother motion
    }, 0.1);
    
    // And scale Card 3 down
    tl3.to(card3Ref.current, {
      scale: 0.75,
      y: "-5%", 
      duration: 0.6,
      ease: "power2.inOut", // Smoother easing
      zIndex: 29 // Lower than active card but higher than earlier cards
    }, 0.2);
    
    // Card 4 -> Card 5 transition (60-76% of scroll)
    const tl4 = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSection,
        start: "60% top",
        end: "76% top",
        scrub: 1.2,
        markers: false
      }
    });
    
    // First bring Card 5 in front of Card 4 before animation starts
    tl4.set(card5Ref.current, { zIndex: 50 }, 0);
    
    // Then move Card 5 up from below
    tl4.to(card5Ref.current, {
      y: "0%", 
      duration: 0.6,
      ease: "power3.inOut" // Changed to power3 for smoother motion
    }, 0.1);
    
    // And scale Card 4 down
    tl4.to(card4Ref.current, {
      scale: 0.75,
      y: "-5%", 
      duration: 0.6,
      ease: "power2.inOut", // Smoother easing
      zIndex: 39 // Lower than active card but higher than earlier cards
    }, 0.2);
    
    // Card 5 -> Card 6 transition (80-90% of scroll)
    const tl5 = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSection,
        start: "80% top",
        end: "90% top", // Changed from 96% to 90% to leave more space at the end
        scrub: 1.2,
        markers: false
      }
    });
    
    // First bring Card 6 in front of Card 5 before animation starts
    tl5.set(card6Ref.current, { zIndex: 60 }, 0);
    
    // Then move Card 6 up from below
    tl5.to(card6Ref.current, {
      y: "0%", 
      duration: 0.6,
      ease: "power3.inOut" // Changed to power3 for smoother motion
    }, 0.1);
    
    // And scale Card 5 down
    tl5.to(card5Ref.current, {
      scale: 0.75,
      y: "-5%", 
      duration: 0.6,
      ease: "power2.inOut", // Smoother easing
      zIndex: 49 // Lower than active card but higher than earlier cards
    }, 0.2);

    // Add a special timeline just to keep the last card pinned longer
    const lastCardSticky = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSection,
        start: "90% top", // Start where the last transition ends
        end: "98% top", // Finish just before the end of the section
        scrub: true,
        markers: false
      }
    });
    
    // Ensure the last card stays visible until near the very end
    lastCardSticky.to(card6Ref.current, {
      scale: 1, // Maintain its scale (no change)
      y: "0%",  // Maintain its position (no change)
      duration: 0.8
    });
    
    // Create a smooth exit animation for the last card
    const outroAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: scrollSection,
        start: "98% top", // Start near the end of the section
        end: "bottom top+=10%", // Continue slightly beyond the section
        scrub: 1.2, // Increased for smoother transition
        markers: false
      }
    });
    
    // Fade and shift the last card slightly as user scrolls away
    outroAnimation.to(card6Ref.current, {
      y: "-2%", 
      opacity: 0.9,
      scale: 0.98,
      duration: 0.7,
      ease: "power2.inOut" // Smoother easing for exit
    });
    
    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Full-screen hero section */}
      <section className="relative h-screen w-full flex items-center bg-stone-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out">
        {/* Content side - switches positions based on RTL */}
        <div className={`w-full md:w-1/2 h-full flex flex-col justify-center px-8 lg:px-16 xl:px-24 z-10 ${isRTL ? 'md:ml-auto' : ''}`}>
          <div className="max-w-xl">
            {/* Services badge with animation */}
            <div ref={badgeContainerRef} className="relative inline-block mb-4 overflow-hidden">
              <span 
                ref={badgeTextRef}
                className="inline-block text-xs uppercase tracking-wider font-medium border border-gray-400 dark:border-gray-600 rounded-full px-3 py-1 text-gray-600 dark:text-gray-300"
              >
                {t('services.badge', 'Services')}
              </span>
              {/* Mask for badge reveal animation */}
              <div 
                ref={badgeMaskRef}
                className="absolute inset-0 bg-stone-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out"
              ></div>
            </div>
            
            {/* Heading with word-by-word reveal animation */}
            <div className="mb-8">
              {/* First word - Premium/متميزة */}
              <div 
                ref={word1ContainerRef} 
                className={`relative inline-block overflow-hidden ${isRTL ? 'ml-3' : 'mr-3'} mb-2 leading-tight`} 
                style={{ paddingBottom: '0.1em' }}
              >
                <span 
                  ref={word1TextRef} 
                  className="inline-block text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white transition-colors duration-500 ease-in-out"
                  key={`word1-${locale}`}
                >
                  {t('services.heroTitle.word1', 'Premium')}
                </span>
                <div 
                  ref={word1MaskRef}
                  className="absolute inset-0 bg-stone-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out"
                  style={{ bottom: '-0.15em' }}
                ></div>
              </div>
              {/* Second word - Printing/طباعة */}
              <div 
                ref={word2ContainerRef} 
                className={`relative inline-block overflow-hidden ${isRTL ? 'ml-3' : 'mr-3'}  leading-tight`} 
                style={{ paddingBottom: '0.7em' }}
              >
                <span 
                  ref={word2TextRef} 
                  className="inline-block text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white transition-colors duration-500 ease-in-out"
                  key={`word2-${locale}`}
                >
                  {t('services.heroTitle.word2', 'Printing')}
                </span>
                <div 
                  ref={word2MaskRef}
                  className="absolute inset-0 bg-stone-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out"
                  style={{ bottom: '-0.2em' }}
                ></div>
              </div>
              {/* Third word - Services/خدمات */}
              <div 
                ref={word3ContainerRef} 
                className="relative inline-block overflow-hidden leading-tight" 
                style={{ paddingBottom: '0.8em' }}
              >
                <span 
                  ref={word3TextRef} 
                  className="inline-block text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white transition-colors duration-500 ease-in-out"
                  key={`word3-${locale}`}
                >
                  {t('services.heroTitle.word3', 'Services')}
                </span>
                <div 
                  ref={word3MaskRef}
                  className="absolute inset-0 bg-stone-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out"
                  style={{ bottom: '-0.2em' }}
                ></div>
              </div>
            </div>
            
            <p 
              ref={subtitleRef}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-500 ease-in-out will-change-transform"
            >
              {t('services.heroSubtitle', 'Crafting exceptional print materials with precision, quality, and innovation')}
            </p>
            <button 
              ref={buttonRef}
              onClick={scrollToFirstService}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-md transition-all duration-300 ease-in-out text-lg font-medium transform hover:scale-105 will-change-transform cursor-pointer"
            >
              {t('services.exploreButton', 'Explore Our Services')}
            </button>
          </div>
        </div>
        
        {/* Image side with mask reveal animation */}
        <div className={`hidden md:block absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-1/2 h-full overflow-hidden`}>
          <div className="relative w-full h-full">
            <Image 
              src="/images/digital-printing.png" 
              alt="Printing services" 
              fill
              priority
              className="object-cover object-center"
            />
            
            {/* Mask element that reveals the image */}
            <div 
              ref={heroImageMaskRef}
              className="absolute inset-0 bg-stone-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out z-10"
            ></div>
            
            {/* Dark mode overlay for better contrast with image */}
            <div className="absolute inset-0 bg-black opacity-0 dark:opacity-30 transition-opacity duration-500 ease-in-out"></div>
          </div>
        </div>
      </section>

      {/* Services introduction */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-6 px-0 sm:px-3">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
             {t('services.sectionTitle', 'Our Premium Printing Solutions')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-40 ">
            <div className={`${isRTL ? 'ps-0' : 'pe-4'}`}>
              <p className="text-base leading-relaxed tracking-wide text-gray-600 dark:text-gray-300 max-w-prose">
                {t('services.sectionDescription1', 'At Platinum Printing Press, every project begins with a simple promise: we treat your brand as meticulously as we treat our own. From lightning-quick digital runs for last-minute business cards to precision offset jobs that make annual reports gleam, our press hall is equipped with the latest Heidelberg and Ricoh technology to deliver flawless colour fidelity on every sheet. Need to grab attention at a trade fair? Our wide-format division prints towering banners, seamless fabric backdrops and rigid display boards that arrive ready to hang, while our specialty finishing suite adds tactile luxury with soft-touch laminates, spot UV gloss, metallic foils and die-cut silhouettes that turn heads before a single word is read. Variable-data tools effortlessly personalise postcards, loyalty coupons and mail-merge catalogues, letting you speak to each customer as if they were the only one on your list.')}
              </p>
            </div>
            
            <div className={`${isRTL ? 'pe-0' : 'ps'  }`}>
              <p className="text-base leading-relaxed tracking-wide text-gray-600 dark:text-gray-300 max-w-prose">
                {t('services.sectionDescription2', 'Yet machinery is only half the story. Our in-house pre-press artists re-touch, proof and colour-match your artwork so what you approve onscreen is exactly what lands in your hands, while our sustainability team sources FSC-certified papers, soy-based inks and recyclable packaging to help you print responsibly without sacrificing vibrancy or durability. Time-critical launch? A dedicated account manager tracks your order in real time, coordinating around-the-clock production shifts and nationwide logistics so tight deadlines stay on schedule. Whether you are rolling out a boutique stationery line, refreshing point-of-sale displays across multiple branches or unveiling a stadium-sized stage backdrop, we scale seamlessly, delivering consistent quality from the very first proof to the final pallet. Put simply, Platinum Printing Press is your single destination for creative ideas, industrial muscle and white-glove service - transforming ink and paper into experiences that endure.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GSAP scrollytelling section */}
      <div
        ref={scrollSectionRef}
        className="relative bg-white dark:bg-gray-800"
        style={{ height: "1000vh" }}
      >
        {/* Sticky container for cards */}
        <div
          ref={stickyContainerRef}
          className="sticky top-10 w-full h-screen overflow-hidden mt-6"
        >
          {/* Card 1 */}
          <div 
            ref={card1Ref}
            className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row h-full w-full">
              <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center">
                <div className="text-6xl md:text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">
                  {services[0].id}
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  {t(`services.${services[0].id}.title`, services[0].title)}
                </h3>
                <div>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                    {t(`services.${services[0].id}.description`, services[0].description)}
                  </p>
                  <Link href={`/services/${services[0].id.toLowerCase()}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center text-lg md:text-xl">
                    {t('services.learnMore', 'Learn more')}
                    <svg className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 relative h-full">
                <Image 
                  src={services[0].image}
                  alt={services[0].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div 
            ref={card2Ref}
            className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 overflow-hidden will-change-transform"
          >
            <div className="flex flex-col md:flex-row h-full w-full">
              <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center">
                <div className="text-6xl md:text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">
                  {services[1].id}
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  {t(`services.${services[1].id}.title`, services[1].title)}
                </h3>
                <div>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                    {t(`services.${services[1].id}.description`, services[1].description)}
                  </p>
                  <Link href={`/services/${services[1].id.toLowerCase()}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center text-lg md:text-xl">
                    {t('services.learnMore', 'Learn more')}
                    <svg className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 relative h-full">
                <Image 
                  src={services[1].image}
                  alt={services[1].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Card 3 */}
          <div 
            ref={card3Ref}
            className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 overflow-hidden will-change-transform"
          >
            <div className="flex flex-col md:flex-row h-full w-full">
              <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center">
                <div className="text-6xl md:text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">
                  {services[2].id}
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  {t(`services.${services[2].id}.title`, services[2].title)}
                </h3>
                <div>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                    {t(`services.${services[2].id}.description`, services[2].description)}
                  </p>
                  <Link href={`/services/${services[2].id.toLowerCase()}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center text-lg md:text-xl">
                    {t('services.learnMore', 'Learn more')}
                    <svg className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 relative h-full">
                <Image 
                  src={services[2].image}
                  alt={services[2].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Card 4 */}
          <div 
            ref={card4Ref}
            className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 overflow-hidden will-change-transform"
          >
            <div className="flex flex-col md:flex-row h-full w-full">
              <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center">
                <div className="text-6xl md:text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">
                  {services[3].id}
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  {t(`services.${services[3].id}.title`, services[3].title)}
                </h3>
                <div>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                    {t(`services.${services[3].id}.description`, services[3].description)}
                  </p>
                  <Link href={`/services/${services[3].id.toLowerCase()}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center text-lg md:text-xl">
                    {t('services.learnMore', 'Learn more')}
                    <svg className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 relative h-full">
                <Image 
                  src={services[3].image}
                  alt={services[3].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Card 5 */}
          <div 
            ref={card5Ref}
            className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 overflow-hidden will-change-transform"
          >
            <div className="flex flex-col md:flex-row h-full w-full">
              <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center">
                <div className="text-6xl md:text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">
                  {services[4].id}
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  {t(`services.${services[4].id}.title`, services[4].title)}
                </h3>
                <div>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                    {t(`services.${services[4].id}.description`, services[4].description)}
                  </p>
                  <Link href={`/services/${services[4].id.toLowerCase()}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center text-lg md:text-xl">
                    {t('services.learnMore', 'Learn more')}
                    <svg className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 relative h-full">
                <Image 
                  src={services[4].image}
                  alt={services[4].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Card 6 */}
          <div 
            ref={card6Ref}
            className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 overflow-hidden will-change-transform"
          >
            <div className="flex flex-col md:flex-row h-full w-full">
              <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center">
                <div className="text-6xl md:text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4">
                  {services[5].id}
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  {t(`services.${services[5].id}.title`, services[5].title)}
                </h3>
                <div>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                    {t(`services.${services[5].id}.description`, services[5].description)}
                  </p>
                  <Link href={`/services/${services[5].id.toLowerCase()}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center text-lg md:text-xl">
                    {t('services.learnMore', 'Learn more')}
                    <svg className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 relative h-full">
                <Image 
                  src={services[5].image}
                  alt={services[5].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">
            {t('services.ctaTitle', 'Ready to Start Your Next Printing Project?')}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {t('services.ctaText', 'Contact our team today to discuss your printing needs and get a personalized quote for your project.')}
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-md transition-colors text-lg font-medium"
          >
            {t('services.ctaButton', 'Contact Us')}
          </Link>
        </div>
      </section>
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