import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CheckoutModal from './CheckoutModal';
import VariantSelector from './VariantSelector';
import { getAvailableProductVariants } from '../../constants/packSizes';

const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, updateVariant, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
      navigate('/login');
      return;
    }
    setShowCheckoutModal(true);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-cream shadow-2xl z-[210] flex flex-col border-l border-accent"
            >
              {/* Header */}
              <div className="p-6 bg-primary flex justify-between items-center text-cream border-b border-accent/20">
                <div className="flex items-center gap-3">
                  <FiShoppingBag className="text-accent" size={24} />
                  <h2 className="text-2xl font-playfair font-bold text-cream">Your Shopping Cart</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="hover:text-accent hover:rotate-90 transition-all duration-300"
                >
                  <FiX size={28} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-grow overflow-y-auto p-6 font-poppins">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-80 py-12">
                    <FiShoppingBag size={80} className="mb-4 text-accent/60" />
                    <p className="text-xl font-bold font-playfair text-primary">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-2 text-center">Add some delicious coffee products to start your order.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map((item) => {
                      const itemId = String(item._id || item.id);
                      return (
                        <div key={itemId} className="flex gap-4 border-b border-gray-200 pb-6 items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl shadow-md border border-gray-200"
                          />
                          <div className="flex-grow flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-primary font-playfair text-lg leading-tight">{item.name}</h3>
                              <button
                                onClick={() => removeFromCart(itemId)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Remove item"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                            <div className="flex justify-between items-end mt-3">
                              <div>
                                <p className="text-accent font-black text-lg">₹{item.price.toFixed(2)}</p>
                                <p className="text-[11px] text-gray-500 font-semibold mt-1">{item.variant || 'Standard pack'}</p>
                              </div>
                            </div>
                            <div className="mt-4 space-y-3">
                              {item.productVariants && (
                                <VariantSelector
                                  variants={getAvailableProductVariants({ variants: item.productVariants })}
                                  selectedVariant={item.variant}
                                  onVariantChange={size => {
                                    const next = item.productVariants?.find((variant: any) => (variant.size || variant.label) === size);
                                    if (next) updateVariant(itemId, { size, price: Number(next.price) });
                                  }}
                                />
                              )}
                              <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-gray-600">Packs</label>
                                <select
                                  value={item.qty}
                                  onChange={e => updateQuantity(itemId, Number(e.target.value))}
                                  className="bg-white border border-gray-300 rounded-lg px-2 py-1.5 shadow-sm font-bold text-sm text-primary focus:outline-none focus:border-accent"
                                  aria-label={`Quantity for ${item.name}`}
                                >
                                  {Array.from({ length: Math.max(1, item.countInStock ?? item.qty) }, (_, index) => index + 1).map(quantity => (
                                    <option key={quantity} value={quantity}>{quantity}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Subtotal & Checkout Action */}
              {cartItems.length > 0 && (
                <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
                  <div className="flex justify-between items-center mb-6 font-bold text-xl text-primary font-poppins">
                    <span>Subtotal</span>
                    <motion.span key={cartTotal.toFixed(2)} initial={{ opacity: 0.45, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-accent text-2xl font-black">₹{cartTotal.toFixed(2)}</motion.span>
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-gradient-btn text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <FiArrowRight size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
      />
    </>
  );
};

export default CartDrawer;
