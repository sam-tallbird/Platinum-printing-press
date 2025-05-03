import React, { createContext, useState, useContext, useCallback } from 'react';

// Create the context
const ModalContext = createContext();

// Create a provider component
export const ModalProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const openSignUpModal = useCallback(() => setIsSignUpModalOpen(true), []);
  const closeSignUpModal = useCallback(() => setIsSignUpModalOpen(false), []);

  const openCartModal = useCallback(() => setIsCartOpen(true), []);
  const closeCartModal = useCallback(() => setIsCartOpen(false), []);

  const openLogoutConfirmModal = useCallback(() => setLogoutConfirmOpen(true), []);
  const closeLogoutConfirmModal = useCallback(() => setLogoutConfirmOpen(false), []);

  const switchToSignUpModal = useCallback(() => {
    closeLoginModal();
    openSignUpModal();
  }, [closeLoginModal, openSignUpModal]);

  const switchToLoginModal = useCallback(() => {
    closeSignUpModal();
    openLoginModal();
  }, [closeSignUpModal, openLoginModal]);

  return (
    <ModalContext.Provider 
      value={{
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isSignUpModalOpen,
        openSignUpModal,
        closeSignUpModal,
        switchToSignUpModal,
        switchToLoginModal,
        isCartOpen,
        openCartModal,
        closeCartModal,
        isLogoutConfirmOpen,
        openLogoutConfirmModal,
        closeLogoutConfirmModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use the ModalContext
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 