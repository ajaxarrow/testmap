import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { useMapStore } from './map.store'
import type { AreaData } from '../interfaces'

interface FloodAnalysisResult {
  success: boolean
  area: string
  dateRange: string
  floodData: {
    type: 'FeatureCollection'
    features: Array<{
      type: 'Feature'
      geometry: {
        type: string
        coordinates: any
      }
      properties: {
        flood?: any
        [key: string]: any
      }
    }>
  }
  metadata: {
    sensor: string
    threshold: string
    scale: string
    analysisDate: string
  }
}

export const useSatelliteFloodStore = createGlobalState(() => {
  const { map } = useMapStore()
  
  // State
  const isAnalyzing = ref(false)
  const floodResults = ref<FloodAnalysisResult | null>(null)
  const floodLayerVisible = ref(false)
  const currentAnalysisArea = ref<AreaData | null>(null)
  
  // Layer IDs
  const FLOOD_LAYER_ID = 'satellite-flood-layer'
  const FLOOD_SOURCE_ID = 'satellite-flood-source'

  // API Configuration
  const API_BASE_URL = 'http://localhost:4000'

  /**
   * Run satellite flood analysis using the backend API
   */
  const runFloodAnalysis = async (area: AreaData, startDate: string, endDate: string) => {
    if (!map.value) {
      throw new Error('Map not initialized')
    }

    console.log(`🛰️ Starting satellite flood analysis for ${area.name}`)
    
    isAnalyzing.value = true
    
    try {
      // Clear previous results
      clearFloodResults()
      
      // Prepare API request payload
      const payload = {
        geometry: area.geojson.geometry,
        startDate,
        endDate,
        areaName: area.name
      }

      console.log('📡 Sending request to flood analysis API...')
      console.log('📅 Date range:', `${startDate} to ${endDate}`)
      
      // Call the flood analysis API
      const response = await fetch(`${API_BASE_URL}/analyze-flood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: FloodAnalysisResult = await response.json()
      
      console.log('✅ Flood analysis completed successfully')
      console.log('📊 Results:', {
        area: result.area,
        dateRange: result.dateRange,
        floodAreasFound: result.floodData.features.length,
        sensor: result.metadata.sensor
      })

      // Store results
      floodResults.value = result
      currentAnalysisArea.value = area

      // Add flood layer to map if flood areas were detected
      if (result.floodData.features.length > 0) {
        await addFloodLayerToMap(result.floodData)
        console.log('🗺️ Flood layer added to map')
      } else {
        console.log('ℹ️ No flood areas detected - no layer to add')
      }

    } catch (error: any) {
      console.error('❌ Flood analysis failed:', error)
      
      // Show user-friendly error
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to flood analysis server. Please ensure the backend server is running.')
      } else if (error.message.includes('Google Earth Engine')) {
        throw new Error('Satellite data service is not available. Please check Google Earth Engine configuration.')
      } else {
        throw new Error(`Flood analysis failed: ${error.message}`)
      }
    } finally {
      isAnalyzing.value = false
    }
  }

  /**
   * Add flood data as a layer to the map
   */
  const addFloodLayerToMap = async (floodData: FloodAnalysisResult['floodData']) => {
    if (!map.value) return

    try {
      // Remove existing flood layer if any
      removeFloodLayerFromMap()

      // Add flood data source
      map.value.addSource(FLOOD_SOURCE_ID, {
        type: 'geojson',
        data: floodData as any
      })

      // Add flood fill layer
      map.value.addLayer({
        id: FLOOD_LAYER_ID,
        type: 'fill',
        source: FLOOD_SOURCE_ID,
        paint: {
          'fill-color': '#dc3545', // Red color for flood areas
          'fill-opacity': 0.6
        }
      })

      // Add flood border layer for better visibility
      map.value.addLayer({
        id: `${FLOOD_LAYER_ID}-border`,
        type: 'line',
        source: FLOOD_SOURCE_ID,
        paint: {
          'line-color': '#721c24', // Darker red for borders
          'line-width': 2,
          'line-opacity': 0.8
        }
      })

      // Add click event for flood polygons
      map.value.on('click', FLOOD_LAYER_ID, (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0]
          if (feature) {
            const properties = feature.properties
            
            // Create popup content
            const popupContent = `
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 8px 0; color: #dc3545;">🌊 Flood Area Detected</h4>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Source:</strong> Sentinel-1 SAR</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Detection:</strong> Radar backscatter analysis</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Area:</strong> ${currentAnalysisArea.value?.name || 'Unknown'}</p>
              </div>
            `
            
            console.log('🖱️ Flood area clicked:', properties)
            // Note: For popup functionality, you might want to use a proper popup implementation
          }
        }
      })

      // Change cursor on hover
      map.value.on('mouseenter', FLOOD_LAYER_ID, () => {
        if (map.value) {
          map.value.getCanvas().style.cursor = 'pointer'
        }
      })

      map.value.on('mouseleave', FLOOD_LAYER_ID, () => {
        if (map.value) {
          map.value.getCanvas().style.cursor = ''
        }
      })

      floodLayerVisible.value = true
      
    } catch (error) {
      console.error('❌ Error adding flood layer to map:', error)
      throw error
    }
  }

  /**
   * Remove flood layer from map
   */
  const removeFloodLayerFromMap = () => {
    if (!map.value) return

    try {
      // Remove layers (MapLibre automatically removes associated event listeners)
      if (map.value.getLayer(`${FLOOD_LAYER_ID}-border`)) {
        map.value.removeLayer(`${FLOOD_LAYER_ID}-border`)
      }
      
      if (map.value.getLayer(FLOOD_LAYER_ID)) {
        map.value.removeLayer(FLOOD_LAYER_ID)
      }

      // Remove source
      if (map.value.getSource(FLOOD_SOURCE_ID)) {
        map.value.removeSource(FLOOD_SOURCE_ID)
      }

      floodLayerVisible.value = false
      
    } catch (error) {
      console.error('❌ Error removing flood layer:', error)
    }
  }

  /**
   * Clear flood analysis results and layer
   */
  const clearFloodResults = () => {
    floodResults.value = null
    currentAnalysisArea.value = null
    removeFloodLayerFromMap()
  }

  /**
   * Toggle flood layer visibility
   */
  const toggleFloodLayer = () => {
    if (!map.value || !floodResults.value) return

    if (floodLayerVisible.value) {
      removeFloodLayerFromMap()
    } else {
      addFloodLayerToMap(floodResults.value.floodData)
    }
  }

  /**
   * Check if backend server is available
   */
  const checkServerHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { 
        method: 'GET',
        timeout: 5000 
      } as any)
      return response.ok
    } catch (error) {
      console.warn('Backend server not available:', error)
      return false
    }
  }

  return {
    // State
    isAnalyzing,
    floodResults,
    floodLayerVisible,
    currentAnalysisArea,
    
    // Actions
    runFloodAnalysis,
    clearFloodResults,
    toggleFloodLayer,
    checkServerHealth,
    
    // Map layer management
    addFloodLayerToMap,
    removeFloodLayerFromMap
  }
})