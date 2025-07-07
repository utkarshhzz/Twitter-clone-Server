// Test script to debug authentication
const axios = require('axios');

async function testAuth() {
    const serverUrl = 'http://localhost:8000/graphql';
    
    // Test 1: Check if server is running
    try {
        console.log('Testing server connection...');
        const response = await axios.post(serverUrl, {
            query: `
                query {
                    getCurrentUser {
                        id
                        email
                        firstName
                        lastName
                        profileImageURL
                    }
                }
            `
        });
        console.log('Server response (no auth):', response.data);
    } catch (error) {
        console.error('Server connection error:', error.message);
        return;
    }
    
    // Test 2: Check with Authorization header
    const testToken = 'your-jwt-token-here'; // Replace with actual token
    try {
        console.log('\nTesting with Authorization header...');
        const response = await axios.post(serverUrl, {
            query: `
                query {
                    getCurrentUser {
                        id
                        email
                        firstName
                        lastName
                        profileImageURL
                    }
                }
            `
        }, {
            headers: {
                'Authorization': `Bearer ${testToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Server response (with auth):', response.data);
    } catch (error) {
        console.error('Auth test error:', error.message);
    }
}

testAuth();
