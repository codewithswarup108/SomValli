import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiRefreshCw, FiAlertCircle, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

type OrderItem = {
  product?: string;
  name: string;
  qty: number;
  price: number;
  image: string;
  variant?: string;
  selectedSize?: string;
};

type Order = {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  orderItems: OrderItem[];
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  cancelReason?: string;
  createdAt: string;
};

const MyOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (user?._id) queryParams.append('userId', user._id);
      if (user?.email) queryParams.append('email', user.email);
      if (user?.phone) queryParams.append('phone', user.phone);

      const res = await fetch(`${apiBase}/api/orders/my-orders?${queryParams.toString()}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Could not load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user]);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancelling your order.');
      return;
    }

    setSubmittingCancel(true);
    try {
      const res = await fetch(`${apiBase}/api/orders/${cancellingOrder._id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cancelReason: cancelReason.trim() }),
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Server returned status ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      toast.success('Order cancelled successfully!');
      setOrders(prev =>
        prev.map(o => (o._id === cancellingOrder._id ? { ...o, status: 'Cancelled', cancelReason: cancelReason.trim() } : o))
      );
      setCancellingOrder(null);
      setCancelReason('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not cancel order');
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <FiClock size={14} /> Pending Confirmation
          </span>
        );
      case 'Processing':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <FiRefreshCw size={14} className="animate-spin" /> Preparing Coffee
          </span>
        );
      case 'Shipped':
        return (
          <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <FiTruck size={14} /> Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <FiCheckCircle size={14} /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="bg-red-100 text-red-800 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <FiXCircle size={14} /> Cancelled
          </span>
        );
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream text-primary font-poppins">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-playfair font-black text-gradient-dark">My Orders</h1>
            <p className="text-gray-600 text-sm mt-1">Track real-time status and view history of your coffee orders.</p>
          </div>
          <button
            onClick={fetchMyOrders}
            className="flex items-center gap-2 bg-primary text-cream px-4 py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all shadow-md"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh Status
          </button>
        </div>

        {/* Guest Warning */}
        {!isAuthenticated && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <FiAlertCircle size={24} className="text-accent shrink-0" />
              <span>Log in to automatically sync your profile orders seamlessly.</span>
            </div>
            <Link to="/login" className="bg-primary text-cream px-4 py-2 rounded-xl font-bold text-xs shrink-0">
              Log In
            </Link>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-accent/20">
            <FiShoppingBag size={64} className="mx-auto text-accent/60 mb-4" />
            <h3 className="text-2xl font-playfair font-bold text-primary mb-2">No Orders Found</h3>
            <p className="text-gray-500 text-sm mb-6">You haven't placed any coffee orders yet.</p>
            <Link
              to="/#menu"
              className="bg-gradient-btn text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm inline-block shadow-md hover:scale-105 transition-transform"
            >
              Browse Signature Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200 overflow-hidden space-y-6"
              >
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-center pb-4 border-b border-gray-100 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Reference</span>
                    <h3 className="text-xl font-mono font-black text-primary">
                      #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {getStatusBadge(order.status)}

                    {/* Cancel Button (if active) */}
                    {(order.status === 'Pending' || order.status === 'Processing') && (
                      <button
                        onClick={() => {
                          setCancellingOrder(order);
                          setCancelReason('');
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold transition-colors border border-red-200"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Cancelled Reason Banner */}
                {order.status === 'Cancelled' && order.cancelReason && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-xs text-red-800 space-y-1">
                    <p className="font-bold uppercase tracking-wider">Cancellation Reason Provided:</p>
                    <p className="italic font-medium text-red-900">"{order.cancelReason}"</p>
                  </div>
                )}

                {/* Itemized Products */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Items in Order</h4>
                  <div className="space-y-3">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                        />
                        <div className="flex-1">
                          <h5 className="font-bold text-primary text-base font-playfair">{item.name}</h5>
                          <p className="text-xs text-gray-500">₹{item.price.toFixed(2)} per {item.selectedSize || item.variant || 'pack'}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-500">{item.selectedSize || item.variant || 'Standard pack'} × {item.qty}</span>
                          <p className="font-black text-accent text-base">₹{(item.price * item.qty).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100 gap-4">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                    <p>
                      <strong>Payment Method:</strong> {order.paymentMethod}{' '}
                      {order.isPaid ? (
                        <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full ml-1 text-[10px]">
                          PAID ✓
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full ml-1 text-[10px]">
                          UNPAID / COD
                        </span>
                      )}
                    </p>
                    {order.transactionId && (
                      <p className="font-mono text-[11px] text-gray-400">
                        <strong>Txn ID:</strong> {order.transactionId}
                      </p>
                    )}
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <span className="text-xs text-gray-400 font-bold uppercase">Total Cost</span>
                    <p className="text-2xl font-black text-accent">₹{order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Reason Modal */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingOrder(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-2 border-red-500 z-10 font-poppins p-6"
            >
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-xl font-playfair font-bold text-red-600">Cancel Order #{cancellingOrder._id.slice(-6).toUpperCase()}</h3>
                  <p className="text-xs text-gray-500">Please let us know why you are cancelling.</p>
                </div>
                <button onClick={() => setCancellingOrder(null)} className="text-gray-400 hover:text-red-500">
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase mb-2">
                    Compulsory Cancellation Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="e.g. Ordered by mistake, need to change delivery address, changed my mind..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="bg-amber-50 p-3 rounded-xl text-xs text-amber-800 border border-amber-200">
                  ⚠️ This cancellation reason will be recorded and forwarded directly to store administrators.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingOrder(null)}
                    className="w-1/3 bg-gray-100 hover:bg-gray-200 text-primary py-3 rounded-xl font-bold text-xs uppercase"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={submittingCancel || !cancelReason.trim()}
                    className="w-2/3 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-xs uppercase transition-all shadow-md disabled:opacity-50"
                  >
                    {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
