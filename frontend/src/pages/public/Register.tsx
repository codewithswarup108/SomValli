import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Account created successfully! Welcome ${data.name}!`, { icon: '🎉' });
        localStorage.setItem('somvalli_token', data.token);
        localStorage.setItem('somvalli_user', JSON.stringify(data));
        navigate('/');
      } else {
        toast.error(data.message || 'Registration failed!');
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
          src="https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=2000&auto=format&fit=crop"
          alt="Coffee Beans Background"
          className="w-full h-full object-cover opacity-20 filter blur-sm mix-blend-multiply"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-primary/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-accent/20 my-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-playfair font-bold text-accent mb-2">Join SomValli</h2>
          <p className="text-cream/80 font-poppins text-sm">Create an account to start ordering our premium blends.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-cream/90 mb-2 font-poppins">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-secondary/50 bg-secondary/10 text-white p-3.5 rounded-xl focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
              placeholder="Swarup Holkar"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-cream/90 mb-2 font-poppins">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-secondary/50 bg-secondary/10 text-white p-3.5 rounded-xl focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
                placeholder="swarup@somvalli.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-cream/90 mb-2 font-poppins">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full border-2 border-secondary/50 bg-secondary/10 text-white p-3.5 rounded-xl focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
                placeholder="+91 7972666458"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-cream/90 mb-2 font-poppins">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full border-2 border-secondary/50 bg-secondary/10 text-white p-3.5 rounded-xl focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-cream/90 mb-2 font-poppins">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border-2 border-secondary/50 bg-secondary/10 text-white p-3.5 rounded-xl focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-btn text-white py-4 mt-8 rounded-xl font-bold tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 font-poppins text-cream/70 text-sm border-t border-secondary/30 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-bold hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
