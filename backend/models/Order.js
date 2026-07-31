const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
    },
    shippingAddress: {
      type: String,
      required: [true, 'Shipping address is required'],
    },
    orderItems: [
      {
        product: {
          type: String,
          required: false,
        },
        name: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        variant: { type: String, default: '' },
        selectedSize: { type: String, default: '' },
      },
    ],
    paymentMethod: {
      type: String,
      default: 'WhatsApp/Offline',
    },
    transactionId: {
      type: String,
      default: '',
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    cancelReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
