const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :postId
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// GET /api/posts/:postId/comments
router.get('/', async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .sort({ createdAt: 1 })
    .populate('author', 'name avatar');
  res.json(comments);
});

// POST /api/posts/:postId/comments (auth required)
router.post('/', protect, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const { body } = req.body;
  if (!body) return res.status(400).json({ message: 'Comment body is required' });

  const comment = await Comment.create({
    body,
    author: req.user._id,
    post: req.params.postId,
  });
  await comment.populate('author', 'name avatar');

  res.status(201).json(comment);
});

// DELETE /api/posts/:postId/comments/:commentId (author only)
router.delete('/:commentId', protect, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  if (comment.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this comment' });
  }

  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});

module.exports = router;
