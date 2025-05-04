import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { ChevronLeft, ChevronRight, Minus, Plus, Check } from 'lucide-react'; // Import icons
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { useCart } from '../../context/CartContext'; // Import useCart
import { useModal } from '../../context/ModalContext'; // Import useModal
import toast from 'react-hot-toast'; // Import react-hot-toast
// Import any necessary components for the detail page (e.g., image gallery, details section)
// import ProductImageGallery from '../../components/product-detail/ProductImageGallery'; 
// import ProductInfo from '../../components/product-detail/ProductInfo';

// --- Dummy Options Data ---
// This would come from a database/API later
const dummyOptionsData = [
  {
    id: 'size',
    titleKey: 'productOptions.size',
    titleDefault: 'Size',
    options: [
      { value: 's', labelKey: 'productOptions.size.small', labelDefault: 'Small' },
      { value: 'm', labelKey: 'productOptions.size.medium', labelDefault: 'Medium' },
      { value: 'l', labelKey: 'productOptions.size.large', labelDefault: 'Large' },
    ],
    type: 'radio', // Type of selection
  },
  {
    id: 'material',
    titleKey: 'productOptions.material',
    titleDefault: 'Material',
    options: [
      { value: 'cotton', labelKey: 'productOptions.material.cotton', labelDefault: 'Cotton' },
      { value: 'polyester', labelKey: 'productOptions.material.polyester', labelDefault: 'Polyester Blend' },
      { value: 'cardstock', labelKey: 'productOptions.material.cardstock', labelDefault: 'Heavy Cardstock' },
    ],
    type: 'radio',
  },
  {
    id: 'finish',
    titleKey: 'productOptions.finish',
    titleDefault: 'Finish',
    options: [
      { value: 'matte', labelKey: 'productOptions.finish.matte', labelDefault: 'Matte' },
      { value: 'glossy', labelKey: 'productOptions.finish.glossy', labelDefault: 'Glossy' },
      { value: 'uv', labelKey: 'productOptions.finish.uv', labelDefault: 'UV Coated' },
    ],
    type: 'radio',
  },
];
// --- End Dummy Options Data ---

// --- Simple Accordion/Dropdown Component ---
// Can be moved to a separate file later
const OptionAccordion = ({ 
  optionCategory, 
  selectedOption, 
  onOptionChange,
  isOpen,
  onToggle,
  isRTL 
}) => {
  const { t } = useTranslation('common');
  const { id, titleKey, titleDefault, options, type } = optionCategory;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <h2>
        <button 
          type="button" 
          className="flex items-center justify-between w-full px-6 py-4 font-medium text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <span>{titleDefault}</span>
          <svg className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      </h2>
      <div className={`${isOpen ? 'block' : 'hidden'} pb-4 pt-2 px-6`}>
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option.value} className="flex items-center text-gray-600 dark:text-gray-400 cursor-pointer">
              <input 
                type={type} 
                name={id} 
                value={option.value} 
                checked={selectedOption === option.value} 
                onChange={() => onOptionChange(id, option.value)}
                className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'} text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800`}
              />
              {option.labelDefault}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
// --- End Accordion Component ---

