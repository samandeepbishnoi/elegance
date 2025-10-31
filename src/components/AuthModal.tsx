import React, { useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { X, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'sign-in' | 'sign-up';
  redirectUrl?: string;
  onModeChange?: (mode: 'sign-in' | 'sign-up') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  mode = 'sign-in',
  redirectUrl = '/',
  onModeChange
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle navigation between sign-in and sign-up
  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if click is on a link
      const link = target.closest('a');
      if (link && onModeChange) {
        const text = link.textContent?.toLowerCase() || '';
        const href = link.getAttribute('href') || '';
        
        // Check for sign up links
        if (text.includes('sign up') || text.includes('signup') || href.includes('sign-up')) {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => onModeChange('sign-up'), 0);
          return;
        }
        
        // Check for sign in links
        if (text.includes('sign in') || text.includes('signin') || href.includes('sign-in')) {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => onModeChange('sign-in'), 0);
          return;
        }
      }
    };

    if (isOpen) {
      // Use capture phase to intercept before Clerk
      document.addEventListener('click', handleClick, { capture: true });
    }

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [isOpen, onModeChange]);

  const clerkAppearance = {
    variables: {
      colorPrimary: '#D4AF37',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      borderRadius: '0.5rem',
    },
    elements: {
      rootBox: 'w-full flex justify-center',
      card: 'w-full max-w-full shadow-none mx-auto',
      cardBox: 'w-full',
      main: 'w-full',
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-[95vw] sm:max-w-lg my-4 sm:my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background Elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold-400/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Modal Content */}
              <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-none overflow-y-auto">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-gold-500 to-gold-600 px-4 sm:px-8 py-6 sm:py-10 text-white overflow-hidden">
                  {/* Decorative patterns - hidden on small screens */}
                  <div className="absolute top-0 right-0 opacity-20 hidden sm:block">
                    <Sparkles className="h-32 w-32" />
                  </div>
                  <div className="absolute bottom-0 left-0 opacity-10 hidden sm:block">
                    <Crown className="h-24 w-24" />
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm z-50 cursor-pointer flex items-center justify-center"
                    aria-label="Close modal"
                    type="button"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6 pointer-events-none" />
                  </button>

                  {/* Title */}
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <Crown className="h-7 w-7 sm:h-10 sm:w-10" />
                      <h2 className="font-serif text-2xl sm:text-4xl font-bold">Elegance</h2>
                    </div>
                    <p className="text-white/90 text-sm sm:text-base">
                      {mode === 'sign-in' 
                        ? 'Welcome back! Sign in to continue your journey' 
                        : 'Join our exclusive collection of elegance'}
                    </p>
                  </div>
                </div>

                {/* Clerk Form */}
                <div className="p-4 sm:p-8 bg-white dark:bg-gray-800">
                  {mode === 'sign-in' ? (
                    <SignIn
                      appearance={clerkAppearance}
                      routing="virtual"
                      afterSignInUrl={redirectUrl}
                      signUpUrl="#"
                    />
                  ) : (
                    <SignUp
                      appearance={clerkAppearance}
                      routing="virtual"
                      afterSignUpUrl={redirectUrl}
                      signInUrl="#"
                    />
                  )}
                </div>


              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
