import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import ProductCard from '../components/products/ProductCard.jsx';
import Image from 'next/image';
import ProductSearchBar from '../components/products/ProductSearchBar';
import GridDistortion from '../components/effects/GridDistortion';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

export default function Products() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const isRTL = locale === 'ar';

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // State for debounced term

  // Debounce effect for search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Delay in ms (e.g., 500ms)

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Updated fetch function to accept search term
  const fetchProductsData = async (currentSearchTerm) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          name_en,
          name_ar,
          product_images ( image_url )
        `)
        .eq('is_active', true)
        .eq('product_images.is_primary', true);

      // Apply search filter if search term exists
      if (currentSearchTerm) {
         // Use 'or' for searching in either English or Arabic name
         // Use .ilike() for case-insensitive partial matching
         query = query.or(`name_en.ilike.%${currentSearchTerm}%,name_ar.ilike.%${currentSearchTerm}%`);
      }
      
      // Apply ordering
      query = query.order('created_at', { ascending: false }); // Or use sort_order if you add it back

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Process data to extract primary image URL directly
      const processedData = data.map(product => ({
        ...product,
        primary_image_url: product.product_images[0]?.image_url || null // Get first (and only) primary image URL
      }));

      setProducts(processedData || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || 'Failed to load products.');
      setProducts([]); // Clear products on error
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to fetch products when debounced search term changes
  useEffect(() => {
    fetchProductsData(debouncedSearchTerm);
  }, [debouncedSearchTerm]); // Re-run when debounced term changes

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
        {/* === Pass props to Search Bar === */}
        <ProductSearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm} // Pass the state setter function
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-4">
          {isLoading ? (
            // Simple loading indicator (replace with skeletons later if desired)
            <p className="col-span-full text-center py-10">Loading products...</p>
          ) : error ? (
            <p className="col-span-full text-center py-10 text-red-600">Error loading products: {error}</p>
          ) : products.length === 0 ? (
            <p className="col-span-full text-center py-10">No products found.</p>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                imageUrl={product.primary_image_url || '/images/placeholder.png'} // Use fetched primary image or placeholder
                productName={isRTL ? product.name_ar : product.name_en}
                quoteKey={product.quoteKey}
                quoteDefaultText={product.quoteDefaultText}
                productLink={`/products/${product.id}`} // Generate correct link
              />
            ))
          )}
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