import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { useMapStore } from './map.store'
import { useMapAreasStore } from './mapAreas.store'
import type { AreaData } from "../interfaces";
import barangaysData from '@/data/barangays_data.json'
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
  const {setupAreas} = useMapAreasStore();
  
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

  // localStorage key for storing map style preference
  const STORAGE_KEY = 'mapStyle'

  /**
   * Save current style to localStorage
   */
  const saveStyleToStorage = (styleKey: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, styleKey)
    } catch (error) {
      console.warn('Failed to save map style to localStorage:', error)
    }
  }

  /**
   * Load style from localStorage
   */
  const loadStyleFromStorage = (): string => {
    try {
      const savedStyle = localStorage.getItem(STORAGE_KEY)
      if (savedStyle && availableStyles.some(s => s.key === savedStyle)) {
        return savedStyle
      }
    } catch (error) {
      console.warn('Failed to load map style from localStorage:', error)
    }
    // Return default style if nothing saved or error occurred
    return 'satellite'
  }

  /**
   * Change the map style
   */
  const changeMapStyle = (styleKey: string) => {
    const style = availableStyles.find(s => s.key === styleKey)
    if (!style) {
      console.error('Style not found:', styleKey)
      return
    }

    console.log(`🗺️ Changing map style to: ${style.name} (${style.provider})`)
    
    // Update current style - this will trigger the watcher in Map.vue
    currentStyle.value = styleKey
    
    // Save to localStorage
    saveStyleToStorage(styleKey)
    
    console.log(`✅ Map style changed to ${style.name}`)
  }

  /**
   * Get current style info
   */
  const getCurrentStyleInfo = () => {
    return availableStyles.find(s => s.key === currentStyle.value)
  }

  /**
   * Initialize with default style or load from localStorage
   */
  const initializeMapStyle = () => {
    // Load from localStorage, fallback to satellite if nothing saved
    const savedStyle = loadStyleFromStorage()
    currentStyle.value = savedStyle
    console.log(`🎨 Initialized map style: ${savedStyle} ${savedStyle !== 'satellite' ? '(from localStorage)' : '(default)'}`)
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
    getStyleUrl,
    saveStyleToStorage,
    loadStyleFromStorage
  }
})