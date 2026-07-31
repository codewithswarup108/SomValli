import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { FiHeart, FiShoppingBag, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAvailableProductVariants, getProductVariants } from '../../constants/packSizes';
import VariantSelector from '../../components/ui/VariantSelector';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedPack, setSelectedPack] = useState('1kg');
  const [variants, setVariants] = useState<any[]>([]);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        const availableVariants = getAvailableProductVariants(data);
        const productVariants = getProductVariants(data);
        setVariants(productVariants.filter((variant: any) => variant.available));
        if (availableVariants[0]) setSelectedPack(availableVariants[0].size);
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

  // Determine price for selected pack/variant
  const variant = variants.find(v => (v.size || v.label) === selectedPack);
  const availableStock = Math.max(0, Number(product.countInStock) || 0);
  let itemPrice = 0;
  if (variant && Number(variant.price) >= 0) {
    itemPrice = Number(variant.price);
  } else {
    itemPrice = Number(product.price) || 0;
  }

  const handleAddToCart = () => {
    if (availableStock < 1) {
      toast.error('This product is out of stock.');
      return;
    }
    addToCart({ 
      ...product, 
      name: `${product.name} (${selectedPack})`,
      price: itemPrice,
      qty,
      variant: selectedPack,
    });
    toast.success(`${product.name} (${selectedPack} x${qty}) added to cart!`, { icon: '🛍️' });
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
              <span className="text-xs uppercase font-bold tracking-widest text-accent bg-primary/10 px-3 py-1 rounded-full">
                {product.category || 'SomValli Foods'}
              </span>
              <h1 className="text-4xl font-playfair font-black text-primary mt-3 mb-2">{product.name}</h1>
              
                <div className="flex items-baseline gap-4 mt-2">
                  <motion.span key={itemPrice} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black text-accent">₹{itemPrice.toFixed(2)}</motion.span>
                <span className="text-xs text-gray-500 font-bold">for {selectedPack} pack</span>
              </div>

              <p className="text-xs font-bold text-gray-500">Customer price for the selected pack</p>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>

            {/* Pack Size Selector */}
            <VariantSelector variants={variants} selectedVariant={selectedPack} onVariantChange={setSelectedPack} />

            {/* FSSAI & Quality Badges */}
            <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60 flex flex-wrap items-center gap-3 text-[11px] font-bold text-amber-900">
              <span className="flex items-center gap-1"><FiCheck className="text-green-600" /> 100% Vegetarian</span>
              <span className="flex items-center gap-1"><FiCheck className="text-green-600" /> Hygienically Packed</span>
              <span className="flex items-center gap-1"><FiCheck className="text-amber-600" /> FSSAI: 21524197000910</span>
            </div>

            <div className="border-t border-b border-gray-100 py-4 space-y-4">
              <div className="flex items-center gap-6">
                <span className="font-bold text-sm text-primary">Number of packs:</span>
                <select
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  disabled={availableStock < 1}
                  className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 shadow-sm font-bold text-primary focus:outline-none focus:border-accent"
                  aria-label="Select available quantity"
                >
                  {Array.from({ length: Math.max(1, availableStock) }, (_, index) => index + 1).map(quantity => (
                    <option key={quantity} value={quantity}>{quantity}</option>
                  ))}
                </select>
                <span className="text-xs font-semibold text-gray-500">{selectedPack} per pack</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={availableStock < 1}
              className="w-full bg-gradient-btn text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-200 shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <FiShoppingBag size={22} /> {availableStock < 1 ? 'Out of Stock' : `Add ${qty} to Cart • ₹${(itemPrice * qty).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
