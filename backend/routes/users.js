const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const posts = await Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .select('title createdAt');

  res.json({ user, posts });
});

// PUT /api/users/:id — update own profile
router.put('/:id', protect, async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Not authorized to edit this profile' });
  }

  const { name, bio, avatar, firstname, lastname, age, gender, address, website } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (avatar !== undefined) updates.avatar = avatar;
  if (firstname !== undefined) updates.firstname = firstname;
  if (lastname !== undefined) updates.lastname = lastname;
  if (age !== undefined) updates.age = age;
  if (gender !== undefined) updates.gender = gender;
  if (address !== undefined) updates.address = address;
  if (website !== undefined) updates.website = website;

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-__v');

  res.json(user);
});

// PUT /api/users/:id/password — change password
router.put('/:id/password', protect, async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both fields are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.params.id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password changed successfully' });
});

module.exports = router;
