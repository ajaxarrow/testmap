import { ref } from 'vue'
import { createGlobalState, get } from '@vueuse/core'
import type { AreaData } from '../interfaces'
import { useMapStore } from './map.store'
//@ts-ignore
import * as turf from "@turf/turf";
export const useMapAreasStore = createGlobalState(() => {
  const layersWithClickListeners = new Set();
  const selectedArea = ref<AreaData | null>(null)
  const showAreaDetails = ref(false)
  const { map, lnglat, popup } = useMapStore();
  const setSelectedArea = (area: AreaData) => {
    selectedArea.value = area
    showAreaDetails.value = true
  }

  const clearSelectedArea = () => {
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
    return areaType == 'Barangay' ? '#00ACC1' : '#0027c1';
  }

  const clickArea = (area: AreaData) => {
    if (area.id != selectedArea.value?.id) {

        if (selectedArea.value){
            // map.value?.setPaintProperty(`id-${selectedArea.value.id}`, 'fill-color', 'transparent');
            const layerId = `id-${selectedArea.value.id}`;

            console.log(layerId)

            if (map.value?.getLayer(layerId)) {
            // Remove event listeners first
            // @ts-ignore
            map.value?.off('mouseover', layerId);
            // @ts-ignore
            map.value?.off('mouseleave', layerId);
            // @ts-ignore
            map.value?.off('click', layerId);

            // Remove the layer and source from the map
            map.value?.removeLayer(layerId);
            map.value?.removeSource(selectedArea.value.id);
            // layersWithClickListeners.delete(layerId);
            }
        }

        setSelectedArea(area);

        const layerId = `id-${area.id}`;
        // @ts-ignore
        map.value?.addSource(area.id, {
        type: 'geojson',
        data: area.geojson,
        });

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
        
        map.value?.fitBounds(
        // @ts-ignore
        turf.bbox(area.geojson["geometry"]),
        {padding: 30, duration: 2000}
        )

        map.value?.setPaintProperty(`id-${area.id}`, 'fill-opacity', .5);
        map.value?.setPaintProperty(`id-${area.id}`, 'fill-color', getColorArea(area.type));
    } else {
        resetToDefault();
    }
  }

  const setupAreas = (areas: AreaData[]) => {
  areas.forEach((area: AreaData) => {
    const layerId = `id-${area.id}`;
    // @ts-ignore
    map.value?.addSource(area.id, {
      type: 'geojson',
      data: area.geojson,
    });

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

    // if (!layersWithClickListeners.has(layerId) && area.type == 'Barangay') {
    //   // @ts-ignore
    //   map.value?.on('mouseover', `id-${area.id}`, (e) => {
    //     if (area.id !== selectedArea.value?.id) {
    //       map.value?.setPaintProperty(`id-${area.id}`, 'fill-opacity', .5);
    //       map.value?.setPaintProperty(`id-${area.id}`, 'fill-color', area.type == 'Barangay' ? getColorArea(area.type) : 'transparent');
    //     }

    //     const popupContent = `<h4>${area.name}</h4>
    //                           <p>${area.type}</p>`
    //     popup.value?.setHTML(popupContent);
    //     // @ts-ignore
    //     popup.value?.setLngLat([e.lngLat.lng, e.lngLat.lat]);
    //     // @ts-ignore
    //     popup.value?.addTo(map.value);
    //   });

    //   // @ts-ignore
    //   map.value?.on('mouseleave', `id-${area.id}`, () => {
    //     if (area.id !== selectedArea.value?.id) {
    //       map.value?.setPaintProperty(`id-${area.id}`, 'fill-opacity', 0);
    //     }
    //     popup.value?.remove();
    //   });


    //   // @ts-ignore
    //   map.value?.on('click', `id-${area.id}`, (e) => {
    //     // @ts-ignore
    //     if (map.value?.getZoom() < 6.25){
    //       // @ts-ignore
    //       map.value?.easeTo({
    //         zoom: 6,
    //         center: [e.lngLat.lng, e.lngLat.lat],
    //         duration: 1000
    //       });
    //     }
    //     else{
    //       // @ts-ignore
    //       map.value?.easeTo({
    //         zoom: 8,
    //         center: [e.lngLat.lng, e.lngLat.lat],
    //         duration: 1000
    //       });
    //     }
    //     clickArea(area)
    //   });
    //   layersWithClickListeners.add(layerId);
    // }

  });
}

const removeAreas = (area: AreaData[]) => {
  area.forEach((area: AreaData) => {
    const layerId = `id-${area.id}`;

    console.log(layerId)

    if (map.value?.getLayer(layerId)) {
      // Remove event listeners first
      // @ts-ignore
      map.value?.off('mouseover', layerId);
      // @ts-ignore
      map.value?.off('mouseleave', layerId);
      // @ts-ignore
      map.value?.off('click', layerId);

      // Remove the layer and source from the map
      map.value?.removeLayer(layerId);
      map.value?.removeSource(area.id);
      // layersWithClickListeners.delete(layerId);
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
    clickArea
  }
})