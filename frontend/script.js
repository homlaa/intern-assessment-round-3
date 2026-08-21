const form = document.getElementById("registrationForm");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const birthdateInput = document.getElementById("birthdate");
const currencyInput = document.getElementById("currency");

const ratesContainer = document.getElementById("rates");
const ratesMessage = document.getElementById("ratesMessage");
const apiError = document.getElementById("apiError");
const formMessage = document.getElementById("formMessage");

const clearButton = document.getElementById("clearButton");


// ============================================
// EXCHANGE RATE FUNCTION
// ============================================

async function fetchExchangeRates(currency) {

    // We want these 4 currencies displayed.
    const targetCurrencies = ["USD", "EUR", "GBP", "JPY"];

    // Remove the selected base currency from the targets.
    const symbols = targetCurrencies
        .filter(code => code !== currency)
        .join(",");

    try {

        const response = await fetch(
            `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=${symbols}`
        );

        // Check the real HTTP response.
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return data.rates;

    } catch (error) {

        console.error("Exchange rate error:", error);

        throw error;
    }
}


// ============================================
// DISPLAY EXCHANGE RATES
// ============================================

function displayRates(rates, baseCurrency) {

    ratesContainer.innerHTML = "";

    Object.entries(rates).forEach(([currency, rate]) => {

        const rateElement = document.createElement("div");

        rateElement.className = "rate-item";

        rateElement.textContent =
            `1 ${baseCurrency} = ${rate} ${currency}`;

        ratesContainer.appendChild(rateElement);
    });

    ratesMessage.textContent = "Current exchange rates:";
}


// ============================================
// WHEN CURRENCY IS SELECTED
// ============================================

currencyInput.addEventListener("change", async function () {

    const currency = currencyInput.value;

    ratesContainer.innerHTML = "";
    apiError.textContent = "";

    if (!currency) {

        ratesMessage.textContent =
            "Select a currency to see exchange rates.";

        return;
    }

    ratesMessage.textContent =
        "Loading exchange rates...";

    try {

        const rates = await fetchExchangeRates(currency);

        displayRates(rates, currency);

    } catch (error) {

        ratesMessage.textContent =
            "Unable to load exchange rates.";

        apiError.textContent =
            `Request failed: ${error.message}`;
    }
});


// ============================================
// FORM VALIDATION
// ============================================

function validateForm() {

    let isValid = true;

    // Clear previous errors
    document.querySelectorAll(".error").forEach(error => {
        error.textContent = "";
    });

    // First name
    if (!firstNameInput.value.trim()) {

        document.getElementById("firstNameError").textContent =
            "First name is required.";

        isValid = false;
    }

    // Last name
    if (!lastNameInput.value.trim()) {

        document.getElementById("lastNameError").textContent =
            "Last name is required.";

        isValid = false;
    }

    // Birthdate
    if (!birthdateInput.value) {

        document.getElementById("birthdateError").textContent =
            "Birthdate is required.";

        isValid = false;
    }

    // Currency
    if (!currencyInput.value) {

        document.getElementById("currencyError").textContent =
            "Please select a currency.";

        isValid = false;
    }

    return isValid;
}


// ============================================
// SAVE
// ============================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    formMessage.textContent = "";

    // Validate everything before submitting
    if (!validateForm()) {

        formMessage.textContent =
            "Please complete all required fields.";

        return;
    }

    const attendee = {

        firstName: firstNameInput.value.trim(),

        lastName: lastNameInput.value.trim(),

        birthdate: birthdateInput.value,

        currency: currencyInput.value
    };

    console.log("Attendee:", attendee);

    formMessage.textContent =
        "Form is valid. Backend connection will be added next.";
});


// ============================================
// CLEAR
// ============================================

clearButton.addEventListener("click", function () {

    form.reset();

    ratesContainer.innerHTML = "";

    ratesMessage.textContent =
        "Select a currency to see exchange rates.";

    apiError.textContent = "";

    formMessage.textContent = "";

    document.querySelectorAll(".error").forEach(error => {
        error.textContent = "";
    });
});