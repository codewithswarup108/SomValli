const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} = require('../controllers/orderController');

router.route('/')
  .post(createOrder)
  .get(getOrders);

router.route('/my-orders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById)
  .delete(deleteOrder);

router.route('/:id/status')
  .put(updateOrderStatus);

router.route('/:id/cancel')
  .put(cancelOrder);

module.exports = router;
