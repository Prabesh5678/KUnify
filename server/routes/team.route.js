import express from "express";
import authStudent from "../middlewares/student.middleware.js";
import { createTeam,joinTeam, leaveTeam } from "../controllers/team.control.js";
const teamRouter = express.Router();

teamRouter.post("/create", authStudent, createTeam);
teamRouter.post("/join", authStudent, joinTeam);
teamRouter.post("/leave", authStudent, leaveTeam);

export default teamRouter;