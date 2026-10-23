# Deployment & Operations Guide

**System:** ReliefGraph AI  
**Environments:** Local Offline Development, Docker Multi-Container Compose, Production VPS / Cloud  

---

## 1. Prerequisites

*   **Node.js:** v18.0.0 or higher (v20+ recommended)
*   **npm:** v9.0.0 or higher
*   **Docker & Docker Compose (Optional):** Docker Desktop 4.20+ or Docker Engine 24+
*   **Google Gemini API Key (Optional):** Required for online LLM extraction; platform automatically falls back to internal heuristics if omitted.

---

## 2. Quick Local Setup (Zero-Docker / Standalone)

ReliefGraph AI contains an in-memory storage engine. You do **not** need to install or run MongoDB to run the project locally.

### Step 1: Clone Repository
```bash
git clone https://github.com/vimal2033/ReliefGraph_AI.git
cd ReliefGraph_AI
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/reliefgraph
GEMINI_MODEL=gemini-3.8-flash
# Optional: Add GEMINI_API_KEY if available
GEMINI_API_KEY=
```

### Step 3: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 4: Run Services
Open two terminal windows:

*   **Terminal 1 (Backend):**
    ```bash
    cd backend
    npm run dev
    ```
    *Output:*
    ```
    ReliefGraph AI backend running on http://localhost:5000
    [INFO] Using In-Memory Database (zero-dependency standalone mode).
    [SEED] Initialized 5 shelters, 10 benchmark reports, 3 dispatches, 4 alerts.
    ```

*   **Terminal 2 (Frontend):**
    ```bash
    cd frontend
    npm run dev
    ```
    *Output:*
    ```
    VITE v6.x.x ready in 250 ms
    ➜  Local:   http://localhost:5173/
    ```

Open your browser at `http://localhost:5173`.

---

## 3. Docker Compose Deployment (Production / Staging)

To deploy the full multi-tier production stack with MongoDB and Nginx reverse proxy:

### Step 1: Build and Launch Containers
From the root directory:
```bash
docker compose up --build -d
```

### Step 2: Verify Running Containers
```bash
docker compose ps
```
Expected output:
```
NAME                      IMAGE                      STATUS         PORTS
reliefgraph-frontend-1    reliefgraph_ai-frontend    Up             0.0.0.0:80->80/tcp
reliefgraph-backend-1     reliefgraph_ai-backend     Up             0.0.0.0:5000->5000/tcp
reliefgraph-mongo-1       mongo:7.0                  Up (healthy)   0.0.0.0:27017->27017/tcp
```

### Step 3: Access Application
*   **Web Application (Nginx):** `http://localhost`
*   **Backend Direct:** `http://localhost:5000/health`
*   **MongoDB Admin (Local Port):** `mongodb://localhost:27017`

---

## 4. Operational Health Checks & Verification

### 4.1 Automated Health Ping
```bash
curl -f http://localhost:5000/health
```

### 4.2 Verify Benchmark Simulation
To reload fresh benchmark disaster reports and reset all shelter occupancy levels:
```bash
curl -X POST http://localhost:5000/api/simulation/reset
```

### 4.3 Container Logs Inspection
```bash
# View backend logs
docker compose logs -f backend

# View frontend / Nginx logs
docker compose logs -f frontend
```

---

## 5. Teardown & Maintenance

```bash
# Stop containers without losing database volume
docker compose down

# Stop containers and remove persistent MongoDB volume
docker compose down -v
```
