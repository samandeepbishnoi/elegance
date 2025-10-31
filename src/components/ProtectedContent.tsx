import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

interface ProtectedContentProps {
  children: React.ReactNode;
  message?: string;
  showModalOnMount?: boolean;
}

const ProtectedContent: React.FC<ProtectedContentProps> = ({ 
  children, 
  message = "Please sign in to continue",
  showModalOnMount = true 
}) => {
  const { isAuthenticated, isLoaded } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  // Automatically open auth modal when user is not authenticated
  useEffect(() => {
    if (isLoaded && !isAuthenticated && showModalOnMount) {
      // Open modal immediately with a small delay to ensure smooth rendering
      const timer = setTimeout(() => {
        setIsAuthModalOpen(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isAuthenticated, showModalOnMount]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {/* Show auth modal immediately - no intermediate screen */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          mode={authMode}
          onModeChange={setAuthMode}
        />
        
        {/* Show this screen only if modal is closed */}
        {!isAuthModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] px-4"
          >
            <div className="text-center max-w-md">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 mb-6 shadow-lg"
              >
                <Lock className="h-10 w-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                Authentication Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="h-5 w-5" />
                <span>Sign In to Continue</span>
              </motion.button>
              
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <button 
                  onClick={() => {
                    setAuthMode('sign-up');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-gold-600 hover:text-gold-700 font-semibold"
                >
                  Sign up now
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedContent;
