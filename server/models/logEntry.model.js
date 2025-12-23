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
    logNumber: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    files: [
      {
        url: String,
        publicId: String,
        fileName: String,
        fileType: String,
      },
    ],
  },
  { timestamps: true }
);

const LogEntry = mongoose.models.logEntry || mongoose.model("logEntry", logEntrySchema);
export default LogEntry;