import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPhone, FiLock, FiKey, FiX, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { BASE_API_URL } from '../../utils/api';

type ResetStep = 'phone' | 'otp' | 'newpass' | 'done';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const apiBase = BASE_API_URL;

  // ── Forgot Password Modal State ──────────────────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('phone');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const openForgot = () => {
    setResetStep('phone');
    setResetPhone('');
    setResetOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setMaskedPhone('');
    setShowForgot(true);
  };

  const closeForgot = () => setShowForgot(false);

  // Step 1 — Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPhone.trim()) return toast.error('Please enter your registered mobile number.');
    setResetLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: resetPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to send OTP');
      setMaskedPhone(data.maskedPhone || '');
      toast.success(data.message, { icon: '📱' });
      setResetStep('otp');
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtp.trim().length !== 6) return toast.error('Enter the 6-digit OTP.');
    setResetLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: resetPhone.trim(), otp: resetOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Incorrect OTP');
      setResetToken(data.resetToken);
      toast.success('OTP verified! Set your new password.', { icon: '✅' });
      setResetStep('newpass');
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 3 — Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match!');
    setResetLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || 'Failed to reset password');
      toast.success('Password reset successfully! Login with your new password.', { icon: '🎉' });
      setResetStep('done');
    } catch {
      toast.error('Server error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
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
    } catch {
      toast.error('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step labels & icons ─────────────────────────────────────
  const stepConfig: Record<ResetStep, { icon: React.ReactNode; title: string; subtitle: string }> = {
    phone: {
      icon: <FiPhone size={28} className="text-accent" />,
      title: 'Forgot Password?',
      subtitle: 'Enter your registered mobile number. An OTP will be sent to your registered email.',
    },
    otp: {
      icon: <FiKey size={28} className="text-accent" />,
      title: 'Enter OTP',
      subtitle: `A 6-digit OTP was sent to ${maskedPhone}. Check your messages.`,
    },
    newpass: {
      icon: <FiLock size={28} className="text-accent" />,
      title: 'Set New Password',
      subtitle: 'OTP verified! Choose a strong new password for your account.',
    },
    done: {
      icon: <FiCheckCircle size={28} className="text-green-400" />,
      title: 'All Done!',
      subtitle: 'Your password has been reset. You can now log in.',
    },
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
            <label className="block text-sm font-bold text-cream/90 mb-2 font-poppins">Email / Username</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-secondary/50 bg-secondary/10 text-white p-4 rounded-xl focus:outline-none focus:border-accent transition-colors placeholder:text-gray-400"
              placeholder="PritamHajare@somvalliowner"
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
            <button
              type="button"
              onClick={openForgot}
              className="text-accent hover:text-white transition-colors duration-200 font-bold"
            >
              Forgot Password?
            </button>
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

      {/* ── Forgot Password Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForgot}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative z-10 bg-primary w-full max-w-sm rounded-3xl shadow-2xl border border-accent/20 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary to-primary p-6 pb-5 relative">
                <button
                  onClick={closeForgot}
                  className="absolute top-4 right-4 text-cream/60 hover:text-accent transition-colors"
                >
                  <FiX size={20} />
                </button>

                {/* Step indicator */}
                <div className="flex gap-2 mb-4">
                  {(['phone', 'otp', 'newpass'] as ResetStep[]).map((s, i) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        ['phone', 'otp', 'newpass', 'done'].indexOf(resetStep) > i ||
                        resetStep === s
                          ? 'bg-accent'
                          : 'bg-cream/20'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-primary/40 p-2.5 rounded-xl">
                    {stepConfig[resetStep].icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-playfair font-bold text-accent">
                      {stepConfig[resetStep].title}
                    </h3>
                    <p className="text-xs text-cream/70 mt-0.5 font-poppins leading-relaxed">
                      {stepConfig[resetStep].subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 font-poppins">
                <AnimatePresence mode="wait">
                  {/* Step 1: Phone */}
                  {resetStep === 'phone' && (
                    <motion.form
                      key="step-phone"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      onSubmit={handleSendOtp}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-cream/80 mb-2 uppercase tracking-wider">
                          Registered Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={resetPhone}
                          onChange={e => setResetPhone(e.target.value)}
                          placeholder="Your 10-digit mobile number"
                          className="w-full bg-secondary/20 border-2 border-secondary/40 text-white rounded-xl p-3.5 text-sm focus:outline-none focus:border-accent placeholder:text-gray-500 transition-colors"
                        />
                        <p className="text-[11px] text-cream/50 mt-1.5">
                          Enter the mobile number registered with your account.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-btn text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-60"
                      >
                        {resetLoading ? 'Sending OTP...' : <>Send OTP <FiArrowRight /></>}
                      </button>
                    </motion.form>
                  )}

                  {/* Step 2: OTP */}
                  {resetStep === 'otp' && (
                    <motion.form
                      key="step-otp"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      onSubmit={handleVerifyOtp}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-cream/80 mb-2 uppercase tracking-wider">
                          6-Digit OTP
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={resetOtp}
                          onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 482917"
                          className="w-full bg-secondary/20 border-2 border-secondary/40 text-white rounded-xl p-3.5 text-sm text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:border-accent placeholder:tracking-normal placeholder:text-sm placeholder:font-poppins transition-colors"
                        />
                        <p className="text-[11px] text-cream/50 mt-1.5">
                          OTP expires in 10 minutes.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-btn text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-60"
                      >
                        {resetLoading ? 'Verifying...' : <>Verify OTP <FiArrowRight /></>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetStep('phone')}
                        className="w-full text-cream/50 hover:text-accent text-xs py-1 transition-colors"
                      >
                        ← Didn't receive? Go back
                      </button>
                    </motion.form>
                  )}

                  {/* Step 3: New Password */}
                  {resetStep === 'newpass' && (
                    <motion.form
                      key="step-newpass"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      onSubmit={handleResetPassword}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-cream/80 mb-2 uppercase tracking-wider">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full bg-secondary/20 border-2 border-secondary/40 text-white rounded-xl p-3.5 text-sm focus:outline-none focus:border-accent placeholder:text-gray-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-cream/80 mb-2 uppercase tracking-wider">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className={`w-full bg-secondary/20 border-2 rounded-xl p-3.5 text-sm focus:outline-none transition-colors placeholder:text-gray-500 text-white ${
                            confirmPassword && confirmPassword !== newPassword
                              ? 'border-red-500 focus:border-red-400'
                              : 'border-secondary/40 focus:border-accent'
                          }`}
                        />
                        {confirmPassword && confirmPassword !== newPassword && (
                          <p className="text-red-400 text-[11px] mt-1">Passwords do not match</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading || (!!confirmPassword && confirmPassword !== newPassword)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-btn text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-60"
                      >
                        {resetLoading ? 'Resetting...' : <>Reset Password <FiLock /></>}
                      </button>
                    </motion.form>
                  )}

                  {/* Step 4: Done */}
                  {resetStep === 'done' && (
                    <motion.div
                      key="step-done"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4 space-y-4"
                    >
                      <div className="text-6xl">🎉</div>
                      <p className="text-cream/80 text-sm">
                        Your password has been successfully reset. Close this window and log in with your new password.
                      </p>
                      <button
                        onClick={closeForgot}
                        className="w-full bg-gradient-btn text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all"
                      >
                        Go to Login
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
