import React, { createContext, useContext, useState, useEffect } from 'react';

interface StoreContextType {
  isOnline: boolean;
  loading: boolean;
  refreshStoreStatus: () => Promise<void>;
  setStoreStatus: (status: 'online' | 'offline') => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  const refreshStoreStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/store/status`);
      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.status === 'online');
      }
    } catch (error) {
      console.error('Error fetching store status:', error);
    } finally {
      setLoading(false);
    }
  };

  const setStoreStatus = async (status: 'online' | 'offline') => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${backendUrl}/api/store/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setIsOnline(status === 'online');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update store status');
      }
    } catch (error) {
      console.error('Error updating store status:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshStoreStatus();
    const interval = setInterval(refreshStoreStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StoreContext.Provider value={{ isOnline, loading, refreshStoreStatus, setStoreStatus }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
