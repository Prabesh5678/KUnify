import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import {
  createLog,
  getTeamLogs,
  getSingleLog,
  updateLog,
  deleteLog,
  deleteLogFile,
} from "../controllers/log.control.js";
import { uploadMultiple } from "../utils/upload.utils.js";

const logRouter = express.Router();

// Create log with file upload
logRouter.post(
  "/",
  authStudent,
  uploadMultiple,
  createLog
);

// Get all logs for a team
//logRouter.get("/team/:teamId", authStudent, getTeamLogs);
logRouter.get("/team", authStudent, getTeamLogs);

// Get single log
logRouter.get("/:logId", authStudent, getSingleLog);

// Update log with optional file upload
logRouter.put(
  "/:logId",
  authStudent,
  uploadMultiple,
  updateLog
);

// Delete log
logRouter.delete("/:logId", authStudent, deleteLog);

// Delete specific file from log
logRouter.delete("/file/:logId/:fileId", authStudent, deleteLogFile);

export default logRouter;