import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Crown, Moon, Sun, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import { useDiscount } from '../context/DiscountBannerContext';
import SmartSearch from './SmartSearch';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import DiscountBanner from './DiscountBanner';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isOnline } = useStore();
  const { hasActiveDiscounts } = useDiscount();
  const location = useLocation();
  
  // Show discount banner on main shopping pages, but not on admin/auth pages
  const showDiscountBanner = !location.pathname.startsWith('/admin') && 
                             !location.pathname.startsWith('/checkout') &&
                             !location.pathname.startsWith('/cart') &&
                             !location.pathname.includes('/product/');

  return (
    <>
      {/* Discount Banner - Shows on main shopping pages */}
      {showDiscountBanner && <DiscountBanner />}
      
      {!isOnline && (
        <div className="bg-red-600 dark:bg-red-700 text-white py-2 px-4 text-center text-sm font-medium">
          <Lock className="inline h-4 w-4 mr-2" />
          Store is currently offline. Orders are paused.
        </div>
      )}
    <nav className={`bg-white dark:bg-gray-800 shadow-lg sticky z-40 transition-colors ${showDiscountBanner && hasActiveDiscounts ? 'top-[40px]' : 'top-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Crown className="h-8 w-8 text-gold-500" />
            <span className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
              Elegance
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SmartSearch />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
            <Link
              to="/"
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/catalog"
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 group"
            >
              Catalog
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWishlistOpen(true)}
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
            >
              <Heart className="h-6 w-6" />
              {wishlistState.items.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg"
                >
                  {wishlistState.items.length}
                </motion.span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartState.items.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg"
                >
                  {cartState.items.length}
                </motion.span>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Wishlist Icon - Always Visible */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
              aria-label="Open wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlistState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistState.items.length}
                </span>
              )}
            </button>
            
            {/* Cart Icon - Always Visible */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.items.length}
                </span>
              )}
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-3 sm:px-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <SmartSearch />
              </div>

              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/catalog"
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Catalog
              </Link>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-5 w-5 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5 mr-2" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>

    {/* Drawers */}
    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Navbar;