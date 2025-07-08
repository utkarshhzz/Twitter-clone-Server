const JWT = require('jsonwebtoken');

const JWT_SECRET = "$uper@1234.";

// Create a test user payload (this should match your database user)
const testUser = {
    id: "test-user-123",
    email: "test@example.com"
};

// Generate JWT token
const token = JWT.sign(testUser, JWT_SECRET);

console.log('Generated JWT Token:');
console.log(token);

console.log('\n=== Test createTweet with curl equivalent ===');

const curlCommand = `Invoke-WebRequest -Uri "http://localhost:8000/graphql" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer ${token}"} -Body '{"query":"mutation { createTweet(content: \\"Hello World!\\") { id content author { id email } } }"}'`;

console.log(curlCommand);

console.log('\n=== Test with Node.js fetch ===');
const testMutation = async () => {
    try {
        const response = await fetch('http://localhost:8000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query: `mutation { createTweet(content: "Hello World!") { id content author { id email } } }`
            })
        });
        
        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

// Uncomment to run the test
// testMutation();
