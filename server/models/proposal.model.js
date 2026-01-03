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
    // submittedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "student",
    //   required: true,
    // },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("proposal", proposalSchema);
