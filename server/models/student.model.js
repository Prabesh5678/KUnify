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
    department: { type: String },
    semester: { type: Number },
    rollNumber: { type: Number },
  },
  { timestamps: true }
);

const Student = mongoose.models.student || mongoose.model('student', studentSchema);

export default Student;