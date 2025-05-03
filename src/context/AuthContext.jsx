import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

const AuthContext = createContext(null);

// Remove Dummy credentials
// const DUMMY_EMAIL = "admin@test.com";
// const DUMMY_PASSWORD = "password";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null); // Store Supabase session
  const [user, setUser] = useState(null);       // Store user derived from session
  const [isLoading, setIsLoading] = useState(true); 
  const router = useRouter();

  // Check Supabase session on initial load and listen for changes
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      // Only set state if the component is still mounted
      if (mounted) {
        if (error) {
          console.error("Error getting session:", error.message);
          setIsLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) { // Check if still mounted
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    // Cleanup function
    return () => {
      mounted = false; // Prevent state updates after unmount
      subscription?.unsubscribe();
    };
  }, []);

  // --- UPDATED login function ---
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      throw error; // Throw error to be caught by the calling component (CmsLoginPage)
    }
    // No need to manually set state here, onAuthStateChange will handle it.
    // No need to manually redirect here if withAdminAuth handles redirection based on role.
    // We might still want a default redirect if login happens outside CMS context.
    // router.push('/cms-plpp25'); // Optional redirect
    return true; // Still indicate success to the form if needed
  };

  // --- UPDATED logout function ---
  const logout = async () => {
    // Explicitly check session before signing out
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session before logout:", sessionError.message);
      // Proceed to attempt signout anyway, but log this
    } else if (!session) {
      console.warn("No active session found immediately before logout call.");
      // If no session, signOut will fail, but we still want to ensure local state is clear
      // and redirect.
      // Setting state manually might conflict with onAuthStateChange, rely on redirect.
      router.push('/');
      return; // Exit early as signOut would fail
    }

    // If session exists (or if getSession errored), attempt the standard signout
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
        console.error("Logout error (signOut call):", signOutError.message);
        // Still proceed with redirect even if signout fails, 
        // as the session might be invalid anyway.
    }
    // onAuthStateChange should handle setting session/user to null.
    // Redirect to homepage after attempting logout
    router.push('/'); 
  };

  // --- NEW signup function ---
  const signup = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Store additional info like username in metadata
      options: {
        data: {
          full_name: username, // You can adjust the metadata field name 
          // Add other metadata fields here if needed
        },
        // Add email redirect URL if email confirmation is enabled in Supabase
        // emailRedirectTo: `${window.location.origin}/`, 
      },
    });

    if (error) {
      console.error("Signup error:", error.message);
      throw error; // Throw error for the form to handle
    }
    
    // If email confirmation is required, data.user will exist but data.session will be null.
    // If email confirmation is disabled, both data.user and data.session will exist.
    console.log("Signup successful:", data);
    
    // No need to manually set state, onAuthStateChange handles it
    // If email confirmation is enabled, you might want to return a specific value
    // to tell the UI to show a "Check your email" message.
    // For now, just indicate general success.
    return data; // Return the response data (includes user, session if applicable)
  };

  // --- NEW password reset function ---
  const sendPasswordResetEmail = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      // Link should point to the password update page in your app
      redirectTo: `${window.location.origin}/reset-password`, 
    });

    if (error) {
      console.error("Password reset error:", error.message);
      throw error; // Throw error for the form to handle
    }
    
    console.log("Password reset email sent successfully:", data);
    return data;
  };

  // --- NEW Account Update Functions ---
  const updateUsername = async (newName) => {
      const { data, error } = await supabase.auth.updateUser({
          data: { full_name: newName } // Ensure the metadata key matches what you use
      });
      if (error) {
          console.error("Error updating username:", error.message);
          throw error;
      }
      // IMPORTANT: Refresh the user state in context to reflect the change
      // Option 1: Refetch user (might be slightly delayed)
      // await supabase.auth.refreshSession(); 
      // Option 2: Manually update local user object (faster UI update)
      setUser(prevUser => prevUser ? { ...prevUser, user_metadata: { ...prevUser.user_metadata, full_name: newName }} : null);
      return data;
  };

  const updateEmail = async (newEmail) => {
      const { data, error } = await supabase.auth.updateUser({ email: newEmail }, {
           // Optional: Specify where to redirect user after clicking email confirmation link
           // emailRedirectTo: `${window.location.origin}/account` 
      });
      if (error) {
          console.error("Error updating email:", error.message);
          throw error;
      }
      // User needs to confirm via email, state will update via onAuthStateChange 
      // when they eventually re-authenticate or refresh session after confirming.
      return data; // Inform UI that request was sent
  };

  const updatePassword = async (newPassword) => {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
          console.error("Error updating password:", error.message);
          throw error;
      }
      // Password updated successfully
      return data;
  };

  // Value provided to consuming components
  const value = {
    session,
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    sendPasswordResetEmail,
    updateUsername, // <-- Add update functions
    updateEmail,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 