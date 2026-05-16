export const PROPERTY_CATEGORIES = {
  residential: {
    label: 'Residential',
    types: {
      apartment: 'Apartment Building',
      'single-family': 'Single Family Home',
      condo: 'Condo',
      townhouse: 'Townhouse',
      duplex: 'Duplex',
      triplex: 'Triplex',
      quadplex: 'Quadplex',
      'mobile-home': 'Mobile Home',
      'tiny-house': 'Tiny House',
      mansion: 'Mansion',
      villa: 'Villa',
      cottage: 'Cottage',
      bungalow: 'Bungalow',
      cabin: 'Cabin',
      farmhouse: 'Farmhouse',
      penthouse: 'Penthouse',
      loft: 'Loft',
      studio: 'Studio Apartment',
    },
  },
  commercial: {
    label: 'Commercial',
    types: {
      office: 'Office Building',
      retail: 'Retail Space',
      warehouse: 'Warehouse',
      industrial: 'Industrial',
      hotel: 'Hotel/Motel',
      restaurant: 'Restaurant',
      'shopping-center': 'Shopping Center',
      'mixed-use': 'Mixed-Use',
      medical: 'Medical Office',
      'flex-space': 'Flex Space',
    },
  },
  land: {
    label: 'Land',
    types: {
      'vacant-land': 'Vacant Land',
      'agricultural-land': 'Agricultural Land',
      'commercial-land': 'Commercial Land',
      'residential-land': 'Residential Land',
    },
  },
  special: {
    label: 'Special Purpose',
    types: {
      'parking-lot': 'Parking Lot',
      'storage-facility': 'Storage Facility',
      'boat-slip': 'Boat Slip',
      'rv-park': 'RV Park',
      'car-wash': 'Car Wash',
      'gas-station': 'Gas Station',
      church: 'Church/Religious',
      school: 'School/Educational',
      hospital: 'Hospital/Healthcare',
      government: 'Government Building',
      other: 'Other',
    },
  },
}

export type PropertyCategory = keyof typeof PROPERTY_CATEGORIES

export interface SpecificationTemplate {
  key: string
  label: string
  placeholder: string
  type?: 'text' | 'number' | 'textarea'
}

