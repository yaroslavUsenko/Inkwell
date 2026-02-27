/**
 * Unit tests for routes/auth.js (authentication controller).
 * All external dependencies (User model, JWT, nodemailer) are mocked so
 * the tests cover only the route handler logic in isolation.
 */
require('express-async-errors');
const request = require('supertest');
const express = require('express');

// ── Mocks (must come before require() calls that use these modules) ──────────

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
}));

jest.mock('nodemailer', () => ({
  createTestAccount: jest.fn().mockResolvedValue({ user: 'tuser', pass: 'tpass' }),
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'msg-id-001' }),
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('http://ethereal.email/preview/xxx'),
}));

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

// ── Test app setup ────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/api/auth', require('../../routes/auth'));
app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({ message: err.message });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const User = require('../../models/User');

let mockUser;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  process.env.CLIENT_URL = 'http://localhost:5173';

  mockUser = {
    _id: 'user-id-123',
    name: 'Test User',
    email: 'test@example.com',
    bio: '',
    avatar: '',
    comparePassword: jest.fn(),
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    save: jest.fn().mockResolvedValue(undefined),
  };
});

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('returns 400 when any required field is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com' }); // missing password

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  test('returns 409 when the email is already registered', async () => {
    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'test@example.com', password: 'pass123' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });

  test('returns 201 with token and user data on successful registration', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ ...mockUser });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'new@example.com', password: 'pass123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBe('mock-jwt-token');
    expect(res.body.user).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
    });
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('returns 400 when email or password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' }); // missing password

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  test('returns 401 when user is not found', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'pass123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('returns 401 when password is incorrect', async () => {
    const userWithBadPass = { ...mockUser, comparePassword: jest.fn().mockResolvedValue(false) };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(userWithBadPass) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('returns 200 with token and user data on successful login', async () => {
    const userWithPass = { ...mockUser, comparePassword: jest.fn().mockResolvedValue(true) };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(userWithPass) });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pass123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('mock-jwt-token');
    expect(res.body.user.email).toBe('test@example.com');
  });
});

// ── POST /api/auth/forgot-password ────────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  test('returns 400 when email field is absent', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email is required');
  });

  test('returns 404 when no account with that email exists', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ghost@example.com' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/No account/i);
  });

  test('returns 200 and sends a reset email when user exists', async () => {
    User.findOne.mockResolvedValue({ ...mockUser });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset link/i);
    // resetUrl is returned in dev mode so the frontend can open it directly
    expect(res.body.resetUrl).toContain('/reset-password/');
  });
});

// ── GET /api/auth/validate-reset-token/:token ─────────────────────────────────

describe('GET /api/auth/validate-reset-token/:token', () => {
  test('returns 400 for an invalid or expired token', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/auth/validate-reset-token/bad-token');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid or has expired/i);
  });

  test('returns 200 with valid:true for a valid token', async () => {
    User.findOne.mockResolvedValue({ ...mockUser });

    const res = await request(app).get('/api/auth/validate-reset-token/good-token-abc');

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });
});

// ── POST /api/auth/reset-password/:token ──────────────────────────────────────

describe('POST /api/auth/reset-password/:token', () => {
  test('returns 400 when password is shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/sometoken')
      .send({ password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/6 characters/i);
  });

  test('returns 400 when token is invalid or expired', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .post('/api/auth/reset-password/expiredtoken')
      .send({ password: 'newpass123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid or has expired/i);
  });

  test('returns 200 with new token on successful password reset', async () => {
    const resetUser = { ...mockUser };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(resetUser) });

    const res = await request(app)
      .post('/api/auth/reset-password/validresettoken')
      .send({ password: 'newpass123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('mock-jwt-token');
    expect(resetUser.save).toHaveBeenCalledTimes(1);
  });
});
