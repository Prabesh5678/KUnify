import mongoose from "mongoose";

const logEntrySchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    week: {
      type: String, // e.g. "Week 1", "Week 2"
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    outcome: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const LogEntry =
  mongoose.models.logEntry || mongoose.model("logEntry", logEntrySchema);

export default LogEntry;
