import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('customerName') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('customerPhone') as HTMLInputElement).value;
    const address = (form.elements.namedItem('customerAddress') as HTMLTextAreaElement).value;

    let message = `*New Order Request*\n\n`;
    message += `*Name:* ${name}\n`;
    message += `*Email:* ${user?.email || 'N/A'}\n`;
    message += `*Phone:* ${phone}\n`;
    message += `*Address:* ${address}\n\n`;
    message += `*Order Items:*\n`;
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (x${item.qty}) - ₹${(item.price * item.qty).toFixed(2)}\n`;
    });
    message += `\n*Total Cost:* ₹${cartTotal.toFixed(2)}`;

    const whatsappUrl = `https://wa.me/917972666458?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast.success('Redirecting to WhatsApp to complete your order!', { duration: 4000, icon: '📱' });
    setTimeout(() => {
      setShowCheckout(false);
      setIsCartOpen(false);
    }, 2000);
  }

  return (
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

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-cream shadow-2xl z-[210] flex flex-col border-l border-accent"
          >
            {/* Header */}
            <div className="p-6 bg-primary flex justify-between items-center text-cream border-b border-accent/20">
              <h2 className="text-2xl font-playfair font-bold">Your Cart</h2>
              <button 
                onClick={() => { setIsCartOpen(false); setShowCheckout(false); }}
                className="hover:text-accent hover:rotate-90 transition-all duration-300"
              >
                <FiX size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 font-poppins">
              {!showCheckout ? (
                cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-70">
                    <FiShoppingBag size={80} className="mb-4 text-accent" />
                    <p className="text-lg">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 border-b border-gray-200 pb-6">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl shadow-md border border-gray-200" />
                        <div className="flex-grow flex flex-col justify-between">
                          <div className="flex justify-between">
                            <h3 className="font-bold text-primary font-playfair text-lg leading-tight">{item.name}</h3>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-accent font-black">₹{item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                              <button onClick={() => updateQuantity(item.id, item.qty - 1)} className="hover:text-accent p-1"><FiMinus size={14}/></button>
                              <span className="font-bold text-sm min-w-[20px] text-center">{item.qty}</span>
                              <button onClick={() => updateQuantity(item.id, item.qty + 1)} className="hover:text-accent p-1"><FiPlus size={14}/></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col animate-fade-in font-poppins py-4">
                  <h3 className="text-2xl font-playfair font-bold text-primary mb-6">Offline Checkout</h3>
                  <form id="checkoutForm" onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-primary mb-1">Full Name</label>
                      <input name="customerName" required type="text" defaultValue={user?.name || ''} className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-accent" placeholder="Swarup Holkar" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-primary mb-1">Payment Reference (Phone)</label>
                      <input name="customerPhone" required type="tel" defaultValue={user?.phone || ''} className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-accent font-mono text-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-primary mb-1">Delivery Address</label>
                      <textarea name="customerAddress" required className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-accent h-24" placeholder="123 Luxury Ave..."></textarea>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg mt-4 text-sm text-gray-600">
                      <strong>Note:</strong> Since online payment is currently future scope, we will reference your mobile number for offline payment verification globally.
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
                <div className="flex justify-between items-center mb-6 font-bold text-lg text-primary font-poppins">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                {!showCheckout ? (
                  isAuthenticated ? (
                    <button onClick={() => setShowCheckout(true)} className="w-full bg-gradient-btn text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-200 shadow-[0_5px_15px_rgba(229,169,60,0.4)]">
                      Proceed to Checkout
                    </button>
                  ) : (
                    <button onClick={() => { setIsCartOpen(false); navigate('/login'); }} className="w-full bg-gradient-btn text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-200 shadow-[0_5px_15px_rgba(229,169,60,0.4)]">
                      Login to Order
                    </button>
                  )
                ) : (
                  <div className="flex gap-4">
                     <button type="button" onClick={() => setShowCheckout(false)} className="w-1/3 bg-gray-200 text-primary py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-gray-300 transition-colors">
                      Back
                    </button>
                    <button type="submit" form="checkoutForm" className="w-2/3 bg-green-500 text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-200 shadow-[0_5px_15px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2">
                      Order via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
