import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICheck extends Document {
  _id: Types.ObjectId;
  monitorId: Types.ObjectId;
  teamId?: Types.ObjectId;
  organizationId: Types.ObjectId;
  type: "http" | "https";
  status: "up" | "down";
  responseTime?: number; // in ms
  timings?: {
    start: Date;
    socket: Date;
    lookup: Date;
    connect: Date;
    secureConnect: Date;
    response: Date;
    end: Date;
    phases: {
      wait: number;
      dns: number;
      tcp: number;
      tls: number;
      request: number;
      firstByte: number;
      download: number;
      total: number;
    };
  };
  httpStatusCode?: number;
  errorMessage?: string;
  ack: boolean;
  ackAt?: Date;
  ackBy?: Types.ObjectId;
  expiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CheckSchema = new Schema<ICheck>(
  {
    monitorId: { type: Schema.Types.ObjectId, ref: "Monitor", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["http", "https"],
    },
    status: {
      type: String,
      required: true,
      enum: ["up", "down"],
    },
    responseTime: { type: Number },
    timings: {
      start: { type: Date },
      socket: { type: Date },
      lookup: { type: Date },
      connect: { type: Date },
      secureConnect: { type: Date },
      response: { type: Date },
      end: { type: Date },
      phases: {
        wait: { type: Number },
        dns: { type: Number },
        tcp: { type: Number },
        tls: { type: Number },
        request: { type: Number },
        firstByte: { type: Number },
        download: { type: Number },
        total: { type: Number },
      },
    },
    httpStatusCode: { type: Number },
    errorMessage: { type: String, trim: true },
    ack: { type: Boolean, required: true, default: false },
    ackAt: { type: Date },
    ackBy: { type: Schema.Types.ObjectId, ref: "User" },
    expiry: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30,
    },
  },
  { timestamps: true }
);

CheckSchema.index({ monitorId: 1 });
CheckSchema.index({ monitorId: 1, createdAt: -1 });
CheckSchema.index({ organizationId: 1 });
CheckSchema.index({ organizationId: 1, teamId: 1 });
CheckSchema.index({ organizationId: 1, status: 1 });
CheckSchema.index({ organizationId: 1, createdAt: -1 });
CheckSchema.index({ status: 1, ack: 1 });
CheckSchema.index({ ack: 1, ackAt: 1 });
CheckSchema.index({ expiry: 1 });
CheckSchema.index({ createdAt: -1 });

export const Check = mongoose.model<ICheck>("Check", CheckSchema);
