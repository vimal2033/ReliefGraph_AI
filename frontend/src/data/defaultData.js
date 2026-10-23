export const FALLBACK_STATS = {
  totalReports: 18,
  unresolvedNeeds: 4,
  unverifiedDeliveries: 3,
  resolvedCount: 12,
  totalShelters: 5,
};

export const FALLBACK_ALERTS = [
  {
    _id: "alert_001",
    title: "WATER Crisis at Riverside Primary School",
    shelterName: "Riverside Primary School",
    resourceCategory: "WATER",
    severity: "CRITICAL",
    conflictType: "DELIVERY_CONTRADICTION",
    aiExplanation: "Contradiction detected: Outbound delivery was logged ('20 drinking water cans dispatched via Emergency Van 04 at 10:30 AM'), but a subsequent on-ground field report at 12:05 PM states 'Still no water at the shelter. Children are dehydrated'. Van 04 appears delayed or missing in transit.",
    status: "ACTIVE_UNRESOLVED",
    evidenceTimeline: [
      {
        formattedTime: "09:00 AM",
        source: "VOLUNTEER",
        badge: "Field Report",
        quote: "Riverside School shelter is running critically low on drinking water. 150 people stranded without potable water."
      },
      {
        formattedTime: "10:30 AM",
        source: "DISPATCHER",
        badge: "Official Dispatch",
        quote: "Dispatched 20 drinking water cans to Riverside School via Emergency Van 04."
      },
      {
        formattedTime: "12:05 PM",
        source: "SHELTER_MANAGER",
        badge: "Field Report",
        quote: "Still no water at the shelter. Children are dehydrated and crying. Where is Van 04?"
      }
    ]
  },
  {
    _id: "alert_002",
    title: "MEDICAL Crisis at Central Hospital Shelter",
    shelterName: "Central Hospital Shelter",
    resourceCategory: "MEDICAL",
    severity: "CRITICAL",
    conflictType: "QUANTITY_MISMATCH",
    aiExplanation: "Quantity Deficit: Need requested 50 vials of human insulin, but dispatch record only allocated 10 vials. Subsequent report at 11:15 AM confirms supplies exhausted with 40 patients remaining unmedicated.",
    status: "ACTIVE_UNRESOLVED",
    evidenceTimeline: [
      {
        formattedTime: "08:30 AM",
        source: "SHELTER_MANAGER",
        badge: "Field Report",
        quote: "Need 50 vials of emergency human insulin at Central Hospital Shelter. Diabetic flood victims entering shock."
      },
      {
        formattedTime: "09:45 AM",
        source: "DISPATCHER",
        badge: "Official Dispatch",
        quote: "Dispatched 10 vials of insulin to Central Hospital Shelter via Rapid Motorbike 02."
      },
      {
        formattedTime: "11:15 AM",
        source: "SHELTER_MANAGER",
        badge: "Field Report",
        quote: "Received only 10 vials of insulin. 40 patients still waiting, supplies exhausted in 30 minutes. Urgent deficit!"
      }
    ]
  },
  {
    _id: "alert_003",
    title: "BABY_CARE Crisis at St. Jude Community Hall",
    shelterName: "St. Jude Community Hall",
    resourceCategory: "BABY_CARE",
    severity: "CRITICAL",
    conflictType: "QUANTITY_MISMATCH",
    aiExplanation: "Supply Incompatibility: Shelter urgently needed baby formula milk and cooked meals. Dispatch sent raw grains which cannot be cooked due to lack of stoves and clean water.",
    status: "ACTIVE_UNRESOLVED",
    evidenceTimeline: [
      {
        formattedTime: "09:15 AM",
        source: "VOLUNTEER",
        badge: "Field Report",
        quote: "Need 50 cooked food packets and infant formula milk at St. Jude Community Hall. Many nursing mothers."
      },
      {
        formattedTime: "10:45 AM",
        source: "DISPATCHER",
        badge: "Official Dispatch",
        quote: "Dispatched 50 dry ration grocery bags to St. Jude Community Hall via Truck 05."
      },
      {
        formattedTime: "12:30 PM",
        source: "VOLUNTEER",
        badge: "Field Report",
        quote: "We received raw rice and pulses, but we have no stove, no clean water, and no baby formula. Babies have not fed since morning."
      }
    ]
  }
];

export const FALLBACK_SHELTERS = [
  {
    _id: "shelter_1",
    name: "Riverside Primary School",
    zone: "Zone 1 - Riverbank Lowlands",
    coordinates: { lat: 21.1904, lng: 81.2849 },
    capacity: 300,
    currentHeadcount: 240,
    status: "CRITICAL",
    contactPerson: "Mr. Rajesh Sharma",
    phone: "+91-98271-12001",
    activeNeedsSummary: ["Drinking Water (Critical Deficit)", "Emergency Rations"]
  },
  {
    _id: "shelter_2",
    name: "Central Hospital Shelter",
    zone: "Zone 2 - Downtown Medical District",
    coordinates: { lat: 21.213, lng: 81.312 },
    capacity: 500,
    currentHeadcount: 480,
    status: "CRITICAL",
    contactPerson: "Dr. Anita Verma",
    phone: "+91-98271-12002",
    activeNeedsSummary: ["Insulin Vials (Shortage)", "Antiseptic Dressings"]
  },
  {
    _id: "shelter_3",
    name: "St. Jude Community Hall",
    zone: "Zone 3 - West Parish",
    coordinates: { lat: 21.185, lng: 81.305 },
    capacity: 200,
    currentHeadcount: 165,
    status: "WARNING",
    contactPerson: "Sister Mary",
    phone: "+91-98271-12003",
    activeNeedsSummary: ["Infant Formula", "Cooked Meals"]
  },
  {
    _id: "shelter_4",
    name: "East Embankment Relief Camp",
    zone: "Zone 4 - Dike Sector",
    coordinates: { lat: 21.176, lng: 81.328 },
    capacity: 400,
    currentHeadcount: 310,
    status: "WARNING",
    contactPerson: "Karan Patel",
    phone: "+91-98271-12004",
    activeNeedsSummary: ["Waterproof Tarpaulins", "Blankets"]
  },
  {
    _id: "shelter_5",
    name: "Nehru Stadium Arena",
    zone: "Zone 5 - North Highland Staging Area",
    coordinates: { lat: 21.205, lng: 81.278 },
    capacity: 1000,
    currentHeadcount: 620,
    status: "STABLE",
    contactPerson: "Capt. S. Sengupta",
    phone: "+91-98271-12005",
    activeNeedsSummary: ["Routine Rations (Sufficient)"]
  }
];
