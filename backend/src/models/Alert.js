import mongoose from 'mongoose';
import { createHybridModel, memoryStore } from '../services/memoryStore.js';

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },
    shelterName: { type: String, required: true },
    resourceCategory: {
      type: String,
      enum: ['WATER', 'FOOD', 'MEDICAL', 'BABY_CARE', 'SHELTER_EQUIPMENT', 'OTHER'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'WARNING', 'INFO'],
      default: 'CRITICAL',
    },
    conflictType: {
      type: String,
      enum: [
        'DELIVERY_CONTRADICTION', // Dispatched on paper, reported missing in reality
        'QUANTITY_MISMATCH',      // Dispatch fulfilled partially, marked complete erroneously
        'DEPLETION_SURGE',        // Previously resolved, but new surge exhausted it
        'UNMET_EMERGENCY',        // High urgency request without any dispatch
      ],
      required: true,
    },
    aiExplanation: { type: String, required: true },
    evidenceTimeline: [
      {
        formattedTime: { type: String },
        source: { type: String },
        quote: { type: String },
        badge: { type: String },
      },
    ],
    relatedReportIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
    status: {
      type: String,
      enum: ['ACTIVE_UNRESOLVED', 'RE_DISPATCHED', 'VERIFIED_RESOLVED'],
      default: 'ACTIVE_UNRESOLVED',
    },
  },
  { timestamps: true }
);

const MongooseAlert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
export const Alert = createHybridModel(MongooseAlert, memoryStore.alerts);
