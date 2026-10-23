# Software Requirements Specification (SRS)
## ReliefGraph AI — Disaster Relief Coordination System
**Document Version:** 1.0.0  
**Project Track:** Google Gemini Hackathon 2026 (Society & Well-being)  
**Authors:** Team Cipher (BIT Durg: Vimal Mishra, Ritu Mishra, Abhishek Dewangan, Vandana Sahu, Manish Kumar)  
**Date:** October 2026  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional and non-functional requirements for **ReliefGraph AI**, an intelligent disaster relief coordination and verification platform. It describes system behavior, operational context, data models, and user interaction patterns for disaster response coordinators, field volunteers, and humanitarian logistics agencies.

### 1.2 Scope
During natural catastrophes (such as floods, cyclones, and landslides), relief agencies suffer from a critical operational blindspot:
- Official supply shipments are prematurely marked as **"Fulfilled"** the moment vehicles depart central warehouses.
- If delivery trucks become stranded in floodwaters, break down, or deliver to wrong shelters, desperate calls for help from affected populations are drowned in chaotic chat groups and social feeds.
- **ReliefGraph AI** continuously cross-examines official dispatch logs against real-time, unstructured multi-lingual field reports using **Google Gemini**, automatically identifying contradictions (unverified deliveries, quantity deficits, supply mismatches, and stranded shipments) and providing causal explanations with clickable evidence timelines.
- Additionally, the platform provides a **Smart Logistics Re-routing Copilot** that computes optimal surplus-to-deficit distribution plans from safe staging hubs to crisis sectors, bypassing flooded transport corridors.

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS:** Software Requirements Specification
- **NDRF:** National Disaster Response Force
- **LLM:** Large Language Model (Google Gemini Flash)
- **KPI:** Key Performance Indicator
- **DFD:** Data Flow Diagram
- **PWA:** Progressive Web Application
- **GIS:** Geographic Information System
- **Heuristic Engine:** Deterministic rule-based fallback parser ensuring 100% operational uptime in offline or disconnected environments.

### 1.4 References
- IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications.
- Google Gen AI SDK (`@google/genai`) Documentation.
- NDRF Disaster Management Operating Protocols and Relief Guidelines.

---

## 2. Overall Description

### 2.1 Product Perspective
ReliefGraph AI operates as a self-contained tactical command center. It bridges field communications (informal volunteer reports, shelter manager status updates, community distress messages) and official logistics dispatch pipelines.

```
┌─────────────────────────────────┐       ┌────────────────────────────────┐
│   Field Telemetry Contributors  │       │ Logistics HQ & Rescue Agencies │
│   (Volunteers, Victims, CMOs)   │       │   (NDRF, District Admin)       │
└────────────────┬────────────────┘       └───────────────┬────────────────┘
                 │                                        │
                 ▼                                        ▼
    ┌──────────────────────────────────────────────────────────┐
    │              ReliefGraph AI Command Center               │
    │  - Gemini Multi-lingual NLP Extraction                   │
    │  - Chronological Timeline & Contradiction Reasoning      │
    │  - Leaflet GIS Situational Map & Vis-network Graph       │
    │  - Surplus-to-Deficit Dynamic Re-routing Engine          │
    └──────────────────────────────────────────────────────────┘
```

### 2.2 User Classes and Characteristics
1. **Disaster Logistics Coordinator (HQ):** Monitors the primary dashboard, investigates priority contradiction alerts, authorizes expedited re-dispatches, and executes AI re-routing plans.
2. **Field Volunteer / Shelter Manager:** Submits informal status updates regarding shortages, delivery receipts, headcounts, and road obstructions in English, Hindi, or Hinglish.
3. **Emergency Rescue Personnel (NDRF/Paramedics):** Uses tactical shelter drawers to inspect on-site stock levels (Insulin, Drinking Water, Infant Formula, Tarpaulins) and station contact numbers.
4. **Hackathon Judge / Auditor:** Runs benchmark flood simulation scenarios and audits Gemini's causal audit trails.

### 2.3 Operating Environment
- **Server:** Node.js v20+ / Alpine Linux container, Express.js microservice.
- **Database:** MongoDB 7.0 / Resilient In-Memory Fallback Engine.
- **Client:** Modern web browsers (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge).
- **Containerization:** Docker Engine & Docker Compose orchestration with Nginx reverse proxy.

### 2.4 Design and Implementation Constraints
- **Zero-Dependency Resilience:** The system must function with 100% feature fidelity whether local MongoDB or Docker is running or completely offline.
- **Quota Protection:** High-frequency pre-seeded scenario datasets must not exhaust Google Gemini API free-tier quotas (15 RPM).
- **Latency Target:** Conflict detection must complete in under 3 seconds per report ingestion.

---

## 3. System Features & Functional Requirements

### 3.1 Unstructured Field Telemetry Ingestion
- **FR-1.1:** The system shall accept raw natural language reports via Web UI and REST API (`POST /api/reports`).
- **FR-1.2:** The system shall accept multilingual input in English, Hindi, and Hinglish.
- **FR-1.3:** The input shall require non-empty text, source tag (`VOLUNTEER`, `SHELTER_MANAGER`, `DISPATCHER`, `OFFICIAL_LOG`, `COMMUNITY`), and contributor name.

