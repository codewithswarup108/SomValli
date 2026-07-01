const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL?.replace(/\/$/, '') // Safely remove trailing slash if present
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || true);
      } else {
        // Fallback for development if needed, or simply return the requested origin to see if it passes
        callback(null, allowedOrigins[0]);
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.send('SomValli API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));

// Error handling middleware can go here

module.exports = app;