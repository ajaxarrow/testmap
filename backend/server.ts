// server.ts
import express, { Request, Response, Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import ee from "@google/earthengine";
import fs from "fs";
import path from "path";

const app = express();
const router = Router();

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

/** Helper to safely convert GeoJSON to ee.Geometry */
function toEEGeometry(geometry: any): any {
  if (!geometry) throw new Error("Geometry is required");
  return ee.Geometry(geometry);
}

/* =========================================================
   🌳 1. Forested Area Analysis (NDVI-based)
   ========================================================= */
router.post("/analyze-forest", async (req: Request, res: Response) => {
  try {
    console.log("🌲 Starting forest analysis...");
    const { geometry, startDate, endDate, areaName } = req.body;
    const region = toEEGeometry(geometry);

    console.log(`📍 Area: ${areaName || "Unknown"}`);
    console.log(`📅 Date range: ${startDate} → ${endDate}`);

    // Use a more relaxed cloud filter and longer date range for better data availability
    let s2Collection = ee.ImageCollection("COPERNICUS/S2_SR")
      .filterBounds(region)
      .filterDate(startDate, endDate)
      .filter((ee.Filter as any).lt("CLOUDY_PIXEL_PERCENTAGE", 50)); // Increased cloud tolerance

    // Ensure homogeneous collection by selecting only NDVI bands
    s2Collection = (s2Collection as any).map((img: any) => {
      return img.select(['B4', 'B8']).set('system:time_start', img.get('system:time_start'));
    });

    console.log("🛰️ Checking for available Sentinel-2 data...");
    
    // Check if we have any images
    const imageCount = (s2Collection as any).size();
    
    imageCount.evaluate((count: number, error: any) => {
      if (error) {
        console.error("❌ Error checking image count:", error);
        return res.status(500).json({ error: error.message });
      }
      
      if (count === 0) {
        console.log("⚠️ No Sentinel-2 images found for the specified criteria");
        return res.json({
          success: true,
          area: areaName || "Unknown",
          dateRange: `${startDate} → ${endDate}`,
          forestData: {
            type: "FeatureCollection",
            features: []
          },
          metadata: {
            sensor: "Sentinel-2",
            index: "NDVI ≥ 0.55",
            scale: "30m",
            analysisDate: new Date().toISOString(),
            note: "No satellite data available for the specified period and area"
          },
        });
      }

      console.log(`📊 Found ${count} Sentinel-2 images, processing...`);
      
      // Process the homogeneous images to create NDVI
      const medianComposite = s2Collection.median();
      const ndvi = (medianComposite as any).normalizedDifference(["B8", "B4"]).rename("NDVI");
      
      // Check if NDVI has bands
      const ndviBands = (ndvi as any).bandNames();
      
      ndviBands.evaluate((bands: string[], bandError: any) => {
        if (bandError) {
          console.error("❌ Error checking bands:", bandError);
          return res.status(500).json({ error: bandError.message });
        }
        
        if (!bands || bands.length === 0) {
          console.log("⚠️ No bands available in processed images");
          return res.json({
            success: true,
            area: areaName || "Unknown",
            dateRange: `${startDate} → ${endDate}`,
            forestData: {
              type: "FeatureCollection",
              features: []
            },
            metadata: {
              sensor: "Sentinel-2",
              index: "NDVI ≥ 0.55",
              scale: "30m",
              analysisDate: new Date().toISOString(),
              note: "Processed images contain no usable bands"
            },
          });
        }

        console.log(`✅ Processing with bands: ${bands.join(', ')}`);
        
        const forestMask = ndvi.gte(0.55).selfMask();

        console.log("🗺️ Converting NDVI forest mask to polygons...");
        const forestVectors = forestMask.reduceToVectors({
          geometry: region,
          scale: 30,
          geometryType: "polygon",
          labelProperty: "forest",
          maxPixels: 1e8
        });

        forestVectors.evaluate((result: any, evalError: any) => {
          if (evalError) {
            console.error("❌ Forest analysis failed:", evalError);
            return res.status(500).json({ error: evalError.message });
          }
          console.log("✅ Forest analysis complete.");
          res.json({
            success: true,
            area: areaName || "Unknown",
            dateRange: `${startDate} → ${endDate}`,
            forestData: result,
            metadata: {
              sensor: "Sentinel-2",
              index: "NDVI ≥ 0.55",
              scale: "30m",
              analysisDate: new Date().toISOString(),
              imageCount: count
            },
          });
        });
      });
    });
  } catch (error: any) {
    console.error("❌ Forest analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/analyze-illegal-logging", async (req: Request, res: Response) => {
  try {
    console.log("🪓 Starting illegal logging analysis...");
    const { geometry, startDate, endDate, areaName } = req.body;

    if (!geometry) return res.status(400).json({ error: "Geometry is required" });
    if (!startDate || !endDate) return res.status(400).json({ error: "Start and end dates are required" });

    const region = ee.Geometry(geometry);
    console.log(`📍 Area: ${areaName || "Unknown"} | 📅 ${startDate} to ${endDate}`);

    // Hansen Global Forest Change dataset
    const hansen = (ee as any).Image("UMD/hansen/global_forest_change_2022_v1_10");
    const treeCover = hansen.select("treecover2000");
    const lossYear = hansen.select("lossyear"); // 1 = 2001, 22 = 2022

    // Calculate forest loss within the selected date range
    const startYear = new Date(startDate).getFullYear() - 2000;
    const endYear = new Date(endDate).getFullYear() - 2000;
    
    // Validate year range (Hansen data goes from 2001-2022)
    const validStartYear = Math.max(1, Math.min(22, startYear));
    const validEndYear = Math.max(1, Math.min(22, endYear));
    
    console.log(`🗓️ Analyzing forest loss from ${validStartYear + 2000} to ${validEndYear + 2000}`);
    
    // Create mask for forest loss in the specified period
    // Only include areas with initial tree cover > 10%
    const treeCoverMask = treeCover.gte(10);
    const lossMask = lossYear.gte(validStartYear)
      .and(lossYear.lte(validEndYear))
      .and(treeCoverMask)
      .selfMask();

    console.log("🗺️ Converting forest loss areas to polygons...");
    const lossPolygons = lossMask.reduceToVectors({
      geometry: region,
      scale: 30,
      geometryType: "polygon",
      eightConnected: false,
      labelProperty: "forest_loss",
      maxPixels: 1e8,
    });

    lossPolygons.evaluate((result: any, error: any) => {
      if (error) {
        console.error("❌ Earth Engine error:", error);
        return res.status(500).json({ error: error.message });
      }

      console.log("✅ Illegal logging analysis completed");
      res.json({
        success: true,
        area: areaName || "Unknown",
        dateRange: `${startDate} to ${endDate}`,
        forestLossData: result,
        metadata: {
          dataset: "Hansen Global Forest Change (v1.10)",
          analysisYears: `${validStartYear + 2000}-${validEndYear + 2000}`,
          treeCoverThreshold: "≥10%",
          scale: "30m",
          analysisDate: new Date().toISOString(),
        },
      });
    });
  } catch (error: any) {
    console.error("❌ Illegal logging analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/analyze-forest-fires", async (req: Request, res: Response) => {
  try {
    console.log("🔥 Starting forest fire analysis...");
    const { geometry, startDate, endDate, areaName } = req.body;

    if (!geometry) return res.status(400).json({ error: "Geometry is required" });
    if (!startDate || !endDate) return res.status(400).json({ error: "Start and end dates are required" });

    const region = (ee as any).Geometry(geometry);
    console.log(`📍 Area: ${areaName || "Unknown"} | 📅 ${startDate} to ${endDate}`);

    // MODIS Burned Area Product
    console.log("🛰️ Fetching MODIS Burned Area data...");
    const modis = (ee as any).ImageCollection("MODIS/006/MCD64A1")
      .filterBounds(region)
      .filterDate(startDate, endDate)
      .select('BurnDate');

    // Sentinel-2 for Normalized Burn Ratio (NBR)
    console.log("🌿 Calculating Sentinel-2 NBR...");
    const s2Collection = (ee as any).ImageCollection("COPERNICUS/S2_SR")
      .filterBounds(region)
      .filterDate(startDate, endDate)
      .filter((ee as any).Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30));

    // Check if we have enough data
    const imageCount = s2Collection.size();
    
    imageCount.evaluate((count: number, countError: any) => {
      if (countError) {
        console.error("❌ Error checking image count:", countError);
        return res.status(500).json({ error: countError.message });
      }
      
      if (count === 0) {
        console.log("⚠️ No Sentinel-2 images found for fire analysis");
        
        // Try MODIS only approach
        console.log("🔄 Falling back to MODIS-only analysis...");
        
        const burnedMask = modis.select('BurnDate').gt(0).selfMask();
        
        const burnedPolygons = burnedMask.reduceToVectors({
          geometry: region,
          scale: 500, // MODIS resolution
          geometryType: "polygon",
          labelProperty: "burned_area",
          maxPixels: 1e8,
        });

        burnedPolygons.evaluate((result: any, error: any) => {
          if (error) {
            console.error("❌ Earth Engine evaluation error:", error);
            return res.status(500).json({ error: error.message });
          }

          console.log("✅ Forest fire analysis completed (MODIS only)");
          res.json({
            success: true,
            area: areaName || "Unknown",
            dateRange: `${startDate} to ${endDate}`,
            burnedAreaData: result,
            metadata: {
              datasets: ["MODIS MCD64A1"],
              method: "MODIS Burned Area Product",
              scale: "500m",
              analysisDate: new Date().toISOString(),
              note: "Analysis used MODIS data only due to insufficient Sentinel-2 coverage"
            },
          });
        });
        return;
      }

      console.log(`📊 Found ${count} Sentinel-2 images, processing NBR...`);
      
      // Calculate NBR (Normalized Burn Ratio)
      const s2WithNBR = s2Collection.map((img: any) =>
        img.normalizedDifference(["B8", "B12"]).rename("NBR")
          .copyProperties(img, ["system:time_start"])
      );

      // Get median NBR for the period
      const nbrMedian = s2WithNBR.median();
      
      // Simple approach: detect very low NBR values as potential burned areas
      const burnedMask = nbrMedian.lt(-0.1).selfMask(); // NBR < -0.1 indicates burned areas

      console.log("🗺️ Converting burned areas to polygons...");
      const burnedPolygons = burnedMask.reduceToVectors({
        geometry: region,
        scale: 30,
        geometryType: "polygon",
        labelProperty: "burned_area",
        maxPixels: 1e8,
      });

      burnedPolygons.evaluate((result: any, error: any) => {
        if (error) {
          console.error("❌ Earth Engine evaluation error:", error);
          return res.status(500).json({ error: error.message });
        }

        console.log("✅ Forest fire analysis completed successfully");
        res.json({
          success: true,
          area: areaName || "Unknown",
          dateRange: `${startDate} to ${endDate}`,
          burnedAreaData: result,
          metadata: {
            datasets: ["MODIS MCD64A1", "Sentinel-2 NBR"],
            method: "NBR-based burn detection",
            threshold: "NBR < -0.1",
            scale: "30m",
            imageCount: count,
            analysisDate: new Date().toISOString(),
          },
        });
      });
    });

  } catch (error: any) {
    console.error("❌ Forest fire analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});



// Mount all the router endpoints
app.use('/', router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Flood Analysis Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test-flood`);
  console.log(`🌊 Flood analysis: POST http://localhost:${PORT}/analyze-flood`);
});
