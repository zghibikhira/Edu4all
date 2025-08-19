const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test authentication and feed endpoint
async function testAuthAndFeed() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test login with a test user
    console.log('\nTesting login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'student@test.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('User role:', user.role);
    console.log('User ID:', user._id);
    
    // Test feed endpoint with authentication
    console.log('\nTesting feed endpoint...');
    const feedResponse = await axios.get(`${API_BASE_URL}/posts/feed`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 10
      }
    });
    
    console.log('✅ Feed endpoint working:', feedResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAuthAndFeed();