export default function ProductDetailPage({ productData }) {
  const router = useRouter();
  const { productId } = router.query;
  const { t } = useTranslation('common');
  const { locale } = router;
  const isRTL = locale === 'ar';
  const { user, isAuthenticated } = useAuth(); // Get user auth state
  const { openLoginModal } = useModal(); // To open login if not authenticated
  const { addToCart, isLoading: isCartLoading } = useCart(); // Get cart functions

  const [selectedOptions, setSelectedOptions] = useState({}); 
  const [openAccordion, setOpenAccordion] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(productData?.min_order_quantity || 1);
  const minOrderQuantity = productData?.min_order_quantity || 1;
  const [isAdded, setIsAdded] = useState(false); // <-- State for "added" status
  const addedTimeoutRef = useRef(null); // <-- Ref to store timeout ID
  const [selectionError, setSelectionError] = useState(null); // <-- Add state for selection error message

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
      }
    };
  }, []);

  // Handle case where productData isn't available yet (especially with fallback: true)
  if (router.isFallback || !productData) {
      return <div className="flex justify-center items-center min-h-screen text-gray-700 dark:text-gray-300">{t('loading', 'Loading...')}</div>; 
  }
  
  // Use fetched images
  const allImages = (productData.product_images || []).map(img => img.image_url);
  // Ensure there's at least one image, use placeholder if not
  if (allImages.length === 0) {
    allImages.push('/images/placeholder-detail.jpg'); // Add a placeholder
  }

  // --- Image Slider Handlers ---
  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToImageIndex = (index) => {
    setCurrentImageIndex(index);
  };

  // Handler to update selected options
  const handleOptionChange = (optionGroupId, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionGroupId]: value,
    }));
    setSelectionError(null); // <-- Clear error when an option is changed
  };

   // Handler to toggle accordion open/closed state
   const handleAccordionToggle = (accordionId) => {
    setOpenAccordion(openAccordion === accordionId ? null : accordionId);
  };

  // Renamed: Handles +/- button clicks
  const handleQuantityStep = (change) => {
    setQuantity(prev => {
        const newValue = prev + change;
        return Math.max(minOrderQuantity, newValue); // Ensure minimum quantity
    });
  };

  // New: Handles direct input typing
  const handleManualQuantityInput = (event) => {
      const rawValue = event.target.value;
      // Allow empty input temporarily
      if (rawValue === '') {
           setQuantity(''); 
           return;
      }
      // Try to parse
      const value = parseInt(rawValue, 10);
      // Only update state if it's a valid number (could be less than min temporarily)
      if (!isNaN(value)) {
           setQuantity(value); 
      } 
      // If it's not a number (e.g., user types 'abc'), do nothing here,
      // onBlur will handle resetting it.
  };
  
  // Revised: Handles blur event to ensure a valid number >= minimum
  const handleQuantityBlur = (event) => {
      const rawValue = event.target.value;
      const value = parseInt(rawValue, 10);

      // If empty, not a number, OR less than minimum, reset to minimum
      if (rawValue === '' || isNaN(value) || value < minOrderQuantity) {
          setQuantity(minOrderQuantity);
      } else {
          // If it was valid and >= minimum, ensure state has the correctly parsed number
          // (e.g., handles if user typed "050" -> becomes 50)
          setQuantity(value); 
      }
  };

  const handleAddToCart = async () => {
    // --- NEW: Check Authentication ---
    if (!isAuthenticated) {
      openLoginModal(); // Open the login modal
      toast.error(t('productDetails.error.loginRequired', 'Please log in to add items to your cart.')); // Optional: inform user
      return; // Stop execution if not logged in
    }
    // --- End Check Authentication ---

    // This check remains important as a final safeguard
    const currentQuantity = typeof quantity === 'number' ? quantity : minOrderQuantity;
    if (isNaN(currentQuantity) || currentQuantity < minOrderQuantity) {
        toast.error(t('productDetails.error.invalidQuantity', 'Please enter a valid quantity.'));
        setQuantity(minOrderQuantity); // Reset to minimum if invalid
        return;
    }
   
    // Check if all option groups have a selection (if options exist)
    const optionGroups = productData.product_option_groups || [];
    if (optionGroups.length > 0) {
        const allOptionsSelected = optionGroups.every(group => selectedOptions[group.id]);
        if (!allOptionsSelected) {
            setSelectionError(t('productDetails.error.selectOptions', 'Please select an option for each category.'));
            return;
        }
        setSelectionError(null); 
    } else {
        setSelectionError(null); 
    }
    
    try {
        // Use currentQuantity which is validated above
        await addToCart(productData.id, currentQuantity, selectedOptions); 
        
        // Clear any existing timeout before setting a new one
        if (addedTimeoutRef.current) {
          clearTimeout(addedTimeoutRef.current);
        }
        setIsAdded(true); // Set added state

        toast.success(t('productDetails.success.addedToCart', '{quantity} x {productName} added to cart', {
            quantity: currentQuantity,
            productName: isRTL ? productData.name_ar : productData.name_en
         }));

        // Set timeout to reset the state
        addedTimeoutRef.current = setTimeout(() => {
          setIsAdded(false);
          addedTimeoutRef.current = null; 
        }, 3000); 
    } catch (error) {
        toast.error(t('productDetails.error.addToCartFailed', 'Failed to add item to cart. Please try again.'));
    }
  };

  // Use fetched product name and description
  const productName = isRTL ? productData.name_ar : productData.name_en;
  const productDescription = isRTL ? productData.description_ar : productData.description_en;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="container mx-auto px-4 py-8 max-w-[110rem] dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Start building your product detail layout here using productData */}
      
      {/* Example: Basic Layout Structure - Updated grid columns and reduced gap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-10"> {/* Reduced md and lg gaps */}
          
          {/* Image Section - Updated column span */}
          <div className={`${isRTL ? "md:order-2" : ""} md:col-span-2 relative`}> {/* Added relative */}
              {/* Main Product Image - Changed aspect ratio to 4:3 */}
              <div className="mb-4 aspect-[4/2.5] overflow-hidden rounded-lg shadow-lg bg-gray-200 dark:bg-gray-700"> {/* Changed aspect-video to aspect-[4/3] */}
                 {/* Using <img> for now, Next/Image would be better */}
                 <img 
                    key={currentImageIndex} // Add key for potential transitions later
                    src={allImages[currentImageIndex]} 
                    alt={`${productName} - Image ${currentImageIndex + 1}`} 
                    className="w-full h-full object-cover transition-opacity duration-300 ease-in-out" // Basic transition
                  />
              </div>
              
              {/* Slider Controls: Arrows - Adjusted for RTL */}
              {allImages.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button 
                    onClick={goToPreviousImage}
                    className={`absolute top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white ${isRTL ? 'right-4' : 'left-4'}`}
                    aria-label={t('productImages.previous', 'Previous image')}
                  >
                    {/* Use ChevronRight for "Previous" in RTL */}
                    {isRTL ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                  </button>
                  {/* Next Button */}
                  <button 
                    onClick={goToNextImage}
                    className={`absolute top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white ${isRTL ? 'left-4' : 'right-4'}`}
                    aria-label={t('productImages.next', 'Next image')}
                  >
                     {/* Use ChevronLeft for "Next" in RTL */}
                     {isRTL ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                  </button>
                </>
              )}

              {/* Slider Controls: Pagination Dots - Removed space-x-reverse for RTL */}
              {allImages.length > 1 && (
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 ${isRTL ? 'flex-row-reverse' : ''} bg-black/60 px-3 py-1.5 rounded-full`}> {/* Adjusted style */} 
                  {allImages.map((_, index) => (
                    <button
                      key={index} 
                      onClick={() => goToImageIndex(index)} 
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${currentImageIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                      aria-label={t('productImages.goToImage', 'Go to image {index}', { index: index + 1 })}
                    />
                  ))}
                </div>
              )}
          </div>

          {/* Details Section - Updated column span and container styling */}
          {/* Added padding, background (subtle), border, rounded corners, and relative positioning for wishlist icon */}
          {/* Changed padding to px-2 py-6 to account for outer container's px-4 */}
          <div className={`${isRTL ? "md:order-1" : ""} md:col-span-1 bg-white dark:bg-gray-800 py-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 relative flex flex-col`}> 
              
              {/* Placeholder for Wishlist Icon - REMOVED */}
              {/* 
              <div className="relative px-6"> 
                  <button className="absolute top-0 right-6 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                  </button>
              </div>
              */}

              {/* Breadcrumb Placeholder (Optional) */}
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 px-6">
                  {t('breadcrumb.home', 'Home')} / {t('breadcrumb.products', 'Products')}
              </div>

              {/* Product Name */}
              {/* Increased bottom margin */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-gray-900 dark:text-white px-6">{productName || 'Product Details'}</h1>
              
              {/* Added Dummy Description - Reduced line height */}
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-normal px-6">
                  {productDescription || t('productDetails.noDescription', 'No description available.')}
              </p>

              {/* --- Dynamic Options Section --- */}
              <div className="mb-6"> 
                 {(productData.product_option_groups || []).length > 0 ? (
                     (productData.product_option_groups || []).map((optionGroup) => (
                    <OptionAccordion 
                            key={optionGroup.id}
                            // Construct optionCategory prop from fetched group/choices
                            optionCategory={{
                                id: optionGroup.id, // Use group ID for name attribute
                                titleKey: null, // No specific key, use name directly
                                titleDefault: isRTL ? optionGroup.name_ar : optionGroup.name_en,
                                options: (optionGroup.product_option_choices || []).map(choice => ({
                                    value: choice.id, // Use choice ID as value?
                                    labelKey: null, // No specific key
                                    labelDefault: isRTL ? choice.name_ar : choice.name_en
                                })),
                                type: 'radio' // Assuming radio for now, might need type in DB later
                            }}
                            selectedOption={selectedOptions[optionGroup.id]} // Use group ID
                            onOptionChange={handleOptionChange} 
                            isOpen={openAccordion === optionGroup.id} // Use group ID
                            onToggle={() => handleAccordionToggle(optionGroup.id)} // Use group ID
                       isRTL={isRTL}
                    />
                     ))
                  ) : (
                      <p className="text-gray-500 dark:text-gray-400 px-6">{t('productDetails.noOptions', 'No customizable options available for this product.')}</p>
                  )}
              </div>
              {/* --- End Dynamic Options Section --- */}

              {/* --- Quantity Selector --- */}
               <div className="px-6 mb-8">
                    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('productDetails.quantity')}
                    </label>
                    <div className="inline-flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                        <button 
                            onClick={() => handleQuantityStep(-1)}
                            className={`px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors 
                                        border-gray-300 dark:border-gray-600 ltr:border-r rtl:border-l`}
                            disabled={quantity <= minOrderQuantity || isCartLoading}
                            aria-label={t('productDetails.decreaseQuantity', 'Decrease quantity')}
                        >
                            <Minus size={16} />
                        </button>
                        <input 
                            type="number" 
                            value={quantity}
                            min={minOrderQuantity}
                            onChange={handleManualQuantityInput}
                            onBlur={handleQuantityBlur}
                            className={`w-16 text-center px-1 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isCartLoading ? 'opacity-50' : ''}`}
                            aria-label={t('productDetails.currentQuantity', 'Current quantity')}
                        />
                        <button 
                            onClick={() => handleQuantityStep(1)}
                            className={`px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors 
                                        border-gray-300 dark:border-gray-600 ltr:border-l rtl:border-r`}
                            aria-label={t('productDetails.increaseQuantity', 'Increase quantity')}
                            disabled={isCartLoading}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                         {t('productDetails.minOrderQuantity', { min: minOrderQuantity })}
                    </p>
               </div>
              {/* --- End Quantity Selector --- */}

              {/* Error Message Area - Moved inside the button container below */}
              {/* {selectionError && (
                <p className=\"text-red-500 text-sm mt-2 mb-3 text-center\" role=\"alert\">
                  {selectionError}
                </p>
              )} */}

              {/* Add to Basket Button */} 
              {/* Removed pt-8, moved error message inside */}
              <div className="mt-auto px-6"> 
                  {/* Error Message Area - Now positioned right above the button */}
                  {selectionError && (
                    <p className="text-red-500 text-sm mb-3 text-center" role="alert">
                      {selectionError}
                    </p>
                  )}
                  <button
                    onClick={handleAddToCart}
                    // Disable button when cart is loading OR when in the "Added" state
                    disabled={isCartLoading || isAdded}
                    // Dynamically change background color and other styles based on isAdded state
                    className={`w-full flex justify-center items-center 
                                font-bold py-3 px-6 rounded-full transition duration-150 ease-in-out text-center text-lg
                                ${isAdded 
                                    ? 'bg-green-600 dark:bg-green-700 text-white cursor-not-allowed' // Added state styles
                                    : 'bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 dark:hover:bg-gray-300 text-white dark:text-gray-900' // Default styles
                                }
                                ${(isCartLoading || isAdded) ? 'opacity-70 cursor-not-allowed' : ''}`} // Loading/Added state opacity
                  >
                     {isCartLoading ? (
                         // Loading spinner (unchanged)
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                     ) : isAdded ? (
                         // Added state text and icon
                         <>
                           <Check className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                           {t('products.added', 'Added')}
                         </>
                     ) : (
                         // Default state text
                         t('products.addToBasket', 'Add to Basket')
                     )}
                  </button>
              </div>
          </div>
      </div>

      {/* Add more sections as needed (e.g., related products) */}
      {/* <div className="mt-16">
           <h2 className="text-2xl font-bold mb-6">{t('products.relatedProducts', 'Related Products')}</h2>
           {/* ... Related products component or grid ... */}
       {/* </div> */}

    </div>
  );
}

// --- Data Fetching ---

// CHANGED: getStaticProps to getServerSideProps
export async function getServerSideProps({ params, locale, req, res }) { // Added req, res context
  const { productId } = params;
  const currentLocale = locale ?? 'en';

  // Fetch the specific product details including images and options/choices
  const { data: productData, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images ( * ),
      product_option_groups ( *, product_option_choices ( * ) )
    `)
    .eq('id', productId)
    .eq('is_active', true) // Ensure we only fetch active products
    .maybeSingle(); 

  if (error) {
    console.error(`Error fetching product ${productId}:`, error);
  }

  if (!productData) {
    // For SSR, you might want to set status code before returning notFound
    // res.statusCode = 404; 
    return { notFound: true };
  }

  // Sorting logic remains the same
  if (productData.product_images) {
      productData.product_images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }
  if (productData.product_option_groups) {
      productData.product_option_groups.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      productData.product_option_groups.forEach(group => {
          if (group.product_option_choices) {
              group.product_option_choices.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          }
      });
  }

  // Set cache headers if desired for SSR (optional)
  // res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  return {
    props: {
      productData, 
      ...(await serverSideTranslations(currentLocale, ['common'])), // Load common translations
    },
    // Removed revalidate as it's for ISR/SSG
  };
} 