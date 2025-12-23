import express from 'express';
import { isAuth,googleSignIn,logout, profileCompletion, profileUpdate } from '../controllers/student.control.js';
import authStudent from '../middlewares/student.middleware.js';
import { createTeam/*, joinTeam, getTeam*/ } from '../controllers/team.control.js';

const studentRouter = express.Router();

studentRouter.post("/google-signin", googleSignIn);
studentRouter.get("/is-auth", authStudent, isAuth);
studentRouter.get("/logout", authStudent, logout);
studentRouter.put("/setup-profile", authStudent, profileCompletion);
studentRouter.put("/profile-update", authStudent, profileUpdate);

studentRouter.get("/profile", authStudent, (req, res) => {
  return res.json({
    success: true,
    student: req.student, // injected by authStudent middleware
  });
});
export default studentRouter;
