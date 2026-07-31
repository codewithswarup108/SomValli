const Order = require('../models/Order');
const Product = require('../models/productModel');
const { normalizeIndianPhone } = require('../utils/phone');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public / Private
const createOrder = async (req, res) => {
  try {
    const {
      user,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      orderItems,
      totalPrice,
      paymentMethod,
      transactionId,
      isPaid,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      return res.status(400).json({ message: 'Please provide all required customer details' });
    }

    if (!/^\+91[6-9]\d{9}$/.test(customerPhone)) {
      return res.status(400).json({ message: 'Please provide a valid Indian mobile number in +91XXXXXXXXXX format' });
    }

    const requestedItems = orderItems.map(item => ({
      ...item,
      product: String(item.product).split('::')[0],
      qty: Number(item.qty),
      selectedSize: item.selectedSize || item.variant || '',
    }));

    if (requestedItems.some(item => !item.product || !Number.isInteger(item.qty) || item.qty < 1)) {
      return res.status(400).json({ message: 'Order quantities must be positive whole numbers' });
    }

    const stockUpdates = [];
    for (const item of requestedItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `${item.name || 'A product'} is no longer available` });
      }

      const productVariants = Array.isArray(product.variants) ? product.variants : [];
      const selectedVariant = productVariants.find(variant =>
        (variant.size || variant.label) === item.selectedSize && variant.available !== false
      ) || (!item.selectedSize ? productVariants.find(variant => variant.available !== false) : null);

      if (!selectedVariant) {
        return res.status(400).json({ message: `${item.name || 'A product'} pack size is no longer available` });
      }

      const variantPrice = Number(selectedVariant.price);
      if (!Number.isFinite(variantPrice) || Number(item.price) !== variantPrice) {
        return res.status(400).json({ message: `${item.name || 'A product'} price changed. Please refresh and try again` });
      }
      item.selectedSize = selectedVariant.size || selectedVariant.label;
      item.variant = item.selectedSize;
      item.price = variantPrice;

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, countInStock: { $gte: item.qty } },
        { $inc: { countInStock: -item.qty } },
        { new: true }
      );

      if (!updatedProduct) {
        for (const update of stockUpdates) {
          await Product.findByIdAndUpdate(update.product, { $inc: { countInStock: update.qty } });
        }
        return res.status(400).json({ message: `${item.name || 'A product'} does not have enough stock` });
      }
      stockUpdates.push({ product: item.product, qty: item.qty });
    }

    const order = new Order({
      user: user || req.user?._id || undefined,
      customerName,
      customerEmail: customerEmail || 'N/A',
      customerPhone,
      shippingAddress,
      orderItems: requestedItems,
      totalPrice: requestedItems.reduce((acc, item) => acc + item.price * item.qty, 0),
      paymentMethod: paymentMethod || 'WhatsApp / COD',
      transactionId: transactionId || '',
      isPaid: typeof isPaid === 'boolean' ? isPaid : false,
      status: 'Pending',
    });

    let createdOrder;
    try {
      createdOrder = await order.save();
    } catch (error) {
      for (const update of stockUpdates) {
        await Product.findByIdAndUpdate(update.product, { $inc: { countInStock: update.qty } });
      }
      throw error;
    }
    console.log(`Order ${createdOrder._id} created via ${createdOrder.paymentMethod} (Paid: ${createdOrder.isPaid}, Txn: ${createdOrder.transactionId})`);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Public / Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// @desc    Get user specific orders (My Orders)
// @route   GET /api/orders/my-orders
// @access  Public / Private
const getMyOrders = async (req, res) => {
  try {
    const { email, phone, userId } = req.query;
    const queryConditions = [];

    if (userId) queryConditions.push({ user: userId });
    if (req.user?._id) queryConditions.push({ user: req.user._id });
    if (email) queryConditions.push({ customerEmail: email });
    if (phone) {
      const normalizedPhone = normalizeIndianPhone(phone);
      queryConditions.push({ customerPhone: normalizedPhone || phone });
      if (normalizedPhone) queryConditions.push({ customerPhone: normalizedPhone.slice(3) });
    }

    let query = {};
    if (queryConditions.length > 0) {
      query = { $or: queryConditions };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch order history' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public / Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ message: 'Invalid order ID or server error' });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Public / Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, isPaid, cancelReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      if (status) {
        order.status = status;
      }
      if (typeof isPaid === 'boolean') {
        order.isPaid = isPaid;
      }
      if (cancelReason) {
        order.cancelReason = cancelReason;
        order.cancelledAt = new Date();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// @desc    Cancel order with mandatory reason (Customer)
// @route   PUT /api/orders/:id/cancel
// @access  Public / Private
const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    if (!cancelReason || !cancelReason.trim()) {
      return res.status(400).json({ message: 'A cancellation reason is compulsory.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled.' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled.' });
    }

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.qty } });
    }

    order.status = 'Cancelled';
    order.cancelReason = cancelReason.trim();
    order.cancelledAt = new Date();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message || 'Failed to cancel order' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Public / Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};
