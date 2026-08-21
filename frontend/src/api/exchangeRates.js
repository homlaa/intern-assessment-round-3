export async function getExchangeRates(baseCurrency) {
  const url = `https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch exchange rates');
    error.status = response.status;
    throw error;
  }

  return data;
}
