import express from "express";
import mongoose from "mongoose";

import authStudent from "../middlewares/student.middleware.js";
import { createTeam,deleteTeam,joinTeam, leaveTeam, memberApprove, requestSupervisor, teamInfo } from "../controllers/team.control.js";
const teamRouter = express.Router();

teamRouter.post("/create", authStudent, createTeam);
teamRouter.post("/join", authStudent, joinTeam);
teamRouter.post("/leave", authStudent, leaveTeam);
teamRouter.post("/approve/:teamId", authStudent, memberApprove);
teamRouter.post("/delete", authStudent, deleteTeam);
teamRouter.post("/req-supervisor", requestSupervisor);
teamRouter.get("/:teamId", teamInfo);
export default teamRouter;