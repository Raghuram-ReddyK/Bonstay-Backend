const http = require('http');

const testData = JSON.stringify({
  identifier: "rrrkarnati2000@gmail.com" // Use your actual email that exists in the database
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users/forgot-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Testing forgot password functionality...');

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
    console.log('Forgot password test completed. Check your email!');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(testData);
req.end();