// Deployment Diagnostic Script
// Run this to check if your analytics endpoints are working

const BACKEND_URL = 'https://spotmystar-backend.vercel.app'; // Update with your backend URL
const FRONTEND_URL = 'https://spotmystar-frontend.vercel.app'; // Update with your frontend URL

async function checkDeployment() {
  console.log('🔍 Checking SpotMyStar Deployment...\n');

  // 1. Check Backend Health
  console.log('1️⃣ Checking Backend Health...');
  try {
    const response = await fetch(`${BACKEND_URL}/api`);
    const data = await response.json();
    console.log('✅ Backend is running:', data.message);
  } catch (error) {
    console.log('❌ Backend check failed:', error.message);
  }

  // 2. Check Analytics Route
  console.log('\n2️⃣ Checking Analytics Route...');
  try {
    // Note: This will fail without auth token, but we can check if route exists
    const response = await fetch(`${BACKEND_URL}/api/artist-analytics/stats/1?filter=daily`);
    if (response.status === 401 || response.status === 403) {
      console.log('✅ Analytics route exists (requires authentication)');
    } else if (response.status === 404) {
      console.log('❌ Analytics route not found - deployment may not include latest changes');
    } else {
      console.log(`ℹ️ Analytics route responded with status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Analytics route check failed:', error.message);
  }

  // 3. Check Frontend
  console.log('\n3️⃣ Checking Frontend...');
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      console.log('✅ Frontend is accessible');
    } else {
      console.log(`⚠️ Frontend returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Frontend check failed:', error.message);
  }

  console.log('\n📋 Summary:');
  console.log('- If backend is running but analytics route not found: Push changes to git');
  console.log('- If backend is not running: Check Vercel deployment logs');
  console.log('- If frontend fails: Check Vercel frontend deployment');
  console.log('\n💡 Next Steps:');
  console.log('1. Ensure changes are pushed: git push origin main');
  console.log('2. Check Vercel dashboard for deployment status');
  console.log('3. Verify environment variables are set');
  console.log('4. Check deployment logs for errors');
}

// Run the check
checkDeployment().catch(console.error);
