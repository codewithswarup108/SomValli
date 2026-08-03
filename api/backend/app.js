const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ CORS Configuration (FIXED)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://somvallifoods.in',
  'https://www.somvallifoods.in',
  'https://som-valli-qnrurby9x-codewithswarup108s-projects.vercel.app',
  'https://som-valli-9a3pv6r87-codewithswarup108s-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or Postman requests
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');

      if (allowedOrigins.includes(cleanOrigin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", cleanOrigin);
        callback(new Error("Not allowed by CORS"));
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
app.use('/api/orders', require('./routes/orderRoutes'));

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: 'Server error' });
});

module.exports = app;
