import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    projectTitle: {
      type: String,
      required: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    projectKeyword: {
      type: String,
      required: true,
    },
    proposalFile: {
      url: String,
      publicId: String,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Proposal", proposalSchema);
