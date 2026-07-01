const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Feedback = require('./models/feedbackModel');

dotenv.config();

const sampleFeedbacks = [
  { name: "Rahul Deshmukh", text: "The aroma of the filter coffee is just like my grandmother used to make! Absolutely authentic and fresh.", rating: 5 },
  { name: "Priya Sharma", text: "I've tried many luxury coffees in India, but SomValli's Masala Roast is incredibly unique and refreshing.", rating: 5 },
  { name: "Arun Iyer", text: "As a coffee connoisseur from Coorg, I can vouch for the Arabica Select. It has fantastic body and a smooth finish.", rating: 4 },
  { name: "Sneha Patil", text: "Brilliant packaging and lovely taste. The Malabar Monsoon blend is my new morning favorite!", rating: 5 }
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
