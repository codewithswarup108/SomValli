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

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <AuthProvider>
      <WishlistProvider>
        <Loader onComplete={() => setLoading(false)} />
      
      {!loading && (
        <div className="flex flex-col min-h-screen">
          <ScrollToAnchor />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/wishlist" element={<Wishlist />} />
              {/* Other isolated pages like cart/profile will go here */}
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1F1412',
                color: '#FDFBF7',
                fontFamily: 'Poppins, sans-serif',
                border: '1px solid #E5A93C'
              }
            }}
          />
          <CartDrawer />
        </div>
      )}
      </WishlistProvider>
    </AuthProvider>
  )
}

export default App
