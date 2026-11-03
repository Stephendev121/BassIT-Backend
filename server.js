
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables
// Locally, load from .env. On Render, environment variables
// are configured through the Render dashboard.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: path.resolve(__dirname, '.env')
  });
}

const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Verify MongoDB connection string
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is missing.');
  process.exit(1);
}

// Home route
app.get('/', (req, res) => {
  res.status(200).send('BassIT Backend is Running...');
});

// API routes
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected Successfully - BassIT');

    // Listen on Render's assigned port
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`BassIT Backend running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
