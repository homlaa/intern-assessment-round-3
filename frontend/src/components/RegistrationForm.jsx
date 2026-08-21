import { useEffect, useState } from 'react';
import { getExchangeRates } from '../api/exchangeRates.js';
import { createAttendee } from '../api/attendees.js';
import './RegistrationForm.css';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'RWF', name: 'Rwandan Franc' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'ZAR', name: 'South African Rand' },
];

// Deliberately invalid so the second Frankfurter call is guaranteed to fail,
// per the troubleshooting requirement.
const INVALID_DEMO_CODE = 'XXX';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  birthdate: '',
  homeCurrency: '',
};

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!form.birthdate) errors.birthdate = 'Birthdate is required.';
  else if (new Date(form.birthdate) > new Date()) errors.birthdate = 'Birthdate cannot be in the future.';
  if (!form.homeCurrency) errors.homeCurrency = 'Home currency is required.';
  return errors;
}

export default function RegistrationForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [rates, setRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(null);

  const [demoResult, setDemoResult] = useState(null);
  const [demoError, setDemoError] = useState(null);

  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    if (!form.homeCurrency) {
      setRates(null);
      setRatesError(null);
      setDemoResult(null);
      setDemoError(null);
      return;
    }

    let cancelled = false;

    async function loadRates() {
      setRatesLoading(true);
      setRatesError(null);
      setRates(null);
      try {
        const data = await getExchangeRates(form.homeCurrency);
        if (!cancelled) setRates(data);
      } catch (err) {
        if (!cancelled) setRatesError(err);
      } finally {
        if (!cancelled) setRatesLoading(false);
      }
    }

    // Troubleshooting: run a second, deliberately invalid call alongside the
    // real one so both the success and failure paths are demonstrated.
    async function loadInvalidDemo() {
      setDemoResult(null);
      setDemoError(null);
      try {
        const data = await getExchangeRates(INVALID_DEMO_CODE);
        if (!cancelled) setDemoResult(data);
      } catch (err) {
        if (!cancelled) setDemoError(err);
      }
    }

    loadRates();
    loadInvalidDemo();

    return () => {
      cancelled = true;
    };
  }, [form.homeCurrency]);

  function handleChange(field) {
    return (event) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setSaveState({ status: 'idle', message: '' });
    };
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setErrors({});
    setRates(null);
    setRatesError(null);
    setDemoResult(null);
    setDemoError(null);
    setSaveState({ status: 'idle', message: '' });
  }

  async function handleSave(event) {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaveState({ status: 'saving', message: '' });
    try {
      const attendee = await createAttendee({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthdate: form.birthdate,
        currencyCode: form.homeCurrency,
      });
      setSaveState({
        status: 'success',
        message: `Saved! ${attendee.first_name} ${attendee.last_name} registered with ${attendee.currency_name} (${attendee.currency_code}).`,
      });
    } catch (err) {
      setSaveState({
        status: 'error',
        message: err.status ? `Save failed (HTTP ${err.status}): ${err.message}` : `Save failed: ${err.message}`,
      });
    }
  }

  const displayedRates = rates?.rates ? Object.entries(rates.rates).slice(0, 4) : [];

  return (
    <form className="registration-form" onSubmit={handleSave} noValidate>
      <h1>Attendee Registration</h1>

      <div className="field">
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          value={form.firstName}
          onChange={handleChange('firstName')}
        />
        {errors.firstName && <span className="error">{errors.firstName}</span>}
      </div>

      <div className="field">
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          value={form.lastName}
          onChange={handleChange('lastName')}
        />
        {errors.lastName && <span className="error">{errors.lastName}</span>}
      </div>

      <div className="field">
        <label htmlFor="birthdate">Birthdate</label>
        <input
          id="birthdate"
          type="date"
          value={form.birthdate}
          onChange={handleChange('birthdate')}
        />
        {errors.birthdate && <span className="error">{errors.birthdate}</span>}
      </div>

      <div className="field">
        <label htmlFor="homeCurrency">Home Currency</label>
        <select
          id="homeCurrency"
          value={form.homeCurrency}
          onChange={handleChange('homeCurrency')}
        >
          <option value="">Select a currency</option>
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </option>
          ))}
        </select>
        {errors.homeCurrency && <span className="error">{errors.homeCurrency}</span>}
      </div>

      {form.homeCurrency && (
        <div className="rates-panel">
          <h2>Exchange rates (base: {form.homeCurrency})</h2>
          {ratesLoading && <p>Loading rates...</p>}
          {ratesError && (
            <p className="error">
              Failed to load rates{ratesError.status ? ` (HTTP ${ratesError.status})` : ''}: {ratesError.message}
            </p>
          )}
          {!ratesLoading && !ratesError && displayedRates.length > 0 && (
            <ul>
              {displayedRates.map(([code, value]) => (
                <li key={code}>
                  1 {form.homeCurrency} = {value} {code}
                </li>
              ))}
            </ul>
          )}

          <h3>Troubleshooting demo (calling "{INVALID_DEMO_CODE}")</h3>
          {demoError && (
            <p className="error">
              Real HTTP status from response: {demoError.status} - {demoError.message}
            </p>
          )}
          {demoResult && <p>Unexpectedly succeeded: {JSON.stringify(demoResult)}</p>}
        </div>
      )}

      <div className="actions">
        <button type="submit" disabled={saveState.status === 'saving'}>
          {saveState.status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={handleClear}>
          Clear
        </button>
      </div>

      {saveState.status !== 'idle' && (
        <p className={saveState.status === 'error' ? 'error' : 'success'}>{saveState.message}</p>
      )}
    </form>
  );
}
