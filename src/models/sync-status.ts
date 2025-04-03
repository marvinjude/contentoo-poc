import { model, models } from "mongoose";
import mongoose from "mongoose";

export enum SyncStatusType {
  INPROGRESS = "INPROGRESS",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
}

export interface ISyncStatus {
  id: string;
  connectionId: string;
  status: SyncStatusType;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  totalItems?: number;
}

const syncStatusSchema = new mongoose.Schema<ISyncStatus>(
  {
    connectionId: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(SyncStatusType),
    },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    error: { type: String },
    totalItems: { type: Number },
  },
  {
    timestamps: true,
  }
);

if (models && models.SyncStatus) {
  delete models.SyncStatus;
}

export const SyncStatus = model<ISyncStatus>("SyncStatus", syncStatusSchema);
