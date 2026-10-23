# ReliefGraph AI – REST API Documentation

**Base URL (Local Development):** `http://localhost:5000/api`  
**Base URL (Docker Compose / Production):** `http://localhost/api`  
**Content-Type:** `application/json`  

---

## Table of Contents
1. [System Health & Diagnostics](#1-system-health--diagnostics)
2. [Shelters API](#2-shelters-api)
3. [Emergency Reports API](#3-emergency-reports-api)
4. [Dispatches & Supply Transfers API](#4-dispatches--supply-transfers-api)
5. [Smart Rerouting Optimization API](#5-smart-rerouting-optimization-api)
6. [Knowledge Graph API](#6-knowledge-graph-api)
7. [Priority Alerts API](#7-priority-alerts-api)
8. [Disaster Simulation & Benchmark Reset](#8-disaster-simulation--benchmark-reset)

---

## 1. System Health & Diagnostics

### `GET /health`
Returns the operational status of the service, active database mode, and system uptime.

*   **URL:** `/health`
*   **Method:** `GET`
*   **Authentication:** None
*   **Response Codes:**
    *   `200 OK`: Server running normally.

#### Example Response:
```json
{
  "status": "healthy",
  "service": "ReliefGraph AI Backend",
  "storage": "mongodb",
  "uptime": 1420.5,
  "timestamp": "2026-10-23T12:00:00.000Z"
}
```

---

## 2. Shelters API

### `GET /api/shelters`
Fetches a list of all registered disaster relief shelters, including current occupancy, capacity, geographic location, and resource inventory levels.

*   **URL:** `/api/shelters`
*   **Method:** `GET`
*   **Response Codes:**
    *   `200 OK`: Array of shelter objects returned.

#### Example Response:
```json
[
  {
    "_id": "6718a123f1a23c4d5e6f7890",
    "name": "Central High School Relief Center",
    "sector": "Sector 4",
    "location": {
      "lat": 13.0827,
      "lng": 80.2707,
      "address": "4th Cross Road, Central Zone"
    },
    "capacity": 500,
    "currentOccupancy": 460,
    "status": "near_capacity",
    "inventory": {
      "water": 120,
      "food": 250,
      "medicalKits": 15,
      "blankets": 80
    },
    "contactNumber": "+91-98765-43210",
    "createdAt": "2026-10-23T06:00:00.000Z"
  }
]
```

---

### `GET /api/shelters/:id`
Retrieves detailed information and real-time status of a specific shelter by ID.

*   **URL:** `/api/shelters/:id`
*   **Method:** `GET`
*   **Parameters:** `id` (string, path parameter)
*   **Response Codes:**
    *   `200 OK`: Shelter details found.
    *   `404 Not Found`: Shelter does not exist.

---

### `POST /api/shelters`
Registers a new emergency shelter or relief camp.

*   **URL:** `/api/shelters`
*   **Method:** `POST`
*   **Request Body:**
```json
{
  "name": "North District Community Center",
  "sector": "Sector 1",
  "location": {
    "lat": 13.1105,
    "lng": 80.2520,
    "address": "North Ring Road"
  },
  "capacity": 300,
  "currentOccupancy": 50,
  "inventory": {
    "water": 400,
    "food": 350,
    "medicalKits": 60,
    "blankets": 200
  },
  "contactNumber": "+91-98765-11122"
}
```
*   **Response Codes:**
    *   `201 Created`: Shelter successfully created.
    *   `400 Bad Request`: Validation failure.

---

### `PATCH /api/shelters/:id/inventory`
Updates inventory counts or occupancy levels for an existing shelter.

*   **URL:** `/api/shelters/:id/inventory`
*   **Method:** `PATCH`
*   **Request Body:**
```json
{
  "currentOccupancy": 480,
  "inventory": {
    "water": 80,
    "food": 210,
    "medicalKits": 10,
    "blankets": 70
  }
}
```
*   **Response Codes:**
    *   `200 OK`: Inventory updated successfully.

---

## 3. Emergency Reports API

### `GET /api/reports`
Lists all incoming citizen, responder, and sensor emergency reports sorted chronologically descending.

*   **URL:** `/api/reports`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `urgency` (optional): Filter by `critical`, `high`, `medium`, `low`
    *   `verificationStatus` (optional): Filter by `unverified`, `verified`, `disputed`
*   **Response Codes:**
    *   `200 OK`: Array of reports.

---

### `POST /api/reports`
Submits a raw text emergency distress report. Automatically runs the report through Google Gemini Flash (or the local heuristic NLP engine) to extract urgency, category, location coordinates, and structured supply needs.

*   **URL:** `/api/reports`
*   **Method:** `POST`
*   **Request Body:**
```json
{
  "text": "Severe waterlogging near Metro Station Sector 3. 45 seniors stranded without clean drinking water and diabetic medicine.",
  "source": "citizen",
  "reporterName": "Anand R.",
  "location": {
    "lat": 13.0604,
    "lng": 80.2496,
    "address": "Sector 3 Metro Station"
  }
}
```

*   **Response Codes:**
    *   `201 Created`: Report parsed, saved, and categorized.
```json
{
  "success": true,
  "data": {
    "_id": "6718b555f1a23c4d5e6f7901",
    "text": "Severe waterlogging near Metro Station Sector 3. 45 seniors stranded without clean drinking water and diabetic medicine.",
    "source": "citizen",
    "urgency": "critical",
    "category": "medical_and_water",
    "verificationStatus": "unverified",
    "extractedNeeds": [
      {
        "itemType": "water",
        "quantity": 100,
        "urgency": "critical"
      },
      {
        "itemType": "medical",
        "quantity": 25,
        "urgency": "critical"
      }
    ],
    "createdAt": "2026-10-23T12:05:00.000Z"
  }
}
```

---

## 4. Dispatches & Supply Transfers API

### `GET /api/dispatches`
Retrieves all logistical supply dispatches and transit operations.

*   **URL:** `/api/dispatches`
*   **Method:** `GET`
*   **Response Codes:**
    *   `200 OK`: Array of dispatches.

---

### `POST /api/dispatches`
Authorizes and creates a new supply dispatch between two shelters or to an emergency sector.

*   **URL:** `/api/dispatches`
*   **Method:** `POST`
*   **Request Body:**
```json
{
  "fromShelterId": "6718a123f1a23c4d5e6f7890",
  "toShelterId": "6718a999f1a23c4d5e6f7999",
  "itemType": "water",
  "quantity": 150,
  "vehicleType": "truck",
  "estimatedMinutes": 35
}
```
*   **Response Codes:**
    *   `201 Created`: Dispatch initiated and source shelter inventory deducted.

---

### `PATCH /api/dispatches/:id/status`
Updates transit status of an ongoing dispatch (`dispatched` $\rightarrow$ `in_transit` $\rightarrow$ `delivered`).

*   **URL:** `/api/dispatches/:id/status`
*   **Method:** `PATCH`
*   **Request Body:**
```json
{
  "status": "delivered"
}
```
*   **Response Codes:**
    *   `200 OK`: Status updated; destination shelter inventory incremented upon delivery.

---

## 5. Smart Rerouting Optimization API

### `GET /api/reroute/recommendations`
Runs the dynamic optimization engine across all registered shelters to identify critical resource shortages and match recipient shelters with optimal donor facilities within transit range.

*   **URL:** `/api/reroute/recommendations`
*   **Method:** `GET`
*   **Response Codes:**
    *   `200 OK`: Array of recommended resource transfer plans.

#### Example Response:
```json
[
  {
    "id": "reroute-plan-1",
    "targetShelter": {
      "id": "6718a123f1a23c4d5e6f7890",
      "name": "Sector 4 Relief Camp",
      "shortageItem": "water",
      "shortageQuantity": 150
    },
    "donorShelter": {
      "id": "6718b222f1a23c4d5e6f7888",
      "name": "North District Warehouse",
      "surplusQuantity": 500,
      "distanceKm": 8.4
    },
    "recommendedTransfer": 150,
    "estimatedTransitMinutes": 22,
    "priority": "critical"
  }
]
```

---

### `POST /api/reroute/execute`
Executes an approved reroute recommendation by atomically moving inventory, generating the dispatch record, and creating transit waypoints.

*   **URL:** `/api/reroute/execute`
*   **Method:** `POST`
*   **Request Body:**
```json
{
  "fromShelterId": "6718b222f1a23c4d5e6f7888",
  "toShelterId": "6718a123f1a23c4d5e6f7890",
  "itemType": "water",
  "quantity": 150,
  "vehicleType": "truck"
}
```
*   **Response Codes:**
    *   `200 OK`: Transfer successfully processed.

---

## 6. Knowledge Graph API

### `GET /api/graph`
Builds and returns the complete entity-relationship knowledge graph for vis-network visualization. Converts shelters, reports, needs, and dispatches into nodes and directional edges.

*   **URL:** `/api/graph`
*   **Method:** `GET`
*   **Response Codes:**
    *   `200 OK`: Graph object containing `nodes` and `edges`.

#### Example Response:
```json
{
  "nodes": [
    {
      "id": "shelter_1",
      "label": "Central High School\n(460/500)",
      "group": "shelter",
      "color": "#ea580c",
      "shape": "dot",
      "size": 25
    },
    {
      "id": "report_1",
      "label": "Report: Sector 4 Flood\n[Critical]",
      "group": "report",
      "color": "#f59e0b",
      "shape": "box"
    },
    {
      "id": "need_1",
      "label": "Need: 150 Water",
      "group": "need",
      "color": "#8b5cf6",
      "shape": "diamond"
    }
  ],
  "edges": [
    {
      "from": "report_1",
      "to": "need_1",
      "label": "requests",
      "arrows": "to",
      "color": "#64748b"
    },
    {
      "from": "need_1",
      "to": "shelter_1",
      "label": "affects",
      "arrows": "to",
      "color": "#ef4444"
    }
  ]
}
```

---

## 7. Priority Alerts API

### `GET /api/alerts`
Fetches high-severity disaster warnings, flash flood advisories, and detected misinformation reports.

*   **URL:** `/api/alerts`
*   **Method:** `GET`
*   **Response Codes:**
    *   `200 OK`: List of active emergency alerts.

---

## 8. Disaster Simulation & Benchmark Reset

### `POST /api/simulation/reset`
Instantaneously resets the system state to the standardized benchmark disaster scenario (5 shelters, 10 realistic reports, initial dispatches, and priority alerts).

*   **URL:** `/api/simulation/reset`
*   **Method:** `POST`
*   **Response Codes:**
    *   `200 OK`: Scenario reset complete (< 500ms).

#### Example Response:
```json
{
  "success": true,
  "message": "Disaster simulation scenario reset successfully",
  "counts": {
    "shelters": 5,
    "reports": 10,
    "dispatches": 3,
    "alerts": 4
  }
}
```

---

## 9. Example cURL Commands

```bash
# Check Backend Health
curl -s http://localhost:5000/health

# Submit Citizen Emergency Report
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{"text":"Flash flooding at Sector 2 bridge. 80 people cut off, need rations and drinking water urgently.","source":"citizen","reporterName":"Kavita M."}'

# Get Reroute Recommendations
curl -s http://localhost:5000/api/reroute/recommendations

# Reset Disaster Simulation
curl -X POST http://localhost:5000/api/simulation/reset
```
