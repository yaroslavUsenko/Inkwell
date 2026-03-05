/**
 * k6 Stress Test — Inkwell Blog API
 * Variant 2: find the maximum throughput (req/s) for each operation type separately.
 *
 * Prerequisites — run the seed script first:
 *   node backend/scripts/seed-stress.js
 *
 * Run:
 *   k6 run k6/stress-test.js
 *
 * Remote backend (different machine):
 *   k6 run -e BASE_URL=http://192.168.1.100:5000 k6/stress-test.js
 *
 * Export full JSON metrics:
 *   k6 run --out json=k6/stress-results.json k6/stress-test.js
 *
 * ── Scenarios (sequential, 30 s gap between each) ────────────────────────────
 *   S1  auth_stress        POST /api/auth/login          0 s
 *   S2  read_stress        GET  /api/posts  +  /posts/:id  3 m 30 s
 *   S3  create_post_stress POST /api/posts               7 m 0 s
 *   S4  comment_stress     POST /api/posts/:id/comments  10 m 30 s
 *
 * Each scenario:
 *   30 s  warmup   — 1 req/s  (server stabilises, JIT warms, connection pool fills)
 *   90 s  ramp-up  — linearly increases to max target rate
 *   60 s  peak     — sustain max rate; dropped_iterations > 0 means limit reached
 *   30 s  ramp-down
 */

import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ── Custom metrics ─────────────────────────────────────────────────────────────
const authDuration        = new Trend('auth_duration',         true);
const readListDuration    = new Trend('read_list_duration',    true);
const readSingleDuration  = new Trend('read_single_duration',  true);
const createPostDuration  = new Trend('create_post_duration',  true);
const createCommentDuration = new Trend('create_comment_duration', true);

const authErrors        = new Rate('auth_errors');
const readErrors        = new Rate('read_errors');
const createPostErrors  = new Rate('create_post_errors');
const commentErrors     = new Rate('comment_errors');

const droppedIterations = new Counter('custom_dropped_iterations');

// ── Config ─────────────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL      || 'http://localhost:5000';
const EMAIL    = __ENV.TEST_EMAIL    || 'usenko.0265@gmail.com';
const PASSWORD = __ENV.TEST_PASSWORD || '654321';

const JSON_HDR = { 'Content-Type': 'application/json' };

// ── Options ────────────────────────────────────────────────────────────────────
export const options = {
  /**
   * ramping-arrival-rate executor: k6 tries to fire exactly `target` iterations
   * per `timeUnit` regardless of how many VUs it takes.
   * When the server can't respond fast enough, k6 reports `dropped_iterations`
   * — this marks the system's saturation point.
   *
   * preAllocatedVUs = conservative estimate of concurrent VUs needed.
   * maxVUs          = hard ceiling (prevents runaway resource usage).
   */
  scenarios: {
    // ── S1: How many logins/s can the server handle? ──────────────────────────
    auth_stress: {
      executor:        'ramping-arrival-rate',
      startRate:       1,
      timeUnit:        '1s',
      preAllocatedVUs: 30,
      maxVUs:          80,
      stages: [
        { duration: '30s', target: 1  }, // warmup — 1 login/s
        { duration: '30s', target: 5  }, // ramp 1
        { duration: '30s', target: 10 }, // ramp 2
        { duration: '30s', target: 15 }, // ramp 3 — expected saturation ~10-15
        { duration: '60s', target: 15 }, // sustain peak
        { duration: '30s', target: 0  }, // ramp down
      ],
      exec:      'authStress',
      startTime: '0s',
      tags:      { scenario: 'S1_auth' },
    },

    // ── S2: How many reads/s (posts list + single post)? ─────────────────────
    read_stress: {
      executor:        'ramping-arrival-rate',
      startRate:       1,
      timeUnit:        '1s',
      preAllocatedVUs: 20,
      maxVUs:          150,
      stages: [
        { duration: '30s', target: 5   }, // warmup
        { duration: '30s', target: 30  }, // ramp 1
        { duration: '30s', target: 80  }, // ramp 2
        { duration: '30s', target: 150 }, // ramp 3 — expected saturation ~100-200
        { duration: '60s', target: 150 }, // sustain peak
        { duration: '30s', target: 0   }, // ramp down
      ],
      exec:      'readStress',
      startTime: '3m30s',
      tags:      { scenario: 'S2_read' },
    },

    // ── S3: How many post-creates/s? ──────────────────────────────────────────
    create_post_stress: {
      executor:        'ramping-arrival-rate',
      startRate:       1,
      timeUnit:        '1s',
      preAllocatedVUs: 15,
      maxVUs:          80,
      stages: [
        { duration: '30s', target: 2  }, // warmup
        { duration: '30s', target: 15 }, // ramp 1
        { duration: '30s', target: 35 }, // ramp 2
        { duration: '30s', target: 60 }, // ramp 3
        { duration: '60s', target: 60 }, // sustain peak
        { duration: '30s', target: 0  }, // ramp down
      ],
      exec:      'createPostStress',
      startTime: '7m0s',
      tags:      { scenario: 'S3_create_post' },
    },

    // ── S4: How many comment-creates/s? ───────────────────────────────────────
    comment_stress: {
      executor:        'ramping-arrival-rate',
      startRate:       1,
      timeUnit:        '1s',
      preAllocatedVUs: 15,
      maxVUs:          80,
      stages: [
        { duration: '30s', target: 2  }, // warmup
        { duration: '30s', target: 15 }, // ramp 1
        { duration: '30s', target: 35 }, // ramp 2
        { duration: '30s', target: 60 }, // ramp 3
        { duration: '60s', target: 60 }, // sustain peak
        { duration: '30s', target: 0  }, // ramp down
      ],
      exec:      'commentStress',
      startTime: '10m30s',
      tags:      { scenario: 'S4_comment' },
    },
  },

  thresholds: {
    // Stress test: allow up to 20% errors (we intentionally exceed capacity)
    http_req_failed:            ['rate<0.20'],
    auth_errors:                ['rate<0.20'],
    read_errors:                ['rate<0.20'],
    create_post_errors:         ['rate<0.20'],
    comment_errors:             ['rate<0.20'],
    // Latency budgets (best-effort; will naturally degrade under stress)
    auth_duration:              ['p(95)<5000'],
    create_post_duration:       ['p(95)<3000'],
    create_comment_duration:    ['p(95)<3000'],
  },
};

