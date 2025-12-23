import mongoose from "mongoose";

const memberContributionSchema = new mongoose.Schema(
  {
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "logEntry",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    activity: {
      type: String,
      required: true,
      trim: true,
    },
    outcome: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create compound index for faster queries
memberContributionSchema.index({ logId: 1, memberId: 1 }, { unique: true });

const MemberContribution = mongoose.models.memberContribution || 
  mongoose.model("memberContribution", memberContributionSchema);

export default MemberContribution;