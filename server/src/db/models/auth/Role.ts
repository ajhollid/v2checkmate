import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  teamId?: Types.ObjectId;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
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

roleSchema.index({ teamId: 1, name: 1 }, { unique: true });
roleSchema.index({ teamId: 1 });
roleSchema.index({ level: 1 });

export const Role = mongoose.model<IRole>("Role", roleSchema);
