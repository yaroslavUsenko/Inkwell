const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { protect } = require('../../middleware/auth');

jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('protect middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  test('returns 401 when Authorization header is missing', async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header does not start with "Bearer "', async () => {
    req.headers.authorization = 'Basic dXNlcjpwYXNz';

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when JWT token verification fails', async () => {
    req.headers.authorization = 'Bearer bad-token';
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token invalid' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when decoded user is not found in database', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'nonexistent-id' });
    User.findById.mockResolvedValue(null);

    await protect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('nonexistent-id');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    expect(next).not.toHaveBeenCalled();
  });

  test('sets req.user and calls next() when token is valid and user exists', async () => {
    const mockUser = { _id: 'user-id-123', name: 'Test User', email: 'test@example.com' };
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-id-123' });
    User.findById.mockResolvedValue(mockUser);

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.user).toBe(mockUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
