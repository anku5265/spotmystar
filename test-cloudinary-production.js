// Test Cloudinary upload on production backend
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const PRODUCTION_URL = 'https://spotmystar-backend.vercel.app';

async function testCloudinaryUpload() {
  console.log('🧪 Testing Cloudinary Profile Photo Upload on Production...\n');

  // Step 1: Login to get token
  console.log('Step 1: Logging in...');
  const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'test123'
    })
  });

  if (!loginResponse.ok) {
    console.log('❌ Login failed. Creating test user first...');
    
    // Register test user
    const registerResponse = await fetch(`${PRODUCTION_URL}/api/auth/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9999999999',
        password: 'test123'
      })
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      console.log('❌ Registration failed:', error);
      return;
    }

    const registerData = await registerResponse.json();
    console.log('✓ Test user created');
    var token = registerData.token;
  } else {
    const loginData = await loginResponse.json();
    console.log('✓ Login successful');
    var token = loginData.token;
  }

  // Step 2: Create a test image
  console.log('\nStep 2: Creating test image...');
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync('test-image.png', testImageBuffer);
  console.log('✓ Test image created');

  // Step 3: Upload profile photo
  console.log('\nStep 3: Uploading profile photo...');
  const formData = new FormData();
  formData.append('name', 'Test User Updated');
  formData.append('email', 'test@example.com');
  formData.append('phone', '9999999999');
  formData.append('profileImage', fs.createReadStream('test-image.png'), {
    filename: 'test-image.png',
    contentType: 'image/png'
  });

  try {
    const uploadResponse = await fetch(`${PRODUCTION_URL}/api/auth/user/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    const responseText = await uploadResponse.text();
    console.log('\n📋 Response Status:', uploadResponse.status);
    console.log('📋 Response Body:', responseText);

    if (uploadResponse.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ SUCCESS! Profile photo uploaded!');
      console.log('📸 Image URL:', data.user.profile_image);
    } else {
      console.log('\n❌ FAILED! Error details above');
    }
  } catch (error) {
    console.log('\n❌ Upload Error:', error.message);
  } finally {
    // Cleanup
    if (fs.existsSync('test-image.png')) {
      fs.unlinkSync('test-image.png');
    }
  }
}

testCloudinaryUpload().catch(console.error);
