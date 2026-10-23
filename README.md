# ReliefGraph AI — Disaster Relief Coordination System
> **Google Gemini Hackathon 2026** • Track: *Society & Well-being*  
> **Team Name:** Cipher (BIT Durg)  
> **Team Members:** Vimal Mishra (Leader), Ritu Mishra (Designer), Abhishek Dewangan, Vandana Sahu, Manish Kumar  

---

## 🎯 The Problem
During disasters (floods, cyclones), conventional relief dashboards suffer from a fatal blindspot:
1. When emergency supplies are sent, they are prematurely marked as **"Dispatched = Fulfilled"**.
2. If transport vehicles break down, get stuck in floodwaters, or deliver to the wrong shelter, subsequent cries for help from the ground are buried in noisy chat feeds.
3. **ReliefGraph** uses **Google Gemini** to continuously cross-examine official delivery records against real-time field telemetry, instantly detecting **unverified deliveries, quantity deficits, supply mismatches, and conflicting logs** with clickable evidence audit trails.

---

## ⚡ Key Features

- 🧠 **Gemini Causal Contradiction Engine:** Automatically flags mismatches between dispatch paperwork and on-ground field realities.
- 🚚 **Gemini Smart Logistics Re-Routing Advisor:** Dynamic surplus-to-deficit optimization that identifies safe bypass routes and nearby surplus hubs (e.g., Nehru Stadium) to re-route critical supplies, saving 2+ hours of transit delay and dynamically replenishing on-site stock meters.
- 🗺️ **Interactive Geospatial Map:** Leaflet-powered situational map with pulsing crisis markers, live shelter occupancy, and sector status filters.
- 🕸️ **Relief Knowledge Graph:** Semantic visualization powered by Vis-network showing Shelter $\leftrightarrow$ Need $\leftrightarrow$ Dispatch relationships with highlighted `CONFLICTS_WITH` and `UNMET_CRISIS` edges.
- 📋 **Tactical Shelter Drill-Down Drawer:** Real-time stock meters (Drinking Water, Food, Medical, Baby Care), live headcount vs. capacity, and ground coordinator contact with live state synchronization.
- 🌐 **Multilingual Ingestion:** Ingests unstructured volunteer and victim reports in English, Hindi, and Hinglish.
- 🛡️ **Zero-Dependency Resilient Fallback:** Runs seamlessly whether MongoDB is running in Docker, locally, or completely offline via our built-in in-memory engine.

---

## 🏗️ System Architecture

```
[ Multilingual Field Telemetry ]       [ Official HQ Logistics ]
 (WhatsApp / SMS / Social Feeds)       (Vehicle Dispatches & Manifests)
               │                                      │
               ▼                                      ▼
    ┌──────────────────────┐               ┌──────────────────────┐
    │ Google Gemini Engine │               │ Dispatch Tracker Log │
    │ (Entity Extraction)  │               │ (Vehicle / Cans / Qty│
    └──────────┬───────────┘               └──────────┬───────────┘
               │                                      │
               └──────────────────┬───────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────────┐
                 │  Chronological Timeline Audit   │
                 │   (Matching Shelter & Needs)    │
                 └────────────────┬────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────────┐
                 │   Gemini Contradiction Engine   │
                 │   - Delivery vs Distress Audit  │
                 │   - Quantity Mismatch Detection │
                 │   - Surplus Re-routing Advisor  │
                 └────────────────┬────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│ Tactical Command Dashboard   │        │ Relief Knowledge Graph       │
│ - Leaflet Geospatial View    │        │ - Vis-network Semantic Edges │
│ - Evidence Audit Drawer      │        │ - Conflict Edge Highlight    │
│ - Smart Re-route Approvals   │        │ - Dynamic Surplus Nodes      │
└──────────────────────────────┘        └──────────────────────────────┘
```

---

## 🚀 Quick Start (Dockerized)

Ensure **Docker Desktop** is running, then in the project root folder run:

```bash
docker compose up -d
```

Docker Compose will automatically spin up:
- **MongoDB** container (`reliefgraph-mongodb`) on port `27017` with automatic health checks.
- **ReliefGraph Backend** (`reliefgraph-backend`) on port `5000` with Gemini reasoning engine.
- **ReliefGraph Frontend** (`reliefgraph-frontend`) on port `3000` with Nginx reverse proxy.

### Access the Application:
- 🌐 **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- 🔌 **API Health:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 💻 Local Development (Without Docker)

You can also run ReliefGraph directly on your machine without Docker or local MongoDB:

