import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { RealtimeProvider } from './RealtimeContext';
import { StoreProvider } from './StoreContext';
import { DiscountProvider } from './DiscountContext';
import { DiscountBannerProvider } from './DiscountBannerContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';

/**
 * Composed provider that wraps all context providers in the correct order
 * This reduces the nesting in App.tsx and makes it easier to manage provider order
 * 
 * Provider hierarchy (from outer to inner):
 * 1. AuthProvider - Must be outermost as many providers depend on auth state
 * 2. ThemeProvider - Theme state needed throughout
 * 3. RealtimeProvider - Real-time updates for all components
 * 4. StoreProvider - Store data and settings
 * 5. DiscountProvider - Discount management (depends on store)
 * 6. DiscountBannerProvider - Banner state management
 * 7. CartProvider - Shopping cart (depends on auth)
 * 8. WishlistProvider - Wishlist (depends on auth)
 */

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RealtimeProvider>
          <StoreProvider>
            <DiscountProvider>
              <DiscountBannerProvider>
                <CartProvider>
                  <WishlistProvider>
                    {children}
                  </WishlistProvider>
                </CartProvider>
              </DiscountBannerProvider>
            </DiscountProvider>
          </StoreProvider>
        </RealtimeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};
