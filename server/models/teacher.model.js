import mongoose from "mongoose";
 
const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId:{type:String,unique:true,sparse:true},
  phone:{type:String,unique:true,sparse:true},
  specialization:{type:String,default:null},
   isProfileCompleted: {
    type: Boolean,
    default: false,
  },
});

const Teacher = mongoose.models.teacher || mongoose.model('teacher', teacherSchema);

export default Teacher;