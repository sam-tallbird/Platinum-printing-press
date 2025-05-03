import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext'; // To get the logged-in user

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, session, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState(null); // Stores the cart record (id, user_id, status)
  const [cartItems, setCartItems] = useState([]); // Stores array of cart items with product details
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
      if (!user || authLoading) return; // Exit if no user or auth is loading

      setIsLoading(true);
      setError(null);
      // Don't reset cart/items here, let the fetch result dictate the state
      // setCart(null); 
      // setCartItems([]);
      console.log(`fetchCart: Starting fetch for user: ${user.id}`); // <-- Log user ID

      try {
          // 1. Find user's *most recent* active cart
          let { data: activeCart, error: cartError } = await supabase
              .from('carts')
              .select('*')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .order('created_at', { ascending: false }) // <-- Order by newest first
              .limit(1) // <-- Take only the newest one
              .maybeSingle();

          if (cartError) throw cartError;

          // <-- Log fetched cart details
          if (activeCart) {
              console.log(`fetchCart: Found latest active cart ID: ${activeCart.id}, Created at: ${activeCart.created_at}, Status: ${activeCart.status}`); 
          } else {
               console.log(`fetchCart: Query returned no active cart.`);
          }

          // 2. If no active cart, create one
          if (!activeCart) {
              console.log("No active cart found, creating one for user:", user.id);
              const { data: newCart, error: createError } = await supabase
                  .from('carts')
                  .insert({ user_id: user.id, status: 'active' })
                  .select()
                  .single();
              
              if (createError) throw createError;
              activeCart = newCart;
          }
          
          setCart(activeCart); // Set the most recent active cart

          // 3. Fetch cart items associated with the active cart
          if (activeCart) {
              const { data: items, error: itemsError } = await supabase
                  .from('cart_items')
                  .select(`
                      *,
                      products (
                          id,
                          name_en,
                          name_ar,
                          product_images ( image_url, is_primary )
                      )
                  `)
                  .eq('cart_id', activeCart.id)
                  .order('created_at', { ascending: true }); // Optional: order items

              if (itemsError) throw itemsError;
              
               // --- Fetch Option Names --- START
               let groupNames = {};
               let choiceNames = {};
               if (items && items.length > 0) {
                   const allOptionIds = items.reduce((acc, item) => {
                       try {
                           const options = (typeof item.selected_options === 'string')
                               ? JSON.parse(item.selected_options)
                               : item.selected_options;
                           if (options && typeof options === 'object') {
                               Object.entries(options).forEach(([groupId, choiceId]) => {
                                   if (groupId) acc.groupIds.add(groupId);
                                   if (choiceId) acc.choiceIds.add(choiceId);
                               });
                           }
                       } catch (e) {
                           console.error("Error parsing options during ID collection:", item.id, e);
                       }
                       return acc;
                   }, { groupIds: new Set(), choiceIds: new Set() });

                   const uniqueGroupIds = Array.from(allOptionIds.groupIds);
                   const uniqueChoiceIds = Array.from(allOptionIds.choiceIds);

                   // Fetch group names
                   if (uniqueGroupIds.length > 0) {
                       const { data: groups, error: groupError } = await supabase
                           .from('product_option_groups')
                           .select('id, name_en, name_ar')
                           .in('id', uniqueGroupIds);
                       if (groupError) console.error("Error fetching group names:", groupError);
                       else groups.forEach(g => groupNames[g.id] = { en: g.name_en, ar: g.name_ar });
                   }

                   // Fetch choice names
                   if (uniqueChoiceIds.length > 0) {
                       const { data: choices, error: choiceError } = await supabase
                           .from('product_option_choices')
                           .select('id, name_en, name_ar')
                           .in('id', uniqueChoiceIds);
                       if (choiceError) console.error("Error fetching choice names:", choiceError);
                       else choices.forEach(c => choiceNames[c.id] = { en: c.name_en, ar: c.name_ar });
                   }
               }
               // --- Fetch Option Names --- END

               // Process items to add a primary image URL and resolved option names
               const processedItems = items.map(item => {
                   const primaryImage = item.products?.product_images?.find(img => img.is_primary);
                   const fallbackImage = item.products?.product_images?.[0]; // Fallback to first image
                   
                   // Resolve option names
                   let resolvedOptions = [];
                   try {
                       const options = (typeof item.selected_options === 'string')
                           ? JSON.parse(item.selected_options)
                           : item.selected_options;
                       if (options && typeof options === 'object') {
                           resolvedOptions = Object.entries(options).map(([groupId, choiceId]) => ({
                               groupId,
                               choiceId,
                               groupNameEN: groupNames[groupId]?.en || groupId, // Fallback to ID
                               groupNameAR: groupNames[groupId]?.ar || groupId,
                               choiceNameEN: choiceNames[choiceId]?.en || choiceId, // Fallback to ID
                               choiceNameAR: choiceNames[choiceId]?.ar || choiceId,
                           }));
                       }
                   } catch(e) {
                        console.error("Error processing options for item details:", item.id, e);
                   }
                   
                   return {
                       ...item,
                       product_name_en: item.products?.name_en,
                       product_name_ar: item.products?.name_ar,
                       primary_image_url: primaryImage?.image_url || fallbackImage?.image_url || '/images/placeholder-detail.jpg', // Add placeholder path
                       selected_options_details: resolvedOptions // Add the resolved names
                   };
               });

              setCartItems(processedItems || []);
          }

      } catch (err) {
          console.error("Error fetching/creating cart:", err);
          setError("Failed to load cart. Please try again.");
          setCart(null);
          setCartItems([]);
      } finally {
          setIsLoading(false);
      }
  }, [user, authLoading]);

  // Fetch cart initially and when user changes
  useEffect(() => {
      setIsLoading(true);
      if (session) { // User is potentially logged in
          fetchCart();
      } else { // User logged out
          setCart(null);
          setCartItems([]);
          setIsLoading(false);
      }
  }, [session, fetchCart]); // Rerun when session changes

  const addToCart = async (productId, quantity, selectedOptions) => {
    // Ensure user is logged in and cart is loaded
    if (!cart || !user) {
      setError("Cannot add to cart. Please log in or wait for cart to load.");
      console.error("addToCart called without user or cart.");
      return;
    }
    // Ensure quantity is valid
    if (!quantity || quantity < 1) {
      console.warn("addToCart called with invalid quantity:", quantity);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format selected options for storage (ensure consistent key order if matching based on JSON)
      const optionsKey = JSON.stringify(selectedOptions || {}); // Simple stringify for now

      // Check if the exact item (product + options) already exists in the cart
      const { data: existingItems, error: findError } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cart.id)
          .eq('product_id', productId)
          // Note: Direct JSONB equality check can be tricky. 
          // Supabase might support it, but comparing stringified versions is safer 
          // unless you structure the options consistently (e.g., sorted keys).
          // Or, filter client-side if feasible. For simplicity, let's try filtering in query:
          .eq('selected_options', optionsKey) 
          .limit(1);
      
      if (findError) {
          console.error("Error finding existing cart item:", findError);
          // Decide if we should proceed or throw?
          // Let's proceed to insert, maybe the .eq failed non-fatally
      }
      
      const existingItem = existingItems?.[0];

      if (existingItem) {
        // Update quantity of existing item
        const newQuantity = existingItem.quantity + quantity;
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
        console.log("Updated cart item quantity:", existingItem.id);
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity: quantity,
            selected_options: selectedOptions || {},
          });

        if (insertError) throw insertError;
        console.log("Added new item to cart:");
      }

      // Refresh cart data after modification
      await fetchCart();

    } catch (err) {
      console.error("Error adding/updating cart item:", err);
      setError("Failed to add item to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!cart) return;
    setIsLoading(true);
    setError(null);
    console.log("Attempting to remove item:", cartItemId); // Updated log
    try {
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItemId)
            // Optionally, ensure it belongs to the current cart for security
            // .eq('cart_id', cart.id); 

        if (deleteError) throw deleteError;

        console.log("Successfully removed item:", cartItemId);
        // Refetch cart data to update the UI
        await fetchCart(); 

    } catch (err) {
        console.error("Error removing cart item:", err);
        setError("Failed to remove item from cart.");
    } finally {
        setIsLoading(false);
    }
  };

  const updateCartItemQuantity = async (cartItemId, newQuantity) => {
     if (!cart || newQuantity < 1) return;
    setIsLoading(true);
    setError(null);
     console.log("Placeholder: Updating quantity:", { cartItemId, newQuantity });
     // Update logic here
    setIsLoading(false);
      // Refetch cart after updating?
  };

  // Function to create a quote_requests record and fetch a new active cart
  const createQuoteRequestRecord = async (cartId) => {
    if (!cartId || !user) {
        console.error("Cannot create quote request record: Missing cartId or user.");
        setError("Failed to process quote request. User or Cart ID missing.");
        return; 
    }
    
    setIsLoading(true); 
    setError(null);
    
    try {
        // Call the database function to handle the process atomically
        console.log(`Calling database function submit_cart_and_create_new for cart: ${cartId}`);
        const { error: rpcError } = await supabase.rpc('submit_cart_and_create_new', {
            cart_id_to_submit: cartId 
        });

        if (rpcError) {
            // The function itself might raise exceptions (e.g., cart not found/active)
            // or encounter other internal errors.
            console.error("Error calling submit_cart_and_create_new RPC:", rpcError);
            setError(`Failed to submit quote: ${rpcError.message}`);
            throw rpcError; // Throw to be caught by outer catch
        }
        
        console.log("Database function submit_cart_and_create_new completed successfully.");
        // The finally block will now call fetchCart to get the new state.

    } catch (err) {
        // Catch errors from the RPC call or prerequisite checks
        console.error("Error during quote request process (RPC call):", err);
        // Ensure error state is set if not already set by a specific step
        if (!error) { 
             // Use the error message from the caught error if available
             const message = err.message || "An error occurred while processing your quote request.";
             setError(message); 
        }
    } finally {
        console.log("createQuoteRequestRecord: Reached finally block. Preparing to call fetchCart."); // <-- Log before fetchCart
        // ALWAYS try to fetch the latest cart state and ensure loading is false
        console.log("Quote request process finished (or errored). Fetching current cart state...");
        try {
            await fetchCart(); 
        } catch (fetchErr) {
             console.error("Failed to fetch cart state after quote request process:", fetchErr);
             setError(prev => prev || "Failed to refresh cart state."); 
             setIsLoading(false); 
        }
        if (isLoading) { 
             console.warn("Setting loading state to false in finally block safeguard.")
             setIsLoading(false); 
        }
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartListingCount = cartItems.length; // <-- Add count of distinct items

  const value = {
    cart,
    cartItems,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    fetchCart,
    createQuoteRequestRecord,
    cartItemCount,
    cartListingCount, // Add the distinct item count
    // Add other functions like clearCart later
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 