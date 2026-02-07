import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  specialization: { type: String, default: null },
  isProfileCompleted: {
    type: Boolean,
    default: false,
  },
   activeStatus: {
    type: Boolean,  //leave it for admin
    default: false,//remember to make it false after making admin
  },
  maxCount:{type:Number,default:5},
  activeCount:{type:Number,default:0},
  pendingTeams:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'team'
  }],
  approvedTeams:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'team'
  }],
  assignedTeams:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'team'
  }],
  password: { type: String, sparse: true ,select:false} ,
});

const Teacher =
  mongoose.models.teacher || mongoose.model("teacher", teacherSchema);

export default Teacher;
