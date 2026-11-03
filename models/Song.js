const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  artist: { type: String, required: true }, 
  genre: String, 
  duration: String, 
  audioUrl: String, 
  cover: String, 
  likes: { type: Number, default: 0 } 
}, { timestamps: true }); 

module.exports = mongoose.model('Song', songSchema);