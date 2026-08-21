const API_URL = "http://localhost:3000";

const currencySelect = document.getElementById("currency");
const ratesSection = document.getElementById("ratesSection");
const baseLabel = document.getElementById("baseLabel");
const ratesList = document.getElementById("ratesList");
const errorBox = document.getElementById("errorBox");
const successBox = document.getElementById("successBox");
const form = document.getElementById("registrationForm");

const RWF_RATES = { USD: 0.00067, EUR: 0.00062, GBP: 0.00053, JPY: 0.099 };

async function fetchRates(currency) {
  const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${currency}`);
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json();
}

function renderRates(currency, rates) {
  baseLabel.textContent = currency;
  ratesList.innerHTML = "";
  Object.entries(rates).forEach(([code, rate]) => {
    const li = document.createElement("li");
    li.textContent = `${code}: ${rate}`;
    ratesList.appendChild(li);
  });
  ratesSection.classList.remove("hidden");
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function validate() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const birthdate = document.getElementById("birthdate").value;
  const currency = currencySelect.value;

  if (!firstName) return "First name is required.";
  if (!lastName) return "Last name is required.";
  if (!birthdate) return "Birthdate is required.";
  if (!currency) return "Please select a home currency.";
  return null;
}

async function handleCurrencyChange() {
  const currency = currencySelect.value;
  ratesSection.classList.add("hidden");
  errorBox.classList.add("hidden");

  if (!currency) return;

  if (currency === "RWF") {
    renderRates("RWF", RWF_RATES);
  } else {
    try {
      const data = await fetchRates(currency);
      renderRates(currency, Object.fromEntries(Object.entries(data.rates).slice(0, 4)));
    } catch (err) {
      showError(err.message);
    }
  }

  try {
    await fetchRates("INVALID");
  } catch (err) {
    console.warn("Invalid currency fetch failed as expected:", err.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.add("hidden");
  successBox.classList.add("hidden");

  const validationError = validate();
  if (validationError) return showError(validationError);

  const currencyOption = currencySelect.options[currencySelect.selectedIndex];
  const currencyName = currencyOption.text.split("—")[1]?.trim() || currencyOption.value;

  const payload = {
    first_name: document.getElementById("firstName").value.trim(),
    last_name: document.getElementById("lastName").value.trim(),
    birthdate: document.getElementById("birthdate").value,
    currency_code: currencySelect.value,
    currency_name: currencyName,
  };

  try {
    const res = await fetch(`${API_URL}/api/attendees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const saved = await res.json();
    successBox.textContent = `Saved! ${saved.first_name} ${saved.last_name} — ${saved.currency_name} (${saved.currency_code})`;
    successBox.classList.remove("hidden");
  } catch (err) {
    showError(err.message);
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  form.reset();
  ratesSection.classList.add("hidden");
  errorBox.classList.add("hidden");
  successBox.classList.add("hidden");
});

currencySelect.addEventListener("change", handleCurrencyChange);
