import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Crown, Moon, Sun, Lock, LogOut, User, Menu, X, LogIn, Package, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import { useDiscount } from '../context/DiscountBannerContext';
import { useAuth } from '../context/AuthContext';
import SmartSearch from './SmartSearch';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import DiscountBanner from './DiscountBanner';
import AuthModal from './AuthModal';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isOnline } = useStore();
  const { hasActiveDiscounts } = useDiscount();
  const { isAuthenticated, isLoaded, user, signOut } = useAuth();
  const location = useLocation();
  
  const openAuthModal = (mode: 'sign-in' | 'sign-up') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setShowUserMenu(false);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  
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
              Parika Jewels
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SmartSearch />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
            <Link
              to="/catalog"
              className="relative text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-all duration-300 group flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
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
            
            {/* User Authentication */}
            {isLoaded && (
              <>
                {isAuthenticated && user ? (
                  <div ref={userMenuRef} className="relative flex items-center gap-2">
                    {/* User Greeting */}
                    <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hi, {user.firstName || 'there'}
                    </span>
                    
                    {/* User Icon Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="relative"
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 flex items-center justify-center text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0) || user.email?.charAt(0)}
                      </div>
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    </motion.button>
                    
                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 flex items-center justify-center text-white font-semibold">
                                {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {user.fullName || user.email}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Orders Link */}
                          <Link
                            to="/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <Package className="h-4 w-4" />
                            <span>My Orders</span>
                          </Link>
                          
                          {/* Dark Mode Toggle */}
                          <button
                            onClick={() => {
                              toggleDarkMode();
                              setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                          >
                            {isDarkMode ? (
                              <>
                                <Sun className="h-4 w-4" />
                                <span>Light Mode</span>
                              </>
                            ) : (
                              <>
                                <Moon className="h-4 w-4" />
                                <span>Dark Mode</span>
                              </>
                            )}
                          </button>
                          
                          {/* Sign Out */}
                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 border-t border-gray-200 dark:border-gray-700"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openAuthModal('sign-in')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-md text-sm font-semibold"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </motion.button>
                )}
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Wishlist Icon */}
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
            
            {/* Cart Icon */}
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
              aria-label="Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-3 sm:px-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <SmartSearch />
              </div>

              <Link
                to="/catalog"
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <Sparkles className="h-5 w-5" />
                Catalog
              </Link>
              
              {isAuthenticated && (
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200 flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="h-5 w-5" />
                  My Orders
                </Link>
              )}
              
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
              
              {/* User Authentication - Mobile */}
              {isLoaded && (
                <>
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700 my-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 flex items-center justify-center text-white font-semibold text-lg">
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.fullName || user.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gold-600 dark:hover:text-gold-400 transition-colors duration-200"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <button
                          onClick={() => openAuthModal('sign-in')}
                          className="flex items-center justify-center w-full px-4 py-3 text-white bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 rounded-lg transition-all duration-200 mx-3 my-2 font-semibold shadow-md"
                        >
                          <LogIn className="h-5 w-5 mr-2" />
                          Login
                        </button>
                        <button
                          onClick={() => openAuthModal('sign-up')}
                          className="flex items-center justify-center w-full px-4 py-3 text-gold-600 dark:text-gold-400 bg-white dark:bg-gray-800 border-2 border-gold-500 hover:bg-gold-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 mx-3 my-2 font-semibold"
                        >
                          <User className="h-5 w-5 mr-2" />
                          Create Account
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>

    {/* Drawers */}
    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    
    {/* Authentication Modal */}
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setIsAuthModalOpen(false)} 
      mode={authMode}
      redirectUrl={location.pathname}
      onModeChange={setAuthMode}
    />
    </>
  );
};

export default Navbar;