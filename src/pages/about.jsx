import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import TextImageSection from '../components/sections/TextImageSection';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

// Register plugins outside of component
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const isRTL = locale === 'ar';

  // Refs for About Us badge animation
  const badgeContainerRef = useRef(null);
  const badgeMaskRef = useRef(null);
  const badgeTextRef = useRef(null);
  const subtitleParagraphRef = useRef(null);

  // Refs for Headline lines animation
  const line1ContainerRef = useRef(null);
  const line1MaskRef = useRef(null);
  const line1TextRef = useRef(null);
  const line2ContainerRef = useRef(null);
  const line2MaskRef = useRef(null);
  const line2TextRef = useRef(null);

  // Refs for Hero Image animation
  const heroImageContainerRef = useRef(null);
  const heroImageMaskRef = useRef(null);

  // Who We Are content
  const whoWeAreTitle = "Who We Are";
  const whoWeAreParagraphs = [
    "Since 2015, Platinum Printing Press has been driven by a clear message:",
    "To deliver professional and advanced printing services that combine production quality with execution precision.",
    "We believe that printing is an essential part of any project's identity, and our goal is to reflect your message and vision in the best possible way."
  ];

  // Arabic translations
  const whoWeAreTranslations = {
    title: "من نحن",
    paragraphs: [
      "منذ عام 2015، تعمل بلاتينيوم للطباعة بدافع من رسالة واضحة:",
      "تقديم خدمات طباعة احترافية ومتقدمة تجمع بين جودة الإنتاج ودقة التنفيذ.",
      "نؤمن بأن الطباعة جزء أساسي من هوية أي مشروع، وهدفنا هو عكس رسالتك ورؤيتك بأفضل طريقة ممكنة."
    ]
  };

  // Our Mission content
  const ourMissionTitle = "Our Mission";
  const ourMissionParagraphs = [
    "To offer advanced printing solutions that meet our clients' needs and help them achieve tangible success through outstanding quality and excellent service."
  ];

  // Arabic translations for Our Mission
  const ourMissionTranslations = {
    title: "مهمتنا",
    paragraphs: [
      "تقديم حلول طباعة متقدمة تلبي احتياجات عملائنا وتساعدهم على تحقيق نجاح ملموس من خلال الجودة المتميزة والخدمة الممتازة."
    ]
  };

  // Our Vision content
  const ourVisionTitle = "Our Vision";
  const ourVisionParagraphs = [
    "To be the trusted, go-to partner in the printing world for all those seeking creativity, precision, and exceptional quality."
  ];

  // Arabic translations for Our Vision
  const ourVisionTranslations = {
    title: "رؤيتنا",
    paragraphs: [
      "أن نكون الشريك الموثوق به والمفضل في عالم الطباعة لكل من يسعى إلى الإبداع والدقة والجودة الاستثنائية."
    ]
  };

  // Badge animation effect
  useEffect(() => {
    const masterTl = gsap.timeline(); // Create a master timeline

    // --- Badge Animation --- (Added to master timeline)
    if (badgeMaskRef.current && badgeTextRef.current) {
      const badgeTl = gsap.timeline();
      gsap.set(badgeMaskRef.current, { width: '100%', right: isRTL ? 'auto' : 0, left: isRTL ? 0 : 'auto' });
      gsap.set(badgeTextRef.current, { opacity: 0 });
      badgeTl.to(badgeMaskRef.current, { width: '0%', duration: 1.3, ease: "circ.out", transformOrigin: isRTL ? 'right center' : 'left center' });
      badgeTl.to(badgeTextRef.current, { opacity: 1, duration: 1, ease: "power1.inOut" }, "<");
      masterTl.add(badgeTl, 0.1); // Add badge timeline to master with a slight delay
    }

    // --- Headline Line Animation --- (Added to master timeline)
    const headlineTl = gsap.timeline();

    // Function to set initial states for each line (similar to setupWordAnimation)
    const setupLineAnimation = (containerRef, maskRef, textRef) => {
      if (containerRef.current && maskRef.current && textRef.current) {
        gsap.set(maskRef.current, { width: '100%', right: isRTL ? 'auto' : 0, left: isRTL ? 0 : 'auto' });
        gsap.set(textRef.current, { opacity: 0, filter: 'blur(8px)' }); // Start slightly blurred
      }
    };

    // Function to animate each line (similar to animateWord)
    const animateLine = (maskRef, textRef, delay = 0) => {
      if (!maskRef.current || !textRef.current) return;
      headlineTl.to(maskRef.current, { width: '0%', duration: 1.1, ease: "circ.out", transformOrigin: isRTL ? 'right center' : 'left center' }, delay);
      headlineTl.to(textRef.current, { opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: "power2.out" }, delay + 0.2);
    };

    // Setup and animate lines
    setupLineAnimation(line1ContainerRef, line1MaskRef, line1TextRef);
    setupLineAnimation(line2ContainerRef, line2MaskRef, line2TextRef);
    animateLine(line1MaskRef, line1TextRef, 0); // First line starts immediately in this timeline
    animateLine(line2MaskRef, line2TextRef, 0.3); // Second line starts shortly after

    masterTl.add(headlineTl, 0.3); // Add headline timeline after badge starts animating


    // --- Subtitle paragraph animation --- (Added to master timeline)
    if (subtitleParagraphRef.current) {
      const subtitleTl = gsap.timeline();
      gsap.set(subtitleParagraphRef.current, { y: 30, opacity: 0 });
      subtitleTl.to(subtitleParagraphRef.current, { y: 0, opacity: 1, duration: 1.2, ease: "circ.inOut" });
      masterTl.add(subtitleTl, 0.8); // Start after headline animation has progressed
    }

    // --- Hero Image Mask Reveal Animation --- (Added to master timeline)
    if (heroImageMaskRef.current) {
      const imageTl = gsap.timeline();
      // Set initial state: mask covers image from bottom
      gsap.set(heroImageMaskRef.current, { height: '100%', bottom: 0 });
      // Animate mask height to 0 to reveal image
      imageTl.to(heroImageMaskRef.current, {
        height: '0%',
        duration: 1.4, // Slightly longer duration for image reveal
        ease: "circ.inOut"
      });
      masterTl.add(imageTl, 1.1); // Changed delay to start after subtitle finishes
    }

  }, [isRTL, locale]); // Add locale to dependencies to re-run if text content changes

  return (
    <div className="py-12 w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full px-0 sm:px-3">
        <div className="ps-6 pe-6">
          {/* About Us badge with animation */}
          <div ref={badgeContainerRef} className="relative inline-block mb-0 overflow-hidden">
            <span 
              ref={badgeTextRef}
              className="inline-block text-xs uppercase tracking-wider font-medium border border-gray-400 dark:border-gray-600 rounded-full px-3 py-1 text-gray-600 dark:text-gray-300"
            >
              {t('nav.about')}
            </span>
            {/* Mask for badge reveal animation */}
            <div 
              ref={badgeMaskRef}
              className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out" // Trying gray-50/gray-900
            ></div>
          </div>
          
          {/* Responsive Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-start mb-0 leading-[1.1]">
            {/* Line 1 Container */}
            <div ref={line1ContainerRef} className="relative inline-block overflow-hidden" style={{ paddingBottom: '0.1em' }}>
              {/* Line 1 Text */}
              <span ref={line1TextRef} className="inline-block will-change-transform">
                {locale === 'ar' ? 'من التصميم إلى التسليم،' : 'From design to delivery,'}
              </span>
              {/* Line 1 Mask */}
              <div ref={line1MaskRef} className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out" style={{ bottom: '-0.1em' }}></div> {/* Trying gray-50/gray-900 */}
            </div>
            <br />
            {/* Line 2 Container */}
            <div ref={line2ContainerRef} className="relative inline-block overflow-hidden" style={{ paddingBottom: '0.1em' }}>
              {/* Line 2 Text */}
              <span ref={line2TextRef} className="inline-block will-change-transform">
                {locale === 'ar' ? 'نقدم خدمات طباعة شاملة' : 'we provide comprehensive printing services'}
              </span>
              {/* Line 2 Mask */}
              <div ref={line2MaskRef} className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-500 ease-in-out" style={{ bottom: '-0.1em' }}></div> {/* Trying gray-50/gray-900 */}
            </div>
          </h2>

          {/* Adjusted subtitle margin slightly */}
          <p ref={subtitleParagraphRef} className="text-xl text-start mt-0 mb-6 md:mb-8 text-gray-600 dark:text-gray-300 max-w-3xl will-change-transform leading-snug">
            {locale === 'ar' 
              ? 'حيث يلتقي الإبداع بالدقة، لضمان الجودة والاتساق في كل مرحلة من رحلة الطباعة الخاصة بك'
              : 'Where creativity meets precision, ensuring quality and consistency at every stage of your print journey'}
          </p>
        </div>
        
        {/* Container for Image with Animation - Responsive Height */}
        <div ref={heroImageContainerRef} className="w-full mt-4 overflow-hidden relative">
          <div className="ps-6 pe-6">
            {/* Added responsive height */}
            <div className="relative w-full h-[400px] md:h-[600px]">
              <Image
                src="/images/about-us-hero.jpg"
                alt="Printing press in action showing vibrant colors"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          {/* Mask for Image Reveal Animation */}
          <div 
            ref={heroImageMaskRef} 
            className="absolute inset-x-0 top-0 w-full bg-gray-50 dark:bg-gray-900 z-10"
            style={{ height: '100%' }}
          ></div>
        </div>

        {/* Responsive margin */}
        <TextImageSection 
          imageUrl="/images/about-us/who-are-we-01.jpg"
          imageAlt="Vintage printing press with framed prints on wall"
          title={whoWeAreTitle}
          paragraphs={whoWeAreParagraphs}
          translations={whoWeAreTranslations}
          imagePosition="right"
          imageWidth={750}
          imageHeight={1000}
          className="mt-12 md:mt-16" // Adjusted margin
        />

        {/* Responsive margin */}
        <TextImageSection 
          imageUrl="/images/about-us/who-are-we-02.jpg"
          imageAlt="Colorful CMYK printing color palette chart"
          title={ourVisionTitle}
          paragraphs={ourVisionParagraphs}
          translations={ourVisionTranslations}
          imagePosition="left"
          imageWidth={750}
          imageHeight={1000}
          className="mt-12 md:mt-24" // Adjusted margin
        />

        {/* Responsive margin */}
        <TextImageSection 
          imageUrl="/images/about-us/who-are-we-03.jpg"
          imageAlt="Hands checking quality of printed materials"
          title={ourMissionTitle}
          paragraphs={ourMissionParagraphs}
          translations={ourMissionTranslations}
          imagePosition="right"
          imageWidth={750} 
          imageHeight={1000}
          className="mt-12 md:mt-24" // Adjusted margin
        />
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