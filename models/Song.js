<<<<<<< HEAD
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

=======
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

>>>>>>> fa29da141a2d3e0626622686504e8171635b1fab
module.exports = mongoose.model('Song', songSchema);