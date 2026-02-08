import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 6,
    },
    subject: {
      type: String,
      required: true,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "proposal",
      default: null,
    },
    supervisorStatus: { type: String, default: "pending" }, // notapproved,pending,teacherApproved,adminApproved
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'teacher', default: null },
  },
  { timestamps: true },
);

const Team = mongoose.models.team || mongoose.model("team", teamSchema);

export default Team;
