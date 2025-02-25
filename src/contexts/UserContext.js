import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the UserContext
const UserContext = createContext();

// UserProvider component to provide user context to the app
export function UserProvider({ children }) {
  // Initialize currentUserId with the value from localStorage
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('currentUserId'));

  // Update currentUserId when localStorage changes (e.g., in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUserId(localStorage.getItem('currentUserId'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Function to update currentUserId and sync with localStorage
  const updateCurrentUserId = (newUserId) => {
    if (newUserId) {
      localStorage.setItem('currentUserId', newUserId);
    } else {
      localStorage.removeItem('currentUserId');
    }
    setCurrentUserId(newUserId);
  };

  // Provide the context value to the children components
  return (
    <UserContext.Provider value={{ currentUserId, updateCurrentUserId }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}