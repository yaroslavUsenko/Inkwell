const Comment = require('../../models/Comment');

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';

describe('Comment model — schema validation', () => {
  test('fails validation when body is missing', () => {
    const comment = new Comment({ author: VALID_OBJECT_ID, post: VALID_OBJECT_ID });
    const error = comment.validateSync();
    expect(error.errors.body).toBeDefined();
    expect(error.errors.body.message).toMatch(/Comment body is required/i);
  });

  test('fails validation when author is missing', () => {
    const comment = new Comment({ body: 'Nice post!', post: VALID_OBJECT_ID });
    const error = comment.validateSync();
    expect(error.errors.author).toBeDefined();
  });

  test('fails validation when post reference is missing', () => {
    const comment = new Comment({ body: 'Nice post!', author: VALID_OBJECT_ID });
    const error = comment.validateSync();
    expect(error.errors.post).toBeDefined();
  });

  test('fails validation when body exceeds 1000 characters', () => {
    const comment = new Comment({
      body: 'x'.repeat(1001),
      author: VALID_OBJECT_ID,
      post: VALID_OBJECT_ID,
    });
    const error = comment.validateSync();
    expect(error.errors.body).toBeDefined();
    expect(error.errors.body.message).toMatch(/1000/);
  });

  test('passes validation with all required fields present', () => {
    const comment = new Comment({
      body: 'Great article!',
      author: VALID_OBJECT_ID,
      post: VALID_OBJECT_ID,
    });
    const error = comment.validateSync();
    expect(error).toBeUndefined();
  });

  test('passes validation with body exactly 1000 characters', () => {
    const comment = new Comment({
      body: 'a'.repeat(1000),
      author: VALID_OBJECT_ID,
      post: VALID_OBJECT_ID,
    });
    const error = comment.validateSync();
    expect(error).toBeUndefined();
  });
});
