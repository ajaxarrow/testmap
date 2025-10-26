<template>
  <div class="reports-content">
    <VCard class="mb-3" variant="outlined">
      <VCardTitle class="text-subtitle-1">Available Reports</VCardTitle>
      <VCardText>
        <VList density="compact">
          <VListItem 
            v-for="report in dummyReports" 
            :key="report.id"
            class="px-0"
          >
            <VListItemTitle>{{ report.name }}</VListItemTitle>
            <VListItemSubtitle>{{ report.description }}</VListItemSubtitle>
            <template #append>
              <VBtn 
                size="x-small" 
                variant="outlined" 
                color="primary"
                @click="generateReport(report.id)"
              >
                Generate
              </VBtn>
            </template>
          </VListItem>
        </VList>
      </VCardText>
    </VCard>

    <VCard class="mb-3" variant="outlined">
      <VCardTitle class="text-subtitle-1">Recent Reports</VCardTitle>
      <VCardText>
        <VList density="compact">
          <VListItem 
            v-for="recent in recentReports" 
            :key="recent.id"
            class="px-0"
          >
            <VListItemTitle>{{ recent.name }}</VListItemTitle>
            <VListItemSubtitle>{{ recent.date }}</VListItemSubtitle>
            <template #prepend>
              <VIcon size="small" color="success">mdi-file-check</VIcon>
            </template>
            <template #append>
              <VBtn 
                size="x-small" 
                variant="text" 
                color="primary"
                @click="downloadReport(recent.id)"
              >
                Download
              </VBtn>
            </template>
          </VListItem>
        </VList>
      </VCardText>
    </VCard>

    <VBtn block variant="outlined" color="primary" size="small">
      <VIcon start>mdi-plus</VIcon>
      Create Custom Report
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dummyReports = ref([
  { id: 1, name: 'Area Summary', description: 'Overview of all areas' },
  { id: 2, name: 'Layer Usage', description: 'Layer visibility statistics' },
  { id: 3, name: 'Performance Report', description: 'System performance metrics' },
  { id: 4, name: 'User Activity', description: 'User interaction analytics' },
]);

const recentReports = ref([
  { id: 1, name: 'Monthly Summary - October', date: '2025-10-25' },
  { id: 2, name: 'Weekly Performance', date: '2025-10-20' },
  { id: 3, name: 'Area Analysis', date: '2025-10-18' },
]);

const generateReport = (reportId: number) => {
  console.log(`Generating report with ID: ${reportId}`);
  // Dummy function - would generate actual report
};

const downloadReport = (reportId: number) => {
  console.log(`Downloading report with ID: ${reportId}`);
  // Dummy function - would download actual report
};
</script>

<style scoped>
.reports-content {
  width: 100%;
}
</style>
