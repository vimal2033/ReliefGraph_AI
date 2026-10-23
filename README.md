# ReliefGraph AI — Disaster Relief Coordination System
> **Google Gemini Hackathon 2026** • Track: *Society & Well-being*  
> **Team Name:** Cipher (BIT Durg)  
> **Team Members:** Vimal Mishra (Leader), Ritu Mishra (Designer)

---

## 🎯 The Problem
During disasters (floods, cyclones), conventional dashboards suffer from a fatal blindspot:
1. When supplies are sent, they are prematurely marked as **"Dispatched = Fulfilled"**.
2. If the transport breaks down or delivers to the wrong depot, subsequent cries for help from the ground are buried in noisy chat feeds.
3. **ReliefGraph** uses **Google Gemini** to continuously cross-examine delivery records against real-time field reports, instantly flagging **unverified deliveries, quantity deficits, and conflicting logs** with clickable evidence timelines.

---

## 🚀 Quick Start (Dockerized)

Ensure **Docker Desktop** is running, then in the project root folder run:

```bash
docker compose up -d
```

That's it! Docker Compose will automatically spin up:
- **MongoDB** container (`reliefgraph-mongodb`) on port `27017` with automatic health checks.
- **ReliefGraph Backend** (`reliefgraph-backend`) on port `5000` with Gemini reasoning engine.
- **ReliefGraph Frontend** (`reliefgraph-frontend`) on port `3000` with Nginx reverse proxy.

### Access the Application:
- 🌐 **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- 🔌 **API Health:** [http://localhost:5000/health](http://localhost:5000/health)

---

## ⚙️ Configuration (.env)

Open `.env` in the root folder and set your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5000
MONGO_URI=mongodb://mongodb:27017/reliefgraph
GEMINI_MODEL=gemini-2.5-flash
```
*(Note: If you don't provide an API key, ReliefGraph includes an intelligent heuristic fallback parser that keeps 100% of the demo operational!)*

---

## 🏆 Presentation & Live Demo Walkthrough (for Judges)

1. **Dashboard Overview:**
   - Open `http://localhost:3000`.
   - Observe the top 4 KPI cards: **Unresolved Needs**, **Unverified Deliveries**, **Resolved Cases**, **Disaster Reports Ingested**.

2. **1-Click Flood Scenario Loader:**
   - Click the orange **"Run Simulation"** button in the top navbar.
   - The system resets and ingests 35+ realistic flood reports across 5 sectors (Riverside School, Central Hospital, St. Jude Community Hall, East Embankment, Nehru Stadium).

3. **Flagship Gemini Contradiction Alerts:**
   - Look at the **Priority Contradiction Alerts** feed on the left:
     - **Riverside School Water Crisis:** Delivery of 20 water cans logged at 10:30 AM, but follow-up report at 12:05 PM states *"Still no water, children dehydrated"*.
     - **Central Hospital Insulin Deficit:** 50 vials needed; only 10 dispatched.
   - Click **"View Evidence Timeline"** on any alert to show judges the chronological evidence chain with exact quotes and Gemini's causal explanation!

4. **Interactive Tactical Views:**
   - **Geospatial Map:** Switch between sectors on Leaflet map with pulsing red pins. Click pins to view on-site headcount and active shortages.
   - **Knowledge Graph:** Click the **"Knowledge Graph"** tab to see the visual relationship network between Shelters, Needs, Dispatches, and dashed red `CONFLICTS_WITH` edges!

5. **Live Ingestion Test:**
   - Click **"Submit Report"** in the top navbar.
   - Type any natural language message or click one of the quick presets to watch Gemini extract entities and recalculate conflicts in real-time!

---

## 💻 Local Development (Without Docker)

If you wish to run without Docker:

```bash
# 1. Start Backend
cd backend
npm install
npm run dev

# 2. Start Frontend (in separate terminal)
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).