### 3.2 Gemini Entity Extraction
- **FR-2.1:** The system shall parse unstructured text using Google Gemini (`gemini-3.8-flash` / `gemini-2.0-flash`) into standardized JSON schema containing:
  - `location`: Specific facility or landmark.
  - `resourceCategory`: `WATER`, `FOOD`, `MEDICAL`, `BABY_CARE`, `SHELTER_EQUIPMENT`, or `OTHER`.
  - `itemDescription`: Descriptive name of supplies.
  - `quantity`: Numeric count or affected population estimate.
  - `unit`: Measurement unit (`cans`, `vials`, `packets`, `units`).
  - `isDispatch`: Boolean indicating outbound delivery log vs. unmet field need.
  - `urgency`: `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`.
  - `sentiment`: Urgency tone indicator.
- **FR-2.2:** If Google Gemini API is unreachable, quota-throttled, or disabled, the system shall seamlessly fall back to the built-in Heuristic Engine without user disruption.

### 3.3 Shelter Geocoding and Matching
- **FR-3.1:** The system shall normalize and match extracted location strings to registered disaster relief shelters with fuzzy/substring matching.
- **FR-3.2:** If a location cannot be matched, it shall assign the report to the nearest general relief sector.

### 3.4 Chronological Contradiction Reasoning Engine
- **FR-4.1:** For any shelter and resource category with new activity, the system shall compile an ordered chronological timeline of all field reports and dispatch logs.
- **FR-4.2:** The system shall classify conflicts into:
  - `DELIVERY_CONTRADICTION`: A delivery was marked sent, but ground reports state supplies never arrived or transport broke down.
  - `QUANTITY_MISMATCH`: Delivered quantity was drastically below reported deficit (e.g., 10 insulin vials delivered for 50 patients).
  - `UNMET_EMERGENCY`: Critical life-threatening distress reported with zero dispatch response.
  - `DEPLETION_SURGE`: Previously fulfilled requirement exhausted by sudden evacuee surge.
- **FR-4.3:** The system shall generate an alert containing a 2-sentence causal explanation with exact quotes and timestamps.

### 3.5 Gemini Smart Logistics Re-routing Advisor
- **FR-5.1:** Upon clicking "Re-dispatch", the system shall evaluate nearby shelter stations to locate available buffer inventory.
- **FR-5.2:** The system shall generate a comparative transit analysis comparing:
  - Option A: Standard central warehouse dispatch (sub-optimal route, flood chokepoints).
  - Option B: Dynamic surplus re-routing (unobstructed elevated bypass, minutes saved).
- **FR-5.3:** Upon coordinator approval, the system shall generate a tracked emergency dispatch and replenish the destination shelter's stock meter.

### 3.6 Geospatial Situation Map
- **FR-6.1:** The system shall display Leaflet-powered GIS pins with color-coded severity:
  - Red / Pulsing: `CRITICAL` (Active contradiction or emergency).
  - Amber: `WARNING` (Pending verification / in transit).
  - Green: `STABLE` (Verified fulfilled).
- **FR-6.2:** Selecting any pin shall trigger a smooth `flyTo` camera zoom and open the tactical detail drawer.

### 3.7 Relief Knowledge Graph
- **FR-7.1:** The system shall render Vis-network relational nodes for Shelters (blue boxes), Needs (orange/red diamonds), and Dispatches (blue dots).
- **FR-7.2:** Semantic relationships shall be rendered as directed edges (`NEEDS`, `DISPATCHED_TO`), with active contradictions displayed as dashed red `CONFLICTS_WITH` and `UNMET_CRISIS` edges.

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **NFR-1.1:** Response time for `/api/stats`, `/api/alerts`, and `/api/shelters` shall be less than 150 ms in memory mode and less than 500 ms in MongoDB mode.
- **NFR-1.2:** Client-side initial load and bundle size shall remain under 1 MB compressed.

### 4.2 Reliability & Fault Tolerance
- **NFR-2.1:** The application shall maintain 100% functionality even when external network connectivity to Google Gemini API is interrupted.
- **NFR-2.2:** Database connection failure shall trigger automatic zero-downtime transition to the Resilient In-Memory Storage Engine without server restarts.

### 4.3 Security & Privacy
- **NFR-3.1:** API keys and connection credentials shall be loaded exclusively from server environment variables and never exposed to the client bundle.
- **NFR-3.2:** Input sanitization shall prevent cross-site scripting (XSS) in field quotes and sender names.

---

## 5. Verification & Acceptance Criteria
- [x] Initial server startup seeds 5 relief sectors and ingests 20 flood reports in < 1 second.
- [x] Contradiction alerts accurately flag the Riverside water crisis, Central Hospital insulin deficit, and St. Jude formula shortage.
- [x] AI re-routing modal calculates realistic transit savings (138 minutes) from Nehru Stadium.
- [x] Full operational test succeeds without Docker or external MongoDB daemon installed.
