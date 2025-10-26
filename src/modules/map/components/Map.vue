<script setup lang="ts">
import {Vue3Lottie} from "vue3-lottie";
import mapLoad from '@/assets/loading-states/map-load.json';
import { markRaw, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import {Map, type LngLatLike} from "maplibre-gl";
const mapContainer = shallowRef<HTMLDivElement | null>(null);
const map = shallowRef<null | Map>(null);
const lnglat: LngLatLike = [125.1275, 8.1569]; // Malaybalay City center
const loading = ref(false);
const bounds: [number, number, number, number] = [
  124.2, 7.3,   // Southwest corner of Bukidnon
  125.8, 8.8    // Northeast corner of Bukidnon
];

const initMap = () => {
  if (mapContainer.value) {
    map.value = markRaw(
        new Map({
          container: mapContainer.value,
          style: `https://api.maptiler.com/maps/topo-v2/style.json?key=slSuwEtNY8loqQWUZ9IO`,
          center: lnglat,
          zoom: 7.5,
          maxBounds: bounds
        })
    );
  } else {
    console.error("Map container not found.");
  }
};

onMounted(() => {
    loading.value = true;
    initMap();
    loading.value = false;
});

</script>

<template>
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