import { describe, it, expect, vi } from 'vitest';
import { fetchExchangeRates } from './api';

describe('fetchExchangeRates', () => {
  it('correctly returns the rates when the API returns a successful response', async () => {
    const mockResponse = {
      rates: {
        USD: 1.0,
        EUR: 0.9,
        GBP: 0.8,
        AUD: 1.5,
        JPY: 150.0
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const rates = await fetchExchangeRates('USD');
    expect(rates).toEqual({
      EUR: 0.9,
      GBP: 0.8,
      AUD: 1.5,
      JPY: 150.0
    });

    expect(global.fetch).toHaveBeenCalledWith('https://api.frankfurter.dev/v1/latest?base=USD');
  });

  it('returns empty object if currency is empty', async () => {
    const rates = await fetchExchangeRates('');
    expect(rates).toEqual({});
  });
});
