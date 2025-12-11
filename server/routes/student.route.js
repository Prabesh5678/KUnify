import express from 'express';
import { isAuth,googleSignIn,logout, profileCompletion } from '../controllers/student.control.js';
import authStudent from '../middlewares/student.middleware.js';

const studentRouter = express.Router();

studentRouter.post("/google-signin", googleSignIn);
studentRouter.get("/is-auth", authStudent, isAuth);
studentRouter.get("/logout", authStudent, logout);
studentRouter.put("/setup-profile", authStudent, profileCompletion);

export default studentRouter;
