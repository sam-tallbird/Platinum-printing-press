import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import withAdminAuth from '../../components/auth/withAdminAuth';
import { Plus, X, RefreshCw, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/Common/ConfirmModal';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Initial state for the new work form
const initialWorkData = {
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  imageFile: null, // To store the selected image file
};

const NEW_WORK_FORM_DATA_KEY = 'cmsNewWorkFormData';
const getEditWorkFormKey = (workId) => `cmsEditWorkFormData_${workId}`;

const CmsOurWork = () => {
  // --- UPDATED State --- 
  const [works, setWorks] = useState([]); // Initialize with empty array
  const [isFetching, setIsFetching] = useState(true); // Loading state for fetching
  const [fetchError, setFetchError] = useState(null);
  
  const [isAddWorkModalOpen, setIsAddWorkModalOpen] = useState(false);
  const [newWorkData, setNewWorkData] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(NEW_WORK_FORM_DATA_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Ensure imageFile is always null on initial load from localStorage
          return { ...parsedData, imageFile: null };
        } catch (e) {
          console.error("Error parsing saved new work data from localStorage", e);
        }
      }
    }
    return initialWorkData;
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isLoading
  const [submitError, setSubmitError] = useState(null); // Renamed from error
  const [deletingId, setDeletingId] = useState(null); // Track which item is being deleted
  // --- NEW States for Confirmation Modal ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Store { id, imageUrl }
  const [isDeleting, setIsDeleting] = useState(false); // Specific loading state for delete
  // --- NEW States for Editing ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState(null); // Store the full original item being edited
  const [editFormData, setEditFormData] = useState(null);      // Store the form data for editing
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Persist newWorkData to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const dataToSave = { ...newWorkData, imageFile: null }; // Exclude File object
        localStorage.setItem(NEW_WORK_FORM_DATA_KEY, JSON.stringify(dataToSave));
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [newWorkData]);

  // Persist editFormData to localStorage
  useEffect(() => {
    if (editFormData && editingWorkItem?.id) {
      const handler = setTimeout(() => {
        if (typeof window !== 'undefined') {
          // Exclude File object if editFormData can contain a new imageFile
          const dataToSave = { ...editFormData, imageFile: null }; 
          localStorage.setItem(getEditWorkFormKey(editingWorkItem.id), JSON.stringify(dataToSave));
        }
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [editFormData, editingWorkItem?.id]);

  // --- Fetch Works Function --- 
  const fetchWorks = async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('sort_order', { ascending: true }); // Order by sort_order

      if (error) {
        throw error;
      }
      setWorks(data || []); // Set data or empty array if null
    } catch (err) {
      console.error("Error fetching works:", err);
      setFetchError(err.message || 'Could not fetch work items.');
      setWorks([]); // Clear works on error
      toast.error("Failed to load work items.");
    } finally {
      setIsFetching(false);
    }
  };

  // --- Fetch Works on Mount ---
  useEffect(() => {
    fetchWorks();
  }, []); // Empty dependency array means run once on mount

  // Modal open/close handlers
  const openAddWorkModal = () => {
    // setNewWorkData(initialWorkData); // State is now initialized from localStorage or initialWorkData by useState
    // Ensure it reflects latest from localStorage or initial if key was cleared
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(NEW_WORK_FORM_DATA_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setNewWorkData({ ...parsedData, imageFile: null });
        } catch (e) {
          setNewWorkData(initialWorkData);
        }
      } else {
        setNewWorkData(initialWorkData);
      }
    } else {
      setNewWorkData(initialWorkData);
    }
    setSubmitError(null); // Clear previous submit errors
    setIsAddWorkModalOpen(true);
  };
  const closeAddWorkModal = () => {
    setIsAddWorkModalOpen(false);
    setNewWorkData(initialWorkData); // Reset form
    if (typeof window !== 'undefined') {
      localStorage.removeItem(NEW_WORK_FORM_DATA_KEY); // Explicitly clear storage
    }
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorkData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewWorkData(prev => ({ ...prev, imageFile: e.target.files[0] }));
    } else {
       setNewWorkData(prev => ({ ...prev, imageFile: null })); // Handle file removal
    }
  };

  // Handle form submission
  const handleAddWork = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    if (!newWorkData.imageFile) {
      setSubmitError('Image file is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      // --- DEBUG: Log session/token metadata before storage operation --- 
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session App Metadata before storage upload:', session?.user?.app_metadata);
      // --- END DEBUG --- 

      // 1. Upload Image
      const file = newWorkData.imageFile;
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const uploadPromise = supabase.storage
        .from('works') // Use the 'works' bucket
        .upload(filePath, file);
        
toast.promise(
        uploadPromise,
        {
            loading: 'Uploading image...',
            // Success/error will be handled after getting URL and inserting
            success: 'Image uploaded! Saving work details...',
            error: 'Failed to upload image.',
        }
        );

      const { data: uploadData, error: uploadError } = await uploadPromise;

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('works')
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Could not get image public URL.');
      }
      const imageUrl = urlData.publicUrl;

      // 3. Prepare Data for Insert (match schema)
      const workToInsert = {
        title_en: newWorkData.title_en,
        title_ar: newWorkData.title_ar || null, // Handle optional fields
        description_en: newWorkData.description_en || null,
        description_ar: newWorkData.description_ar || null,
        image_url: imageUrl,
        // sort_order defaults to 0 in the DB
      };

      // --- DEBUG: Log current user before insert ---
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User attempting insert:', user);
      // --- END DEBUG ---

      // 4. Insert into DB
      const { error: insertError } = await supabase
        .from('works')
        .insert([workToInsert]);

      if (insertError) {
        // Attempt to remove uploaded file if DB insert fails
        await supabase.storage.from('works').remove([filePath]);
        throw insertError;
      }

      toast.success('Work item added successfully!');
      // TODO: Add logic to refresh the displayed works list
      closeAddWorkModal();
      await fetchWorks(); // <-- Refresh the list after successful add
      if (typeof window !== 'undefined') {
        localStorage.removeItem(NEW_WORK_FORM_DATA_KEY);
      }

    } catch (err) {
      console.error("Error adding work:", err);
      setSubmitError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to add work item.'); // Show specific error in toast
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MODIFIED: Initiate Delete Process (opens confirm modal) ---
  const initiateDeleteWork = (workItemId, imageUrl) => {
    setItemToDelete({ id: workItemId, imageUrl });
    setIsConfirmModalOpen(true);
  };

  // --- Function to actually perform deletion (called by ConfirmModal) ---
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    let filePath = null;

    try {
      // 1. Attempt to delete Storage object
      if (itemToDelete.imageUrl) {
         try {
           const urlParts = itemToDelete.imageUrl.split('/works/');
           if (urlParts.length > 1) {
             filePath = urlParts[1].split('?')[0]; 
             if (filePath) {
                 const { error: storageError } = await supabase.storage.from('works').remove([filePath]);
                 if (storageError) {
                    console.warn("Could not delete file from storage:", storageError.message);
                    toast.error(`Could not delete image file: ${storageError.message}.`);
                    // Stop if storage fails?
                 }
             }
           }
        } catch (storageErr) {
            console.warn("Error during storage deletion:", storageErr);
            toast.error('An error occurred trying to delete the image file.');
        }
      }

      // 2. Delete from Database
      const { error: dbError } = await supabase
        .from('works')
        .delete()
        .match({ id: itemToDelete.id });

      if (dbError) {
        throw dbError;
      }

      toast.success('Work item deleted successfully!');
      fetchWorks(); // Refresh list
      setIsConfirmModalOpen(false); // Close confirm modal on success
      setItemToDelete(null);
      
    } catch (err) {
      console.error("Error deleting work:", err);
      toast.error(err.message || 'Failed to delete work item.');
      // Keep modal open on error?
    } finally {
      setIsDeleting(false); // Reset loading state
    }
  };

  // --- Close Confirm Modal Handler ---
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setItemToDelete(null);
  }

  // --- Edit Modal Handlers ---
  const openEditModal = (workItem) => {
    setEditingWorkItem(workItem);
    // Initial form data based on the work item
    let initialEditData = {
      title_en: workItem.title_en || '',
      title_ar: workItem.title_ar || '',
      description_en: workItem.description_en || '',
      description_ar: workItem.description_ar || '',
      imageFile: null, // For a new image, if user wants to change it
      // Keep existing image_url to display until a new one is chosen
      existing_image_url: workItem.image_url 
    };

    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(getEditWorkFormKey(workItem.id));
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Merge, prioritizing saved data but ensuring imageFile is null
          initialEditData = { ...initialEditData, ...parsedData, imageFile: null };
        } catch (e) {
          console.error(`Error parsing saved edit data for work ${workItem.id}`, e);
        }
      }
    }
    setEditFormData(initialEditData);
    setUpdateError(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingWorkItem(null);
    setEditFormData(null);
    if (editingWorkItem && typeof window !== 'undefined') {
      localStorage.removeItem(getEditWorkFormKey(editingWorkItem.id));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditFormData(prev => ({ ...prev, imageFile: e.target.files[0] }));
    } else {
      setEditFormData(prev => ({ ...prev, imageFile: null })); // Allow deselecting
    }
  };

  // --- Handle Update Work --- 
  const handleUpdateWork = async (e) => {
    e.preventDefault();
    if (!editingWorkItem || !editFormData) return;

    setUpdateError(null);
    setIsUpdating(true);

    let newImageUrl = editingWorkItem.image_url; // Start with the original image URL
    let newFilePath = null; // Track new file path if uploaded
    const oldImageUrl = editingWorkItem.image_url; // Keep track of the old URL

    try {
      // 1. Handle Image Replacement (if a new file is selected)
      if (editFormData.imageFile) {
        const file = editFormData.imageFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        newFilePath = `${fileName}`; // Store new path

        // Upload the new image
        const uploadPromise = supabase.storage
          .from('works')
          .upload(newFilePath, file);
        
toast.promise(uploadPromise, {
            loading: 'Uploading new image...',
            success: 'New image uploaded!',
            error: 'Failed to upload new image.',
        });

        const { error: uploadError } = await uploadPromise;
        if (uploadError) throw uploadError;

        // Get the new public URL
        const { data: urlData } = supabase.storage.from('works').getPublicUrl(newFilePath);
        if (!urlData || !urlData.publicUrl) throw new Error('Could not get new image public URL.');
        newImageUrl = urlData.publicUrl; // Set the URL for DB update
      }

      // 2. Prepare Data for DB Update
      const workToUpdate = {
        title_en: editFormData.title_en,
        title_ar: editFormData.title_ar || null,
        description_en: editFormData.description_en || null,
        description_ar: editFormData.description_ar || null,
        image_url: newImageUrl, // Use the potentially new URL
      };

      // 3. Update Database Record
      const { error: updateError } = await supabase
        .from('works')
        .update(workToUpdate)
        .match({ id: editingWorkItem.id });

      if (updateError) throw updateError;

      // 4. Delete Old Image from Storage (if a new one was successfully uploaded and DB updated)
      if (newFilePath && oldImageUrl) {
          try {
             const oldUrlParts = oldImageUrl.split('/works/');
             if (oldUrlParts.length > 1) {
               const oldFilePath = oldUrlParts[1].split('?')[0];
               if (oldFilePath && oldFilePath !== newFilePath) { // Don't delete if somehow the same path
                   console.log("Deleting old file from storage:", oldFilePath);
                   await supabase.storage.from('works').remove([oldFilePath]); 
                   // Log success/failure of old file deletion? Optional.
               }
             }
          } catch (deleteError) {
              console.warn("Could not delete old image file:", deleteError.message);
              // Non-critical, maybe just log it.
          }
      }

      toast.success('Work item updated successfully!');
      closeEditModal();
      await fetchWorks(); // Refresh the list
      if (editingWorkItem && typeof window !== 'undefined') {
        localStorage.removeItem(getEditWorkFormKey(editingWorkItem.id));
      }
    } catch (err) {
      console.error("Error updating work:", err);
      setUpdateError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Failed to update work item.');

      // Optional: Attempt to delete newly uploaded file if DB update failed
      if (newFilePath && err !== editFormData.imageFile) { // Avoid deleting if the error was the upload itself
          console.warn("DB update failed, attempting to remove newly uploaded file:", newFilePath);
          await supabase.storage.from('works').remove([newFilePath]);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Drag and Drop Handler ---
  const onDragEnd = async (result) => {
    const { source, destination } = result;

    // Dropped outside the list or in the same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Optimistically update local state
    const items = Array.from(works);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    
    // Update the local state immediately for smooth UI
    setWorks(items);

    // Prepare updates for the database
    const updates = items.map((item, index) => ({
        id: item.id,
        sort_order: index // New sort order based on array index
    }));

    // Update sort_order in Supabase
    // Note: This updates rows one by one. For better performance/atomicity on large lists,
    // consider an RPC function later.
    try {
        const updatePromises = updates.map(update =>
            supabase.from('works').update({ sort_order: update.sort_order }).match({ id: update.id })
        );
        
        // Show initial toast
        const promise = Promise.all(updatePromises);
        toast.promise(promise, {
            loading: 'Saving new order...',
            success: 'Order saved successfully!',
            error: 'Failed to save order.',
        });

        await promise; // Wait for all updates to complete
        
        // Optional: Refetch to ensure consistency, though optimistic update is usually sufficient
        // await fetchWorks(); 

    } catch (err) {
        console.error("Error updating sort order:", err);
        // Revert optimistic update on error?
        // For simplicity, we'll just show an error and potentially refetch
        toast.error('Failed to save new order.');
        await fetchWorks(); // Refetch to get correct state back from DB
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Manage Our Work</h1>
           {/* Add Refresh Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchWorks} 
              disabled={isFetching}
              className={`py-2 px-4 rounded-lg transition duration-150 ease-in-out ${isFetching ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
              aria-label="Refresh Work Items"
            >
              <RefreshCw size={20} className={isFetching ? 'animate-spin' : ''} />
            </button>
             <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out"
              onClick={openAddWorkModal}
            >
              <Plus size={20} className="mr-2"/>
              Add New Work
            </button>
          </div>
        </div>

        {/* Our Work Table - Wrapped with DragDropContext */}
        <DragDropContext onDragEnd={onDragEnd}>
           <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {/* Note: react-beautiful-dnd works best without a real <table> structure sometimes. */}
              {/* We might need refactoring if issues arise, but let's try with table first. */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                 <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {/* Added empty header for Drag Handle column */}
                    <th scope="col" className="w-12 px-4 py-3"></th> 
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                {/* Droppable wraps tbody */}
                <Droppable droppableId="worksDroppable">
                  {(provided) => (
                    <tbody
                      className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {isFetching ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-20 text-center text-sm text-gray-500 dark:text-gray-400">
                            Loading work items...
                          </td>
                        </tr>
                      ) : fetchError ? (
                         <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-sm text-red-500 dark:text-red-400">
                            Error: {fetchError}
                          </td>
                        </tr>
                      ) : works.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            No work items found. Click "Add New Work" to create one.
                          </td>
                        </tr>
                      ) : (
                        works.map((work, index) => (
                          <Draggable key={work.id} draggableId={work.id} index={index}>
                            {(providedDraggable) => (
                              <tr
                                ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps}
                                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                {/* Drag Handle Cell */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                                  <div {...providedDraggable.dragHandleProps} title="Drag to reorder">
                                    <GripVertical size={20} />
                                  </div>
                                </td>
                                {/* Image Cell - Corrected Position */}
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex-shrink-0 h-16 w-24"> {/* Wider for potentially landscape images */}
                                    {work.image_url ? (
                                      <img
                                        className="h-16 w-24 rounded object-cover" // Maintain aspect ratio
                                        src={work.image_url}
                                        alt={work.title_en || 'Work item image'}
                                      />
                                    ) : (
                                      <div className="h-16 w-24 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                        {/* Placeholder or Icon */}
                                        <span className="text-xs">No Image</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                {/* Title Cell - Corrected Position */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {work.title_en || '-'} 
                                  {work.title_ar && <span className="block text-xs text-gray-500 dark:text-gray-400" dir="rtl">{work.title_ar}</span>}
                                </td>
                                {/* Description Cell - Corrected Position */}
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                   {/* Display truncated EN description, optionally show AR below */}
                                   <div>{work.description_en ? (work.description_en.substring(0, 50) + (work.description_en.length > 50 ? '...' : '')) : '-'}</div>
                                   {work.description_ar && <div className="text-xs text-gray-500 dark:text-gray-400 pt-1" dir="rtl">{work.description_ar.substring(0, 50) + (work.description_ar.length > 50 ? '...' : '')}</div>}
                                </td>
                                {/* Actions Cell - Corrected Position */}
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-4">
                                  <button
                                    onClick={() => openEditModal(work)} // Pass the whole work item
                                    className="font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isDeleting || isUpdating}
                                    aria-label="Edit Work Item"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => initiateDeleteWork(work.id, work.image_url)} // Pass ID and imageUrl
                                    className="font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isDeleting || isUpdating}
                                    aria-label="Delete Work Item"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </table>
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Add Work Modal - UPDATED State Names */}
      {isAddWorkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all"> 
            <form onSubmit={handleAddWork}>
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Work</h3>
                <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={closeAddWorkModal}><X size={24} /></button>
              </div>

              {/* Modal Body - UPDATED State Names */}
              <div className="p-6 space-y-6">
                {/* Image Upload */} 
                <div>
                  <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image *</label>
                  <input 
                    type="file" 
                    id="imageFile" 
                    name="imageFile" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    required 
                    disabled={isSubmitting} // Use isSubmitting
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300
                               hover:file:bg-blue-100 dark:hover:file:bg-blue-900
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                   {/* Optional: Image preview */}
                  {newWorkData.imageFile && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(newWorkData.imageFile)} 
                        alt="Preview" 
                        className="h-20 w-auto rounded" 
                        onLoad={() => URL.revokeObjectURL(newWorkData.imageFile)} // Clean up blob URL
                      />
                    </div>
                  )}
                </div>

                {/* EN/AR Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                   {/* Left Column (English) */}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title (English) *</label>
                      <input type="text" id="title_en" name="title_en" value={newWorkData.title_en} onChange={handleInputChange} required disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"/>
                    </div>
                    <div>
                      <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (English)</label>
                      <textarea id="description_en" name="description_en" rows={4} value={newWorkData.description_en} onChange={handleInputChange} disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"></textarea>
                    </div>
                  </div>
                   {/* Right Column (Arabic) */}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right">العنوان (عربي)</label>
                      <input type="text" id="title_ar" name="title_ar" value={newWorkData.title_ar} onChange={handleInputChange} disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed" dir="rtl"/>
                    </div>
                    <div>
                      <label htmlFor="description_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right">الوصف (عربي)</label>
                      <textarea id="description_ar" name="description_ar" rows={4} value={newWorkData.description_ar} onChange={handleInputChange} disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed" dir="rtl"></textarea>
                    </div>
                  </div>
                </div>
                {/* Display Submit Error Message */}
                {submitError && (
                    <p className="text-sm text-red-600 dark:text-red-400">Error: {submitError}</p>
                )}
              </div>

              {/* Modal Footer - UPDATED State Names */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                <button type="button" className="btn btn-secondary" onClick={closeAddWorkModal} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                   {isSubmitting ? 'Adding...' : 'Add Work'} 
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Confirmation Modal --- */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete this work item? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />

      {/* --- Edit Work Modal --- */}
      {isEditModalOpen && editFormData && editingWorkItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all"> 
            <form onSubmit={handleUpdateWork}>
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Work Item</h3>
                <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={closeEditModal} disabled={isUpdating}><X size={24} /></button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Image Upload (Replace) */}
                <div>
                  <label htmlFor="editImageFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Replace Image (Optional)</label>
                   {/* Show current image */}
                   <div className="mt-2 mb-2">
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Image:</p>
                      {editingWorkItem.image_url ?
                        <img src={editingWorkItem.image_url} alt="Current work item" className="h-20 w-auto rounded shadow"/> :
                        <p className="text-xs text-gray-400 italic">No current image</p>
                      }
                   </div>
                  <input 
                    type="file" 
                    id="editImageFile" 
                    name="imageFile" // Connects to editFormData.imageFile
                    accept="image/*" 
                    onChange={handleEditFileChange} 
                    disabled={isUpdating} 
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300
                               hover:file:bg-blue-100 dark:hover:file:bg-blue-900
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                   {/* New image preview */}
                  {editFormData.imageFile && (
                    <div className="mt-2">
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">New Image Preview:</p>
                      <img 
                        src={URL.createObjectURL(editFormData.imageFile)} 
                        alt="New image preview" 
                        className="h-20 w-auto rounded shadow" 
                        onLoad={() => URL.revokeObjectURL(editFormData.imageFile)} 
                      />
                    </div>
                  )}
                </div>

                {/* EN/AR Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="edit_title_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title (English) *</label>
                      <input type="text" id="edit_title_en" name="title_en" value={editFormData.title_en} onChange={handleEditInputChange} required disabled={isUpdating} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"/>
                    </div>
                    <div>
                      <label htmlFor="edit_description_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (English)</label>
                      <textarea id="edit_description_en" name="description_en" rows={4} value={editFormData.description_en} onChange={handleEditInputChange} disabled={isUpdating} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"></textarea>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="edit_title_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right">العنوان (عربي)</label>
                      <input type="text" id="edit_title_ar" name="title_ar" value={editFormData.title_ar} onChange={handleEditInputChange} disabled={isUpdating} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed" dir="rtl"/>
                    </div>
                    <div>
                      <label htmlFor="edit_description_ar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right">الوصف (عربي)</label>
                      <textarea id="edit_description_ar" name="description_ar" rows={4} value={editFormData.description_ar} onChange={handleEditInputChange} disabled={isUpdating} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed" dir="rtl"></textarea>
                    </div>
                  </div>
                </div>
                {/* Display Update Error Message */}
                {updateError && (
                    <p className="text-sm text-red-600 dark:text-red-400">Error: {updateError}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal} disabled={isUpdating}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                   {isUpdating ? 'Updating...' : 'Save Changes'} 
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default withAdminAuth(CmsOurWork); 