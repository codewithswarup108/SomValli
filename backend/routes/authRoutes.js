const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  checkEmail,
  sendAdminOtp,
  verifyAdminOtp,
  resetAdminPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/check-email', checkEmail);
router.route('/profile').get(protect, getUserProfile);

// Admin OTP Password Reset Flow
router.post('/send-otp', sendAdminOtp);
router.post('/verify-otp', verifyAdminOtp);
router.post('/reset-password', resetAdminPassword);

module.exports = router;
