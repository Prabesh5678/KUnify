import LogEntry from "../models/logEntry.model.js";
import Student from "../models/student.model.js";

// POST /api/log/create
export const addLog = async (req, res) => {
  try {
    const { date, week, activity, outcome } = req.body;
    const studentId = req.studentId;

    if (!date || !week || !activity || !outcome || !studentId) {
      return res.json({
        success: false,
        message: "Please provide all fields",
      });
    }

    const student = await Student.findById(studentId);
    if (!student || !student.teamId) {
      return res.json({ success: false, message: "Team not found" });
    }

    const log = await LogEntry.create({
      date,
      week,
      activity,
      outcome,
      createdBy: studentId,
      teamId: student.teamId,
      logNumber: 1, // demo
    });

    return res.json({ success: true, log });
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// GET /api/log/user/:userId
export const getMyLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const studentId = req.studentId;

    if (!userId || userId !== studentId) {
      return res.json({ success: false, message: "Invalid user" });
    }

    const student = await Student.findById(studentId);
    if (!student || !student.teamId) {
      return res.json({ success: false, message: "Team not found" });
    }

    const logs = await LogEntry.find({
      createdBy: studentId,
      teamId: student.teamId,
    });

    return res.json({ success: true, logs });
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// GET /api/log/team/:teamId
export const getTeamLogs = async (req, res) => {
  try {
    const { teamId } = req.params;
    const studentId = req.studentId;

    const student = await Student.findById(studentId);
    if (!student || student.teamId.toString() !== teamId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const logs = await LogEntry.find({ teamId }).populate("createdBy");

    return res.json({ success: true, logs });
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};