export const PROPERTY_SPECIFICATIONS: Record<string, SpecificationTemplate[]> = {
  apartment: [
    { key: 'bedrooms', label: 'Bedrooms', placeholder: 'e.g., 2', type: 'number' },
    { key: 'bathrooms', label: 'Bathrooms', placeholder: 'e.g., 1.5', type: 'number' },
    { key: 'sqft', label: 'Square Feet', placeholder: 'e.g., 1200', type: 'number' },
    { key: 'parlorSize', label: 'Parlor / Living Room Size', placeholder: 'e.g., 400 sq ft' },
    { key: 'kitchenSize', label: 'Kitchen Size', placeholder: 'e.g., 150 sq ft' },
    { key: 'parkingSpaces', label: 'Parking Spaces', placeholder: 'e.g., 1', type: 'number' },
  ],
  'single-family': [
    { key: 'bedrooms', label: 'Bedrooms', placeholder: 'e.g., 3', type: 'number' },
    { key: 'bathrooms', label: 'Bathrooms', placeholder: 'e.g., 2.5', type: 'number' },
    { key: 'sqft', label: 'Square Feet', placeholder: 'e.g., 2500', type: 'number' },
    { key: 'lotSize', label: 'Lot Size', placeholder: 'e.g., 0.5 acres' },
    { key: 'yearBuilt', label: 'Year Built', placeholder: 'e.g., 2020', type: 'number' },
    { key: 'garage', label: 'Garage Type', placeholder: 'e.g., 2-car attached' },
  ],
  condo: [
    { key: 'bedrooms', label: 'Bedrooms', placeholder: 'e.g., 2', type: 'number' },
    { key: 'bathrooms', label: 'Bathrooms', placeholder: 'e.g., 1.5', type: 'number' },
    { key: 'sqft', label: 'Square Feet', placeholder: 'e.g., 1300', type: 'number' },
    { key: 'hoaFees', label: 'HOA Fees (Monthly)', placeholder: 'e.g., 250' },
    { key: 'amenities', label: 'Amenities', placeholder: 'e.g., Pool, Gym, Balcony', type: 'textarea' },
    { key: 'parkingSpaces', label: 'Parking Spaces', placeholder: 'e.g., 2', type: 'number' },
  ],
  office: [
    { key: 'sqft', label: 'Total Square Feet', placeholder: 'e.g., 50000', type: 'number' },
    { key: 'floors', label: 'Number of Floors', placeholder: 'e.g., 5', type: 'number' },
    { key: 'ceilingHeight', label: 'Ceiling Height', placeholder: 'e.g., 14 ft' },
    { key: 'parkingSpaces', label: 'Parking Spaces', placeholder: 'e.g., 100', type: 'number' },
    { key: 'zoning', label: 'Zoning Classification', placeholder: 'e.g., C2, B1' },
  ],
  retail: [
    { key: 'sqft', label: 'Total Square Feet', placeholder: 'e.g., 10000', type: 'number' },
    { key: 'frontage', label: 'Street Frontage', placeholder: 'e.g., 100 ft' },
    { key: 'ceilingHeight', label: 'Ceiling Height', placeholder: 'e.g., 12 ft' },
    { key: 'parkingSpaces', label: 'Parking Spaces', placeholder: 'e.g., 50', type: 'number' },
    { key: 'zoning', label: 'Zoning Classification', placeholder: 'e.g., C3' },
  ],
  warehouse: [
    { key: 'sqft', label: 'Total Square Feet', placeholder: 'e.g., 100000', type: 'number' },
    { key: 'ceilingHeight', label: 'Ceiling Height', placeholder: 'e.g., 25 ft' },
    { key: 'loadingDocks', label: 'Loading Docks', placeholder: 'e.g., 5' },
    { key: 'powerCapacity', label: 'Power Capacity', placeholder: 'e.g., 480V' },
    { key: 'sprinklerSystem', label: 'Sprinkler System', placeholder: 'e.g., Yes' },
  ],
  hotel: [
    { key: 'rooms', label: 'Total Rooms', placeholder: 'e.g., 120', type: 'number' },
    { key: 'stars', label: 'Star Rating', placeholder: 'e.g., 4-star' },
    { key: 'occupancyRate', label: 'Average Occupancy', placeholder: 'e.g., 75%' },
    { key: 'conventionSpace', label: 'Convention Space', placeholder: 'e.g., 5000 sq ft' },
    { key: 'diningOptions', label: 'Dining Options', placeholder: 'e.g., 2 restaurants' },
  ],
  'vacant-land': [
    { key: 'acreage', label: 'Total Acreage', placeholder: 'e.g., 2.5 acres', type: 'number' },
    { key: 'zoning', label: 'Zoning Classification', placeholder: 'e.g., Residential' },
    { key: 'frontage', label: 'Road Frontage', placeholder: 'e.g., 200 ft' },
    { key: 'utilities', label: 'Utilities Available', placeholder: 'e.g., Water, Electric', type: 'textarea' },
    { key: 'accessRoads', label: 'Access Roads', placeholder: 'e.g., Paved' },
  ],
  'commercial-land': [
    { key: 'acreage', label: 'Total Acreage', placeholder: 'e.g., 3 acres', type: 'number' },
    { key: 'zoning', label: 'Zoning Classification', placeholder: 'e.g., Commercial' },
    { key: 'frontage', label: 'Road Frontage', placeholder: 'e.g., 300 ft' },
    { key: 'utilities', label: 'Utilities Available', placeholder: 'e.g., Water, Electric', type: 'textarea' },
    { key: 'maxBuildout', label: 'Max Buildout Potential', placeholder: 'e.g., 150000 sq ft' },
  ],
}

export function getCategoryForType(propertyType: string) {
  for (const [category, group] of Object.entries(PROPERTY_CATEGORIES)) {
    if (propertyType in group.types) {
      return category
    }
  }
  return null
}

export function getAllPropertyTypes() {
  return Object.entries(PROPERTY_CATEGORIES).flatMap(([category, group]) =>
    Object.entries(group.types).map(([value, label]) => ({ category, value, label })),
  )
}

export function getSpecificationsForType(propertyType: string) {
  return PROPERTY_SPECIFICATIONS[propertyType] ?? []
}

export function createSpecificationValues(propertyType: string): Record<string, string> {
  const specs = getSpecificationsForType(propertyType)
  return specs.reduce((acc, spec) => {
    acc[spec.key] = ''
    return acc
  }, {} as Record<string, string>)
}
