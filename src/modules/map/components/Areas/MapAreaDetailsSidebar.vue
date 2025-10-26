<script setup lang="ts">
import { computed } from 'vue'
import { PhX, PhMapPin, PhBuildings, PhInfo } from '@phosphor-icons/vue'
import { useMapAreasStore } from '../../stores/mapAreas.store'

const { selectedArea, showAreaDetails, clearSelectedArea } = useMapAreasStore()

const areaDetails = computed(() => {
  if (!selectedArea.value) return null
  
  const properties = selectedArea.value.geojson.properties
  return {
    name: selectedArea.value.name,
    type: selectedArea.value.type,
    province: properties.PROVINCE || properties.NAME_1,
    region: properties.REGION,
    municipality: selectedArea.value.municipality || properties.NAME_2,
    fullName: properties.NAME_0,
    iso: properties.ISO
  }
})

const handleClose = () => {
  clearSelectedArea()
}
</script>

<template>
  <VSheet 
    v-if="showAreaDetails && selectedArea" 
    class="area-details-sidebar ma-4" 
    rounded="xl"
  >
    <!-- Header -->
    <VRow justify="space-between" align="center" class="ma-0 pa-4">
      <p class="sidebar-title">Area Details</p>
      <PhX 
        color="#C83246" 
        size="24" 
        weight="bold" 
        class="cursor-pointer" 
        @click="handleClose"
      />
    </VRow>

    <VDivider />

    <!-- Content -->
    <div class="sidebar-content-wrapper pa-4" v-if="areaDetails">
      <!-- Area Header -->
      <div class="area-header mb-4">
        <div class="d-flex align-center mb-2">
          <PhBuildings 
            v-if="areaDetails.type === 'Municipality'" 
            size="32" 
            class="mr-3 text-primary" 
          />
          <PhMapPin 
            v-else 
            size="32" 
            class="mr-3 text-secondary" 
          />
          <div>
            <h2 class="area-title">{{ areaDetails.name }}</h2>
            <p class="area-type text-grey">{{ areaDetails.type }}</p>
          </div>
        </div>
      </div>

      <!-- Area Information -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          <PhInfo size="20" class="mr-2" />
          Location Information
        </VCardTitle>
        <VCardText>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Province:</span>
              <span class="info-value">{{ areaDetails.province }}</span>
            </div>
            
            <div v-if="areaDetails.municipality && areaDetails.type === 'Barangay'" class="info-item">
              <span class="info-label">Municipality:</span>
              <span class="info-value">{{ areaDetails.municipality }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Region:</span>
              <span class="info-value">{{ areaDetails.region }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Country:</span>
              <span class="info-value">{{ areaDetails.fullName }} ({{ areaDetails.iso }})</span>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Geographic Data -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          Geographic Data
        </VCardTitle>
        <VCardText>
          <div class="d-flex align-center justify-space-between">
            <span class="text-body-2">Boundary Type:</span>
            <VChip 
              size="small" 
              :color="selectedArea.geojson.geometry.type === 'Polygon' ? 'success' : 'info'"
            >
              {{ selectedArea.geojson.geometry.type }}
            </VChip>
          </div>
        </VCardText>
      </VCard>
    </div>
  </VSheet>
</template>

<style scoped>
.area-details-sidebar {
  border-radius: 24px;
  z-index: 5;
  position: fixed;
  top: 0;
  right: 0;
  height: 95vh !important;
  width: 355px !important;
  box-shadow: 0px 0px 7px 0px #5d6e87;
  transition: opacity 0.3s ease;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
}

.area-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.area-type {
  font-size: 14px;
  margin: 0;
}

.sidebar-content-wrapper {
  height: calc(100% - 80px);
  overflow-y: auto;
  overflow-x: hidden;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: right;
  max-width: 200px;
  word-wrap: break-word;
}

.actions-section {
  margin-top: 16px;
}

/* Custom scrollbar */
.sidebar-content-wrapper::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.sidebar-content-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.sidebar-content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>