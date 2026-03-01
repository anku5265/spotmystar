// Diagnose Cloudinary issue on production
console.log('🔍 Diagnosing Cloudinary Upload Issue...\n');

const PRODUCTION_URL = 'https://spotmystar-backend.vercel.app';

// Test 1: Check if backend is responding
console.log('Test 1: Checking backend health...');
fetch(PRODUCTION_URL)
  .then(res => {
    console.log('✓ Backend is responding:', res.status);
    return testLogin();
  })
  .catch(err => {
    console.log('❌ Backend not responding:', err.message);
  });

// Test 2: Try login and profile update
async function testLogin() {
  console.log('\nTest 2: Testing login...');
  
  try {
    const loginRes = await fetch(`${PRODUCTION_URL}/api/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });

    if (!loginRes.ok) {
      console.log('❌ Login failed, trying to register...');
      return testRegister();
    }

    const loginData = await loginRes.json();
    console.log('✓ Login successful');
    
    return testProfileUpdate(loginData.token);
  } catch (err) {
    console.log('❌ Login error:', err.message);
  }
}

async function testRegister() {
  console.log('\nRegistering test user...');
  
  try {
    const regRes = await fetch(`${PRODUCTION_URL}/api/auth/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9999999999',
        password: 'test123'
      })
    });

    if (!regRes.ok) {
      const error = await regRes.text();
      console.log('❌ Registration failed:', error);
      return;
    }

    const regData = await regRes.json();
    console.log('✓ Registration successful');
    
    return testProfileUpdate(regData.token);
  } catch (err) {
    console.log('❌ Registration error:', err.message);
  }
}

async function testProfileUpdate(token) {
  console.log('\nTest 3: Testing profile update with image...');
  
  // Create a minimal test image (1x1 red pixel PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  const testImageBlob = await (await fetch(`data:image/png;base64,${testImageBase64}`)).blob();
  
  const formData = new FormData();
  formData.append('name', 'Test User Updated');
  formData.append('email', 'test@example.com');
  formData.append('phone', '9999999999');
  formData.append('profileImage', testImageBlob, 'test.png');

  try {
    const updateRes = await fetch(`${PRODUCTION_URL}/api/auth/user/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseText = await updateRes.text();
    
    console.log('\n📋 Response Status:', updateRes.status);
    console.log('📋 Response Headers:', Object.fromEntries(updateRes.headers.entries()));
    console.log('📋 Response Body:', responseText);

    if (updateRes.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ SUCCESS! Profile updated!');
      console.log('📸 Profile Image URL:', data.user.profile_image);
    } else {
      console.log('\n❌ FAILED! Error details above');
      
      // Try to parse error
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error Message:', errorData.message);
      } catch (e) {
        console.log('Raw Error:', responseText);
      }
    }
  } catch (err) {
    console.log('\n❌ Profile update error:', err.message);
  }
}
