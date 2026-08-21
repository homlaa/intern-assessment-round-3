export const fetchExchangeRates = async (currency: string) => {
  if (!currency) {
    return {};
  }
  
  const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${currency}`);
  
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  const selectedRates: Record<string, number> = {};
  const targetCurrencies = ["USD", "EUR", "GBP", "AUD", "JPY"];
  
  for (const target of targetCurrencies) {
    if (target !== currency && data.rates && data.rates[target]) {
      selectedRates[target] = data.rates[target];
    }
    if (Object.keys(selectedRates).length >= 4) break;
  }
  
  return selectedRates;
};
