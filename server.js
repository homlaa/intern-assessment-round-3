const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { createAttendee, updateCurrency, findAttendee } = require('./db');

const publicDirectory = path.join(__dirname, 'frontend');
const port = Number(process.env.PORT || 3000);

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); }
    });
    request.on('error', reject);
  });
}

function validateRegistration(data) {
  const required = ['firstName', 'lastName', 'birthdate', 'currencyCode'];
  return required.every(field => typeof data[field] === 'string' && data[field].trim());
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const attendeeMatch = requestUrl.pathname.match(/^\/api\/attendees\/(\d+)$/);

  try {
    if (request.method === 'POST' && requestUrl.pathname === '/api/attendees') {
      const data = await readJson(request);
      if (!validateRegistration(data)) return sendJson(response, 400, { error: 'All fields are required.' });
      const id = createAttendee(data);
      return sendJson(response, 201, findAttendee(id));
    }

    if (attendeeMatch && request.method === 'PATCH') {
      const data = await readJson(request);
      if (typeof data.currencyCode !== 'string' || !data.currencyCode.trim()) {
        return sendJson(response, 400, { error: 'currencyCode is required.' });
      }
      if (!updateCurrency(Number(attendeeMatch[1]), data.currencyCode.trim().toUpperCase())) {
        return sendJson(response, 404, { error: 'Attendee not found.' });
      }
      return sendJson(response, 200, findAttendee(Number(attendeeMatch[1])));
    }

    if (attendeeMatch && request.method === 'GET') {
      const attendee = findAttendee(Number(attendeeMatch[1]));
      return attendee ? sendJson(response, 200, attendee) : sendJson(response, 404, { error: 'Attendee not found.' });
    }

    if (request.method === 'GET') {
      const fileName = requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname.slice(1);
      const filePath = path.normalize(path.join(publicDirectory, fileName));
      if (!filePath.startsWith(publicDirectory) || !fs.existsSync(filePath)) return sendJson(response, 404, { error: 'Not found.' });
      const contentType = filePath.endsWith('.css') ? 'text/css' : filePath.endsWith('.js') ? 'text/javascript' : 'text/html';
      response.writeHead(200, { 'Content-Type': contentType });
      return response.end(fs.readFileSync(filePath));
    }

    return sendJson(response, 404, { error: 'Not found.' });
  } catch (error) {
    return sendJson(response, 500, { error: error.message });
  }
});

if (require.main === module) server.listen(port, () => console.log(`Attendee app running at http://localhost:${port}`));

module.exports = { server };