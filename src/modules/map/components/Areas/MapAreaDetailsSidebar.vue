<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PhX, PhMapPin, PhBuildings, PhInfo, PhDropSimple, PhRadioButton } from '@phosphor-icons/vue'
import { useMapAreasStore } from '../../stores/mapAreas.store'
import { useSatelliteFloodStore } from '../../stores/satelliteFlood.store.ts'
import { useMapStore } from '../../stores/map.store'
import { Popup } from 'maplibre-gl'

const { selectedArea, showAreaDetails, clearSelectedArea } = useMapAreasStore()
const { 
  runFloodAnalysis, 
  runForestAnalysis,
  runIllegalLoggingAnalysis,
  runForestFireAnalysis,
  isAnalyzing,
  isAnalyzingFlood,
  isAnalyzingForest,
  isAnalyzingLogging,
  isAnalyzingFires,
  floodResults, 
  forestResults,
  loggingResults,
  fireResults,
  clearFloodResults,
  clearAllResults,
  floodLayerVisible 
} = useSatelliteFloodStore()

const { map } = useMapStore()

// Analysis date range - using more recent dates for better data availability
const getYesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]!
}

const getToday = () => {
  return new Date().toISOString().split('T')[0]!
}

const analysisStartDate = ref<string>(getYesterday()) // Yesterday
const analysisEndDate = ref<string>(getToday()) // Today

// Get today's date in YYYY-MM-DD format for date input max attribute
const todayDate = new Date().toISOString().split('T')[0]

// Format date for display
const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const areaDetails = computed(() => {
  if (!selectedArea.value) return null
  
  const properties = selectedArea.value.geojson.properties
  return {
    name: selectedArea.value.name,
    type: selectedArea.value.type,
    province: properties.PROVINCE || properties.NAME_1,
    region: properties.REGION,
    municipality: selectedArea.value.municipality || properties.NAME_2,
    fullName: properties.NAME_0,
    iso: properties.ISO
  }
})

const handleClose = () => {
  clearSelectedArea()
  clearAllResults()
  clearDummyDataLayers()
}

const clearDummyDataLayers = () => {
  if (!map.value) return
  
  // Remove flood layers
  if (map.value.getLayer('flood-dots')) {
    map.value.removeLayer('flood-dots')
  }
  if (map.value.getSource('flood-data')) {
    map.value.removeSource('flood-data')
  }
  
  // Remove disease layers
  if (map.value.getLayer('disease-areas')) {
    map.value.removeLayer('disease-areas')
  }
  if (map.value.getSource('disease-data')) {
    map.value.removeSource('disease-data')
  }
  
  // Clear data
  floodedAreasData.value = null
  diseaseAreasData.value = null
  analysisPrompt.value = ''
}

const errorMessage = ref<string | null>(null)

// Dummy data states
const floodedAreasData = ref<any>(null)
const diseaseAreasData = ref<any>(null)
const isLoadingFloodedAreas = ref(false)
const isLoadingDiseaseAreas = ref(false)
const analysisPrompt = ref<string>('')

// Helper function to generate random point within selected area bounds
const generateRandomPointInArea = () => {
  if (!selectedArea.value?.geojson?.geometry) {
    // Fallback to general Philippines area if no specific area selected
    return [
      124.5 + Math.random() * 0.8, // Bukidnon longitude range
      7.5 + Math.random() * 0.8    // Bukidnon latitude range
    ]
  }

  const geometry = selectedArea.value.geojson.geometry
  
  if (geometry.type === 'Polygon') {
    const coordinates = geometry.coordinates[0] // Get outer ring
    
    // Find bounding box of the polygon
    let minLng = coordinates[0][0]
    let maxLng = coordinates[0][0]
    let minLat = coordinates[0][1]
    let maxLat = coordinates[0][1]
    
    coordinates.forEach((coord: number[]) => {
      minLng = Math.min(minLng, coord[0])
      maxLng = Math.max(maxLng, coord[0])
      minLat = Math.min(minLat, coord[1])
      maxLat = Math.max(maxLat, coord[1])
    })
    
    // Generate random point within bounding box
    const lng = minLng + Math.random() * (maxLng - minLng)
    const lat = minLat + Math.random() * (maxLat - minLat)
    
    return [lng, lat]
  }
  
  // Fallback if geometry type is not handled
  return [
    124.5 + Math.random() * 0.8,
    7.5 + Math.random() * 0.8
  ]
}

const fetchFloodedAreas = async () => {
  try {
    isLoadingFloodedAreas.value = true
    
    // Generate dummy data locally instead of fetching from server
    const floodedAreas = []
    const numAreas = Math.floor(Math.random() * 6) + 3 // 3-8 areas
    
    for (let i = 0; i < numAreas; i++) {
      const coordinates = generateRandomPointInArea()
      const severity = ['Low', 'Moderate', 'High', 'Critical'][Math.floor(Math.random() * 4)]
      const waterLevel = Math.random() * 3 + 0.5
      
      floodedAreas.push({
        id: `flood_${i + 1}`,
        coordinates,
        severity,
        waterLevel: parseFloat(waterLevel.toFixed(2)),
        affectedPopulation: Math.floor(Math.random() * 5000) + 100,
        area: `${selectedArea.value?.name || 'Area'} - Zone ${i + 1}`,
        timestamp: new Date().toISOString(),
        risk: severity === 'Critical' ? 'Extreme' : severity === 'High' ? 'High' : 'Medium'
      })
    }
    
    const result = {
      success: true,
      message: "Dummy flooded areas data generated",
      data: floodedAreas,
      totalAreas: floodedAreas.length,
      timestamp: new Date().toISOString()
    }
    
    console.log('Generated flooded areas:', result)
    floodedAreasData.value = result
    addFloodDotsToMap(result.data)
  } catch (error) {
    console.error('Error generating flooded areas:', error)
  } finally {
    isLoadingFloodedAreas.value = false
  }
}

