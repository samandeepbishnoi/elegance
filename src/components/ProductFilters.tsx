import React, { useState, useEffect } from 'react';
import { Filter, X, DollarSign, LayoutList } from 'lucide-react';

interface FilterProps {
  categories: string[];
  selectedCategory: string;
  priceRange: [number, number];
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<FilterProps> = ({
  categories,
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
  onClearFilters,
}) => {
  const MIN_PRICE = 1;
  const MAX_PRICE = 25000;

  const [minValue, setMinValue] = useState(priceRange[0]);
  const [maxValue, setMaxValue] = useState(priceRange[1]);

  useEffect(() => {
    setMinValue(priceRange[0]);
    setMaxValue(priceRange[1]);
  }, [priceRange]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(value);
    onPriceRangeChange([value, maxValue]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(value);
    onPriceRangeChange([minValue, value]);
  };

  const formatPrice = (price: number): string => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(0)}K`;
    }
    return `₹${price}`;
  };

  const hasActiveFilters = selectedCategory !== 'all' ||
    (priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-fit sticky top-[180px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-500/10 to-gold-400/5 dark:from-gold-900/20 dark:to-gold-800/10 p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 bg-gold-100 dark:bg-gold-900/30 rounded-lg">
              <Filter className="h-4 w-4 text-gold-600 dark:text-gold-400" />
            </div>
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Categories */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LayoutList className="h-4 w-4 text-gold-600 dark:text-gold-400" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Category</h4>
          </div>
          <div className="space-y-2">
            <label className="group flex items-center p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
              <input
                type="radio"
                name="category"
                value="all"
                checked={selectedCategory === 'all'}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-4 h-4 text-gold-600 focus:ring-gold-500 dark:focus:ring-gold-400 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className={`ml-3 text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'text-gold-600 dark:text-gold-400'
                  : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
              }`}>
                All Categories
              </span>
              {selectedCategory === 'all' && (
                <span className="ml-auto bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
            </label>
            {categories.map((category) => (
              <label
                key={category}
                className="group flex items-center p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-4 h-4 text-gold-600 focus:ring-gold-500 dark:focus:ring-gold-400 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className={`ml-3 text-sm font-medium capitalize transition-colors ${
                  selectedCategory === category
                    ? 'text-gold-600 dark:text-gold-400'
                    : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                }`}>
                  {category}
                </span>
                {selectedCategory === category && (
                  <span className="ml-auto bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Price Range Slider */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-gold-600 dark:text-gold-400" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Price Range</h4>
          </div>

          <div className="px-1">
            <div className="flex justify-between mb-5">
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Min</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatPrice(minValue)}</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Max</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatPrice(maxValue)}</span>
              </div>
            </div>

            <div className="relative pt-1 pb-6">
              {/* Track Background */}
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                {/* Active Range */}
                <div
                  className="absolute h-2 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full transition-all"
                  style={{
                    left: `${((minValue - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                    right: `${100 - ((maxValue - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                  }}
                />
              </div>

              {/* Min Slider */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                value={minValue}
                onChange={handleMinChange}
                className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none top-1
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:pointer-events-auto
                  [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                  [&::-webkit-slider-thumb]:border-[3px]
                  [&::-webkit-slider-thumb]:border-gold-500
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:pointer-events-auto
                  [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                  [&::-moz-range-thumb]:border-[3px]
                  [&::-moz-range-thumb]:border-gold-500
                  [&::-moz-range-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:transition-transform
                  dark:[&::-webkit-slider-thumb]:bg-gray-900
                  dark:[&::-webkit-slider-thumb]:border-gold-400
                  dark:[&::-moz-range-thumb]:bg-gray-900
                  dark:[&::-moz-range-thumb]:border-gold-400"
                style={{ zIndex: minValue > MAX_PRICE - 100 ? 5 : 3 }}
              />

              {/* Max Slider */}
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                value={maxValue}
                onChange={handleMaxChange}
                className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none top-1
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:pointer-events-auto
                  [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                  [&::-webkit-slider-thumb]:border-[3px]
                  [&::-webkit-slider-thumb]:border-gold-600
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-moz-range-thumb]:w-5
                  [&::-moz-range-thumb]:h-5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:pointer-events-auto
                  [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
                  [&::-moz-range-thumb]:border-[3px]
                  [&::-moz-range-thumb]:border-gold-600
                  [&::-moz-range-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:transition-transform
                  dark:[&::-webkit-slider-thumb]:bg-gray-900
                  dark:[&::-webkit-slider-thumb]:border-gold-400
                  dark:[&::-moz-range-thumb]:bg-gray-900
                  dark:[&::-moz-range-thumb]:border-gold-400"
                style={{ zIndex: 4 }}
              />
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Drag sliders to adjust range
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;