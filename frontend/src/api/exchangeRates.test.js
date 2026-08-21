import { describe, it, expect, vi, afterEach } from 'vitest';
import { getExchangeRates } from './exchangeRates.js';

describe('getExchangeRates', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the rates when the API call succeeds', async () => {
    const fakeRates = {
      base: 'USD',
      rates: { EUR: 0.86, GBP: 0.73, JPY: 158.76 },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeRates,
    });

    const result = await getExchangeRates('USD');

    expect(result).toEqual(fakeRates);
  });

  it('throws with the real status code when the API call fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'not found' }),
    });

    await expect(getExchangeRates('XXX')).rejects.toMatchObject({
      status: 404,
      message: 'not found',
    });
  });
});
