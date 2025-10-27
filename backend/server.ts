// server.ts
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import ee from "@google/earthengine";
import fs from "fs";
import path from "path";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

// Authenticate Earth Engine using service account key
let privateKey: any;
try {
  // Try to load the GEE private key (you'll need to create this file)
  // Rename key.json to gee-private-key.json or update the path
  privateKey = require("./key.json");
  
  ee.data.authenticateViaPrivateKey(privateKey, () => {
    ee.initialize(null, null, () => {
      console.log("✅ Google Earth Engine Initialized Successfully");
    }, (error: any) => {
      console.error("❌ GEE Initialization Error:", error);
    });
  }, (error: any) => {
    console.error("❌ GEE Authentication Error:", error);
  });
} catch (error) {
  console.error("❌ Error loading GEE private key:", error);
  console.log("📝 Please ensure you have a valid Google Earth Engine service account key file named 'key.json'");
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    geeStatus: privateKey ? "Authenticated" : "Not Authenticated"
  });
});

// Test endpoint with static data
app.get("/test-flood", async (req: Request, res: Response) => {
  try {
    console.log("🧪 Testing flood analysis with static data...");
    
    // Load sample geojson from data folder
    const sampleDataPath = path.join(__dirname, "../src/data/barangays_data.json");
    const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
    const sampleBarangay = sampleData[0]; // Get first barangay
    
    console.log(`📍 Using sample area: ${sampleBarangay.name} (${sampleBarangay.type})`);
    
    // Test with static dates (recent months for better data availability)
    const testData = {
      geometry: sampleBarangay.geojson.geometry,
      startDate: "2024-01-01",
      endDate: "2024-03-31",
      areaName: sampleBarangay.name
    };
    
    res.json({
      message: "Test data prepared",
      testArea: {
        name: sampleBarangay.name,
        type: sampleBarangay.type,
        province: sampleBarangay.geojson.properties.PROVINCE,
        region: sampleBarangay.geojson.properties.REGION
      },
      geometry: testData.geometry,
      dateRange: `${testData.startDate} to ${testData.endDate}`,
      note: "Use POST /analyze-flood with this geometry to test flood analysis"
    });
    
  } catch (error: any) {
    console.error("❌ Test endpoint error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Flood detection endpoint
app.post("/analyze-flood", async (req: Request, res: Response) => {
  try {
    console.log("🌊 Starting flood analysis...");
    const { geometry, startDate, endDate, areaName } = req.body;

    if (!geometry) {
      return res.status(400).json({ error: "Geometry is required" });
    }

    console.log(`📍 Analyzing area: ${areaName || 'Unknown'}`);
    console.log(`📅 Date range: ${startDate} to ${endDate}`);

    // Convert GeoJSON to EE geometry
    const region = ee.Geometry(geometry);
    console.log("✅ Geometry converted to Earth Engine format");

    // Sentinel-1 collection for flood detection
    console.log("🛰️ Querying Sentinel-1 data...");
    const s1 = ee.ImageCollection("COPERNICUS/S1_GRD")
      .filterBounds(region)
      .filterDate(startDate, endDate)
      .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
      .filter(ee.Filter.eq("instrumentMode", "IW"))
      .select("VV");

    console.log("📊 Processing SAR data for flood detection...");
    const median = s1.median();
    const threshold = -17; // dB threshold for water detection
    const waterMask = median.lt(threshold).selfMask();

    console.log("🗺️ Converting raster to vector polygons...");
    // Convert raster to vector (flood polygons)
    const flooded = waterMask.reduceToVectors({
      geometry: region,
      scale: 30,
      geometryType: "polygon",
      eightConnected: false,
      labelProperty: "flood",
      maxPixels: 1e8
    });

    // Export as GeoJSON
    console.log("📤 Exporting flood analysis results...");
    flooded.evaluate((result: any, error: any) => {
      if (error) {
        console.error("❌ Earth Engine evaluation error:", error);
        return res.status(500).json({ error: error.message });
      }
      
      console.log("✅ Flood analysis completed successfully");
      res.json({
        success: true,
        area: areaName || 'Unknown',
        dateRange: `${startDate} to ${endDate}`,
        floodData: result,
        metadata: {
          sensor: "Sentinel-1",
          threshold: `${threshold} dB`,
          scale: "30m",
          analysisDate: new Date().toISOString()
        }
      });
    });

  } catch (error: any) {
    console.error("❌ Flood analysis error:", error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Flood Analysis Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test-flood`);
  console.log(`🌊 Flood analysis: POST http://localhost:${PORT}/analyze-flood`);
});
