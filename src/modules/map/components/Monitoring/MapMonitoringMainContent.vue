<template>
  <div class="monitoring-content">
    <VCard class="mb-3" variant="outlined">
      <VCardTitle class="text-subtitle-1">System Status</VCardTitle>
      <VCardText>
        <div v-for="metric in dummyMetrics" :key="metric.id" class="mb-3">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-body-2">{{ metric.name }}</span>
            <VChip 
              size="x-small" 
              :color="getStatusColor(metric.status)"
            >
              {{ metric.value }}
            </VChip>
          </div>
          <VProgressLinear
            :model-value="metric.percentage"
            :color="getStatusColor(metric.status)"
            height="4"
            rounded
          />
        </div>
      </VCardText>
    </VCard>

    <VCard class="mb-3" variant="outlined">
      <VCardTitle class="text-subtitle-1">Recent Alerts</VCardTitle>
      <VCardText>
        <VList density="compact">
          <VListItem 
            v-for="alert in dummyAlerts" 
            :key="alert.id"
            class="px-0"
          >
            <VListItemTitle>{{ alert.message }}</VListItemTitle>
            <VListItemSubtitle>{{ alert.timestamp }}</VListItemSubtitle>
            <template #prepend>
              <VIcon 
                size="small" 
                :color="alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'"
              >
                mdi-alert-circle
              </VIcon>
            </template>
          </VListItem>
        </VList>
      </VCardText>
    </VCard>

    <VBtn block variant="outlined" color="primary" size="small">
      <VIcon start>mdi-refresh</VIcon>
      Refresh Data
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dummyMetrics = ref([
  { id: 1, name: 'Server Load', value: '78%', percentage: 78, status: 'warning' },
  { id: 2, name: 'Memory Usage', value: '45%', percentage: 45, status: 'good' },
  { id: 3, name: 'Network Traffic', value: '92%', percentage: 92, status: 'critical' },
  { id: 4, name: 'Storage', value: '23%', percentage: 23, status: 'good' },
]);

const dummyAlerts = ref([
  { id: 1, message: 'High traffic detected', timestamp: '2 min ago', severity: 'high' },
  { id: 2, message: 'System update available', timestamp: '15 min ago', severity: 'low' },
  { id: 3, message: 'Connection timeout', timestamp: '1 hour ago', severity: 'medium' },
]);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good': return 'success';
    case 'warning': return 'warning';
    case 'critical': return 'error';
    default: return 'primary';
  }
};
</script>

<style scoped>
.monitoring-content {
  width: 100%;
}
</style>
