/**
 * k6 Load Test — Inkwell Blog API
 *
 * Four user-journey scenarios run sequentially, 5 VUs each, 30 s per scenario.
 * Target: 5 concurrent virtual users (normal load as per lab spec).
 *
 * Run locally:
 *   k6 run k6/load-test.js
 *
 * Override backend URL or credentials:
 *   k6 run -e BASE_URL=http://localhost:5000 \
 *           -e TEST_EMAIL=you@example.com   \
 *           -e TEST_PASSWORD=secret          \
 *           k6/load-test.js
 *
 * Export JSON summary (for offline analysis):
 *   k6 run --out json=k6/results.json k6/load-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ── Custom per-action latency metrics (reported as avg / p50 / p95 / p99) ─────
const loginDuration         = new Trend('login_duration',          true);
const postsListDuration     = new Trend('posts_list_duration',     true);
const postViewDuration      = new Trend('post_view_duration',      true);
const commentDuration       = new Trend('comment_create_duration', true);
const createPostDuration    = new Trend('create_post_duration',    true);
const profileViewDuration   = new Trend('profile_view_duration',   true);
const profileUpdateDuration = new Trend('profile_update_duration', true);

// Composite error rate across all scenarios
const scenarioErrors = new Rate('scenario_errors');

// ── Configuration ──────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL      || 'http://localhost:5000';
const EMAIL    = __ENV.TEST_EMAIL    || 'usenko.0265@gmail.com';
const PASSWORD = __ENV.TEST_PASSWORD || '654321';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ── Test options ───────────────────────────────────────────────────────────────
export const options = {
  /**
   * Four scenarios run one after another (startTime offsets).
   * Each uses constant-vus executor with 5 VUs for 30 s — the "normal load"
   * defined as 5 concurrent users in the lab spec.
   */
  scenarios: {
    // S1 — Login → view latest post → logout
    s1_browse_post: {
      executor:  'constant-vus',
      vus:       5,
      duration:  '30s',
      exec:      'scenarioBrowsePost',
      startTime: '0s',
      tags:      { scenario: 'S1' },
    },

    // S2 — Login → view post → home → another post → comment → logout
    s2_browse_and_comment: {
      executor:  'constant-vus',
      vus:       5,
      duration:  '30s',
      exec:      'scenarioBrowseAndComment',
      startTime: '35s',
      tags:      { scenario: 'S2' },
    },

    // S3 — Login → create post → logout
    s3_create_post: {
      executor:  'constant-vus',
      vus:       5,
      duration:  '30s',
      exec:      'scenarioCreatePost',
      startTime: '70s',
      tags:      { scenario: 'S3' },
    },

    // S4 — Login → view profile → update profile → logout
    s4_update_profile: {
      executor:  'constant-vus',
      vus:       5,
      duration:  '30s',
      exec:      'scenarioUpdateProfile',
      startTime: '105s',
      tags:      { scenario: 'S4' },
    },
  },

  /**
   * Thresholds define pass/fail criteria.
   * Breaching any threshold makes k6 exit with code 99 (useful in CI).
   */
  thresholds: {
    // Overall HTTP error rate must stay below 5 %
    http_req_failed:         ['rate<0.05'],

    // 95th-percentile end-to-end request time < 2 s (all requests)
    http_req_duration:       ['p(95)<2000'],

    // Per-action latency budgets
    login_duration:          ['p(95)<1000'],
    post_view_duration:      ['p(95)<1500'],
    create_post_duration:    ['p(95)<2000'],
    profile_update_duration: ['p(95)<2000'],

    // Composite: fewer than 5 % of scenario check-groups must fail
    scenario_errors:         ['rate<0.05'],
  },
};

// ── Shared helpers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Returns { token, userId } on success, null on failure.
 * Records loginDuration and marks scenarioErrors on failure.
 */
function login() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: JSON_HEADERS, tags: { name: 'auth/login' } },
  );

  loginDuration.add(res.timings.duration);

  const ok = check(res, {
    'login → status 200':    (r) => r.status === 200,
    'login → token present': (r) => Boolean(r.json('token')),
  });

  scenarioErrors.add(!ok);
  if (!ok) return null;

  return {
    token:  res.json('token'),
    userId: res.json('user.id'),
  };
}

