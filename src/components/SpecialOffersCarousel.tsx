import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gift, Tag, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface DiscountedProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discountInfo?: {
    hasDiscount: boolean;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    discountPercentage: number;
    discountLabel: string | null;
  };
}

const SpecialOffersCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [discountedProducts, setDiscountedProducts] = useState<DiscountedProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/products`);
        if (res.ok) {
          const data = await res.json();
          
          // Fetch discount info for each product
          const productsWithDiscounts = await Promise.all(
            data.slice(0, 10).map(async (product: any) => {
              try {
                const discountRes = await fetch(`${backendUrl}/api/products/${product._id}`);
                if (discountRes.ok) {
                  const productData = await discountRes.json();
                  return {
                    ...product,
                    discountInfo: productData.discountInfo
                  };
                }
              } catch (error) {
                console.error(`Error fetching discount for product ${product._id}:`, error);
              }
              return product;
            })
          );

          // Filter only products with active discounts
          const withActiveDiscounts = productsWithDiscounts.filter(
            (p: DiscountedProduct) => p.discountInfo?.hasDiscount
          );

          setDiscountedProducts(withActiveDiscounts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, [backendUrl]);

  // Auto-play carousel
  useEffect(() => {
    if (discountedProducts.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % discountedProducts.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [discountedProducts.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      (prev - 1 + discountedProducts.length) % discountedProducts.length
    );
    // Reset auto-play
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % discountedProducts.length);
    // Reset auto-play
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 dark:border-gray-700 border-t-red-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (discountedProducts.length === 0) return null;

  const currentProduct = discountedProducts[currentIndex];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-300/20 to-pink-300/20 dark:from-red-900/10 dark:to-pink-900/10 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 px-6 py-3 rounded-full mb-6">
            <Zap className="h-5 w-5 text-red-600 dark:text-red-400 animate-pulse" />
            <span className="font-semibold text-red-900 dark:text-red-200">Limited Time Offers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            Special Discounts
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Grab these exclusive deals before they're gone!
          </p>
        </motion.div>

        <div className="relative">
          {/* Carousel */}
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-12"
              >
                {/* Product Image */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/product/${currentProduct._id}`)}
                  >
                    <img
                      src={currentProduct.image}
                      alt={currentProduct.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Discount Badge */}
                    {currentProduct.discountInfo?.discountLabel && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg flex items-center gap-2 animate-bounce">
                        <Gift className="h-5 w-5" />
                        {currentProduct.discountInfo.discountLabel}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Tag className="h-4 w-4" />
                    <span className="uppercase tracking-wide">{currentProduct.category}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-6">
                    {currentProduct.name}
                  </h3>

                  {/* Pricing */}
                  {currentProduct.discountInfo && (
                    <div className="mb-8">
                      <div className="flex items-baseline gap-4 mb-2">
                        <span className="text-4xl sm:text-5xl font-bold text-red-600 dark:text-red-400">
                          ₹{currentProduct.discountInfo.finalPrice.toLocaleString()}
                        </span>
                        <span className="text-2xl text-gray-400 dark:text-gray-500 line-through">
                          ₹{currentProduct.discountInfo.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg">
                        <span className="font-semibold">
                          You save ₹{currentProduct.discountInfo.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/product/${currentProduct._id}`)}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="h-5 w-5" />
                    Grab This Deal
                  </motion.button>

                  {/* Product Counter */}
                  <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    {currentIndex + 1} / {discountedProducts.length} offers available
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          {discountedProducts.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all z-10"
                aria-label="Previous offer"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all z-10"
                aria-label="Next offer"
              >
                <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {discountedProducts.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {discountedProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-red-500 dark:bg-red-400'
                      : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to offer ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersCarousel;
