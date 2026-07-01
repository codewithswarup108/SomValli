const express = require('express');
const router = express.Router();
const { getFeedbacks, createFeedback } = require('../controllers/feedbackController');

router.route('/').get(getFeedbacks).post(createFeedback);

module.exports = router;
