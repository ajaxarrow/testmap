<template>
  <div class="reports-content">
    <!-- Status Filter Tabs with Icons -->
    <div class="status-tabs mb-3">
      <div 
        v-for="tab in statusTabs" 
        :key="tab.value"
        :class="['status-tab', { 'active': activeStatusTab === tab.value }]"
        @click="activeStatusTab = tab.value"
      >
        <component :is="tab.icon" :size="20" weight="fill" />
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
      </div>
    </div>

    <!-- Search Field -->
    <VTextField
      v-model="searchQuery"
      placeholder="Search..."
      hide-details
      rounded="lg"
      density="compact"
      variant="outlined"
      color="primary"
      class="mb-3"
    >
      <template v-slot:prepend-inner>
        <PhMagnifyingGlass :size="16" />
      </template>
    </VTextField>

    <!-- Barangays List with Icons -->
    <div class="barangays-list">
      <div 
        v-for="barangay in filteredBarangays"
        :key="barangay.id"
        class="barangay-item"
        @click="viewBarangayReports(barangay)"
      >
        <div class="d-flex align-center mb-1">
          <PhMapPin :size="18" weight="fill" class="mr-2 text-primary" />
          <div class="barangay-name">{{ barangay.name }}</div>
          <VSpacer />
          <PhCaretRight :size="16" class="text-grey" />
        </div>
        
        <!-- Status icons row -->
        <div class="status-icons">
          <div v-if="getPendingCount(barangay.id) > 0" class="status-badge pending">
            <PhClock :size="12" weight="fill" />
            <span>{{ getPendingCount(barangay.id) }}</span>
          </div>
          <div v-if="getInProgressCount(barangay.id) > 0" class="status-badge in-progress">
            <PhCircleNotch :size="12" weight="fill" />
            <span>{{ getInProgressCount(barangay.id) }}</span>
          </div>
          <div v-if="getResolvedCount(barangay.id) > 0" class="status-badge resolved">
            <PhCheckCircle :size="12" weight="fill" />
            <span>{{ getResolvedCount(barangay.id) }}</span>
          </div>
        </div>
      </div>
      
      <div 
        v-if="filteredBarangays.length === 0" 
        class="text-center py-8 text-grey"
      >
        <PhMagnifyingGlass :size="48" class="mb-2 opacity-50" />
        <div class="text-body-2">No barangays found</div>
        <div class="text-caption">Try adjusting filters</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { 
  PhMagnifyingGlass, 
  PhMapPin, 
  PhCaretRight,
  PhClock,
  PhCircleNotch,
  PhCheckCircle,
  PhStack
} from '@phosphor-icons/vue'
import { useMapCitizenReportsStore } from '../../stores/mapCitizenReports.store'
import { useMapAreasStore } from '../../stores/mapAreas.store'
import type { AreaData, CitizenReport } from '../../interfaces'
import barangaysData from '@/data/barangays_data.json'

const { setSelectedBarangay, getReportCountByBarangay, getReportCountByStatus, allCitizenReports } = useMapCitizenReportsStore()
const { clickArea } = useMapAreasStore()

const searchQuery = ref('')
const activeStatusTab = ref('pending') // Default to Pending tab

// Status tabs with icons and counts
const statusTabs = computed(() => {
  const allReports = allCitizenReports.value
  return [
    {
      value: 'pending',
      label: 'Pending',
      icon: markRaw(PhClock),
      count: allReports.filter(r => r.status === 'Pending').length
    },
    {
      value: 'in-progress',
      label: 'Active',
      icon: markRaw(PhCircleNotch),
      count: allReports.filter(r => r.status === 'In Progress').length
    },
    {
      value: 'resolved',
      label: 'Done',
      icon: markRaw(PhCheckCircle),
      count: allReports.filter(r => r.status === 'Resolved').length
    },
    {
      value: 'all',
      label: 'All',
      icon: markRaw(PhStack),
      count: allReports.length
    }
  ]
})

// Filter barangays - only show barangays with reports matching the status filter
const filteredBarangays = computed(() => {
  return barangaysData.filter(barangay => {
    // First check if barangay name matches search
    const matchesSearch = barangay.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    if (!matchesSearch) return false
    
    // Check if barangay has reports matching the active status filter
    if (activeStatusTab.value === 'all') {
      // Show barangays with any reports
      return getReportCountByBarangay(barangay.id) > 0
    } else {
      // Show barangays with reports matching the specific status
      const statusMap: Record<string, CitizenReport['status']> = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'resolved': 'Resolved'
      }
      const status = statusMap[activeStatusTab.value]
      if (!status) return false
      return getReportCountByStatus(barangay.id, status) > 0
    }
  })
})

// Get report counts
const getReportCount = (barangayId: string) => {
  return getReportCountByBarangay(barangayId)
}

const getPendingCount = (barangayId: string) => {
  return getReportCountByStatus(barangayId, 'Pending')
}

const getInProgressCount = (barangayId: string) => {
  return getReportCountByStatus(barangayId, 'In Progress')
}

const getResolvedCount = (barangayId: string) => {
  return getReportCountByStatus(barangayId, 'Resolved')
}

const viewBarangayReports = (barangay: any) => {
  // Click the area on the map first
  clickArea(barangay as AreaData)
  
  // Then set it as selected barangay for reports
  setSelectedBarangay(barangay as AreaData)
}
</script>

<style scoped>
.reports-content {
  width: 100%;
}

/* Status Tabs */
.status-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.status-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f5f5f5;
  border: 2px solid transparent;
  position: relative;
}

.status-tab:hover {
  background-color: #e8e8e8;
}

.status-tab.active {
  background-color: #e3f2fd;
  border-color: #1976d2;
}

.status-tab .tab-label {
  font-size: 11px;
  font-weight: 600;
  margin-top: 4px;
  color: #666;
}

.status-tab.active .tab-label {
  color: #1976d2;
}

.status-tab .tab-count {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #1976d2;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Barangays List */
.barangays-list {
  max-height: 65vh;
  overflow-y: auto;
}

.barangay-item {
  padding: 12px;
  margin: 6px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  background-color: white;
}

.barangay-item:hover {
  background-color: #f8f9fa;
  border-color: #1976d2;
  box-shadow: 0 2px 6px rgba(25, 118, 210, 0.15);
  /* transform: translateX(2px); */
}

.barangay-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Status Icons */
.status-icons {
  display: flex;
  gap: 6px;
  margin-left: 26px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.status-badge.pending {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-badge.in-progress {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.resolved {
  background-color: #e8f5e9;
  color: #388e3c;
}

/* Custom scrollbar */
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
