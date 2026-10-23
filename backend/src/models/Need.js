import mongoose from 'mongoose';
import { createHybridModel, memoryStore } from '../services/memoryStore.js';

const needSchema = new mongoose.Schema(
  {
    shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },
    shelterName: { type: String, required: true },
    resourceCategory: {
      type: String,
      enum: ['WATER', 'FOOD', 'MEDICAL', 'BABY_CARE', 'SHELTER_EQUIPMENT', 'OTHER'],
      required: true,
    },
    itemDescription: { type: String },
    quantityRequested: { type: Number, default: 0 },
    quantityDelivered: { type: Number, default: 0 },
    unit: { type: String, default: 'units' },
    urgency: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    status: {
      type: String,
      enum: ['OPEN', 'PARTIALLY_MET', 'RESOLVED', 'CONTRADICTION_FLAGGED'],
      default: 'OPEN',
    },
    initialReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
    linkedDispatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dispatch' }],
    timeline: [
      {
        timestamp: { type: Date, default: Date.now },
        formattedTime: { type: String },
        eventType: { type: String }, // 'REQUEST_CREATED', 'DISPATCH_SENT', 'UNMET_REPORTED', 'RESOLVED'
        description: { type: String },
        sourceQuote: { type: String },
        author: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const MongooseNeed = mongoose.models.Need || mongoose.model('Need', needSchema);
export const Need = createHybridModel(MongooseNeed, memoryStore.needs);
