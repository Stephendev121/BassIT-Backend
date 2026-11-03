
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find().populate('songs');
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid playlist ID' });
    }

    const playlist = await Playlist.findById(req.params.id)
      .populate('songs');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, cover } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Playlist name is required'
      });
    }

    const newPlaylist = await Playlist.create({
      name: name.trim(),
      description,
      cover,
      songs: []
    });

    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/add', async (req, res) => {
  try {
    const { songId } = req.body;

    if (!isValidId(req.params.id) || !isValidId(songId)) {
      return res.status(400).json({
        message: 'Invalid playlist ID or song ID'
      });
    }

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const songExists = await Song.exists({ _id: songId });

    if (!songExists) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const alreadyAdded = playlist.songs.some(
      song => song.toString() === songId
    );

    if (!alreadyAdded) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    await playlist.populate('songs');

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/remove', async (req, res) => {
  try {
    const { songId } = req.body;

    if (!isValidId(req.params.id) || !isValidId(songId)) {
      return res.status(400).json({
        message: 'Invalid playlist ID or song ID'
      });
    }

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter(
      song => song.toString() !== songId
    );

    await playlist.save();
    await playlist.populate('songs');

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid playlist ID' });
    }

    const playlist = await Playlist.findByIdAndDelete(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.status(200).json({
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  router.post('/seed/data', async (req, res) => {
    try {
      await Playlist.deleteMany({});

      await Playlist.insertMany([
        {
          name: 'My Favourites',
          description: 'Songs I love',
          cover: 'https://picsum.photos/300?11',
          songs: []
        },
        {
          name: 'Workout Mix',
          description: 'High energy songs',
          cover: 'https://picsum.photos/300?12',
          songs: []
        },
        {
          name: 'Chill Vibes',
          description: 'Relax and chill',
          cover: 'https://picsum.photos/300?13',
          songs: []
        }
      ]);

      res.status(201).json({
        message: 'Playlists seeded successfully'
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}

module.exports = router;
