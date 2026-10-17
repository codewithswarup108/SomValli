const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { normalizeIndianPhone } = require('../utils/phone');
const { saveOtp, verifyOtp: checkOtp } = require('../utils/otpStore');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Temporary reset-token store { token: { phone, expiresAt } }
const resetTokenMap = new Map();
const RESET_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const normalizedPhone = normalizeIndianPhone(phone);

  try {
    if (!normalizedPhone) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit Indian mobile number with +91.' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: normalizedPhone
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: normalizeIndianPhone(user.phone) || user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: normalizeIndianPhone(user.phone) || user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: normalizeIndianPhone(user.phone) || user.phone,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// OTP PASSWORD RESET FLOW (any registered user)
// ─────────────────────────────────────────────────────────────────

/** Generate a random 6-digit OTP */
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));



/** Send OTP via Email using nodemailer (Gmail) */
const sendOtpViaEmail = async (email, otp, name) => {
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPass  = process.env.SMTP_PASSWORD;
  if (!smtpEmail || !smtpPass) return false;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpEmail, pass: smtpPass },
    });
    await transporter.sendMail({
      from: `"SomValli Foods" <${smtpEmail}>`,
      to: email,
      subject: 'SomValli — Your OTP for Password Reset',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#1a0e0b;border-radius:16px;color:#f5f0eb">
          <h2 style="color:#c8924a;font-size:22px;margin-bottom:6px">SomValli Password Reset</h2>
          <p style="color:#c0a882;font-size:14px">Hi ${name || 'there'},</p>
          <p style="color:#c0a882;font-size:14px">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#2d1a15;border:2px solid #c8924a;border-radius:12px;padding:20px 32px;text-align:center;margin:24px 0">
            <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#c8924a">${otp}</span>
          </div>
          <p style="color:#888;font-size:12px">Do not share this OTP with anyone. SomValli will never ask for your OTP.</p>
        </div>
      `,
    });
    console.log(`✅ Email OTP sent to ${email}`);
    return true;
  } catch (err) {
    console.error('Email OTP send failed:', err.message);
    return false;
  }
};

// @desc    Send OTP to user's registered email
// @route   POST /api/auth/send-otp
// @access  Public
const sendAdminOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Please provide a phone number.' });
    }

    const normalizedPhone = normalizeIndianPhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ message: 'Please provide a valid Indian mobile number (e.g. 6307048821 or +916307048821).' });
    }

    // Find any user with this phone number (any role)
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this mobile number.' });
    }

    const otp = generateOtp();
    saveOtp(normalizedPhone, otp);

    const emailSent = await sendOtpViaEmail(user.email, otp, user.name);

    // Dev fallback — print OTP to console if email not configured
    if (!emailSent) {
      console.log(`\n🔐 [DEV] OTP for ${normalizedPhone}: ${otp}\n`);
    }

    const maskedEmail = user.email.replace(/(.{1})(.*)(@.*)/, '$1****$3');

    res.json({
      message: emailSent
        ? `OTP sent to your registered email ${maskedEmail}. Check your inbox.`
        : `[Dev] OTP printed to server console. Check terminal.`,
      maskedPhone: `+91 XXXXXX${normalizedPhone.slice(-4)}`,
    });
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and issue a short-lived reset token
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyAdminOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required.' });
    }

    const normalizedPhone = normalizeIndianPhone(phone);
    const result = checkOtp(normalizedPhone, otp.trim());

    if (!result.valid) {
      return res.status(400).json({ message: result.reason });
    }

    // Issue a one-time reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    resetTokenMap.set(resetToken, {
      phone: normalizedPhone,
      expiresAt: Date.now() + RESET_EXPIRY_MS,
    });

    res.json({
      message: 'OTP verified successfully!',
      resetToken,
    });
  } catch (error) {
    console.error('verifyAdminOtp error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset admin password using valid reset token
// @route   POST /api/auth/reset-password
// @access  Public (token-gated)
const resetAdminPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const record = resetTokenMap.get(resetToken);
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired reset token. Please start over.' });
    }
    if (Date.now() > record.expiresAt) {
      resetTokenMap.delete(resetToken);
      return res.status(400).json({ message: 'Reset token has expired. Please request a new OTP.' });
    }

    // Find any user with this phone number (any role)
    const user = await User.findOne({ phone: record.phone }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    user.password = newPassword; // pre-save hook will bcrypt this
    await user.save();

    resetTokenMap.delete(resetToken); // one-time use

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    console.error('resetAdminPassword error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  checkEmail,
  sendAdminOtp,
  verifyAdminOtp,
  resetAdminPassword,
};
