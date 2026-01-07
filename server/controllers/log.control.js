import LogEntry from "../models/logEntry.model.js";
import Student from "../models/student.model.js";

// POST /api/log/create
export const addLog = async (req, res) => {
  try {
    const { date, week, activity, outcome } = req.body;
    const studentId = req.studentId;

    if (!date || !week || !activity || !outcome) {
      return res.json({
        success: false,
        message: "Please provide all fields",
      });
    }

    const student = await Student.findById(studentId);
    if (!student || !student.teamId) {
      return res.json({ success: false, message: "Team not found" });
    }

    // Prevent duplicate week
    const existingLog = await LogEntry.findOne({
      createdBy: studentId,
      week,
    });

    if (existingLog) {
      return res.json({
        success: false,
        message: `Log for ${week} is already submitted`,
      });
    }

    const log = await LogEntry.create({
      date,
      week,
      activity,
      outcome,
      createdBy: studentId,
      teamId: student.teamId,
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

    if (userId !== studentId) {
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

// PUT /api/log/update/:logId
export const updateLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const studentId = req.studentId;
    const { date, week, activity, outcome } = req.body;

    if (!date || !week || !activity || !outcome) {
      return res.json({
        success: false,
        message: "Please provide all fields",
      });
    }

    const log = await LogEntry.findById(logId);
    if (!log) {
      return res.json({
        success: false,
        message: "Log not found",
      });
    }

    // Only creator can edit
    if (log.createdBy.toString() !== studentId) {
      return res.json({
        success: false,
        message: "You are not allowed to edit this log",
      });
    }

    //  Prevent duplicate week when editing
    if (log.week !== week) {
      const existingLog = await LogEntry.findOne({
        createdBy: studentId,
        week,
      });

      if (existingLog) {
        return res.json({
          success: false,
          message: `Log for ${week} is already submitted`,
        });
      }
    }

    log.date = date;
    log.week = week;
    log.activity = activity;
    log.outcome = outcome;

    await log.save();

    return res.json({
      success: true,
      message: "Log updated successfully",
      log,
    });
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// DELETE /api/log/delete/:logId
export const deleteLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const studentId = req.studentId;

    const log = await LogEntry.findById(logId);
    if (!log) {
      return res.json({
        success: false,
        message: "Log not found",
      });
    }

    //  Only creator can delete
    if (log.createdBy.toString() !== studentId) {
      return res.json({
        success: false,
        message: "You are not allowed to delete this log",
      });
    }

    await LogEntry.findByIdAndDelete(logId);

    return res.json({
      success: true,
      message: "Log deleted successfully",
    });
  } catch (error) {
    console.error(error.stack);
    return res.json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};
