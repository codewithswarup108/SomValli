import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiHeart, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { cartItems, setIsCartOpen } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/#home' },
    { name: 'Menu', path: '/#menu' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  const navbarClass = isScrolled || !isHome 
    ? 'shiny-gold-nav py-3' 
    : 'bg-gradient-to-b from-black/80 to-transparent py-4 text-white';

  const textColor = isScrolled || !isHome ? 'text-primary' : 'text-cream';

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${navbarClass}`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <Link to="/#home" onClick={() => window.scrollTo(0, 0)} className="text-3xl font-playfair font-black flex items-center gap-2 hover:scale-105 transition-transform">
          <span className={`${isScrolled ? 'text-primary' : 'text-gradient-gold'} drop-shadow-md`}>SomValli</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className={`${textColor} hover:-translate-y-1 hover:scale-110 font-bold font-montserrat relative group transition-all duration-200 tracking-wider uppercase text-sm`}
            >
              {link.name}
              <span className={`absolute left-0 -bottom-1 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-primary' : 'bg-accent'}`}></span>
            </a>
          ))}
        </nav>

        <div className={`hidden md:flex items-center gap-6 ${textColor}`}>
          <Link to="/wishlist" className="hover:-translate-y-1 hover:scale-110 relative transition-transform duration-200">
            <FiHeart size={24} strokeWidth={2.5} />
            {wishlistCount > 0 && (
              <span className={`absolute -top-2 -right-2 ${isScrolled ? 'bg-primary text-accent' : 'bg-accent text-primary'} font-bold text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white/20`}>
                {wishlistCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsCartOpen(true)} className="hover:-translate-y-1 hover:scale-110 relative transition-transform duration-200 cursor-pointer">
            <FiShoppingBag size={24} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className={`absolute -top-2 -right-2 ${isScrolled ? 'bg-primary text-accent' : 'bg-accent text-primary'} font-bold text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-white/20`}>
                {cartCount}
              </span>
            )}
          </button>
          
          {isAuthenticated && user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 rounded-full bg-green-500 text-white font-bold text-lg flex items-center justify-center uppercase hover:scale-110 transition-transform shadow-lg border-2 border-white/20"
                title={user.email}
              >
                {user.name.charAt(0)}
              </button>
              
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 right-0 bg-white text-primary rounded-xl shadow-2xl py-3 px-4 min-w-[200px] border border-gray-100 z-50"
                  >
                    <div className="border-b border-gray-100 pb-2 mb-2">
                      <p className="font-bold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-sm"
                    >
                      <FiLogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/register" className="hover:-translate-y-1 hover:scale-110 transition-transform duration-200">
              <FiUser size={24} strokeWidth={2.5} />
            </Link>
          )}
        </div>

        <button
          className={`md:hidden ${textColor} focus:outline-none hover:scale-110 transition-transform`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={28} strokeWidth={2.5} /> : <FiMenu size={28} strokeWidth={2.5} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glassmorphism absolute top-full left-0 w-full overflow-hidden shadow-2xl border-t border-accent/20"
          >
            <div className="flex flex-col items-center py-8 gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-cream text-xl font-bold hover:text-accent hover:scale-110 transition-all uppercase tracking-widest"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
