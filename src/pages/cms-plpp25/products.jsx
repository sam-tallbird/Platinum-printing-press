import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import withAdminAuth from '../../components/auth/withAdminAuth';
import { Plus, X, Trash2, Edit, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useLenis } from 'lenis/react'; // Import the hook to access Lenis instance
import { supabase } from '../../lib/supabaseClient'; // Import Supabase client
import toast from 'react-hot-toast'; // Import toast
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique file names
import ConfirmModal from '../../components/Common/ConfirmModal'; // Import ConfirmModal

// Initial state for a single choice (EN/AR)
const initialChoiceState = { en: '', ar: '' };
// Initial state for a single group
const initialGroupState = {
  groupName_en: '',
  groupName_ar: '',
  choices: [initialChoiceState],
};

const NEW_PRODUCT_FORM_DATA_KEY = 'cmsNewProductFormData';
const getEditProductFormKey = (productId) => `cmsEditProductFormData_${productId}`;

const CmsProducts = () => {
  // Replace dummy data with state for products
  const [products, setProducts] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // State for modal visibility and form data
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Updated initial form data state for multiple option groups
  const initialFormData = {
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    available_quantity: 0,
    min_order_quantity: 1,
    is_active: true,
    optionGroups: [initialGroupState], // Start with one group
    imageFiles: [], // Store objects like { id: string, file: File }
    primaryImageId: null, // Add state for primary image ID
  };
  const [newProductData, setNewProductData] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(NEW_PRODUCT_FORM_DATA_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Ensure imageFiles is always an empty array on initial load from localStorage
          // as File objects cannot be reliably persisted. User must re-select.
          return { ...parsedData, imageFiles: [] };
        } catch (e) {
          console.error("Error parsing saved new product data from localStorage", e);
          // Fallback to initialFormData if parsing fails
        }
      }
    }
    return initialFormData;
  });

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Store the original product being edited
  const [editFormData, setEditFormData] = useState(null); // Store form data for editing
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for update
  const [originalEditData, setOriginalEditData] = useState(null); // Store ORIGINAL fetched data for comparison
  // Delete Confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Confirmation modal state
  const [productToDelete, setProductToDelete] = useState(null); // Store full product object {id, name_en, ...} to delete
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete
  const [isFetchingEditData, setIsFetchingEditData] = useState(false); // Loading state for edit modal data

  // Get the Lenis instance
  const lenis = useLenis();

  // Persist newProductData to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Create a shallow copy and remove File objects before saving
        const dataToSave = { ...newProductData, imageFiles: [] };
        localStorage.setItem(NEW_PRODUCT_FORM_DATA_KEY, JSON.stringify(dataToSave));
      }
    }, 500); // Debounce save by 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [newProductData]);

  // Persist editFormData to localStorage
  useEffect(() => {
    if (editFormData && editingProduct?.id) {
      const handler = setTimeout(() => {
        if (typeof window !== 'undefined') {
          // Create a shallow copy and remove new File objects if any
          // Assuming new files might be stored in a field like 'newImageFiles'
          // For now, let's assume editFormData structure is similar to newProductData regarding files.
          // If editFormData.imageFiles contains File objects for new uploads, they need to be cleared.
          // Existing images (URLs) are fine.
          let dataToSave = { ...editFormData };
          if (dataToSave.imageFiles && dataToSave.imageFiles.some(f => f.file instanceof File)) {
            // This clears any newly selected files if they are in 'imageFiles'
            // A more robust solution would differentiate between existing image URLs and new File objects.
            dataToSave = { ...dataToSave, imageFiles: [] };
          }
          // If new files are stored in a different field like 'newlyAddedImageFiles', clear that:
          // if (dataToSave.newlyAddedImageFiles) {
          //   dataToSave = { ...dataToSave, newlyAddedImageFiles: [] };
          // }
          localStorage.setItem(getEditProductFormKey(editingProduct.id), JSON.stringify(dataToSave));
        }
      }, 500); // Debounce save by 500ms

      return () => {
        clearTimeout(handler);
      };
    }
  }, [editFormData, editingProduct?.id]);


  // Modal open/close handlers
  const openModal = () => {
    // newProductData is already initialized from localStorage or initialFormData by its useState
    // If localStorage had data, it's used. If not, initialFormData is used.
    // If we want to ensure it ALWAYS resets to initialFormData OR localStorage if openModal is called again,
    // we could re-set it here, but the current useState initializer should handle the first load.
    // For now, let's rely on the useState initializer.
    // To be absolutely sure it reflects the latest from localStorage or initial (if empty) upon opening:
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(NEW_PRODUCT_FORM_DATA_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setNewProductData({ ...parsedData, imageFiles: [] });
        } catch (e) {
          setNewProductData(initialFormData);
        }
      } else {
        setNewProductData(initialFormData);
      }
    } else {
      setNewProductData(initialFormData);
    }
    lenis?.stop(); // Stop Lenis scrolling when modal opens
    setIsModalOpen(true);
  }
  const closeModal = () => {
    setIsModalOpen(false);
    setNewProductData(initialFormData); // Reset form, which will also update localStorage to clean state via useEffect
    if (typeof window !== 'undefined') { // Also explicitly clear storage for add form
        localStorage.removeItem(NEW_PRODUCT_FORM_DATA_KEY);
    }
    lenis?.start(); // Restart Lenis scrolling when modal closes
  }

  // Ensure Lenis is restarted if component unmounts while modal is open
  useEffect(() => {
    return () => {
      lenis?.start();
    };
  }, [lenis]);

  // --- Fetch Products --- 
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch products and include primary image URL
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name_en,
          description_en,
          min_order_quantity,
          is_active,
          product_images ( image_url, is_primary )
        `)
        // Filtering directly in select might not work for one-to-many like this easily.
        // Instead, select all images and filter client-side or use a view/function.
        // Let's fetch all images and filter client-side for simplicity here.
        .order('created_at', { ascending: false }); // Secondary sort

      if (error) {
        throw error;
      }
      
      // Process data to find primary image URL
      const productsWithImages = (data || []).map(product => {
        const primaryImage = product.product_images?.find(img => img.is_primary);
        return {
          ...product,
          primary_image_url: primaryImage?.image_url || null // Add the URL to the product object
        };
      });

      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(`Failed to fetch products: ${error.message}`);
      setProducts([]); // Clear products on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Handlers for Basic Product Data --- 
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  // --- Handle File Input --- 
  const handleFileChange = (e) => {
    if (e.target.files) {
      // Generate temporary IDs and map files to objects
      const filesWithIds = Array.from(e.target.files).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file: file
      }));
      
      setNewProductData(prev => {
        // Set the first image as primary if no primary is set yet or if previous files are cleared
        const newPrimaryId = (prev.primaryImageId && filesWithIds.some(f => f.id === prev.primaryImageId)) 
                              ? prev.primaryImageId 
                              : (filesWithIds.length > 0 ? filesWithIds[0].id : null);
                              
        return { 
          ...prev, 
          imageFiles: filesWithIds, 
          primaryImageId: newPrimaryId
        };
      });
    } else {
      setNewProductData(prev => ({ ...prev, imageFiles: [], primaryImageId: null })); // Clear files and primary ID
    }
  };

  // --- Handle Primary Image Selection --- 
  const handlePrimaryImageChange = (e) => {
    setNewProductData(prev => ({ ...prev, primaryImageId: e.target.value }));
  };

  // --- Handlers for Multiple Option Groups --- 

  // Add a new group
  const addOptionGroup = () => {
    setNewProductData(prev => ({
      ...prev,
      optionGroups: [...prev.optionGroups, { ...initialGroupState, choices: [initialChoiceState] } ] // Add a fresh group
    }));
  };

  // Remove a group by its index
  const removeOptionGroup = (groupIndex) => {
    setNewProductData(prev => ({
      ...prev,
      optionGroups: prev.optionGroups.filter((_, index) => index !== groupIndex)
    }));
  };

  // Update a group's name (EN or AR)
  const handleOptionGroupNameChange = (groupIndex, lang, value) => {
    setNewProductData(prev => {
      const updatedGroups = prev.optionGroups.map((group, index) => {
        if (index === groupIndex) {
          return { ...group, [`groupName_${lang}`]: value };
        }
        return group;
      });
      return { ...prev, optionGroups: updatedGroups };
    });
  };

  // Update a choice's value (EN or AR) within a specific group
  const handleOptionChoiceChange = (groupIndex, choiceIndex, lang, value) => {
    setNewProductData(prev => {
      const updatedGroups = prev.optionGroups.map((group, gIndex) => {
        if (gIndex === groupIndex) {
          const updatedChoices = group.choices.map((choice, cIndex) => {
            if (cIndex === choiceIndex) {
              return { ...choice, [lang]: value };
            }
            return choice;
          });
          return { ...group, choices: updatedChoices };
        }
        return group;
      });
      return { ...prev, optionGroups: updatedGroups };
    });
  };

  // Add a new choice to a specific group
  const addOptionChoice = (groupIndex) => {
    setNewProductData(prev => {
      const updatedGroups = prev.optionGroups.map((group, index) => {
        if (index === groupIndex) {
          return { ...group, choices: [...group.choices, initialChoiceState] };
        }
        return group;
      });
      return { ...prev, optionGroups: updatedGroups };
    });
  };

  // Remove a choice from a specific group
  const removeOptionChoice = (groupIndex, choiceIndex) => {
    setNewProductData(prev => {
      const updatedGroups = prev.optionGroups.map((group, index) => {
        if (index === groupIndex) {
          return { ...group, choices: group.choices.filter((_, i) => i !== choiceIndex) };
        }
        return group;
      });
      return { ...prev, optionGroups: updatedGroups };
    });
  };

  // Handle removing an image from the Add Product form state
  const handleRemoveImage = (idToRemove) => {
    setNewProductData(prev => {
        const remainingImages = prev.imageFiles.filter(img => img.id !== idToRemove);
        let newPrimaryId = prev.primaryImageId;

        // If the removed image was the primary one, reset primary ID
        if (prev.primaryImageId === idToRemove) {
            newPrimaryId = remainingImages.length > 0 ? remainingImages[0].id : null; // Default to first remaining or null
        }

        return {
            ...prev,
            imageFiles: remainingImages,
            primaryImageId: newPrimaryId
        };
    });
  };

  // Re-added Helper function to extract file path from Supabase storage URL
  const getPathFromUrl = (url) => {
    if (!url) return null;
    try {
      const urlParts = new URL(url);
      // Example URL: https://<project-ref>.supabase.co/storage/v1/object/public/products/image.jpg
      // Path should be 'products/image.jpg' or similar after bucket name
      const pathSegments = urlParts.pathname.split('/');
      const bucketName = 'products'; // Replace with your actual bucket name if different
      const bucketIndex = pathSegments.findIndex(segment => segment === bucketName);
      if (bucketIndex !== -1 && bucketIndex + 1 < pathSegments.length) {
        return pathSegments.slice(bucketIndex + 1).join('/');
      }
      console.warn("Could not reliably determine file path from URL:", url);
      return null;
    } catch (e) {
      console.error("Error parsing storage URL:", e);
      return null;
    }
  };

  // --- Form submission handler (Add Product) ---
  const handleAddProduct = async (e) => { 
    e.preventDefault();
    
    const loadingToast = toast.loading('Adding product...');

    try {
      // 1. Handle Image Uploads
      const uploadedImageData = [];
      let primaryImageUrl = null;
      let primaryImageTempId = newProductData.primaryImageId; // ID from the state { id: string, file: File }

      if (newProductData.imageFiles.length > 0) {
        // Ensure a primary image is selected if files exist
        if (!primaryImageTempId && newProductData.imageFiles.length > 0) {
            primaryImageTempId = newProductData.imageFiles[0].id; // Default to first if none selected
        }

        const uploadPromises = newProductData.imageFiles.map(async (imageFileObj) => {
          const file = imageFileObj.file;
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${fileName}`; // Just the filename, bucket specified below

          const { error: uploadError } = await supabase.storage
            .from('products') // CORRECT BUCKET NAME
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('products') // CORRECT BUCKET NAME
            .getPublicUrl(filePath);
            
          if (!urlData || !urlData.publicUrl) {
             console.warn(`Could not get public URL for ${filePath}. Using path instead.`);
             // Fallback or decide how to handle this - maybe store the path?
             // For now, let's just record the path and a flag indicating it's not a full URL.
             // return { path: filePath, isPrimary: imageFileObj.id === primaryImageTempId, isPublicUrl: false };
             // Or throw an error if public URL is mandatory:
             throw new Error(`Could not get public URL for ${filePath}.`);
          }

          const isPrimary = imageFileObj.id === primaryImageTempId;
          if (isPrimary) {
            primaryImageUrl = urlData.publicUrl;
          }

          return { url: urlData.publicUrl, isPrimary: isPrimary, tempId: imageFileObj.id };
        });

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);
        uploadedImageData.push(...results); 
      }
      // --- End Image Upload ---

      // 2. Prepare Product Data (excluding images and complex options)
      // Ensure we include sort_order and exclude available_quantity if it somehow still exists
      const { 
        imageFiles, 
        primaryImageId, 
        optionGroups, 
        // Destructure known fields explicitly to avoid sending outdated ones
        name_en,
        name_ar,
        description_en,
        description_ar,
        min_order_quantity,
        is_active,
      } = newProductData;

      // Construct the object to insert
      const baseProductData = {
          name_en,
          name_ar,
          description_en,
          description_ar,
          min_order_quantity,
          is_active,
      };

      // 3. Insert into 'products' table
      const { data: insertedProductData, error: productInsertError } = await supabase
        .from('products')
        .insert([baseProductData])
        .select()
        .single(); // Use .single() if inserting one row and want the object back

      if (productInsertError || !insertedProductData) {
        throw new Error(`Failed to insert product: ${productInsertError?.message || 'No data returned'}`);
      }

      const newProductId = insertedProductData.id;

      // 4. Insert into 'product_images' table
      if (uploadedImageData.length > 0) {
          const imageInsertPromises = uploadedImageData.map((imgData, index) => 
              supabase.from('product_images').insert({
                  product_id: newProductId,
                  image_url: imgData.url, // Assuming URL was successfully retrieved
                  is_primary: imgData.isPrimary,
                  sort_order: index // Simple sort order based on upload sequence
              })
          );
          const imageInsertResults = await Promise.all(imageInsertPromises);
          imageInsertResults.forEach(({ error }) => {
              if (error) console.error("Error inserting image record:", error.message); // Log errors but maybe don't stop the whole process?
          });
      }

      // 5. Insert Option Groups and Choices
      const validOptionGroups = newProductData.optionGroups
        .map(group => ({
          ...group,
          choices: group.choices.filter(choice => choice.en.trim() !== '' || choice.ar.trim() !== '')
        }))
        .filter(group => 
          (group.groupName_en.trim() !== '' || group.groupName_ar.trim() !== '') && group.choices.length > 0
        );

      for (const [groupIndex, group] of validOptionGroups.entries()) {
          const { data: insertedGroup, error: groupInsertError } = await supabase
              .from('product_option_groups')
              .insert({ 
                  product_id: newProductId, 
                  name_en: group.groupName_en,
                  name_ar: group.groupName_ar,
                  sort_order: groupIndex
              })
              .select()
              .single();

          if (groupInsertError || !insertedGroup) {
              console.error(`Failed to insert option group '${group.groupName_en}': ${groupInsertError?.message}. Skipping choices.`);
              continue; // Skip choices if group insertion failed
          }

          const newGroupId = insertedGroup.id;

          // Insert choices for this group
          const choiceInsertPromises = group.choices.map((choice, choiceIndex) => 
              supabase.from('product_option_choices').insert({ 
                  group_id: newGroupId, 
                  name_en: choice.en,
                  name_ar: choice.ar,
                  sort_order: choiceIndex
              })
          );
          const choiceInsertResults = await Promise.all(choiceInsertPromises);
          choiceInsertResults.forEach(({ error }) => {
               if (error) console.error(`Error inserting choice '${choice.en}' for group '${group.groupName_en}':`, error.message);
          });
      }
      // --- End Options Insert ---

      toast.success('Product added successfully!', { id: loadingToast });
      closeModal();
      // TODO: Add logic to refresh the product list here if needed
      fetchProducts(); // Refresh the product list

    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(`Error adding product: ${error.message}`, { id: loadingToast });
      // Decide if you want to keep the modal open on error
    }
  };

  // --- Helper to fetch full product details for editing ---
  const fetchFullProductDetails = async (productId) => {
    setIsFetchingEditData(true);
    try {
      // Fetch product, images, and options with nested choices in one go
      const { data: productData, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images ( * ),
          product_option_groups ( *, product_option_choices ( * ) )
        `)
        .eq('id', productId)
        .single(); // Expecting only one product

      if (error) {
        throw new Error(`Failed to fetch product details: ${error.message}`);
      }
      if (!productData) {
         throw new Error('Product not found.');
      }

      // Structure the fetched data for the form
      const structuredData = {
        // Base product fields
        name_en: productData.name_en || '',
        name_ar: productData.name_ar || '',
        description_en: productData.description_en || '',
        description_ar: productData.description_ar || '',
        min_order_quantity: productData.min_order_quantity || 1,
        is_active: productData.is_active !== null ? productData.is_active : true, // Handle potential null
        
        // Images - Map to a structure the form can use
        // We need a way to track existing vs new files later
        imageFiles: (productData.product_images || []).map(img => ({
          id: img.id, // Use the actual image ID from DB as temporary ID
          file: null, // No file object for existing images initially
          url: img.image_url, // URL of the existing image
          isPrimary: img.is_primary,
          sort_order: img.sort_order || 0
          // Add a flag to mark existing? e.g., isExisting: true
        })).sort((a, b) => a.sort_order - b.sort_order), // Sort images

        // Determine primary image ID based on the is_primary flag
        primaryImageId: (productData.product_images || []).find(img => img.is_primary)?.id || null,

        // Option Groups and Choices - Map nested structure
        optionGroups: (productData.product_option_groups || []).map(group => ({
          group_id: group.id, // Keep track of original group ID
          groupName_en: group.name_en || '',
          groupName_ar: group.name_ar || '',
          sort_order: group.sort_order !== null ? group.sort_order : 0, // Keep track of sort order
          choices: (group.product_option_choices || []).map(choice => ({
            choice_id: choice.id, // Keep track of original choice ID
            en: choice.name_en || '',
            ar: choice.name_ar || '',
            sort_order: choice.sort_order !== null ? choice.sort_order : 0 // Keep track of sort order
            // Add a flag to mark existing? e.g., isExisting: true
          })).sort((a, b) => a.sort_order - b.sort_order) // Sort choices within group
        })).sort((a, b) => a.sort_order - b.sort_order) // Sort groups
      };

      // If no option groups fetched, ensure it's an empty array for the form
      if (!structuredData.optionGroups || structuredData.optionGroups.length === 0) {
          structuredData.optionGroups = []; // Or maybe start with one empty group like in add? Depends on desired UX.
      }
      
      // If no images fetched, ensure it's empty
      if (!structuredData.imageFiles) {
        structuredData.imageFiles = [];
        structuredData.primaryImageId = null;
      }

      return structuredData;

    } catch (error) {
      console.error("Error fetching full product details:", error);
      toast.error(`Error loading product data: ${error.message}`);
      return null; // Indicate failure
    } finally {
       setIsFetchingEditData(false);
    }
  };

  // --- Handlers for Edit Modal ---
  const openEditModal = async (product) => {
    console.log("Opening edit modal for product ID:", product.id);
    // Fetch full details first
    const fullProductData = await fetchFullProductDetails(product.id);

    if (fullProductData) {
      // Store the fetched, structured data for the form
      setEditFormData(fullProductData);
      // Store the original raw fetched data (or structured data) for comparison on update?
      // For simplicity now, let's assume editFormData holds the current state for editing
      setEditingProduct(product); // Keep the basic product info for the title, etc.
      setOriginalEditData(JSON.parse(JSON.stringify(fullProductData))); // Store a deep copy for comparison
      
      setIsEditModalOpen(true);
      // lenis?.stop(); // Optional: Stop background scroll
    } else {
       // Error occurred during fetch (toast shown in fetch function)
       console.error("Failed to load data for edit modal.");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditFormData(null);
    // lenis?.start(); // Restart scrolling if needed
  };
  
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct || !editFormData) {
      toast.error("Error: No product data available for update.");
      return;
    }

    setIsUpdating(true);
    const productId = editingProduct.id;
    const loadingToast = toast.loading('Saving changes...');

    try {
      // --- Step 1: Update Base Product Fields --- 
      const baseProductUpdate = {
        name_en: editFormData.name_en,
        name_ar: editFormData.name_ar,
        description_en: editFormData.description_en,
        description_ar: editFormData.description_ar,
        min_order_quantity: editFormData.min_order_quantity,
        is_active: editFormData.is_active
      };

      console.log("Attempting to update product:", productId, baseProductUpdate);

      const { error: productUpdateError } = await supabase
        .from('products')
        .update(baseProductUpdate)
        .eq('id', productId);

      if (productUpdateError) {
        throw new Error(`Failed to update product details: ${productUpdateError.message}`);
      }

      // --- Step 2: Handle Image Updates --- 
      const currentImageFiles = editFormData.imageFiles || [];
      const originalImageFiles = originalEditData.imageFiles || [];

      // 2a. Identify images to delete (in original but not in current)
      const originalImageIds = new Set(originalImageFiles.map(img => img.id));
      const currentImageIds = new Set(currentImageFiles.map(img => img.id));
      const imageIdsToDelete = originalImageFiles
        .filter(img => !currentImageIds.has(img.id))
        .map(img => img.id);

      // 2b. Identify new images to upload (in current and have a 'file' property)
      const imagesToUpload = currentImageFiles.filter(img => img.file && img.isNew);

      // 2c. Handle Deletions
      if (imageIdsToDelete.length > 0) {
        console.log("Deleting image records with IDs:", imageIdsToDelete);
        // Find the full image objects to get URLs for storage deletion
        const imagesToDeleteData = originalImageFiles.filter(img => imageIdsToDelete.includes(img.id));
        const filePathsToDelete = imagesToDeleteData
          .map(img => getPathFromUrl(img.url))
          .filter(path => path !== null);

        if (filePathsToDelete.length > 0) {
          console.log("Deleting files from storage:", filePathsToDelete);
          const { error: storageError } = await supabase.storage
            .from('products') // Use correct bucket name
            .remove(filePathsToDelete);
            
          if (storageError) {
            console.error("Failed to delete some files from storage:", storageError.message); 
            // Optionally throw or just warn
          }
        }
        // Delete from DB
        const { error: dbDeleteError } = await supabase
          .from('product_images')
          .delete()
          .in('id', imageIdsToDelete);
        
        if (dbDeleteError) {
          console.error("Failed to delete image records from DB:", dbDeleteError.message);
          // Optionally throw
        }
      }

      // 2d. Handle Uploads & Insertions
      const uploadedImageData = [];
      if (imagesToUpload.length > 0) {
        console.log("Uploading new images:", imagesToUpload.map(i => i.file.name));
        const uploadPromises = imagesToUpload.map(async (imageFileObj) => {
          const file = imageFileObj.file;
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${fileName}`; 

          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`New image upload failed: ${uploadError.message}`);
          }
          const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);
          if (!urlData || !urlData.publicUrl) {
             throw new Error(`Could not get public URL for new image ${filePath}.`);
          }
          // Return data needed for DB insert
          return { 
              product_id: productId, 
              image_url: urlData.publicUrl,
              is_primary: editFormData.primaryImageId === imageFileObj.id, // Check if this NEW image is the chosen primary
              // TODO: Determine sort order based on final list?
              sort_order: currentImageFiles.findIndex(img => img.id === imageFileObj.id) // Temporary sort order
          };
        });
        const uploadResults = await Promise.all(uploadPromises);
        uploadedImageData.push(...uploadResults);
      }

      // Insert new image records if any were uploaded
      if (uploadedImageData.length > 0) {
          console.log("Inserting new image records:", uploadedImageData);
          const { error: imageInsertError } = await supabase
              .from('product_images')
              .insert(uploadedImageData);
          if (imageInsertError) {
              // Attempt to clean up storage? 
              console.error("Failed to insert new image records:", imageInsertError.message);
              throw new Error(`Failed to save new image records: ${imageInsertError.message}`);
          }
      }

      // 2e. Handle Primary Image Change (if it wasn't a newly uploaded image)
      const newPrimaryId = editFormData.primaryImageId;
      const oldPrimaryId = originalEditData.primaryImageId;
      
      // Check if primary changed AND the new primary is NOT one of the newly uploaded images (those were handled during insert)
      if (newPrimaryId !== oldPrimaryId && !imagesToUpload.some(img => img.id === newPrimaryId)) {
          console.log(`Updating primary image: Old=${oldPrimaryId}, New=${newPrimaryId}`);
          // Update old primary to false (if an old primary existed)
          if (oldPrimaryId) {
              const { error: oldPrimaryError } = await supabase
                  .from('product_images')
                  .update({ is_primary: false })
                  .eq('id', oldPrimaryId);
              if(oldPrimaryError) console.error("Error unsetting old primary image:", oldPrimaryError.message);
          }
          // Update new primary to true (if a new primary is selected)
          if (newPrimaryId) {
              const { error: newPrimaryError } = await supabase
                  .from('product_images')
                  .update({ is_primary: true })
                  .eq('id', newPrimaryId);
              if(newPrimaryError) console.error("Error setting new primary image:", newPrimaryError.message);
          }
      } 
      // --- End Image Updates ---

      // --- Step 3: Handle Option Group/Choice Updates --- 
      const currentOptionGroups = editFormData.optionGroups || [];
      const originalOptionGroups = originalEditData.optionGroups || [];

      const currentGroupIds = new Set(currentOptionGroups.map(g => g.group_id).filter(id => id)); // IDs of groups currently in the form (excluding new ones)
      const originalGroupIds = new Set(originalOptionGroups.map(g => g.group_id));

      const groupIdsToDelete = originalOptionGroups
        .filter(og => !currentGroupIds.has(og.group_id))
        .map(og => og.group_id);

      const groupsToAdd = currentOptionGroups.filter(cg => !cg.group_id); // Groups without an original ID

      const groupsToCheckForUpdates = currentOptionGroups.filter(cg => cg.group_id && originalGroupIds.has(cg.group_id));

      const promises = []; // Collect all DB operation promises

      // 3a. Process Group Deletions
      if (groupIdsToDelete.length > 0) {
          console.log("Deleting groups with IDs:", groupIdsToDelete);
          // Important: Delete choices first (or rely on CASCADE)
          promises.push(supabase.from('product_option_choices').delete().in('group_id', groupIdsToDelete));
          promises.push(supabase.from('product_option_groups').delete().in('id', groupIdsToDelete));
      }

      // 3b. Process Group Additions
      for (const groupToAdd of groupsToAdd) {
          console.log("Adding new group:", groupToAdd.groupName_en);
          promises.push(
              // Insert group, get its new ID, then insert its choices
              supabase.from('product_option_groups').insert({
                  product_id: productId,
                  name_en: groupToAdd.groupName_en,
                  name_ar: groupToAdd.groupName_ar,
                  sort_order: currentOptionGroups.findIndex(g => g === groupToAdd) // Use current index as sort order
              }).select().single().then(({ data: insertedGroup, error: groupError }) => {
                  if (groupError || !insertedGroup) throw new Error(`Failed to insert group: ${groupError?.message}`);
                  const newGroupId = insertedGroup.id;
                  const choicesToInsert = (groupToAdd.choices || []).map((choice, choiceIndex) => ({
                      group_id: newGroupId,
                      name_en: choice.en,
                      name_ar: choice.ar,
                      sort_order: choiceIndex
                  }));
                  if (choicesToInsert.length > 0) {
                      return supabase.from('product_option_choices').insert(choicesToInsert);
                  } // else: no choices to insert for this new group
              })
          );
      }

      // 3c. Process Group Updates & Choice Updates within them
      for (const currentGroup of groupsToCheckForUpdates) {
          const originalGroup = originalOptionGroups.find(og => og.group_id === currentGroup.group_id);
          if (!originalGroup) continue; // Should not happen based on filter, but safety check

          const groupSortOrder = currentOptionGroups.findIndex(g => g.group_id === currentGroup.group_id);

          // Check if group details changed
          if (currentGroup.groupName_en !== originalGroup.groupName_en || 
              currentGroup.groupName_ar !== originalGroup.groupName_ar ||
              groupSortOrder !== originalGroup.sort_order) {
              console.log("Updating group:", currentGroup.group_id);
              promises.push(supabase.from('product_option_groups').update({
                  name_en: currentGroup.groupName_en,
                  name_ar: currentGroup.groupName_ar,
                  sort_order: groupSortOrder
              }).eq('id', currentGroup.group_id));
          }

          // Process choices within this group
          const currentChoices = currentGroup.choices || [];
          const originalChoices = originalGroup.choices || [];
          const currentChoiceIds = new Set(currentChoices.map(c => c.choice_id).filter(id => id));
          const originalChoiceIds = new Set(originalChoices.map(c => c.choice_id));

          const choiceIdsToDelete = originalChoices
              .filter(oc => !currentChoiceIds.has(oc.choice_id))
              .map(oc => oc.choice_id);

          const choicesToAdd = currentChoices.filter(cc => !cc.choice_id); // Choices without an original ID

          const choicesToUpdate = currentChoices.filter(cc => cc.choice_id && originalChoiceIds.has(cc.choice_id));

          // Delete choices for this group
          if (choiceIdsToDelete.length > 0) {
              console.log(`Deleting choices for group ${currentGroup.group_id}:`, choiceIdsToDelete);
              promises.push(supabase.from('product_option_choices').delete().in('id', choiceIdsToDelete));
          }

          // Add new choices for this group
          if (choicesToAdd.length > 0) {
              const newChoiceInserts = choicesToAdd.map((choice, index) => ({
                  group_id: currentGroup.group_id,
                  name_en: choice.en,
                  name_ar: choice.ar,
                  sort_order: currentChoices.findIndex(c => c === choice) // Use overall index within current choices
              }));
              console.log(`Adding choices for group ${currentGroup.group_id}:`, newChoiceInserts);
              promises.push(supabase.from('product_option_choices').insert(newChoiceInserts));
          }

          // Update existing choices for this group
          for (const currentChoice of choicesToUpdate) {
              const originalChoice = originalChoices.find(oc => oc.choice_id === currentChoice.choice_id);
              if (!originalChoice) continue;

              const choiceSortOrder = currentChoices.findIndex(c => c.choice_id === currentChoice.choice_id);

              if (currentChoice.en !== originalChoice.en || 
                  currentChoice.ar !== originalChoice.ar ||
                  choiceSortOrder !== originalChoice.sort_order) {
                  console.log(`Updating choice ${currentChoice.choice_id} for group ${currentGroup.group_id}`);
                  promises.push(supabase.from('product_option_choices').update({
                      name_en: currentChoice.en,
                      name_ar: currentChoice.ar,
                      sort_order: choiceSortOrder
                  }).eq('id', currentChoice.choice_id));
              }
          }
      }

      // Execute all collected DB promises
      await Promise.all(promises).catch(err => {
          // If any DB operation fails, throw an error
          // More granular error handling could be added above
          throw new Error(`Database update failed during options sync: ${err.message}`);
      });

      // --- End Option Group/Choice Updates ---

      toast.success('Product updated successfully!', { id: loadingToast });
      closeEditModal(); // Close modal on success
      fetchProducts(); // Refresh the product list

    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(`Error saving changes: ${error.message}`, { id: loadingToast });
      // Keep modal open on error?
    } finally {
      setIsUpdating(false);
    }
  };
  
  // --- Handlers for Delete ---
  // 1. Initiate Delete Process (opens confirm modal)
  const initiateDeleteProduct = (product) => {
    setProductToDelete(product);
    setIsConfirmModalOpen(true);
  };

  // 2. Close Confirm Modal Handler
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setProductToDelete(null); // Clear the product to delete
  };

  // 3. Function to actually perform deletion (called by ConfirmModal)
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    const productId = productToDelete.id;
    setIsDeleting(true);
    // setProductToDeleteId(productId); // Not needed if using isDeleting flag
    const loadingToast = toast.loading('Deleting product...');

    try {
      // Fetch related image URLs (needed for storage deletion)
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);

      if (imagesError) {
        throw new Error(`Failed to fetch product images: ${imagesError.message}`);
      }

      // Delete images from Storage
      if (images && images.length > 0) {
        const filePaths = images
            .map(img => getPathFromUrl(img.image_url)) // Ensure getPathFromUrl exists or re-add it
            .filter(path => path !== null);
            
        if (filePaths.length > 0) {
          console.log("Attempting to delete files from storage:", filePaths);
          const { error: storageError } = await supabase.storage
            .from('products') // Use correct bucket name
            .remove(filePaths);
            
          if (storageError) {
            console.error("Storage deletion error (proceeding with DB deletion):", storageError.message);
            toast.error(`Failed to delete some images from storage: ${storageError.message}`, { duration: 5000 });
          }
        }
      }

      // Delete from Database (Assuming ON DELETE CASCADE)
      console.log(`Attempting to delete product record with ID: ${productId}`);
      const { error: deleteProductError } = await supabase
        .from('products')
        .delete()
        .match({ id: productId });

      if (deleteProductError) {
        throw new Error(`Database deletion failed: ${deleteProductError.message}`);
      }

      toast.success('Product deleted successfully!', { id: loadingToast });
      fetchProducts(); // Refresh list
      closeConfirmModal(); // Close confirm modal on success

    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(`Failed to delete product: ${error.message}`, { id: loadingToast });
      // Keep modal open on error?
    } finally {
      setIsDeleting(false);
      // productToDelete is cleared by closeConfirmModal if successful
    }
  };

  // Add a new option group to the edit form data
  const handleAddEditOptionGroup = () => {
    setEditFormData(prev => {
        // Ensure prev and prev.optionGroups exist
        if (!prev || !prev.optionGroups) {
            console.error("Cannot add option group: editFormData or optionGroups is null/undefined.");
            // Return previous state or a default state if appropriate
            return prev || { ...initialFormData, optionGroups: [{ ...initialGroupState, choices: [initialChoiceState] }] }; 
        }
        return {
            ...prev,
            // Add a fresh group, ensure choices array is initialized
            optionGroups: [...prev.optionGroups, { ...initialGroupState, choices: [initialChoiceState] }]
        };
    });
  };

  // Handle basic input changes (text, number, checkbox) in Edit Modal
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => {
        if (!prev) return null; // Should not happen if modal is open, but good practice
        return {
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
        };
    });
  };

  // Update an option group's name (EN or AR) in Edit Modal
  const handleEditOptionGroupNameChange = (groupIndex, lang, value) => {
    setEditFormData(prev => {
        if (!prev || !prev.optionGroups) return prev;
        const updatedGroups = prev.optionGroups.map((group, index) => {
            if (index === groupIndex) {
                return { ...group, [`groupName_${lang}`]: value };
            }
            return group;
        });
        return { ...prev, optionGroups: updatedGroups };
    });
  };

  // Update a choice's value (EN or AR) within a specific group in Edit Modal
  const handleEditOptionChoiceChange = (groupIndex, choiceIndex, lang, value) => {
    setEditFormData(prev => {
        if (!prev || !prev.optionGroups) return prev;
        const updatedGroups = prev.optionGroups.map((group, gIndex) => {
            if (gIndex === groupIndex) {
                if (!group.choices) return group; // Safety check for choices array
                const updatedChoices = group.choices.map((choice, cIndex) => {
                    if (cIndex === choiceIndex) {
                        return { ...choice, [lang]: value };
                    }
                    return choice;
                });
                return { ...group, choices: updatedChoices };
            }
            return group;
        });
        return { ...prev, optionGroups: updatedGroups };
    });
  };

  // Remove an option group from the edit form data
  const handleRemoveEditOptionGroup = (groupIndex) => {
    setEditFormData(prev => {
        if (!prev || !prev.optionGroups) return prev;
        // Prevent removing the last group if you always want at least one (optional)
        // if (prev.optionGroups.length <= 1) return prev; 
        return {
            ...prev,
            optionGroups: prev.optionGroups.filter((_, index) => index !== groupIndex)
        };
    });
  };

  // Add a new choice to a specific group in the edit form data
  const handleAddEditOptionChoice = (groupIndex) => {
    setEditFormData(prev => {
        if (!prev || !prev.optionGroups) return prev;
        const updatedGroups = prev.optionGroups.map((group, index) => {
            if (index === groupIndex) {
                // Add a fresh choice, ensure choices array exists
                const newChoices = [...(group.choices || []), initialChoiceState];
                return { ...group, choices: newChoices };
            }
            return group;
        });
        return { ...prev, optionGroups: updatedGroups };
    });
  };

  // Remove a choice from a specific group in the edit form data
  const handleRemoveEditOptionChoice = (groupIndex, choiceIndex) => {
    setEditFormData(prev => {
        if (!prev || !prev.optionGroups) return prev;
        const updatedGroups = prev.optionGroups.map((group, index) => {
            if (index === groupIndex) {
                if (!group.choices || group.choices.length <= 1) return group; // Don't remove last choice
                return { 
                    ...group, 
                    choices: group.choices.filter((_, i) => i !== choiceIndex) 
                };
            }
            return group;
        });
        return { ...prev, optionGroups: updatedGroups };
    });
  };

  // Handle removing an image from the Edit Product form state
  const handleRemoveEditImage = (idToRemove) => {
    setEditFormData(prev => {
        if (!prev) return null;
        const remainingImages = prev.imageFiles.filter(img => img.id !== idToRemove);
        let newPrimaryId = prev.primaryImageId;

        // If the removed image was the primary one, reset primary ID
        if (prev.primaryImageId === idToRemove) {
            newPrimaryId = remainingImages.length > 0 ? remainingImages[0].id : null; // Default to first remaining or null
        }

        // If removing an EXISTING image (has URL, not marked as new), 
        // maybe mark it for deletion instead of filtering? 
        // For now, we filter directly. `handleUpdateProduct` will need to compare 
        // `editFormData.imageFiles` with `originalEditData.imageFiles` to know which *existing* images were removed.
        return {
            ...prev,
            imageFiles: remainingImages, 
            primaryImageId: newPrimaryId
        };
    });
  };

  // Handle file input changes in Edit Modal
  const handleEditFileChange = (e) => {
    if (e.target.files) {
      const filesWithIds = Array.from(e.target.files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`, // Temporary ID for new files
        file: file, // The File object
        url: null, // No URL yet
        isPrimary: false,
        isNew: true // Flag to identify new files
      }));

      setEditFormData(prev => {
          if (!prev) return null;
          // Combine existing images (those without a file object) with new files
          // Filter out any placeholder entries if they exist
          const existingImages = prev.imageFiles.filter(img => img.url && !img.file);
          const combinedImages = [...existingImages, ...filesWithIds];
  
          // Ensure a primary image is still selected if possible
          let newPrimaryId = prev.primaryImageId;
          // If no primary was set, or the previous primary doesn't exist anymore, set a new one
          if (!newPrimaryId || !combinedImages.some(img => img.id === newPrimaryId)) {
              newPrimaryId = combinedImages.length > 0 ? combinedImages[0].id : null; 
          }
          
          return { 
            ...prev, 
            imageFiles: combinedImages, 
            primaryImageId: newPrimaryId // Re-evaluate primary ID
          };
      });
    } 
  };

  // Handle primary image selection change in Edit Modal
  const handleEditPrimaryImageChange = (e) => {
    setEditFormData(prev => {
        if (!prev) return null;
        return { ...prev, primaryImageId: e.target.value };
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Manage Products</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              disabled={isLoading}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
              aria-label="Refresh products"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openModal}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-150"
            >
              <Plus size={20} className="mr-2" />
              Add New Product
            </button>
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading && !products.length && ( // Show only if products array is also empty
          <div className="flex justify-center items-center h-40">
            <p>Loading products...</p>
          </div>
        )}

        {/* Products Table - Removed DragDropContext wrapper */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {/* Removed Drag Handle Header */}
                  {/* Add Image Header */}
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min Qty</th>
                  {/* Removed Sort Order Header */}
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Active</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              {/* Removed Droppable wrapper from tbody */}
              <tbody
                className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                // Removed Droppable props
              >
                {isLoading ? (
                  <tr>
                    {/* Adjusted colSpan for removed columns */}
                    <td colSpan="6" className="px-6 py-20 text-center text-sm text-gray-500 dark:text-gray-400">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    {/* Adjusted colSpan for removed columns */}
                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No products found. Click "Add New Product" to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    // Removed Draggable wrapper
                    <tr
                      key={product.id} // Use key directly on tr
                      className="bg-white dark:bg-gray-800"
                      // Removed Draggable props
                    >
                      {/* Removed Drag Handle Cell */}
                      {/* Image Cell */}
                      <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-16 w-16">
                            {product.primary_image_url ? (
                                <img
                                    className="h-16 w-16 rounded object-cover"
                                    src={product.primary_image_url}
                                    alt={`${product.name_en || 'Product'} image`}
                                />
                            ) : (
                                 <div className="h-16 w-16 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                     <ImageIcon size={24} /> {/* Or placeholder text */}
                                  </div>
                            )}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name_en || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {product.description_en ? (product.description_en.substring(0, 50) + (product.description_en.length > 50 ? '...' : '')) : 'No Description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">{product.min_order_quantity}</td>
                      {/* Removed Sort Order Cell */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                          {product.is_active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-4">
                        <button
                          onClick={() => openEditModal(product)}
                          className="font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isDeleting || isUpdating}
                          aria-label="Edit Product"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => initiateDeleteProduct(product)} // Pass the whole product
                          className="font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isDeleting || isUpdating}
                          aria-label="Delete Product"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {/* Removed provided.placeholder */}
              </tbody>
            </table>
          </div>
        </div>
        {/* Removed DragDropContext closing tag */}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl transform transition-all max-h-[95vh]"> 
            <form onSubmit={handleAddProduct}>
              <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Product</h3>
                  <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={closeModal}><X size={24} /></button>
              </div>

              <div 
                className="p-6 space-y-6 overflow-y-scroll max-h-[calc(95vh-120px)] scroll-smooth" 
                style={{ WebkitOverflowScrolling: 'touch' }} // Add momentum scrolling for touch devices (optional)
                onWheel={(e) => e.stopPropagation()} // Stop wheel event propagation
              >
                <div /* Removed pt-6 border-t */ >
                  <label htmlFor="productImages" className="block text-sm font-medium label-base">Product Images</label>
                  <input 
                    type="file" 
                    id="productImages" 
                    name="productImages" 
                    accept="image/*" 
                    multiple // Allow multiple files
                    onChange={handleFileChange} 
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300
                              hover:file:bg-blue-100 dark:hover:file:bg-blue-900"
                  />
                  {/* Image Previews */} 
                  {newProductData.imageFiles && newProductData.imageFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {newProductData.imageFiles.map((img, index) => (
                        <div key={img.id} className="relative group flex flex-col items-center space-y-1"> {/* Added group for hover effect later? */}
                          {/* Remove Button */} 
                          <button 
                            type="button" 
                            onClick={() => handleRemoveImage(img.id)}
                            className="absolute -top-1 -right-1 z-10 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            aria-label="Remove image"
                          >
                            <X size={12} />
                          </button>
                          <img
                            src={URL.createObjectURL(img.file)}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-md shadow"
                            onLoad={() => URL.revokeObjectURL(img.file)} // Clean up blob URL
                          />
                          {/* Radio button for primary selection */}
                          <div className="flex items-center">
                             <input 
                                type="radio" 
                                id={`primary_${img.id}`}
                                name="primaryImage"
                                value={img.id}
                                checked={newProductData.primaryImageId === img.id}
                                onChange={handlePrimaryImageChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <label htmlFor={`primary_${img.id}`} className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">Primary</label>
                          </div>
                          {/* Optional: Add a remove button per image later */}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Two-column layout for EN/AR fields */} 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Column (English) */} 
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name_en" className="block text-sm font-medium label-base">Name (English) *</label>
                      <input type="text" id="name_en" name="name_en" value={newProductData.name_en} onChange={handleInputChange} required className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"/>
                    </div>
                    <div>
                      <label htmlFor="description_en" className="block text-sm font-medium label-base">Description (English)</label>
                      <textarea id="description_en" name="description_en" rows={4} value={newProductData.description_en} onChange={handleInputChange} className="mt-1 block w-full textarea-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"></textarea>
                    </div>
                  </div>

                  {/* Right Column (Arabic) */} 
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name_ar" className="block text-sm font-medium label-base text-right">الاسم (عربي)</label>
                      <input type="text" id="name_ar" name="name_ar" value={newProductData.name_ar} onChange={handleInputChange} className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3" dir="rtl"/>
                    </div>
                    <div>
                      <label htmlFor="description_ar" className="block text-sm font-medium label-base text-right">الوصف (عربي)</label>
                      <textarea id="description_ar" name="description_ar" rows={4} value={newProductData.description_ar} onChange={handleInputChange} className="mt-1 block w-full textarea-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3" dir="rtl"></textarea>
                    </div>
                  </div>
                </div> 
                {/* End Two-column layout */} 

                {/* --- Other Fields (Modified) --- */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                  <div>
                    <label htmlFor="min_order_quantity" className="block text-sm font-medium label-base">Minimum Order Qty *</label>
                    <input type="number" id="min_order_quantity" name="min_order_quantity" min="1" value={newProductData.min_order_quantity} onChange={handleInputChange} required className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"/>
                  </div>
                  <div className="flex items-center pt-6 md:col-start-2"> {/* Adjust grid positioning if needed */}
                     <input id="is_active" name="is_active" type="checkbox" checked={newProductData.is_active} onChange={handleInputChange} className="h-4 w-4 checkbox-base"/>
                     <label htmlFor="is_active" className="ml-2 block text-sm label-base">Product is Active</label>
                   </div>
                </div>

                {/* --- Multiple Product Options Section --- */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Product Option Groups</h4>

                  {newProductData.optionGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-4 relative">
                       {/* Remove Group Button (only if more than one group) */} 
                       {newProductData.optionGroups.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeOptionGroup(groupIndex)}
                            className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded-full p-1 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                            aria-label="Remove Option Group"
                          >
                            <X size={16} />
                          </button>
                        )}

                      {/* Group Name Inputs */} 
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <label htmlFor={`groupName_en_${groupIndex}`} className="block text-sm font-medium label-base">Group Name {groupIndex + 1} (English)</label>
                          <input type="text" id={`groupName_en_${groupIndex}`} value={group.groupName_en} onChange={(e) => handleOptionGroupNameChange(groupIndex, 'en', e.target.value)} placeholder="e.g., Size" className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"/>
                        </div>
                        <div>
                          <label htmlFor={`groupName_ar_${groupIndex}`} className="block text-sm font-medium label-base text-right">اسم المجموعة {groupIndex + 1} (عربي)</label>
                          <input type="text" id={`groupName_ar_${groupIndex}`} value={group.groupName_ar} onChange={(e) => handleOptionGroupNameChange(groupIndex, 'ar', e.target.value)} placeholder="e.g., المقاس" className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3" dir="rtl"/>
                        </div>
                      </div>

                       {/* Choices for this Group */} 
                       <div className="pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                        <label className="block text-sm font-medium label-base">Choices for Group {groupIndex + 1}</label>
                        
                        {group.choices.map((choice, choiceIndex) => (
                           <div key={choiceIndex} className="flex items-center space-x-3">
                              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                  <div>
                                      <input 
                                          type="text" 
                                          id={`choice_en_${groupIndex}_${choiceIndex}`}
                                          value={choice.en}
                                          onChange={(e) => handleOptionChoiceChange(groupIndex, choiceIndex, 'en', e.target.value)}
                                          placeholder={`Choice ${choiceIndex + 1} (En)`}
                                          className="block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"
                                      />
                                  </div>
                                  <div>
                                      <input 
                                          type="text" 
                                          id={`choice_ar_${groupIndex}_${choiceIndex}`}
                                          value={choice.ar}
                                          onChange={(e) => handleOptionChoiceChange(groupIndex, choiceIndex, 'ar', e.target.value)}
                                          placeholder={`الاختيار ${choiceIndex + 1} (عربي)`}
                                          className="block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3" dir="rtl"
                                      />
                                  </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeOptionChoice(groupIndex, choiceIndex)}
                                className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0 self-center disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Remove Choice"
                                disabled={group.choices.length <= 1} 
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addOptionChoice(groupIndex)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          <Plus size={16} className="mr-1"/> Add Choice to Group {groupIndex + 1}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Group Button */}
                   <button 
                      type="button" 
                      onClick={addOptionGroup}
                      className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                       <Plus size={16} className="mr-2"/> Add Another Option Group
                    </button>
                </div> 
                 {/* --- End Product Options Section --- */} 
              </div>

              {/* Sticky Footer */} 
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 z-10 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */} 
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh]">
                <form onSubmit={handleUpdateProduct}> { /* Changed handler */ }
                    <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Product {editingProduct ? `(${editingProduct.name_en})` : ''}</h3>
                        <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={closeEditModal}><X size={24} /></button>
                    </div>

                    {/* Modal Body - Populate with form, bind to editFormData */} 
                    <div 
                        className="p-6 space-y-6 overflow-y-scroll max-h-[calc(95vh-120px)] scroll-smooth"
                        style={{ WebkitOverflowScrolling: 'touch' }} // Add momentum scrolling for touch devices
                        onWheel={(e) => e.stopPropagation()} // Add wheel event stopper
                    >
                        {isFetchingEditData ? (
                            <div className="flex justify-center items-center h-40">
                                <p>Loading product data...</p> {/* TODO: Add a spinner */} 
                            </div>
                        ) : !editFormData ? (
                            <div className="flex justify-center items-center h-40">
                                <p className="text-red-600">Could not load product data.</p>
                            </div>
                        ) : (
                            <> {/* Use Fragment to group form sections */} 
                                {/* --- Product Images Upload --- */} 
                                <div>
                                    <label htmlFor="editProductImages" className="block text-sm font-medium label-base">Product Images</label>
                                    <input
                                        type="file"
                                        id="editProductImages"
                                        name="editProductImages"
                                        accept="image/*"
                                        multiple
                                        onChange={handleEditFileChange} // Attach handler
                                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300
                                                hover:file:bg-blue-100 dark:hover:file:bg-blue-900"
                                    />
                                    {/* Image Previews */} 
                                    {editFormData.imageFiles && editFormData.imageFiles.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                            {editFormData.imageFiles.map((img, index) => (
                                                <div key={img.id} className="relative group flex flex-col items-center space-y-1">
                                                    {/* Remove Button */} 
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveEditImage(img.id)}
                                                        className="absolute -top-1 -right-1 z-10 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                                        aria-label="Remove image"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    <img
                                                        src={img.url ? img.url : (img.file ? URL.createObjectURL(img.file) : '/placeholder.png')} 
                                                        alt={`Preview ${index + 1}`}
                                                        className="h-24 w-24 object-cover rounded-md shadow"
                                                        onLoad={() => { if (img.file) URL.revokeObjectURL(img.file); }} // Clean up blob URL only for new files
                                                        onError={(e) => { e.target.src = '/placeholder.png'; }} // Handle broken image links
                                                    />
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            id={`edit_primary_${img.id}`}
                                                            name="editPrimaryImage"
                                                            value={img.id}
                                                            checked={editFormData.primaryImageId === img.id}
                                                            onChange={handleEditPrimaryImageChange} // Attach handler
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                        />
                                                        <label htmlFor={`edit_primary_${img.id}`} className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">Primary</label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Two-column layout for EN/AR fields */} 
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Left Column (English) */} 
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="edit_name_en" className="block text-sm font-medium label-base">Name (English) *</label>
                                            <input type="text" id="edit_name_en" name="name_en" value={editFormData.name_en} 
                                                   // TODO: Create and use handleEditInputChange
                                                   onChange={handleEditInputChange} // Attach handler
                                                   required className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"/>
                                        </div>
                                        <div>
                                            <label htmlFor="edit_description_en" className="block text-sm font-medium label-base">Description (English)</label>
                                            <textarea id="edit_description_en" name="description_en" rows={4} value={editFormData.description_en} 
                                                      // onChange={handleEditInputChange} 
                                                      onChange={handleEditInputChange} // Attach handler
                                                      className="mt-1 block w-full textarea-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"></textarea>
                                        </div>
                                    </div>
                                    {/* Right Column (Arabic) */} 
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="edit_name_ar" className="block text-sm font-medium label-base text-right">الاسم (عربي)</label>
                                            <input type="text" id="edit_name_ar" name="name_ar" value={editFormData.name_ar} 
                                                   // onChange={handleEditInputChange} 
                                                   onChange={handleEditInputChange} // Attach handler
                                                   className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3" dir="rtl"/>
                                        </div>
                                        <div>
                                            <label htmlFor="edit_description_ar" className="block text-sm font-medium label-base text-right">الوصف (عربي)</label>
                                            <textarea id="edit_description_ar" name="description_ar" rows={4} value={editFormData.description_ar} 
                                                      // onChange={handleEditInputChange} 
                                                      onChange={handleEditInputChange} // Attach handler
                                                      className="mt-1 block w-full textarea-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3" dir="rtl"></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Other Fields */} 
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                    <div>
                                        <label htmlFor="edit_min_order_quantity" className="block text-sm font-medium label-base">Minimum Order Qty *</label>
                                        <input type="number" id="edit_min_order_quantity" name="min_order_quantity" min="1" value={editFormData.min_order_quantity} 
                                               // onChange={handleEditInputChange} 
                                               onChange={handleEditInputChange} // Attach handler
                                               required className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"/>
                                    </div>
                                    <div className="flex items-center pt-6 md:col-start-2"> {/* Adjust grid positioning if needed */}
                                        <input id="edit_is_active" name="is_active" type="checkbox" checked={editFormData.is_active}
                                               // onChange={handleEditInputChange}
                                               onChange={handleEditInputChange} // Attach handler
                                               className="h-4 w-4 checkbox-base rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-600 dark:ring-offset-gray-800"/>
                                        <label htmlFor="edit_is_active" className="ml-2 block text-sm label-base font-medium text-gray-700 dark:text-gray-300">Product is Active</label> {/* Added label classes */}
                                    </div>
                                </div>

                                {/* Multiple Product Options Section */} 
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Product Option Groups</h4>
                                    {/* Map over editFormData.optionGroups */} 
                                    {(editFormData.optionGroups || []).map((group, groupIndex) => (
                                        <div key={group.group_id || `new-${groupIndex}`} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-4 relative">
                                             {/* Remove Group Button (only if more than one group, needs handler) */} 
                                            {editFormData.optionGroups.length > 1 && (
                                                <button type="button" 
                                                        onClick={() => handleRemoveEditOptionGroup(groupIndex)} // Attach handler
                                                        className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded-full p-1 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                                                        aria-label="Remove Option Group"
                                                       >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            {/* Group Name Inputs */} 
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                                <div>
                                                    <label htmlFor={`edit_groupName_en_${groupIndex}`} className="block text-sm font-medium label-base">Group Name {groupIndex + 1} (English)</label>
                                                    <input type="text" id={`edit_groupName_en_${groupIndex}`} value={group.groupName_en} 
                                                           // TODO: Create and use handleEditOptionGroupNameChange
                                                           onChange={(e) => handleEditOptionGroupNameChange(groupIndex, 'en', e.target.value)} // Attach handler
                                                           placeholder="e.g., Size" className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"/>
                                                </div>
                                                <div>
                                                    <label htmlFor={`edit_groupName_ar_${groupIndex}`} className="block text-sm font-medium label-base text-right">اسم المجموعة {groupIndex + 1} (عربي)</label>
                                                    <input type="text" id={`edit_groupName_ar_${groupIndex}`} value={group.groupName_ar} 
                                                           // onChange={(e) => handleEditOptionGroupNameChange(groupIndex, 'ar', e.target.value)} 
                                                           onChange={(e) => handleEditOptionGroupNameChange(groupIndex, 'ar', e.target.value)} // Attach handler
                                                           placeholder="e.g., المقاس" className="mt-1 block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3" dir="rtl"/>
                                                </div>
                                            </div>
                                            {/* Choices for this Group */} 
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                                                <label className="block text-sm font-medium label-base">Choices for Group {groupIndex + 1}</label>
                                                {/* Map over group.choices */} 
                                                {(group.choices || []).map((choice, choiceIndex) => (
                                                    <div key={choice.choice_id || `new-${groupIndex}-${choiceIndex}`} className="flex items-center space-x-3">
                                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                            <div>
                                                                <input type="text" id={`edit_choice_en_${groupIndex}_${choiceIndex}`} value={choice.en}
                                                                       // TODO: Create and use handleEditOptionChoiceChange
                                                                       onChange={(e) => handleEditOptionChoiceChange(groupIndex, choiceIndex, 'en', e.target.value)} // Attach handler
                                                                       placeholder={`Choice ${choiceIndex + 1} (En)`} className="block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3"/>
                                                            </div>
                                                            <div>
                                                                <input type="text" id={`edit_choice_ar_${groupIndex}_${choiceIndex}`} value={choice.ar}
                                                                       // onChange={(e) => handleEditOptionChoiceChange(groupIndex, choiceIndex, 'ar', e.target.value)}
                                                                       onChange={(e) => handleEditOptionChoiceChange(groupIndex, choiceIndex, 'ar', e.target.value)} // Attach handler
                                                                       placeholder={`الاختيار ${choiceIndex + 1} (عربي)`} className="block w-full input-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white px-3" dir="rtl"/>
                                                            </div>
                                                        </div>
                                                        {/* Remove Choice Button (needs handler) */} 
                                                        <button type="button" 
                                                                onClick={() => handleRemoveEditOptionChoice(groupIndex, choiceIndex)} // Attach handler
                                                                className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0 self-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                                aria-label="Remove Choice"
                                                                disabled={group.choices.length <= 1}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {/* Add Choice Button (needs handler) */} 
                                                <button type="button" 
                                                        onClick={() => handleAddEditOptionChoice(groupIndex)} // Attach handler
                                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                       >
                                                    <Plus size={16} className="mr-1"/> Add Choice to Group {groupIndex + 1}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Add Group Button */} 
                                    <button type="button" 
                                            onClick={handleAddEditOptionGroup}
                                            className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Plus size={16} className="mr-2"/> Add Another Option Group
                                    </button>
                                </div>
                            </> 
                        )}
                    </div>

                    {/* Modal Footer */} 
                    <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 z-10 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
                        <button type="button" className="btn btn-secondary" onClick={closeEditModal} disabled={isUpdating || isFetchingEditData}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isUpdating || isFetchingEditData || !editFormData}>
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */} 
      <ConfirmModal 
         isOpen={isConfirmModalOpen}
         onClose={closeConfirmModal}
         onConfirm={confirmDeleteProduct}
         isLoading={isDeleting}
         title="Confirm Product Deletion"
         message={`Are you sure you want to delete the product "${productToDelete?.name_en || ''}"? This will also delete all associated images and options. This action cannot be undone.`}
      />

    </AdminLayout>
  );
};

// Add base input styles if not already global - consider moving to a CSS file or globals
// <style jsx global>{`
//  .input-base { padding: 0.5rem 0.75rem; border: 1px solid; border-color: #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); width: 100%; }
//  .dark .input-base { border-color: #4B5563; background-color: #374151; color: white; }
//  .input-base:focus { outline: none; ring: 2px; ring-offset: 2px; ring-color: #4F46E5; border-color: #4F46E5; }
//  .textarea-base { /* Similar styling for textarea */ }
//  .checkbox-base { /* Similar styling for checkbox */ }
//  .label-base { /* Similar styling for label */ }
// `}</style>

export default withAdminAuth(CmsProducts); 