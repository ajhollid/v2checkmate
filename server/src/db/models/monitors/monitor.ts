import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMonitor extends Document {
  _id: Types.ObjectId;
  name: string;
  url: string;
  type: "http" | "https";
  interval: number; // in ms
  isActive: boolean;
  status: "up" | "down" | "paused" | "initializing";
  lastCheckedAt?: Date;
  teamId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MonitorSchema = new Schema<IMonitor>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    url: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["http", "https"],
    },
    interval: { type: Number, required: true, default: 60000 },
    isActive: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      required: true,
      default: "initializing",
      enum: ["up", "down", "paused", "initializing"],
    },
    lastCheckedAt: { type: Date },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

MonitorSchema.index({ organizationId: 1 });
MonitorSchema.index({ organizationId: 1, teamId: 1 });
MonitorSchema.index({ organizationId: 1, isActive: 1 });
MonitorSchema.index({ organizationId: 1, status: 1 });
MonitorSchema.index({ organizationId: 1, type: 1 });
MonitorSchema.index({ lastCheckedAt: 1 });
MonitorSchema.index({ isActive: 1, status: 1 });
MonitorSchema.index({ createdBy: 1 });
MonitorSchema.index({ updatedBy: 1 });

export const Monitor = mongoose.model<IMonitor>("Monitor", MonitorSchema);
