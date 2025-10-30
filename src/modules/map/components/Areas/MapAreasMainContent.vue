<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PhMagnifyingGlass, PhMapPin } from '@phosphor-icons/vue'
import { useMapAreasStore } from '../../stores/mapAreas.store'

// Import the data
import barangaysData from '@/data/barangays_data.json'
import type { AreaData } from '../../interfaces'

const { clickArea } = useMapAreasStore()

const searchQuery = ref('')

// Filter barangays directly
const filteredBarangays = computed(() => {
  return barangaysData.filter(barangay => 
    barangay.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    barangay.geojson.properties.NAME_2.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(() => {
  console.log(`Total barangays available: ${barangaysData.length}`)
})
</script>

<template>
  <div class="areas-content">
    <!-- Search Field -->
    <VTextField
      v-model="searchQuery"
      placeholder="Search Barangays"
      hide-details
      rounded="lg"
      density="comfortable"
      variant="outlined"
      color="primary"
      base-color="gs60"
      class="mb-4"
    >
      <template v-slot:prepend-inner>
        <PhMagnifyingGlass :size="18"/>
      </template>
    </VTextField>

    <!-- Barangays List -->
    <div class="barangays-list">
      <div 
        v-for="barangay in filteredBarangays"
        :key="barangay.id"
        class="barangay-item"
        @click="clickArea(barangay as AreaData)"
      >
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <PhMapPin size="18" class="mr-3 text-primary" />
            <div>
              <div class="text-subtitle-2 font-weight-medium">{{ barangay.name }}</div>
              <div class="text-caption text-grey">Malaybalay City</div>
            </div>
          </div>
          <VBtn
            size="small"
            variant="outlined"
            color="primary"
            @click.stop="clickArea(barangay as AreaData)"
          >
            View
          </VBtn>
        </div>
      </div>
      
      <div 
        v-if="filteredBarangays.length === 0" 
        class="text-center py-8 text-grey"
      >
        <PhMagnifyingGlass size="48" class="mb-2 opacity-50" />
        <div class="text-body-2">No barangays found</div>
        <div class="text-caption">Try adjusting your search</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.areas-content {
  width: 100%;
}

.barangays-list {
  max-height: 70vh;
  overflow-y: auto;
}

.barangay-item {
  padding: 16px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  background-color: white;
}

.barangay-item:hover {
  background-color: #f8f9fa;
  border-color: #388E3C;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
  transform: translateY(-1px);
}

/* Custom scrollbar for better appearance */
.barangays-list::-webkit-scrollbar {
  width: 4px;
}

.barangays-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.barangays-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.barangays-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