/** Authorization header object for authenticated requests. */
function authHdr(token) {
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

/**
 * GET /api/posts?page=1&limit=10
 * Returns array of post objects (may be empty).
 */
function fetchPostsList(token) {
  const res = http.get(
    `${BASE_URL}/api/posts?page=1&limit=10`,
    { headers: authHdr(token), tags: { name: 'posts/list' } },
  );
  postsListDuration.add(res.timings.duration);
  check(res, { 'posts list → 200': (r) => r.status === 200 });
  return res.json('posts') || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 1 — Login → view latest post → logout
// ─────────────────────────────────────────────────────────────────────────────
export function scenarioBrowsePost() {
  group('S1: browse post', () => {
    // ① Login
    const auth = login();
    if (!auth) { sleep(1); return; }
    sleep(1); // think time: user lands on home page

    // ② Load posts list (homepage)
    const posts = fetchPostsList(auth.token);
    if (!posts.length) { sleep(1); return; }
    sleep(1); // user scans the list

    // ③ Open the latest (first) post — read full text
    const res = http.get(
      `${BASE_URL}/api/posts/${posts[0]._id}`,
      { headers: authHdr(auth.token), tags: { name: 'posts/view' } },
    );
    postViewDuration.add(res.timings.duration);
    check(res, {
      'post detail → 200':  (r) => r.status === 200,
      'post detail → body': (r) => Boolean(r.json('body')),
    });
    sleep(3); // user reads the article

    // ④ Logout — JWT is stateless; no server-side endpoint exists.
    //    The VU simply discards the token at the end of the iteration.
  });
  sleep(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 2 — Login → view post → home → another post → comment → logout
// ─────────────────────────────────────────────────────────────────────────────
export function scenarioBrowseAndComment() {
  group('S2: browse + comment', () => {
    // ① Login
    const auth = login();
    if (!auth) { sleep(1); return; }
    sleep(1);

    // ② Homepage — fetch posts list
    const posts = fetchPostsList(auth.token);
    if (posts.length < 1) { sleep(1); return; }
    sleep(1);

    // ③ Open first post
    let res = http.get(
      `${BASE_URL}/api/posts/${posts[0]._id}`,
      { headers: authHdr(auth.token), tags: { name: 'posts/view' } },
    );
    postViewDuration.add(res.timings.duration);
    check(res, { 'first post → 200': (r) => r.status === 200 });
    sleep(3); // user reads

    // ④ Navigate back to home (re-request posts list)
    const freshPosts = fetchPostsList(auth.token);
    // Pick a different post (index 1) if available, else fall back to index 0
    const targetPost = freshPosts.length > 1 ? freshPosts[1] : freshPosts[0];
    if (!targetPost) { sleep(1); return; }
    sleep(1);

    // ⑤ Open second (different) post
    res = http.get(
      `${BASE_URL}/api/posts/${targetPost._id}`,
      { headers: authHdr(auth.token), tags: { name: 'posts/view' } },
    );
    postViewDuration.add(res.timings.duration);
    check(res, { 'second post → 200': (r) => r.status === 200 });
    sleep(2); // user reads

    // ⑥ Leave a comment on the second post
    res = http.post(
      `${BASE_URL}/api/posts/${targetPost._id}/comments`,
      JSON.stringify({ body: `k6 load test comment — ${Date.now()}` }),
      { headers: authHdr(auth.token), tags: { name: 'comments/create' } },
    );
    commentDuration.add(res.timings.duration);
    const ok = check(res, {
      'comment → 201':       (r) => r.status === 201,
      'comment → _id field': (r) => Boolean(r.json('_id')),
    });
    scenarioErrors.add(!ok);
    sleep(1);

    // ⑦ Logout (token discarded by VU)
  });
  sleep(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 3 — Login → create post → logout
// ─────────────────────────────────────────────────────────────────────────────
export function scenarioCreatePost() {
  group('S3: create post', () => {
    // ① Login
    const auth = login();
    if (!auth) { sleep(1); return; }
    sleep(1);

    // ② Homepage (user navigates there before clicking "New Post")
    fetchPostsList(auth.token);
    sleep(1);

    // ③ Submit new post
    const ts  = Date.now();
    const res = http.post(
      `${BASE_URL}/api/posts`,
      JSON.stringify({
        title:       `Load test post ${ts}`,
        description: 'Automatically created by k6 performance test',
        body:        'This is the body of a post created during a k6 load test run.',
      }),
      { headers: authHdr(auth.token), tags: { name: 'posts/create' } },
    );
    createPostDuration.add(res.timings.duration);
    const ok = check(res, {
      'create post → 201':  (r) => r.status === 201,
      'create post → _id':  (r) => Boolean(r.json('_id')),
    });
    scenarioErrors.add(!ok);
    sleep(1);

    // ④ Logout (token discarded by VU)
  });
  sleep(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 4 — Login → view profile → update profile details → logout
// ─────────────────────────────────────────────────────────────────────────────
export function scenarioUpdateProfile() {
  group('S4: update profile', () => {
    // ① Login
    const auth = login();
    if (!auth) { sleep(1); return; }
    sleep(1);

    // ② Fetch own profile (GET /api/users/:id)
    let res = http.get(
      `${BASE_URL}/api/users/${auth.userId}`,
      { headers: authHdr(auth.token), tags: { name: 'users/profile' } },
    );
    profileViewDuration.add(res.timings.duration);
    check(res, {
      'profile → 200':  (r) => r.status === 200,
      'profile → user': (r) => Boolean(r.json('user')),
    });
    sleep(2); // user reviews profile details

    // ③ Update profile fields
    res = http.put(
      `${BASE_URL}/api/users/${auth.userId}`,
      JSON.stringify({
        bio:     `Updated by k6 at ${new Date().toISOString()}`,
        address: 'Kyiv, Ukraine',
        website: 'https://inkwell.dev',
      }),
      { headers: authHdr(auth.token), tags: { name: 'users/update' } },
    );
    profileUpdateDuration.add(res.timings.duration);
    const ok = check(res, {
      'profile update → 200':  (r) => r.status === 200,
      'profile update → name': (r) => Boolean(r.json('name')),
    });
    scenarioErrors.add(!ok);
    sleep(1);

    // ④ Logout (token discarded by VU)
  });
  sleep(1);
}
