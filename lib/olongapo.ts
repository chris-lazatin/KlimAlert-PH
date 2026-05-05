// Official barangays of Olongapo City, Zambales
export const OLONGAPO_BARANGAYS = [
  "Asinan",
  "Banicain",
  "Barretto",
  "East Bajac-Bajac",
  "East Tapinac",
  "Gordon Heights",
  "Kalaklan",
  "Mabayuan",
  "New Cabalan",
  "New Ilalim",
  "New Kababae",
  "New Kalalake",
  "Old Cabalan",
  "Pag-asa",
  "Santa Rita",
  "West Bajac-Bajac",
  "West Tapinac",
] as const

export type Barangay = (typeof OLONGAPO_BARANGAYS)[number]
