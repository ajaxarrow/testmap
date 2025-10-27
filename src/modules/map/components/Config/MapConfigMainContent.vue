<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { PhGlobe, PhMapTrifold, PhTree, PhGlobeHemisphereWest, PhMountains } from '@phosphor-icons/vue'
import { useMapStyleStore, type MapStyle } from '@/modules/map/stores/mapStyle.store'

const { currentStyle, changeMapStyle, availableStyles } = useMapStyleStore()

// Local reactive for immediate UI updates
const selectedStyle = ref(currentStyle.value)

// Watch for changes and update map
watch(selectedStyle, (newStyle) => {
  changeMapStyle(newStyle)
})

// Computed properties for template to avoid type issues
const currentStyleInfo = computed(() => 
  availableStyles.find((s: MapStyle) => s.key === currentStyle.value)
)

const getStyleIcon = (styleKey: string) => {
  const iconMap = {
    satellite: PhGlobeHemisphereWest,
    hybrid: PhGlobe,
    streets: PhMapTrifold,
    topo: PhMountains,
    terrain: PhTree
  }
  return iconMap[styleKey as keyof typeof iconMap] || PhMapTrifold
}
</script>

<template>
  <div class="config-content">
    <!-- Map Style Section -->
    <div class="config-section mb-6">
      <h3 class="section-title mb-4">
        <PhGlobe size="20" class="mr-2" />
        Map Style
      </h3>
      
      <div class="style-options">
        <VCard
          v-for="style in availableStyles"
          :key="style.key"
          :class="[
            'style-option',
            { 'style-selected': selectedStyle === style.key }
          ]"
          variant="outlined"
          @click="selectedStyle = style.key"
        >
          <VCardText class="pa-3">
            <div class="d-flex align-center mb-2">
              <component 
                :is="getStyleIcon(style.key)" 
                size="24" 
                class="mr-2"
                :color="selectedStyle === style.key ? '#1976d2' : '#666'"
              />
              <h4 class="style-name">{{ style.name }}</h4>
            </div>
            <p class="style-description">{{ style.description }}</p>
            
            <!-- Provider info -->
            <div class="provider-info mt-2">
              <VChip
                size="x-small"
                :color="style.provider === 'MapTiler' ? 'blue' : style.provider === 'Mapbox' ? 'green' : 'purple'"
                variant="tonal"
              >
                {{ style.provider }}
              </VChip>
              <VChip
                v-if="style.isUpdated"
                size="x-small"
                color="success"
                variant="tonal"
                class="ml-1"
              >
                Latest
              </VChip>
            </div>
          </VCardText>
        </VCard>
      </div>
    </div>

    <!-- Current Style Info -->
    <VCard variant="outlined" class="current-style-info">
      <VCardTitle class="text-subtitle-1 pb-2">
        Current Map Style
      </VCardTitle>
      <VCardText>
        <div class="d-flex align-center mb-2">
          <component 
            :is="getStyleIcon(currentStyle)" 
            size="20" 
            class="mr-2 text-primary"
          />
          <span class="font-weight-medium">
            {{ currentStyleInfo?.name }}
          </span>
        </div>
        <p class="text-caption text-grey">
          {{ currentStyleInfo?.description }}
        </p>
        <div class="mt-2">
          <VChip
            size="small"
            :color="currentStyleInfo?.provider === 'MapTiler' ? 'blue' : 'green'"
            variant="tonal"
          >
            {{ currentStyleInfo?.provider }}
          </VChip>
        </div>
      </VCardText>
    </VCard>

    <!-- Style Information -->
    <VExpansionPanels class="mt-4" variant="accordion">
      <VExpansionPanel>
        <VExpansionPanelTitle>
          <PhGlobe size="16" class="mr-2" />
          Satellite Imagery Sources
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <div class="satellite-sources">
            <h4 class="mb-3">Most Updated Satellite Sources:</h4>
            
            <div class="source-item mb-3">
              <h5>🛰️ Mapbox Satellite (Recommended)</h5>
              <p class="text-caption">
                • Updated imagery from multiple sources<br>
                • Global coverage with frequent updates<br>
                • High resolution in urban areas<br>
                • Excellent for Philippines coverage
              </p>
            </div>

            <div class="source-item mb-3">
              <h5>🌍 Google Maps Satellite</h5>
              <p class="text-caption">
                • Very frequent updates<br>
                • Excellent Philippines coverage<br>
                • Requires Google Maps API key<br>
                • Commercial usage restrictions
              </p>
            </div>

            <div class="source-item mb-3">
              <h5>🛰️ Esri World Imagery</h5>
              <p class="text-caption">
                • High-quality satellite imagery<br>
                • Regular updates<br>
                • Good Philippines coverage<br>
                • Free tier available
              </p>
            </div>

            <div class="source-item">
              <h5>🌏 USGS/NASA Landsat</h5>
              <p class="text-caption">
                • Government satellite data<br>
                • Free and open source<br>
                • 16-day repeat cycle<br>
                • Good for large-scale analysis
              </p>
            </div>
          </div>
        </VExpansionPanelText>
      </VExpansionPanel>

      <VExpansionPanel>
        <VExpansionPanelTitle>
          <PhMap size="16" class="mr-2" />
          Style Details
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <div class="style-details">
            <p><strong>API Keys:</strong> Some styles require API keys from their respective providers</p>
            <p><strong>Usage Limits:</strong> Free tiers have monthly request limits</p>
            <p><strong>Performance:</strong> Satellite styles may load slower than vector styles</p>
            <p><strong>Caching:</strong> Tiles are cached for better performance</p>
          </div>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>

<style scoped>
.config-content {
  padding: 0;
}

.config-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.style-options {
  display: grid;
  gap: 12px;
}

.style-option {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.style-option:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.style-selected {
  border-color: #1976d2 !important;
  background-color: #f3f8ff;
}

.style-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.style-description {
  font-size: 13px;
  color: #666;
  margin: 8px 0;
  line-height: 1.4;
}

.provider-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.current-style-info {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.satellite-sources {
  padding: 8px 0;
}

.source-item {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.source-item h5 {
  margin: 0 0 8px 0;
  color: #333;
  font-weight: 600;
}

.style-details p {
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.4;
}
</style>