import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import VariantSelector from './VariantSelector';
import { getAvailableProductVariants } from '../../constants/packSizes';

const getLocalPhoneNumber = (phone?: string) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits.slice(-10);
};

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, clearCart, setIsCartOpen, updateVariant } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: getLocalPhoneNumber(user?.phone),
    email: user?.email || '',
    address: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'phone'
      ? e.target.value.replace(/\D/g, '').slice(0, 10)
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const saveOrderToDatabase = async (orderPayload: any) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiBase}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(orderPayload),
    });

    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error('Server returned non-JSON response:', text);
      throw new Error(`Server returned HTML error (${res.status}). Please verify backend is running.`);
    }

    if (!res.ok) {
      throw new Error(data.message || 'Failed to place order');
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required delivery fields.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    const unavailableItem = cartItems.find(item => Number.isFinite(item.countInStock) && item.qty > item.countInStock!);
    if (unavailableItem) {
      toast.error(`${unavailableItem.name} stock has changed. Please review the pack quantity.`);
      return;
    }

    setLoading(true);

    // WhatsApp / COD Flow
    try {
      const orderPayload = {
        user: user?._id || undefined,
        customerName: formData.name,
        customerEmail: formData.email || 'N/A',
        customerPhone: `+91${formData.phone}`,
        shippingAddress: formData.address,
        orderItems: cartItems.map(item => ({
          product: String(item.productId || item._id || item.id).split('::')[0],
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
          variant: item.variant,
          selectedSize: item.selectedSize || item.variant
        })),
        totalPrice: cartTotal,
        paymentMethod: 'WhatsApp / COD',
        transactionId: '',
        isPaid: false,
      };

      const data = await saveOrderToDatabase(orderPayload);
      const orderIdFormatted = data._id ? `#${data._id.slice(-6).toUpperCase()}` : 'NEW';

      let message = `NEW ORDER ${orderIdFormatted}\n\n`;
      message += `CUSTOMER DETAILS\n`;
      message += `Name: ${formData.name}\n`;
      message += `Phone: +91${formData.phone}\n`;
      message += `Email: ${formData.email || 'N/A'}\n`;
      message += `Delivery Address: ${formData.address}\n\n`;
      message += `PRODUCTS\n`;
      cartItems.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `Pack Size: ${item.variant || 'Standard pack'}\n`;
        message += `Price: ₹${item.price.toFixed(2)}\n`;
        message += `Quantity: ${item.qty}\n`;
        message += `Subtotal: ₹${(item.price * item.qty).toFixed(2)}\n\n`;
      });
      message += `--------------------------------\n`;
      message += `Grand Total: ₹${cartTotal.toFixed(2)}\n\n`;
      message += `Thank you.\nSomValli Foods.`;

      const whatsappUrl = `https://wa.me/917972666458?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast.success('Order registered! Redirecting to WhatsApp...', { duration: 4000, icon: '📱' });
      clearCart();
      setIsCartOpen(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not save order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-cream w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-accent z-10 font-poppins"
        >
              {/* Header */}
              <div className="bg-primary text-cream p-6 flex justify-between items-center border-b border-accent/20">
                <div>
                  <h2 className="text-2xl font-playfair font-bold text-accent">Checkout & WhatsApp Booking</h2>
                  <p className="text-xs text-cream/70 mt-1">Order through WhatsApp and pay on delivery with SomValli.</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-cream hover:text-accent p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Swarup Holkar"
                    className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-accent text-primary shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-primary uppercase mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      placeholder="e.g. ******6458"
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-accent text-primary shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="customer@example.com"
                      className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-accent text-primary shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase mb-1">Delivery Address *</label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full street address, landmark, city, pincode..."
                    className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-accent text-primary shadow-sm"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-primary uppercase mb-2">WhatsApp Order Booking</label>
                  <p className="text-xs text-gray-500">Your order will be registered in the SomValli system and sent to WhatsApp for confirmation. Pay on delivery only.</p>
                </div>

                {/* Order Summary Box */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center font-bold text-primary border-b border-gray-200 pb-2">
                    <span>Total Payable ({cartItems.length} items)</span>
                    <span className="text-accent font-black text-lg">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 text-xs text-gray-600 pr-1">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="space-y-2 border-b border-gray-100 pb-2 last:border-0">
                        <div className="flex justify-between gap-3">
                          <span>{item.name} × {item.qty} pack{item.qty === 1 ? '' : 's'} <span className="text-gray-400">({item.variant || 'Standard pack'})</span></span>
                          <motion.span key={`${String(item._id || item.id)}-${item.price}`} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} className="font-semibold text-primary">₹{(item.price * item.qty).toFixed(2)}</motion.span>
                        </div>
                        {item.productVariants && (
                          <VariantSelector
                            variants={getAvailableProductVariants({ variants: item.productVariants })}
                            selectedVariant={item.variant}
                            onVariantChange={size => {
                              const next = item.productVariants?.find((variant: any) => (variant.size || variant.label) === size);
                              if (next) updateVariant(String(item._id || item.id), { size, price: Number(next.price) });
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 bg-gray-200 hover:bg-gray-300 text-primary py-3.5 rounded-xl font-bold transition-colors text-xs uppercase"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl uppercase transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <FiSend size={16} /> Preparing WhatsApp order...
                      </span>
                    ) : (
                      <>
                        <FiSend size={16} /> Order via WhatsApp / COD
                      </>
                    )}
                  </button>
                </div>
              </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