const fetchDiseaseAreas = async () => {
  try {
    isLoadingDiseaseAreas.value = true
    
    // Generate dummy data locally instead of fetching from server
    const diseases = ['Malaria', 'Leptospirosis', 'Dengue', 'Chikungunya', 'Typhoid']
    const diseaseAreas = []
    const numAreas = Math.floor(Math.random() * 8) + 4 // 4-11 areas
    
    for (let i = 0; i < numAreas; i++) {
      const coordinates = generateRandomPointInArea()
      
      // Random disease selection (can have multiple diseases per area)
      const numDiseases = Math.floor(Math.random() * 3) + 1 // 1-3 diseases per area
      const areaDiseases = []
      const selectedDiseases = [...diseases].sort(() => 0.5 - Math.random()).slice(0, numDiseases)
      
      for (const disease of selectedDiseases) {
        areaDiseases.push({
          name: disease,
          cases: Math.floor(Math.random() * 150) + 10,
          severity: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
          trend: ['Increasing', 'Stable', 'Decreasing'][Math.floor(Math.random() * 3)]
        })
      }
      
      // Calculate risk level based on total cases and disease types
      const totalCases = areaDiseases.reduce((sum, d) => sum + d.cases, 0)
      const hasHighRiskDisease = areaDiseases.some(d => ['Malaria', 'Leptospirosis'].includes(d.name))
      
      let riskLevel = 'Low'
      if (totalCases > 100 || hasHighRiskDisease) riskLevel = 'High'
      else if (totalCases > 50) riskLevel = 'Moderate'
      
      diseaseAreas.push({
        id: `disease_${i + 1}`,
        coordinates,
        diseases: areaDiseases,
        totalCases,
        riskLevel,
        area: `${selectedArea.value?.name || 'Area'} - District ${i + 1}`,
        reportedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        primaryDisease: areaDiseases[0].name,
        affectedPopulation: Math.floor(totalCases * (2 + Math.random() * 8))
      })
    }
    
    const result = {
      success: true,
      message: "Dummy disease areas data generated",
      data: diseaseAreas,
      totalAreas: diseaseAreas.length,
      summary: {
        totalCases: diseaseAreas.reduce((sum, area) => sum + area.totalCases, 0),
        highRiskAreas: diseaseAreas.filter(area => area.riskLevel === 'High').length,
        diseasesFound: [...new Set(diseaseAreas.flatMap(area => area.diseases.map(d => d.name)))]
      },
      timestamp: new Date().toISOString()
    }
    
    console.log('Generated disease areas:', result)
    diseaseAreasData.value = result
    addDiseaseChloroplethToMap(result.data)
  } catch (error) {
    console.error('Error generating disease areas:', error)
  } finally {
    isLoadingDiseaseAreas.value = false
  }
}

// Disease color mapping (5 colors for different risk levels and diseases)
const getDiseaseColor = (area: any) => {
  if (area.riskLevel === 'High') return '#d32f2f' // Red
  if (area.totalCases > 50) return '#f57c00' // Orange
  if (area.diseases.some((d: any) => d.name === 'Malaria')) return '#7b1fa2' // Purple
  if (area.diseases.some((d: any) => d.name === 'Leptospirosis')) return '#1976d2' // Blue
  return '#388e3c' // Green for low risk
}

const addFloodDotsToMap = (floodData: any[]) => {
  console.log('🗺️ Adding flood dots to map:', floodData)
  console.log('Map object:', map.value)
  
  if (!map.value) {
    console.error('❌ Map not available for flood visualization')
    return
  }

  try {
    // Remove existing flood layer if it exists
    if (map.value.getLayer('flood-dots')) {
      console.log('🧹 Removing existing flood-dots layer')
      map.value.removeLayer('flood-dots')
    }
    if (map.value.getSource('flood-data')) {
      console.log('🧹 Removing existing flood-data source')
      map.value.removeSource('flood-data')
    }

    // Create GeoJSON for flood dots
    const floodGeoJSON = {
      type: 'FeatureCollection' as const,
      features: floodData.map((flood: any) => ({
        type: 'Feature' as const,
        properties: {
          severity: flood.severity,
          waterLevel: flood.waterLevel,
          affectedPopulation: flood.affectedPopulation,
          area: flood.area,
          risk: flood.risk
        },
        geometry: {
          type: 'Point' as const,
          coordinates: flood.coordinates
        }
      }))
    }

    console.log('📊 Created flood GeoJSON:', floodGeoJSON)

    // Add source and layer
    map.value.addSource('flood-data', {
      type: 'geojson',
      data: floodGeoJSON
    })

    console.log('✅ Added flood data source')

    map.value.addLayer({
      id: 'flood-dots',
      type: 'circle',
      source: 'flood-data',
      paint: {
        'circle-radius': [
          'case',
          ['==', ['get', 'severity'], 'Critical'], 25,  // Smaller dots
          ['==', ['get', 'severity'], 'High'], 20,
          ['==', ['get', 'severity'], 'Moderate'], 16,
          12  // Minimum size for visibility
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'severity'], 'Critical'], '#8B0000',    // Dark red
          ['==', ['get', 'severity'], 'High'], '#DC143C',         // Crimson
          ['==', ['get', 'severity'], 'Moderate'], '#FF6347',     // Tomato
          '#4169E1'  // Royal blue for low severity
        ],
        'circle-opacity': 0.9,  // More opaque
        'circle-stroke-width': 3,  // Thicker border
        'circle-stroke-color': '#ffffff'
      }
    })

    console.log('✅ Added flood dots layer to map')

    // Add click handler for flood dots
    map.value.on('click', 'flood-dots', (e: any) => {
      const properties = e.features[0].properties
      const popup = new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="padding: 8px;">
            <h4>🌊 Flood Alert</h4>
            <p><strong>Area:</strong> ${properties.area}</p>
            <p><strong>Severity:</strong> ${properties.severity}</p>
            <p><strong>Water Level:</strong> ${properties.waterLevel}m</p>
            <p><strong>Affected:</strong> ${properties.affectedPopulation} people</p>
            <p><strong>Risk:</strong> ${properties.risk}</p>
          </div>
        `)
      
      if (map.value) {
        popup.addTo(map.value)
      }
    })

    map.value.on('mouseenter', 'flood-dots', () => {
      if (map.value) {
        map.value.getCanvas().style.cursor = 'pointer'
      }
    })

    map.value.on('mouseleave', 'flood-dots', () => {
      if (map.value) {
        map.value.getCanvas().style.cursor = ''
      }
    })

    console.log('✅ Added flood dots event handlers')
  } catch (error) {
    console.error('❌ Error adding flood dots to map:', error)
  }
}

const addDiseaseChloroplethToMap = (diseaseData: any[]) => {
  console.log('🦠 Adding disease areas to map:', diseaseData)
  console.log('Map object:', map.value)
  
  if (!map.value) {
    console.error('❌ Map not available for disease visualization')
    return
  }

  try {
    // Remove existing disease layer if it exists
    if (map.value.getLayer('disease-areas')) {
      console.log('🧹 Removing existing disease-areas layer')
      map.value.removeLayer('disease-areas')
    }
    if (map.value.getSource('disease-data')) {
      console.log('🧹 Removing existing disease-data source')
      map.value.removeSource('disease-data')
    }

    // Create GeoJSON for disease areas (as circles that can overlap)
    const diseaseGeoJSON = {
      type: 'FeatureCollection' as const,
      features: diseaseData.map((disease: any) => ({
        type: 'Feature' as const,
        properties: {
          diseases: JSON.stringify(disease.diseases),
          totalCases: disease.totalCases,
          riskLevel: disease.riskLevel,
          area: disease.area,
          primaryDisease: disease.primaryDisease,
          affectedPopulation: disease.affectedPopulation
        },
        geometry: {
          type: 'Point' as const,
          coordinates: disease.coordinates
        }
      }))
    }

    console.log('📊 Created disease GeoJSON:', diseaseGeoJSON)

    // Add source and layer
    map.value.addSource('disease-data', {
      type: 'geojson',
      data: diseaseGeoJSON
    })

    console.log('✅ Added disease data source')

    map.value.addLayer({
      id: 'disease-areas',
      type: 'circle',
      source: 'disease-data',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'totalCases'],
          10, 18,  // 10 cases = 18px radius (smaller)
          50, 24,  // 50 cases = 24px radius
          100, 30, // 100 cases = 30px radius
          200, 38  // 200+ cases = 38px radius
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'riskLevel'], 'High'], '#FF1493',       // Deep pink
          ['>', ['get', 'totalCases'], 50], '#FF8C00',           // Dark orange
          ['any', 
            ['in', 'Malaria', ['get', 'primaryDisease']], 
            ['in', 'malaria', ['get', 'primaryDisease']]
          ], '#9370DB',                                          // Medium purple
          ['any', 
            ['in', 'Leptospirosis', ['get', 'primaryDisease']], 
            ['in', 'leptospirosis', ['get', 'primaryDisease']]
          ], '#00CED1',                                          // Dark turquoise
          '#32CD32'                                              // Lime green for low risk
        ],
        'circle-opacity': 0.7,  // More visible
        'circle-stroke-width': 2,  // Thicker border
        'circle-stroke-color': '#ffffff'
      }
    })

    console.log('✅ Added disease areas layer to map')

    // Add click handler for disease areas
    map.value.on('click', 'disease-areas', (e: any) => {
      const properties = e.features[0].properties
      const diseases = JSON.parse(properties.diseases || '[]')
      
      const diseaseList = diseases.map((d: any) => 
        `<li><strong>${d.name}:</strong> ${d.cases} cases (${d.severity})</li>`
      ).join('')

      const popup = new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="padding: 8px; min-width: 200px;">
            <h4>🦠 Disease Outbreak</h4>
            <p><strong>Area:</strong> ${properties.area}</p>
            <p><strong>Risk Level:</strong> ${properties.riskLevel}</p>
            <p><strong>Total Cases:</strong> ${properties.totalCases}</p>
            <p><strong>Affected Population:</strong> ${properties.affectedPopulation}</p>
            <p><strong>Diseases:</strong></p>
            <ul style="margin: 4px 0; padding-left: 16px;">
              ${diseaseList}
            </ul>
          </div>
        `)
      
      if (map.value) {
        popup.addTo(map.value)
      }
    })

    map.value.on('mouseenter', 'disease-areas', () => {
      if (map.value) {
        map.value.getCanvas().style.cursor = 'pointer'
      }
    })

    map.value.on('mouseleave', 'disease-areas', () => {
      if (map.value) {
        map.value.getCanvas().style.cursor = ''
      }
    })

    console.log('✅ Added disease areas event handlers')
  } catch (error) {
    console.error('❌ Error adding disease areas to map:', error)
  }
}

