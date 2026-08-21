global.fetch = jest.fn();

async function fetchRates(currency) {
  const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${currency}`);
  if (!response.ok) {
    const status = response.status;
    throw new Error(`Request failed with status ${status}`);
  }
  return response.json();
}

describe("fetchRates", () => {
  afterEach(() => jest.clearAllMocks());

  test("returns rates on a successful response", async () => {
    const mockData = {
      base: "USD",
      rates: { EUR: 0.92, GBP: 0.79, JPY: 149.3, CAD: 1.36 },
    };

    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const data = await fetchRates("USD");
    expect(data.base).toBe("USD");
    expect(data.rates).toHaveProperty("EUR");
    expect(Object.keys(data.rates).length).toBe(4);
  });

  test("throws with the real HTTP status on failure", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchRates("INVALID")).rejects.toThrow("Request failed with status 404");
  });
});
