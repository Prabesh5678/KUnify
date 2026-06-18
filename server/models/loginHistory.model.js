import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  loginAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("LoginHistory", loginHistorySchema);