import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Welcome back, ${data.name}!`, { icon: '☕' });
        login(data, data.token);
        navigate('/');
      } else {
        toast.error(data.message || 'Login failed!');
      }
    } catch (error) {
      toast.error('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden bg-cream">
      {/* Background image overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1497935586351-b87a4ce41078?q=80&w=2000&auto=format&fit=crop"
          alt="Coffee Background"
          className="w-full h-full object-cover opacity-20 filter blur-sm mix-blend-multiply"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-primary/95 backdrop-blur-md p-10 md:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-accent/20"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-playfair font-bold text-accent mb-2">Welcome Back</h2>
          <p className="text-cream/80 font-poppins text-sm">Sign in to continue your SomValli journey.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-cream/90 mb-2 font-poppins">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-secondary/50 bg-secondary/10 text-white p-4 rounded-xl focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
              placeholder="swarup@somvalli.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-cream/90 mb-2 font-poppins">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-secondary/50 bg-secondary/10 text-white p-4 rounded-xl focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm font-poppins">
            <label className="flex items-center text-cream/80 cursor-pointer hover:text-accent transition">
              <input type="checkbox" className="mr-2 accent-accent cursor-pointer" />
              Remember me
            </label>
            <a href="#" className="text-accent hover:text-white transition-colors duration-200">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-btn text-white py-4 mt-6 rounded-xl font-bold tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 font-poppins text-cream/70 text-sm border-t border-secondary/30 pt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-bold hover:text-white transition-colors">
            Register Here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
