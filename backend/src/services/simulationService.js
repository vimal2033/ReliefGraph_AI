import { Shelter } from '../models/Shelter.js';
import { Report } from '../models/Report.js';
import { Dispatch } from '../models/Dispatch.js';
import { Need } from '../models/Need.js';
import { Alert } from '../models/Alert.js';
import { extractReportEntities, fallbackExtraction } from './extractionService.js';
import { matchLocationToShelter, ensureDefaultShelters } from './matchingService.js';
import { evaluateContradictions } from './contradictionService.js';

export const SIMULATION_REPORTS = [
  // --- Scenario A: Riverside Primary School Water Crisis ---
  {
    rawText: "Riverside School shelter is running critically low on drinking water. 150 people stranded without potable water.",
    source: "VOLUNTEER",
    senderName: "Pooja Verma (Volunteer)",
    formattedTime: "09:00 AM",
  },
  {
    rawText: "Dispatched 20 drinking water cans to Riverside School via Emergency Van 04.",
    source: "DISPATCHER",
    senderName: "Logistics HQ Dispatcher",
    formattedTime: "10:30 AM",
  },
  {
    rawText: "Still no water at the shelter. Children are dehydrated and crying. Where is Van 04?",
    source: "SHELTER_MANAGER",
    senderName: "Rajesh Sharma (Shelter Manager)",
    formattedTime: "12:05 PM",
  },

  // --- Scenario B: Central Hospital Insulin & Medical Shortage ---
  {
    rawText: "Need 50 vials of emergency human insulin at Central Hospital Shelter. Diabetic flood victims entering shock.",
    source: "SHELTER_MANAGER",
    senderName: "Dr. Anita Verma (CMO)",
    formattedTime: "08:30 AM",
  },
  {
    rawText: "Dispatched 10 vials of insulin to Central Hospital Shelter via Rapid Motorbike 02.",
    source: "DISPATCHER",
    senderName: "District Pharma Depot",
    formattedTime: "09:45 AM",
  },
  {
    rawText: "Received only 10 vials of insulin. 40 patients still waiting, supplies exhausted in 30 minutes. Urgent deficit!",
    source: "SHELTER_MANAGER",
    senderName: "Dr. Anita Verma (CMO)",
    formattedTime: "11:15 AM",
  },

  // --- Scenario C: St. Jude Community Hall Infant Milk Crisis ---
  {
    rawText: "Need 50 cooked food packets and infant formula milk at St. Jude Community Hall. Many nursing mothers.",
    source: "VOLUNTEER",
    senderName: "Sister Mary",
    formattedTime: "09:15 AM",
  },
  {
    rawText: "Dispatched 50 dry ration grocery bags to St. Jude Community Hall via Truck 05.",
    source: "DISPATCHER",
    senderName: "Food Corp Depot",
    formattedTime: "10:45 AM",
  },
  {
    rawText: "We received raw rice and pulses, but we have no stove, no clean water, and no baby formula. Babies have not fed since morning.",
    source: "VOLUNTEER",
    senderName: "Sister Mary",
    formattedTime: "12:30 PM",
  },

  // --- Scenario D: East Embankment Relief Camp Tarpaulins ---
  {
    rawText: "Water level rising near East Dike. Need 60 waterproof tarpaulins and heavy blankets for families sleeping in open rain.",
    source: "VOLUNTEER",
    senderName: "Karan Patel (Relief Worker)",
    formattedTime: "10:00 AM",
  },
  {
    rawText: "Dispatched 30 tarpaulins to East Embankment Relief Camp via Relief Truck 08.",
    source: "DISPATCHER",
    senderName: "Disaster Logistics Base",
    formattedTime: "11:20 AM",
  },
  {
    rawText: "Truck 08 is stuck in mud axle-deep near Sector 4 bypass. Tarpaulins haven't arrived and rain is heavy.",
    source: "COMMUNITY",
    senderName: "Local Resident",
    formattedTime: "12:50 PM",
  },

  // --- Scenario E: Nehru Stadium Arena High Headcount & Steady Supplies ---
  {
    rawText: "Nehru Stadium Arena has received 200 food packets and 50 water cartons. Distributed to 300 displaced citizens.",
    source: "SHELTER_MANAGER",
    senderName: "Capt. S. Sengupta (NDRF)",
    formattedTime: "11:00 AM",
  },
  {
    rawText: "Medical team arrived at Nehru Stadium Arena. Triage clinic set up for mild fevers and minor cuts.",
    source: "VOLUNTEER",
    senderName: "Red Cross Volunteer",
    formattedTime: "11:45 AM",
  },
  {
    rawText: "Nehru Stadium stable, but request additional 100 blankets before nightfall.",
    source: "SHELTER_MANAGER",
    senderName: "Capt. S. Sengupta (NDRF)",
    formattedTime: "01:15 PM",
  },

  // --- Additional General Disaster Reports ---
  {
    rawText: "Submerged bridge at Ward 12. Boats required to evacuate 40 elderly people to Riverside Primary School.",
    source: "COMMUNITY",
    senderName: "Ward Counselor",
    formattedTime: "10:15 AM",
  },
  {
    rawText: "Clean drinking water tanker arrived at West Parish circle. Distributing to surrounding shelters.",
    source: "DISPATCHER",
    senderName: "Municipal Water Board",
    formattedTime: "12:10 PM",
  },
  {
    rawText: "Urgent: Power backup generator failed at Central Hospital Shelter. Need diesel fuel immediately.",
    source: "SHELTER_MANAGER",
    senderName: "Maintenance Supervisor",
    formattedTime: "01:30 PM",
  },
  {
    rawText: "50 hygiene and sanitary kits delivered to St. Jude Community Hall.",
    source: "VOLUNTEER",
    senderName: "NGO Volunteer Team",
    formattedTime: "01:45 PM",
  },
  {
    rawText: "Community kitchen at Nehru Stadium has cooked 500 hot khichdi packets ready for dispatch to satellite shelters.",
    source: "VOLUNTEER",
    senderName: "Gurudwara Relief Seva",
    formattedTime: "02:00 PM",
  },
];

