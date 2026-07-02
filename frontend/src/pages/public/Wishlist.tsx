import React from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({ ...item, id: item._id || item.id });
    toast.success(`${item.name} added to cart!`, { icon: '☕' });
  };

  return (
    <div className="w-full min-h-screen bg-cream pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-primary mb-4 flex items-center gap-3">
            <FiHeart className="text-accent" /> Your Wishlist
          </h1>
          <p className="text-gray-600 font-poppins">Manage your favourite coffee selections.</p>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <FiHeart size={80} className="text-gray-300 mb-6" />
            <h2 className="text-2xl font-playfair font-bold text-primary mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 font-poppins mb-8">Save items you love here to easily find them later!</p>
            <Link to="/#menu" className="bg-gradient-btn text-white px-8 py-3 rounded-full font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-200">
              Explore Our Menu
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map((item: any, i) => (
              <motion.div
                key={item._id || item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border-2 border-transparent product-card-hover relative flex flex-col shadow-sm"
              >
                <div className="h-64 bg-gold-200 relative">
                  <img src={item.image} className="w-full h-full object-cover smooth-transition" alt={item.name} />
                  <button
                    onClick={() => removeFromWishlist(item._id || item.id)}
                    className="absolute top-4 right-4 bg-white/90 text-red-500 p-2 rounded-full shadow-lg hover:scale-110 hover:bg-white transition-all z-10"
                    title="Remove from wishlist"
                  >
                    <FiTrash2 size={20} />
                  </button>
                  <div className="absolute top-4 left-4 bg-primary text-accent font-black px-5 py-2 rounded-full shadow-lg">
                    ₹{item.price}
                  </div>
                </div>
                <div className="p-8 relative bg-white flex-1 flex flex-col">
                  <h3 className="text-2xl font-playfair font-black mb-2 text-primary">{item.name}</h3>
                  <p className="text-gray-600 font-poppins text-sm mb-6 flex-grow">{item.description}</p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-3 mt-auto rounded-full border-2 border-primary text-primary hover:bg-gradient-btn smooth-transition font-bold tracking-widest uppercase hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FiShoppingBag size={18} /> Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
