import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { 
  FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiArrowRight, 
  FiPackage, FiPlus, FiEdit2, FiTag, FiExternalLink, FiXCircle, FiGrid
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Order = {
  _id: string;
  customerName: string;
  customerPhone: string;
  orderItems: any[];
  totalPrice: number;
  status: string;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
};

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  countInStock: number;
};

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    Promise.all([
      fetch(`${apiBase}/api/orders`, { credentials: 'include' }).then(res => res.json()),
      fetch(`${apiBase}/api/products`, { credentials: 'include' }).then(res => res.json())
    ])
      .then(([ordersData, productsData]) => {
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(productsData)) setProducts(productsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [apiBase]);

  const totalOrders = orders.length;
  const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

  const recentOrders = orders.slice(0, 6);
  const topProducts = products.slice(0, 6);

  // Group products by category
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex min-h-screen bg-[#140D0C] font-poppins text-cream">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Admin Top Welcome Banner */}
        <div className="bg-gradient-to-r from-primary via-[#2D1B17] to-primary p-6 md:p-8 rounded-3xl border border-accent/30 shadow-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-accent/40">
                ⚡ SomValli Admin Control Center
              </span>
              <span className="text-xs text-cream/60">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-playfair font-black text-gradient-gold">
              Welcome, {user?.name || 'Store Owner'}!
            </h1>
            <p className="text-sm text-cream/70 mt-1">
              Manage your products, set prices, process orders, and view customer cancellation feedback.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/products"
              className="bg-accent text-primary px-4 py-2.5 rounded-2xl font-black text-xs uppercase hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
            >
              <FiPlus size={15} /> Add / Edit Products
            </Link>
            <Link
              to="/"
              target="_blank"
              className="bg-white/10 text-cream hover:text-accent px-4 py-2.5 rounded-2xl font-bold text-xs uppercase hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
            >
              <FiExternalLink size={15} /> Live Store
            </Link>
          </div>
        </div>

        {/* Quick Action Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/admin/products"
            className="bg-[#1F1412] hover:bg-[#2A1C19] p-4 rounded-2xl border border-accent/20 hover:border-accent transition-all group"
          >
            <div className="w-10 h-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center text-xl font-bold mb-2 group-hover:scale-110 transition-transform">
              <FiPackage />
            </div>
            <h4 className="font-bold text-sm text-cream">Add New Product</h4>
            <p className="text-[11px] text-cream/50 mt-0.5">List tea, chocolates, snacks</p>
          </Link>

          <Link
            to="/admin/products"
            className="bg-[#1F1412] hover:bg-[#2A1C19] p-4 rounded-2xl border border-accent/20 hover:border-accent transition-all group"
          >
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-xl font-bold mb-2 group-hover:scale-110 transition-transform">
              <FiEdit2 />
            </div>
            <h4 className="font-bold text-sm text-cream">Update Prices</h4>
            <p className="text-[11px] text-cream/50 mt-0.5">Change item prices instantly</p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-[#1F1412] hover:bg-[#2A1C19] p-4 rounded-2xl border border-accent/20 hover:border-accent transition-all group"
          >
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center text-xl font-bold mb-2 group-hover:scale-110 transition-transform">
              <FiShoppingBag />
            </div>
            <h4 className="font-bold text-sm text-cream">Manage Orders</h4>
            <p className="text-[11px] text-cream/50 mt-0.5">Update shipping statuses</p>
          </Link>

          <div className="bg-[#1F1412] p-4 rounded-2xl border border-accent/20">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center text-xl font-bold mb-2">
              <FiGrid />
            </div>
            <h4 className="font-bold text-sm text-cream">Categories ({Object.keys(categoryCounts).length})</h4>
            <p className="text-[11px] text-cream/50 mt-0.5">Multi-product catalog</p>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Sales Revenue */}
          <div className="bg-[#1F1412] p-6 rounded-2xl border border-accent/30 shadow-xl flex items-center gap-4 hover:border-accent transition-all">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl font-bold border border-emerald-500/40">
              <FiDollarSign />
            </div>
            <div>
              <p className="text-xs font-bold text-cream/50 uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">
                {loading ? '...' : `₹${totalRevenue.toFixed(2)}`}
              </h3>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-[#1F1412] p-6 rounded-2xl border border-accent/30 shadow-xl flex items-center gap-4 hover:border-accent transition-all">
            <div className="w-14 h-14 bg-accent/20 text-accent rounded-2xl flex items-center justify-center text-2xl font-bold border border-accent/40">
              <FiShoppingBag />
            </div>
            <div>
              <p className="text-xs font-bold text-cream/50 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-black text-cream mt-1">{loading ? '...' : totalOrders}</h3>
            </div>
          </div>

          {/* Listed Products */}
          <div className="bg-[#1F1412] p-6 rounded-2xl border border-accent/30 shadow-xl flex items-center gap-4 hover:border-accent transition-all">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-2xl font-bold border border-amber-500/40">
              <FiPackage />
            </div>
            <div>
              <p className="text-xs font-bold text-cream/50 uppercase tracking-wider">Active Products</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{loading ? '...' : products.length}</h3>
            </div>
          </div>

          {/* Active Pending Orders */}
          <div className="bg-[#1F1412] p-6 rounded-2xl border border-accent/30 shadow-xl flex items-center gap-4 hover:border-accent transition-all">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-bold border border-blue-500/40">
              <FiClock />
            </div>
            <div>
              <p className="text-xs font-bold text-cream/50 uppercase tracking-wider">Pending Orders</p>
              <h3 className="text-2xl font-black text-blue-400 mt-1">{loading ? '...' : pendingOrders}</h3>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Recent Orders & Catalog Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Recent Orders Section */}
          <div className="bg-[#1F1412] p-6 rounded-3xl border border-accent/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-playfair font-bold text-accent">Recent Customer Orders</h2>
                <p className="text-xs text-cream/60 mt-0.5">Real-time orders placed by customers</p>
              </div>
              <Link
                to="/admin/orders"
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/30"
              >
                View All <FiArrowRight />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12 text-cream/50 font-bold">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12 text-cream/50">No customer orders placed yet.</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div
                    key={order._id}
                    className="bg-[#2A1C19] p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 hover:border-accent/40 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-accent">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <h4 className="font-bold text-cream text-sm">{order.customerName}</h4>
                      <p className="text-xs text-cream/50">📞 {order.customerPhone}</p>
                      <p className="text-xs text-cream/60 mt-1">
                        {order.orderItems.map(item => `${item.name} (${item.selectedSize || item.variant || 'Standard pack'} × ${item.qty})`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-accent text-base">₹{order.totalPrice.toFixed(2)}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                        order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Product Manager Widget */}
          <div className="bg-[#1F1412] p-6 rounded-3xl border border-accent/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-playfair font-bold text-accent">Products Catalog & Prices</h2>
                <p className="text-xs text-cream/60 mt-0.5">Modify prices, delete, or add items</p>
              </div>
              <Link
                to="/admin/products"
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/30"
              >
                Manage Catalog <FiArrowRight />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12 text-cream/50 font-bold">Loading catalog...</div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-12 text-cream/50">No products added. Click "Manage Products" to add!</div>
            ) : (
              <div className="space-y-3">
                {topProducts.map(product => (
                  <div
                    key={product._id}
                    className="bg-[#2A1C19] p-3.5 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-accent/40 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-xl border border-accent/30 shrink-0"
                    />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-cream text-sm truncate">{product.name}</h4>
                      <span className="text-[10px] text-accent/80 font-bold bg-accent/10 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-accent text-base">₹{product.price.toFixed(2)}</p>
                      <span className="text-[10px] text-cream/50">Stock: {product.countInStock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Cancellations Feedback Widget */}
        {cancelledOrders.length > 0 && (
          <div className="bg-[#1F1412] p-6 rounded-3xl border border-red-500/30 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center text-xl font-bold">
                <FiXCircle />
              </div>
              <div>
                <h3 className="text-lg font-playfair font-bold text-red-400">Customer Cancellation Feedback</h3>
                <p className="text-xs text-cream/60">Reasons submitted by customers when cancelling orders</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cancelledOrders.slice(0, 4).map(o => (
                <div key={o._id} className="bg-[#2A1C19] p-4 rounded-2xl border border-red-500/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-cream text-sm">{o.customerName}</span>
                    <span className="text-xs font-mono text-cream/50">#{o._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-red-300 italic bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    "{o.cancelReason || 'No reason provided'}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardOverview;
