import React, { createContext, useContext, useState } from "react";

// Create Context
const LoadingContext = createContext();

// Provider Component
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
      {loading && <LoaderOverlay />}
    </LoadingContext.Provider>
  );
};

// Hook for using context easily
export const useLoading = () => useContext(LoadingContext);

// Loader Overlay Component
const LoaderOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};
