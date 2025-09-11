import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index({ name: 1 }, { unique: true });

export const Team = mongoose.model<ITeam>("Team", teamSchema);
