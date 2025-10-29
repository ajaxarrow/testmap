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

interface BuiltUpAnalysisResult {
  success: boolean
  area: string
  dateRange: string
  builtUpData: {
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

interface WaterAnalysisResult {
  success: boolean
  area: string
  dateRange: string
  waterData: {
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

interface DumpsiteAnalysisResult {
  success: boolean
  area: string
  dateRange: string
  dumpsiteData: {
    type: 'FeatureCollection'
    features: Array<{
      type: 'Feature'
      geometry: any
      properties: any
    }>
  }
  metadata: {
    sensor: string
    method: string
    scale: string
    analysisDate: string
    note?: string
    preImages?: number
    postImages?: number
  }
}

export const useSatelliteFloodStore = createGlobalState(() => {
  const { map } = useMapStore()
  
  // State
  const isAnalyzing = ref(false)
  const isAnalyzingFlood = ref(false)
  const isAnalyzingForest = ref(false)
  const isAnalyzingBuiltUp = ref(false)
  const isAnalyzingWater = ref(false)
  const isAnalyzingDumpsite = ref(false)
  const floodResults = ref<FloodAnalysisResult | null>(null)
  const forestResults = ref<ForestAnalysisResult | null>(null)
  const builtUpResults = ref<BuiltUpAnalysisResult | null>(null)
  const waterResults = ref<WaterAnalysisResult | null>(null)
  const dumpsiteResults = ref<DumpsiteAnalysisResult | null>(null)
  const floodLayerVisible = ref(false)
  const forestLayerVisible = ref(false)
  const builtUpLayerVisible = ref(false)
  const waterLayerVisible = ref(false)
  const dumpsiteLayerVisible = ref(false)
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
   * Run built-up area analysis using the backend API
   */
  const runBuiltUpAnalysis = async (area: AreaData, startDate: string, endDate: string) => {
    if (!map.value) {
      throw new Error('Map not initialized')
    }

    console.log(`🏗 Starting built-up analysis for ${area.name}`)
    isAnalyzingBuiltUp.value = true
    
    try {
      const payload = {
        geometry: area.geojson.geometry,
        startDate,
        endDate,
        areaName: area.name
      }

      const response = await fetch(`${API_BASE_URL}/analyze-builtup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: BuiltUpAnalysisResult = await response.json()
      builtUpResults.value = result
      currentAnalysisArea.value = area

      if (result.builtUpData.features.length > 0) {
        await addBuiltUpLayerToMap(result.builtUpData)
      }
      
      console.log('✅ Built-up analysis completed')
    } catch (error: any) {
      console.error('❌ Built-up analysis failed:', error)
      throw new Error(`Built-up analysis failed: ${error.message}`)
    } finally {
      isAnalyzingBuiltUp.value = false
    }
  }

  /**
   * Run water bodies analysis using the backend API
   */
  const runWaterAnalysis = async (area: AreaData, startDate: string, endDate: string) => {
    if (!map.value) {
      throw new Error('Map not initialized')
    }

    console.log(`💧 Starting water analysis for ${area.name}`)
    isAnalyzingWater.value = true
    
    try {
      const payload = {
        geometry: area.geojson.geometry,
        startDate,
        endDate,
        areaName: area.name
      }

      const response = await fetch(`${API_BASE_URL}/analyze-water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: WaterAnalysisResult = await response.json()
      waterResults.value = result
      currentAnalysisArea.value = area

      if (result.waterData.features.length > 0) {
        await addWaterLayerToMap(result.waterData)
      }
      
      console.log('✅ Water analysis completed')
    } catch (error: any) {
      console.error('❌ Water analysis failed:', error)
      throw new Error(`Water analysis failed: ${error.message}`)
    } finally {
      isAnalyzingWater.value = false
    }
  }

  /**
   * Run dumpsite detection using the backend API
   */
  const runDumpsiteAnalysis = async (area: AreaData, startDate: string, endDate: string) => {
    if (!map.value) {
      throw new Error('Map not initialized')
    }

    console.log(`🗑 Starting dumpsite analysis for ${area.name}`)
    isAnalyzingDumpsite.value = true
    
    try {
      const payload = {
        geometry: area.geojson.geometry,
        startDate,
        endDate,
        areaName: area.name
      }

      const response = await fetch(`${API_BASE_URL}/analyze-dumpsites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result: DumpsiteAnalysisResult = await response.json()
      dumpsiteResults.value = result
      currentAnalysisArea.value = area

      if (result.dumpsiteData.features.length > 0) {
        await addDumpsiteLayerToMap(result.dumpsiteData)
      }
      
      console.log('✅ Dumpsite analysis completed')
    } catch (error: any) {
      console.error('❌ Dumpsite analysis failed:', error)
      throw new Error(`Dumpsite analysis failed: ${error.message}`)
    } finally {
      isAnalyzingDumpsite.value = false
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
   * Add built-up data as a layer to the map
   */
  const addBuiltUpLayerToMap = async (builtUpData: any) => {
    if (!map.value) return

    try {
      removeBuiltUpLayerFromMap()

      map.value.addSource('builtup-source', {
        type: 'geojson',
        data: builtUpData
      })

      map.value.addLayer({
        id: 'builtup-layer',
        type: 'fill',
        source: 'builtup-source',
        paint: {
          'fill-color': '#FF6B35',
          'fill-opacity': 0.6
        }
      })

      map.value.addLayer({
        id: 'builtup-layer-border',
        type: 'line',
        source: 'builtup-source',
        paint: {
          'line-color': '#CC4A00',
          'line-width': 2,
          'line-opacity': 0.8
        }
      })

      builtUpLayerVisible.value = true
    } catch (error) {
      console.error('❌ Error adding built-up layer:', error)
      throw error
    }
  }

  /**
   * Add water data as a layer to the map
   */
  const addWaterLayerToMap = async (waterData: any) => {
    if (!map.value) return

    try {
      removeWaterLayerFromMap()

      map.value.addSource('water-source', {
        type: 'geojson',
        data: waterData
      })

      map.value.addLayer({
        id: 'water-layer',
        type: 'fill',
        source: 'water-source',
        paint: {
          'fill-color': '#1E90FF',
          'fill-opacity': 0.6
        }
      })

      map.value.addLayer({
        id: 'water-layer-border',
        type: 'line',
        source: 'water-source',
        paint: {
          'line-color': '#0066CC',
          'line-width': 2,
          'line-opacity': 0.8
        }
      })

      waterLayerVisible.value = true
    } catch (error) {
      console.error('❌ Error adding water layer:', error)
      throw error
    }
  }

  /**
   * Add dumpsite data as a layer to the map
   */
  const addDumpsiteLayerToMap = async (dumpsiteData: any) => {
    if (!map.value) return

    try {
      removeDumpsiteLayerFromMap()

      map.value.addSource('dumpsite-source', {
        type: 'geojson',
        data: dumpsiteData
      })

      map.value.addLayer({
        id: 'dumpsite-layer',
        type: 'fill',
        source: 'dumpsite-source',
        paint: {
          'fill-color': '#8B4513',
          'fill-opacity': 0.6
        }
      })

      map.value.addLayer({
        id: 'dumpsite-layer-border',
        type: 'line',
        source: 'dumpsite-source',
        paint: {
          'line-color': '#654321',
          'line-width': 2,
          'line-opacity': 0.8
        }
      })

      dumpsiteLayerVisible.value = true
    } catch (error) {
      console.error('❌ Error adding dumpsite layer:', error)
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
   * Remove built-up layer from map
   */
  const removeBuiltUpLayerFromMap = () => {
    if (!map.value) return
    try {
      if (map.value.getLayer('builtup-layer-border')) map.value.removeLayer('builtup-layer-border')
      if (map.value.getLayer('builtup-layer')) map.value.removeLayer('builtup-layer')
      if (map.value.getSource('builtup-source')) map.value.removeSource('builtup-source')
      builtUpLayerVisible.value = false
    } catch (error) {
      console.error('❌ Error removing built-up layer:', error)
    }
  }

  /**
   * Remove water layer from map
   */
  const removeWaterLayerFromMap = () => {
    if (!map.value) return
    try {
      if (map.value.getLayer('water-layer-border')) map.value.removeLayer('water-layer-border')
      if (map.value.getLayer('water-layer')) map.value.removeLayer('water-layer')
      if (map.value.getSource('water-source')) map.value.removeSource('water-source')
      waterLayerVisible.value = false
    } catch (error) {
      console.error('❌ Error removing water layer:', error)
    }
  }

  /**
   * Remove dumpsite layer from map
   */
  const removeDumpsiteLayerFromMap = () => {
    if (!map.value) return
    try {
      if (map.value.getLayer('dumpsite-layer-border')) map.value.removeLayer('dumpsite-layer-border')
      if (map.value.getLayer('dumpsite-layer')) map.value.removeLayer('dumpsite-layer')
      if (map.value.getSource('dumpsite-source')) map.value.removeSource('dumpsite-source')
      dumpsiteLayerVisible.value = false
    } catch (error) {
      console.error('❌ Error removing dumpsite layer:', error)
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
    builtUpResults.value = null
    waterResults.value = null
    dumpsiteResults.value = null
    currentAnalysisArea.value = null
    removeFloodLayerFromMap()
    removeForestLayerFromMap()
    removeBuiltUpLayerFromMap()
    removeWaterLayerFromMap()
    removeDumpsiteLayerFromMap()
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
    isAnalyzingBuiltUp,
    isAnalyzingWater,
    isAnalyzingDumpsite,
    floodResults,
    forestResults,
    builtUpResults,
    waterResults,
    dumpsiteResults,
    floodLayerVisible,
    forestLayerVisible,
    builtUpLayerVisible,
    waterLayerVisible,
    dumpsiteLayerVisible,
    currentAnalysisArea,
    
    // Actions
    runFloodAnalysis,
    runForestAnalysis,
    runBuiltUpAnalysis,
    runWaterAnalysis,
    runDumpsiteAnalysis,
    clearFloodResults,
    clearAllResults,
    toggleFloodLayer,
    checkServerHealth,
    
    // Map layer management
    addFloodLayerToMap,
    removeFloodLayerFromMap,
    addForestLayerToMap,
    removeForestLayerFromMap,
    addBuiltUpLayerToMap,
    removeBuiltUpLayerFromMap,
    addWaterLayerToMap,
    removeWaterLayerFromMap,
    addDumpsiteLayerToMap,
    removeDumpsiteLayerFromMap
  }
})