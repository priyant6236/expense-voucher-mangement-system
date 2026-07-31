const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow requests from any origin in dev
  credentials: true
}));

// Body parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded files (signatures/receipts)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Expense Voucher Management System API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/voucher', require('./routes/voucher.routes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find route ${req.originalUrl} on this server`
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err, stack: err.stack })
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Expense Voucher API Server running on port ${PORT}`);
  console.log(`📁 Static Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`=======================================================`);
});
