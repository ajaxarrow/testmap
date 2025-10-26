<template>
  <div class="layers-content">
    <VCard class="mb-3" variant="outlined">
      <VCardTitle class="text-subtitle-1">Layer Controls</VCardTitle>
      <VCardText>
        <div v-for="layer in dummyLayers" :key="layer.id" class="mb-3">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-body-2 font-weight-medium">{{ layer.name }}</span>
            <VSwitch 
              v-model="layer.visible" 
              density="compact" 
              hide-details
              color="primary"
            />
          </div>
          <VSlider
            v-model="layer.opacity"
            :disabled="!layer.visible"
            min="0"
            max="100"
            step="10"
            thumb-label
            density="compact"
            hide-details
            class="mb-2"
          >
            <template #prepend>
              <VIcon size="small">mdi-opacity</VIcon>
            </template>
          </VSlider>
          <VDivider v-if="layer.id !== dummyLayers.length" />
        </div>
      </VCardText>
    </VCard>

    <VBtn block variant="outlined" color="primary" size="small">
      <VIcon start>mdi-layers-plus</VIcon>
      Add Layer
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dummyLayers = ref([
  { id: 1, name: 'Satellite', visible: true, opacity: 80 },
  { id: 2, name: 'Streets', visible: true, opacity: 100 },
  { id: 3, name: 'Terrain', visible: false, opacity: 60 },
  { id: 4, name: 'Labels', visible: true, opacity: 90 },
]);
</script>

<style scoped>
.layers-content {
  width: 100%;
}
</style>
