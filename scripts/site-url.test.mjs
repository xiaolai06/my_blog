import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSiteUrl } from './site-url.mjs';

test('local previews keep their local default', () => {
  assert.equal(resolveSiteUrl({}), 'http://localhost:4321/');
});
test('release accepts a complete HTTPS origin', () => {
  assert.equal(resolveSiteUrl({ SITE_URL: ' https://blog.xiaolai06.cn ' }, { release: true }), 'https://blog.xiaolai06.cn/');
});
for (const value of ['', 'not-a-url', 'http://blog.xiaolai06.cn', 'http://localhost:4321',
  'https://127.0.0.1', 'https://your-domain.example', 'https://build-check.invalid',
  'https://example.com', 'https://blog.xiaolai06.cn/my_blog/',
  'https://user:password@blog.xiaolai06.cn', 'https://blog.xiaolai06.cn/?preview=1',
  'https://blog.xiaolai06.cn/#preview']) {
  test(`release rejects ${value || 'a missing domain'}`, () => {
    assert.throws(() => resolveSiteUrl({ SITE_URL: value }, { release: true }));
  });
}
