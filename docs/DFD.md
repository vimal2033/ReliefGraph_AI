# Data Flow Diagrams (DFD)
## ReliefGraph AI — Disaster Relief Coordination System
**Document Version:** 1.0.0  
**Authors:** Team Cipher (BIT Durg: Vimal Mishra, Ritu Mishra, Abhishek Dewangan, Vandana Sahu, Manish Kumar)  
**Date:** October 2026  

---

## 1. DFD Notation & Conventions

This document outlines the data transformations and process flows within ReliefGraph AI using standard Gane & Sarson / Yourdon conventions:
- **External Entities (Square / Box):** Sources or destinations of data outside the system boundary.
- **Processes (Rounded Rectangle / Circle):** Computational operations transforming incoming data.
- **Data Stores (Open-ended Rectangle):** Persistent repositories for disaster state.
- **Data Flows (Directed Arrows):** Pathways transferring structured information.

---

## 2. Level 0 DFD — Context Diagram

The Context Diagram defines the external boundary of ReliefGraph AI, its external human actors, and cloud AI services.

```
       ┌────────────────────────┐                   ┌────────────────────────┐
       │   Field Contributors   │                   │    HQ Dispatchers      │
       │ (Volunteers / Victims) │                   │  (Logistics Officers)  │
       └───────────┬────────────┘                   └───────────┬────────────┘
                   │ Raw Reports                                │ Dispatch Logs &
                   │ (English/Hindi)                            │ Manifests
                   ▼                                            ▼
       ┌─────────────────────────────────────────────────────────────────┐
       │                                                                 │
       │                   0.0 ReliefGraph AI System                     │
       │               Disaster Relief Intelligence Engine               │
       │                                                                 │
       └─────────────────┬───────────────────────────────┬───────────────┘
                         │                               ▲
      Prompt & Timeline  │                               │ Structured JSON
      Payloads           ▼                               │ Causal Rationale
       ┌─────────────────────────────────┐               │
       │        Google Gemini API        │───────────────┘
       │  (gemini-3.8-flash Reasoning)   │
       └─────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────┐
        │  Contradiction Alerts, Audit Trails, Map Pins, │
        │        Surplus-to-Deficit Re-routing           │
        └────────────────────────┬───────────────────────┘
                                 ▼
                   ┌───────────────────────────┐
                   │ Disaster Command Center   │
                   │ (Rescue Agencies & NDRF)  │
                   └───────────────────────────┘
```

---

## 3. Level 1 DFD — High-Level Process Decomposition

Level 1 illustrates the seven major functional subsystems and five core data stores.

```
[Field Reporter]
       │ Raw Text & Source
       ▼
 ┌───────────┐
 │    1.0    │
 │ Ingestion │
 └─────┬─────┘
       │ Sanitized Report
       ▼
 ┌───────────┐         Prompts          ┌───────────────┐
 │    2.0    │─────────────────────────▶│ Google Gemini │
 │  Gemini   │◀─────────────────────────│   Flash LLM   │
 │Extraction │      Extracted JSON      └───────────────┘
 └─────┬─────┘
       │ Extracted Entity (Location, Category, Qty, Unit, isDispatch, Urgency)
       ▼
 ┌───────────┐        Queries / Matches         ┌─────────────────┐
 │    3.0    │◀────────────────────────────────▶│  D1: Shelters   │
 │  Shelter  │                                  └─────────────────┘
 │ Matching  │───────┐
 └───────────┘       │ Store Need / Dispatch
                     ▼
             ┌───────────────┐
             │ Branch Logic  │
             └───┬───────┬───┘
   isDispatch=T  │       │  isDispatch=F
                 ▼       ▼
    ┌────────────────┐  ┌────────────────┐
    │ D2: Dispatches │  │   D3: Needs    │
    └────────┬───────┘  └────────┬───────┘
             │                   │
             └─────────┬─────────┘
                       │ Fetch Ordered Timeline
                       ▼
                 ┌───────────┐
                 │    4.0    │
                 │ Chrono-   │
                 │  logical  │
                 │ Timeline  │
                 └─────┬─────┘
                       │ Sorted Time Audit Chain
                       ▼
                 ┌───────────┐         Reasoning Query   ┌───────────────┐
                 │    5.0    │──────────────────────────▶│ Google Gemini │
                 │Contradict-│◀──────────────────────────│   Flash LLM   │
                 │ion Engine │         Causal Analysis   └───────────────┘
                 └─────┬─────┘
                       │ Flag Conflict
                       ▼
               ┌───────────────┐
               │  D4: Alerts   │
               └───────┬───────┘
                       │ Active Alert Trigger
                       ▼
                 ┌───────────┐        Query Surplus      ┌─────────────────┐
                 │    6.0    │◀──────────────────────────│  D1: Shelters   │
                 │   Smart   │                           └─────────────────┘
                 │ Re-route  │───────┐ Approved Re-route
                 │  Advisor  │       ▼
                 └───────────┘ ┌────────────────┐
                               │ D2: Dispatches │
                               └────────────────┘
```

