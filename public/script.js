// Exchange Rate API helper function
async function getExchangeRates(baseCurrency) {
  try {
    // Validate inputs
    if (!baseCurrency) {
      throw new Error('Currency code is required');
    }

    // Clear previous messages
    clearMessages();
    displayMessage('Fetching exchange rates...', 'info');

    // Make API request for valid currency
    const validResponse = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`
    );

    // Get the actual HTTP status code from the response
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

    // Filter to show 3-4 exchange rates (limiting to 4)
    const ratesToDisplay = Object.entries(rates)
      .slice(0, 4)
      .reduce((acc, [currency, rate]) => {
        acc[currency] = rate;
        return acc;
      }, {});

    // Clear info message and display success
    clearMessages();
    displayMessage(
      `Exchange rates fetched successfully for ${baseCurrency}`,
      'success'
    );

    return {
      success: true,
      baseCurrency: baseCurrency,
      rates: ratesToDisplay
    };
  } catch (error) {
    clearMessages();
    displayMessage(`Error: ${error.message}`, 'error');
    return {
      success: false,
      error: error.message
    };
  }
}

// Display exchange rates on the page
function displayExchangeRates(exchangeRateData) {
  const section = document.getElementById('exchangeRateSection');
  const container = document.getElementById('exchangeRates');

  if (!exchangeRateData.success) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = '';

  const rates = exchangeRateData.rates;
  Object.entries(rates).forEach(([currency, rate]) => {
    const card = document.createElement('div');
    card.className = 'exchange-rate-card';
    card.innerHTML = `
      <div class="currency-code">${currency}</div>
      <div class="rate">1 ${exchangeRateData.baseCurrency} = ${rate.toFixed(2)} ${currency}</div>
    `;
    container.appendChild(card);
  });
}

// Message display helpers
function displayMessage(message, type = 'info') {
  const messagesContainer = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  messagesContainer.appendChild(messageDiv);
}

function clearMessages() {
  const messagesContainer = document.getElementById('messages');
  messagesContainer.innerHTML = '';
}

// Validate form fields
function validateForm() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const birthDate = document.getElementById('birthDate').value.trim();
  const currency = document.getElementById('currency').value.trim();

  if (!firstName) {
    displayMessage('First Name is required', 'error');
    return false;
  }

  if (!lastName) {
    displayMessage('Last Name is required', 'error');
    return false;
  }

  if (!birthDate) {
    displayMessage('Birthdate is required', 'error');
    return false;
  }

  if (!currency) {
    displayMessage('Currency selection is required', 'error');
    return false;
  }

  return true;
}

// Submit form data to backend
async function submitForm(event) {
  event.preventDefault();
  clearMessages();

  if (!validateForm()) {
    return;
  }

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const birthDate = document.getElementById('birthDate').value.trim();
  const currencyCode = document.getElementById('currency').value;

  // Map currency code to name
  const currencyNames = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    RWF: 'Rwandan Franc'
  };

  const currencyName = currencyNames[currencyCode];

  try {
    // Submit to backend
    const response = await fetch('/api/attendees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName,
        lastName,
        birthDate,
        currencyCode,
        currencyName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit form');
    }

    const data = await response.json();
    displayMessage('Registration successful!', 'success');
    console.log('Attendee created:', data);

    // Reset form
    document.getElementById('registrationForm').reset();

    // Fetch and display exchange rates
    const exchangeRateData = await getExchangeRates(currencyCode);
    displayExchangeRates(exchangeRateData);
  } catch (error) {
    displayMessage(`Submission error: ${error.message}`, 'error');
    console.error('Submission error:', error);
  }
}

// Handle currency change to fetch exchange rates
async function handleCurrencyChange(event) {
  const currency = event.target.value;

  if (currency) {
    const exchangeRateData = await getExchangeRates(currency);
    displayExchangeRates(exchangeRateData);
  } else {
    document.getElementById('exchangeRateSection').style.display = 'none';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registrationForm');
  const currencySelect = document.getElementById('currency');

  form.addEventListener('submit', submitForm);
  currencySelect.addEventListener('change', handleCurrencyChange);
});
