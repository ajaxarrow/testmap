<script setup lang="ts">
import { computed, ref, markRaw } from 'vue'
import { 
  PhX, 
  PhMapPin, 
  PhFileText,
  PhClock,
  PhCircleNotch,
  PhCheckCircle,
  PhUser,
  PhCalendar,
  PhPaperclip,
  PhMagnifyingGlass,
  PhWarning
} from '@phosphor-icons/vue'
import { useMapCitizenReportsStore } from '../../stores/mapCitizenReports.store'
import { useMapStore } from '../../stores/map.store'
import type { CitizenReport } from '../../interfaces'

const { selectedBarangay, showReportDetails, clearSelectedBarangay, getReportsByBarangay, flyToReport } = useMapCitizenReportsStore()
const { map } = useMapStore()

const activeTab = ref('all')
const searchQuery = ref('')

const barangayDetails = computed(() => {
  if (!selectedBarangay.value) return null
  
  return {
    name: selectedBarangay.value.name,
    type: selectedBarangay.value.type,
    municipality: selectedBarangay.value.municipality || 'Malaybalay City'
  }
})

// Get reports for selected barangay
const barangayReports = computed(() => {
  if (!selectedBarangay.value) return []
  return getReportsByBarangay(selectedBarangay.value.id)
})

// Filter reports based on tab and search
const filteredReports = computed(() => {
  let reports = barangayReports.value

  // Filter by status tab
  if (activeTab.value !== 'all') {
    const statusMap: Record<string, CitizenReport['status']> = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'resolved': 'Resolved'
    }
    reports = reports.filter(r => r.status === statusMap[activeTab.value])
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    reports = reports.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.citizen.toLowerCase().includes(query)
    )
  }

  // Sort by most recent first
  return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

