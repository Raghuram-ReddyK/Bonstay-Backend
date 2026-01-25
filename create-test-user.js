const http = require('http');

const testData = JSON.stringify({
  name: 'Test User',
  email: 'rrrkarnati2000@gmail.com',
  password: 'password123',
  address: 'Test Address',
  country: 'Test Country',
  phoneNo: '1234567890',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  occupation: 'Tester'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Creating test user for forgot password testing...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);

  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Response body:', body);
    console.log('Test user created. Now testing forgot password...');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(testData);
req.end();