import mongoose from 'mongoose';
import { createHybridModel, memoryStore } from '../services/memoryStore.js';

const shelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, index: true },
    zone: { type: String, default: 'Central Flood Zone' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    capacity: { type: Number, default: 250 },
    currentHeadcount: { type: Number, default: 120 },
    contactPerson: { type: String, default: 'Field Coordinator' },
    phone: { type: String, default: '+91-98765-43210' },
    status: {
      type: String,
      enum: ['CRITICAL', 'WARNING', 'STABLE'],
      default: 'STABLE',
    },
    activeNeedsSummary: [{ type: String }],
    stockHealth: {
      water: { type: Number, default: 75 },
      food: { type: Number, default: 70 },
      medical: { type: Number, default: 80 },
      babyCare: { type: Number, default: 60 },
    },
  },
  { timestamps: true }
);

const MongooseShelter = mongoose.models.Shelter || mongoose.model('Shelter', shelterSchema);
export const Shelter = createHybridModel(MongooseShelter, memoryStore.shelters);
