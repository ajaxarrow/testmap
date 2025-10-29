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

/* =========================================================
   🏙 2. Built-up Zone Analysis (NDBI-based)
   ========================================================= */
router.post("/analyze-builtup", async (req: Request, res: Response) => {
  try {
    console.log("🏗 Starting built-up analysis...");
    const { geometry, startDate, endDate, areaName } = req.body;
    const region = toEEGeometry(geometry);

    let s2Collection = ee.ImageCollection("COPERNICUS/S2_SR")
      .filterBounds(region)
      .filterDate(startDate, endDate)
      .filter((ee.Filter as any).lt("CLOUDY_PIXEL_PERCENTAGE", 50));

    // Ensure homogeneous collection by selecting only NDBI bands
    s2Collection = (s2Collection as any).map((img: any) => {
      return img.select(['B8', 'B11']).set('system:time_start', img.get('system:time_start'));
    });

    // Check if we have any images
    const imageCount = (s2Collection as any).size();
    
    imageCount.evaluate((count: number, error: any) => {
      if (error) {
        console.error("❌ Error checking image count:", error);
        return res.status(500).json({ error: error.message });
      }
      
      if (count === 0) {
        console.log("⚠️ No Sentinel-2 images found for built-up analysis");
        return res.json({
          success: true,
          area: areaName || "Unknown",
          dateRange: `${startDate} → ${endDate}`,
          builtUpData: {
            type: "FeatureCollection",
            features: []
          },
          metadata: {
            sensor: "Sentinel-2",
            index: "NDBI > 0.1",
            scale: "30m",
            analysisDate: new Date().toISOString(),
            note: "No satellite data available for the specified period and area"
          },
        });
      }

      console.log(`📊 Found ${count} images for built-up analysis`);

      const img = s2Collection.median();
      
      // Check if the image has the required bands
      const bandNames = (img as any).bandNames();
      
      bandNames.evaluate((bands: string[], bandError: any) => {
        if (bandError) {
          console.error("❌ Error checking bands:", bandError);
          return res.status(500).json({ error: bandError.message });
        }
        
        if (!bands || bands.length === 0 || !bands.includes('B11') || !bands.includes('B8')) {
          console.log("⚠️ Required bands (B11, B8) not available in images");
          return res.json({
            success: true,
            area: areaName || "Unknown",
            dateRange: `${startDate} → ${endDate}`,
            builtUpData: {
              type: "FeatureCollection",
              features: []
            },
            metadata: {
              sensor: "Sentinel-2",
              index: "NDBI > 0.1",
              scale: "30m",
              analysisDate: new Date().toISOString(),
              note: "Required spectral bands not available in satellite data"
            },
          });
        }

        console.log(`✅ Processing built-up analysis with bands: ${bands.join(', ')}`);
        
        const ndbi = (img as any).normalizedDifference(["B11", "B8"]).rename("NDBI");
        const builtUpMask = ndbi.gt(0.1).selfMask();

        console.log("🗺️ Vectorizing built-up areas...");
        const builtUpVectors = builtUpMask.reduceToVectors({
          geometry: region,
          scale: 30,
          geometryType: "polygon",
          labelProperty: "builtup",
          maxPixels: 1e8,
        });

        builtUpVectors.evaluate((result: any, evalError: any) => {
          if (evalError) {
            console.error("❌ Built-up analysis failed:", evalError);
            return res.status(500).json({ error: evalError.message });
          }
          console.log("✅ Built-up analysis complete.");
          res.json({
            success: true,
            area: areaName || "Unknown",
            dateRange: `${startDate} → ${endDate}`,
            builtUpData: result,
            metadata: {
              sensor: "Sentinel-2",
              index: "NDBI > 0.1",
              scale: "30m",
              analysisDate: new Date().toISOString(),
              imageCount: count
            },
          });
        });
      });
    });
  } catch (error: any) {
    console.error("❌ Built-up analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
   💧 3. Water Bodies Analysis (MNDWI-based)
   ========================================================= */
router.post("/analyze-water", async (req: Request, res: Response) => {
  try {
    console.log("💧 Starting water body analysis...");
    const { geometry, startDate, endDate, areaName } = req.body;
    const region = toEEGeometry(geometry);

    let s2Collection = ee.ImageCollection("COPERNICUS/S2_SR")
      .filterBounds(region)
      .filterDate(startDate, endDate)
      .filter((ee.Filter as any).lt("CLOUDY_PIXEL_PERCENTAGE", 50));

    // Ensure homogeneous collection by selecting only MNDWI bands
    s2Collection = (s2Collection as any).map((img: any) => {
      return img.select(['B3', 'B11']).set('system:time_start', img.get('system:time_start'));
    });

    // Check if we have any images
    const imageCount = (s2Collection as any).size();
    
    imageCount.evaluate((count: number, error: any) => {
      if (error) {
        console.error("❌ Error checking image count:", error);
        return res.status(500).json({ error: error.message });
      }
      
      if (count === 0) {
        console.log("⚠️ No Sentinel-2 images found for water analysis");
        return res.json({
          success: true,
          area: areaName || "Unknown",
          dateRange: `${startDate} → ${endDate}`,
          waterData: {
            type: "FeatureCollection",
            features: []
          },
          metadata: {
            sensor: "Sentinel-2",
            index: "MNDWI > 0",
            scale: "30m",
            analysisDate: new Date().toISOString(),
            note: "No satellite data available for the specified period and area"
          },
        });
      }

      console.log(`📊 Found ${count} images for water analysis`);

      const median = s2Collection.median();
      
      // Check if the image has the required bands
      const bandNames = (median as any).bandNames();
      
      bandNames.evaluate((bands: string[], bandError: any) => {
        if (bandError) {
          console.error("❌ Error checking bands:", bandError);
          return res.status(500).json({ error: bandError.message });
        }
        
        if (!bands || bands.length === 0 || !bands.includes('B3') || !bands.includes('B11')) {
          console.log("⚠️ Required bands (B3, B11) not available in images");
          return res.json({
            success: true,
            area: areaName || "Unknown",
            dateRange: `${startDate} → ${endDate}`,
            waterData: {
              type: "FeatureCollection",
              features: []
            },
            metadata: {
              sensor: "Sentinel-2",
              index: "MNDWI > 0",
              scale: "30m",
              analysisDate: new Date().toISOString(),
              note: "Required spectral bands not available in satellite data"
            },
          });
        }

        console.log(`✅ Processing water analysis with bands: ${bands.join(', ')}`);
        
        const mndwi = (median as any).normalizedDifference(["B3", "B11"]).rename("MNDWI");
        const waterMask = mndwi.gt(0).selfMask();

        console.log("🗺️ Vectorizing water bodies...");
        const waterVectors = waterMask.reduceToVectors({
          geometry: region,
          scale: 30,
          geometryType: "polygon",
          labelProperty: "water",
          maxPixels: 1e8,
        });

        waterVectors.evaluate((result: any, evalError: any) => {
          if (evalError) {
            console.error("❌ Water analysis failed:", evalError);
            return res.status(500).json({ error: evalError.message });
          }
          console.log("✅ Water analysis complete.");
          res.json({
            success: true,
            area: areaName || "Unknown",
            dateRange: `${startDate} → ${endDate}`,
            waterData: result,
            metadata: {
              sensor: "Sentinel-2",
              index: "MNDWI > 0",
              scale: "30m",
              analysisDate: new Date().toISOString(),
              imageCount: count
            },
          });
        });
      });
    });
  } catch (error: any) {
    console.error("❌ Water analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================================
   🗑 4. Dumpsite Detection (NDVI change + bare index)
   ========================================================= */
router.post("/analyze-dumpsites", async (req: Request, res: Response) => {
  try {
    console.log("🗑 Starting dumpsite detection...");
    const { geometry, startDate, endDate, areaName } = req.body;
    const region = toEEGeometry(geometry);

    // Helper function to create homogeneous collections with specific bands
    const selectCommonBands = (collection: any) => {
      return collection.map((img: any) => {
        return img.select(['B4', 'B8', 'B11']).set('system:time_start', img.get('system:time_start'));
      });
    };

    // Use a longer historical period for baseline comparison
    let preCollection = ee.ImageCollection("COPERNICUS/S2_SR")
      .filterBounds(region)
      .filterDate("2023-01-01", "2023-03-31")
      .filter((ee.Filter as any).lt("CLOUDY_PIXEL_PERCENTAGE", 50));

    let postCollection = ee.ImageCollection("COPERNICUS/S2_SR")
      .filterBounds(region)
      .filterDate(startDate, endDate)
      .filter((ee.Filter as any).lt("CLOUDY_PIXEL_PERCENTAGE", 50));

    // Ensure homogeneous collections by selecting only common bands
    preCollection = selectCommonBands(preCollection);
    postCollection = selectCommonBands(postCollection);

    // Check if we have images for both periods
    const preCount = (preCollection as any).size();
    const postCount = (postCollection as any).size();
    
    preCount.evaluate((preImages: number, preError: any) => {
      if (preError) {
        console.error("❌ Error checking pre-period images:", preError);
        return res.status(500).json({ error: preError.message });
      }
      
      postCount.evaluate((postImages: number, postError: any) => {
        if (postError) {
          console.error("❌ Error checking post-period images:", postError);
          return res.status(500).json({ error: postError.message });
        }
        
        if (preImages === 0 || postImages === 0) {
          console.log(`⚠️ Insufficient images for dumpsite detection (pre: ${preImages}, post: ${postImages})`);
          return res.json({
            success: true,
            area: areaName || "Unknown",
            dateRange: `${startDate} → ${endDate}`,
            dumpsiteData: {
              type: "FeatureCollection",
              features: []
            },
            metadata: {
              sensor: "Sentinel-2",
              method: "NDVI drop < -0.2 & BARE > 0.7",
              scale: "30m",
              analysisDate: new Date().toISOString(),
              note: "Insufficient satellite data for change detection analysis"
            },
          });
        }

        console.log(`📊 Found ${preImages} pre-images and ${postImages} post-images`);

        const preMedian = preCollection.median();
        const postMedian = postCollection.median();

        // Check if images have required bands
        const preBands = (preMedian as any).bandNames();
        const postBands = (postMedian as any).bandNames();
        
        preBands.evaluate((preBandList: string[], preBandError: any) => {
          if (preBandError) {
            console.error("❌ Error checking pre-period bands:", preBandError);
            return res.status(500).json({ error: preBandError.message });
          }
          
          postBands.evaluate((postBandList: string[], postBandError: any) => {
            if (postBandError) {
              console.error("❌ Error checking post-period bands:", postBandError);
              return res.status(500).json({ error: postBandError.message });
            }
            
            const requiredBands = ['B4', 'B8', 'B11'];
            const preHasBands = requiredBands.every(band => preBandList.includes(band));
            const postHasBands = requiredBands.every(band => postBandList.includes(band));
            
            if (!preHasBands || !postHasBands) {
              console.log("⚠️ Required bands not available for dumpsite analysis");
              return res.json({
                success: true,
                area: areaName || "Unknown",
                dateRange: `${startDate} → ${endDate}`,
                dumpsiteData: {
                  type: "FeatureCollection",
                  features: []
                },
                metadata: {
                  sensor: "Sentinel-2",
                  method: "NDVI drop < -0.2 & BARE > 0.7",
                  scale: "30m",
                  analysisDate: new Date().toISOString(),
                  note: "Required spectral bands not available for change detection"
                },
              });
            }

            console.log(`✅ Processing dumpsite analysis with required bands available`);

            // Create homogeneous median images
            const preMedian = preCollection.median();
            const postMedian = postCollection.median();

            const ndvi = (img: any) => img.normalizedDifference(["B8", "B4"]).rename("NDVI");
            const preNDVI = ndvi(preMedian);
            const postNDVI = ndvi(postMedian);
            const ndviDiff = postNDVI.subtract(preNDVI);

            const bareIndex = (postMedian as any).expression("(swir + red) / (nir + 0.0001)", {
              swir: (postMedian as any).select("B11"),
              red: (postMedian as any).select("B4"),
              nir: (postMedian as any).select("B8"),
            }).rename("BARE");

            const candidate = ndviDiff.lt(-0.2).and(bareIndex.gt(0.7)).selfMask();

            console.log("🗺️ Vectorizing candidate dumpsites...");
            const dumpsiteVectors = candidate.reduceToVectors({
              geometry: region,
              scale: 30,
              geometryType: "polygon",
              labelProperty: "dumpsite",
              maxPixels: 1e8,
            });

            dumpsiteVectors.evaluate((result: any, evalError: any) => {
              if (evalError) {
                console.error("❌ Dumpsite analysis failed:", evalError);
                return res.status(500).json({ error: evalError.message });
              }
              console.log("✅ Dumpsite detection complete.");
              res.json({
                success: true,
                area: areaName || "Unknown",
                dateRange: `${startDate} → ${endDate}`,
                dumpsiteData: result,
                metadata: {
                  sensor: "Sentinel-2",
                  method: "NDVI drop < -0.2 & BARE > 0.7",
                  scale: "30m",
                  analysisDate: new Date().toISOString(),
                  preImages: preImages,
                  postImages: postImages
                },
              });
            });
          });
        });
      });
    });
  } catch (error: any) {
    console.error("❌ Dumpsite detection error:", error);
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
