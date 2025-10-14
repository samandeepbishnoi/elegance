import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterProps {
  categories: string[];
  tags: string[];
  selectedCategory: string;
  selectedTags: string[];
  priceRange: [number, number];
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<FilterProps> = ({
  categories,
  tags,
  selectedCategory,
  selectedTags,
  priceRange,
  onCategoryChange,
  onTagChange,
  onPriceRangeChange,
  onClearFilters,
}) => {
  const MIN_PRICE = 1;
  const MAX_PRICE = 500000;

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

  const hasActiveFilters = selectedCategory !== 'all' || selectedTags.length > 0 ||
    (priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-gold-500" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value="all"
              checked={selectedCategory === 'all'}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="mr-2 text-gold-500 focus:ring-gold-500"
            />
            <span className="text-gray-700">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="mr-2 text-gold-500 focus:ring-gold-500"
              />
              <span className="text-gray-700 capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>

        <div className="px-2">
          <div className="flex justify-between mb-4 text-sm font-semibold text-gray-700">
            <span>{formatPrice(minValue)}</span>
            <span>{formatPrice(maxValue)}</span>
          </div>

          <div className="relative pt-1">
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div
                className="absolute h-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                style={{
                  left: `${((minValue - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                  right: `${100 - ((maxValue - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                }}
              />
            </div>

            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              value={minValue}
              onChange={handleMinChange}
              className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none top-1
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-amber-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-amber-500
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:border-none"
              style={{ zIndex: minValue > MAX_PRICE - 100 ? 5 : 3 }}
            />

            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              value={maxValue}
              onChange={handleMaxChange}
              className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none top-1
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-yellow-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-yellow-500
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:border-none"
              style={{ zIndex: 4 }}
            />
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            Drag sliders to set range
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
        <div className="space-y-2">
          {tags.map((tag) => (
            <label key={tag} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => onTagChange(tag)}
                className="mr-2 text-gold-500 focus:ring-gold-500"
              />
              <span className="text-gray-700 capitalize">{tag}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;