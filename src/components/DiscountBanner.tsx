import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useDiscountBanner } from '../context/DiscountBannerContext';

interface Discount {
  _id: string;
  name: string;
  scope: 'global' | 'category' | 'product';
  category?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  description?: string;
  isActive: boolean;
}

const DiscountBanner: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { setHasActiveDiscounts } = useDiscountBanner();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchActiveDiscounts = async () => {
      try {
        // Fetch all active discounts (not expired)
        const response = await fetch(`${backendUrl}/api/discounts?isActive=true&includeExpired=false`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Show all active discounts (global, category, and product-specific)
          setDiscounts(data);
          setHasActiveDiscounts(data.length > 0);
        } else {
          setHasActiveDiscounts(false);
        }
      } catch (error) {
        setHasActiveDiscounts(false);
      }
    };

    fetchActiveDiscounts();
    
    // Refresh discounts every 5 minutes to catch new ones
    const refreshInterval = setInterval(fetchActiveDiscounts, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [backendUrl, setHasActiveDiscounts]);

  useEffect(() => {
    if (discounts.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % discounts.length);
    }, 3500); // Changed to 3.5 seconds for better readability

    return () => clearInterval(interval);
  }, [discounts.length, isHovered]);

  const formatDiscount = (discount: Discount) => {
    let discountText = '';
    if (discount.discountType === 'percentage') {
      discountText = `${discount.discountValue}% OFF`;
    } else {
      discountText = `₹${discount.discountValue} OFF`;
    }
    
    // Add scope information
    let scopeText = '';
    if (discount.scope === 'category' && discount.category) {
      scopeText = ` on ${discount.category.charAt(0).toUpperCase() + discount.category.slice(1)}`;
    } else if (discount.scope === 'global') {
      scopeText = ' Sitewide';
    }
    
    return discountText + scopeText;
  };

  if (discounts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 dark:from-amber-600 dark:via-yellow-600 dark:to-amber-600 text-white overflow-hidden shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 opacity-0"
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ width: '50%' }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
        <div className="flex items-center justify-center gap-3">
          {/* Banner Content */}
          <div className="flex-1 flex items-center justify-center gap-2 min-h-[24px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex items-center gap-2 text-center"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <Sparkles className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                </motion.div>
                
                {/* Discount Name - Prominent */}
                <span className="font-bold text-xs sm:text-sm tracking-wide drop-shadow-md uppercase">
                  {discounts[currentIndex].name}
                </span>
                
                <span className="hidden sm:inline text-xs sm:text-sm font-semibold">-</span>
                
                {/* Discount Value */}
                <span className="font-extrabold text-sm sm:text-base tracking-wide drop-shadow-md text-white">
                  {formatDiscount(discounts[currentIndex])}
                </span>
                
                {/* Description (if available) */}
                {discounts[currentIndex].description && (
                  <>
                    <span className="hidden md:inline text-xs font-semibold">•</span>
                    <span className="hidden md:inline text-xs font-medium opacity-90">
                      {discounts[currentIndex].description}
                    </span>
                  </>
                )}
                
                <motion.div
                  animate={{ 
                    rotate: [0, -360],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <Sparkles className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscountBanner;
