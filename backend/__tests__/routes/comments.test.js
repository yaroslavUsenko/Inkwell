require('express-async-errors');
const request  = require('supertest');
const express  = require('express');

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../middleware/auth', () => ({ protect: jest.fn() }));

jest.mock('../../models/Comment', () => ({
  find:     jest.fn(),
  findById: jest.fn(),
  create:   jest.fn(),
}));

jest.mock('../../models/Post', () => ({
  findById: jest.fn(),
}));

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
// Mirror the mounting in server.js so mergeParams works correctly
app.use('/api/posts/:postId/comments', require('../../routes/comments'));
app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const { protect } = require('../../middleware/auth');
const Comment     = require('../../models/Comment');
const Post        = require('../../models/Post');

const AUTHOR_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OTHER_ID  = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const POST_ID   = 'cccccccccccccccccccccccc';

const makeMockComment = (authorId = AUTHOR_ID) => ({
  _id:      'comment-id-001',
  body:     'Test comment',
  author:   { toString: () => authorId },
  post:     POST_ID,
  populate:   jest.fn().mockResolvedValue(undefined),
  deleteOne:  jest.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  jest.clearAllMocks();
  protect.mockImplementation((req, res, next) => {
    req.user = { _id: AUTHOR_ID, toString: () => AUTHOR_ID };
    next();
  });
});

// ── GET /api/posts/:postId/comments ───────────────────────────────────────────

describe('GET /api/posts/:postId/comments', () => {
  test('returns the list of comments for a post', async () => {
    const comments = [makeMockComment(), makeMockComment()];
    Comment.find.mockReturnValue({
      sort:     jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(comments),
    });

    const res = await request(app).get(`/api/posts/${POST_ID}/comments`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(Comment.find).toHaveBeenCalledWith({ post: POST_ID });
  });

  test('returns an empty array when a post has no comments', async () => {
    Comment.find.mockReturnValue({
      sort:     jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app).get(`/api/posts/${POST_ID}/comments`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ── POST /api/posts/:postId/comments ─────────────────────────────────────────

describe('POST /api/posts/:postId/comments', () => {
  test('returns 404 when the parent post does not exist', async () => {
    Post.findById.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/posts/${POST_ID}/comments`)
      .send({ body: 'Great post!' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Post not found');
  });

  test('returns 400 when comment body is missing', async () => {
    Post.findById.mockResolvedValue({ _id: POST_ID });

    const res = await request(app)
      .post(`/api/posts/${POST_ID}/comments`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Comment body is required');
  });

  test('returns 201 with the new comment on success', async () => {
    Post.findById.mockResolvedValue({ _id: POST_ID });
    const newComment = makeMockComment();
    Comment.create.mockResolvedValue(newComment);

    const res = await request(app)
      .post(`/api/posts/${POST_ID}/comments`)
      .send({ body: 'Great post!' });

    expect(res.status).toBe(201);
    expect(Comment.create).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'Great post!', author: AUTHOR_ID, post: POST_ID }),
    );
    expect(newComment.populate).toHaveBeenCalledWith('author', 'name avatar');
  });
});

// ── DELETE /api/posts/:postId/comments/:commentId ─────────────────────────────

describe('DELETE /api/posts/:postId/comments/:commentId', () => {
  test('returns 404 when the comment does not exist', async () => {
    Comment.findById.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/posts/${POST_ID}/comments/missing-comment`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Comment not found');
  });

  test('returns 403 when a non-author tries to delete the comment', async () => {
    Comment.findById.mockResolvedValue(makeMockComment(OTHER_ID));

    const res = await request(app)
      .delete(`/api/posts/${POST_ID}/comments/comment-id-001`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Not authorized to delete this comment');
  });

  test('deletes and returns success message when called by the author', async () => {
    const mockComment = makeMockComment(AUTHOR_ID);
    Comment.findById.mockResolvedValue(mockComment);

    const res = await request(app)
      .delete(`/api/posts/${POST_ID}/comments/comment-id-001`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted');
    expect(mockComment.deleteOne).toHaveBeenCalledTimes(1);
  });
});
