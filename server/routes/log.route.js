import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import {
  // createLog,
  // getTeamLogs,
  // getSingleLog,
  // updateLog,
  // deleteLog,
  // deleteLogFile,
  addLog,
} from "../controllers/log.control.js";
import { uploadMultiple } from "../utils/upload.utils.js";

const logRouter = express.Router();

// Create log 
logRouter.post(
  "/create",
  authStudent,
  addLog
);


export default logRouter;