const test = require('node:test');
const assert = require('node:assert/strict');
const { fetchRates } = require('../frontend/exchange');

test('fetchRates returns rates from a successful Frankfurter response', async () => {
  const result = await fetchRates('USD', async () => ({
    ok: true,
    json: async () => ({ base: 'USD', rates: { EUR: 0.92, GBP: 0.78, RWF: 1310, JPY: 150, CAD: 1.35 } })
  }));
  assert.deepEqual(result, { base: 'USD', rates: [['EUR', 0.92], ['GBP', 0.78], ['RWF', 1310], ['JPY', 150]] });
});

test('fetchRates reports the HTTP status from a failed response', async () => {
  await assert.rejects(
    fetchRates('INVALID', async () => ({ ok: false, status: 404 })),
    { message: 'Frankfurter request failed with HTTP 404' }
  );
});