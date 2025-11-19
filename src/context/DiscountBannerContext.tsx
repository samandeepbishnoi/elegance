import { createContext, useContext, useState, ReactNode } from 'react';

interface DiscountBannerContextType {
  hasActiveDiscounts: boolean;
  setHasActiveDiscounts: (value: boolean) => void;
  refreshDiscounts: () => void;
}

const DiscountBannerContext = createContext<DiscountBannerContextType | undefined>(undefined);

export const DiscountBannerProvider = ({ children }: { children: ReactNode }) => {
  const [hasActiveDiscounts, setHasActiveDiscounts] = useState(false);

  const refreshDiscounts = () => {
    // This will trigger components to refetch discount data
    setHasActiveDiscounts(prev => prev);
  };

  // No need for SSE subscription here - page will auto-refresh on discount updates

  return (
    <DiscountBannerContext.Provider value={{ hasActiveDiscounts, setHasActiveDiscounts, refreshDiscounts }}>
      {children}
    </DiscountBannerContext.Provider>
  );
};

export const useDiscountBanner = () => {
  const context = useContext(DiscountBannerContext);
  if (!context) {
    throw new Error('useDiscountBanner must be used within DiscountBannerProvider');
  }
  return context;
};
