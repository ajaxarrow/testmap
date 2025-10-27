# Flood Analysis Backend

This backend server provides flood analysis capabilities using Google Earth Engine and Sentinel-1 SAR data.

## Features

- 🛰️ **Sentinel-1 SAR Data Analysis** - Uses radar imagery for flood detection
- 🌊 **Real-time Flood Detection** - Analyzes water presence using SAR backscatter
- 🗺️ **GeoJSON Integration** - Processes Philippine barangay/municipality boundaries
- 📊 **Vector Output** - Returns flood polygons as GeoJSON features

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Google Earth Engine Setup

1. Create a Google Earth Engine account at [earthengine.google.com](https://earthengine.google.com)
2. Create a service account in Google Cloud Console
3. Download the service account key as JSON
4. Rename it to `key.json` and place it in the backend directory

### 3. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configurations
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and GEE authentication status.

### Test Data
```
GET /test-flood
```
Returns sample barangay data for testing flood analysis.

### Flood Analysis
```
POST /analyze-flood
```

**Request Body:**
```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[lng, lat], [lng, lat], ...]]
  },
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "areaName": "Sample Barangay"
}
```

**Response:**
```json
{
  "success": true,
  "area": "Sample Barangay",
  "dateRange": "2024-01-01 to 2024-01-31",
  "floodData": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "metadata": {
    "sensor": "Sentinel-1",
    "threshold": "-17 dB",
    "scale": "30m",
    "analysisDate": "2024-..."
  }
}
```

## Testing

Run the test script to verify everything works:

```bash
npm test
```

This will:
1. Check server health
2. Get sample test data
3. Run flood analysis (if GEE is configured)

## How It Works

1. **Data Input**: Receives GeoJSON geometry (barangay/municipality boundaries)
2. **SAR Processing**: Queries Sentinel-1 radar data for the specified area and date range
3. **Flood Detection**: Uses backscatter threshold (-17 dB) to identify water surfaces
4. **Vectorization**: Converts raster flood pixels to vector polygons
5. **Output**: Returns flood polygons as GeoJSON for mapping

## Technical Details

- **Sensor**: Sentinel-1 SAR (Synthetic Aperture Radar)
- **Polarization**: VV (Vertical transmit, Vertical receive)
- **Mode**: Interferometric Wide swath (IW)
- **Resolution**: 30m pixel spacing
- **Threshold**: -17 dB backscatter for water detection

## Troubleshooting

### Common Issues

1. **GEE Authentication Error**
   - Ensure your service account key is valid
   - Check that Earth Engine API is enabled in Google Cloud Console

2. **No Sentinel-1 Data**
   - Try different date ranges
   - Sentinel-1 has global coverage but with 6-12 day repeat cycles

3. **Analysis Timeout**
   - Reduce the area size
   - Use shorter date ranges
   - Increase maxPixels parameter

### Development Tips

- Use recent date ranges (last 6 months) for better data availability
- Sentinel-1 works well for flood detection in cloudy conditions
- SAR data can penetrate clouds, unlike optical imagery