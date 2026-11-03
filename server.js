
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables locally
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: path.resolve(__dirname, '.env')
  });
}

const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

const app = express();

// Render port configuration
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'BassIT Backend is Running Successfully!',
    status: 'OK'
  });
});

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    server: 'Running',
    database: mongoose.connection.readyState === 1
      ? 'Connected'
      : 'Disconnected'
  });
});

// API Routes
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: 'API route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  res.status(500).json({
    message: 'Internal Server Error'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`BassIT Backend running on port ${PORT}`);
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB Connected Successfully - BassIT');

  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
  }
};

connectDB();

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down BassIT Backend...');

  server.close(async () => {
    await mongoose.disconnect();
    console.log('Server closed successfully');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
