/*import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: null,
    },

    semester: {
      type: String,
      default: null,
    },

    rollNumber: {
      type: String,
      default: null,
    },

    subjectCode: {
      type: String,
      default: null,
    },

   

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      default: null,
    },

    lastTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      default: null,
    },

    isTeamLeader: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Student =
  mongoose.models.student || mongoose.model("student", studentSchema);

export default Student;
*/
// models/student.model.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: null,
    },

    semester: {
      type: String,
      default: null,
    },

    rollNumber: {
      type: String,
      default: null,
    },

    subjectCode: {
      type: String,
      default: null,
    },

    /* ---------- TEAM RELATED ---------- */

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      default: null,
    },

    lastTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
      default: null,
    },

    isTeamLeader: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    /* ---------- PROPOSAL RELATED ---------- */

    proposalStatus: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected'],
      default: 'pending'
    },

    projectTitle: {
      type: String,
      default: ""
    },

    projectAbstract: {
      type: String,
      default: ""
    },

    keywords: [{
      type: String
    }],

    proposalFile: {
      public_id: {
        type: String,
        default: ""
      },
      url: {
        type: String,
        default: ""
      }
    },

    proposalSubmittedAt: {
      type: Date
    },

    proposalFeedback: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const Student =
  mongoose.models.student || mongoose.model("student", studentSchema);

export default Student;