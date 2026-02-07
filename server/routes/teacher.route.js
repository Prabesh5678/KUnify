import express from 'express';
import { googleSignIn, isAuth, profileCompletion, teamApprove, teamRequest, teacherLogin, getTeamLogsheets } from '../controllers/teacher.control.js';
import authTeacher from '../middlewares/teacher.middleware.js';

const teacherRouter= express.Router();

    teacherRouter.post('/google-signin',googleSignIn);
    teacherRouter.post('/team-request',authTeacher,teamApprove);
    teacherRouter.get("/is-auth", authTeacher, isAuth);
    teacherRouter.get("/teams", authTeacher, teamRequest );
    teacherRouter.put("/setup-profile", authTeacher, profileCompletion);
    teacherRouter.post("/login", teacherLogin);
    teacherRouter.get("/teams/:teamId/logsheets", authTeacher, getTeamLogsheets);
    
    export default teacherRouter;