<script setup lang="ts">
import Map from '../components/Map.vue';
import MapSidebar from '../components/MapSidebar.vue';
import MapAreaDetailsSidebar from '../components/Areas/MapAreaDetailsSidebar.vue';
import MapReportDetailsSidebar from '../components/Reports/MapReportDetailsSidebar.vue';
</script>

<template>
    <div class="map-view-container">
        <Map/>
        <transition name="fade">
            <MapSidebar/>
        </transition>
        <transition name="fade">
            <MapAreaDetailsSidebar/>
        </transition>
        <transition name="fade">
            <MapReportDetailsSidebar/>
        </transition>
        
    </div>
</template>

<style scoped>
.map-view-container {
    position: relative;
    width: 100%;
    height: 100vh;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>