// Watch for data changes to update map
watch(floodedAreasData, (newData) => {
  if (newData?.data) {
    addFloodDotsToMap(newData.data)
  }
})

watch(diseaseAreasData, (newData) => {
  if (newData?.data) {
    addDiseaseChloroplethToMap(newData.data)
  }
})

const generateAnalysisPrompt = () => {
  const floodData = floodedAreasData.value?.data || []
  const diseaseData = diseaseAreasData.value?.data || []
  
  // Calculate overlapping areas (areas within ~1km of each other)
  const overlapThreshold = 0.01 // ~1.1 km at equator
  const overlappingAreas = []
  
  floodData.forEach((flood: any) => {
    diseaseData.forEach((disease: any) => {
      const distance = Math.sqrt(
        Math.pow(flood.coordinates[0] - disease.coordinates[0], 2) + 
        Math.pow(flood.coordinates[1] - disease.coordinates[1], 2)
      )
      
      if (distance <= overlapThreshold) {
        overlappingAreas.push({
          floodId: flood.id,
          diseaseId: disease.id,
          floodSeverity: flood.severity,
          diseaseRisk: disease.riskLevel,
          diseases: disease.diseases.map((d: any) => d.name),
          totalCases: disease.totalCases,
          affectedPopulation: flood.affectedPopulation + disease.affectedPopulation,
          distance: (distance * 111).toFixed(2) // Convert to km
        })
      }
    })
  })
  
  const prompt = `Given the following GIS data from ${areaDetails.value?.name || 'the selected area'}, analyze the correlation between flooding and disease outbreaks and provide forecasting insights:

GEOGRAPHIC CONTEXT:
- Selected Area: ${areaDetails.value?.name || 'Unknown'}
- Area Type: ${areaDetails.value?.type || 'Unknown'}
- Province: ${areaDetails.value?.province || 'Unknown'}
- Region: ${areaDetails.value?.region || 'Unknown'}

FLOODING DATA WITH COORDINATES:
- Total flooded areas: ${floodData.length}
- Critical flood zones: ${floodData.filter((f: any) => f.severity === 'Critical').length}
- Average water level: ${floodData.length > 0 ? (floodData.reduce((sum: number, f: any) => sum + f.waterLevel, 0) / floodData.length).toFixed(2) : 0}m
- Total affected population (flooding): ${floodData.reduce((sum: number, f: any) => sum + f.affectedPopulation, 0).toLocaleString()}

Detailed Flood Coordinates:
${floodData.map((f: any) => `  • ${f.area}: [${f.coordinates[0].toFixed(6)}, ${f.coordinates[1].toFixed(6)}] - ${f.severity} severity, ${f.waterLevel}m water level, ${f.affectedPopulation} people affected`).join('\n')}

DISEASE DATA WITH COORDINATES:
- Total disease outbreak areas: ${diseaseData.length}
- High-risk disease areas: ${diseaseData.filter((d: any) => d.riskLevel === 'High').length}
- Total disease cases: ${diseaseData.reduce((sum: number, d: any) => sum + d.totalCases, 0)}
- Primary diseases detected: ${diseaseAreasData.value?.summary?.diseasesFound?.join(', ') || 'None'}
- Total affected population (diseases): ${diseaseData.reduce((sum: number, d: any) => sum + d.affectedPopulation, 0).toLocaleString()}

Detailed Disease Coordinates:
${diseaseData.map((d: any) => `  • ${d.area}: [${d.coordinates[0].toFixed(6)}, ${d.coordinates[1].toFixed(6)}] - ${d.riskLevel} risk, ${d.totalCases} cases
    Diseases: ${d.diseases.map((disease: any) => `${disease.name} (${disease.cases} cases, ${disease.severity})`).join(', ')}`).join('\n')}

SPATIAL OVERLAP ANALYSIS:
- Areas with potential flood-disease correlation: ${overlappingAreas.length}
- Areas within 1km proximity: ${overlappingAreas.length > 0 ? 'YES' : 'NO'}

${overlappingAreas.length > 0 ? `Overlapping Areas Details:
${overlappingAreas.map((overlap: any) => `  • Flood zone (${overlap.floodSeverity}) & Disease area (${overlap.diseaseRisk} risk) - Distance: ${overlap.distance}km
    Diseases in proximity: ${overlap.diseases.join(', ')} (${overlap.totalCases} total cases)
    Combined affected population: ${overlap.affectedPopulation.toLocaleString()}`).join('\n')}` : 'No significant spatial overlap detected between flood and disease areas.'}

GEOSPATIAL DATA FOR AI ANALYSIS:
Selected Area Bounds: ${selectedArea.value?.geojson?.geometry ? JSON.stringify(selectedArea.value.geojson.geometry) : 'Not available'}

Flood Points GeoJSON:
{
  "type": "FeatureCollection",
  "features": [
${floodData.map((f: any) => `    {
      "type": "Feature",
      "properties": {
        "id": "${f.id}",
        "severity": "${f.severity}",
        "waterLevel": ${f.waterLevel},
        "affectedPopulation": ${f.affectedPopulation},
        "risk": "${f.risk}"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [${f.coordinates[0]}, ${f.coordinates[1]}]
      }
    }`).join(',\n')}
  ]
}

Disease Points GeoJSON:
{
  "type": "FeatureCollection",
  "features": [
${diseaseData.map((d: any) => `    {
      "type": "Feature",
      "properties": {
        "id": "${d.id}",
        "riskLevel": "${d.riskLevel}",
        "totalCases": ${d.totalCases},
        "diseases": ${JSON.stringify(d.diseases.map((disease: any) => disease.name))},
        "affectedPopulation": ${d.affectedPopulation}
      },
      "geometry": {
        "type": "Point",
        "coordinates": [${d.coordinates[0]}, ${d.coordinates[1]}]
      }
    }`).join(',\n')}
  ]
}

CORRELATION ANALYSIS REQUEST:
1. Spatial Analysis: What spatial patterns do you observe between flood-prone coordinates and disease outbreak coordinates?
2. Disease-Flood Correlation: Which diseases are most likely to emerge following flood events based on the proximity data?
3. Risk Zones: Identify high-risk zones where flood and disease data overlap or are in close proximity.
4. Preventive Measures: What preventive measures should be prioritized based on the spatial distribution?
5. Forecasting: Based on current spatial trends and overlap patterns, what is the 30-day forecast for disease spread?
6. Priority Areas: Which specific coordinates/areas require immediate public health intervention based on the overlap analysis?
7. Water-borne Disease Risk: Analyze the correlation between water levels and specific diseases (especially Leptospirosis and waterborne diseases).

RESPONSE FORMAT REQUIREMENTS:
Please provide your analysis as a comprehensive, well-structured MARKDOWN document with the following sections:

# GIS Analysis Report: Flood-Disease Correlation Study

## Executive Summary
(Brief overview of key findings and recommendations)

## Spatial Pattern Analysis
(Detailed analysis of coordinate patterns and clustering)

## Disease-Flood Correlation Matrix
(Table showing correlation strength between flood severity and disease types)

## High-Risk Zone Identification
| Zone | Coordinates | Risk Level | Intervention Priority |
|------|-------------|------------|---------------------|
| ... | ... | ... | ... |

## Preventive Action Plan
### Immediate Actions (0-7 days)
- [ ] Action item 1
- [ ] Action item 2

### Short-term Actions (1-4 weeks)
- [ ] Action item 1
- [ ] Action item 2

### Long-term Strategic Actions (1-6 months)
- [ ] Action item 1
- [ ] Action item 2

## 30-Day Disease Spread Forecast
(Include probability matrices and risk assessments)

## Resource Allocation Recommendations
### Medical Resources
### Infrastructure Improvements
### Monitoring Systems

## Conclusion and Next Steps

Please format your response with proper markdown headings, tables, lists, and emphasis. Include actionable insights for disaster preparedness and public health response with specific geographic references to the coordinate data provided.`
  
  analysisPrompt.value = prompt
  console.log('=== GENERATED ENHANCED ANALYSIS PROMPT ===')
  console.log(prompt)
  console.log('================================')
}

