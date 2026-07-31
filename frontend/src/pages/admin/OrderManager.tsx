import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../components/admin/Sidebar';
import { FiSearch, FiEye, FiTrash2, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiX, FiRefreshCw } from 'react-icons/fi';
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
  isPaid: boolean;
  cancelReason?: string;
  createdAt: string;
};

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/orders`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${apiBase}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Order status updated to "${newStatus}"`);
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: newStatus as any } : o))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating order status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`${apiBase}/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Order deleted successfully');
        setOrders(prev => prev.filter(o => o._id !== orderId));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        toast.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error deleting order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><FiClock /> Pending</span>;
      case 'Processing':
        return <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><FiRefreshCw /> Processing</span>;
      case 'Shipped':
        return <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><FiTruck /> Shipped</span>;
      case 'Delivered':
        return <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><FiCheckCircle /> Delivered</span>;
      case 'Cancelled':
        return <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><FiXCircle /> Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-bold w-fit">{status}</span>;
    }
  };

  const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="flex min-h-screen bg-gray-50 font-poppins text-primary">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-playfair font-black text-primary">Orders Management</h1>
            <p className="text-sm text-gray-500 mt-1">View, track, search, and update customer order statuses.</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-primary text-cream px-4 py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 shadow-md"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh Orders
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-accent shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab} ({tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search ID, name, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-500 font-bold">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-xs text-primary">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-primary">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700">
                          {order.orderItems.reduce((acc, item) => acc + item.qty, 0)} items
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-black text-accent text-sm">₹{order.totalPrice.toFixed(2)}</p>
                        <p className="text-[11px] text-gray-500 font-bold mt-0.5">
                          {order.paymentMethod || 'WhatsApp/COD'}{' '}
                          {order.isPaid ? (
                            <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-md font-bold">PAID ✓</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-md font-bold">COD / UNPAID</span>
                          )}
                        </p>
                        {order.transactionId ? (
                          <p className="text-[10px] text-gray-400 font-mono">Txn: {order.transactionId}</p>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order._id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs font-bold focus:outline-none focus:border-accent"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-primary hover:text-accent hover:bg-amber-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Itemized Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-200"
              >
                {/* Modal Header */}
                <div className="bg-primary text-cream p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-accent">
                      Order Details #{selectedOrder._id.slice(-6).toUpperCase()}
                    </h2>
                    <p className="text-xs text-cream/70 mt-1">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-cream hover:text-accent p-2 rounded-full hover:bg-white/10"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  {/* Customer Info Card */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Customer Info</p>
                      <p className="font-bold text-primary mt-1">{selectedOrder.customerName}</p>
                      <p className="text-xs text-gray-600">📞 {selectedOrder.customerPhone}</p>
                      <p className="text-xs text-gray-600">✉️ {selectedOrder.customerEmail}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Delivery Address</p>
                      <p className="text-xs text-gray-700 mt-1 leading-relaxed">{selectedOrder.shippingAddress}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">Status:</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                  </div>

                  {/* Customer Cancellation Reason Banner */}
                  {selectedOrder.cancelReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-xs text-red-800 space-y-1">
                      <p className="font-bold uppercase tracking-wider">Customer Cancellation Reason:</p>
                      <p className="italic font-medium text-red-900 text-sm">"{selectedOrder.cancelReason}"</p>
                    </div>
                  )}

                  {/* Itemized Products List */}
                  <div>
                    <h3 className="font-bold text-primary mb-3 font-playfair text-lg">Itemized Order Products</h3>
                    <div className="space-y-3">
                      {selectedOrder.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-primary text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500">Unit Price: ₹{item.price.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold">{item.selectedSize || item.variant || 'Standard pack'} × {item.qty}</p>
                            <p className="font-black text-accent text-sm">₹{(item.price * item.qty).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Summary */}
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center font-bold text-lg">
                    <span className="text-primary">Total Sales Value</span>
                    <span className="text-accent text-2xl font-black">₹{selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default OrderManager;
