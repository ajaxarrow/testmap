<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PhMagnifyingGlass, PhMapPin, PhBuildings } from '@phosphor-icons/vue'
import { useMapAreasStore } from '../../stores/mapAreas.store'

// Import the data
import municipitiesData from '@/data/municities_data.json'
import barangaysData from '@/data/barangays_data.json'
import type { AreaData } from '../../interfaces'

const { setSelectedArea, clickArea } = useMapAreasStore()

const searchQuery = ref('')
const expandedMunicipalities = ref<string[]>([])

// Filter and organize data
const municipalities = computed(() => {
  const filtered = municipitiesData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  return filtered
})

const getBarangaysForMunicipality = (municipalityName: string) => {
  return barangaysData.filter(barangay => 
    barangay.geojson.properties.NAME_2 === municipalityName &&
    barangay.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

const handleMunicipalityClick = (municipality: any) => {
  setSelectedArea({
    id: municipality.id,
    name: municipality.name,
    type: 'Municipality',
    geojson: municipality.geojson
  })
}



onMounted(() => {
  console.log(`Loaded ${municipalities.value.length} municipalities`)
  console.log(`Total barangays available: ${barangaysData.length}`)
})
</script>

<template>
  <div class="areas-content">
    <!-- Search Field -->
    <VTextField
      v-model="searchQuery"
      placeholder="Search Areas"
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

    <!-- Municipalities List -->
    <div class="municipalities-list">
      <VExpansionPanels 
        v-model="expandedMunicipalities" 
        multiple
        class="elevation-0"
      >
        <VExpansionPanel
          v-for="municipality in municipalities"
          :key="municipality.id"
          :value="municipality.id"
          class="municipality-panel"
        >
          <VExpansionPanelTitle class="municipality-title">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <PhBuildings size="20" class="mr-2 text-primary" />
                <div>
                  <div class="text-subtitle-2 font-weight-medium">{{ municipality.name }}</div>
                  <div class="text-caption text-grey">{{ municipality.type }}</div>
                </div>
              </div>
              <VBtn
                size="small"
                variant="outlined"
                color="primary"
                @click.stop="clickArea(municipality as AreaData)"
                class="mr-2"
              >
                <PhMapPin size="14" />
                View
              </VBtn>
            </div>
          </VExpansionPanelTitle>
          
          <VExpansionPanelText>
            <div class="barangays-container">
              <div 
                v-for="barangay in getBarangaysForMunicipality(municipality.name)"
                :key="barangay.id"
                class="barangay-item"
                @click="clickArea(barangay as AreaData)"
              >
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <PhMapPin size="16" class="mr-2 text-secondary" />
                    <div>
                      <div class="text-body-2">{{ barangay.name }}</div>
                      <div class="text-caption text-grey">Barangay</div>
                    </div>
                  </div>
                  <VIcon size="small" color="grey">mdi-arrow-right</VIcon>
                </div>
              </div>
              
              <div 
                v-if="getBarangaysForMunicipality(municipality.name).length === 0"
                class="text-center py-3 text-grey"
              >
                <div class="text-caption">No barangays found</div>
              </div>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>

      <div 
        v-if="municipalities.length === 0" 
        class="text-center py-8 text-grey"
      >
        <PhMagnifyingGlass size="48" class="mb-2 opacity-50" />
        <div class="text-body-2">No municipalities found</div>
        <div class="text-caption">Try adjusting your search</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.areas-content {
  width: 100%;
}

.municipalities-list {
  max-height: 70vh;
  overflow-y: auto;
}

.municipality-panel {
  margin-bottom: 8px !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
}

.municipality-title {
  padding: 12px 16px !important;
}

.barangays-container {
  max-height: 200px;
  overflow-y: auto;
}

.barangay-item {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: 1px solid #f0f0f0;
}

.barangay-item:hover {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

/* Custom scrollbar for better appearance */
.municipalities-list::-webkit-scrollbar,
.barangays-container::-webkit-scrollbar {
  width: 4px;
}

.municipalities-list::-webkit-scrollbar-track,
.barangays-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.municipalities-list::-webkit-scrollbar-thumb,
.barangays-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.municipalities-list::-webkit-scrollbar-thumb:hover,
.barangays-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
