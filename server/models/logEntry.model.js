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
    isChecked: {
      type: Boolean,
      default: false,
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      default: null,
    },
    checkedAt: {
      type: Date,
      default: null,
    },
    mark: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    correctionRequested: {
      type: Boolean,
      default: false,
    },
    correctionNote: {
      type: String,
      default: "",
      trim: true,
    },
    correctionRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      default: null,
    },
    correctionRequestedAt: {
      type: Date,
      default: null,
    },
    reviewTimeline: [
      {
        action: {
          type: String,
          enum: ["correction_requested", "checked"],
          required: true,
        },
        note: {
          type: String,
          default: "",
          trim: true,
        },
        mark: {
          type: Number,
          min: 0,
          max: 5,
          default: null,
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "teacher",
          default: null,
        },
        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const LogEntry =
  mongoose.models.logEntry || mongoose.model("logEntry", logEntrySchema);

export default LogEntry;
