async function fetchRates(currencyCode, fetchImplementation = fetch) {
  const response = await fetchImplementation(`https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(currencyCode)}`);
  if (!response.ok) throw new Error(`Frankfurter request failed with HTTP ${response.status}`);
  const data = await response.json();
  return { base: data.base, rates: Object.entries(data.rates).slice(0, 4) };
}

if (typeof module !== 'undefined') module.exports = { fetchRates };