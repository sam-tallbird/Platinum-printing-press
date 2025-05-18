import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

// Higher-Order Component for protecting CMS pages
const withAdminAuth = (WrappedComponent) => {
  // This becomes the new component that Next.js renders for the page
  const WrapperComponent = (props) => {
    const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(null);
    const [roleCheckLoading, setRoleCheckLoading] = useState(true);
    const [checkedUserId, setCheckedUserId] = useState(null);

    useEffect(() => {
      // Redirect immediately if auth loading is done and user is not authenticated
      if (!authIsLoading && !isAuthenticated) {
        router.replace('/cms-login');
        return;
      }

      // If authenticated, check the admin role
      if (!authIsLoading && isAuthenticated && user && (user.id !== checkedUserId || isAdmin === null)) {
        const checkAdminStatus = async () => {
          setRoleCheckLoading(true);
          setCheckedUserId(user.id);
          try {
            if (!user.id) {
              console.error('User ID is not available for admin check.');
              setIsAdmin(false);
              setRoleCheckLoading(false);
              return;
            }
            const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
            if (error) {
              console.error('Error checking admin status:', error);
              setIsAdmin(false);
            } else {
              setIsAdmin(data);
            }
          } catch (err) {
            console.error('RPC call failed:', err);
            setIsAdmin(false);
          } finally {
            setRoleCheckLoading(false);
          }
        };
        checkAdminStatus();
      } else if (!authIsLoading && isAuthenticated && user && user.id === checkedUserId && isAdmin !== null) {
        setRoleCheckLoading(false);
      } else if (!authIsLoading && !isAuthenticated) {
        setIsAdmin(false);
        setRoleCheckLoading(false);
        setCheckedUserId(null);
      }
    }, [authIsLoading, isAuthenticated, user, router, checkedUserId, isAdmin]);

    // Added effect for redirection if user is confirmed NOT admin
    useEffect(() => {
      if (!roleCheckLoading && isAuthenticated && !isAdmin) {
        console.warn('Redirecting non-admin user from CMS page.');
        router.replace('/');
      }
    }, [roleCheckLoading, isAuthenticated, isAdmin, router]);

    // Combine loading states
    const isLoading = authIsLoading || roleCheckLoading;

    // While loading, render nothing (or a loading indicator)
    if (isLoading) {
      return null;
    }

    // If authenticated AND admin check passed, render the actual page component
    if (isAuthenticated && isAdmin) {
      return <WrappedComponent {...props} />;
    }

    // If not loading and not authenticated, or authenticated but not admin, we are redirecting, render null
    return null;
  };

  // Set display name for better debugging in React DevTools
  WrapperComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WrapperComponent;
};

export default withAdminAuth; 