import { createContext, useContext, useState, ReactNode } from 'react';

interface DiscountContextType {
  hasActiveDiscounts: boolean;
  setHasActiveDiscounts: (value: boolean) => void;
}

const DiscountContext = createContext<DiscountContextType | undefined>(undefined);

export const DiscountProvider = ({ children }: { children: ReactNode }) => {
  const [hasActiveDiscounts, setHasActiveDiscounts] = useState(false);

  return (
    <DiscountContext.Provider value={{ hasActiveDiscounts, setHasActiveDiscounts }}>
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
