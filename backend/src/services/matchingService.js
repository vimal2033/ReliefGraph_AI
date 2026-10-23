import { Shelter } from '../models/Shelter.js';

export const DEFAULT_SHELTERS = [
  {
    name: 'Riverside Primary School',
    normalizedName: 'riverside primary school',
    zone: 'Zone 1 - Riverbank Lowlands',
    coordinates: { lat: 21.1904, lng: 81.2849 },
    capacity: 300,
    currentHeadcount: 240,
    contactPerson: 'Mr. Rajesh Sharma (Shelter Manager)',
    phone: '+91-98271-12001',
    status: 'CRITICAL',
    activeNeedsSummary: ['Drinking Water', 'Baby Formula'],
    stockHealth: {
      water: 12, // Critical deficit
      food: 55,
      medical: 70,
      babyCare: 10,
    },
  },
  {
    name: 'Central Hospital Shelter',
    normalizedName: 'central hospital shelter',
    zone: 'Zone 2 - Downtown Medical District',
    coordinates: { lat: 21.213, lng: 81.312 },
    capacity: 500,
    currentHeadcount: 480,
    contactPerson: 'Dr. Anita Verma (Chief Medical Officer)',
    phone: '+91-98271-12002',
    status: 'CRITICAL',
    activeNeedsSummary: ['Insulin Vials', 'Antiseptic Dressings'],
    stockHealth: {
      water: 80,
      food: 65,
      medical: 18, // Critical insulin shortage
      babyCare: 60,
    },
  },
  {
    name: 'St. Jude Community Hall',
    normalizedName: 'st. jude community hall',
    zone: 'Zone 3 - West Parish',
    coordinates: { lat: 21.185, lng: 81.305 },
    capacity: 200,
    currentHeadcount: 165,
    contactPerson: 'Sister Mary (Volunteer Coordinator)',
    phone: '+91-98271-12003',
    status: 'WARNING',
    activeNeedsSummary: ['Cooked Meals', 'Infant Formula'],
    stockHealth: {
      water: 65,
      food: 25, // Uncooked grains incompatible
      medical: 50,
      babyCare: 8, // Urgent infant formula need
    },
  },
  {
    name: 'East Embankment Relief Camp',
    normalizedName: 'east embankment relief camp',
    zone: 'Zone 4 - Dike Sector',
    coordinates: { lat: 21.176, lng: 81.328 },
    capacity: 400,
    currentHeadcount: 310,
    contactPerson: 'Karan Patel (Relief Worker)',
    phone: '+91-98271-12004',
    status: 'WARNING',
    activeNeedsSummary: ['Waterproof Tents', 'Blankets'],
    stockHealth: {
      water: 45,
      food: 50,
      medical: 40,
      babyCare: 35,
    },
  },
  {
    name: 'Nehru Stadium Arena',
    normalizedName: 'nehru stadium arena',
    zone: 'Zone 5 - North Highland Staging Area',
    coordinates: { lat: 21.205, lng: 81.278 },
    capacity: 1000,
    currentHeadcount: 620,
    contactPerson: 'Capt. S. Sengupta (NDRF Liaison)',
    phone: '+91-98271-12005',
    status: 'STABLE',
    activeNeedsSummary: ['Clean Drinking Water (Surplus)'],
    stockHealth: {
      water: 95, // Surplus +35 cans available
      food: 90, // Surplus cooked rations
      medical: 85,
      babyCare: 80,
    },
  },
];

/**
 * Initializes default shelters in MongoDB/memory if empty or resets them
 */
export async function ensureDefaultShelters(forceReset = false) {
  try {
    const count = await Shelter.countDocuments();
    if (count === 0) {
      console.log('[Matching Service] Seeding default disaster relief shelters...');
      await Shelter.insertMany(DEFAULT_SHELTERS);
      console.log('[Matching Service] 5 default disaster shelters seeded.');
    } else {
      // Update existing shelters
      for (const def of DEFAULT_SHELTERS) {
        const updatePayload = {
          stockHealth: def.stockHealth,
          ...(forceReset
            ? {
                status: def.status,
                currentHeadcount: def.currentHeadcount,
                activeNeedsSummary: def.activeNeedsSummary,
              }
            : {}),
        };

        await Shelter.updateOne(
          { normalizedName: def.normalizedName },
          { $set: updatePayload }
        );
      }
    }
  } catch (err) {
    console.warn('[Matching Service] Shelter count/seed error:', err.message);
  }
}

/**
 * Matches an extracted location string to the best corresponding Shelter
 */
export async function matchLocationToShelter(locationName) {
  if (!locationName) return null;
  const cleaned = locationName.toLowerCase().trim();

  try {
    const shelters = await Shelter.find();
    if (!shelters || shelters.length === 0) {
      return null;
    }

    // Exact or substring match
    for (const shelter of shelters) {
      const norm = shelter.normalizedName;
      if (
        cleaned.includes(norm) ||
        norm.includes(cleaned) ||
        (cleaned.includes('riverside') && norm.includes('riverside')) ||
        (cleaned.includes('hospital') && norm.includes('hospital')) ||
        (cleaned.includes('jude') && norm.includes('jude')) ||
        (cleaned.includes('embankment') && norm.includes('embankment')) ||
        (cleaned.includes('dike') && norm.includes('embankment')) ||
        (cleaned.includes('stadium') && norm.includes('stadium'))
      ) {
        return shelter;
      }
    }

    return shelters[0];
  } catch (err) {
    console.error('[Matching Service] Error querying shelters:', err.message);
    return null;
  }
}
