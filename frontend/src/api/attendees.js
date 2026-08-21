const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function createAttendee(attendee) {
  const response = await fetch(`${API_URL}/api/attendees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attendee),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to save attendee');
  }

  return data;
}

export async function updateAttendeeCurrency(id, currencyCode) {
  const response = await fetch(`${API_URL}/api/attendees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currencyCode }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update currency');
  }

  return data;
}
