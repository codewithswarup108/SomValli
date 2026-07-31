const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Feedback = require('./models/feedbackModel');

dotenv.config();

const sampleFeedbacks = [
  { name: "Rahul Deshmukh", email: "rahul.deshmukh@gmail.com", phone: "9820145210", text: "The authentic SomValli Premium Masala Tea is just incredible! Uncompromising quality and taste.", rating: 5 },
  { name: "Priya Sharma", email: "priya.sharma@gmail.com", phone: "9819230411", text: "I've tried many gourmet snacks in India, but SomValli's Dry Fruit Laddoos and Masala Tea are exceptionally fresh and delicious.", rating: 5 },
  { name: "Arun Iyer", email: "arun.iyer@gmail.com", phone: "9769123840", text: "As a tea connoisseur, I can vouch for SomValli Masala Tea. Rich aroma, fantastic flavor, and pure ingredients.", rating: 4 },
  { name: "Sneha Patil", email: "sneha.patil@gmail.com", phone: "9833019284", text: "Brilliant packaging and lovely taste. The SomValli Chocolate Biscuits are my family's new favorite!", rating: 5 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Feedback.deleteMany();
    await Feedback.insertMany(sampleFeedbacks);
    console.log('Sample Feedbacks Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with Seeding: ${error.message}`);
    process.exit(1);
  }
};
seedDB();
