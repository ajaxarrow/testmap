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

interface ForestAnalysisResult {
  success: boolean
  area: string
  dateRange: string
  forestData: {
    type: 'FeatureCollection'
    features: Array<{
      type: 'Feature'
      geometry: any
      properties: any
    }>
  }
  metadata: {
    sensor: string
    index: string
    scale: string
    analysisDate: string
    note?: string
    imageCount?: number
  }
}

interface IllegalLoggingResult {
  success: boolean
  area: string
  dateRange: string
  forestLossData: {
    type: 'FeatureCollection'
    features: Array<{
      type: 'Feature'
      geometry: any
      properties: any
    }>
  }
  metadata: {
    dataset: string
    analysisYears: string
    treeCoverThreshold: string
    scale: string
    analysisDate: string
  }
}

interface ForestFireResult {
  success: boolean
  area: string
  dateRange: string
  burnedAreaData: {
    type: 'FeatureCollection'
    features: Array<{
      type: 'Feature'
      geometry: any
      properties: any
    }>
  }
  metadata: {
    datasets: string[]
    method: string
    threshold?: string
    scale: string
    imageCount?: number
    analysisDate: string
    note?: string
  }
}

export const useSatelliteFloodStore = createGlobalState(() => {
  const { map } = useMapStore()
  
  // State
  const isAnalyzing = ref(false)
  const isAnalyzingFlood = ref(false)
  const isAnalyzingForest = ref(false)
  const isAnalyzingLogging = ref(false)
  const isAnalyzingFires = ref(false)
  const floodResults = ref<FloodAnalysisResult | null>(null)
  const forestResults = ref<ForestAnalysisResult | null>(null)
  const loggingResults = ref<IllegalLoggingResult | null>(null)
  const fireResults = ref<ForestFireResult | null>(null)
  const floodLayerVisible = ref(false)
  const forestLayerVisible = ref(false)
  const loggingLayerVisible = ref(false)
  const fireLayerVisible = ref(false)
  const currentAnalysisArea = ref<AreaData | null>(null)
  
  // Layer IDs
  const FLOOD_LAYER_ID = 'satellite-flood-layer'
  const FLOOD_SOURCE_ID = 'satellite-flood-source'

  // API Configuration
  const API_BASE_URL = 'http://localhost:4000'

  /**
   * Run forest analysis using the backend API
   */
  const runForestAnalysis = async (area: AreaData, startDate: string, endDate: string) => {
    if (!map.value) {
      throw new Error('Map not initialized')
    }

    console.log(`🌲 Starting forest analysis for ${area.name}`)
    isAnalyzingForest.value = true
    
    try {
      const payload = {
        geometry: area.geojson.geometry,
        startDate,
        endDate,
        areaName: area.name
      }

      const response = await fetch(`${API_BASE_URL}/analyze-forest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: ForestAnalysisResult = await response.json()
      forestResults.value = result
      currentAnalysisArea.value = area

      if (result.forestData.features.length > 0) {
        await addForestLayerToMap(result.forestData)
      }
      
      console.log('✅ Forest analysis completed')
    } catch (error: any) {
      console.error('❌ Forest analysis failed:', error)
      throw new Error(`Forest analysis failed: ${error.message}`)
    } finally {
      isAnalyzingForest.value = false
    }
  }

  /**
   * Run illegal logging analysis using the backend API
   */
  const runIllegalLoggingAnalysis = async (area: AreaData, startDate: string, endDate: string) => {
    if (!map.value) {
      throw new Error('Map not initialized')
    }

    console.log(`🪓 Starting illegal logging analysis for ${area.name}`)
    isAnalyzingLogging.value = true
    
    try {
      const payload = {
        geometry: area.geojson.geometry,
        startDate,
        endDate,
        areaName: area.name
      }

      const response = await fetch(`${API_BASE_URL}/analyze-illegal-logging`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: IllegalLoggingResult = await response.json()
      loggingResults.value = result
      currentAnalysisArea.value = area

      if (result.forestLossData.features.length > 0) {
        await addLoggingLayerToMap(result.forestLossData)
      }
      
      console.log('✅ Illegal logging analysis completed')
    } catch (error: any) {
      console.error('❌ Illegal logging analysis failed:', error)
      throw new Error(`Illegal logging analysis failed: ${error.message}`)
    } finally {
      isAnalyzingLogging.value = false
    }
  }

  /**
   * Run forest fire analysis using the backend API
   */
  const runForestFireAnalysis = async (area: AreaData, startDate: string, endDate: string) => {
    if (!map.value) {
      throw new Error('Map not initialized')
    }

    console.log(`🔥 Starting forest fire analysis for ${area.name}`)
    isAnalyzingFires.value = true
    
    try {
      const payload = {
        geometry: area.geojson.geometry,
        startDate,
        endDate,
        areaName: area.name
      }

      const response = await fetch(`${API_BASE_URL}/analyze-forest-fires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: ForestFireResult = await response.json()
      fireResults.value = result
      currentAnalysisArea.value = area

      if (result.burnedAreaData.features.length > 0) {
        await addFireLayerToMap(result.burnedAreaData)
      }
      
      console.log('✅ Forest fire analysis completed')
    } catch (error: any) {
      console.error('❌ Forest fire analysis failed:', error)
      throw new Error(`Forest fire analysis failed: ${error.message}`)
    } finally {
      isAnalyzingFires.value = false
    }
  }

  /**
   * Run satellite flood analysis using the backend API
   */
  const runFloodAnalysis = async (area: AreaData, startDate: string, endDate: string) => {
    if (!map.value) {
      throw new Error('Map not initialized')
    }

    console.log(`🛰️ Starting satellite flood analysis for ${area.name}`)
    
    isAnalyzingFlood.value = true
    
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
      isAnalyzingFlood.value = false
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
   * Add forest data as a layer to the map
   */
  const addForestLayerToMap = async (forestData: any) => {
    if (!map.value) return

    try {
      removeForestLayerFromMap()

      map.value.addSource('forest-source', {
        type: 'geojson',
        data: forestData
      })

      map.value.addLayer({
        id: 'forest-layer',
        type: 'fill',
        source: 'forest-source',
        paint: {
          'fill-color': '#228B22',
          'fill-opacity': 0.6
        }
      })

      map.value.addLayer({
        id: 'forest-layer-border',
        type: 'line',
        source: 'forest-source',
        paint: {
          'line-color': '#006400',
          'line-width': 2,
          'line-opacity': 0.8
        }
      })

      forestLayerVisible.value = true
    } catch (error) {
      console.error('❌ Error adding forest layer:', error)
      throw error
    }
  }

  /**
   * Remove forest layer from map
   */
  const removeForestLayerFromMap = () => {
    if (!map.value) return
    try {
      if (map.value.getLayer('forest-layer-border')) map.value.removeLayer('forest-layer-border')
      if (map.value.getLayer('forest-layer')) map.value.removeLayer('forest-layer')
      if (map.value.getSource('forest-source')) map.value.removeSource('forest-source')
      forestLayerVisible.value = false
    } catch (error) {
      console.error('❌ Error removing forest layer:', error)
    }
  }

  /**
   * Add illegal logging data as a layer to the map
   */
  const addLoggingLayerToMap = async (loggingData: any) => {
    if (!map.value) return

    try {
      removeLoggingLayerFromMap()

      map.value.addSource('logging-source', {
        type: 'geojson',
        data: loggingData
      })

      map.value.addLayer({
        id: 'logging-layer',
        type: 'fill',
        source: 'logging-source',
        paint: {
          'fill-color': '#8B4513', // Brown color for logged areas
          'fill-opacity': 0.7
        }
      })

      map.value.addLayer({
        id: 'logging-layer-border',
        type: 'line',
        source: 'logging-source',
        paint: {
          'line-color': '#5D2F0A', // Darker brown for borders
          'line-width': 2,
          'line-opacity': 0.8
        }
      })

      loggingLayerVisible.value = true
    } catch (error) {
      console.error('❌ Error adding logging layer:', error)
      throw error
    }
  }

  /**
   * Remove illegal logging layer from map
   */
  const removeLoggingLayerFromMap = () => {
    if (!map.value) return
    try {
      if (map.value.getLayer('logging-layer-border')) map.value.removeLayer('logging-layer-border')
      if (map.value.getLayer('logging-layer')) map.value.removeLayer('logging-layer')
      if (map.value.getSource('logging-source')) map.value.removeSource('logging-source')
      loggingLayerVisible.value = false
    } catch (error) {
      console.error('❌ Error removing logging layer:', error)
    }
  }

  /**
   * Add forest fire data as a layer to the map
   */
  const addFireLayerToMap = async (fireData: any) => {
    if (!map.value) return

    try {
      removeFireLayerFromMap()

      map.value.addSource('fire-source', {
        type: 'geojson',
        data: fireData
      })

      map.value.addLayer({
        id: 'fire-layer',
        type: 'fill',
        source: 'fire-source',
        paint: {
          'fill-color': '#FF4500', // Orange-red color for burned areas
          'fill-opacity': 0.7
        }
      })

      map.value.addLayer({
        id: 'fire-layer-border',
        type: 'line',
        source: 'fire-source',
        paint: {
          'line-color': '#CC3300', // Darker red for borders
          'line-width': 2,
          'line-opacity': 0.8
        }
      })

      fireLayerVisible.value = true
    } catch (error) {
      console.error('❌ Error adding fire layer:', error)
      throw error
    }
  }

  /**
   * Remove forest fire layer from map
   */
  const removeFireLayerFromMap = () => {
    if (!map.value) return
    try {
      if (map.value.getLayer('fire-layer-border')) map.value.removeLayer('fire-layer-border')
      if (map.value.getLayer('fire-layer')) map.value.removeLayer('fire-layer')
      if (map.value.getSource('fire-source')) map.value.removeSource('fire-source')
      fireLayerVisible.value = false
    } catch (error) {
      console.error('❌ Error removing fire layer:', error)
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
   * Clear all analysis results and layers
   */
  const clearAllResults = () => {
    floodResults.value = null
    forestResults.value = null
    loggingResults.value = null
    fireResults.value = null
    currentAnalysisArea.value = null
    removeFloodLayerFromMap()
    removeForestLayerFromMap()
    removeLoggingLayerFromMap()
    removeFireLayerFromMap()
  }

  /**
   * Clear flood analysis results and layer
   */
  const clearFloodResults = () => {
    floodResults.value = null
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
    isAnalyzingFlood,
    isAnalyzingForest,
    isAnalyzingLogging,
    isAnalyzingFires,
    floodResults,
    forestResults,
    loggingResults,
    fireResults,
    floodLayerVisible,
    forestLayerVisible,
    loggingLayerVisible,
    fireLayerVisible,
    currentAnalysisArea,
    
    // Actions
    runFloodAnalysis,
    runForestAnalysis,
    runIllegalLoggingAnalysis,
    runForestFireAnalysis,
    clearFloodResults,
    clearAllResults,
    toggleFloodLayer,
    checkServerHealth,
    
    // Map layer management
    addFloodLayerToMap,
    removeFloodLayerFromMap,
    addForestLayerToMap,
    removeForestLayerFromMap,
    addLoggingLayerToMap,
    removeLoggingLayerFromMap,
    addFireLayerToMap,
    removeFireLayerFromMap
  }
})