import mongoose from 'mongoose';

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/reliefgraph';
  
  console.log(`[DB] Attempting connection to MongoDB at: ${mongoURI}`);

  // Max connection retry loop for docker compose readiness
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[DB] MongoDB Connected Successfully.');
      return true;
    } catch (err) {
      retries -= 1;
      console.warn(`[DB] Connection attempt failed (${5 - retries}/5): ${err.message}`);
      if (retries === 0) {
        console.error('[DB] Could not connect to MongoDB after retries. Operating in hybrid memory-cache mode.');
        return false;
      }
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  return false;
}
