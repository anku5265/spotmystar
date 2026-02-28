import axios from 'axios';

const API_URL = 'http://localhost:5000';

async function testAdminAPI() {
  console.log('🔍 Testing Admin API endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const health = await axios.get(`${API_URL}/api`);
    console.log('✓ Server is running:', health.data.message);
    console.log('');

    // Test 2: Test admin stats endpoint (without auth)
    console.log('2. Testing /api/admin/stats...');
    try {
      const stats = await axios.get(`${API_URL}/api/admin/stats`);
      console.log('✓ Stats endpoint working');
      console.log('Stats data:', JSON.stringify(stats.data, null, 2));
    } catch (error) {
      console.log('✗ Stats endpoint error:', error.response?.status, error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Test admin artists endpoint
    console.log('3. Testing /api/admin/artists...');
    try {
      const artists = await axios.get(`${API_URL}/api/admin/artists`);
      console.log('✓ Artists endpoint working');
      console.log(`Found ${artists.data.length} artists`);
    } catch (error) {
      console.log('✗ Artists endpoint error:', error.response?.status, error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Test admin users endpoint
    console.log('4. Testing /api/admin/users...');
    try {
      const users = await axios.get(`${API_URL}/api/admin/users`);
      console.log('✓ Users endpoint working');
      console.log(`Found ${users.data.length} users`);
    } catch (error) {
      console.log('✗ Users endpoint error:', error.response?.status, error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Test admin bookings endpoint
    console.log('5. Testing /api/admin/bookings...');
    try {
      const bookings = await axios.get(`${API_URL}/api/admin/bookings`);
      console.log('✓ Bookings endpoint working');
      console.log(`Found ${bookings.data.length} bookings`);
    } catch (error) {
      console.log('✗ Bookings endpoint error:', error.response?.status, error.response?.data || error.message);
    }
    console.log('');

    // Test 6: Test user management endpoints
    console.log('6. Testing /api/user-management/users...');
    try {
      const managedUsers = await axios.get(`${API_URL}/api/user-management/users`);
      console.log('✓ User management endpoint working');
      console.log(`Found ${managedUsers.data.length} managed users`);
    } catch (error) {
      console.log('✗ User management endpoint error:', error.response?.status, error.response?.data || error.message);
    }
    console.log('');

    console.log('✅ API testing complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

testAdminAPI();
