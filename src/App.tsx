import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import RealtimeIndicator from './components/RealtimeIndicator';
import ScrollToTop from './components/ScrollToTop';
import Landing from './pages/Landing';
import Homepage from './pages/Homepage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import { DiscountProvider } from './context/DiscountContext';
import { DiscountProvider as DiscountBannerProvider } from './context/DiscountBannerContext';
import { RealtimeProvider } from './context/RealtimeContext';

// Component to conditionally render Navbar and Footer
function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/catalog" element={<Homepage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatAssistant />}
      <RealtimeIndicator />
    </>
  );
}

function App() {
  // Optimized context provider nesting - AuthProvider and ThemeProvider should be outermost
  // as they're used most frequently. RealtimeProvider and StoreProvider provide data to others.
  // CartProvider and WishlistProvider depend on AuthContext so they're nested deeper.
  return (
    <AuthProvider>
      <ThemeProvider>
        <RealtimeProvider>
          <StoreProvider>
            <DiscountProvider>
              <DiscountBannerProvider>
                <CartProvider>
                  <WishlistProvider>
                    <Router>
                      <ScrollToTop />
                      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                        <Layout />
                      </div>
                    </Router>
                  </WishlistProvider>
                </CartProvider>
              </DiscountBannerProvider>
            </DiscountProvider>
          </StoreProvider>
        </RealtimeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;