const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  throw new Error('Set DATABASE_URL explicitly to a local disposable test database before running integration tests');
}

const url = new URL(rawUrl);
const database = decodeURIComponent(url.pathname.slice(1));
const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]']);
if (url.protocol !== 'mysql:' || !localHosts.has(url.hostname) || !/^yinshua_(ci|test)(_[a-z0-9_-]+)?$/.test(database)) {
  throw new Error('Integration tests require a local MySQL database named yinshua_ci or yinshua_test_*');
}

console.log(`Integration test database: ${url.hostname}:${url.port || '3306'}/${database}`);
