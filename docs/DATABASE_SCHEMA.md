# Database Schema & Data Dictionary

**System:** ReliefGraph AI  
**Database Engines:** MongoDB (Primary / Multi-container) & In-Memory Store (Zero-dependency Hybrid Fallback)  
**ORM / ODM:** Mongoose (v8+)  

---

## 1. Schema Overview

The ReliefGraph AI database layer models disaster management entities across 5 collections:

| Collection | Model Name | Description | Key Relationships |
| :--- | :--- | :--- | :--- |
| `shelters` | `Shelter` | Emergency relief shelters, evacuation hubs, and supply depots | Source & destination for dispatches |
| `reports` | `Report` | Citizen, responder, and SMS distress submissions | Correlates to shelters and generates needs |
| `needs` | `Need` | Extracted demand items (water, food, medical, rescue) | Child of report, targets shelter |
| `dispatches` | `Dispatch` | Resource movement orders between locations | Connects donor shelter $\rightarrow$ recipient shelter |
| `alerts` | `Alert` | System broadcast warnings and contradiction flags | Spatially or contextually linked to sectors |

---

## 2. Collection Definitions & Fields

### 2.1 `shelters` Collection

```javascript
{
  _id: ObjectId,                     // Unique identifier
  name: String,                      // Required. Shelter facility name
  sector: String,                    // Sector identifier (e.g., 'Sector 1', 'Sector 4')
  location: {
    lat: Number,                     // Required. Latitude coordinate (-90 to 90)
    lng: Number,                     // Required. Longitude coordinate (-180 to 180)
    address: String                  // Physical street address or landmark
  },
  capacity: Number,                  // Required. Total individual capacity (e.g., 500)
  currentOccupancy: Number,          // Current number of sheltered individuals
  status: String,                    // Enum: 'normal' | 'near_capacity' | 'overloaded' | 'critical'
  inventory: {
    water: Number,                   // Clean drinking water units (liters or standard bottles)
    food: Number,                    // Ready-to-eat ration packs
    medicalKits: Number,             // First aid & trauma care kits
    blankets: Number                 // Thermal bedding units
  },
  contactNumber: String,             // Facility supervisor phone number
  createdAt: Date,                   // Record creation timestamp
  updatedAt: Date                    // Last modified timestamp
}
```

#### Calculated Fields & Virtuals:
*   `occupancyPercentage`: `(currentOccupancy / capacity) * 100`
*   `hasShortage`: Evaluates to `true` if `water < 100 || food < 100 || medicalKits < 20` when `occupancyPercentage > 75%`.

---

### 2.2 `reports` Collection

```javascript
{
  _id: ObjectId,                     // Unique identifier
  text: String,                      // Required. Sanitized text description
  rawText: String,                   // Original untransformed citizen submission
  source: String,                    // Enum: 'citizen' | 'responder' | 'sms' | 'sensor'
  urgency: String,                   // Enum: 'low' | 'medium' | 'high' | 'critical'
  category: String,                  // Enum: 'medical' | 'evacuation' | 'food_water' | 'infrastructure' | 'general'
  location: {
    lat: Number,                     // Inferred or reported latitude
    lng: Number,                     // Inferred or reported longitude
    address: String                  // Location description (e.g. 'Near Sector 4 flyover')
  },
  verificationStatus: String,        // Enum: 'unverified' | 'verified' | 'disputed'
  reporterName: String,              // Optional reporter name or identifier
  reporterContact: String,           // Optional phone or radio handle
  relatedShelterId: ObjectId,        // Optional ref to nearest Shelter
  aiProcessed: Boolean,              // Flag indicating if LLM/NLP extraction completed
  contradictionFlags: [String],      // Reasons if marked disputed
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2.3 `needs` Collection

```javascript
{
  _id: ObjectId,                     // Unique identifier
  reportId: ObjectId,                // Ref: 'Report'
  shelterId: ObjectId,               // Optional Ref: 'Shelter'
  itemType: String,                  // Enum: 'water' | 'food' | 'medical' | 'shelter' | 'rescue' | 'power'
  quantity: Number,                  // Estimated units required
  urgency: String,                   // Enum: 'low' | 'medium' | 'high' | 'critical'
  status: String,                    // Enum: 'pending' | 'in_progress' | 'fulfilled' | 'cancelled'
  fulfilledQuantity: Number,         // Units delivered to date
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2.4 `dispatches` Collection

```javascript
{
  _id: ObjectId,                     // Unique identifier
  fromShelterId: ObjectId,           // Ref: 'Shelter' (Donor location)
  toShelterId: ObjectId,             // Ref: 'Shelter' (Recipient location)
  needId: ObjectId,                  // Optional Ref: 'Need'
  itemType: String,                  // Enum: 'water' | 'food' | 'medical' | 'blankets'
  quantity: Number,                  // Transferred quantity
  vehicleType: String,               // Enum: 'truck' | 'van' | 'boat' | 'drone'
  status: String,                    // Enum: 'dispatched' | 'in_transit' | 'delivered' | 'cancelled'
  estimatedMinutes: Number,          // Estimated travel time in current road conditions
  dispatchedAt: Date,                // Departure timestamp
  deliveredAt: Date,                 // Completion timestamp
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2.5 `alerts` Collection

```javascript
{
  _id: ObjectId,                     // Unique identifier
  title: String,                     // Required. Alert headline
  description: String,               // Detailed warning text
  severity: String,                  // Enum: 'info' | 'warning' | 'critical'
  category: String,                  // Enum: 'weather' | 'flood' | 'infrastructure' | 'misinformation'
  location: {
    lat: Number,
    lng: Number,
    sector: String
  },
  actionRequired: String,            // Suggested response action for dispatchers
  resolved: Boolean,                 // Active/Resolved flag
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. Database Indexes

For production MongoDB instances, the following indexes are configured:

```javascript
// Spatial Geo-Proximity Indexes
db.shelters.createIndex({ "location.lat": 1, "location.lng": 1 });
db.reports.createIndex({ "location.lat": 1, "location.lng": 1 });

// Urgency and Status Filtering Indexes
db.reports.createIndex({ urgency: 1, verificationStatus: 1, createdAt: -1 });
db.needs.createIndex({ status: 1, urgency: 1 });
db.dispatches.createIndex({ status: 1, fromShelterId: 1, toShelterId: 1 });

// Rapid Temporal Index
db.alerts.createIndex({ resolved: 1, createdAt: -1 });
```

---

## 4. In-Memory Store Consistency

When running without MongoDB, `backend/src/services/memoryStore.js` maintains exact schema parity:
- Auto-generates valid 24-character hexadecimal `_id` strings compatible with MongoDB ObjectIds.
- Supports nested dot notation updates (e.g., `inventory.water`).
- Preserves referential integrity for Foreign Key lookups between Shelter, Report, and Dispatch entities.