const getStatusColor = (status: CitizenReport['status']) => {
  const colors: Record<CitizenReport['status'], string> = {
    'Pending': 'warning',
    'In Progress': 'info',
    'Resolved': 'success'
  }
  return colors[status]
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const handleClose = () => {
  clearSelectedBarangay()
}

const viewReportDetails = (report: CitizenReport) => {
  console.log(`Viewing detailed report: ${report.id}`)
  
  // Fly to the report location on the map
  if (map.value) {
    flyToReport(map.value, report)
  }
}
</script>

<template>
  <VSheet 
    v-if="showReportDetails && selectedBarangay" 
    class="report-details-sidebar ma-4" 
    rounded="xl"
  >
    <!-- Compact Header -->
    <div class="sidebar-header pa-3">
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="d-flex align-center">
          <PhMapPin :size="24" weight="fill" class="mr-2 text-primary" />
          <div>
            <div class="header-title">{{ barangayDetails?.name }}</div>
            <div class="header-subtitle">{{ barangayReports.length }} Reports</div>
          </div>
        </div>
        <PhX 
          :size="22" 
          weight="bold" 
          class="cursor-pointer close-icon" 
          @click="handleClose"
        />
      </div>

      <!-- Compact Summary Stats -->
      <div class="summary-stats">
        <div class="stat-item pending">
          <PhClock :size="14" weight="fill" />
          <span>{{ barangayReports.filter(r => r.status === 'Pending').length }}</span>
        </div>
        <div class="stat-item in-progress">
          <PhCircleNotch :size="14" weight="fill" />
          <span>{{ barangayReports.filter(r => r.status === 'In Progress').length }}</span>
        </div>
        <div class="stat-item resolved">
          <PhCheckCircle :size="14" weight="fill" />
          <span>{{ barangayReports.filter(r => r.status === 'Resolved').length }}</span>
        </div>
      </div>
    </div>

    <VDivider />

    <!-- Content -->
    <div class="sidebar-content pa-3" v-if="barangayDetails">
      <!-- Compact Filter Tabs -->
      <div class="filter-tabs mb-3">
        <div 
          v-for="tab in ['all', 'pending', 'in-progress', 'resolved']" 
          :key="tab"
          :class="['filter-tab', { 'active': activeTab === tab }]"
          @click="activeTab = tab"
        >
          {{ tab === 'all' ? 'All' : tab === 'in-progress' ? 'Active' : tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </div>
      </div>

      <!-- Compact Search -->
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
          <PhMagnifyingGlass :size="14" />
        </template>
      </VTextField>

      <!-- Compact Reports List -->
      <div class="reports-list">
        <div 
          v-for="report in filteredReports" 
          :key="report.id"
          class="report-card"
          @click="viewReportDetails(report)"
        >
          <!-- Status Icon & Title -->
          <div class="d-flex align-center mb-1">
            <PhClock v-if="report.status === 'Pending'" :size="16" weight="fill" class="status-icon pending" />
            <PhCircleNotch v-else-if="report.status === 'In Progress'" :size="16" weight="fill" class="status-icon in-progress" />
            <PhCheckCircle v-else :size="16" weight="fill" class="status-icon resolved" />
            <div class="report-title">{{ report.title }}</div>
          </div>

          <!-- Description -->
          <div class="report-description">{{ report.description }}</div>

          <!-- Meta Info -->
          <div class="report-meta">
            <div class="meta-item">
              <PhUser :size="11" weight="fill" />
              <span>{{ report.citizen }}</span>
            </div>
            <div class="meta-item">
              <PhCalendar :size="11" weight="fill" />
              <span>{{ formatDate(report.createdAt) }}</span>
            </div>
            <div v-if="report.attachments && report.attachments.length > 0" class="meta-item">
              <PhPaperclip :size="11" weight="fill" />
              <span>{{ report.attachments.length }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div 
          v-if="filteredReports.length === 0" 
          class="empty-state"
        >
          <PhWarning :size="40" class="mb-2 opacity-50" />
          <div class="empty-title">No reports found</div>
          <div class="empty-subtitle">Try different filters</div>
        </div>
      </div>
    </div>
  </VSheet>
</template>

<style scoped>
.report-details-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 450px;
  height: 100vh;
  z-index: 1000;
  background-color: white;
  overflow: hidden;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
}

/* Header */
.sidebar-header {
  background-color: #fafafa;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 11px;
  color: #666;
}

.close-icon {
  color: #C83246;
  transition: transform 0.2s;
}

.close-icon:hover {
  transform: scale(1.1);
}

/* Summary Stats */
.summary-stats {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.stat-item.pending {
  background-color: #fff3e0;
  color: #f57c00;
}

.stat-item.in-progress {
  background-color: #e3f2fd;
  color: #1976d2;
}

.stat-item.resolved {
  background-color: #e8f5e9;
  color: #388e3c;
}

/* Content */
.sidebar-content {
  height: calc(100vh - 130px);
  overflow-y: auto;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 6px;
}

.filter-tab {
  flex: 1;
  padding: 6px 8px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f5f5f5;
  color: #666;
  transition: all 0.2s;
}

.filter-tab:hover {
  background-color: #e8e8e8;
}

.filter-tab.active {
  background-color: #1976d2;
  color: white;
}

/* Reports List */
.reports-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.report-card {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-card:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 6px rgba(25, 118, 210, 0.15);
  /* transform: translateX(-2px); */
}

.status-icon {
  margin-right: 6px;
  flex-shrink: 0;
}

.status-icon.pending {
  color: #f57c00;
}

.status-icon.in-progress {
  color: #1976d2;
}

.status-icon.resolved {
  color: #388e3c;
}

.report-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.report-description {
  font-size: 11px;
  color: #666;
  line-height: 1.4;
  margin: 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.report-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #999;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.empty-subtitle {
  font-size: 11px;
}

/* Custom scrollbar */
.reports-list::-webkit-scrollbar,
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.reports-list::-webkit-scrollbar-track,
.sidebar-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.reports-list::-webkit-scrollbar-thumb,
.sidebar-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.reports-list::-webkit-scrollbar-thumb:hover,
.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
