import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import Fuse from 'fuse.js';
import { getRecentlyViewed } from '../utils/recentlyViewed';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tags?: string[];
  description?: string;
  views?: number;
}

interface SmartSearchProps {
  className?: string;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch products from backend
  const fetchProducts = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
    try {
      const res = await fetch(`${backendUrl}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Update recently viewed from localStorage
  const updateRecentlyViewed = () => {
    setRecentlyViewed(getRecentlyViewed());
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
    updateRecentlyViewed();
  }, []);

  // Refresh trending products periodically (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (filter === 'trending') {
        fetchProducts();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [filter]);

  // Update recently viewed when dropdown opens or filter changes to recent
  useEffect(() => {
    if (isDropdownOpen && filter === 'recent') {
      updateRecentlyViewed();
    }
  }, [isDropdownOpen, filter]);

  // Listen for storage changes (when recently viewed is updated in another tab or by the app)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recentlyViewedProducts') {
        updateRecentlyViewed();
      }
    };

    const handleCustomEvent = () => {
      updateRecentlyViewed();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('recentlyViewedUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('recentlyViewedUpdated', handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }

    const fuse = new Fuse(allProducts, {
      keys: ['name', 'category', 'tags', 'description'],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });

    const results = fuse.search(searchQuery).slice(0, 5);
    setSuggestions(results.map(result => result.item));
  }, [searchQuery, allProducts]);

  const getFilteredProducts = () => {
    if (filter === 'trending') {
      return [...allProducts]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
    } else if (filter === 'recent') {
      return recentlyViewed.slice(0, 5);
    }
    return suggestions;
  };

  const displayProducts = getFilteredProducts();

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
    setFilter('all');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleFilterClick = (newFilter: 'all' | 'trending' | 'recent') => {
    setFilter(newFilter);
    setIsDropdownOpen(true);
    setSearchQuery('');
    
    // Refresh data when switching filters
    if (newFilter === 'trending') {
      fetchProducts();
    } else if (newFilter === 'recent') {
      updateRecentlyViewed();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search jewelry..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isDropdownOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleFilterClick('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gold-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            <button
              onClick={() => handleFilterClick('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'trending'
                  ? 'bg-gold-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </button>
            <button
              onClick={() => handleFilterClick('recent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'recent'
                  ? 'bg-gold-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="h-4 w-4" />
              Recent
            </button>
          </div>

          <div className="overflow-y-auto max-h-96">
            {displayProducts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'recent' && recentlyViewed.length === 0
                    ? 'No recently viewed products'
                    : filter === 'trending' && allProducts.length === 0
                    ? 'No trending products available'
                    : 'No results found'}
                </p>
              </div>
            ) : (
              <div className="py-2">
                {displayProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {product.category}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-sm font-semibold text-gold-600 dark:text-gold-400">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
