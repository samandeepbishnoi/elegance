import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { ProductGridSkeleton } from '../components/SkeletonLoaders';
import { Sparkles, SlidersHorizontal, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  description: string;
  inStock: boolean;
}

const Homepage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 25000]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Read category from URL parameters on component mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Memoize Fuse.js instance to prevent recreation on every render - PERFORMANCE FIX
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'description', 'category', 'tags'],
      threshold: 0.4, // Lower = more strict, Higher = more fuzzy
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [products]);


  useEffect(() => {
    // Fetch products from backend
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setFilteredProducts([]);
        // Improved error handling with toast notification
        const errorMessage = error.message || 'Unable to load products. Please try again later.';
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-center',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Apply filters - OPTIMIZED with proper dependencies
  useEffect(() => {
    let filtered = products;

    // Apply search with fuzzy matching
    if (searchQuery.trim()) {
      const fuseResults = fuse.search(searchQuery);
      filtered = fuseResults.map(result => result.item);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, priceRange, fuse]);

  // Memoize categories extraction for performance
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([1, 25000]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950">
        {/* Hero Section Skeleton */}
        <div className="relative bg-gradient-to-r from-gold-500/10 via-gold-400/5 to-transparent dark:from-gold-900/20 dark:via-gold-800/10 py-12 sm:py-20">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gold-500/10 via-gold-400/5 to-transparent dark:from-gold-900/20 dark:via-gold-800/10 py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI0ZGRCcwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30 dark:opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
              Premium Imitation Jewellery
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Wholesale collection of exclusive imitation jewellery for retailers and bulk buyers
            </p>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-500 dark:text-gold-400" />
              <span className="text-gold-700 dark:text-gold-400 font-medium">Worldwide Shipping Available</span>
              <Sparkles className="h-5 w-5 text-gold-500 dark:text-gold-400" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar with Fuzzy Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gold-500 dark:focus:ring-gold-400 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-500 dark:text-gold-400" />
                Smart search active - finding matches even with typos
              </p>
            )}
          </div>

          {/* Active Filters Indicator */}
          {selectedCategory !== 'all' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 flex-wrap"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Filter:
              </span>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                <span className="capitalize">{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  aria-label="Clear category filter"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-lg font-medium transition-all shadow-md"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex gap-6">
          {/* Mobile Filter Backdrop */}
          <AnimatePresence>
            {showFilters && !isDesktop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 top-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                aria-label="Close filters"
              />
            )}
          </AnimatePresence>

          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || isDesktop) && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed lg:relative top-0 left-0 lg:left-auto z-50 lg:z-0 w-80 lg:w-72 h-screen lg:h-auto overflow-y-auto lg:overflow-visible"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Mobile Close Button - Positioned outside filter card */}
                <div className="lg:hidden sticky top-0 z-20 flex justify-end p-4 pb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFilters(false);
                    }}
                    className="p-2.5 bg-white dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 hover:border-gold-400 dark:hover:border-gold-400 transition-colors"
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="px-4 pb-4 lg:p-0">
                  <ProductFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    priceRange={priceRange}
                    onCategoryChange={handleCategoryChange}
                    onPriceRangeChange={handlePriceRangeChange}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Our Collection
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="max-w-md mx-auto">
                  <Sparkles className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No products found</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">Try adjusting your filters or search query</p>
                  <button
                    onClick={handleClearFilters}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-6 py-2.5 rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all shadow-md font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;