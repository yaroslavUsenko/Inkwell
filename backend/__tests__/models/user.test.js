/**
 * Unit tests for User model.
 * bcryptjs is mocked so tests run without a real DB connection.
 * mongoose.model() registers schemas in memory — new User() works
 * without a live connection because save() is never called here.
 */
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs');

const User = require('../../models/User');

describe('User model — schema validation', () => {
  test('fails validation when name is missing', () => {
    const user = new User({ email: 'test@example.com', password: 'pass123' });
    const error = user.validateSync();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.name.message).toMatch(/Name is required/i);
  });

  test('fails validation when email is missing', () => {
    const user = new User({ name: 'Alice', password: 'pass123' });
    const error = user.validateSync();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.email.message).toMatch(/Email is required/i);
  });

  test('fails validation for an invalid email format', () => {
    const user = new User({ name: 'Alice', email: 'not-an-email', password: 'pass123' });
    const error = user.validateSync();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.email.message).toMatch(/valid email/i);
  });

  test('fails validation when name exceeds 60 characters', () => {
    const user = new User({ name: 'A'.repeat(61), email: 'a@b.com', password: 'pass123' });
    const error = user.validateSync();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.name.message).toMatch(/60/);
  });

  test('fails validation when bio exceeds 300 characters', () => {
    const user = new User({ name: 'Alice', email: 'a@b.com', password: 'p', bio: 'x'.repeat(301) });
    const error = user.validateSync();
    expect(error.errors.bio).toBeDefined();
    expect(error.errors.bio.message).toMatch(/300/);
  });

  test('passes validation with all required fields present', () => {
    const user = new User({ name: 'Alice', email: 'alice@example.com', password: 'pass123' });
    const error = user.validateSync();
    expect(error).toBeUndefined();
  });

  test('defaults bio to an empty string', () => {
    const user = new User({ name: 'Alice', email: 'alice@example.com', password: 'pass123' });
    expect(user.bio).toBe('');
  });

  test('defaults avatar to an empty string', () => {
    const user = new User({ name: 'Alice', email: 'alice@example.com', password: 'pass123' });
    expect(user.avatar).toBe('');
  });

  test('defaults firstname, lastname, age, gender, address, website to empty strings', () => {
    const user = new User({ name: 'Alice', email: 'alice@example.com', password: 'pass123' });
    expect(user.firstname).toBe('');
    expect(user.lastname).toBe('');
    expect(user.age).toBe('');
    expect(user.gender).toBe('');
    expect(user.address).toBe('');
    expect(user.website).toBe('');
  });

  test('lowercases and trims the email', () => {
    const user = new User({ name: 'Alice', email: '  Alice@Example.COM  ', password: 'pass123' });
    expect(user.email).toBe('alice@example.com');
  });
});

describe('User model — comparePassword()', () => {
  test('calls bcrypt.compare with the candidate password and the stored hash', async () => {
    const user = new User({ name: 'Alice', email: 'a@b.com', password: '$2a$12$hashed' });
    bcrypt.compare.mockResolvedValue(true);

    const result = await user.comparePassword('plaintext');

    expect(bcrypt.compare).toHaveBeenCalledWith('plaintext', '$2a$12$hashed');
    expect(result).toBe(true);
  });

  test('returns false when the password does not match', async () => {
    const user = new User({ name: 'Alice', email: 'a@b.com', password: '$2a$12$hashed' });
    bcrypt.compare.mockResolvedValue(false);

    const result = await user.comparePassword('wrongpassword');

    expect(result).toBe(false);
  });
});
