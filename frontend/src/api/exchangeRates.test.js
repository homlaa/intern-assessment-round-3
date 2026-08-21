import { describe, it, expect, vi, afterEach } from 'vitest';
import { getExchangeRates } from './exchangeRates.js';

describe('getExchangeRates', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the exchange rates when the API responds successfully', async () => {
    const mockResponse = {
      amount: 1,
      base: 'USD',
      date: '2026-08-20',
      rates: { EUR: 0.856, GBP: 0.734, JPY: 158.76, CAD: 1.377 },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await getExchangeRates('USD');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v1/latest?base=USD'
    );
    expect(result).toEqual(mockResponse);
  });

  it('throws an error carrying the real HTTP status when the API call fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(getExchangeRates('ZZZ')).rejects.toMatchObject({
      status: 404,
      message: 'not found',
    });
  });
});
