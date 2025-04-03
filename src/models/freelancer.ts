import mongoose from "mongoose";

export interface IFreelancer {
  id: string;
  email: string;
}

const freelancerSchema = new mongoose.Schema<IFreelancer>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indices for common queries
freelancerSchema.index({ email: 1 }, { unique: true });

export const Freelancer =
  mongoose.models.Freelancer ||
  mongoose.model<IFreelancer>("Freelancer", freelancerSchema);
