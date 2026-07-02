import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  // Use a reliable short notification sound (from rawgit or similar public reliable source)
  // Since external links break, we use a basic HTML5 oscillator for a shiny "ding" sound
  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch (A5) for shiny effect
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); 
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.6);
    } catch(e) {
      console.log('Audio not supported', e);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email })
        });
        const data = await response.json();

        if (data.exists) {
          setRegistered(true);
          playSuccessSound();
          
          setTimeout(() => {
            setRegistered(false);
            setEmail('');
          }, 4000);
        } else {
          navigate('/register');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <>
      <footer className="bg-primary text-cream pt-16 pb-8 border-t border-accent/20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <h2 className="text-4xl font-playfair font-bold text-accent">SomValli</h2>
              <p className="text-gray-400 font-poppins text-sm leading-relaxed">
                Every Sip Tells a Story. Experience the finest selection of premium coffee beans roasted with passion.
              </p>
              <div className="flex gap-4 pt-4">
                <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent hover:scale-110 smooth-transition text-white">
                  <FiInstagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent hover:scale-110 smooth-transition text-white">
                  <FiFacebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent hover:scale-110 smooth-transition text-white">
                  <FiTwitter size={20} />
                </a>
                <a href="https://wa.me/917972666458" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-green-500 hover:scale-110 smooth-transition text-white">
                  <FaWhatsapp size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-playfair text-white">Quick Links</h3>
              <ul className="space-y-3 font-poppins text-sm">
                <li><a href="/#about" className="text-gray-400 hover:text-accent smooth-transition">About Us</a></li>
                <li><a href="/#menu" className="text-gray-400 hover:text-accent smooth-transition">Our Menu</a></li>
                <li><Link to="/blogs" className="text-gray-400 hover:text-accent smooth-transition">Coffee Blog</Link></li>
                <li><a href="/#contact" className="text-gray-400 hover:text-accent smooth-transition">Contact Us</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-playfair text-white">Contact Info</h3>
              <ul className="space-y-4 font-poppins text-sm">
                <li className="flex items-start gap-3 text-gray-400">
                  <FiMapPin className="text-accent mt-1 flex-shrink-0" size={20} />
                  <span>123 Luxury Avenue, Coffee District, Brew City 45678</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FiPhone className="text-accent flex-shrink-0" size={20} />
                  <a href="tel:7972666458" className="hover:text-accent smooth-transition">+91 7972666458</a>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FiMail className="text-accent flex-shrink-0" size={20} />
                  <a href="mailto:swarupholkar4@gmail.com" className="hover:text-accent smooth-transition">swarupholkar4@gmail.com</a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-playfair text-white">Newsletter</h3>
              <p className="text-gray-400 font-poppins text-sm">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
              <form onSubmit={handleRegister} className="flex flex-col gap-3">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your mail id" 
                  required
                  className="bg-secondary/20 border border-gray-700 rounded-lg px-4 py-3 text-white font-poppins text-sm placeholder-gray-500 focus:outline-none focus:border-accent"
                />
                <button type="submit" className="bg-gradient-btn hover:scale-105 text-white font-bold py-3 rounded-lg transition-transform font-montserrat tracking-widest uppercase text-sm">
                  Register
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 font-poppins text-sm">
              &copy; {new Date().getFullYear()} SomValli Coffee. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-poppins text-gray-500">
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* SUCCESS POPUP MODAL */}
      <AnimatePresence>
        {registered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-cream rounded-3xl p-10 max-w-md w-full text-center border-4 border-accent shadow-[0_0_50px_rgba(229,169,60,0.5)]"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-green-500/50"
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-3xl font-playfair font-black text-primary mb-4">Hurrayy!</h2>
              <p className="font-poppins text-gray-700 text-lg font-medium leading-relaxed">
                You Have Successfully Registered with Us!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;
