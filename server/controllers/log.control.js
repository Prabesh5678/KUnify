import LogEntry from "../models/logEntry.model.js";
import Student from "../models/student.model.js";
import * as XLSX from "xlsx";

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
      teamId:student.teamId,
      week,
    });

    if (existingLog) {
      return res.json({
        success: false,
        message: `Log for week ${week} is already submitted`,
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

    if (log.isChecked) {
      return res.json({
        success: false,
        message: "This log has already been checked by your supervisor and cannot be edited",
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
    log.mark = null;
    log.correctionRequested = false;
    log.correctionNote = "";
    log.correctionRequestedBy = null;
    log.correctionRequestedAt = null;

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

    if (log.isChecked) {
      return res.json({
        success: false,
        message: "This log has already been checked by your supervisor and cannot be deleted",
      });
    }

    if (log.correctionRequested) {
      return res.json({
        success: false,
        message: "This log has a correction request and cannot be deleted",
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

// GET /api/log/export/:teamId
// GET /api/log/export/:teamId           → exports all team logs
// GET /api/log/export/:teamId?student=userId  → exports only that student's logs

export const exportTeamLogs = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { student } = req.query;

    // If student id is passed in query, filter by that student, otherwise get all team logs
    const filter = { teamId };
    if (student) filter.createdBy = student;

    const logs = await LogEntry.find(filter)
      .populate("createdBy", "name email")
      .populate("checkedBy", "name email")
      .populate("correctionRequestedBy", "name email")
      .populate("reviewTimeline.teacher", "name email")
      .sort({ week: 1 });

    if (!logs.length) {
      return res.json({ success: false, message: "No logs found" });
    }

    const formatDateTime = (value) =>
      value ? new Date(value).toLocaleString() : "";

    const getLatestCorrection = (timeline = []) =>
      [...timeline].reverse().find((item) => item.action === "correction_requested");

    const formatTimeline = (timeline = []) =>
      timeline
        .map((item, index) => {
          const when = formatDateTime(item.at);
          if (item.action === "checked") {
            const markText = item.mark === null || item.mark === undefined ? "" : `: ${item.mark}/5`;
            return `${index + 1}. ${when} - Checked${markText}`;
          }
          return `${index + 1}. ${when} - Correction requested${item.note ? `: ${item.note}` : ""}`;
        })
        .join("\n");

    const data = logs.map((log) => {
      const status = log.isChecked
        ? "Checked"
        : log.correctionRequested
          ? "Correction Requested"
          : "Not Checked";

      const latestCorrection = getLatestCorrection(log.reviewTimeline);

      return {
        Week: log.week,
        Date: new Date(log.date).toLocaleDateString(),
        Student: log.createdBy?.name || "Unknown",
        Email: log.createdBy?.email || "",
        Activity: log.activity,
        Outcome: log.outcome,
        Status: status,
        "Mark (0-5)": log.mark ?? "",
        "Checked At": formatDateTime(log.checkedAt),
        "Latest Correction Note": latestCorrection?.note || "",
        "Latest Correction At": formatDateTime(latestCorrection?.at),
        "Review Timeline": formatTimeline(log.reviewTimeline),
      };
    });

    // Create the Excel file
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logsheet");

    // Set column widths so it looks nice when opened
    worksheet["!cols"] = [
      { wch: 8 },  // Week
      { wch: 14 }, // Date
      { wch: 22 }, // Student
      { wch: 28 }, // Email
      { wch: 35 }, // Activity
      { wch: 35 }, // Outcome
      { wch: 22 }, // Status
      { wch: 12 }, // Mark
      { wch: 22 }, // Checked At
      { wch: 35 }, // Latest Correction Note
      { wch: 24 }, // Latest Correction At
      { wch: 70 }, // Review Timeline
    ];

    // Convert to a downloadable file buffer and send
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", `attachment; filename="logsheet.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(buffer);

  } catch (error) {
    console.error(error.stack);
    return res.json({ success: false, message: "Failed to export logs" });
  }
};
