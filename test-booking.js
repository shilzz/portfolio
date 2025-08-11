// Test script for booking API
const fetch = require('node-fetch');

async function testBooking() {
  console.log('🧪 Testing booking API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test 2: Create a booking
    console.log('\n2. Testing booking creation...');
    const bookingData = {
      name: 'Test User',
      email: 'test@example.com',
      service: 'web-development',
      date: '2025-12-25',
      time: '14:00',
      notes: 'Test booking from script'
    };

    const bookingResponse = await fetch('http://localhost:3000/api/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const bookingResult = await bookingResponse.json();
    
    if (bookingResponse.ok) {
      console.log('✅ Booking created successfully:', bookingResult.message);
    } else {
      console.log('❌ Booking failed:', bookingResult.message);
    }

    // Test 3: Admin login
    console.log('\n3. Testing admin login...');
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };

    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Admin login successful:', loginResult.message);
      
      // Get cookies for authenticated requests
      const cookies = loginResponse.headers.get('set-cookie');
      
      // Test 4: Get bookings (requires auth)
      console.log('\n4. Testing get bookings...');
      const bookingsResponse = await fetch('http://localhost:3000/api/admin/bookings', {
        headers: {
          'Cookie': cookies
        }
      });

      if (bookingsResponse.ok) {
        const bookings = await bookingsResponse.json();
        console.log(`✅ Found ${bookings.length} bookings`);
        if (bookings.length > 0) {
          console.log('   Latest booking:', bookings[0].name, '-', bookings[0].service);
        }
      } else {
        console.log('❌ Failed to get bookings');
      }
    } else {
      console.log('❌ Admin login failed:', loginResult.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎉 API test completed!');
}

// Run the test
testBooking();
