require('express-async-errors');
const request = require('supertest');
const express = require('express');

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../middleware/auth', () => ({ protect: jest.fn() }));

jest.mock('../../models/User', () => ({
  findById:         jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../models/Post', () => ({
  find: jest.fn(),
}));

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/api/users', require('../../routes/users'));
app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const { protect } = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');

const USER_ID  = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OTHER_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';

let mockUser;

beforeEach(() => {
  jest.clearAllMocks();

  mockUser = {
    _id:             USER_ID,
    name:            'Alice',
    email:           'alice@example.com',
    bio:             'Hello',
    avatar:          '',
    comparePassword: jest.fn(),
    save:            jest.fn().mockResolvedValue(undefined),
  };

  // Default: authenticated as the profile owner
  protect.mockImplementation((req, res, next) => {
    req.user = { _id: USER_ID, toString: () => USER_ID };
    next();
  });
});

// ── GET /api/users/:id ────────────────────────────────────────────────────────

describe('GET /api/users/:id', () => {
  test('returns 404 when user does not exist', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app).get(`/api/users/${USER_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  test('returns the user profile with their posts', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const posts = [{ _id: 'p1', title: 'My Post', createdAt: new Date().toISOString() }];
    Post.find.mockReturnValue({
      sort:   jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(posts),
    });

    const res = await request(app).get(`/api/users/${USER_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Alice');
    expect(res.body.posts).toHaveLength(1);
  });
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────

describe('PUT /api/users/:id', () => {
  test('returns 403 when updating another user\'s profile', async () => {
    // Authenticated as OTHER_ID, but trying to update USER_ID's profile
    protect.mockImplementation((req, res, next) => {
      req.user = { _id: OTHER_ID, toString: () => OTHER_ID };
      next();
    });

    const res = await request(app)
      .put(`/api/users/${USER_ID}`)
      .send({ bio: 'Hacked' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Not authorized to edit this profile');
  });

  test('updates and returns the user when called by the profile owner', async () => {
    const updatedUser = { ...mockUser, bio: 'Updated bio' };
    User.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue(updatedUser),
    });

    const res = await request(app)
      .put(`/api/users/${USER_ID}`)
      .send({ bio: 'Updated bio' });

    expect(res.status).toBe(200);
    expect(res.body.bio).toBe('Updated bio');
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({ bio: 'Updated bio' }),
      expect.objectContaining({ new: true, runValidators: true }),
    );
  });
});

// ── PUT /api/users/:id/password ───────────────────────────────────────────────

describe('PUT /api/users/:id/password', () => {
  test('returns 403 when changing another user\'s password', async () => {
    protect.mockImplementation((req, res, next) => {
      req.user = { _id: OTHER_ID, toString: () => OTHER_ID };
      next();
    });

    const res = await request(app)
      .put(`/api/users/${USER_ID}/password`)
      .send({ currentPassword: 'old', newPassword: 'new123' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Not authorized');
  });

  test('returns 400 when currentPassword or newPassword is missing', async () => {
    const res = await request(app)
      .put(`/api/users/${USER_ID}/password`)
      .send({ currentPassword: 'old123' }); // missing newPassword

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Both fields are required');
  });

  test('returns 400 when new password is shorter than 6 characters', async () => {
    const res = await request(app)
      .put(`/api/users/${USER_ID}/password`)
      .send({ currentPassword: 'old123', newPassword: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/6 characters/i);
  });

  test('returns 400 when current password is incorrect', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(false),
      }),
    });

    const res = await request(app)
      .put(`/api/users/${USER_ID}/password`)
      .send({ currentPassword: 'wrongpass', newPassword: 'newpass123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Current password is incorrect');
  });

  test('changes the password and returns success when credentials are correct', async () => {
    const userWithPassword = {
      ...mockUser,
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(userWithPassword),
    });

    const res = await request(app)
      .put(`/api/users/${USER_ID}/password`)
      .send({ currentPassword: 'correctpass', newPassword: 'newpass123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password changed successfully');
    expect(userWithPassword.save).toHaveBeenCalledTimes(1);
    expect(userWithPassword.password).toBe('newpass123');
  });
});
