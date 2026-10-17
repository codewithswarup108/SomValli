import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { FiHeart, FiShoppingBag, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getAvailableProductVariants } from '../../constants/packSizes';
import { apiUrl } from '../../utils/api';


const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const loadProducts = () => {
      fetch(apiUrl('/api/products'), { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setProducts(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };

    loadProducts();

    // Auto-refresh catalog every 60 seconds so newly added/updated products appear
    const interval = setInterval(loadProducts, 60_000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      item.name.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleAddToCart = (item: any) => {
    const pack = getAvailableProductVariants(item)[0] || { size: '250g', price: item.price };
    const multiplier = pack.size === '250g' ? 0.25 : pack.size === '500g' ? 0.5 : 1;
    const packPrice = Number(pack.price) > 0 ? Number(pack.price) : Math.round(Number(item.price) * multiplier);
    addToCart({ ...item, name: `${item.name} (${pack.size})`, price: packPrice, variant: pack.size });
    toast.success(`${item.name} (${pack.size}) added to cart!`, { icon: '🛍️' });
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream text-primary font-poppins">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-playfair font-bold text-gradient-dark mb-4">SOMVALLI FOODS CATALOG</h1>
          <p className="text-secondary/80 max-w-xl mx-auto font-medium">
            <span className="text-accent italic font-bold">Quality You Can Taste, Trust You Can Feel.</span> Explore our official collection of Tea, Laddoos, Biscuits, Chocolates & Snacks.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-8 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  selectedCategory === cat
                    ? 'bg-primary text-accent shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search SomValli products by name or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-full py-3.5 pl-12 pr-6 focus:outline-none focus:border-accent shadow-sm"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold text-lg">Loading SomValli catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found matching "{searchQuery}".</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((item, idx) => (
              <motion.div
                key={item._id || item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group"
              >
                <div className="h-64 relative overflow-hidden bg-amber-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => {
                      const id = item._id || item.id;
                      if (isInWishlist(id)) {
                        removeFromWishlist(id);
                        toast.success(`${item.name} removed from wishlist`);
                      } else {
                        addToWishlist(item);
                        toast.success(`${item.name} added to wishlist!`);
                      }
                    }}
                    className={`absolute top-4 left-4 p-2.5 rounded-full shadow-md transition-all ${
                      isInWishlist(item._id || item.id)
                        ? 'bg-red-50 text-red-500 scale-110'
                        : 'bg-white/80 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <FiHeart size={20} className={isInWishlist(item._id || item.id) ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-playfair font-black text-primary mb-3">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-4 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/product/${item._id || item.id}`}
                      className="w-1/2 py-3 text-center border-2 border-gray-300 rounded-full font-bold text-sm text-primary hover:border-primary transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-1/2 bg-gradient-btn text-white py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
                    >
                      <FiShoppingBag size={16} /> Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
