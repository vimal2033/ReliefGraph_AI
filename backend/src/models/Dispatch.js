import mongoose from 'mongoose';

const dispatchSchema = new mongoose.Schema(
  {
    trackingCode: { type: String, required: true },
    shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },
    shelterName: { type: String, required: true },
    resourceCategory: {
      type: String,
      enum: ['WATER', 'FOOD', 'MEDICAL', 'BABY_CARE', 'SHELTER_EQUIPMENT', 'OTHER'],
      required: true,
    },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'units' },
    vehicleInfo: { type: String, default: 'Relief Van 04' },
    dispatchedAt: { type: Date, default: Date.now },
    formattedTime: { type: String },
    status: {
      type: String,
      enum: ['IN_TRANSIT', 'DELIVERED', 'CONTRADICTED_MISSING', 'DELAYED'],
      default: 'IN_TRANSIT',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Dispatch = mongoose.models.Dispatch || mongoose.model('Dispatch', dispatchSchema);
