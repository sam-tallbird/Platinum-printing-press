import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import WorkImageCard from '../components/work/WorkImageCard'; // Adjust path if needed

// Define the image paths (your 12 images)
const workImagePaths = [
  '/images/product-temp-img/62817cd3f99f0f71abde44aeace34483.jpg',
  '/images/product-temp-img/0c37cf1abf26e4182cf6f315ce7138e8.jpg',
  '/images/product-temp-img/29b18fdbff64eb9e8973504619d4489d.jpg',
  '/images/product-temp-img/966a37645a00d42f16d546a6351c11fe.jpg',
  '/images/product-temp-img/172cbd61e96637f817342027e69af54b.jpg',
  '/images/product-temp-img/1a7cb8bc2f72af4ea081b6002cf40ba3.jpg',
  '/images/product-temp-img/3b99a8672d8d2ede3f622e215aa3bc62.jpg',
  '/images/product-temp-img/7293eb5fb9ea45afa4d2dc12f1ed44f1.jpg',
  '/images/product-temp-img/77730cb936def0c597acdd95b118631d.jpg',
  '/images/product-temp-img/4e5706ff051c31dfa3f1bb85552e83ec.jpg',
  '/images/product-temp-img/e24ba50c25bde6d33a89187d106d4463.jpg',
  '/images/product-temp-img/2ddf381c42ad7a041bb42859630e2e3e.jpg'
];

export default function OurWork() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const isRTL = locale === 'ar';

  // Define layout pattern
  const layoutPattern = ['F', 'W', 'Q', 'A1', 'A2'];

  // Generate dummy data
  const dummyWorkItems = Array.from({ length: 18 }).map((_, index) => ({
    id: index + 1,
    imageUrl: workImagePaths[index % workImagePaths.length], // Cycle through images
    altText: `${t('ourWork.imageAltPrefix', 'Portfolio image')} ${index + 1}`,
  }));

  let wqPairIndex = 0; // Counter for W/Q pairs

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Page Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-12 text-gray-900 dark:text-white text-center">
          {t('ourWork.pageTitle', 'Our Work')}
        </h1>

        {/* Tailwind Grid with Alternating Nested Logic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dummyWorkItems.map((item, index, arr) => {
            // Dynamically determine layout type based on index
            const currentLayoutType = layoutPattern[index % layoutPattern.length];

            // Skip rendering 'Q'
            if (currentLayoutType === 'Q') return null;

            // Handle the asymmetric pair (W and Q)
            if (currentLayoutType === 'W') {
              const nextItem = arr[index + 1];
              const nextLayoutType = layoutPattern[(index + 1) % layoutPattern.length];

              if (nextItem && nextLayoutType === 'Q') {
                const isEvenPair = wqPairIndex % 2 === 0;
                wqPairIndex++; // Increment after finding a pair

                return (
                  <div key={item.id} className="md:col-span-2 grid grid-cols-3 gap-4">
                    {isEvenPair ? (
                      <>
                        {/* W Card Wrapper - Left */}
                        <div className="col-span-2">
                          <WorkImageCard imageUrl={item.imageUrl} altText={item.altText} isRTL={isRTL} />
                        </div>
                        {/* Q Card Wrapper - Right */}
                        <div className="col-span-1">
                          <WorkImageCard imageUrl={nextItem.imageUrl} altText={nextItem.altText} isRTL={isRTL} />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Q Card Wrapper - Left */}
                        <div className="col-span-1">
                          <WorkImageCard imageUrl={nextItem.imageUrl} altText={nextItem.altText} isRTL={isRTL} />
                        </div>
                        {/* W Card Wrapper - Right */}
                        <div className="col-span-2">
                          <WorkImageCard imageUrl={item.imageUrl} altText={item.altText} isRTL={isRTL} />
                        </div>
                      </>
                    )}
                  </div>
                );
              } 
              // Fallback for 'W' without a following 'Q'
            }

            // Handle Full width ('F') or other single items ('A1', 'A2', or 'W' fallback)
            return (
              <div key={item.id} className={`${currentLayoutType === 'F' ? 'md:col-span-2' : ''}`}>
                <WorkImageCard
                  imageUrl={item.imageUrl}
                  altText={item.altText}
                  isRTL={isRTL}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
} 