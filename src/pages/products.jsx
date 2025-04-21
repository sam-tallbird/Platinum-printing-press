import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import ProductCard from '../components/products/ProductCard.jsx';
import Image from 'next/image';
import ProductSearchBar from '../components/products/ProductSearchBar';
import GridDistortion from '../components/effects/GridDistortion';

export default function Products() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const isRTL = locale === 'ar';

  // Dummy product data (12 items)
  const tempImagePaths = [
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
    '/images/product-temp-img/2ddf381c42ad7a041bb42859630e2e3e.jpg' // Updated 12th image
  ];

  const dummyProducts = Array.from({ length: 12 }).map((_, index) => ({
    id: index + 1,
    imageUrl: tempImagePaths[index],
    productName: `${t('products.dummyName', 'Product Name')} ${index + 1}`,
    quoteKey: 'products.requestQuote', // Translation key
    quoteDefaultText: 'Request Quotation', // Default text
    productLink: `/products/product-${index + 1}` // Example link
  }));

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* === Updated Hero Section === */}
      <section className="relative w-full h-[40vh] overflow-hidden bg-gray-700"> {/* Added fallback bg */}
        <GridDistortion 
           imageSrc="/images/xxd1.jpg" // Updated image source
           className="absolute inset-0 opacity-90 dark:opacity-70" // Fill container, retain opacity
           // Adjust props as needed:
           // grid={15} // Default grid size
           mouse={0.2} // Increased mouse influence radius (default: 0.1)
           // strength={0.15} // Default strength
           // relaxation={0.9} // Default relaxation
        />
        {/* Text Overlay - Add pointer-events-none to allow hover on GridDistortion below */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl">
            {t('products.heroTitle', 'Premium Print Products, Tailored for Your Brand')}
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl text-gray-100 max-w-3xl">
            {t('products.heroSubtitle', 'Explore a complete range—from everyday business stationery to custom merchandise—each piece produced with precision, vibrant colour, and uncompromising quality.')}
          </h2>
        </div>
      </section>
      {/* === End Hero Section === */}
      
      {/* Existing Content Container - Removed old H1 */}
      <div className="max-w-[110rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* === Add Search Bar Here === */}
        <ProductSearchBar />

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4">
          {dummyProducts.map((product) => (
            <ProductCard
              key={product.id}
              imageUrl={product.imageUrl}
              productName={product.productName}
              quoteKey={product.quoteKey}
              quoteDefaultText={product.quoteDefaultText}
              productLink={product.productLink}
            />
          ))}
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