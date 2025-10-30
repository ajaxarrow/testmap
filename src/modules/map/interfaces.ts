interface AreaData {
  id: string
  name: string
  type: 'Municipality' | 'Barangay'
  geojson: any
  municipality?: string
}

interface CitizenReport {
    id: string
    title: string
    description: string
    location: {
        latitude?: number
        longitude?: number
    }
    geojson: any
    status: 'Pending' | 'In Progress' | 'Resolved'
    createdAt: Date
    updatedAt: Date
    attachments?: string[],
    citizen: string
}

export type { AreaData, CitizenReport }