/**
 * Resets the database and processes the full flood scenario
 */
export async function runFullSimulation() {
  console.log('[Simulation] Resetting current disaster data...');
  await ensureDefaultShelters(true);
  await Report.deleteMany({});
  await Dispatch.deleteMany({});
  await Need.deleteMany({});
  await Alert.deleteMany({});

  console.log(`[Simulation] Ingesting ${SIMULATION_REPORTS.length} scenario reports...`);

  const processedReports = [];

  for (const item of SIMULATION_REPORTS) {
    // 1. Extract entities (Fast deterministic parsing for simulation benchmark)
    const extracted = fallbackExtraction(item.rawText, item.source);

    // 2. Match to Shelter
    const matchedShelter = await matchLocationToShelter(extracted.location);
    if (matchedShelter) {
      extracted.matchedShelterId = matchedShelter._id;
      extracted.matchedShelterName = matchedShelter.name;
    }

    // 3. Save Report
    const reportDoc = new Report({
      rawText: item.rawText,
      source: item.source,
      senderName: item.senderName,
      formattedTime: item.formattedTime,
      extracted,
      status: 'PROCESSED',
    });
    await reportDoc.save();

    // 4. Update Need or Dispatch records
    if (matchedShelter) {
      if (extracted.isDispatch) {
        const dispatchDoc = new Dispatch({
          trackingCode: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
          shelterId: matchedShelter._id,
          shelterName: matchedShelter.name,
          resourceCategory: extracted.resourceCategory,
          quantity: extracted.quantity,
          unit: extracted.unit,
          vehicleInfo: item.senderName.includes('Van') || item.senderName.includes('Truck') ? item.senderName : 'Relief Logistics Unit',
          formattedTime: item.formattedTime,
          status: 'IN_TRANSIT',
          notes: item.rawText,
        });
        await dispatchDoc.save();
      } else {
        let need = await Need.findOne({
          shelterId: matchedShelter._id,
          resourceCategory: extracted.resourceCategory,
          status: { $in: ['OPEN', 'CONTRADICTION_FLAGGED', 'PARTIALLY_MET'] },
        });

        if (!need) {
          need = new Need({
            shelterId: matchedShelter._id,
            shelterName: matchedShelter.name,
            resourceCategory: extracted.resourceCategory,
            itemDescription: extracted.itemDescription,
            quantityRequested: extracted.quantity,
            unit: extracted.unit,
            urgency: extracted.urgency,
            initialReportId: reportDoc._id,
            timeline: [
              {
                formattedTime: item.formattedTime,
                eventType: 'REQUEST_CREATED',
                description: item.rawText,
                sourceQuote: item.rawText,
                author: item.senderName,
              },
            ],
          });
          await need.save();
        } else {
          need.timeline.push({
            formattedTime: item.formattedTime,
            eventType: 'FOLLOW_UP_REPORT',
            description: item.rawText,
            sourceQuote: item.rawText,
            author: item.senderName,
          });
          await need.save();
        }
      }

      // 5. Evaluate Contradictions for this shelter & category
      await evaluateContradictions(matchedShelter._id, extracted.resourceCategory, true);
    }

    processedReports.push(reportDoc);
  }

  console.log('[Simulation] Simulation processing completed successfully.');
  return {
    success: true,
    count: processedReports.length,
    message: `Processed ${processedReports.length} flood reports. Contradiction alerts generated.`,
  };
}
