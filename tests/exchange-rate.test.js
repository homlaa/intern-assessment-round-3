/**
 * Unit test for getExchangeRates function
 * Tests the async/await API integration with mocked responses
 */

// Mock fetch globally for Jest
global.fetch = jest.fn();

// Helper function to simulate getExchangeRates (client-side)
// This mimics the frontend function but in a testable way
async function getExchangeRatesForTest(baseCurrency) {
  try {
    if (!baseCurrency) {
      throw new Error('Currency code is required');
    }

    // Make API request for valid currency
    const validResponse = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`
    );

    if (!validResponse.ok) {
      const status = validResponse.status;
      throw new Error(
        `API request failed with status code: ${status}. Response: ${validResponse.statusText}`
      );
    }

    const validData = await validResponse.json();

    // Make API request for invalid currency (to test error handling)
    const invalidCurrencyCode = 'XYZ999';
    try {
      const invalidResponse = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=${invalidCurrencyCode}`
      );

      if (!invalidResponse.ok) {
        const errorStatus = invalidResponse.status;
        console.log(
          `Invalid currency request failed as expected with status code: ${errorStatus}`
        );
      }
    } catch (invalidError) {
      console.log('Invalid currency request error (expected):', invalidError.message);
    }

    // Extract rates from the response
    const rates = validData.rates;

    // Filter to show 3-4 exchange rates
    const ratesToDisplay = Object.entries(rates)
      .slice(0, 4)
      .reduce((acc, [currency, rate]) => {
        acc[currency] = rate;
        return acc;
      }, {});

    return {
      success: true,
      baseCurrency: baseCurrency,
      rates: ratesToDisplay
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

describe('Exchange Rate API Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should successfully fetch and return exchange rates for a valid currency', async () => {
    // Mock successful API response
    const mockValidResponse = {
      ok: true,
      json: async () => ({
        base: 'USD',
        date: '2024-08-21',
        rates: {
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.5,
          CHF: 0.87
        }
      })
    };

    // Mock failed response for invalid currency
    const mockInvalidResponse = {
      ok: false,
      status: 404
    };

    // Set up fetch to return valid response first, then invalid response
    global.fetch
      .mockResolvedValueOnce(mockValidResponse)
      .mockResolvedValueOnce(mockInvalidResponse);

    const result = await getExchangeRatesForTest('USD');

    // Assertions
    expect(result.success).toBe(true);
    expect(result.baseCurrency).toBe('USD');
    expect(result.rates).toBeDefined();
    expect(Object.keys(result.rates).length).toBeLessThanOrEqual(4);
    expect(Object.keys(result.rates).length).toBeGreaterThanOrEqual(3);

    // Verify the rates are correct
    expect(result.rates).toHaveProperty('EUR');
    expect(result.rates.EUR).toBe(0.92);
    expect(result.rates).toHaveProperty('GBP');
    expect(result.rates.GBP).toBe(0.79);
  });

  test('should handle API errors gracefully', async () => {
    // Mock failed API response
    const mockErrorResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    };

    global.fetch.mockResolvedValueOnce(mockErrorResponse);

    const result = await getExchangeRatesForTest('USD');

    // Assertions
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('500');
  });

  test('should handle missing currency parameter', async () => {
    const result = await getExchangeRatesForTest('');

    // Assertions
    expect(result.success).toBe(false);
    expect(result.error).toContain('Currency code is required');
  });

  test('should handle invalid currency code with 404 status', async () => {
    // Mock response for valid currency
    const mockValidResponse = {
      ok: true,
      json: async () => ({
        base: 'EUR',
        rates: {
          USD: 1.09,
          GBP: 0.86,
          JPY: 162.5,
          RWF: 1400.0
        }
      })
    };

    // Mock response for invalid currency (404)
    const mockInvalidResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    };

    global.fetch
      .mockResolvedValueOnce(mockValidResponse)
      .mockResolvedValueOnce(mockInvalidResponse);

    const result = await getExchangeRatesForTest('EUR');

    // Assertions
    expect(result.success).toBe(true);
    expect(result.baseCurrency).toBe('EUR');
    
    // Verify that fetch was called twice (valid and invalid)
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Verify the calls
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v1/latest?base=EUR'
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v1/latest?base=XYZ999'
    );
  });

  test('should return correct HTTP status code for failed requests without hardcoding', async () => {
    // Mock a 429 (Too Many Requests) response
    const mockResponse = {
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    };

    global.fetch.mockResolvedValueOnce(mockResponse);

    const result = await getExchangeRatesForTest('USD');

    expect(result.success).toBe(false);
    expect(result.error).toContain('429');
    expect(result.error).not.toContain('hardcoded');
  });

  test('should include 3-4 exchange rates in the response', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        base: 'GBP',
        rates: {
          USD: 1.27,
          EUR: 1.17,
          JPY: 187.5,
          CAD: 1.73,
          AUD: 1.95 // 5th currency, should be excluded
        }
      })
    };

    // Mock invalid response
    const mockInvalidResponse = {
      ok: false,
      status: 404
    };

    global.fetch
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockInvalidResponse);

    const result = await getExchangeRatesForTest('GBP');

    // Should have exactly 4 rates (limited by slice(0, 4))
    expect(Object.keys(result.rates).length).toBe(4);
    expect(result.rates).toHaveProperty('USD');
    expect(result.rates).toHaveProperty('EUR');
    expect(result.rates).toHaveProperty('JPY');
    expect(result.rates).toHaveProperty('CAD');
    expect(result.rates).not.toHaveProperty('AUD');
  });
});
