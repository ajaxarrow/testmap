import { ref } from 'vue'
import { createGlobalState, get, set } from '@vueuse/core'
import type { AreaData } from '../interfaces'
import { useMapStore } from './map.store'
//@ts-ignore
import * as turf from "@turf/turf";
export const useMapAreasStore = createGlobalState(() => {
  const layersWithClickListeners = new Set();
  const selectedArea = ref<AreaData | null>(null)
  const showAreaDetails = ref(false)
  const { map, lnglat, popup } = useMapStore();
  const isAreaSelected = ref(false);
  const setIsAreaSelected = (value: boolean) => {
    isAreaSelected.value = value;
  }
  const setSelectedArea = (area: AreaData) => {
    selectedArea.value = area
    showAreaDetails.value = true
  }

  const clearSelectedArea = () => {
    if (selectedArea.value) {
        const selectedLineLayerId = `id-${selectedArea.value.id}-line`;
        if (map.value?.getLayer(selectedLineLayerId)) {
            map.value?.setPaintProperty(selectedLineLayerId, 'line-opacity', 0);
        }
    }
    selectedArea.value = null
    showAreaDetails.value = false
  }

  const resetToDefault = () => {
    clearSelectedArea();
    map.value?.easeTo({
        zoom: 7,
        center: lnglat,
        duration: 1000
    });
  }

  const getColorArea = (areaType: string) => {
    return areaType == 'Barangay' ? '#00c12aff' : '#44c100ff';
  }

  const clickArea = (area: AreaData) => {
    if (area.id != selectedArea.value?.id) {
        setIsAreaSelected(false);

        if (selectedArea.value){
            // Clear previous selection - reset both fill and line
            const prevLayerId = `id-${selectedArea.value.id}`;
            const prevLineLayerId = `id-${selectedArea.value.id}-line`;
            
            if (map.value?.getLayer(prevLayerId)) {
                map.value?.setPaintProperty(prevLayerId, 'fill-color', 'transparent');
                map.value?.setPaintProperty(prevLayerId, 'fill-opacity', 0);
            }
            
            if (map.value?.getLayer(prevLineLayerId)) {
                map.value?.setPaintProperty(prevLineLayerId, 'line-opacity', 0);
            }
        }

        setSelectedArea(area);
        
        map.value?.fitBounds(
        // @ts-ignore
        turf.bbox(area.geojson["geometry"]),
        {padding: 30, duration: 2000}
        )

        // Show outline for selected area using the line layer
        const currentLineLayerId = `id-${area.id}-line`;
        if (map.value?.getLayer(currentLineLayerId)) {
            map.value?.setPaintProperty(currentLineLayerId, 'line-opacity', .8);
            map.value?.setPaintProperty(currentLineLayerId, 'line-color', getColorArea(area.type));
            map.value?.setPaintProperty(currentLineLayerId, 'line-width', 4);
        } else {
            console.warn(`⚠️ Line layer ${currentLineLayerId} not found, cannot style selected area`);
        }
    } else {
        // Clear selection
        
        resetToDefault();
    }
  }

const setupAreas = (areas: AreaData[]) => {
    areas.forEach((area: AreaData) => {
        try {
            const layerId = `id-${area.id}`;
            
            // Check if source already exists, if not add it
            if (!map.value?.getSource(area.id)) {
                // @ts-ignore
                map.value?.addSource(area.id, {
                    type: 'geojson',
                    data: area.geojson,
                });
            }

            // Check if fill layer already exists, if not add it
            if (!map.value?.getLayer(layerId)) {
                map.value?.addLayer({
                    id: `id-${area.id}`,
                    type: 'fill',
                    source: area.id,
                    layout: {},
                    paint: {
                        'fill-opacity': 0,
                        'fill-color': 'transparent',
                    },
                });
            }
            // Check if line layer already exists, if not add it
            const lineLayerId = `id-${area.id}-line`;
            if (!map.value?.getLayer(lineLayerId)) {
                map.value?.addLayer({
                    id: lineLayerId,
                    type: 'line',
                    source: area.id,
                    layout: {},
                    paint: {
                        'line-opacity': 0,
                        'line-color': 'transparent',
                        'line-width': 2,
                    },
                });
            }


            if (!layersWithClickListeners.has(layerId) && area.type == 'Barangay') {
                // @ts-ignore
                map.value?.on('mouseover', `id-${area.id}`, (e) => {
                    if (area.id !== selectedArea.value?.id) {
                        map.value?.setPaintProperty(`id-${area.id}`, 'fill-opacity', .5);
                        map.value?.setPaintProperty(`id-${area.id}`, 'fill-color', '#3dc100ff');
                    } else {
                        // If this is the selected area, clear the fill to show only outline
                        map.value?.setPaintProperty(`id-${area.id}`, 'fill-opacity', 0);
                        map.value?.setPaintProperty(`id-${area.id}`, 'fill-color', 'transparent');
                    }

                    const popupContent = `<h4>${area.name}</h4>
                                        <p>${area.type}</p>`
                    popup.value?.setHTML(popupContent);
                    // @ts-ignore
                    popup.value?.setLngLat([e.lngLat.lng, e.lngLat.lat]);
                    // @ts-ignore
                    popup.value?.addTo(map.value);
                });

                // @ts-ignore
                map.value?.on('mouseleave', `id-${area.id}`, () => {
                    if (area.id !== selectedArea.value?.id) {
                        map.value?.setPaintProperty(`id-${area.id}`, 'fill-opacity', 0);
                    } else {
                        // If this is the selected area, keep fill clear to maintain outline-only appearance
                        map.value?.setPaintProperty(`id-${area.id}`, 'fill-opacity', 0);
                        map.value?.setPaintProperty(`id-${area.id}`, 'fill-color', 'transparent');
                    }
                    popup.value?.remove();
                });

                // @ts-ignore
                map.value?.on('click', `id-${area.id}`, (e) => {
                    if(!isAreaSelected.value){
                        // @ts-ignore
                        if (map.value?.getZoom() < 6.25){
                        // @ts-ignore
                        map.value?.easeTo({
                            zoom: 6,
                            center: [e.lngLat.lng, e.lngLat.lat],
                            duration: 1000
                        });
                        }
                        else{
                        // @ts-ignore
                        map.value?.easeTo({
                            zoom: 8,
                            center: [e.lngLat.lng, e.lngLat.lat],
                            duration: 1000
                        });
                        }
                        clickArea(area)
                    }
                    
                });
                layersWithClickListeners.add(layerId);
            }
        } catch (error) {
            console.error(`❌ Error adding area ${area.name} (ID: ${area.id}) to map:`, error);
        }
    });
    console.log(`✅ Added ${areas.length} areas to the map.`);
}

const removeAreas = (area: AreaData[]) => {
  area.forEach((area: AreaData) => {
    const layerId = `id-${area.id}`;
    const lineLayerId = `id-${area.id}-line`;

    if (map.value?.getLayer(layerId)) {
      // Remove event listeners first
      // @ts-ignore
      map.value?.off('mouseover', layerId);
      // @ts-ignore
      map.value?.off('mouseleave', layerId);
      // @ts-ignore
      map.value?.off('click', layerId);

      // Remove both layers before removing the source
      map.value?.removeLayer(layerId);
      
      // Also remove the line layer if it exists
      if (map.value?.getLayer(lineLayerId)) {
        map.value?.removeLayer(lineLayerId);
      }
      
      // Now it's safe to remove the source
      map.value?.removeSource(area.id);
      layersWithClickListeners.delete(layerId);
    }
  });
};


  return {
    selectedArea,
    showAreaDetails,
    setSelectedArea,
    clearSelectedArea,
    resetToDefault,
    setupAreas,
    removeAreas,
    clickArea,
    isAreaSelected,
    setIsAreaSelected
  }
})