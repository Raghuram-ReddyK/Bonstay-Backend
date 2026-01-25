const http = require('http');

const postData = JSON.stringify({
  name: 'Test User',
  email: 'test@example.com',
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
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing user registration with email...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Response body:', body);
    console.log('Registration test completed. Check your email!');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();