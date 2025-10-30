import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import type { Map, Marker } from 'maplibre-gl'
import type { CitizenReport, AreaData } from '../interfaces'
import reportsData from '@/data/reports/reports_data.json'

export const useMapCitizenReportsStore = createGlobalState(() => {
  const selectedBarangay = ref<AreaData | null>(null)
  const showReportDetails = ref(false)
  const selectedReport = ref<CitizenReport | null>(null)
  const reportMarkers = ref<Marker[]>([])
  
  // Load citizen reports from JSON and convert date strings to Date objects
  const allCitizenReports = ref<CitizenReport[]>(
    reportsData.map(report => ({
      ...report,
      status: report.status as CitizenReport['status'],
      createdAt: new Date(report.createdAt),
      updatedAt: new Date(report.updatedAt)
    }))
  )

  const setSelectedBarangay = (barangay: AreaData) => {
    selectedBarangay.value = barangay
    showReportDetails.value = true
  }

  const clearSelectedBarangay = () => {
    selectedBarangay.value = null
    showReportDetails.value = false
  }

  // Get reports for a specific barangay
  const getReportsByBarangay = (barangayId: string) => {
    return allCitizenReports.value.filter(
      report => report.geojson?.barangayId === barangayId
    )
  }

  // Get report count for a barangay
  const getReportCountByBarangay = (barangayId: string) => {
    return getReportsByBarangay(barangayId).length
  }

  // Get report count by status for a barangay
  const getReportCountByStatus = (barangayId: string, status: CitizenReport['status']) => {
    return getReportsByBarangay(barangayId).filter(r => r.status === status).length
  }

  // Add report markers to the map
  const addReportMarkers = (map: Map) => {
    // Remove existing markers first
    removeReportMarkers()

    // Import Marker dynamically
    import('maplibre-gl').then(({ Marker }) => {
      allCitizenReports.value.forEach(report => {
        if (report.location.latitude && report.location.longitude) {
          // Create marker element
          const el = document.createElement('div')
          el.className = 'report-marker'
          el.style.width = '24px'
          el.style.height = '24px'
          el.style.borderRadius = '50%'
          el.style.cursor = 'pointer'
          el.style.border = '2px solid white'
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
          el.style.display = 'flex'
          el.style.alignItems = 'center'
          el.style.justifyContent = 'center'
          el.style.fontSize = '12px'
          el.style.fontWeight = 'bold'
          el.style.color = 'white'
          
          // Color based on status
          if (report.status === 'Pending') {
            el.style.backgroundColor = '#f57c00'
            el.innerHTML = '!'
          } else if (report.status === 'In Progress') {
            el.style.backgroundColor = '#1976d2'
            el.innerHTML = '⟳'
          } else {
            el.style.backgroundColor = '#388e3c'
            el.innerHTML = '✓'
          }

          // Create marker
          const marker = new Marker({ element: el })
            .setLngLat([report.location.longitude, report.location.latitude])
            .addTo(map)

          // Add click handler
          el.addEventListener('click', () => {
            flyToReport(map, report)
          })

          reportMarkers.value.push(marker)
        }
      })
    })
  }

  // Remove all report markers
  const removeReportMarkers = () => {
    reportMarkers.value.forEach(marker => marker.remove())
    reportMarkers.value = []
  }

  // Fly to a specific report location
  const flyToReport = (map: Map, report: CitizenReport) => {
    selectedReport.value = report
    
    if (report.location.latitude && report.location.longitude) {
      map.flyTo({
        center: [report.location.longitude, report.location.latitude],
        zoom: 16,
        duration: 1500,
        essential: true
      })
    }
  }

  return {
    selectedBarangay,
    showReportDetails,
    selectedReport,
    reportMarkers,
    allCitizenReports,
    setSelectedBarangay,
    clearSelectedBarangay,
    getReportsByBarangay,
    getReportCountByBarangay,
    getReportCountByStatus,
    addReportMarkers,
    removeReportMarkers,
    flyToReport
  }
})
