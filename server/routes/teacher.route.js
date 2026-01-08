import express from 'express';
import { googleSignIn } from '../controllers/teacher.control.js';

const teacherRouter= express.Router();

    teacherRouter.post('/google-signin',googleSignIn);

    export default teacherRouter;