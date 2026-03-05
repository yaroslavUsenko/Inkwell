/**
 * Seed script for stress testing — backend/scripts/seed-stress.js
 *
 * Creates 500 posts and 1000 comments (2 per post) via direct MongoDB
 * insertMany() calls so that:
 *  - MongoDB indexes are built before the stress test starts
 *  - The first and the 1000th write during the test use the same code path
 *    (no index rebuild, no collection growth surprise)
 *
 * Usage:
 *   cd backend
 *   node scripts/seed-stress.js
 *
 * Or with custom MongoDB URI:
 *   MONGO_URI=mongodb://remote-host:27017/blog node scripts/seed-stress.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const Post     = require('../models/Post');
const Comment  = require('../models/Comment');

const POSTS_COUNT          = 500;
const COMMENTS_PER_POST    = 2;
const BATCH_SIZE           = 100; // insertMany batch to avoid memory spikes

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blog';
const TEST_EMAIL    = process.env.TEST_EMAIL    || 'usenko.0265@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '654321';
const TEST_NAME     = process.env.TEST_NAME     || 'usenko';

async function seed() {
  console.log(`Connecting to ${MONGO_URI} …`);
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // ── 1. Ensure test user exists ──────────────────────────────────────────────
  let user = await User.findOne({ email: TEST_EMAIL });
  if (!user) {
    console.log(`Creating test user <${TEST_EMAIL}> …`);
    // Use User.create() so the pre-save bcrypt hook fires once
    user = await User.create({
      name:     TEST_NAME,
      email:    TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    console.log(`User created: ${user._id}\n`);
  } else {
    console.log(`Test user already exists: ${user._id}\n`);
  }

  // ── 2. Count existing seed posts ────────────────────────────────────────────
  const existing = await Post.countDocuments({ author: user._id });
  console.log(`Existing posts by test user: ${existing}`);

  if (existing >= POSTS_COUNT) {
    console.log(`Already have ${existing} posts — skipping post creation.`);
  } else {
    const toCreate = POSTS_COUNT - existing;
    console.log(`Creating ${toCreate} posts in batches of ${BATCH_SIZE} …`);

    let created = 0;
    while (created < toCreate) {
      const batchSize = Math.min(BATCH_SIZE, toCreate - created);
      const batch = [];

      for (let i = 0; i < batchSize; i++) {
        const n = existing + created + i + 1;
        batch.push({
          title:       `Seed post #${n}`,
          description: `Auto-generated seed post number ${n} for stress testing.`,
          body:        `This is the full body of seed post ${n}. `
                     + `It contains realistic-length content so that read responses `
                     + `have a non-trivial payload size. `.repeat(4).trim(),
          author:      user._id,
          createdAt:   new Date(Date.now() - n * 60_000), // stagger timestamps
          updatedAt:   new Date(Date.now() - n * 60_000),
        });
      }

      // insertMany bypasses Mongoose middleware (Post has none) — much faster
      await Post.insertMany(batch, { timestamps: false });
      created += batchSize;
      process.stdout.write(`  … ${created}/${toCreate} posts\r`);
    }
    console.log(`\n${toCreate} posts created.`);
  }

  // ── 3. Seed comments ────────────────────────────────────────────────────────
  const existingComments = await Comment.countDocuments({ author: user._id });
  const targetComments   = POSTS_COUNT * COMMENTS_PER_POST;

  if (existingComments >= targetComments) {
    console.log(`\nAlready have ${existingComments} comments — skipping.`);
  } else {
    // Fetch all seed post IDs to distribute comments
    const posts = await Post.find({ author: user._id }).select('_id').lean();
    const toCreateComments = targetComments - existingComments;
    console.log(`\nCreating ${toCreateComments} comments …`);

    let created = 0;
    while (created < toCreateComments) {
      const batchSize = Math.min(BATCH_SIZE, toCreateComments - created);
      const batch = [];

      for (let i = 0; i < batchSize; i++) {
        const post = posts[(existingComments + created + i) % posts.length];
        batch.push({
          body:   `Seed comment ${existingComments + created + i + 1}`,
          author: user._id,
          post:   post._id,
        });
      }

      await Comment.insertMany(batch);
      created += batchSize;
      process.stdout.write(`  … ${created}/${toCreateComments} comments\r`);
    }
    console.log(`\n${toCreateComments} comments created.`);
  }

  // ── 4. Final counts ─────────────────────────────────────────────────────────
  const totalPosts    = await Post.countDocuments();
  const totalComments = await Comment.countDocuments();
  console.log(`\nDatabase totals: ${totalPosts} posts, ${totalComments} comments`);
  console.log('Seed complete. You can now run the stress test:\n');
  console.log('  k6 run k6/stress-test.js\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