// AI Analysis and PDF Generation
const aiAnalysisResponse = ref('')
const isGeneratingAnalysis = ref(false)
const analysisError = ref('')

const generateAIAnalysis = async () => {
  try {
    isGeneratingAnalysis.value = true
    analysisError.value = ''
    aiAnalysisResponse.value = ''
    
    // Generate the analysis prompt first
    generateAnalysisPrompt()
    
    if (!analysisPrompt.value) {
      throw new Error('No analysis prompt generated')
    }
    
    console.log('🤖 Sending request to AI bot for analysis and PDF generation...')
    
    // Prepare form data for the AI bot
    const formData = new FormData()
    formData.append('message', analysisPrompt.value)
    
    // Call the AI bot analyze-and-generate-pdf endpoint
    const response = await fetch('http://localhost:8000/api/analyze-and-generate-pdf/', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`)
    }
    
    // Check if response is PDF (direct download) or JSON
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/pdf')) {
      // Handle PDF download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      
      // Get filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = `gis_analysis_report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      aiAnalysisResponse.value = 'PDF report generated and downloaded successfully!'
      console.log('✅ AI Analysis PDF downloaded successfully')
    } else {
      // Handle JSON response (fallback)
      const data = await response.json()
      
      if (data.response) {
        aiAnalysisResponse.value = data.response
        console.log('✅ AI Analysis completed successfully')
      } else {
        throw new Error('No response from AI service')
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error generating AI analysis:', error)
    analysisError.value = error.message || 'Failed to generate AI analysis'
  } finally {
    isGeneratingAnalysis.value = false
  }
}

const handleFloodAnalysis = async () => {
  if (!selectedArea.value) return
  
  // Clear previous error
  errorMessage.value = null
  
  try {
    await runFloodAnalysis(
      selectedArea.value,
      analysisStartDate.value,
      analysisEndDate.value
    )
  } catch (error: any) {
    console.error('Flood analysis failed:', error)
    errorMessage.value = error.message || 'Flood analysis failed. Please try again.'
  }
}

const handleForestAnalysis = async () => {
  if (!selectedArea.value) return
  
  errorMessage.value = null
  
  try {
    await runForestAnalysis(
      selectedArea.value,
      analysisStartDate.value,
      analysisEndDate.value
    )
  } catch (error: any) {
    console.error('Forest analysis failed:', error)
    errorMessage.value = error.message || 'Forest analysis failed. Please try again.'
  }
}

const handleIllegalLoggingAnalysis = async () => {
  if (!selectedArea.value) return
  
  errorMessage.value = null
  
  try {
    await runIllegalLoggingAnalysis(
      selectedArea.value,
      analysisStartDate.value,
      analysisEndDate.value
    )
  } catch (error: any) {
    console.error('Illegal logging analysis failed:', error)
    errorMessage.value = error.message || 'Illegal logging analysis failed. Please try again.'
  }
}

const handleForestFireAnalysis = async () => {
  if (!selectedArea.value) return
  
  errorMessage.value = null
  
  try {
    await runForestFireAnalysis(
      selectedArea.value,
      analysisStartDate.value,
      analysisEndDate.value
    )
  } catch (error: any) {
    console.error('Forest fire analysis failed:', error)
    errorMessage.value = error.message || 'Forest fire analysis failed. Please try again.'
  }
}
</script>

<template>
  <VSheet 
    v-if="showAreaDetails && selectedArea" 
    class="area-details-sidebar ma-4" 
    rounded="xl"
  >
    <!-- Header -->
    <VRow justify="space-between" align="center" class="ma-0 pa-4">
      <p class="sidebar-title">Area Details</p>
      <PhX 
        color="#C83246" 
        size="24" 
        weight="bold" 
        class="cursor-pointer" 
        @click="handleClose"
      />
    </VRow>

    <VDivider />

    <!-- Content -->
    <div class="sidebar-content-wrapper pa-4" v-if="areaDetails">
      <!-- Area Header -->
      <div class="area-header mb-4">
        <div class="d-flex align-center mb-2">
          <PhBuildings 
            v-if="areaDetails.type === 'Municipality'" 
            size="32" 
            class="mr-3 text-primary" 
          />
          <PhMapPin 
            v-else 
            size="32" 
            class="mr-3 text-secondary" 
          />
          <div>
            <h2 class="area-title">{{ areaDetails.name }}</h2>
            <p class="area-type text-grey">{{ areaDetails.type }}</p>
          </div>
        </div>
      </div>

      <!-- Area Information -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          <PhInfo size="20" class="mr-2" />
          Location Information
        </VCardTitle>
        <VCardText>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Province:</span>
              <span class="info-value">Bukidnon</span>
            </div>
            
            <div v-if="areaDetails.municipality && areaDetails.type === 'Barangay'" class="info-item">
              <span class="info-label">City:</span>
              <span class="info-value">Malaybalay City</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Region:</span>
              <span class="info-value">Region X</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Country:</span>
              <span class="info-value">Philippines</span>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Geographic Data -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          Geographic Data
        </VCardTitle>
        <VCardText>
          <div class="d-flex align-center justify-space-between">
            <span class="text-body-2">Boundary Type:</span>
            <VChip 
              size="small" 
              :color="selectedArea.geojson.geometry.type === 'Polygon' ? 'success' : 'info'"
            >
              {{ selectedArea.geojson.geometry.type }}
            </VChip>
          </div>
        </VCardText>
      </VCard>

      <!-- Analysis Configuration -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          📅 Analysis Period Configuration
        </VCardTitle>
        <VCardText>
          <div class="date-range-selection">
            <p class="text-subtitle-2 mb-2">Satellite Data Period</p>
            <VRow class="ma-0">
              <VCol cols="12" class="pa-1">
                <VTextField
                  v-model="analysisStartDate"
                  type="date"
                  label="Start Date"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :max="todayDate"
                />
              </VCol>
              <VCol cols="12" class="pa-1">
                <VTextField
                  v-model="analysisEndDate"
                  type="date"
                  label="End Date"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :max="todayDate"
                />
              </VCol>
            </VRow>
            <VAlert
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              <template #text>
                This date range applies to all satellite analysis types below.
              </template>
            </VAlert>
          </div>
        </VCardText>
      </VCard>

      <!-- Satellite Flood Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          <PhRadioButton size="20" class="mr-2" />
          Satellite Flood Analysis
        </VCardTitle>
        <VCardText>
          <div class="flood-analysis-section">
            <div class="analysis-period-info mb-2">
              <VChip size="small" color="grey" variant="outlined">
                Period: {{ formatDateForDisplay(analysisStartDate) }} → {{ formatDateForDisplay(analysisEndDate) }}
              </VChip>
            </div>
            <!-- Analysis Button -->
            <VBtn
              :loading="isAnalyzingFlood"
              :disabled="isAnalyzingFlood"
              color="primary"
              variant="flat"
              block
              class="mb-3"
              @click="handleFloodAnalysis"
            >
              <PhRadioButton size="16" class="mr-2" />
              {{ isAnalyzingFlood ? 'Analyzing Satellite Data...' : 'Run Flood Analysis' }}
            </VBtn>

            <!-- Error Message -->
            <VAlert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-3"
              closable
              @click:close="errorMessage = null"
            >
              <template #text>
                {{ errorMessage }}
              </template>
            </VAlert>

            <!-- Analysis Results -->
            <div v-if="floodResults" class="analysis-results">
              <VDivider class="mb-3" />
              
              <div class="results-header mb-3">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text-h6">Analysis Results</h4>
                  <VChip 
                    :color="floodResults.floodData.features.length > 0 ? 'error' : 'success'"
                    size="small"
                  >
                    {{ floodResults.floodData.features.length > 0 ? 'Flood Detected' : 'No Flood' }}
                  </VChip>
                </div>
              </div>

              <div class="results-details">
                <div class="info-item">
                  <span class="info-label">Sensor:</span>
                  <span class="info-value">{{ floodResults.metadata.sensor }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Analysis Date:</span>
                  <span class="info-value">{{ new Date(floodResults.metadata.analysisDate).toLocaleDateString() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Period:</span>
                  <span class="info-value">{{ floodResults.dateRange }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Flood Areas:</span>
                  <span class="info-value">{{ floodResults.floodData.features.length }} polygons</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Resolution:</span>
                  <span class="info-value">{{ floodResults.metadata.scale }}</span>
                </div>
              </div>

              <!-- Flood Areas Details -->
              <div v-if="floodResults.floodData.features.length > 0" class="flood-areas-details mt-3">
                <p class="text-subtitle-2 mb-2">🌊 Detected Flood Areas</p>
                <div class="flood-legend">
                  <div class="legend-item">
                    <div class="legend-color flood-color"></div>
                    <span class="legend-label">Flooded Areas ({{ floodResults.floodData.features.length }})</span>
                  </div>
                </div>
                
                <VAlert
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  <template #text>
                    Satellite analysis detected {{ floodResults.floodData.features.length }} flood area{{ floodResults.floodData.features.length > 1 ? 's' : '' }} 
                    in {{ areaDetails?.name }} during the specified period.
                  </template>
                </VAlert>
              </div>

              <div v-else class="no-flood-message mt-3">
                <VAlert
                  type="success"
                  variant="tonal"
                  density="compact"
                >
                  <template #text>
                    No flood areas detected in {{ areaDetails?.name }} during {{ floodResults.dateRange }}.
                  </template>
                </VAlert>
              </div>

              <!-- Technical Details -->
              <VExpansionPanels class="mt-3" variant="accordion">
                <VExpansionPanel>
                  <VExpansionPanelTitle>
                    <PhInfo size="16" class="mr-2" />
                    Technical Details
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <div class="technical-details">
                      <p><strong>Data Source:</strong> Sentinel-1 SAR imagery</p>
                      <p><strong>Processing:</strong> Radar backscatter analysis</p>
                      <p><strong>Threshold:</strong> {{ floodResults.metadata.threshold }}</p>
                      <p><strong>Method:</strong> Water detection using synthetic aperture radar</p>
                      <p><strong>Cloud Independence:</strong> Yes (radar can penetrate clouds)</p>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Forest Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          🌲 Forest Cover Analysis
        </VCardTitle>
        <VCardText>
          <div class="analysis-section">
            <div class="analysis-period-info mb-2">
              <VChip size="small" color="grey" variant="outlined">
                Period: {{ formatDateForDisplay(analysisStartDate) }} → {{ formatDateForDisplay(analysisEndDate) }}
              </VChip>
            </div>
            
            <VBtn
              :loading="isAnalyzingForest"
              :disabled="isAnalyzingForest"
              color="success"
              variant="flat"
              block
              class="mb-3"
              @click="handleForestAnalysis"
            >
              🌲 {{ isAnalyzingForest ? 'Analyzing Forest Cover...' : 'Analyze Forest Cover' }}
            </VBtn>

            <!-- Forest Results -->
            <div v-if="forestResults" class="analysis-results">
              <VDivider class="mb-3" />
              
              <div class="results-header mb-3">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text-h6">Forest Analysis Results</h4>
                  <VChip 
                    :color="forestResults.forestData.features.length > 0 ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ forestResults.forestData.features.length > 0 ? 'Forest Detected' : 'No Forest' }}
                  </VChip>
                </div>
              </div>

              <div class="results-details">
                <div class="info-item">
                  <span class="info-label">Forest Areas:</span>
                  <span class="info-value">{{ forestResults.forestData.features.length }} polygons</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Index:</span>
                  <span class="info-value">{{ forestResults.metadata.index }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Sensor:</span>
                  <span class="info-value">{{ forestResults.metadata.sensor }}</span>
                </div>
              </div>

              <div v-if="forestResults.forestData.features.length > 0" class="forest-areas-details mt-3">
                <VAlert type="success" variant="tonal" density="compact">
                  <template #text>
                    🌲 {{ forestResults.forestData.features.length }} forest area{{ forestResults.forestData.features.length > 1 ? 's' : '' }} 
                    detected in {{ areaDetails?.name }}.
                  </template>
                </VAlert>
              </div>
              
              <div v-else class="no-forest-message mt-3">
                <VAlert type="info" variant="tonal" density="compact">
                  <template #text>
                    {{ forestResults.metadata.note || `No forest areas detected in ${areaDetails?.name} during the analysis period.` }}
                  </template>
                </VAlert>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Illegal Logging Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          🪓 Illegal Logging Detection
        </VCardTitle>
        <VCardText>
          <div class="analysis-section">
            <div class="analysis-period-info mb-2">
              <VChip size="small" color="grey" variant="outlined">
                Period: {{ formatDateForDisplay(analysisStartDate) }} → {{ formatDateForDisplay(analysisEndDate) }}
              </VChip>
            </div>
            
            <VBtn
              :loading="isAnalyzingLogging"
              :disabled="isAnalyzingLogging"
              color="warning"
              variant="flat"
              block
              class="mb-3"
              @click="handleIllegalLoggingAnalysis"
            >
              🪓 {{ isAnalyzingLogging ? 'Analyzing Forest Loss...' : 'Detect Forest Loss' }}
            </VBtn>

            <!-- Logging Results -->
            <div v-if="loggingResults" class="analysis-results">
              <VDivider class="mb-3" />
              
              <div class="results-header mb-3">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text-h6">Forest Loss Analysis</h4>
                  <VChip 
                    :color="loggingResults.forestLossData.features.length > 0 ? 'warning' : 'success'"
                    size="small"
                  >
                    {{ loggingResults.forestLossData.features.length > 0 ? 'Loss Detected' : 'No Loss' }}
                  </VChip>
                </div>
              </div>

              <div class="results-details">
                <div class="info-item">
                  <span class="info-label">Loss Areas:</span>
                  <span class="info-value">{{ loggingResults.forestLossData.features.length }} polygons</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Dataset:</span>
                  <span class="info-value">{{ loggingResults.metadata.dataset }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Years:</span>
                  <span class="info-value">{{ loggingResults.metadata.analysisYears }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tree Cover:</span>
                  <span class="info-value">{{ loggingResults.metadata.treeCoverThreshold }}</span>
                </div>
              </div>

              <div v-if="loggingResults.forestLossData.features.length > 0" class="logging-areas-details mt-3">
                <VAlert type="warning" variant="tonal" density="compact">
                  <template #text>
                    🪓 {{ loggingResults.forestLossData.features.length }} forest loss area{{ loggingResults.forestLossData.features.length > 1 ? 's' : '' }} 
                    detected in {{ areaDetails?.name }} during {{ loggingResults.metadata.analysisYears }}.
                  </template>
                </VAlert>
              </div>
              
              <div v-else class="no-logging-message mt-3">
                <VAlert type="success" variant="tonal" density="compact">
                  <template #text>
                    No significant forest loss detected in {{ areaDetails?.name }} during the analysis period.
                  </template>
                </VAlert>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Forest Fire Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          🔥 Forest Fire Detection
        </VCardTitle>
        <VCardText>
          <div class="analysis-section">
            <div class="analysis-period-info mb-2">
              <VChip size="small" color="grey" variant="outlined">
                Period: {{ formatDateForDisplay(analysisStartDate) }} → {{ formatDateForDisplay(analysisEndDate) }}
              </VChip>
            </div>
            
            <VBtn
              :loading="isAnalyzingFires"
              :disabled="isAnalyzingFires"
              color="error"
              variant="flat"
              block
              class="mb-3"
              @click="handleForestFireAnalysis"
            >
              🔥 {{ isAnalyzingFires ? 'Analyzing Burned Areas...' : 'Detect Forest Fires' }}
            </VBtn>

            <!-- Fire Results -->
            <div v-if="fireResults" class="analysis-results">
              <VDivider class="mb-3" />
              
              <div class="results-header mb-3">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text-h6">Fire Analysis Results</h4>
                  <VChip 
                    :color="fireResults.burnedAreaData.features.length > 0 ? 'error' : 'success'"
                    size="small"
                  >
                    {{ fireResults.burnedAreaData.features.length > 0 ? 'Fire Detected' : 'No Fire' }}
                  </VChip>
                </div>
              </div>

              <div class="results-details">
                <div class="info-item">
                  <span class="info-label">Burned Areas:</span>
                  <span class="info-value">{{ fireResults.burnedAreaData.features.length }} polygons</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Method:</span>
                  <span class="info-value">{{ fireResults.metadata.method }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Datasets:</span>
                  <span class="info-value">{{ fireResults.metadata.datasets.join(', ') }}</span>
                </div>
                <div v-if="fireResults.metadata.threshold" class="info-item">
                  <span class="info-label">Threshold:</span>
                  <span class="info-value">{{ fireResults.metadata.threshold }}</span>
                </div>
                <div v-if="fireResults.metadata.imageCount" class="info-item">
                  <span class="info-label">Images Used:</span>
                  <span class="info-value">{{ fireResults.metadata.imageCount }}</span>
                </div>
              </div>

              <div v-if="fireResults.burnedAreaData.features.length > 0" class="fire-areas-details mt-3">
                <VAlert type="error" variant="tonal" density="compact">
                  <template #text>
                    🔥 {{ fireResults.burnedAreaData.features.length }} burned area{{ fireResults.burnedAreaData.features.length > 1 ? 's' : '' }} 
                    detected in {{ areaDetails?.name }}.
                  </template>
                </VAlert>
              </div>
              
              <div v-else class="no-fire-message mt-3">
                <VAlert type="success" variant="tonal" density="compact">
                  <template #text>
                    {{ fireResults.metadata.note || `No burned areas detected in ${areaDetails?.name} during the analysis period.` }}
                  </template>
                </VAlert>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Health & Disaster Risk Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          🏥 Health & Disaster Risk Analysis
        </VCardTitle>
        <VCardText>
          <div class="health-analysis-section">
            <!-- Flooded Areas Data -->
            <div class="data-section mb-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <h4 class="text-subtitle-2">🌊 Flooded Areas Data</h4>
                <VBtn
                  :loading="isLoadingFloodedAreas"
                  :disabled="isLoadingFloodedAreas"
                  size="small"
                  color="primary"
                  variant="outlined"
                  @click="fetchFloodedAreas"
                >
                  {{ isLoadingFloodedAreas ? 'Loading...' : 'Load Data' }}
                </VBtn>
              </div>
              
              <div v-if="floodedAreasData" class="data-summary">
                <VAlert type="info" variant="tonal" density="compact" class="mb-2">
                  <template #text>
                    Found {{ floodedAreasData.totalAreas }} flooded areas with {{ floodedAreasData.data.filter((f: any) => f.severity === 'Critical').length }} critical zones
                  </template>
                </VAlert>
                
                <!-- Flood Legend -->
                <div class="legend-section mb-3">
                  <h5 class="text-subtitle-2 mb-2">🌊 Flood Severity Legend</h5>
                  <div class="legend-grid">
                    <div class="legend-item">
                      <div class="legend-circle flood-critical"></div>
                      <span class="legend-text">Critical (25px)</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-circle flood-high"></div>
                      <span class="legend-text">High (20px)</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-circle flood-moderate"></div>
                      <span class="legend-text">Moderate (16px)</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-circle flood-low"></div>
                      <span class="legend-text">Low (12px)</span>
                    </div>
                  </div>
                </div>
                
                <div class="data-details">
                  <div class="info-item">
                    <span class="info-label">Total Areas:</span>
                    <span class="info-value">{{ floodedAreasData.totalAreas }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Critical Zones:</span>
                    <span class="info-value">{{ floodedAreasData.data.filter((f: any) => f.severity === 'Critical').length }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Affected Population:</span>
                    <span class="info-value">{{ floodedAreasData.data.reduce((sum: number, f: any) => sum + f.affectedPopulation, 0).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Disease Areas Data -->
            <div class="data-section mb-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <h4 class="text-subtitle-2">🦠 Disease Areas Data</h4>
                <VBtn
                  :loading="isLoadingDiseaseAreas"
                  :disabled="isLoadingDiseaseAreas"
                  size="small"
                  color="orange"
                  variant="outlined"
                  @click="fetchDiseaseAreas"
                >
                  {{ isLoadingDiseaseAreas ? 'Loading...' : 'Load Data' }}
                </VBtn>
              </div>
              
              <div v-if="diseaseAreasData" class="data-summary">
                <VAlert type="warning" variant="tonal" density="compact" class="mb-2">
                  <template #text>
                    Found {{ diseaseAreasData.totalAreas }} disease outbreak areas with {{ diseaseAreasData.summary.totalCases }} total cases
                  </template>
                </VAlert>
                
                <!-- Disease Legend -->
                <div class="legend-section mb-3">
                  <h5 class="text-subtitle-2 mb-2">🦠 Disease Risk Legend</h5>
                  <div class="legend-grid">
                    <div class="legend-item">
                      <div class="legend-circle disease-high"></div>
                      <span class="legend-text">High Risk (18px)</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-circle disease-moderate"></div>
                      <span class="legend-text">Moderate Risk (24px)</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-circle disease-malaria"></div>
                      <span class="legend-text">Malaria Risk (30px)</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-circle disease-leptospirosis"></div>
                      <span class="legend-text">Leptospirosis Risk (38px)</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-circle disease-low"></div>
                      <span class="legend-text">Low Risk (18px)</span>
                    </div>
                  </div>
                  <div class="legend-note mt-2">
                    <small class="text-caption">Circle size varies: 18px (10 cases) to 38px (200+ cases)</small>
                  </div>
                </div>
                
                <div class="data-details">
                  <div class="info-item">
                    <span class="info-label">Outbreak Areas:</span>
                    <span class="info-value">{{ diseaseAreasData.totalAreas }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Total Cases:</span>
                    <span class="info-value">{{ diseaseAreasData.summary.totalCases }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">High-Risk Areas:</span>
                    <span class="info-value">{{ diseaseAreasData.summary.highRiskAreas }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Diseases Found:</span>
                    <span class="info-value">{{ diseaseAreasData.summary.diseasesFound.join(', ') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI Analysis Section -->
            <VDivider class="mb-3" />
            
            <div class="d-flex gap-2 mb-3">
              <VBtn
                :disabled="!floodedAreasData || !diseaseAreasData || isGeneratingAnalysis"
                :loading="isGeneratingAnalysis"
                color="primary"
                variant="flat"
                block
                @click="generateAIAnalysis"
              >
                <VIcon start>mdi-robot</VIcon>
                {{ isGeneratingAnalysis ? 'Generating Analysis & PDF...' : '🤖 Generate AI Analysis & Download PDF' }}
              </VBtn>
            </div>

            <!-- Analysis Error -->
            <VAlert v-if="analysisError" type="error" variant="tonal" density="compact" class="mb-3">
              <template #text>
                {{ analysisError }}
              </template>
            </VAlert>

            <!-- AI Analysis Response -->
            <div v-if="aiAnalysisResponse" class="ai-analysis-response mt-3">
              <VAlert type="success" variant="tonal" density="compact" class="mb-3">
                <template #text>
                  ✅ AI Analysis completed! The markdown analysis is displayed below and can be exported as PDF.
                </template>
              </VAlert>
              
              <VExpansionPanels variant="accordion">
                <VExpansionPanel>
                  <VExpansionPanelTitle>
                    🤖 AI Analysis Results (Markdown)
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <div class="analysis-content">
                      <pre style="white-space: pre-wrap; font-family: 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6;">{{ aiAnalysisResponse }}</pre>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </div>

            <!-- Legacy: Analysis Prompt Display (for debugging) -->
            <div v-if="analysisPrompt && !aiAnalysisResponse" class="analysis-prompt mt-3">
              <VAlert type="info" variant="tonal" density="compact">
                <template #text>
                  Analysis prompt generated! Use the "Generate AI Analysis" button to get AI insights.
                </template>
              </VAlert>
              
              <VExpansionPanels class="mt-2" variant="accordion">
                <VExpansionPanel>
                  <VExpansionPanelTitle>
                    📋 View Generated Prompt (Debug)
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <div class="prompt-display">
                      <pre>{{ analysisPrompt }}</pre>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </div>
          </div>
        </VCardText>
      </VCard>
    </div>
  </VSheet>
</template>

<style scoped>
.area-details-sidebar {
  border-radius: 24px;
  z-index: 5;
  position: fixed;
  top: 0;
  right: 0;
  height: 95vh !important;
  width: 355px !important;
  box-shadow: 0px 0px 7px 0px #5d6e87;
  transition: opacity 0.3s ease;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
}

.area-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.area-type {
  font-size: 14px;
  margin: 0;
}

.sidebar-content-wrapper {
  height: calc(100% - 80px);
  overflow-y: auto;
  overflow-x: hidden;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: right;
  max-width: 200px;
  word-wrap: break-word;
}

.actions-section {
  margin-top: 16px;
}

/* Custom scrollbar */
.sidebar-content-wrapper::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.sidebar-content-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.sidebar-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Flood Analysis Styles */
.flood-analysis-section {
  width: 100%;
}

.date-range-selection {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.analysis-results {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.results-header h4 {
  margin: 0;
  color: #333;
}

.results-details .info-item {
  padding: 4px 0;
  font-size: 13px;
}

.flood-areas-details {
  background-color: #fff3cd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ffeaa7;
}

.flood-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.flood-color {
  background-color: #dc3545;
}

.legend-label {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.no-flood-message {
  background-color: #d1eddd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #badbcc;
}

.technical-details p {
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.4;
}

.technical-details strong {
  color: #333;
}

/* Analysis Period Info */
.analysis-period-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.analysis-section {
  width: 100%;
}

/* Logging Areas Details */
.logging-areas-details {
  background-color: #fff3cd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ffeaa7;
}

.no-logging-message {
  background-color: #d1eddd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #badbcc;
}

/* Fire Areas Details */
.fire-areas-details {
  background-color: #f8d7da;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
}

.no-fire-message {
  background-color: #d1eddd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #badbcc;
}

/* Health Analysis Styles */
.health-analysis-section {
  width: 100%;
}

.data-section {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.data-summary {
  margin-top: 8px;
}

.data-details .info-item {
  padding: 4px 0;
  font-size: 13px;
  border-bottom: 1px solid #e9ecef;
}

.data-details .info-item:last-child {
  border-bottom: none;
}

.analysis-prompt {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.prompt-display {
  background-color: #f1f3f4;
  padding: 12px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.prompt-display pre {
  white-space: pre-wrap;
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  color: #333;
}

/* Legend Styles */
.legend-section {
  background-color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.legend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  flex-shrink: 0;
}

.legend-text {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.legend-note {
  text-align: center;
  color: #666;
}

/* Flood Legend Colors */
.flood-critical {
  background-color: #8B0000;
}

.flood-high {
  background-color: #DC143C;
}

.flood-moderate {
  background-color: #FF6347;
}

.flood-low {
  background-color: #4169E1;
}

/* Disease Legend Colors */
.disease-high {
  background-color: #FF1493;
}

.disease-moderate {
  background-color: #FF8C00;
}

.disease-malaria {
  background-color: #9370DB;
}

.disease-leptospirosis {
  background-color: #00CED1;
}

.disease-low {
  background-color: #32CD32;
}
</style>