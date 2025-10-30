<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhX, PhMapPin, PhBuildings, PhInfo, PhDropSimple, PhRadioButton } from '@phosphor-icons/vue'
import { useMapAreasStore } from '../../stores/mapAreas.store'
import { useSatelliteFloodStore } from '../../stores/satelliteFlood.store.ts'

const { selectedArea, showAreaDetails, clearSelectedArea } = useMapAreasStore()
const { 
  runFloodAnalysis, 
  runForestAnalysis,
  runIllegalLoggingAnalysis,
  runForestFireAnalysis,
  isAnalyzing,
  isAnalyzingFlood,
  isAnalyzingForest,
  isAnalyzingLogging,
  isAnalyzingFires,
  floodResults, 
  forestResults,
  loggingResults,
  fireResults,
  clearFloodResults,
  clearAllResults,
  floodLayerVisible 
} = useSatelliteFloodStore()

// Analysis date range - using more recent dates for better data availability
const getYesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]!
}

const getToday = () => {
  return new Date().toISOString().split('T')[0]!
}

const analysisStartDate = ref<string>(getYesterday()) // Yesterday
const analysisEndDate = ref<string>(getToday()) // Today

// Get today's date in YYYY-MM-DD format for date input max attribute
const todayDate = new Date().toISOString().split('T')[0]

// Format date for display
const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

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
  clearAllResults()
}

const errorMessage = ref<string | null>(null)

const handleFloodAnalysis = async () => {
  if (!selectedArea.value) return
  
  // Clear previous error
  errorMessage.value = null
  
  try {
    await runFloodAnalysis(
      selectedArea.value,
      analysisStartDate.value,
      analysisEndDate.value
    )
  } catch (error: any) {
    console.error('Flood analysis failed:', error)
    errorMessage.value = error.message || 'Flood analysis failed. Please try again.'
  }
}

const handleForestAnalysis = async () => {
  if (!selectedArea.value) return
  
  errorMessage.value = null
  
  try {
    await runForestAnalysis(
      selectedArea.value,
      analysisStartDate.value,
      analysisEndDate.value
    )
  } catch (error: any) {
    console.error('Forest analysis failed:', error)
    errorMessage.value = error.message || 'Forest analysis failed. Please try again.'
  }
}

const handleIllegalLoggingAnalysis = async () => {
  if (!selectedArea.value) return
  
  errorMessage.value = null
  
  try {
    await runIllegalLoggingAnalysis(
      selectedArea.value,
      analysisStartDate.value,
      analysisEndDate.value
    )
  } catch (error: any) {
    console.error('Illegal logging analysis failed:', error)
    errorMessage.value = error.message || 'Illegal logging analysis failed. Please try again.'
  }
}