---

## 4. Level 2 DFD — Subsystem Breakdown

### 4.1 Process 5.0: Chronological Contradiction Reasoning
This subprocess examines the sequence of outbound dispatches against incoming field cries for help.

```
            From D2: Dispatches              From D3: Needs / Reports
                    │                                   │
                    ▼                                   ▼
             ┌─────────────────────────────────────────────────┐
             │ 5.1 Normalize Timestamps into Sequential Chain │
             └────────────────────────┬────────────────────────┘
                                      │ Sequential Timeline Array
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │ 5.2 Dispatch Detection & Distress Index Check   │
             │     - Is dispatch logged at time T1?            │
             │     - Is unfulfilled distress logged at T2 > T1?│
             └────────────────────────┬────────────────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        [API Online / Key Set]                [Offline / Heuristic Mode]
                   │                                     │
                   ▼                                     ▼
     ┌───────────────────────────┐         ┌───────────────────────────┐
     │ 5.3 Gemini Causal Audit   │         │ 5.4 Deterministic Pattern │
     │ LLM analyzes temporal gap │         │ Regex & keyword matching  │
     │ and explains discrepancy  │         │ for critical deficits     │
     └─────────────┬─────────────┘         └─────────────┬─────────────┘
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │ 5.5 Construct Alert Document & Evidence Chain   │
             │     - severity: 'CRITICAL'                      │
             │     - conflictType: 'DELIVERY_CONTRADICTION'    │
             │     - evidenceTimeline: [quotes, times]         │
             └────────────────────────┬────────────────────────┘
                                      │
                                      ▼
                              Write to D4: Alerts
                           Update D1: Shelter.status
```

### 4.2 Process 6.0: Gemini Smart Logistics Re-routing Copilot

```
               From D4: Active Contradiction Alert
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │ 6.1 Identify Crisis Shelter & Resource Deficit│
        └──────────────────────┬───────────────────────┘
                               │ Destination Shelter & Category
                               ▼
        ┌──────────────────────────────────────────────┐
        │ 6.2 Query D1: Shelters for Surplus Buffers   │
        │     - Status = 'STABLE'                      │
        │     - Category stock > 80% (e.g. Stadium)    │
        └──────────────────────┬───────────────────────┘
                               │ Surplus Source Identified
                               ▼
        ┌──────────────────────────────────────────────┐
        │ 6.3 Compare Dual Route Profiles:             │
        │     - Route A (Depot): 18.4 km, Submerged    │
        │     - Route B (Surplus Hub): 3.2 km, Ring Rd │
        └──────────────────────┬───────────────────────┘
                               │ Compute Delta (138 Mins Saved)
                               ▼
        ┌──────────────────────────────────────────────┐
        │ 6.4 Present Plan to Coordinator in Modal     │
        │     - Await Human-in-the-Loop Authorization  │
        └──────────────────────┬───────────────────────┘
                               │ Approved by Coordinator
                               ▼
        ┌──────────────────────────────────────────────┐
        │ 6.5 Execute Re-route Dispatch                │
        │     - Create tracking code (REROUTE-XXXX)    │
        │     - Replenish Shelter stockHealth meter    │
        │     - Mark Alert status: 'RE_DISPATCHED'     │
        └──────────────────────────────────────────────┘
```

