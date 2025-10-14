import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, Crown, Moon, Sun, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import SmartSearch from './SmartSearch';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isOnline } = useStore();

  return (
    <>
      {!isOnline && (
        <div className="bg-red-600 dark:bg-red-700 text-white py-2 px-4 text-center text-sm font-medium">
          <Lock className="inline h-4 w-4 mr-2" />
          Store is currently offline. Orders are paused.
        </div>
      )}
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors">
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
              className="text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className="text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
            >
              Catalog
            </Link>
            <Link
              to="/wishlist"
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
            >
              <Heart className="h-6 w-6" />
              {wishlistState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistState.items.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.items.length}
                </span>
              )}
            </Link>
            <button
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
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
              <Link
                to="/wishlist"
                className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <Heart className="h-5 w-5 mr-2" />
                Wishlist ({wishlistState.items.length})
              </Link>
              <Link
                to="/cart"
                className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Cart ({cartState.items.length})
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navbar;