const handleForestFireAnalysis = async () => {
  if (!selectedArea.value) return
  
  errorMessage.value = null
  
  try {
    await runForestFireAnalysis(
      selectedArea.value,
      analysisStartDate.value,
      analysisEndDate.value
    )
  } catch (error: any) {
    console.error('Forest fire analysis failed:', error)
    errorMessage.value = error.message || 'Forest fire analysis failed. Please try again.'
  }
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
              <span class="info-value">Bukidnon</span>
            </div>
            
            <div v-if="areaDetails.municipality && areaDetails.type === 'Barangay'" class="info-item">
              <span class="info-label">City:</span>
              <span class="info-value">Malaybalay City</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Region:</span>
              <span class="info-value">Region X</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Country:</span>
              <span class="info-value">Philippines</span>
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

      <!-- Analysis Configuration -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          📅 Analysis Period Configuration
        </VCardTitle>
        <VCardText>
          <div class="date-range-selection">
            <p class="text-subtitle-2 mb-2">Satellite Data Period</p>
            <VRow class="ma-0">
              <VCol cols="12" class="pa-1">
                <VTextField
                  v-model="analysisStartDate"
                  type="date"
                  label="Start Date"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :max="todayDate"
                />
              </VCol>
              <VCol cols="12" class="pa-1">
                <VTextField
                  v-model="analysisEndDate"
                  type="date"
                  label="End Date"
                  variant="outlined"
                  density="compact"
                  hide-details
                  :max="todayDate"
                />
              </VCol>
            </VRow>
            <VAlert
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              <template #text>
                This date range applies to all satellite analysis types below.
              </template>
            </VAlert>
          </div>
        </VCardText>
      </VCard>

      <!-- Satellite Flood Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          <PhRadioButton size="20" class="mr-2" />
          Satellite Flood Analysis
        </VCardTitle>
        <VCardText>
          <div class="flood-analysis-section">
            <div class="analysis-period-info mb-2">
              <VChip size="small" color="grey" variant="outlined">
                Period: {{ formatDateForDisplay(analysisStartDate) }} → {{ formatDateForDisplay(analysisEndDate) }}
              </VChip>
            </div>
            <!-- Analysis Button -->
            <VBtn
              :loading="isAnalyzingFlood"
              :disabled="isAnalyzingFlood"
              color="primary"
              variant="flat"
              block
              class="mb-3"
              @click="handleFloodAnalysis"
            >
              <PhRadioButton size="16" class="mr-2" />
              {{ isAnalyzingFlood ? 'Analyzing Satellite Data...' : 'Run Flood Analysis' }}
            </VBtn>

            <!-- Error Message -->
            <VAlert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-3"
              closable
              @click:close="errorMessage = null"
            >
              <template #text>
                {{ errorMessage }}
              </template>
            </VAlert>

            <!-- Analysis Results -->
            <div v-if="floodResults" class="analysis-results">
              <VDivider class="mb-3" />
              
              <div class="results-header mb-3">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text-h6">Analysis Results</h4>
                  <VChip 
                    :color="floodResults.floodData.features.length > 0 ? 'error' : 'success'"
                    size="small"
                  >
                    {{ floodResults.floodData.features.length > 0 ? 'Flood Detected' : 'No Flood' }}
                  </VChip>
                </div>
              </div>

              <div class="results-details">
                <div class="info-item">
                  <span class="info-label">Sensor:</span>
                  <span class="info-value">{{ floodResults.metadata.sensor }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Analysis Date:</span>
                  <span class="info-value">{{ new Date(floodResults.metadata.analysisDate).toLocaleDateString() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Period:</span>
                  <span class="info-value">{{ floodResults.dateRange }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Flood Areas:</span>
                  <span class="info-value">{{ floodResults.floodData.features.length }} polygons</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Resolution:</span>
                  <span class="info-value">{{ floodResults.metadata.scale }}</span>
                </div>
              </div>

              <!-- Flood Areas Details -->
              <div v-if="floodResults.floodData.features.length > 0" class="flood-areas-details mt-3">
                <p class="text-subtitle-2 mb-2">🌊 Detected Flood Areas</p>
                <div class="flood-legend">
                  <div class="legend-item">
                    <div class="legend-color flood-color"></div>
                    <span class="legend-label">Flooded Areas ({{ floodResults.floodData.features.length }})</span>
                  </div>
                </div>
                
                <VAlert
                  type="warning"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                >
                  <template #text>
                    Satellite analysis detected {{ floodResults.floodData.features.length }} flood area{{ floodResults.floodData.features.length > 1 ? 's' : '' }} 
                    in {{ areaDetails?.name }} during the specified period.
                  </template>
                </VAlert>
              </div>

              <div v-else class="no-flood-message mt-3">
                <VAlert
                  type="success"
                  variant="tonal"
                  density="compact"
                >
                  <template #text>
                    No flood areas detected in {{ areaDetails?.name }} during {{ floodResults.dateRange }}.
                  </template>
                </VAlert>
              </div>

              <!-- Technical Details -->
              <VExpansionPanels class="mt-3" variant="accordion">
                <VExpansionPanel>
                  <VExpansionPanelTitle>
                    <PhInfo size="16" class="mr-2" />
                    Technical Details
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <div class="technical-details">
                      <p><strong>Data Source:</strong> Sentinel-1 SAR imagery</p>
                      <p><strong>Processing:</strong> Radar backscatter analysis</p>
                      <p><strong>Threshold:</strong> {{ floodResults.metadata.threshold }}</p>
                      <p><strong>Method:</strong> Water detection using synthetic aperture radar</p>
                      <p><strong>Cloud Independence:</strong> Yes (radar can penetrate clouds)</p>
                    </div>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Forest Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          🌲 Forest Cover Analysis
        </VCardTitle>
        <VCardText>
          <div class="analysis-section">
            <div class="analysis-period-info mb-2">
              <VChip size="small" color="grey" variant="outlined">
                Period: {{ formatDateForDisplay(analysisStartDate) }} → {{ formatDateForDisplay(analysisEndDate) }}
              </VChip>
            </div>
            
            <VBtn
              :loading="isAnalyzingForest"
              :disabled="isAnalyzingForest"
              color="success"
              variant="flat"
              block
              class="mb-3"
              @click="handleForestAnalysis"
            >
              🌲 {{ isAnalyzingForest ? 'Analyzing Forest Cover...' : 'Analyze Forest Cover' }}
            </VBtn>

            <!-- Forest Results -->
            <div v-if="forestResults" class="analysis-results">
              <VDivider class="mb-3" />
              
              <div class="results-header mb-3">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text-h6">Forest Analysis Results</h4>
                  <VChip 
                    :color="forestResults.forestData.features.length > 0 ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ forestResults.forestData.features.length > 0 ? 'Forest Detected' : 'No Forest' }}
                  </VChip>
                </div>
              </div>

              <div class="results-details">
                <div class="info-item">
                  <span class="info-label">Forest Areas:</span>
                  <span class="info-value">{{ forestResults.forestData.features.length }} polygons</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Index:</span>
                  <span class="info-value">{{ forestResults.metadata.index }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Sensor:</span>
                  <span class="info-value">{{ forestResults.metadata.sensor }}</span>
                </div>
              </div>

              <div v-if="forestResults.forestData.features.length > 0" class="forest-areas-details mt-3">
                <VAlert type="success" variant="tonal" density="compact">
                  <template #text>
                    🌲 {{ forestResults.forestData.features.length }} forest area{{ forestResults.forestData.features.length > 1 ? 's' : '' }} 
                    detected in {{ areaDetails?.name }}.
                  </template>
                </VAlert>
              </div>
              
              <div v-else class="no-forest-message mt-3">
                <VAlert type="info" variant="tonal" density="compact">
                  <template #text>
                    {{ forestResults.metadata.note || `No forest areas detected in ${areaDetails?.name} during the analysis period.` }}
                  </template>
                </VAlert>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Illegal Logging Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          🪓 Illegal Logging Detection
        </VCardTitle>
        <VCardText>
          <div class="analysis-section">
            <div class="analysis-period-info mb-2">
              <VChip size="small" color="grey" variant="outlined">
                Period: {{ formatDateForDisplay(analysisStartDate) }} → {{ formatDateForDisplay(analysisEndDate) }}
              </VChip>
            </div>
            
            <VBtn
              :loading="isAnalyzingLogging"
              :disabled="isAnalyzingLogging"
              color="warning"
              variant="flat"
              block
              class="mb-3"
              @click="handleIllegalLoggingAnalysis"
            >
              🪓 {{ isAnalyzingLogging ? 'Analyzing Forest Loss...' : 'Detect Forest Loss' }}
            </VBtn>

            <!-- Logging Results -->
            <div v-if="loggingResults" class="analysis-results">
              <VDivider class="mb-3" />
              
              <div class="results-header mb-3">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text-h6">Forest Loss Analysis</h4>
                  <VChip 
                    :color="loggingResults.forestLossData.features.length > 0 ? 'warning' : 'success'"
                    size="small"
                  >
                    {{ loggingResults.forestLossData.features.length > 0 ? 'Loss Detected' : 'No Loss' }}
                  </VChip>
                </div>
              </div>

              <div class="results-details">
                <div class="info-item">
                  <span class="info-label">Loss Areas:</span>
                  <span class="info-value">{{ loggingResults.forestLossData.features.length }} polygons</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Dataset:</span>
                  <span class="info-value">{{ loggingResults.metadata.dataset }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Years:</span>
                  <span class="info-value">{{ loggingResults.metadata.analysisYears }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tree Cover:</span>
                  <span class="info-value">{{ loggingResults.metadata.treeCoverThreshold }}</span>
                </div>
              </div>

              <div v-if="loggingResults.forestLossData.features.length > 0" class="logging-areas-details mt-3">
                <VAlert type="warning" variant="tonal" density="compact">
                  <template #text>
                    🪓 {{ loggingResults.forestLossData.features.length }} forest loss area{{ loggingResults.forestLossData.features.length > 1 ? 's' : '' }} 
                    detected in {{ areaDetails?.name }} during {{ loggingResults.metadata.analysisYears }}.
                  </template>
                </VAlert>
              </div>
              
              <div v-else class="no-logging-message mt-3">
                <VAlert type="success" variant="tonal" density="compact">
                  <template #text>
                    No significant forest loss detected in {{ areaDetails?.name }} during the analysis period.
                  </template>
                </VAlert>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Forest Fire Analysis -->
      <VCard variant="outlined" class="mb-4">
        <VCardTitle class="text-subtitle-1 pb-2">
          🔥 Forest Fire Detection
        </VCardTitle>
        <VCardText>
          <div class="analysis-section">
            <div class="analysis-period-info mb-2">
              <VChip size="small" color="grey" variant="outlined">
                Period: {{ formatDateForDisplay(analysisStartDate) }} → {{ formatDateForDisplay(analysisEndDate) }}
              </VChip>
            </div>
            
            <VBtn
              :loading="isAnalyzingFires"
              :disabled="isAnalyzingFires"
              color="error"
              variant="flat"
              block
              class="mb-3"
              @click="handleForestFireAnalysis"
            >
              🔥 {{ isAnalyzingFires ? 'Analyzing Burned Areas...' : 'Detect Forest Fires' }}
            </VBtn>

            <!-- Fire Results -->
            <div v-if="fireResults" class="analysis-results">
              <VDivider class="mb-3" />
              
              <div class="results-header mb-3">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text-h6">Fire Analysis Results</h4>
                  <VChip 
                    :color="fireResults.burnedAreaData.features.length > 0 ? 'error' : 'success'"
                    size="small"
                  >
                    {{ fireResults.burnedAreaData.features.length > 0 ? 'Fire Detected' : 'No Fire' }}
                  </VChip>
                </div>
              </div>

              <div class="results-details">
                <div class="info-item">
                  <span class="info-label">Burned Areas:</span>
                  <span class="info-value">{{ fireResults.burnedAreaData.features.length }} polygons</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Method:</span>
                  <span class="info-value">{{ fireResults.metadata.method }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Datasets:</span>
                  <span class="info-value">{{ fireResults.metadata.datasets.join(', ') }}</span>
                </div>
                <div v-if="fireResults.metadata.threshold" class="info-item">
                  <span class="info-label">Threshold:</span>
                  <span class="info-value">{{ fireResults.metadata.threshold }}</span>
                </div>
                <div v-if="fireResults.metadata.imageCount" class="info-item">
                  <span class="info-label">Images Used:</span>
                  <span class="info-value">{{ fireResults.metadata.imageCount }}</span>
                </div>
              </div>

              <div v-if="fireResults.burnedAreaData.features.length > 0" class="fire-areas-details mt-3">
                <VAlert type="error" variant="tonal" density="compact">
                  <template #text>
                    🔥 {{ fireResults.burnedAreaData.features.length }} burned area{{ fireResults.burnedAreaData.features.length > 1 ? 's' : '' }} 
                    detected in {{ areaDetails?.name }}.
                  </template>
                </VAlert>
              </div>
              
              <div v-else class="no-fire-message mt-3">
                <VAlert type="success" variant="tonal" density="compact">
                  <template #text>
                    {{ fireResults.metadata.note || `No burned areas detected in ${areaDetails?.name} during the analysis period.` }}
                  </template>
                </VAlert>
              </div>
            </div>
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

/* Flood Analysis Styles */
.flood-analysis-section {
  width: 100%;
}

.date-range-selection {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.analysis-results {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.results-header h4 {
  margin: 0;
  color: #333;
}

.results-details .info-item {
  padding: 4px 0;
  font-size: 13px;
}

.flood-areas-details {
  background-color: #fff3cd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ffeaa7;
}

.flood-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.flood-color {
  background-color: #dc3545;
}

.legend-label {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.no-flood-message {
  background-color: #d1eddd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #badbcc;
}

.technical-details p {
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.4;
}

.technical-details strong {
  color: #333;
}

/* Analysis Period Info */
.analysis-period-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.analysis-section {
  width: 100%;
}

/* Logging Areas Details */
.logging-areas-details {
  background-color: #fff3cd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ffeaa7;
}

.no-logging-message {
  background-color: #d1eddd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #badbcc;
}

/* Fire Areas Details */
.fire-areas-details {
  background-color: #f8d7da;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
}

.no-fire-message {
  background-color: #d1eddd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #badbcc;
}
</style>