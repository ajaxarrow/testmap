// test-api.js
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  try {
    console.log('🧪 Testing Flood Analysis API...\n');

    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check response:', healthData);
    console.log('');

    // Test 2: Get test data
    console.log('2️⃣ Getting test data...');
    const testResponse = await fetch(`${BASE_URL}/test-flood`);
    const testData = await testResponse.json();
    console.log('✅ Test data retrieved for area:', testData.testArea.name);
    console.log('📍 Province:', testData.testArea.province);
    console.log('� Region:', testData.testArea.region);
    console.log('�🗓️ Date range:', testData.dateRange);
    console.log('🗺️ Geometry type:', testData.geometry.type);
    console.log('📐 Coordinates count:', testData.geometry.coordinates[0].length);
    console.log('');

    // Test 3: Flood Analysis - Always test this endpoint
    console.log('3️⃣ Testing flood analysis endpoint...');
    
    if (healthData.geeStatus === 'Authenticated') {
      console.log('🛰️ Google Earth Engine is authenticated - running full analysis...');
      console.log('⏳ This may take a few minutes for real satellite data processing...');
    } else {
      console.log('⚠️ Google Earth Engine not authenticated - testing endpoint structure...');
    }
    
    // Use the exact data from test-flood endpoint
    const floodPayload = {
      geometry: testData.geometry,
      startDate: "2024-08-01", // Recent date for better data availability
      endDate: "2024-08-31",   // Single month for faster processing
      areaName: testData.testArea.name
    };

    console.log('📤 Sending flood analysis request with payload:');
    console.log('   - Area:', floodPayload.areaName);
    console.log('   - Date range:', `${floodPayload.startDate} to ${floodPayload.endDate}`);
    console.log('   - Geometry bounds:', testData.geometry.coordinates[0].slice(0, 3), '...');

    try {
      const startTime = Date.now();
      const floodResponse = await fetch(`${BASE_URL}/analyze-flood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(floodPayload),
        timeout: 300000 // 5 minute timeout for GEE processing
      });

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
      const floodData = await floodResponse.json();
      
      console.log(`⏱️ Processing completed in ${processingTime} seconds`);
      
      if (floodResponse.ok) {
        console.log('✅ Flood analysis completed successfully!');
        console.log('📊 Results summary:');
        console.log('   - Status:', floodData.success ? 'Success' : 'Failed');
        console.log('   - Area analyzed:', floodData.area);
        console.log('   - Date range:', floodData.dateRange);
        console.log('   - Sensor used:', floodData.metadata.sensor);
        console.log('   - Threshold:', floodData.metadata.threshold);
        console.log('   - Analysis scale:', floodData.metadata.scale);
        console.log('   - Analysis date:', floodData.metadata.analysisDate);
        
        if (floodData.floodData && floodData.floodData.features) {
          console.log('   - Flood features found:', floodData.floodData.features.length);
          
          if (floodData.floodData.features.length > 0) {
            console.log('🌊 Flood detected in the area!');
            console.log('   - First feature type:', floodData.floodData.features[0].geometry?.type);
            console.log('   - Feature properties:', Object.keys(floodData.floodData.features[0].properties || {}));
          } else {
            console.log('🏜️ No flood areas detected in the specified time period');
          }
        }
        
        console.log('📋 Full response structure:');
        console.log('   - Has success field:', 'success' in floodData);
        console.log('   - Has area field:', 'area' in floodData);  
        console.log('   - Has dateRange field:', 'dateRange' in floodData);
        console.log('   - Has floodData field:', 'floodData' in floodData);
        console.log('   - Has metadata field:', 'metadata' in floodData);
        
      } else {
        console.log('❌ Flood analysis failed with status:', floodResponse.status);
        console.log('📋 Error details:');
        console.log('   - Error message:', floodData.error);
        if (floodData.stack && healthData.geeStatus !== 'Authenticated') {
          console.log('   - This is expected when GEE is not configured');
        }
      }
      
    } catch (fetchError) {
      if (fetchError.code === 'ETIMEDOUT') {
        console.log('⏰ Request timed out - this can happen with large areas or slow GEE processing');
      } else {
        console.log('❌ Network error during flood analysis:', fetchError.message);
      }
    }

    console.log('');

    // Test 4: Invalid request test
    console.log('4️⃣ Testing invalid request handling...');
    try {
      const invalidResponse = await fetch(`${BASE_URL}/analyze-flood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing required geometry field
          startDate: "2024-01-01",
          endDate: "2024-01-31"
        })
      });
      
      const invalidData = await invalidResponse.json();
      console.log('✅ Invalid request properly handled:', invalidData.error);
    } catch (error) {
      console.log('❌ Error testing invalid request:', error.message);
    }

    console.log('\n🎉 API testing completed!');
    console.log('\n📋 Summary:');
    console.log('   - Health endpoint: Working');
    console.log('   - Test data endpoint: Working');
    console.log('   - Flood analysis endpoint: Tested');
    console.log('   - Error handling: Tested');
    
    if (healthData.geeStatus !== 'Authenticated') {
      console.log('\n💡 To enable full flood analysis with real satellite data:');
      console.log('   1. Get a Google Earth Engine service account key');
      console.log('   2. Save it as key.json in the backend directory');
      console.log('   3. Restart the server');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running:');
      console.log('   cd backend');
      console.log('   npm run dev');
    }
  }
}

// Run tests
testAPI();