const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add product name'],
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      required: [true, 'Please select or enter a category'],
      default: 'General',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    shopPrice: {
      type: Number,
      default: 0,
    },
    retailPrice: {
      type: Number,
      default: 0,
    },
    packSizes: {
      type: [String],
      default: ['250g', '500g', '1kg'],
    },
    // Per-quantity variants: label (e.g. '250g'), price for that variant, and availability flag
    variants: {
      type: [
        {
          size: { type: String, required: true, trim: true },
          // Kept for old documents; controllers normalize label to size on writes.
          label: { type: String },
          price: { type: Number, required: true, default: 0 },
          available: { type: Boolean, default: true },
        }
      ],
      default: [
        { size: '250g', price: 0, available: true },
      ],
    },
    countInStock: {
      type: Number,
      required: true,
      default: 100,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 5.0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 24,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
