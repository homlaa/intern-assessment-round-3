import { useEffect, useState } from 'react';
import { getExchangeRates } from '../api/exchangeRates.js';
import { createAttendee } from '../api/attendees.js';
import './RegistrationForm.css';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'RWF', 'JPY', 'CAD', 'AUD', 'ZAR'];

function RegistrationForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [currency, setCurrency] = useState('');
  const [errors, setErrors] = useState({});

  const [rates, setRates] = useState(null);
  const [ratesError, setRatesError] = useState('');

  const [invalidCallResult, setInvalidCallResult] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currency) {
      setRates(null);
      setRatesError('');
      setInvalidCallResult('');
      return;
    }

    async function loadRates() {
      try {
        const data = await getExchangeRates(currency);
        setRates(data);
        setRatesError('');
      } catch (err) {
        setRates(null);
        setRatesError(err.message);
      }
    }

    async function loadInvalidRates() {
      try {
        await getExchangeRates('XXX');
        setInvalidCallResult('this should not have worked');
      } catch (err) {
        setInvalidCallResult(`failed as expected - status ${err.status}: ${err.message}`);
      }
    }

    loadRates();
    loadInvalidRates();
  }, [currency]);

  function validate() {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!birthdate) newErrors.birthdate = 'Birthdate is required';
    if (!currency) newErrors.currency = 'Home currency is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage('');

    if (!validate()) return;

    try {
      const saved = await createAttendee({ firstName, lastName, birthdate, currencyCode: currency });
      setMessage(`Saved ${saved.first_name} ${saved.last_name} with ${saved.currency_name} (${saved.currency_code})`);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  }

  function handleClear() {
    setFirstName('');
    setLastName('');
    setBirthdate('');
    setCurrency('');
    setErrors({});
    setRates(null);
    setRatesError('');
    setInvalidCallResult('');
    setMessage('');
  }

  return (
    <form className="registration-form" onSubmit={handleSave}>
      <h1>Attendee Registration</h1>

      <label htmlFor="firstName">First Name</label>
      <input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      {errors.firstName && <p className="error">{errors.firstName}</p>}

      <label htmlFor="lastName">Last Name</label>
      <input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      {errors.lastName && <p className="error">{errors.lastName}</p>}

      <label htmlFor="birthdate">Birthdate</label>
      <input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
      {errors.birthdate && <p className="error">{errors.birthdate}</p>}

      <label htmlFor="currency">Home Currency</label>
      <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="">-- select a currency --</option>
        {CURRENCIES.map((code) => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>
      {errors.currency && <p className="error">{errors.currency}</p>}

      {currency && (
        <div className="rates-box">
          <h3>Exchange rates for {currency}</h3>
          {ratesError && <p className="error">Could not load rates: {ratesError}</p>}
          {rates && (
            <ul>
              {Object.entries(rates.rates).slice(0, 4).map(([code, value]) => (
                <li key={code}>1 {currency} = {value} {code}</li>
              ))}
            </ul>
          )}

          <p className="invalid-demo">Invalid currency test (code "XXX"): {invalidCallResult}</p>
        </div>
      )}

      <div className="buttons">
        <button type="submit">Save</button>
        <button type="button" onClick={handleClear}>Clear</button>
      </div>

      {message && <p>{message}</p>}
    </form>
  );
}

export default RegistrationForm;
