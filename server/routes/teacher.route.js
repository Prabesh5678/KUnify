import express from 'express';
import { googleSignIn, isAuth, logout, profileCompletion } from '../controllers/teacher.control.js';
import authTeacher from '../middlewares/teacher.middleware.js';

const teacherRouter= express.Router();

    teacherRouter.post('/google-signin',googleSignIn);
    teacherRouter.get("/is-auth", authTeacher, isAuth);
    teacherRouter.get("/logout", authTeacher, logout);
    teacherRouter.put("/setup-profile", authTeacher, profileCompletion);
    
    export default teacherRouter;