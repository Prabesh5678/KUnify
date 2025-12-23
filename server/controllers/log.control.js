import mongoose from "mongoose";
import LogEntry from "../models/logEntry.model.js";
import MemberContribution from "../models/memberContribution.model.js";
import Team from "../models/team.model.js";
import Student from "../models/student.model.js";
import { deleteCloudinaryFile } from "../utils/upload.utils.js";

/*  HELPER FUNCTIONS */
const getStudent = async (studentId) => {
  return await Student.findById(studentId);
};

const checkTeamAccess = async (student, teamId) => {
  if (!student || student.teamId?.toString() !== teamId) {
    throw new Error("Access denied!");
  }
};

const getNextLogNo = async (teamId) => {
  const lastLog = await LogEntry.findOne({ teamId }).sort({ logNumber: -1 });
  return lastLog ? lastLog.logNumber + 1 : 1;
};

/*  CREATE LOG */
export const createLog = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { date, teamEntries } = req.body;
    
    // Validation
    if (!date || !teamEntries) {
      return res.json({ success: false, message: "Missing required fields" });
    }
    
    const student = await getStudent(req.studentId);
    if (!student.teamId || !student.isApproved) {
      return res.json({ success: false, message: "Not in approved team" });
    }
    
    // Create log
    const nextNo = await getNextLogNo(student.teamId);
    const log = await LogEntry.create([{
      teamId: student.teamId,
      date: new Date(date),
      logNumber: nextNo,
      createdBy: req.studentId,
      files: req.files?.map(f => ({
        url: f.path,
        publicId: f.filename,
        fileName: f.originalname,
        fileType: f.mimetype,
      })) || [],
    }], { session });
    
    // Add member contributions
    for (const entry of teamEntries) {
      const member = await Student.findOne({
        name: entry.name,
        teamId: student.teamId,
      }).session(session);
      
      if (!member) continue;
      
      await MemberContribution.create([{
        logId: log[0]._id,
        memberId: member._id,
        activity: entry.activity,
        outcome: entry.outcome,
      }], { session });
    }
    
    await session.commitTransaction();
    
    res.json({
      success: true,
      message: `LOG-${nextNo} created!`,
      logNumber: nextNo,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.json({ success: false, message: "Failed to create log" });
  } finally {
    session.endSession();
  }
};

/*  GET TEAM LOGS  */
export const getTeamLogs = async (req, res) => {
  try {
    const { teamId } = req.params;
    const student = await getStudent(req.studentId);
    
    await checkTeamAccess(student, teamId);
    
    const logs = await LogEntry.find({ teamId })
      .sort({ logNumber: -1 })
      .populate("createdBy", "name email");
    
    const result = [];
    for (const log of logs) {
      const contributions = await MemberContribution.find({ logId: log._id })
        .populate("memberId", "name email");
      
      result.push({
        logName: `LOG-${log.logNumber}`,
        date: log.date.toISOString().split("T")[0],
        teamEntries: contributions.map(c => ({
          name: c.memberId.name,
          activity: c.activity,
          outcome: c.outcome,
        })),
      });
    }
    
    res.json({ success: true, logs: result });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to fetch logs" });
  }
};

/* GET SINGLE LOG */
export const getSingleLog = async (req, res) => {
  try {
    const log = await LogEntry.findById(req.params.logId)
      .populate("teamId", "name")
      .populate("createdBy", "name");
    
    if (!log) {
      return res.json({ success: false, message: "Log not found" });
    }
    
    const student = await getStudent(req.studentId);
    await checkTeamAccess(student, log.teamId._id);
    
    const contributions = await MemberContribution.find({ logId: log._id })
      .populate("memberId", "name email");
    
    res.json({
      success: true,
      log: {
        logName: `LOG-${log.logNumber}`,
        date: log.date.toISOString().split("T")[0],
        teamName: log.teamId.name,
        teamEntries: contributions.map(c => ({
          name: c.memberId.name,
          activity: c.activity,
          outcome: c.outcome,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to fetch log" });
  }
};

/*  UPDATE LOG  */
export const updateLog = async (req, res) => {
  try {
    const log = await LogEntry.findById(req.params.logId);
    if (!log) {
      return res.json({ success: false, message: "Log not found" });
    }
    
    // Check permission
    if (log.createdBy.toString() !== req.studentId.toString()) {
      return res.json({ success: false, message: "Only creator can update" });
    }
    
    // Update date if provided
    if (req.body.date) {
      log.date = new Date(req.body.date);
    }
    
    await log.save();
    res.json({ success: true, message: "Log updated" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to update" });
  }
};

/*  DELETE LOG  */
export const deleteLog = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const log = await LogEntry.findById(req.params.logId).session(session);
    if (!log) {
      return res.json({ success: false, message: "Log not found" });
    }
    
    // Check permission
    const student = await getStudent(req.studentId);
    const team = await Team.findById(log.teamId).session(session);
    
    const canDelete = 
      log.createdBy.toString() === req.studentId.toString() ||
      team.leaderId.toString() === req.studentId.toString();
    
    if (!canDelete) {
      return res.json({ success: false, message: "Not allowed" });
    }
    
    // Delete files from Cloudinary
    if (log.files?.length > 0) {
      for (const file of log.files) {
        await deleteCloudinaryFile(file.publicId);
      }
    }
    
    // Delete from DB
    await MemberContribution.deleteMany({ logId: log._id }).session(session);
    await LogEntry.findByIdAndDelete(log._id).session(session);
    
    await session.commitTransaction();
    res.json({ success: true, message: "Log deleted" });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.json({ success: false, message: "Failed to delete" });
  } finally {
    session.endSession();
  }
};

/* ======== DELETE FILE ======== */
export const deleteLogFile = async (req, res) => {
  try {
    const log = await LogEntry.findById(req.params.logId);
    if (!log) {
      return res.json({ success: false, message: "Log not found" });
    }
    
    // Find file
    const file = log.files.id(req.params.fileId);
    if (!file) {
      return res.json({ success: false, message: "File not found" });
    }
    
    // Delete from Cloudinary and DB
    await deleteCloudinaryFile(file.publicId);
    log.files.pull(req.params.fileId);
    await log.save();
    
    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Failed to delete file" });
  }
};