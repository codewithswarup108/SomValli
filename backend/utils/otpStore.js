/**
 * Simple in-memory OTP store.
 * { phone: { otp, expiresAt } }
 * OTPs expire after 10 minutes.
 */
const otpMap = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const saveOtp = (phone, otp) => {
  otpMap.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
};

const verifyOtp = (phone, otp) => {
  const record = otpMap.get(phone);
  if (!record) return { valid: false, reason: 'No OTP found for this number' };
  if (Date.now() > record.expiresAt) {
    otpMap.delete(phone);
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== otp) return { valid: false, reason: 'Incorrect OTP. Please try again.' };
  otpMap.delete(phone); // one-time use
  return { valid: true };
};

module.exports = { saveOtp, verifyOtp };
