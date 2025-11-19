import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import RealtimeIndicator from './components/RealtimeIndicator';
import ScrollToTop from './components/ScrollToTop';
import { PageLoadingSkeleton } from './components/SkeletonLoaders';
import Landing from './pages/Landing';
import Homepage from './pages/Homepage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import { AppProviders } from './context/AppProviders';

// Lazy load admin routes for better initial bundle size
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminRegister = lazy(() => import('./pages/AdminRegister'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

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
          {/* Admin routes with lazy loading */}
          <Route 
            path="/admin/login" 
            element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <AdminLogin />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/register" 
            element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <AdminRegister />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <AdminDashboard />
              </Suspense>
            } 
          />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatAssistant />}
      <RealtimeIndicator />
    </>
  );
}

function App() {
  // Simplified with composed providers - see context/AppProviders.tsx
  return (
    <AppProviders>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Layout />
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;