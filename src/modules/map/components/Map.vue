<script setup lang="ts">
import {Vue3Lottie} from "vue3-lottie";
import mapLoad from '@/assets/loading-states/map-load.json';
import { markRaw, onMounted, ref, shallowRef, watch } from 'vue';
import MapSidebar from "./MapSidebar.vue";
import {Map} from "maplibre-gl";
import { useMapStore } from "../stores/map.store";
import { useMapAreasStore } from "../stores/mapAreas.store";
import { useMapStyleStore } from "../stores/mapStyle.store";
import type { AreaData } from "../interfaces";
import barangaysData from '@/data/barangays_data.json'
const mapContainer = shallowRef<HTMLDivElement | null>(null);

// Malaybalay City center coordinates
const loading = ref(false);
const bounds: [number, number, number, number] = [
  124.2, 7.3,   // Southwest corner of Bukidnon
  125.8, 8.8    // Northeast corner of Bukidnon
];
const { map, lnglat} = useMapStore();
const {setupAreas, removeAreas} = useMapAreasStore();
const { getStyleUrl, initializeMapStyle, currentStyle } = useMapStyleStore();

const initMap = async () => {
  if (mapContainer.value) {
    // Initialize map style store first (sets satellite as default)
    initializeMapStyle();
    
    map.value = markRaw(
        new Map({
          container: mapContainer.value,
          style: getStyleUrl(currentStyle.value), // Use current style
          center: lnglat, // Malaybalay City center
          zoom: 10, // Increased zoom to focus on Malaybalay area
          maxBounds: bounds
        })
    );
    
    console.log(`🗺️ Map initialized with ${currentStyle.value} style, focused on Malaybalay`);
  } else {
    console.error("Map container not found.");
  }
};

// Watch for style changes and update the map
watch(currentStyle, (newStyle) => {
  if (map.value && newStyle) {
    console.log(`🎨 Changing map style to: ${newStyle}`);
    
    // Remove areas before changing style (optional, since style change clears everything anyway)
    removeAreas(barangaysData as AreaData[]);
    
    // Change the style
    map.value.setStyle(getStyleUrl(newStyle));
    
    // Function to setup areas
    const setupAreasAfterStyleLoad = () => {
      console.log(`✅ Style loaded: ${newStyle}, setting up areas...`);
      setupAreas(barangaysData as AreaData[]);
    };
    
    // Use 'idle' event which fires when the map is fully loaded and idle
    // This ensures the map is completely ready for interactions
    map.value.once('idle', () => {
      console.log(`🎯 Map idle and ready: ${newStyle}, setting up areas...`);
      setupAreasAfterStyleLoad();
    });
  }
});

onMounted( async() => {
    loading.value = true;
    await initMap();

    // @ts-ignore
    map.value.addControl(draw);
    ['draw.create', 'draw.update', 'draw.delete'].forEach((eventName) => {
      //@ts-ignore
      map.value.on(eventName, handleDrawEvent);
    });
    // @ts-ignore
    map.value?.on('style.load', () => {
        // setupAreas(municipitiesData as AreaData[]);
        setupAreas(barangaysData as AreaData[]);
    });
    loading.value = false;
});

</script>

<template>
    <MapSidebar/>
    <div class="map-wrap">
    <div v-if="loading" class="h-96 overflow-hidden d-flex justify-center align-center">
      <Vue3Lottie
          :animation-data="mapLoad"
          :height="750"
          :width="750"
      ></Vue3Lottie>
    </div>
    <a href="https://www.maptiler.com" class="watermark"><img
        src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/></a>
    <div class="map" ref="mapContainer">

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.map-wrap {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.watermark {
  position: absolute;

}
</style>