
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables from the project root
const dotenvResult = require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

if (dotenvResult.error) {
  console.error('Error loading .env file:', dotenvResult.error.message);
  process.exit(1);
}

console.log('Environment file loaded successfully');

// Import routes
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Verify MongoDB connection string
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is missing. Check your .env file.');
  process.exit(1);
}

console.log('MongoDB URI loaded:', !!process.env.MONGO_URI);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully - BassIT');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

// Home route
app.get('/', (req, res) => {
  res.send('BassIT Backend is Running...');
});

// API routes
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`BassIT Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
