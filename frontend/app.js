const form = document.querySelector('#registration-form');
const currency = document.querySelector('#currency');
const rateList = document.querySelector('#rate-list');
const baseLabel = document.querySelector('#base-label');
const message = document.querySelector('#form-message');
const errorStatus = document.querySelector('#error-status');

async function loadRates(currencyCode) {
	errorStatus.textContent = '';
	rateList.innerHTML = '<p class="empty">Loading latest rates...</p>';
	try {
		const result = await fetchRates(currencyCode);
		baseLabel.textContent = result.base;
		rateList.innerHTML = result.rates.map(([code, value]) => `<div class="rate"><span>1 ${result.base} in ${code}</span><strong>${value}</strong></div>`).join('');
		try {
			await fetchRates('INVALID');
		} catch (error) {
			errorStatus.textContent = `Troubleshooting request: ${error.message}`;
		}
	} catch (error) {
		rateList.innerHTML = '<p class="empty">Rates could not be loaded.</p>';
		errorStatus.textContent = error.message;
	}
}

currency.addEventListener('change', () => { if (currency.value) loadRates(currency.value); });

form.addEventListener('submit', async event => {
	event.preventDefault();
	message.textContent = '';
	if (!form.reportValidity()) return;
	const data = Object.fromEntries(new FormData(form));
	try {
		const response = await fetch('/api/attendees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
		const result = await response.json();
		if (!response.ok) throw new Error(result.error || `Save failed with HTTP ${response.status}`);
		message.textContent = `Saved ${result.firstName} ${result.lastName}.`;
		form.reset();
	} catch (error) { message.textContent = error.message; }
});

document.querySelector('#clear').addEventListener('click', () => {
	form.reset();
	message.textContent = '';
	errorStatus.textContent = '';
	baseLabel.textContent = '—';
	rateList.innerHTML = '<p class="empty">Choose a currency to load the latest rates.</p>';
});
