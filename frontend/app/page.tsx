"use client";
import { useState, useEffect } from "react";
import { fetchExchangeRates } from "./api";

export default function Home() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    birthdate: "",
    currency: ""
  });
  const [rates, setRates] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [troubleshootingError, setTroubleshootingError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRates = async (currency: string) => {
    try {
      const selectedRates = await fetchExchangeRates(currency);
      setRates(selectedRates);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchInvalidRates = async () => {
    try {
      const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=INVALID_CODE`);
      if (!response.ok) {
        setTroubleshootingError(`Failed with status: ${response.status}`);
      }
    } catch (error: any) {
      setTroubleshootingError(`Error: ${error.message}`);
    }
  };
  useEffect(() => {
    if (user.currency) {
      fetchRates(user.currency);
      fetchInvalidRates();
    }
  }, [user.currency]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!user.firstName || !user.lastName || !user.birthdate || !user.currency) {
      setErrorMsg("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/attendees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMsg("Saved successfully!");
        console.log("Response data:", data);
      } else {
        setErrorMsg("Failed to save to backend.");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Error saving to backend.");
    }
  }

  function handleClear(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setUser({
      firstName: "",
      lastName: "",
      birthdate: "",
      currency: ""
    });
    setRates({});
    setErrorMsg("");
    setSuccessMsg("");
    setTroubleshootingError("");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 ">
      <div className="w-full  rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Registration Form</h1>

        {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMsg}</div>}

        <form className="flex flex-col gap-4" onSubmit={handleSave}>
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">First Name</label>
            <input
              type="text"
              placeholder="First Name"
              className="p-2 "
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Last Name</label>
            <input
              type="text"
              placeholder="Last Name"
              className="p-2 "
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Birthdate</label>
            <input
              type="date"
              className="p-2 "
              value={user.birthdate}
              onChange={(e) => setUser({ ...user, birthdate: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Home Currency</label>
            <select
              className="p-2 "
              value={user.currency}
              onChange={(e) => setUser({ ...user, currency: e.target.value })}
            >
              <option value="" disabled>Select currency</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="AUD">AUD</option>
              <option value="RWF">RWF</option>
            </select>
          </div>

          <div className="flex gap-4 mt-4">
            <button type="submit" className="flex-1 ">Save</button>
            <button type="button" onClick={handleClear} className="">Clear</button>
          </div>
        </form>
      </div>

      {(Object.keys(rates).length > 0 || troubleshootingError) && (
        <div className="w-full max-w-md b ">
          <h2 className="text-xl font-bold mb-4">Exchange Rates</h2>

          {Object.keys(rates).length > 0 && (
            <div className="mb-4">
              <h3 className="">Base: {user.currency}</h3>
              <ul className="">
                {Object.entries(rates).map(([currency, rate]) => (
                  <li key={currency} className="py-2 flex justify-between">
                    <span>{currency}</span>
                    <span className="font-mono">{rate as number}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {troubleshootingError && (
            <div className="mt-4 p-3 ">
              <p className="font-semibold">Troubleshooting Call (Invalid Currency):</p>
              <p>{troubleshootingError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
