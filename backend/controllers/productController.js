const Product = require('../models/productModel');
const { normalizeVariants } = require('../utils/packSizes');

const prepareProductVariants = (variants, price) => normalizeVariants(variants, price);
const serializeProduct = product => {
  const data = product.toObject ? product.toObject() : product;
  return {
    ...data,
    variants: (data.variants || []).map(variant => ({
      size: variant.size || variant.label,
      price: Number(variant.price) > 0 && Number.isFinite(Number(variant.price))
        ? Number(variant.price)
        : (variant.available !== false ? Number(data.price) || 0 : 0),
      available: variant.available !== false,
    })),
  };
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products.map(serializeProduct));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch products' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(serializeProduct(product));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message || 'Invalid product ID' });
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Public / Admin
const createProduct = async (req, res) => {
  try {
    const { name, price, shopPrice, retailPrice, description, image, category, countInStock, packSizes, variants } = req.body;

    if (!name || price === undefined || !description || !image || !category) {
      return res.status(400).json({ message: 'Please provide all required product details' });
    }

    const numPrice = Number(price);
    const product = new Product({
      name,
      price: numPrice,
      shopPrice: shopPrice !== undefined ? Number(shopPrice) : numPrice,
      retailPrice: retailPrice !== undefined ? Number(retailPrice) : numPrice,
      description,
      image,
      category,
      countInStock: countInStock !== undefined ? Math.max(0, Math.floor(Number(countInStock))) : 10,
      packSizes: packSizes || ['250g', '500g', '1kg'],
      variants: prepareProductVariants(variants, numPrice),
    });

    const createdProduct = await product.save();
    res.status(201).json(serializeProduct(createdProduct));
  } catch (error) {
    console.error('Error creating product:', error);
    const isValidationError = /Invalid pack size|Duplicate pack size|price is required/i.test(error.message || '');
    res.status(isValidationError ? 400 : 500).json({ message: error.message || 'Failed to create product' });
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Public / Admin
const updateProduct = async (req, res) => {
  try {
    const { name, price, shopPrice, retailPrice, description, image, category, countInStock, packSizes, variants } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      if (name) product.name = name;
      if (price !== undefined) {
        const numPrice = Number(price);
        product.price = numPrice;
        product.retailPrice = retailPrice !== undefined ? Number(retailPrice) : numPrice;
        product.shopPrice = shopPrice !== undefined ? Number(shopPrice) : numPrice;
      }
      if (shopPrice !== undefined) product.shopPrice = Number(shopPrice);
      if (retailPrice !== undefined) product.retailPrice = Number(retailPrice);
      if (description) product.description = description;
      if (image) product.image = image;
      if (category) product.category = category;
      if (countInStock !== undefined) product.countInStock = Math.max(0, Math.floor(Number(countInStock)));
      if (packSizes) product.packSizes = packSizes;
      if (variants) product.variants = prepareProductVariants(variants, product.price);

      const updatedProduct = await product.save();
      console.log(`Product "${updatedProduct.name}" price updated in MongoDB to ₹${updatedProduct.price} (Retail: ₹${updatedProduct.retailPrice}, Shop: ₹${updatedProduct.shopPrice})`);
      res.json(serializeProduct(updatedProduct));
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    const isValidationError = /Invalid pack size|Duplicate pack size|price is required/i.test(error.message || '');
    res.status(isValidationError ? 400 : 500).json({ message: error.message || 'Failed to update product' });
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Public / Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message || 'Failed to delete product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
