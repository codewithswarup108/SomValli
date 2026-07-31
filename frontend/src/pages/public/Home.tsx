import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { FiHeart, FiCamera, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAvailableProductVariants } from '../../constants/packSizes';
import { Link } from 'react-router-dom';

const Home = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const [showLocation, setShowLocation] = useState(false);
  const [products, setProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackImage, setFeedbackImage] = useState<string | null>(null);

  // Auto-scroll Feedback Carousel
  const feedbackScrollRef = useRef<HTMLDivElement>(null);
  const [isHoveredFeedbacks, setIsHoveredFeedbacks] = useState(false);

  useEffect(() => {
    if (feedbacks.length === 0 || isHoveredFeedbacks) return;

    const interval = setInterval(() => {
      if (feedbackScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = feedbackScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          feedbackScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          feedbackScrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [feedbacks, isHoveredFeedbacks]);

  const scrollFeedbacks = (direction: 'left' | 'right') => {
    if (feedbackScrollRef.current) {
      const amount = direction === 'left' ? -340 : 340;
      feedbackScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Hero Video State
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
  };

  const handleReplayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsVideoEnded(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeedbackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feedbacks`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(err => console.error(err));
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;

    const form = e.target as HTMLFormElement;
    const ratingStr = (form.elements.namedItem('rating') as HTMLSelectElement).value;
    const rating = parseInt(ratingStr.split(' ')[0]);
    const text = (form.elements.namedItem('experience') as HTMLTextAreaElement).value;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: user.name, email: user.email, phone: user.phone || '', rating, text, image: feedbackImage })
      });
      const newFeedback = await response.json();
      setFeedbacks([newFeedback, ...feedbacks]);
      toast.success('Thank you for your valuable feedback!');
      form.reset();
      setFeedbackImage(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (item: any) => {
    const pack = getAvailableProductVariants(item)[0] || { size: '250g', price: item.price };
    addToCart({ ...item, name: `${item.name} (${pack.size})`, price: pack.price || item.price, variant: pack.size });
    toast.success(`${item.name} (${pack.size}) added to cart!`, { icon: '☕' });
  };

  return (
    <div className="w-full">
      {/* PREMIUM HERO VIDEO SECTION */}
      <section id="home" className="relative h-[100vh] w-full flex flex-col justify-end items-center overflow-hidden bg-black">
        {/* Cinematic Video Player */}
        <video
          ref={videoRef}
          src="/hero-video.mp4"
          muted
          autoPlay
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${isVideoEnded ? 'opacity-75 filter contrast-110 brightness-90' : 'opacity-100'
            }`}
        />

        {/* Premium Dark Vignette & Gradient Overlay */}
        <div
          className={`absolute inset-0 z-10 transition-colors duration-1000 pointer-events-none ${isVideoEnded
              ? 'bg-gradient-to-t from-primary/95 via-black/40 to-black/50'
              : 'bg-gradient-to-t from-black/80 via-transparent to-black/30'
            }`}
        />

        {/* Interactive Bottom Control Bar */}
        <div className="relative z-20 flex flex-col items-center mb-12 text-center">
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            href="#menu"
            className="bg-gradient-btn hover:scale-110 transition-transform duration-300 text-white px-10 py-4 rounded-full font-montserrat font-bold shadow-[0_0_30px_rgba(229,169,60,0.7)] uppercase tracking-widest text-sm flex items-center gap-2"
          >
            <span>Explore Premium Products</span>
            <span className="text-lg">↓</span>
          </motion.a>

          {/* Replay Video Trigger */}
          {isVideoEnded && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleReplayVideo}
              className="mt-4 text-xs font-bold text-cream/70 hover:text-accent flex items-center gap-1.5 transition-colors bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10"
            >
              <FiRefreshCw size={12} /> Replay Cinematic Video
            </motion.button>
          )}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-32 w-full relative">
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-playfair font-bold text-gradient-gold mb-8">Our Philosophy</h2>
            <div className="h-1 w-24 bg-accent mx-auto mb-10 rounded-full"></div>
            <p className="text-black max-w-4xl mx-auto text-xl md:text-2xl leading-relaxed font-poppins font-bold">
              At SomValli – <span className="text-accent italic">Taste it, Feel it</span>, our passion is to bring India's finest gourmet products to every home. From premium Assam & Masala Tea Powders to rich Dark Chocolates, handmade Butter Biscuits, aromatic Spices, and gourmet Snacks, every SomValli creation is crafted with uncompromising quality, freshness, and authentic taste.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MENU SECTION */}
      <section id="menu" className="py-32 bg-cream text-primary w-full relative">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-playfair font-bold text-gradient-dark mb-4">Official Product Catalog</h2>
            <p className="text-secondary/80 font-poppins text-lg uppercase tracking-widest font-bold">
              Quality You Can Taste • Trust You Can Feel
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-bold text-primary">
              <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full">🌱 100% Vegetarian</span>
              <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full">✨ Premium Ingredients</span>
              <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full">🛡️ Hygienically Packed</span>
              <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full">📜 FSSAI Lic: 21524197000910</span>
            </div>
          </motion.div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((item: any, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border-2 border-transparent product-card-hover relative cursor-pointer flex flex-col shadow-lg"
              >
                <div className="h-64 bg-gold-200 relative">
                  <img src={item.image} className="w-full h-full object-cover smooth-transition" alt={item.name} />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isInWishlist(item._id || item.id)) {
                        removeFromWishlist(item._id || item.id);
                        toast.success(`${item.name} removed from wishlist`);
                      } else {
                        addToWishlist(item);
                        toast.success(`${item.name} added to wishlist!`);
                      }
                    }}
                    className={`absolute top-4 left-4 p-2 rounded-full shadow-lg transition-all ${isInWishlist(item._id || item.id)
                      ? 'bg-red-50 text-red-500 scale-110'
                      : 'bg-white/80 text-gray-400 hover:text-red-500 hover:scale-110'
                      }`}
                  >
                    <FiHeart size={20} className={isInWishlist(item._id || item.id) ? 'fill-current' : ''} />
                  </button>

                  <div className="absolute top-4 right-4 bg-primary text-accent font-black px-4 py-1.5 rounded-full shadow-lg text-sm">
                    ₹{getAvailableProductVariants(item)[0]?.price || item.price}
                  </div>
                </div>
                <div className="p-6 relative bg-white flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md mb-2 inline-block">
                      {item.category}
                    </span>
                    <h3 className="text-2xl font-playfair font-black mb-2 text-primary">{item.name}</h3>
                    <p className="text-gray-600 font-poppins text-xs mb-4 line-clamp-3">{item.description}</p>

                    {/* Pack Sizes */}
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 mb-6 flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-500">Pack Sizes:</span>
                      <span className="font-bold text-accent">{getAvailableProductVariants(item).map(variant => variant.size).join(' | ')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-3 rounded-full border-2 border-primary text-primary hover:bg-gradient-btn hover:text-white smooth-transition font-bold tracking-widest uppercase hover:scale-105 active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION WITH DETAIL POPUP */}
      <section id="contact" className="py-32 w-full relative bg-primary">
        <div className="container mx-auto px-4 md:px-8 text-center text-cream">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-playfair font-bold text-accent mb-12"
          >
            Visit SOMVALLI FOODS
          </motion.h2>

          <div
            className="relative inline-block cursor-help max-w-2xl"
            onMouseEnter={() => setShowLocation(true)}
            onMouseLeave={() => setShowLocation(false)}
          >
            <div className="p-8 rounded-3xl border-2 border-secondary/50 bg-secondary/10 backdrop-blur-md hover:border-accent hover:bg-secondary/30 transition-colors duration-200">
              <h3 className="text-3xl font-playfair mb-4 text-white hover:text-accent font-bold">Store Location</h3>
              <p className="font-poppins text-lg opacity-90 mb-2 font-medium">Somvalli Foods, Shop No. 4, Shantipoli, Tehsil: Shahapur</p>
              <p className="font-poppins text-sm opacity-70 mb-4">Pin Code: 421601, District: Thane, Maharashtra.</p>
              <p className="font-poppins text-xs text-accent font-bold">📞 Contact: 7972666458 | ✉️ somvallifoods@gmail.com</p>
            </div>

            {/* Popup Card */}
            <AnimatePresence>
              {showLocation && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: -20, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-cream text-primary p-6 rounded-2xl shadow-[0_15px_40px_rgba(229,169,60,0.3)] z-50 text-left border-2 border-accent"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-accent text-xl font-bold">SH</div>
                    <div>
                      <p className="font-bold font-poppins text-lg">Swarup Holkar</p>
                      <p className="text-xs text-gray-500 font-montserrat uppercase font-bold">Owner</p>
                    </div>
                  </div>
                  <div className="space-y-2 font-poppins text-sm mb-4 bg-gray-100 p-3 rounded-lg">
                    <p><strong>📞 Phone:</strong> <a href="tel:7972666458" className="hover:text-accent smooth-transition">7972666458</a></p>
                    <p><strong>✉️ Mail:</strong> <a href="mailto:swarupholkar4@gmail.com" className="hover:text-accent smooth-transition">swarupholkar4@gmail.com</a></p>
                    <p><strong>📍 Addr:</strong>Somvalli Foods, Shop No. 4, Shantipoli, Tehsil: Shahapur</p>
                    <p className="font-poppins text-sm opacity-70 mb-4">Pin Code: 421601, District: Thane, Maharashtra</p>
                  </div>
                  <p className="text-center font-playfair font-bold text-accent italic border-t border-gray-200 pt-3">
                    "SomValli - Taste it, Feel it"
                  </p>
                  {/* Triangle pointer */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-cream border-b-2 border-r-2 border-accent transform rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FEEDBACK & TESTIMONIALS SECTION */}
      <section id="feedback" className="py-32 w-full relative bg-cream border-t 8 border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-playfair font-bold text-primary mb-6">Customer Experience</h2>
            <p className="text-secondary/80 font-poppins text-lg uppercase tracking-widest font-bold">What our family says</p>
          </motion.div>

          <div className="relative group/carousel mb-16">
            {/* Left Scroll Arrow */}
            <button
              onClick={() => scrollFeedbacks('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-primary/90 hover:bg-accent text-accent hover:text-primary p-3 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 -ml-4 md:-ml-6"
              aria-label="Scroll left"
            >
              <FiChevronLeft size={22} />
            </button>

            {/* Right Scroll Arrow */}
            <button
              onClick={() => scrollFeedbacks('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-primary/90 hover:bg-accent text-accent hover:text-primary p-3 rounded-full shadow-2xl backdrop-blur-md transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:scale-110 -mr-4 md:-mr-6"
              aria-label="Scroll right"
            >
              <FiChevronRight size={22} />
            </button>

            <div
              ref={feedbackScrollRef}
              onMouseEnter={() => setIsHoveredFeedbacks(true)}
              onMouseLeave={() => setIsHoveredFeedbacks(false)}
              className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {feedbacks.map((review: any, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col min-w-[320px] max-w-[360px] snap-start shrink-0"
                >
                  <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
                    <div className="w-10 h-10 bg-gradient-btn rounded-full flex items-center justify-center text-white font-bold text-lg uppercase flex-shrink-0">
                      {review.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden min-w-0 flex-1">
                      <p className="font-bold font-poppins text-primary truncate text-base">{review.name}</p>
                      <p className="text-[11px] text-gray-500 font-poppins truncate leading-snug">
                        ✉️ {review.email || 'N/A'}
                      </p>
                      {review.phone ? (
                        <p className="text-[11px] text-gray-500 font-poppins truncate leading-snug">
                          📞 {review.phone}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex text-accent mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-accent text-lg' : 'text-gray-300 text-lg'}>★</span>
                    ))}
                  </div>
                  <p className="font-poppins text-gray-700 flex-grow text-sm mb-4 leading-relaxed">"{review.text}"</p>
                  {review.image ? (
                    <img src={review.image} alt="User feedback" className="w-full h-36 object-cover rounded-xl mt-auto shadow-sm" />
                  ) : null}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-accent/20">
            <h3 className="text-2xl font-playfair font-bold text-center mb-6 text-primary">Leave Your Feedback</h3>

            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="font-poppins text-gray-600 mb-6">Please log in to leave an authentic review and share photos.</p>
                <Link to="/login" className="bg-gradient-btn text-white px-8 py-3 rounded-xl font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-200 inline-block">
                  Log In to Review
                </Link>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4 relative">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold uppercase">
                      {user?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                    ✓ Verified
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Rating (1-5)</label>
                  <select name="rating" className="w-full border p-3 rounded-xl bg-gray-50 focus:outline-none focus:border-accent shadow-sm">
                    <option>5 - Excellent</option>
                    <option>4 - Very Good</option>
                    <option>3 - Good</option>
                    <option>2 - Fair</option>
                    <option>1 - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Your Experience</label>
                  <textarea name="experience" required className="w-full border p-3 rounded-xl bg-gray-50 focus:outline-none focus:border-accent shadow-sm" rows={3} placeholder="Tell us what you loved..."></textarea>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Attach Photo (Optional)</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-primary text-cream px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all font-poppins text-sm font-bold">
                      <FiCamera size={18} /> Choose Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {feedbackImage && (
                      <div className="relative group">
                        <img src={feedbackImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border-2 border-accent" />
                        <button type="button" onClick={() => setFeedbackImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg hover:scale-110">×</button>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-btn text-white py-4 mt-4 rounded-xl font-bold tracking-widest uppercase hover:opacity-90 transition-opacity">
                  Submit Authentic Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
