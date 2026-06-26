import mongoose from "mongoose";

const teacherProjectSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    technologies: [String],

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

const TeacherProject =
  mongoose.models.teacherProject ||
  mongoose.model("teacherProject", teacherProjectSchema);

export default TeacherProject;