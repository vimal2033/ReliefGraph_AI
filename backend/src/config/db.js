import mongoose from 'mongoose';

export async function connectDB() {
  mongoose.set('bufferCommands', false);

  const envUri = process.env.MONGO_URI;
  const urisToTry = [];
  
  if (envUri) {
    urisToTry.push(envUri);
  }
  if (!urisToTry.includes('mongodb://127.0.0.1:27017/reliefgraph')) {
    urisToTry.push('mongodb://127.0.0.1:27017/reliefgraph');
  }

  for (const uri of urisToTry) {
    try {
      console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 600,
      });
      console.log('[DB] MongoDB Connected Successfully.');
      return true;
    } catch (err) {
      console.warn(`[DB] Could not connect to ${uri}: ${err.message}`);
    }
  }

  console.log('[DB] Operating in resilient memory mode (zero-dependency local storage).');
  return false;
}
