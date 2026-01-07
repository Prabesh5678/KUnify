import mongoose from "mongoose";
import LogEntry from "../models/logEntry.model.js";
import MemberContribution from "../models/memberContribution.model.js";
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import { deleteCloudinaryFile } from "../utils/upload.utils.js";

// post /api/log/create
export const addLog = async (req, res) => {
  try {
    const { date, activity, outcome } = req.body;
    const studentId = req.studentId;
    if (!date || !activity || !outcome || !studentId)
      return res.json({ success: false, message: "Please provide all feilds" });
    const student = await Student.findById(studentId);
    if(!student||!student.teamId) return res.json({success:false,message:"team not found"})
    const log= await LogEntry.create({
      date,
      activity,
      outcome,
      createdBy: studentId,
      teamId:student.teamId,
      logNumber:1//for demo
    });
    return res.json({success:true,message:'Log added successfully',log})

  } catch (error) {
    console.error(error.stack)
    return res.json({success:false,message:"Internal Server Error!"})
  }
};

//get /api/log/user/:userId

export const getMyLogs=async (req,res) => {
  try {
    const {userId}=req.params;
    const studentId =req.studentId;
    if(!userId||!studentId||userId!==studentId)
      return res.json({success:false,message:"Error with user!"})
    const student =await Student.findById(studentId);
    if(!student||!student.teamId)
      return res.json({success:false,message:"Unable to find team"})
    const teamId=student.teamId.toString();
    const logs= await LogEntry.find({createdBy:studentId,teamId})
    if(!logs.length)
      return res.json({success:false,message:"Unable to find logs!"})
    return res.json({success:true,logs})

  } catch (error) {
    console.error(error.stack)
    return res.json({success:false,message:"Internal Server Error!"})
  }
}
//get /api/log/team/:teamId

export const getTeamLogs=async (req,res) => {
  try {
    const {teamId}=req.params;
    const studentId =req.studentId;
    if(!teamId||!studentId)
      return res.json({success:false,message:"Error with user!"})
    const student =await Student.findById(studentId);

    if(!student||!student.teamId||!student.teamId.toString()===teamId)
      return res.json({success:false,message:"Unable to find team"})
    
    const logs= await LogEntry.find({teamId}).populate('createdBy')
    if(!logs.length)
      return res.json({success:false,message:"Unable to find logs!"})
    return res.json({success:true,logs})

  } catch (error) {
    console.error(error.stack)
    return res.json({success:false,message:"Internal Server Error!"})
  }
}