const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

// GET /api/posts — list all posts (paginated)
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const total = await Post.countDocuments();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar');

  res.json({ posts, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/posts/:id — single post
router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name avatar');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// POST /api/posts — create post (auth required)
router.post('/', protect, async (req, res) => {
  const { title, description, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  const post = await Post.create({ title, description, body, author: req.user._id });
  await post.populate('author', 'name avatar');
  res.status(201).json(post);
});

// PUT /api/posts/:id — edit post (author only)
router.put('/:id', protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this post' });
  }

  const { title, description, body } = req.body;
  if (title !== undefined) post.title = title;
  if (description !== undefined) post.description = description;
  if (body !== undefined) post.body = body;
  await post.save();
  await post.populate('author', 'name avatar');

  res.json(post);
});

// DELETE /api/posts/:id — delete post + its comments (author only)
router.delete('/:id', protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this post' });
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ message: 'Post deleted' });
});

module.exports = router;
