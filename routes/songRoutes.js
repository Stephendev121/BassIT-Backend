
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Song = require('../models/Song');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q) {
      return res.status(400).json({
        message: 'Please provide a search query'
      });
    }

    const searchTerm = escapeRegex(q);

    const songs = await Song.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { artist: { $regex: searchTerm, $options: 'i' } }
      ]
    });

    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add a new song
router.post('/', async (req, res) => {
  try {
    const {
      title,
      artist,
      genre,
      duration,
      audioUrl,
      cover
    } = req.body;

    if (!title || !artist || !audioUrl) {
      return res.status(400).json({
        message: 'Title, artist and audio URL are required'
      });
    }

    const newSong = await Song.create({
      title: title.trim(),
      artist: artist.trim(),
      genre,
      duration,
      audioUrl,
      cover,
      likes: 0
    });

    res.status(201).json(newSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: 'Invalid song ID'
      });
    }

    const song = await Song.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true, runValidators: true }
    );

    if (!song) {
      return res.status(404).json({
        message: 'Song not found'
      });
    }

    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a song
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: 'Invalid song ID'
      });
    }

    const song = await Song.findByIdAndDelete(id);

    if (!song) {
      return res.status(404).json({
        message: 'Song not found'
      });
    }

    const Playlist = require('../models/Playlist');

    await Playlist.updateMany(
      { songs: id },
      { $pull: { songs: id } }
    );

    res.status(200).json({
      message: 'Song deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  router.post('/seed/data', async (req, res) => {
    try {
      const existingSongs = await Song.countDocuments();

      if (existingSongs > 0) {
        return res.status(409).json({
          message: 'Songs already exist. Seed operation skipped.',
          count: existingSongs
        });
      }

      const sampleSongs = [
        {
          title: 'Tum Se Hi',
          artist: 'Mohit Chauhan',
          genre: 'Bollywood',
          duration: '5:21',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          cover: 'https://picsum.photos/300?1',
          likes: 0
        },
        {
          title: 'Raabta',
          artist: 'Arijit Singh',
          genre: 'Romantic',
          duration: '4:12',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          cover: 'https://picsum.photos/300?2',
          likes: 0
        },
        {
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          genre: 'Pop',
          duration: '3:53',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          cover: 'https://picsum.photos/300?3',
          likes: 0
        },
        {
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          genre: 'Pop',
          duration: '3:20',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
          cover: 'https://picsum.photos/300?4',
          likes: 0
        },
        {
          title: 'Kesariya',
          artist: 'Arijit Singh',
          genre: 'Bollywood',
          duration: '4:28',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
          cover: 'https://picsum.photos/300?5',
          likes: 0
        },
        {
          title: 'Believer',
          artist: 'Imagine Dragons',
          genre: 'Rock',
          duration: '3:24',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
          cover: 'https://picsum.photos/300?6',
          likes: 0
        },
        {
          title: 'Chaiyya Chaiyya',
          artist: 'Sukhwinder Singh',
          genre: 'Bollywood',
          duration: '6:45',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
          cover: 'https://picsum.photos/300?7',
          likes: 0
        },
        {
          title: 'Perfect',
          artist: 'Ed Sheeran',
          genre: 'Romantic',
          duration: '4:23',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
          cover: 'https://picsum.photos/300?8',
          likes: 0
        }
      ];

      await Song.insertMany(sampleSongs);

      res.status(201).json({
        message: 'Successfully seeded 8 songs',
        count: sampleSongs.length
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}

module.exports = router;
