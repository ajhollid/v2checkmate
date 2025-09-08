import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  organizationId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ organizationId: 1, name: 1 }, { unique: true });
teamSchema.index({ organizationId: 1 });

export const Team = mongoose.model<ITeam>("Team", teamSchema);