---

## 5. Data Dictionary

### D1: Shelters Store
| Attribute | Data Type | Nullable | Description |
|---|---|---|---|
| `_id` | ObjectId / String | No | Unique shelter station identifier |
| `name` | String | No | Official facility name (e.g., Riverside Primary School) |
| `normalizedName` | String | No | Lowercase normalized string for fuzzy matching |
| `zone` | String | No | Operational sector zone |
| `coordinates.lat` | Number | No | Latitude coordinate in decimal degrees |
| `coordinates.lng` | Number | No | Longitude coordinate in decimal degrees |
| `capacity` | Number | No | Total bed/evacuee shelter capacity |
| `currentHeadcount` | Number | No | Current verified evacuees on-site |
| `status` | Enum | No | `CRITICAL` \| `WARNING` \| `STABLE` |
| `stockHealth.water`| Number (0-100)| No | Current drinking water reserve percentage |
| `stockHealth.food` | Number (0-100)| No | Current cooked meals/ration percentage |
| `stockHealth.medical`| Number (0-100)| No | Critical medicine & dressing percentage |
| `stockHealth.babyCare`| Number (0-100)| No | Infant formula and milk percentage |

### D2: Dispatches Store
| Attribute | Data Type | Nullable | Description |
|---|---|---|---|
| `_id` | ObjectId / String | No | Unique dispatch tracking ID |
| `trackingCode` | String | No | Manifest code (e.g., `TRK-4912`, `REROUTE-8812`) |
| `shelterId` | ObjectId / String | No | Destination shelter foreign key |
| `resourceCategory`| Enum | No | `WATER` \| `FOOD` \| `MEDICAL` \| `BABY_CARE` \| `SHELTER_EQUIPMENT` |
| `quantity` | Number | No | Total count dispatched |
| `unit` | String | No | Measurement unit (`cans`, `vials`, `packets`) |
| `vehicleInfo` | String | No | Delivery vehicle designation (e.g., Van 04) |
| `status` | Enum | No | `IN_TRANSIT` \| `DELIVERED` \| `CONTRADICTED_MISSING` \| `DELAYED` |

### D3: Needs Store
| Attribute | Data Type | Nullable | Description |
|---|---|---|---|
| `_id` | ObjectId / String | No | Unique need record ID |
| `shelterId` | ObjectId / String | No | Target shelter foreign key |
| `resourceCategory`| Enum | No | Resource classification |
| `quantityRequested`| Number | No | Requested unit count |
| `urgency` | Enum | No | `CRITICAL` \| `HIGH` \| `MEDIUM` \| `LOW` |
| `status` | Enum | No | `OPEN` \| `CONTRADICTION_FLAGGED` \| `PARTIALLY_MET` \| `RESOLVED` |
| `timeline` | Array | Yes | Audit log of timestamped request updates |

### D4: Alerts Store
| Attribute | Data Type | Nullable | Description |
|---|---|---|---|
| `_id` | ObjectId / String | No | Unique contradiction alert ID |
| `title` | String | No | Alert headline |
| `shelterId` | ObjectId / String | No | Impacted shelter reference |
| `conflictType` | Enum | No | `DELIVERY_CONTRADICTION` \| `QUANTITY_MISMATCH` \| `UNMET_EMERGENCY` \| `DEPLETION_SURGE` |
| `severity` | Enum | No | `CRITICAL` \| `WARNING` \| `INFO` |
| `aiExplanation` | String | No | Gemini causal reasoning explanation |
| `evidenceTimeline`| Array | No | Chronological quotes and timestamps |
| `status` | Enum | No | `ACTIVE_UNRESOLVED` \| `RE_DISPATCHED` \| `VERIFIED_RESOLVED` |
