import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AccountLayout from '../components/layout/AccountLayout'; // Import the layout
import { supabase } from '../lib/supabaseClient'; // Import supabase client

const OrdersPage = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { locale } = router;
  const isRTL = locale === 'ar';

  // State for orders/quotes and fetching status
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // --- Route Protection ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/'); 
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // --- Fetch Order History (now Quote Requests) --- 
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      setLoadingHistory(true);
      setFetchError(null);
      console.log('Fetching quote request history for user:', user.id);

      try {
        // Query quote_requests table and join related cart/items/products
        const { data, error } = await supabase
          .from('quote_requests')
          .select(`
            id,
            created_at,
            carts (
              id,
              cart_items (
                *,
                products (
                  id,
                  name_en,
                  name_ar,
                  product_images ( image_url, is_primary )
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('Fetched quote requests raw data:', data);
        if (!data) {
             setQuoteRequests([]);
             setLoadingHistory(false);
             return;
        }
        
        // --- Collect all unique option IDs across all requests --- START ---
        const allOptionIds = data.reduce((acc, request) => {
            request.carts?.cart_items?.forEach(item => {
                try {
                    const options = (typeof item.selected_options === 'string')
                        ? JSON.parse(item.selected_options)
                        : item.selected_options;
                    if (options && typeof options === 'object') {
                        Object.entries(options).forEach(([groupId, choiceId]) => {
                            if (groupId) acc.groupIds.add(groupId);
                            if (choiceId) acc.choiceIds.add(String(choiceId)); // Ensure choiceId is string
                        });
                    }
                } catch (e) {
                    console.error("Error parsing options during ID collection for history:", item.id, e);
                }
            });
            return acc;
        }, { groupIds: new Set(), choiceIds: new Set() });

        const uniqueGroupIds = Array.from(allOptionIds.groupIds);
        const uniqueChoiceIds = Array.from(allOptionIds.choiceIds);
        
        let groupNamesMap = {};
        let choiceNamesMap = {};

        // Fetch group names
        if (uniqueGroupIds.length > 0) {
            const { data: groups, error: groupError } = await supabase
                .from('product_option_groups')
                .select('id, name_en, name_ar')
                .in('id', uniqueGroupIds);
            if (groupError) console.error("Error fetching group names for history:", groupError);
            else groups.forEach(g => groupNamesMap[g.id] = { en: g.name_en, ar: g.name_ar });
        }

        // Fetch choice names
        if (uniqueChoiceIds.length > 0) {
            const { data: choices, error: choiceError } = await supabase
                .from('product_option_choices')
                .select('id, name_en, name_ar')
                .in('id', uniqueChoiceIds);
            if (choiceError) console.error("Error fetching choice names for history:", choiceError);
            else choices.forEach(c => choiceNamesMap[c.id] = { en: c.name_en, ar: c.name_ar });
        }
        console.log('Fetched Group Names Map:', groupNamesMap);
        console.log('Fetched Choice Names Map:', choiceNamesMap);
        // --- Collect all unique option IDs --- END ---
        
        // Process items within each fetched request's cart using the fetched names
        const processedRequests = data.map(request => {
            const cartData = request.carts;
            // Gracefully handle if a quote request somehow doesn't have associated cart data
            if (!cartData || !cartData.cart_items) {                 
                console.warn(`Quote request ${request.id} missing cart or items.`);
                return { ...request, cart_items: [] }; 
            }
            
            return {
                ...request, // Keep quote_request fields (id, status, created_at)
                cart_items: cartData.cart_items.map(item => {
                    const primaryImage = item.products?.product_images?.find(img => img.is_primary);
                    const fallbackImage = item.products?.product_images?.[0];
                    
                    let resolvedOptions = [];
                    try {
                         const optionsObject = (typeof item.selected_options === 'string') 
                             ? JSON.parse(item.selected_options)
                             : item.selected_options;
                             
                         if (optionsObject && typeof optionsObject === 'object') {
                            resolvedOptions = Object.entries(optionsObject).map(([groupId, choiceId]) => {
                                const choiceIdStr = String(choiceId); // Ensure choiceId is string for map lookup
                                return {
                                     groupId: groupId,
                                     choiceId: choiceIdStr,
                                     // Use fetched names from maps, fallback to ID if not found
                                     groupNameEN: groupNamesMap[groupId]?.en || groupId, 
                                     groupNameAR: groupNamesMap[groupId]?.ar || groupId,
                                     choiceNameEN: choiceNamesMap[choiceIdStr]?.en || choiceIdStr, 
                                     choiceNameAR: choiceNamesMap[choiceIdStr]?.ar || choiceIdStr,
                                };
                             });
                         } 
                    } catch (e) {
                         console.error(`Error processing options for history item ${item.id}:`, e);
                    } 
                     
                    return {
                        ...item,
                        product_name_en: item.products?.name_en,
                        product_name_ar: item.products?.name_ar,
                        primary_image_url: primaryImage?.image_url || fallbackImage?.image_url || '/images/placeholder-detail.jpg',
                        selected_options_details: resolvedOptions // Use the resolved names
                    };
                })
            };
        });

        console.log('Processed quote requests with names:', processedRequests);
        setQuoteRequests(processedRequests || []);

      } catch (error) {
        console.error('Error fetching quote request history:', error);
        setFetchError(t('orders.error.fetch', 'Failed to fetch history.'));
      } finally {
        setLoadingHistory(false);
      }
    };

    if (isAuthenticated && user) {
      fetchHistory();
    } else if (!isAuthLoading && !isAuthenticated) {
        setLoadingHistory(false);
    }
  }, [user, isAuthenticated, isAuthLoading, t]); // Dependencies for fetching

  // --- Loading / Auth Check ---
  if (isAuthLoading) { // Show loading only during auth check
    return (
      <div className="flex justify-center items-center min-h-screen">
           <div className="text-gray-700 dark:text-gray-300">{t('loading', 'Loading...')}</div>
      </div>
    );
  }
  // If not authenticated after loading, route protection will handle redirect

  return (
    <AccountLayout>
       <h1 className={`text-3xl font-bold mb-8 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('orders.title', 'Order History')}
       </h1>
      
       {/* Display loading state for orders */}
       {loadingHistory && (
           <div className="text-center text-gray-500 dark:text-gray-400">
             <p>{t('orders.loading', 'Loading history...')}</p>
           </div>
       )}

       {/* Display fetch error */}
       {fetchError && !loadingHistory && (
           <div className="text-center text-red-500 dark:text-red-400">
             <p>{fetchError}</p>
           </div>
       )}

       {/* Display order history or empty message */}
       {!loadingHistory && !fetchError && (
         <> 
           {quoteRequests.length > 0 ? (
             <div className="space-y-8">
               {quoteRequests.map((request) => (
                 <div key={request.id} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                   <div className={`flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                     <div>
                       <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
                         {t('orders.quoteRequestPrefix', 'Quote Request')} #{request.id.substring(0, 8)}...
                       </h2>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                         {t('orders.requestedOn', 'Requested on')}: {new Date(request.created_at).toLocaleDateString(locale)}
                       </p>
                     </div>
                   </div>
                   
                   {/* List items from the request's associated cart */}
                   {request.cart_items && request.cart_items.length > 0 ? (
                     <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                       {request.cart_items.map((item) => {
                         const itemName = isRTL ? item.product_name_ar : item.product_name_en;
                         return (
                           <li key={item.id} className="flex py-4">
                             <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                               <img 
                                 src={item.primary_image_url} 
                                 alt={itemName}
                                 className="h-full w-full object-cover object-center"
                               />
                             </div>
                             <div className={`flex flex-1 flex-col justify-center ${isRTL ? 'mr-4' : 'ml-4'}`}>
                               <div>
                                 <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                   {itemName}
                                 </h3>
                                 {/* Display options if they exist */}
                                 {item.selected_options_details && item.selected_options_details.length > 0 && (
                                   <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                                     {item.selected_options_details.map((detail) => (
                                       <p key={detail.groupId}>{`${isRTL ? detail.groupNameAR : detail.groupNameEN}: ${isRTL ? detail.choiceNameAR : detail.choiceNameEN}`}</p>
                                     ))}
                                   </div>
                                 )}
                               </div>
                               <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                                 {t('orders.quantity', 'Qty')}: {item.quantity}
                               </p>
                             </div>
                           </li>
                         );
                       })}
                     </ul>
                   ) : (
                     <p className="text-sm text-gray-500 dark:text-gray-400">{t('orders.noItems', 'No items found for this request.')}</p>
                   )}
                 </div>
               ))}
             </div>
           ) : (
       <div className="text-center text-gray-500 dark:text-gray-400">
               <p>{t('orders.noHistory', 'No order history or quote requests found.')}</p>
       </div>
           )}
         </>
       )}
    </AccountLayout>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}

export default OrdersPage; 