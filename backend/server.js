import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { ensureDefaultShelters } from './src/services/matchingService.js';
import { runFullSimulation } from './src/services/simulationService.js';
import apiRoutes from './src/routes/api.js';
import { Shelter } from './src/models/Shelter.js';
import { Report } from './src/models/Report.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'ReliefGraph AI Core Engine',
    timestamp: new Date().toISOString(),
  });
});

// Main API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

async function startServer() {
  const isDbConnected = await connectDB();

  if (isDbConnected) {
    try {
      await ensureDefaultShelters();
      const reportCount = await Report.countDocuments();
      if (reportCount === 0) {
        console.log('[Server Startup] Ingesting initial flood scenario data...');
        await runFullSimulation();
      }
    } catch (e) {
      console.warn('[Server Startup] Warning during initial seed:', e.message);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` ReliefGraph AI Server running on http://0.0.0.0:${PORT}`);
    console.log(` Ready for Google Gemini Hackathon (Society & Well-being)`);
    console.log(`=======================================================`);
  });
}

startServer();
