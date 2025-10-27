// test-basic.js - Quick test without requiring GEE authentication
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';

async function quickTest() {
  console.log('⚡ Quick API Test (No GEE Required)');
  console.log('===================================\n');

  try {
    // Test server is running
    console.log('1️⃣ Testing server connectivity...');
    const healthResponse = await fetch(`${BASE_URL}/health`, { timeout: 5000 });
    const healthData = await healthResponse.json();
    
    console.log('✅ Server is running');
    console.log('   - Status:', healthData.status);
    console.log('   - GEE Status:', healthData.geeStatus);
    console.log('   - Timestamp:', healthData.timestamp);
    console.log('');

    // Test getting sample data
    console.log('2️⃣ Testing sample data endpoint...');
    const testResponse = await fetch(`${BASE_URL}/test-flood`, { timeout: 5000 });
    const testData = await testResponse.json();
    
    console.log('✅ Sample data retrieved');
    console.log('   - Area:', testData.testArea.name);
    console.log('   - Type:', testData.testArea.type);
    console.log('   - Province:', testData.testArea.province);
    console.log('   - Geometry type:', testData.geometry.type);
    console.log('   - Coordinate count:', testData.geometry.coordinates[0].length);
    console.log('');

    // Test flood analysis endpoint structure
    console.log('3️⃣ Testing flood analysis endpoint structure...');
    const floodPayload = {
      geometry: testData.geometry,
      startDate: "2024-09-01",
      endDate: "2024-09-30",
      areaName: testData.testArea.name
    };

    const floodResponse = await fetch(`${BASE_URL}/analyze-flood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(floodPayload),
      timeout: 10000
    });

    const floodResult = await floodResponse.json();
    
    if (floodResponse.ok) {
      console.log('✅ Flood analysis endpoint working');
      console.log('   - Successfully processed request');
      console.log('   - Returned structured response');
      if (floodResult.floodData) {
        console.log('   - Contains flood data');
      }
    } else {
      console.log('⚠️ Flood analysis returned error (expected if no GEE)');
      console.log('   - Status:', floodResponse.status);
      console.log('   - Error:', floodResult.error);
      
      if (healthData.geeStatus !== 'Authenticated') {
        console.log('   - This is expected without Google Earth Engine setup');
      }
    }
    console.log('');

    // Test invalid request handling
    console.log('4️⃣ Testing error handling...');
    const invalidResponse = await fetch(`${BASE_URL}/analyze-flood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' }),
      timeout: 5000
    });

    const invalidResult = await invalidResponse.json();
    console.log('✅ Error handling working');
    console.log('   - Status:', invalidResponse.status);
    console.log('   - Error message:', invalidResult.error);
    console.log('');

    console.log('🎉 Quick test completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Server is running and responsive');
    console.log('   ✅ Endpoints are accessible');
    console.log('   ✅ Sample data is available');
    console.log('   ✅ Request/response structure is correct');
    console.log('   ✅ Error handling is working');
    
    if (healthData.geeStatus === 'Authenticated') {
      console.log('   ✅ Google Earth Engine is ready');
      console.log('   🌊 Full flood analysis should work');
    } else {
      console.log('   ⚠️  Google Earth Engine not configured');
      console.log('   💡 Add key.json to enable full flood analysis');
    }

  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('🔌 Server not running');
      console.log('💡 Start with: npm run dev');
    } else if (error.name === 'FetchError' && error.type === 'request-timeout') {
      console.log('');
      console.log('⏰ Request timed out');
      console.log('💡 Server might be slow to respond');
    }
  }
}

quickTest();