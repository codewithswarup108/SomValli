import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Loader from './components/ui/Loader'
import CartDrawer from './components/ui/CartDrawer'
import Home from './pages/public/Home'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Wishlist from './pages/public/Wishlist'
import Products from './pages/public/Products'
import ProductDetails from './pages/public/ProductDetails'
import MyOrders from './pages/public/MyOrders'
import DashboardOverview from './pages/admin/DashboardOverview'
import OrderManager from './pages/admin/OrderManager'
import ProductManager from './pages/admin/ProductManager'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'

function ScrollToAnchor() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }, [hash]);

  return null;
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToAnchor />
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<DashboardOverview />} />
          <Route path="/admin/products" element={<ProductManager />} />
          <Route path="/admin/orders" element={<OrderManager />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F1412',
            color: '#c9c9c9',
            fontFamily: 'Poppins, sans-serif',
            border: '1px solid #38fffc'
          }
        }}
      />
      {!isAdminRoute && <CartDrawer />}
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <AuthProvider>
      <WishlistProvider>
        <Loader onComplete={() => setLoading(false)} />
        {!loading && <MainLayout />}
      </WishlistProvider>
    </AuthProvider>
  )
}

export default App