// ── setup() — runs once before all scenarios ───────────────────────────────────
// Returns shared state (token + a stable post ID) available to every VU.
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: JSON_HDR },
  );

  if (loginRes.status !== 200) {
    throw new Error(`setup: login failed — ${loginRes.status} ${loginRes.body}`);
  }

  const token  = loginRes.json('token');
  const userId = loginRes.json('user.id');

  // Fetch one post ID to use for read/comment scenarios
  const postsRes = http.get(
    `${BASE_URL}/api/posts?page=1&limit=1`,
    { headers: { ...JSON_HDR, Authorization: `Bearer ${token}` } },
  );

  const posts  = postsRes.json('posts') || [];
  const postId = posts.length ? posts[0]._id : null;

  if (!postId) {
    throw new Error('setup: no posts found — run seed-stress.js first');
  }

  return { token, userId, postId };
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function authHdr(token) {
  return { ...JSON_HDR, Authorization: `Bearer ${token}` };
}

// ── S1: Auth stress ────────────────────────────────────────────────────────────
export function authStress(data) {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: JSON_HDR, tags: { name: 'auth/login' } },
  );

  authDuration.add(res.timings.duration);

  const ok = check(res, {
    'auth → 200':   (r) => r.status === 200,
    'auth → token': (r) => Boolean(r.json('token')),
  });
  authErrors.add(!ok);
}

// ── S2: Read stress ────────────────────────────────────────────────────────────
export function readStress(data) {
  // 1. Fetch posts list (simulates homepage)
  const listRes = http.get(
    `${BASE_URL}/api/posts?page=1&limit=10`,
    { headers: authHdr(data.token), tags: { name: 'posts/list' } },
  );
  readListDuration.add(listRes.timings.duration);

  const listOk = check(listRes, { 'read list → 200': (r) => r.status === 200 });

  // 2. Fetch the single post (simulates clicking into an article)
  const singleRes = http.get(
    `${BASE_URL}/api/posts/${data.postId}`,
    { headers: authHdr(data.token), tags: { name: 'posts/single' } },
  );
  readSingleDuration.add(singleRes.timings.duration);

  const singleOk = check(singleRes, {
    'read single → 200':  (r) => r.status === 200,
    'read single → body': (r) => Boolean(r.json('body')),
  });

  readErrors.add(!listOk || !singleOk);
}

// ── S3: Create post stress ─────────────────────────────────────────────────────
export function createPostStress(data) {
  const res = http.post(
    `${BASE_URL}/api/posts`,
    JSON.stringify({
      title:       `Stress post ${Date.now()}`,
      description: 'Created during stress test',
      body:        'Body text for stress test post. Long enough to be realistic.',
    }),
    { headers: authHdr(data.token), tags: { name: 'posts/create' } },
  );

  createPostDuration.add(res.timings.duration);

  const ok = check(res, {
    'create post → 201': (r) => r.status === 201,
    'create post → _id': (r) => Boolean(r.json('_id')),
  });
  createPostErrors.add(!ok);
}

// ── S4: Create comment stress ──────────────────────────────────────────────────
export function commentStress(data) {
  const res = http.post(
    `${BASE_URL}/api/posts/${data.postId}/comments`,
    JSON.stringify({ body: `Stress comment ${Date.now()}` }),
    { headers: authHdr(data.token), tags: { name: 'comments/create' } },
  );

  createCommentDuration.add(res.timings.duration);

  const ok = check(res, {
    'comment → 201':  (r) => r.status === 201,
    'comment → _id':  (r) => Boolean(r.json('_id')),
  });
  commentErrors.add(!ok);
}
