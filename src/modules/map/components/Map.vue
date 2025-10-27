<script setup lang="ts">
import {Vue3Lottie} from "vue3-lottie";
import mapLoad from '@/assets/loading-states/map-load.json';
import { markRaw, onMounted, ref, shallowRef } from 'vue';
import MapSidebar from "./MapSidebar.vue";
import {Map} from "maplibre-gl";
import { useMapStore } from "../stores/map.store";
import { useMapAreasStore } from "../stores/mapAreas.store";
import { useMapStyleStore } from "../stores/mapStyle.store";
import type { AreaData } from "../interfaces";
import municipitiesData from '@/data/municities_data.json'
import barangaysData from '@/data/barangays_data.json'
const mapContainer = shallowRef<HTMLDivElement | null>(null);

 // Malaybalay City center
const loading = ref(false);
const bounds: [number, number, number, number] = [
  124.2, 7.3,   // Southwest corner of Bukidnon
  125.8, 8.8    // Northeast corner of Bukidnon
];
const { map, lnglat} = useMapStore();
const {setupAreas} = useMapAreasStore();
const { getStyleUrl, initializeMapStyle } = useMapStyleStore();

const initMap = () => {
  if (mapContainer.value) {
    // Initialize map style store first (sets satellite as default)
    initializeMapStyle();
    
    map.value = markRaw(
        new Map({
          container: mapContainer.value,
          style: getStyleUrl('satellite'), // Use satellite as default
          center: lnglat,
          zoom: 7.5,
          maxBounds: bounds
        })
    );
    
    console.log('🗺️ Map initialized with satellite style as default');
  } else {
    console.error("Map container not found.");
  }
};

onMounted(() => {
    loading.value = true;
    initMap();
    // @ts-ignore
    map.value?.on('style.load', async () => {
        setupAreas(municipitiesData as AreaData[]);
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