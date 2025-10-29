import { createContext, useContext, useState, ReactNode } from 'react';

interface DiscountContextType {
  hasActiveDiscounts: boolean;
  setHasActiveDiscounts: (value: boolean) => void;
  refreshDiscounts: () => void;
}

const DiscountContext = createContext<DiscountContextType | undefined>(undefined);

export const DiscountProvider = ({ children }: { children: ReactNode }) => {
  const [hasActiveDiscounts, setHasActiveDiscounts] = useState(false);

  const refreshDiscounts = () => {
    // This will trigger components to refetch discount data
    setHasActiveDiscounts(prev => prev);
  };

  // No need for SSE subscription here - page will auto-refresh on discount updates

  return (
    <DiscountContext.Provider value={{ hasActiveDiscounts, setHasActiveDiscounts, refreshDiscounts }}>
      {children}
    </DiscountContext.Provider>
  );
};

export const useDiscount = () => {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error('useDiscount must be used within DiscountProvider');
  }
  return context;
};
