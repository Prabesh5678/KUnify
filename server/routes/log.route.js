import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import {
  addLog,
  getMyLogs,
  getTeamLogs,
  deleteLog,
} from "../controllers/log.control.js";

const logRouter = express.Router();

// Create log
logRouter.post(
  "/create",
  authStudent,
  addLog
);

// Get my logs
logRouter.get(
  "/user/:userId",
  authStudent,
  getMyLogs
);

// Get team logs
logRouter.get(
  "/team/:teamId",
  authStudent,
  getTeamLogs
);

// Delete log
logRouter.delete(
  "/:logId",
  authStudent,
  deleteLog
);

export default logRouter;
