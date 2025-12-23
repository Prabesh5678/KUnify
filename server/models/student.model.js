import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
    avatar: {
      type: String,
      default: "",
    },
    department: { type: String,  default: null },
    semester: { type: String,  default: null },
    rollNumber: { type: String,  default: null },
    subjectCode: { type: String,  default: null },

    teamId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'team', 
  default: null 
},
isTeamLeader: { 
  type: Boolean, 
  default: false 
},
isApproved:{type:Boolean,default:false}
  },

  { timestamps: true }
);

const Student = mongoose.models.student || mongoose.model('student', studentSchema);

export default Student;