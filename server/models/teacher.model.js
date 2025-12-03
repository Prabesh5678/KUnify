import mongoose from "mongoose";
 
const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  number: {type: String, required: true}
});

const Teacher = mongoose.models.teacher || mongoose.model('teacher', teacherSchema);

export default Teacher;