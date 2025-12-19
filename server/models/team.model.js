import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 5,
      maxlength: 5
    },
    subject: {
      type: String,
      required: true
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }],
    maxMembers: {
      type: Number,
      default: 4
    }
  },
  { timestamps: true }
);

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

export default Team;