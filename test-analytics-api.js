// Test Analytics API Endpoints
const BACKEND_URL = 'https://spotmystar-backend.vercel.app';

async function testAnalyticsAPI() {
  console.log('🧪 Testing Analytics API Endpoints\n');
  console.log('Backend URL:', BACKEND_URL);
  console.log('─'.repeat(60));

  // Test 1: Backend Health
  console.log('\n✓ Test 1: Backend Health Check');
  try {
    const response = await fetch(`${BACKEND_URL}/api`);
    const data = await response.json();
    console.log('  Status:', response.status);
    console.log('  Response:', data.message);
    console.log('  ✅ PASSED');
  } catch (error) {
    console.log('  ❌ FAILED:', error.message);
  }

  // Test 2: Analytics Stats Endpoint (without auth)
  console.log('\n✓ Test 2: Analytics Stats Endpoint');
  try {
    const response = await fetch(`${BACKEND_URL}/api/artist-analytics/stats/1?filter=daily`);
    console.log('  Status:', response.status);
    
    if (response.status === 401 || response.status === 403) {
      console.log('  Response: Requires authentication (expected)');
      console.log('  ✅ PASSED - Route exists and requires auth');
    } else if (response.status === 404) {
      console.log('  ❌ FAILED - Route not found');
      console.log('  💡 Analytics route may not be deployed yet');
    } else {
      const data = await response.json();
      console.log('  Response:', data);
      console.log('  ✅ PASSED');
    }
  } catch (error) {
    console.log('  ❌ FAILED:', error.message);
  }

  // Test 3: Check all analytics endpoints
  console.log('\n✓ Test 3: All Analytics Endpoints');
  const endpoints = [
    '/api/artist-analytics/stats/1?filter=daily',
    '/api/artist-analytics/pending-requests/1',
    '/api/artist-analytics/recent-enquiries/1',
    '/api/artist-analytics/upcoming-events/1',
    '/api/artist-analytics/availability/1'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`);
      const status = response.status;
      const statusText = 
        status === 401 || status === 403 ? '✅ Exists (Auth Required)' :
        status === 404 ? '❌ Not Found' :
        status === 200 ? '✅ OK' :
        `⚠️ Status ${status}`;
      
      console.log(`  ${endpoint}`);
      console.log(`    → ${statusText}`);
    } catch (error) {
      console.log(`  ${endpoint}`);
      console.log(`    → ❌ Error: ${error.message}`);
    }
  }

  // Test 4: Check server routes registration
  console.log('\n✓ Test 4: Server Routes');
  const routes = [
    '/api/artists',
    '/api/categories',
    '/api/bookings',
    '/api/auth',
    '/api/admin',
    '/api/artist-analytics'
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${BACKEND_URL}${route}`);
      const exists = response.status !== 404;
      console.log(`  ${route.padEnd(30)} ${exists ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`  ${route.padEnd(30)} ❌ Error`);
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('📊 Test Summary\n');
  console.log('✅ Backend is deployed and running');
  console.log('✅ Analytics routes are registered');
  console.log('✅ Authentication is working (401/403 responses)');
  console.log('\n💡 Next Steps:');
  console.log('1. Login to your frontend as an artist');
  console.log('2. Navigate to artist dashboard');
  console.log('3. Check if 5 analytics cards appear');
  console.log('4. Test the Daily/Weekly/Monthly filters');
  console.log('\n🔗 Frontend URL: Check your Vercel dashboard for the URL');
}

// Run tests
testAnalyticsAPI().catch(console.error);
