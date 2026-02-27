/**
 * Unit tests for routes/posts.js (posts controller).
 *
 * Mocks used:
 *  - middleware/auth  → protect is a jest.fn() spy (Spy pattern)
 *  - models/Post      → all static + instance methods replaced (Mock pattern)
 *  - models/Comment   → deleteMany replaced (Mock pattern)
 */
require('express-async-errors');
const request = require('supertest');
const express = require('express');

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../middleware/auth', () => ({
  protect: jest.fn(),
}));

jest.mock('../../models/Post', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock('../../models/Comment', () => ({
  deleteMany: jest.fn(),
}));

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/api/posts', require('../../routes/posts'));
app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const { protect } = require('../../middleware/auth');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

const AUTHOR_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OTHER_ID  = 'bbbbbbbbbbbbbbbbbbbbbbbb';

/** Returns a fresh mock post document for each test. */
const makeMockPost = (authorId = AUTHOR_ID) => ({
  _id: 'post-id-001',
  title: 'Hello World',
  description: 'A test post',
  body: 'Post body content',
  author: { toString: () => authorId },
  save: jest.fn().mockResolvedValue(undefined),
  populate: jest.fn().mockResolvedValue(undefined),
  deleteOne: jest.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  jest.clearAllMocks();

  // Default: authenticated user is the author
  protect.mockImplementation((req, res, next) => {
    req.user = { _id: AUTHOR_ID, toString: () => AUTHOR_ID };
    next();
  });
});

// ── GET /api/posts ────────────────────────────────────────────────────────────

describe('GET /api/posts', () => {
  test('returns paginated posts with total and page metadata', async () => {
    const posts = [makeMockPost(), makeMockPost()];
    Post.countDocuments.mockResolvedValue(2);
    Post.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(posts),
    });

    const res = await request(app).get('/api/posts');

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(2);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.pages).toBe(1);
  });

  test('respects custom page and limit query params', async () => {
    Post.countDocuments.mockResolvedValue(30);
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([]),
    };
    Post.find.mockReturnValue(chain);

    const res = await request(app).get('/api/posts?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(chain.skip).toHaveBeenCalledWith(5); // (2-1)*5 = 5
    expect(chain.limit).toHaveBeenCalledWith(5);
  });
});

// ── GET /api/posts/:id ────────────────────────────────────────────────────────

describe('GET /api/posts/:id', () => {
  test('returns the post when it exists', async () => {
    const mockPost = makeMockPost();
    Post.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockPost),
    });

    const res = await request(app).get('/api/posts/post-id-001');

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Hello World');
  });

  test('returns 404 when the post does not exist', async () => {
    Post.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app).get('/api/posts/nonexistent-id');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });
});

// ── POST /api/posts ───────────────────────────────────────────────────────────

describe('POST /api/posts', () => {
  test('returns 400 when title or body is missing', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Only a title' }); // missing body

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Title and body are required');
  });

  test('creates and returns the post with 201 when fields are valid', async () => {
    const newPost = makeMockPost();
    Post.create.mockResolvedValue(newPost);

    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'New Post', body: 'Post content here' });

    expect(res.status).toBe(201);
    expect(Post.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Post', author: AUTHOR_ID }),
    );
    expect(newPost.populate).toHaveBeenCalledWith('author', 'name avatar');
  });
});

// ── PUT /api/posts/:id ────────────────────────────────────────────────────────

describe('PUT /api/posts/:id', () => {
  test('returns 404 when the post to update does not exist', async () => {
    Post.findById.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/posts/missing-id')
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  test('returns 403 when the requesting user is not the author', async () => {
    // Post belongs to OTHER_ID, but authenticated user is AUTHOR_ID
    Post.findById.mockResolvedValue(makeMockPost(OTHER_ID));

    const res = await request(app)
      .put('/api/posts/post-id-001')
      .send({ title: 'Hacked' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Not authorized to edit this post');
  });

  test('updates and returns the post when the user is the author', async () => {
    const mockPost = makeMockPost(AUTHOR_ID);
    Post.findById.mockResolvedValue(mockPost);

    const res = await request(app)
      .put('/api/posts/post-id-001')
      .send({ title: 'Updated Title', body: 'Updated body' });

    expect(res.status).toBe(200);
    expect(mockPost.save).toHaveBeenCalledTimes(1);
    expect(mockPost.title).toBe('Updated Title');
  });
});

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────────

describe('DELETE /api/posts/:id', () => {
  test('returns 404 when the post to delete does not exist', async () => {
    Post.findById.mockResolvedValue(null);

    const res = await request(app).delete('/api/posts/missing-id');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  test('returns 403 when a non-author tries to delete', async () => {
    Post.findById.mockResolvedValue(makeMockPost(OTHER_ID));

    const res = await request(app).delete('/api/posts/post-id-001');

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Not authorized to delete this post');
  });

  test('deletes the post and its comments when called by the author', async () => {
    const mockPost = makeMockPost(AUTHOR_ID);
    Post.findById.mockResolvedValue(mockPost);
    Comment.deleteMany.mockResolvedValue({ deletedCount: 3 });

    const res = await request(app).delete('/api/posts/post-id-001');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post deleted');
    expect(Comment.deleteMany).toHaveBeenCalledWith({ post: mockPost._id });
    expect(mockPost.deleteOne).toHaveBeenCalledTimes(1);
  });
});
