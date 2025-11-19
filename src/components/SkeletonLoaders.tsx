import React from 'react';

// Base skeleton component
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 aspect-square">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  </div>
);

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Cart Item Skeleton
export const CartItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
    <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-6 w-8" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

// Order Card Skeleton
export const OrderCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Skeleton className="w-20 h-20 rounded-lg" />
        <Skeleton className="w-20 h-20 rounded-lg" />
        <Skeleton className="w-20 h-20 rounded-lg" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  </div>
);

// Product Detail Skeleton
export const ProductDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-32 mb-8" />
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Skeleton */}
        <div className="space-y-4">
          <Skeleton className="w-full aspect-square rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="aspect-square rounded-lg" />
          </div>
        </div>
        
        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="flex gap-3">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 w-14 rounded-xl" />
          </div>
          
          <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Wishlist Item Skeleton
export const WishlistItemSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 aspect-square">
      <Skeleton className="w-full h-full" />
    </div>
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  </div>
);

// Page Loading Skeleton (for full page loads)
export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gold-50/30 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
    <div className="text-center">
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 bg-gold-200/30 dark:bg-gold-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-gold-200 dark:border-gray-700 border-t-gold-500 relative"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
    </div>
  </div>
);

// Drawer Item Skeleton
export const DrawerItemSkeleton: React.FC = () => (
  <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
    <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
    <Skeleton className="w-6 h-6 rounded flex-shrink-0" />
  </div>
);
