import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    rawText: { type: String, required: true },
    source: {
      type: String,
      enum: ['VOLUNTEER', 'SHELTER_MANAGER', 'DISPATCHER', 'COMMUNITY', 'OFFICIAL_LOG'],
      default: 'VOLUNTEER',
    },
    senderName: { type: String, default: 'Field Contributor' },
    timestamp: { type: Date, default: Date.now },
    formattedTime: { type: String }, // e.g., "10:24 AM"
    
    // Gemini Extracted Metadata
    extracted: {
      location: { type: String },
      matchedShelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
      matchedShelterName: { type: String },
      resourceCategory: {
        type: String,
        enum: ['WATER', 'FOOD', 'MEDICAL', 'BABY_CARE', 'SHELTER_EQUIPMENT', 'OTHER'],
        default: 'OTHER',
      },
      itemDescription: { type: String },
      quantity: { type: Number, default: 0 },
      unit: { type: String, default: 'units' },
      isDispatch: { type: Boolean, default: false },
      urgency: {
        type: String,
        enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
        default: 'MEDIUM',
      },
      sentiment: { type: String },
      confidenceScore: { type: Number, default: 0.95 },
    },
    status: {
      type: String,
      enum: ['PROCESSED', 'FLAGGED_CONFLICT', 'VERIFIED'],
      default: 'PROCESSED',
    },
  },
  { timestamps: true }
);

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
