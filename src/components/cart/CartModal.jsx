import React, { useContext, useState, useEffect, useRef } from 'react';
import { useModal } from '../../context/ModalContext';
import { useCart } from '../../context/CartContext'; // Import actual CartContext
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { useTranslation } from 'next-i18next';
import { X, Plus, Minus, Trash2, Check } from 'lucide-react'; // Import icons
import { useRouter } from 'next/router'; // Import useRouter for locale
import toast from 'react-hot-toast'; // Import toast
import ConfirmationModal from '../common/ConfirmationModal'; // Reverted to correct import path and name

// --- Dummy Cart Data Removed ---

const CartModal = () => {
  const { isCartOpen, closeCartModal } = useModal();
  const { 
      cartItems, 
      isLoading: isCartLoading, // Rename cart loading state
      error: cartError, // Rename cart error state
      removeFromCart, 
      cart, 
      createQuoteRequestRecord // <-- Get new function
    } = useCart(); // Use real cart context
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Get user and auth state
  const { t } = useTranslation('common');
  const { locale } = useRouter(); // Get locale
  const isRTL = locale === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // <-- Add submitted state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State for confirmation modal
  const closeTimeoutRef = useRef(null); // <-- Ref to store timeout ID

  // --- Cleanup timeout on component unmount ---
  useEffect(() => {
    // Return a cleanup function
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // Function to handle quote request submission
  const handleRequestQuote = async () => {
      if (isSubmitting || isSubmitted || cartItems.length === 0 || isCartLoading || isAuthLoading || !isAuthenticated) return; 

      setIsSubmitting(true);
      
      // Prepare payload with cart items and user info
      const payload = { 
          cartItems, 
          userInfo: { 
              email: user?.email, 
              name: user?.user_metadata?.full_name || user?.email, // Keep existing name logic
              phone: user?.user_metadata?.phone, // Add phone
              companyName: user?.user_metadata?.company_name, // Add company name
              province: user?.user_metadata?.province // Add province
          } 
      }; 

      try {
          const response = await fetch('/api/request-quote', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (!response.ok) {
              // Use API message if available, otherwise generic error
              const errorMessage = result.message || t('cart.error.quoteFailed', 'Failed to send quotation request.');
              console.error('Quote Request API Error:', result.details || result.message);
              toast.error(errorMessage);
              setIsSubmitted(false); // Ensure submitted state is reset on error
          } else {
              // Success! Show confirmation modal instead of toast/timeout
              // toast.success(successMessage); // Removed toast
              
              setIsSubmitted(true); 
              setShowConfirmationModal(true); // Show the confirmation modal
              
              // Start background processing for the cart
              if (cart?.id) {
                  // We don't necessarily need to await this for the UI delay
                  createQuoteRequestRecord(cart.id).catch(err => {
                      console.error("Background cart processing failed:", err);
                      // Optionally inform user if background processing fails critically
                  }); 
              } else {
                  console.error("Could not process cart after submission: cart ID is missing.");
                  toast.error("Error processing cart after submission.");
                  // Potentially skip the close timeout if cart processing fails?
              }
              
              // Removed automatic modal close timeout
              // if (closeTimeoutRef.current) {
              //     clearTimeout(closeTimeoutRef.current);
              // }
              // closeTimeoutRef.current = setTimeout(() => {
              //     closeCartModal(); 
              // }, 3000); 
          }
      } catch (error) {
          console.error("Error submitting quote request fetch:", error);
          toast.error(t('cart.error.quoteFailedNetwork', 'Network error. Failed to send quotation request.'));
          setIsSubmitted(false); // Ensure submitted state is reset on error
      } finally {
          setIsSubmitting(false);
      }
  };

  // Handler for closing the confirmation modal
  const handleConfirmationClose = () => {
    setShowConfirmationModal(false);
    closeCartModal();
    // Optionally reset isSubmitted here if needed, though closing modal might suffice
    setIsSubmitted(false); 
  };

  // Function to handle closing the main cart modal
  const handleClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    // Reset state when closing manually too
    setIsSubmitted(false);
    setShowConfirmationModal(false);
    closeCartModal();
  };

  return (
    <div 
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ease-in-out ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      aria-labelledby="cart-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {/* Modal Panel */}
      <div 
         className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-md transform transition-transform duration-300 ease-in-out ${isCartOpen ? (isRTL ? 'translate-x-0' : 'translate-x-0') : (isRTL ? '-translate-x-full' : 'translate-x-full')}`}
      >
        <div dir={isRTL ? 'rtl' : 'ltr'} className={`flex flex-col h-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto ${isRTL ? 'rounded-r-lg' : 'rounded-l-lg'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <h2 id="cart-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
              {t('cart.title', 'Shopping Basket')}
            </h2>
            <button 
              type="button"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              onClick={handleClose}
            >
              <span className="sr-only">{t('common.close', 'Close')}</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 px-4 py-6 sm:px-6">
             {isCartLoading ? (
                 <div className="flex justify-center items-center h-full">
                     <p className="text-gray-500 dark:text-gray-400">{t('cart.loading', 'Loading cart...')}</p>
                 </div>
             ) : cartError ? (
                 <div className="flex justify-center items-center h-full">
                     <p className="text-red-500 dark:text-red-400">{cartError}</p>
                 </div>
             ) : cartItems.length > 0 ? (
              <ul role="list" className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => {
                   const itemName = isRTL ? item.product_name_ar : item.product_name_en;
                   // const optionEntries = Object.entries(item.selected_options || {}); // Old way
                   // TODO: Need to fetch option group/choice names based on IDs for display
                   
                   let optionsToDisplay = [];
                   try {
                       // Attempt to parse if it's a string, or use directly if object
                       const optionsObject = (typeof item.selected_options === 'string') 
                           ? JSON.parse(item.selected_options)
                           : item.selected_options;
                           
                       if (optionsObject && typeof optionsObject === 'object') {
                          optionsToDisplay = Object.entries(optionsObject);
                       }
                   } catch (e) {
                       console.error("Failed to parse selected_options for item:", item.id, item.selected_options, e);
                       // Optionally display the raw value if parsing fails
                       // optionsToDisplay = [['raw', item.selected_options]]; 
                   }

                   return (
                      <li key={item.id} className="flex py-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                          <img 
                            src={item.primary_image_url} 
                            alt={itemName}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className={`flex flex-1 flex-col ${isRTL ? 'mr-4' : 'ml-4'}`}>
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                              <h3>{itemName}</h3>
                              {/* Price not available in schema */}
                            </div>
                            {/* Display selected options (needs improvement with actual names) */}
                            {/* Temporarily commented out until option name fetching is implemented */}
                            {/* Use the new selected_options_details field */}
                            {item.selected_options_details && item.selected_options_details.length > 0 && (
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                                   {item.selected_options_details.map((detail) => (
                                       <p key={detail.groupId}>{`${isRTL ? detail.groupNameAR : detail.groupNameEN}: ${isRTL ? detail.choiceNameAR : detail.choiceNameEN}`}</p> 
                                   ))}
                                </div>
                            )}
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                             {/* Quantity Selector */}
                             {/* Replace buttons with text display */}
                             {/* <div className=\"flex items-center border border-gray-300 dark:border-gray-600 rounded-md\">
                                <button 
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                    className=\"px-2 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed\"
                                    disabled={item.quantity <= 1 || isLoading}
                                    aria-label={t('cart.decreaseQuantity', 'Decrease quantity')}
                                >
                                    <Minus size={14} />
                                </button>
                                <span className=\"px-3 py-1 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-l border-r border-gray-300 dark:border-gray-600\">
                                    {item.quantity}
                                </span>
                                <button 
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                    className=\"px-2 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed\"
                                    aria-label={t('cart.increaseQuantity', 'Increase quantity')}
                                    disabled={isLoading}
                                >
                                   <Plus size={14} />
                                </button>
                            </div> */}
                            <p className="text-gray-700 dark:text-gray-300">
                                {t('cart.quantityLabel', 'Quantity')}: {item.quantity}
                            </p>
                             
                            <div className="flex">
                              <button 
                                type="button" 
                                className="font-medium text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 p-1"
                                onClick={() => removeFromCart(item.id)}
                                disabled={isCartLoading}
                                title={t('common.remove', 'Remove')}
                              >
                                 <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                   );
                })}
              </ul>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">{t('cart.empty', 'Your basket is empty.')}</p>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
             <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-6 sm:px-6">
              {/* Subtotal/Price logic depends on having prices */}
               <div className="mt-6">
                 <button 
                     onClick={handleRequestQuote}
                     className={`w-full flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition-colors 
                                 ${isSubmitted 
                                    ? 'bg-green-600 dark:bg-green-700 cursor-not-allowed' // Submitted style
                                    : 'bg-button-primary hover:bg-opacity-90' // Default style
                                 }
                                 ${(isCartLoading || isSubmitting || !isAuthenticated || isAuthLoading || isSubmitted) ? 'opacity-70 cursor-not-allowed' : ''}`}
                     disabled={isCartLoading || isSubmitting || !isAuthenticated || isAuthLoading || isSubmitted} // <-- Disable when submitted too
                 >
                     {isSubmitting ? (
                         <>
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             {t('cart.submitting', 'Submitting...')}
                         </>
                     ) : isSubmitted ? (
                         <> 
                            <Check className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('cart.submitted', 'Submitted!')} 
                         </> 
                     ) : (
                         t('cart.requestQuotation', 'Request Quotation')
                     )}
                 </button>
               </div>
               <div className="mt-4 flex justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                 <p>
                   {t('common.or', 'or')}{' '}
                   <button 
                     type="button" 
                     className="font-medium text-button-primary hover:text-gray-700 dark:text-button-primary dark:hover:text-gray-200 transition-colors"
                     onClick={handleClose}
                   >
                     {t('cart.continueShopping', 'Continue Shopping')} <span aria-hidden="true"> &rarr;</span>
                   </button>
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Render the Confirmation Modal (using correct component) */}
      <ConfirmationModal 
        isOpen={showConfirmationModal}
        onClose={handleConfirmationClose}
        title={t('confirmation.defaultTitle', 'Success!')} // You can customize title if needed
        message={t('cart.success.quoteSentConfirmation', 'Your quotation request has been submitted successfully. We will contact you soon.')}
      />
    </div>
  );
};

export default CartModal; 