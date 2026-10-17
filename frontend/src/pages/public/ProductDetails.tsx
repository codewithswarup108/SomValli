import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { apiUrl } from '../../utils/api';
import { FiHeart, FiShoppingBag, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetch(apiUrl(`/api/products/${id}`), { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center text-gray-500 font-bold font-poppins">
        Loading SomValli product details...
      </div>
    );
  }

  if (!product || product.message) {
    return (
      <div className="min-h-screen pt-32 text-center text-gray-500 font-poppins">
        <h2 className="text-2xl font-bold font-playfair mb-4">Product Not Found</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary text-cream px-6 py-2 rounded-full font-bold"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const availableStock = Math.max(0, Number(product.countInStock) || 0);

  const handleAddToCart = () => {
    if (availableStock < 1) {
      toast.error('This product is out of stock.');
      return;
    }
    addToCart({
      ...product,
      name: product.name,
      price: product.price || 0,
      qty,
    });
    toast.success(`${product.name} x${qty} added to cart!`, { icon: '🛍️' });
  };

  const productId = product._id || product.id;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream font-poppins text-primary">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-secondary font-bold hover:text-accent mb-8 transition-colors"
        >
          <FiArrowLeft size={20} /> Back to Product Catalog
        </Link>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-accent/20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-amber-50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[400px] object-cover"
            />
            <button
              onClick={() => {
                if (isInWishlist(productId)) {
                  removeFromWishlist(productId);
                  toast.success(`${product.name} removed from wishlist`);
                } else {
                  addToWishlist(product);
                  toast.success(`${product.name} added to wishlist!`);
                }
              }}
              className={`absolute top-4 left-4 p-3 rounded-full shadow-lg transition-all ${
                isInWishlist(productId)
                  ? 'bg-red-50 text-red-500 scale-110'
                  : 'bg-white/90 text-gray-400 hover:text-red-500'
              }`}
            >
              <FiHeart size={24} className={isInWishlist(productId) ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-playfair font-black text-primary mb-4">{product.name}</h1>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* FSSAI & Quality Badges */}
            <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60 flex flex-wrap items-center gap-3 text-[11px] font-bold text-amber-900">
              <span className="flex items-center gap-1"><FiCheck className="text-green-600" /> 100% Vegetarian</span>
              <span className="flex items-center gap-1"><FiCheck className="text-green-600" /> Hygienically Packed</span>
              <span className="flex items-center gap-1"><FiCheck className="text-amber-600" /> FSSAI: 21524197000910</span>
            </div>

            <div className="border-t border-b border-gray-100 py-4">
              <div className="flex items-center gap-6">
                <span className="font-bold text-sm text-primary">Quantity:</span>
                <select
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  disabled={availableStock < 1}
                  className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 shadow-sm font-bold text-primary focus:outline-none focus:border-accent"
                  aria-label="Select quantity"
                >
                  {Array.from({ length: Math.max(1, availableStock) }, (_, index) => index + 1).map(quantity => (
                    <option key={quantity} value={quantity}>{quantity}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={availableStock < 1}
              className="w-full bg-gradient-btn text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-200 shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <FiShoppingBag size={22} /> {availableStock < 1 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
