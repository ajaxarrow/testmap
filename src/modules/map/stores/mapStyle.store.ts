import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { useMapStore } from './map.store'

export interface MapStyle {
  key: string
  name: string
  description: string
  url: string
  provider: string
  isUpdated?: boolean
}

export const useMapStyleStore = createGlobalState(() => {
  const { map } = useMapStore()
  
  // Available map styles
  const availableStyles: MapStyle[] = [
    {
      key: 'streets',
      name: 'Streets',
      description: 'Detailed street map with roads, landmarks, and points of interest',
      url: 'https://api.maptiler.com/maps/streets-v2/style.json?key=slSuwEtNY8loqQWUZ9IO',
      provider: 'MapTiler'
    },
    {
      key: 'topo',
      name: 'Topographic',
      description: 'Topographic map showing terrain, elevations, and natural features',
      url: 'https://api.maptiler.com/maps/topo-v2/style.json?key=slSuwEtNY8loqQWUZ9IO',
      provider: 'MapTiler'
    },
    {
      key: 'terrain',
      name: 'Terrain',
      description: 'Terrain map with hillshading and natural landscape features',
      url: 'https://api.maptiler.com/maps/landscape/style.json?key=slSuwEtNY8loqQWUZ9IO',
      provider: 'MapTiler'
    },
    {
      key: 'satellite',
        name: 'Satellite',
        description: 'High-resolution satellite imagery',
        url: 'https://api.maptiler.com/maps/satellite/style.json?key=slSuwEtNY8loqQWUZ9IO',
        provider: 'MapTiler'
    },
    {
        key: 'hybrid',
        name: 'Hybrid',
        description: 'Satellite imagery with street and place labels',
        url: 'https://api.maptiler.com/maps/hybrid/style.json?key=slSuwEtNY8loqQWUZ9IO',
        provider: 'MapTiler'
    }
  ]

  // Current selected style (default to satellite)
  const currentStyle = ref<string>('satellite')

  /**
   * Change the map style
   */
  const changeMapStyle = (styleKey: string) => {
    if (!map.value) {
      console.warn('Map not initialized')
      return
    }

    const style = availableStyles.find(s => s.key === styleKey)
    if (!style) {
      console.error('Style not found:', styleKey)
      return
    }

    console.log(`🗺️ Changing map style to: ${style.name} (${style.provider})`)

    try {
      // Store current layers and sources to preserve them
      const currentLayers = map.value.getStyle().layers || []
      const currentSources = map.value.getStyle().sources || {}
      
      // Filter out default style layers, keep only custom layers
      const customLayers = currentLayers.filter(layer => {
        // Keep layers that are not part of the base style
        return layer.id.includes('id-') || 
               layer.id.includes('flood') || 
               layer.id.includes('satellite') ||
               layer.id.includes('analysis')
      })

      const customSources = Object.keys(currentSources).reduce((acc, sourceId) => {
        // Keep sources that are not part of the base style
        if (sourceId.includes('flood') || 
            sourceId.includes('satellite') ||
            sourceId.includes('analysis') ||
            !sourceId.startsWith('mapbox://') &&
            !sourceId.startsWith('maptiler://')) {
          acc[sourceId] = currentSources[sourceId]
        }
        return acc
      }, {} as any)

      // Change the style
      map.value.setStyle(style.url)

      // Wait for style to load and re-add custom layers
      map.value.once('style.load', () => {
        console.log('✅ New style loaded, restoring custom layers...')
        
        try {
          // Re-add custom sources
          Object.keys(customSources).forEach(sourceId => {
            if (!map.value?.getSource(sourceId)) {
              map.value?.addSource(sourceId, customSources[sourceId])
            }
          })

          // Re-add custom layers
          customLayers.forEach(layer => {
            if (!map.value?.getLayer(layer.id)) {
              map.value?.addLayer(layer)
            }
          })

          console.log('✅ Custom layers restored successfully')
        } catch (error) {
          console.warn('⚠️ Some custom layers could not be restored:', error)
        }
      })

      // Update current style
      currentStyle.value = styleKey
      
      console.log(`✅ Map style changed to ${style.name}`)

    } catch (error) {
      console.error('❌ Error changing map style:', error)
    }
  }

  /**
   * Get current style info
   */
  const getCurrentStyleInfo = () => {
    return availableStyles.find(s => s.key === currentStyle.value)
  }

  /**
   * Initialize with default style
   */
  const initializeMapStyle = () => {
    // Set default to satellite as requested
    currentStyle.value = 'satellite'
  }

  /**
   * Get style URL by key
   */
  const getStyleUrl = (styleKey: string) => {
    const style = availableStyles.find(s => s.key === styleKey)
    return style?.url || availableStyles[0]?.url || ''
  }

  return {
    // State
    currentStyle,
    availableStyles,
    
    // Actions
    changeMapStyle,
    getCurrentStyleInfo,
    initializeMapStyle,
    getStyleUrl
  }
})