const Feedback = require('../models/feedbackModel');

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { name, email, phone, rating, text, image } = req.body;
    const feedback = new Feedback({ name, email, phone: phone || '', rating, text, image });
    const createdFeedback = await feedback.save();
    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFeedbacks, createFeedback };
