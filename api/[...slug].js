require('dotenv').config();
const connectDB = require('../backend/config/db');
const app = require('../backend/app');

let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

ensureConnection().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
});

module.exports = app;
