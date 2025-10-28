import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import Landing from './pages/Landing';
import Homepage from './pages/Homepage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import { DiscountProvider } from './context/DiscountContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StoreProvider>
          <DiscountProvider>
            <CartProvider>
              <WishlistProvider>
                <Router>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                    <Navbar />
                    <main>
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/catalog" element={<Homepage />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/register" element={<AdminRegister />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      </Routes>
                    </main>
                    <Footer />
                    <ChatAssistant />
                  </div>
                </Router>
              </WishlistProvider>
            </CartProvider>
          </DiscountProvider>
        </StoreProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;