import express from 'express';
import { isAuth,googleSignIn,logout, profileCompletion } from '../controllers/student.control.js';
import authStudent from '../middlewares/student.middleware.js';
import { createTeam, joinTeam, getTeam } from '../controllers/team.control.js';

const studentRouter = express.Router();

studentRouter.post("/google-signin", googleSignIn);
studentRouter.get("/is-auth", authStudent, isAuth);
studentRouter.get("/logout", authStudent, logout);
studentRouter.put("/setup-profile", authStudent, profileCompletion);

studentRouter.post("/team/create", authStudent, createTeam);
studentRouter.post("/team/join", authStudent, joinTeam);
studentRouter.get("/team", authStudent, getTeam);

export default studentRouter;
