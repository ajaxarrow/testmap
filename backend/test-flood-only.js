// test-flood-only.js
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';

async function testFloodAnalysis() {
  try {
    console.log('🌊 Testing Flood Analysis Endpoint Specifically...\n');

    // Step 1: Get test data
    console.log('📥 Fetching test data...');
    const testResponse = await fetch(`${BASE_URL}/test-flood`);
    
    if (!testResponse.ok) {
      throw new Error(`Failed to get test data: ${testResponse.statusText}`);
    }
    
    const testData = await testResponse.json();
    console.log('✅ Retrieved test data for:', testData.testArea.name);
    console.log('🏷️  Area details:');
    console.log('   - Name:', testData.testArea.name);
    console.log('   - Type:', testData.testArea.type);
    console.log('   - Province:', testData.testArea.province);
    console.log('   - Region:', testData.testArea.region);
    console.log('');

    // Step 2: Prepare flood analysis request
    const floodRequest = {
      geometry: testData.geometry,
      startDate: "2024-09-01", 
      endDate: "2024-09-30",   
      areaName: testData.testArea.name
    };

    console.log('🚀 Starting flood analysis...');
    console.log('📊 Request parameters:');
    console.log('   - Area:', floodRequest.areaName);
    console.log('   - Start Date:', floodRequest.startDate);
    console.log('   - End Date:', floodRequest.endDate);
    console.log('   - Geometry Type:', floodRequest.geometry.type);
    console.log('   - Coordinate Points:', floodRequest.geometry.coordinates[0].length);
    
    // Show first few coordinates for verification
    const firstCoords = floodRequest.geometry.coordinates[0].slice(0, 3);
    console.log('   - Sample Coordinates:', firstCoords.map(coord => 
      `[${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}]`
    ).join(', '), '...');
    console.log('');

    // Step 3: Execute flood analysis
    console.log('⏳ Executing flood analysis (this may take several minutes)...');
    const startTime = Date.now();
    
    const floodResponse = await fetch(`${BASE_URL}/analyze-flood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(floodRequest)
    });

    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`⏱️  Analysis completed in ${processingTime} seconds`);
    console.log('📡 Response status:', floodResponse.status, floodResponse.statusText);
    
    // Step 4: Process results
    const result = await floodResponse.json();
    
    if (floodResponse.ok) {
      console.log('✅ SUCCESS - Flood analysis completed!');
      console.log('');
      console.log('📋 Response Summary:');
      console.log('   ✓ Success:', result.success);
      console.log('   ✓ Analyzed Area:', result.area);
      console.log('   ✓ Date Range:', result.dateRange);
      console.log('   ✓ Sensor:', result.metadata?.sensor);
      console.log('   ✓ Threshold:', result.metadata?.threshold);
      console.log('   ✓ Scale:', result.metadata?.scale);
      console.log('   ✓ Analysis Time:', result.metadata?.analysisDate);
      console.log('');
      
      if (result.floodData) {
        console.log('🗺️  Flood Data Details:');
        console.log('   ✓ Type:', result.floodData.type);
        console.log('   ✓ Features Count:', result.floodData.features?.length || 0);
        
        if (result.floodData.features && result.floodData.features.length > 0) {
          console.log('');
          console.log('🌊 FLOOD DETECTED!');
          console.log('   📍 Number of flood polygons:', result.floodData.features.length);
          
          // Analyze first flood feature
          const firstFeature = result.floodData.features[0];
          console.log('   🔍 First flood polygon:');
          console.log('     - Geometry type:', firstFeature.geometry?.type);
          console.log('     - Properties:', Object.keys(firstFeature.properties || {}));
          
          if (firstFeature.geometry?.coordinates) {
            const coords = firstFeature.geometry.coordinates;
            if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
              console.log('     - Coordinate points:', coords[0].length);
              console.log('     - First point:', `[${coords[0][0][0].toFixed(6)}, ${coords[0][0][1].toFixed(6)}]`);
            }
          }
          
        } else {
          console.log('');
          console.log('🏜️  No flood areas detected');
          console.log('   ℹ️  This could mean:');
          console.log('     - No flooding occurred in the specified period');
          console.log('     - Area has good drainage');
          console.log('     - Satellite data coverage was limited');
          console.log('     - Different date range might show different results');
        }
      }
      
      console.log('');
      console.log('💾 Raw Response Structure:');
      console.log(JSON.stringify(result, null, 2).substring(0, 500) + '...');
      
    } else {
      console.log('❌ FAILED - Flood analysis encountered an error');
      console.log('');
      console.log('📋 Error Details:');
      console.log('   ✗ Status Code:', floodResponse.status);
      console.log('   ✗ Error Message:', result.error);
      
      if (result.stack) {
        console.log('   ✗ Stack Trace Available:', 'Yes');
      }
      
      console.log('');
      console.log('🔧 Troubleshooting Tips:');
      console.log('   1. Check if Google Earth Engine is properly configured');
      console.log('   2. Verify the service account key (key.json) is valid');
      console.log('   3. Ensure the area coordinates are valid');
      console.log('   4. Try a different date range');
      console.log('   5. Check server logs for detailed error information');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('🔌 Connection refused - Server is not running');
      console.log('💡 Start the server with: npm run dev');
    } else if (error.name === 'FetchError') {
      console.log('');
      console.log('🌐 Network error occurred');
      console.log('💡 Check if server is accessible at:', BASE_URL);
    }
  }
}

console.log('🎯 Flood Analysis Endpoint Test');
console.log('================================');
testFloodAnalysis();