const Post = require('../../models/Post');

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';

describe('Post model — schema validation', () => {
  test('fails validation when title is missing', () => {
    const post = new Post({ body: 'Some content', author: VALID_OBJECT_ID });
    const error = post.validateSync();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.title.message).toMatch(/Title is required/i);
  });

  test('fails validation when body is missing', () => {
    const post = new Post({ title: 'My Post', author: VALID_OBJECT_ID });
    const error = post.validateSync();
    expect(error.errors.body).toBeDefined();
    expect(error.errors.body.message).toMatch(/Body is required/i);
  });

  test('fails validation when author is missing', () => {
    const post = new Post({ title: 'My Post', body: 'Content' });
    const error = post.validateSync();
    expect(error.errors.author).toBeDefined();
  });

  test('fails validation when title exceeds 200 characters', () => {
    const post = new Post({ title: 'T'.repeat(201), body: 'Content', author: VALID_OBJECT_ID });
    const error = post.validateSync();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.title.message).toMatch(/200/);
  });

  test('fails validation when description exceeds 500 characters', () => {
    const post = new Post({
      title: 'My Post',
      body: 'Content',
      author: VALID_OBJECT_ID,
      description: 'D'.repeat(501),
    });
    const error = post.validateSync();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.description.message).toMatch(/500/);
  });

  test('passes validation with all required fields present', () => {
    const post = new Post({ title: 'Valid Post', body: 'Body text', author: VALID_OBJECT_ID });
    const error = post.validateSync();
    expect(error).toBeUndefined();
  });

  test('description is optional and can be omitted', () => {
    const post = new Post({ title: 'Post', body: 'Body', author: VALID_OBJECT_ID });
    expect(post.description).toBeUndefined();
  });

  test('trims whitespace from title', () => {
    const post = new Post({ title: '  My Post  ', body: 'Body', author: VALID_OBJECT_ID });
    expect(post.title).toBe('My Post');
  });
});
