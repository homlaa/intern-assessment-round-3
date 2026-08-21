const FRANKFURTER_BASE_URL = 'https://api.frankfurter.dev/v1/latest';

/**
 * Fetches the latest exchange rates for a given base currency from the
 * Frankfurter API. Throws an Error whose `.status` is the real HTTP status
 * code returned by the API (e.g. 404 for an unknown currency code) rather
 * than a hardcoded value.
 */
export async function getExchangeRates(baseCurrency) {
  const url = `${FRANKFURTER_BASE_URL}?base=${encodeURIComponent(baseCurrency)}`;

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}
