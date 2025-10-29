import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchActiveDiscounts = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/discounts/active`);
        if (response.ok) {
          const data = await response.json();
          // Filter only global discounts for top banner
          const globalDiscounts = data.filter((d: Discount) => d.isActive && d.scope === 'global');
          setDiscounts(globalDiscounts);
        }
      } catch (error) {
        console.error('Error fetching discounts:', error);
      }
    };

    fetchActiveDiscounts();
  }, [backendUrl]);

  useEffect(() => {
    if (discounts.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % discounts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [discounts.length, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + discounts.length) % discounts.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % discounts.length);
  };

  const formatDiscount = (discount: Discount) => {
    if (discount.discountType === 'percentage') {
      return `${discount.discountValue}% OFF`;
    }
    return `₹${discount.discountValue} OFF`;
  };

  if (discounts.length === 0) return null;

  return (
    <div
      className="relative bg-gradient-to-r from-gold-600 via-amber-500 to-gold-600 dark:from-gold-700 dark:via-amber-600 dark:to-gold-700 text-white overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ width: '50%' }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-3">
          {/* Previous Button */}
          {discounts.length > 1 && (
            <button
              onClick={handlePrev}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Previous discount"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Banner Content */}
          <div className="flex-1 flex items-center justify-center gap-2 min-h-[28px]">
            <Tag className="h-5 w-5 flex-shrink-0 hidden sm:block" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 text-center"
              >
                <Sparkles className="h-4 w-4 flex-shrink-0 sm:hidden" />
                <span className="font-bold text-sm sm:text-base">
                  {formatDiscount(discounts[currentIndex])}
                </span>
                <span className="hidden sm:inline text-sm sm:text-base">•</span>
                <span className="text-sm sm:text-base">
                  {discounts[currentIndex].description || discounts[currentIndex].name}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          {discounts.length > 1 && (
            <button
              onClick={handleNext}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Next discount"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dots Indicator */}
        {discounts.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {discounts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to discount ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountBanner;