```bash
# 1. Start Backend (Runs on Port 5000)
cd backend
npm install
npm run dev

# 2. Start Frontend (in separate terminal, runs on Port 3000)
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration (.env)

Create or edit `.env` in the root folder:

```env
# Google Gemini API Key (Get yours at https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Application Configuration
PORT=5000
MONGO_URI=mongodb://mongodb:27017/reliefgraph
GEMINI_MODEL=gemini-3.8-flash
```

*(Note: If you don't supply a Gemini API key or are offline, ReliefGraph includes an intelligent heuristic fallback parser that keeps 100% of the demo operational for judges!)*

---

## 🏆 Presentation & Live Demo Walkthrough (for Judges)

1. **Dashboard Overview:**
   - Open `http://localhost:3000`.
   - Observe the top 4 interactive KPI cards: **Unresolved Needs**, **Unverified Deliveries**, **Resolved / Verified**, and **Disaster Telemetry**. Click any card to instantly filter the entire command center.

2. **1-Click Flood Scenario Loader:**
   - Click the orange **"Run Simulation"** button in the top navbar.
   - The system ingests 20 realistic flood disaster reports across 5 sectors (Riverside School, Central Hospital, St. Jude Community Hall, East Embankment, Nehru Stadium).

3. **Flagship Gemini Contradiction Alerts:**
   - Check the **Priority Contradiction Alerts** feed on the left:
     - **Riverside School Water Crisis:** Outbound dispatch was logged at 10:30 AM, but follow-up field report at 12:05 PM states *"Still no water at the shelter. Children are dehydrated and crying."*
     - **Central Hospital Insulin Deficit:** 50 vials needed; only 10 dispatched.
     - **St. Jude Infant Formula Crisis:** Dry raw grains sent where cooked meals and infant milk formula were urgently required.
   - Click **"View Evidence Timeline"** on any alert to view the chronological audit trail with exact quotes and Gemini's causal explanation!

4. **Smart Logistics Re-Routing:**
   - Click **"Re-dispatch"** on any active crisis alert.
   - The **Gemini Smart Logistics Re-routing Advisor** modal opens, comparing standard warehouse dispatch (sub-optimal, submerged routes) against dynamic re-routing from a surplus staging hub (saving 138 minutes).
   - Click **"Approve & Execute AI Re-route"** to dispatch the expedited response and observe the on-site resource meters immediately replenish.

5. **Interactive Tactical Views:**
   - **Geospatial Map:** Switch between sectors on Leaflet map with pulsing red pins. Click any pin to open the tactical drill-down drawer showing live resource meters and shelter capacity.
   - **Knowledge Graph:** Click the **"Knowledge Graph"** tab to see the relational network between Shelters, Needs, Dispatches, and dashed red `CONFLICTS_WITH` edges.

6. **Live Ingestion Test:**
   - Click **"Submit Report"** in the top navbar.
   - Type any natural language field report (English / Hindi / Hinglish) or click one of the quick presets to watch Gemini extract structured entities and re-evaluate contradictions in real time.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Core engine status & uptime healthcheck |
| `/api/stats` | `GET` | High-level metrics (unresolved, unverified, total reports) |
| `/api/alerts` | `GET` | Active & historical contradiction alerts |
| `/api/alerts/:id/resolve` | `POST` | Coordinator marks alert as verified & resolved |
| `/api/alerts/:id/reroute-plan` | `GET` | Gemini AI surplus-to-deficit re-routing comparison |
| `/api/alerts/:id/execute-reroute` | `POST` | Approves and authorizes the AI re-routing plan |
| `/api/alerts/:id/redispatch` | `POST` | Standard emergency re-dispatch dispatch log |
| `/api/shelters` | `GET` | Monitored disaster shelters with stock health & coordinates |
| `/api/reports` | `GET` | Ingested telemetry feed with filters and pagination |
| `/api/reports` | `POST` | Ingests raw unstructured text via Gemini extraction pipeline |
| `/api/graph` | `GET` | Nodes and semantic conflict edges for Vis-network |
| `/api/simulation/run` | `POST` | Resets state and ingests benchmark flood disaster scenario |

---

## 📂 Project Structure

```
ReliefGraph_AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Gemini AI client & DB connection (with memory fallback)
│   │   ├── models/          # Shelter, Need, Dispatch, Report, Alert models
│   │   ├── routes/          # Express API route endpoints
│   │   └── services/        # Extraction, Contradiction, Simulation, & Memory Store
│   ├── server.js            # Express server entry point
│   ├── Dockerfile           # Production container build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Map, Knowledge Graph, Drawer, Modals, Navbar, Alerts
│   │   ├── data/            # Fallback offline datasets
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx          # Tactical command center layout & state
│   │   └── main.jsx
│   ├── nginx.conf           # Reverse proxy configuration
│   ├── Dockerfile           # Multi-stage Vite + Nginx build
│   └── package.json
├── docker-compose.yml       # 1-click orchestration
├── .env.example             # Configuration template
└── README.md
```

---

## 🛠️ Technology Stack

- **AI & Reasoning:** Google Gemini API (`@google/genai` SDK, `gemini-3.8-flash` / `gemini-2.0-flash`), Causal Reasoning Pipelines
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Leaflet, React-Leaflet, Vis-network
- **Backend:** Node.js, Express.js, Mongoose, Resilient In-Memory Store Fallback
- **DevOps:** Docker, Docker Compose, Nginx Reverse Proxy
