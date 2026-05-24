import express from 'express';
import { googleSignIn, isAuth, profileCompletion, teamApprove, teamRequest, teacherLogin, getTeamLogsheets, deleteTeam, checkLogEntry, requestLogCorrection} from '../controllers/teacher.control.js';
import authTeacher from '../middlewares/teacher.middleware.js';
import { exportTeamLogs } from "../controllers/log.control.js";

const teacherRouter= express.Router();

    teacherRouter.post('/google-signin',googleSignIn);
    teacherRouter.post('/team-request',authTeacher,teamApprove);
    teacherRouter.get("/is-auth", authTeacher, isAuth);
    teacherRouter.get("/teams", authTeacher, teamRequest );
    teacherRouter.put("/setup-profile", authTeacher, profileCompletion);
    teacherRouter.post("/login", teacherLogin);
    teacherRouter.get("/teams/:teamId/logsheets", authTeacher, getTeamLogsheets);
    teacherRouter.patch("/logs/:logId/check", authTeacher, checkLogEntry);
    teacherRouter.patch("/logs/:logId/request-correction", authTeacher, requestLogCorrection);
    teacherRouter.post("/delete-team/:teamId", authTeacher, deleteTeam);
    teacherRouter.get("/export/:teamId", exportTeamLogs);
    
    export default teacherRouter;
