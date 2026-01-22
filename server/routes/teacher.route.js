import express from 'express';
import { googleSignIn, isAuth, profileCompletion, teamApprove, teamRequest } from '../controllers/teacher.control.js';
import authTeacher from '../middlewares/teacher.middleware.js';

const teacherRouter= express.Router();

    teacherRouter.post('/google-signin',googleSignIn);
    teacherRouter.post('/team-request',authTeacher,teamApprove);
    teacherRouter.get("/is-auth", authTeacher, isAuth);
    teacherRouter.get("/teams", authTeacher, teamRequest );
    teacherRouter.put("/setup-profile", authTeacher, profileCompletion);
    
    export default teacherRouter;