import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Discount {
  _id: string;
  name: string;
  scope: 'global' | 'category' | 'product';
  category?: string;
  productId?: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  discountType: 'percentage' | 'flat';
  discountValue: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive: boolean;
  description?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface DiscountContextType {
  discounts: Discount[];
  loading: boolean;
  error: string | null;
  fetchDiscounts: () => Promise<void>;
  createDiscount: (discount: Partial<Discount>) => Promise<Discount>;
  updateDiscount: (id: string, discount: Partial<Discount>) => Promise<Discount>;
  deleteDiscount: (id: string) => Promise<void>;
  toggleDiscountStatus: (id: string) => Promise<void>;
  getDiscountsByScope: (scope: 'global' | 'category' | 'product') => Discount[];
  getDiscountsByCategory: (category: string) => Discount[];
  getActiveDiscounts: () => Discount[];
}

const DiscountContext = createContext<DiscountContextType | null>(null);

export const useDiscount = () => {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error('useDiscount must be used within a DiscountProvider');
  }
  return context;
};

interface DiscountProviderProps {
  children: ReactNode;
}

export const DiscountProvider: React.FC<DiscountProviderProps> = ({ children }) => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${backendUrl}/api/discounts?includeExpired=true`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discounts');
      }

      const data = await response.json();
      setDiscounts(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching discounts');
      console.error('Error fetching discounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDiscount = async (discount: Partial<Discount>): Promise<Discount> => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${backendUrl}/api/discounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(discount),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create discount');
    }

    const data = await response.json();
    const newDiscount = data.discount;
    setDiscounts((prev) => [...prev, newDiscount]);
    return newDiscount;
  };

  const updateDiscount = async (id: string, discount: Partial<Discount>): Promise<Discount> => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${backendUrl}/api/discounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(discount),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update discount');
    }

    const data = await response.json();
    const updatedDiscount = data.discount;
    setDiscounts((prev) =>
      prev.map((d) => (d._id === id ? updatedDiscount : d))
    );
    return updatedDiscount;
  };

  const deleteDiscount = async (id: string): Promise<void> => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${backendUrl}/api/discounts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete discount');
    }

    setDiscounts((prev) => prev.filter((d) => d._id !== id));
  };

  const toggleDiscountStatus = async (id: string): Promise<void> => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${backendUrl}/api/discounts/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to toggle discount status');
    }

    const data = await response.json();
    const toggledDiscount = data.discount;
    setDiscounts((prev) =>
      prev.map((d) => (d._id === id ? toggledDiscount : d))
    );
  };

  const getDiscountsByScope = (scope: 'global' | 'category' | 'product'): Discount[] => {
    return discounts.filter((d) => d.scope === scope);
  };

  const getDiscountsByCategory = (category: string): Discount[] => {
    return discounts.filter((d) => d.scope === 'category' && d.category === category);
  };

  const getActiveDiscounts = (): Discount[] => {
    const now = new Date();
    return discounts.filter((d) => {
      if (!d.isActive) return false;
      if (d.startDate && now < new Date(d.startDate)) return false;
      if (d.endDate && now > new Date(d.endDate)) return false;
      return true;
    });
  };

  useEffect(() => {
    // Auto-fetch discounts on mount if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchDiscounts();
    }
  }, []);

  const value: DiscountContextType = {
    discounts,
    loading,
    error,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
    getDiscountsByScope,
    getDiscountsByCategory,
    getActiveDiscounts,
  };

  return (
    <DiscountContext.Provider value={value}>
      {children}
    </DiscountContext.Provider>
  );
};
