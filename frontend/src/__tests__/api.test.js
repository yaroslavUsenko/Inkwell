/**
 * Unit tests for src/api/axios.js
 *
 * axios.js is the only service-layer file in the frontend.
 * It configures an axios instance with a base URL and a request
 * interceptor that attaches the JWT token from localStorage.
 *
 * Tests run in a Node environment; localStorage is stubbed via
 * vi.stubGlobal so the interceptor can be exercised without a browser.
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../api/axios';

/** Minimal mock adapter — resolves immediately without a real HTTP call. */
const mockAdapter = (config) =>
  Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });

describe('api/axios instance', () => {
  let storage;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem:    vi.fn((key)        => storage[key] ?? null),
      setItem:    vi.fn((key, value) => { storage[key] = String(value); }),
      removeItem: vi.fn((key)        => { delete storage[key]; }),
      clear:      vi.fn(()           => { storage = {}; }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Configuration ───────────────────────────────────────────────────────────

  test('is created with base URL "/api"', () => {
    expect(api.defaults.baseURL).toBe('/api');
  });

  test('exposes the standard HTTP methods', () => {
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.put).toBe('function');
    expect(typeof api.delete).toBe('function');
  });

  // ── Request interceptor ─────────────────────────────────────────────────────

  test('adds Authorization header when token is present in localStorage', async () => {
    storage['token'] = 'jwt-test-token-abc';

    const res = await api.get('/users', { adapter: mockAdapter });

    expect(res.config.headers['Authorization']).toBe('Bearer jwt-test-token-abc');
  });

  test('does not add Authorization header when localStorage has no token', async () => {
    // storage is empty — no token set
    const res = await api.get('/users', { adapter: mockAdapter });

    expect(res.config.headers['Authorization']).toBeUndefined();
  });
});
