'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationGuardContextType {
  // Function to check if there's unsaved data
  hasUnsavedData: () => boolean;
  // Function to set the unsaved data checker
  setUnsavedDataChecker: (checker: () => boolean) => void;
  // Function to handle navigation with guard
  guardedNavigate: (url: string) => void;
  // Function to clear unsaved data (called after save)
  clearUnsavedData: () => void;
  // Function to set the clear data function
  setClearDataFunction: (clearFn: () => void) => void;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | null>(null);

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [unsavedDataChecker, setUnsavedDataChecker] = useState<(() => boolean) | null>(null);
  const [clearDataFunction, setClearDataFunction] = useState<(() => void) | null>(null);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const hasUnsavedData = useCallback(() => {
    return unsavedDataChecker ? unsavedDataChecker() : false;
  }, [unsavedDataChecker]);

  const guardedNavigate = useCallback((url: string) => {
    if (hasUnsavedData()) {
      setPendingNavigation(url);
      setShowNavigationWarning(true);
    } else {
      router.push(url);
    }
  }, [hasUnsavedData, router]);

  const clearUnsavedData = useCallback(() => {
    if (clearDataFunction) {
      clearDataFunction();
    }
  }, [clearDataFunction]);

  const handleStayHere = () => {
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };

  const handleLeaveAnyway = () => {
    clearUnsavedData();
    setShowNavigationWarning(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const contextValue: NavigationGuardContextType = {
    hasUnsavedData,
    setUnsavedDataChecker: (checker) => setUnsavedDataChecker(() => checker),
    guardedNavigate,
    clearUnsavedData,
    setClearDataFunction: (clearFn) => setClearDataFunction(() => clearFn),
  };

  return (
    <NavigationGuardContext.Provider value={contextValue}>
      {children}
      
      {/* Navigation Warning Dialog */}
      {showNavigationWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              Unsaved Workout Data
            </h3>
            <p className="text-gray-300 mb-6">
              You have unsaved workout data. If you leave now, your progress will be lost.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleStayHere}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Stay Here
              </button>
              <button
                onClick={handleLeaveAnyway}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error('useNavigationGuard must be used within a NavigationGuardProvider');
  }
  return context;
}
