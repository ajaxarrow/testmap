interface AreaData {
  id: string
  name: string
  type: 'Municipality' | 'Barangay'
  geojson: any
  municipality?: string
}

export type { AreaData }